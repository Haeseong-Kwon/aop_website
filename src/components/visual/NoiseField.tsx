"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/*
 * 히어로 배경의 셰이더 노이즈 필드.
 *
 * PrismLight(기하 그래픽) 뒤에 깔리는 한 겹으로, 검은 배경이 죽어 있지 않고
 * 아주 느리게 숨 쉬는 것처럼 보이게 하는 것이 전부다. 정면에 나서면 안 된다.
 *
 * 색은 --beam / --beam-deep 두 개만 쓴다. 무지개·네온은 팔레트 규칙 위반이다.
 * three.js는 쓰지 않는다 — 전체화면 삼각형 하나에 프래그먼트 셰이더를 굽는 데
 * 씬 그래프가 필요하지 않고, 히어로는 LCP 구간이라 번들을 늘릴 자리가 아니다.
 */

const VERTEX_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/*
 * 3옥타브 value noise. 도메인 워핑을 한 번만 걸어 결이 흐르는 느낌을 만들고,
 * smoothstep으로 밝은 쪽만 남겨 검정 위에 얇은 안개처럼 얹는다.
 */
const FRAGMENT_SRC = `
precision mediump float;

uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_beam;
uniform vec3 u_deep;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    sum += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  // 짧은 변 기준으로 정규화해야 종횡비가 바뀌어도 결의 굵기가 유지된다
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

  float t = u_time * 0.045;
  vec2 warp = vec2(fbm(uv * 1.6 + t), fbm(uv * 1.6 - t + 5.2));
  float field = fbm(uv * 2.4 + warp * 1.1);

  // 밝은 쪽 결만 남긴다 — 전면을 덮으면 헤드라인 대비를 갉아먹는다
  float veil = smoothstep(0.46, 0.86, field);

  // 화면 밖으로 갈수록 떨어뜨려 사각 캔버스 경계가 드러나지 않게 한다
  float falloff = 1.0 - smoothstep(0.15, 0.95, length(uv));

  vec3 color = mix(u_deep, u_beam, veil);
  gl_FragColor = vec4(color, veil * falloff * 0.5);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/** #rrggbb → [0..1, 0..1, 0..1]. 실패하면 호출부가 폴백 색을 쓴다. */
function parseHex(value: string): [number, number, number] | null {
    const hex = value.trim().replace("#", "");
    if (hex.length !== 6) return null;

    const int = Number.parseInt(hex, 16);
    if (Number.isNaN(int)) return null;

    return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

function readToken(
    styles: CSSStyleDeclaration,
    name: string,
    fallback: [number, number, number]
): [number, number, number] {
    return parseHex(styles.getPropertyValue(name)) ?? fallback;
}

export function NoiseField({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prefersReduced = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || prefersReduced) return;

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: "high-performance",
            // 매 프레임 다시 그리므로 백버퍼를 보존할 이유가 없다
            preserveDrawingBuffer: false,
        });
        // WebGL이 없으면 캔버스는 투명하게 남고 PrismLight만 보인다
        if (!gl) return;

        const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
        const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
        const program = gl.createProgram();
        if (!vertex || !fragment || !program) return;

        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

        gl.useProgram(program);

        // 화면을 덮는 삼각형 하나. 쿼드보다 러스터라이저 호출이 적다.
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW
        );

        const position = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const uRes = gl.getUniformLocation(program, "u_res");
        const uTime = gl.getUniformLocation(program, "u_time");

        const styles = getComputedStyle(document.documentElement);
        gl.uniform3fv(
            gl.getUniformLocation(program, "u_beam"),
            readToken(styles, "--color-beam", [0.29, 0.55, 1])
        );
        gl.uniform3fv(
            gl.getUniformLocation(program, "u_deep"),
            readToken(styles, "--color-beam-deep", [0.04, 0.16, 0.4])
        );

        // 노이즈는 저주파라 픽셀을 다 살릴 이유가 없다. 1.25배까지만 올린다.
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
        };
        resize();

        let frame = 0;
        let running = false;
        let visible = false;

        /*
         * 적응형 정지 — 60프레임마다 실제 fps를 재고, 두 번 연속 55fps 아래면
         * 루프를 영구히 끊는다. 배경 장식 하나 때문에 페이지 전체가 끊기는 것이
         * 노이즈가 없는 것보다 훨씬 나쁘다.
         */
        let sampleStart = 0;
        let sampleFrames = 0;
        let slowStreak = 0;
        let disabled = false;

        const stop = () => {
            cancelAnimationFrame(frame);
            running = false;
        };

        const start = () => {
            if (running || disabled || !visible) return;
            running = true;
            sampleStart = 0;
            sampleFrames = 0;
            frame = requestAnimationFrame(render);
        };

        const render = (now: number) => {
            gl.uniform1f(uTime, now / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            if (sampleStart === 0) sampleStart = now;
            sampleFrames += 1;

            if (sampleFrames >= 60) {
                const fps = (sampleFrames * 1000) / (now - sampleStart);
                slowStreak = fps < 55 ? slowStreak + 1 : 0;
                sampleStart = now;
                sampleFrames = 0;

                if (slowStreak >= 2) {
                    disabled = true;
                    stop();
                    return;
                }
            }

            frame = requestAnimationFrame(render);
        };

        // 히어로 밖으로 나가면 그릴 이유가 없다
        const observer = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                if (visible) start();
                else stop();
            },
            { threshold: 0 }
        );
        observer.observe(canvas);

        // 탭이 백그라운드일 때도 마찬가지
        const handleVisibility = () => {
            if (document.hidden) stop();
            else start();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("resize", resize);

        return () => {
            stop();
            observer.disconnect();
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("resize", resize);
            gl.deleteProgram(program);
            gl.deleteShader(vertex);
            gl.deleteShader(fragment);
            gl.deleteBuffer(buffer);
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [prefersReduced]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={cn("pointer-events-none h-full w-full", className)}
        />
    );
}
