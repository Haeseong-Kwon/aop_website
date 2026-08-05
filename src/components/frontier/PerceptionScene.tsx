"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildShape, type ShapeId } from "@/components/frontier/shapes";

/*
 * 파티클 인식 오브젝트.
 *
 * 모프는 CPU에서 좌표를 다시 쓰지 않고 GPU에서 섞는다 — 8천 점을 매 프레임
 * JS로 보간하면 메인 스레드가 그것만 하다 끝난다. 이전/다음 형태를 각각 attribute로
 * 올려두고 uniform 하나(u_mix)만 애니메이션한다.
 */

const VERTEX_SRC = `
attribute vec3 a_next;
attribute float a_seed;

uniform float u_mix;
uniform float u_time;
uniform float u_size;
uniform float u_dpr;

varying float v_depth;

void main() {
  // smoothstep으로 섞어야 모프의 시작과 끝이 뭉개지지 않는다
  float m = smoothstep(0.0, 1.0, u_mix);
  vec3 pos = mix(position, a_next, m);

  // 점마다 위상이 다른 미세한 부유. 전부 같은 위상이면 덩어리가 통째로 흔들린다.
  float phase = a_seed * 6.2831;
  pos += vec3(
    sin(u_time * 0.6 + phase) * 0.012,
    cos(u_time * 0.5 + phase * 1.3) * 0.012,
    sin(u_time * 0.45 + phase * 0.7) * 0.012
  );

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  v_depth = -mv.z;

  gl_Position = projectionMatrix * mv;
  // 원근에 따라 크기가 줄어야 깊이가 읽힌다
  gl_PointSize = u_size * u_dpr * (3.0 / max(v_depth, 0.1));
}
`;

const FRAGMENT_SRC = `
precision mediump float;

uniform vec3 u_core;
uniform vec3 u_far;

varying float v_depth;

void main() {
  // 사각 점은 픽셀 아트처럼 보인다. 원형으로 잘라낸다.
  vec2 uv = gl_PointCoord - 0.5;
  float d = dot(uv, uv);
  if (d > 0.25) discard;

  float edge = 1.0 - smoothstep(0.12, 0.25, d);
  // 멀수록 어두워져 앞뒤가 구분된다
  float depthFade = 1.0 - smoothstep(3.0, 9.0, v_depth);

  vec3 color = mix(u_far, u_core, depthFade);
  gl_FragColor = vec4(color, edge * (0.35 + depthFade * 0.6));
}
`;

interface ParticlesProps {
    shape: ShapeId;
    count: number;
    /** 섹션 스크롤 진행도 0~1 — 카메라 반경/높이를 보간한다. */
    scroll: React.RefObject<number>;
    /** 드래그 orbit 목표 각도 */
    orbit: React.RefObject<{ x: number; y: number }>;
    /**
     * 오브젝트를 옆으로 밀어내는 거리(월드 단위).
     * 설명 패널이 무대 왼쪽을 덮으므로 그만큼 오른쪽으로 비켜서야 가려지지 않는다.
     */
    offsetX: number;
    onQualityDrop: () => void;
}

function Particles({
    shape,
    count,
    scroll,
    orbit,
    offsetX,
    onQualityDrop,
}: ParticlesProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { camera } = useThree();

    // 형태는 (id, count)에 대해 결정적이라 캐시가 안전하다
    const shapes = useMemo(
        () => ({
            grounding: buildShape("grounding", count),
            parsing: buildShape("parsing", count),
            verification: buildShape("verification", count),
            trace: buildShape("trace", count),
        }),
        [count]
    );

    const seeds = useMemo(() => {
        const out = new Float32Array(count);
        for (let i = 0; i < count; i += 1) out[i] = (i * 0.6180339887) % 1;
        return out;
    }, [count]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
            "position",
            new THREE.BufferAttribute(shapes[shape].slice(), 3)
        );
        geo.setAttribute("a_next", new THREE.BufferAttribute(shapes[shape].slice(), 3));
        geo.setAttribute("a_seed", new THREE.BufferAttribute(seeds, 1));
        return geo;
        // 초기 지오메트리만 만든다. 이후 형태 변경은 아래 이펙트가 attribute를 갈아끼운다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    const uniforms = useMemo(
        () => ({
            u_mix: { value: 1 },
            u_time: { value: 0 },
            u_size: { value: 2.4 },
            u_dpr: { value: 1 },
            u_core: { value: new THREE.Color("#dbe8ff") },
            u_far: { value: new THREE.Color("#2f6ad0") },
        }),
        []
    );

    // 탭이 바뀌면 현재 위치를 position으로 굳히고 새 목표를 a_next에 올린다
    useEffect(() => {
        const position = geometry.getAttribute("position") as THREE.BufferAttribute;
        const next = geometry.getAttribute("a_next") as THREE.BufferAttribute;
        const mix = uniforms.u_mix.value;

        // 모프 중간에 탭이 또 바뀔 수 있으므로, 현재 보간 상태를 새 출발점으로 굳힌다
        const from = position.array as Float32Array;
        const to = next.array as Float32Array;
        const eased = mix * mix * (3 - 2 * mix);
        for (let i = 0; i < from.length; i += 1) {
            from[i] = from[i] + (to[i] - from[i]) * eased;
        }

        to.set(shapes[shape]);
        position.needsUpdate = true;
        next.needsUpdate = true;
        uniforms.u_mix.value = 0;
    }, [shape, shapes, geometry, uniforms]);

    // 관성이 남는 orbit — 목표 각도로 damping 0.08씩 따라간다
    const current = useRef({ x: 0, y: 0 });
    /** 자동 회전 누적각. 드래그 오프셋과 더해야 둘이 서로를 덮어쓰지 않는다. */
    const autoYaw = useRef(0);
    const fps = useRef({ start: 0, frames: 0, slow: 0, dropped: false });

    useFrame((state, delta) => {
        const material = materialRef.current;
        const points = pointsRef.current;
        if (!material || !points) return;

        material.uniforms.u_time.value = state.clock.elapsedTime;
        material.uniforms.u_dpr.value = state.gl.getPixelRatio();

        // 모프 진행 — DUR.slow(0.8s)에 맞춘 속도
        if (material.uniforms.u_mix.value < 1) {
            material.uniforms.u_mix.value = Math.min(
                1,
                material.uniforms.u_mix.value + delta / 0.8
            );
        }

        const target = orbit.current ?? { x: 0, y: 0 };
        current.current.x += (target.x - current.current.x) * 0.08;
        current.current.y += (target.y - current.current.y) * 0.08;

        // 설명 패널을 피해 옆으로 비켜선다. 회전축은 오브젝트 자신이 유지한다.
        points.position.x = offsetX;

        // 자동 회전 0.12 rad/s에 드래그 오프셋을 더한다
        autoYaw.current += delta * 0.12;
        points.rotation.y = autoYaw.current + current.current.x;
        // 위아래는 자동 회전 없이 드래그만. 계속 뒤집히면 형태를 읽을 수 없다.
        points.rotation.x = current.current.y;

        // 스크롤에 따라 카메라가 물러나며 위로 올라간다
        const progress = scroll.current ?? 0;
        const radius = 6.2 + progress * 2.2;
        const height = -0.6 + progress * 2.4;
        camera.position.set(0, height, radius);
        camera.lookAt(0, 0, 0);

        // 적응형 품질 — 60프레임 표본에서 두 번 연속 느리면 호출부가 점 수를 낮춘다
        const now = state.clock.elapsedTime;
        const meter = fps.current;
        if (meter.start === 0) meter.start = now;
        meter.frames += 1;

        if (meter.frames >= 60) {
            const rate = meter.frames / (now - meter.start);
            meter.slow = rate < 45 ? meter.slow + 1 : 0;
            meter.start = now;
            meter.frames = 0;

            if (meter.slow >= 2 && !meter.dropped) {
                meter.dropped = true;
                onQualityDrop();
            }
        }
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={VERTEX_SRC}
                fragmentShader={FRAGMENT_SRC}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/** 매 프레임 앵커의 화면 좌표를 계산해 오버레이에 넘긴다. */
function AnchorProjector({
    anchors,
    onProject,
}: {
    anchors: readonly [number, number, number][];
    onProject: (projected: { x: number; y: number; visible: boolean }[]) => void;
}) {
    const vector = useMemo(() => new THREE.Vector3(), []);
    const { camera, size, scene } = useThree();
    const frame = useRef(0);

    useFrame(() => {
        /*
         * 오버레이는 DOM이라 매 프레임 setState하면 React가 따라오지 못한다.
         * 3프레임에 한 번만 갱신한다 — 20fps로 따라붙어도 눈에는 붙어 보인다.
         */
        frame.current += 1;
        if (frame.current % 3 !== 0) return;

        // 파티클과 같은 회전을 받아야 박스가 형태에 실제로 붙는다
        const object = scene.children.find((child) => child.type === "Points");
        const matrix = object?.matrixWorld;

        onProject(
            anchors.map((anchor) => {
                vector.set(anchor[0], anchor[1], anchor[2]);
                if (matrix) vector.applyMatrix4(matrix);

                const depth = vector.distanceTo(camera.position);
                vector.project(camera);

                return {
                    x: ((vector.x + 1) / 2) * size.width,
                    y: ((1 - vector.y) / 2) * size.height,
                    // 화면 밖이거나 뒤로 돌아간 앵커는 숨긴다
                    visible:
                        vector.z < 1 &&
                        Math.abs(vector.x) < 1.05 &&
                        Math.abs(vector.y) < 1.05 &&
                        depth < 11,
                };
            })
        );
    });

    return null;
}

export interface Projected {
    x: number;
    y: number;
    visible: boolean;
}

interface PerceptionSceneProps {
    shape: ShapeId;
    count: number;
    scroll: React.RefObject<number>;
    orbit: React.RefObject<{ x: number; y: number }>;
    anchors: readonly [number, number, number][];
    offsetX: number;
    onProject: (projected: Projected[]) => void;
}

export function PerceptionScene({
    shape,
    count,
    scroll,
    orbit,
    anchors,
    offsetX,
    onProject,
}: PerceptionSceneProps) {
    /*
     * 기기가 못 따라오면 점 수를 60%씩 낮춘다.
     * count를 state로 복제하지 않고 배율만 들고 있는다 — 복제하면 prop이 바뀔 때마다
     * 이펙트로 다시 맞춰야 하고, 그 사이 한 프레임은 옛 값으로 그려진다.
     */
    const [quality, setQuality] = useState(1);
    const particleCount = Math.round(count * quality);

    return (
        <Canvas
            dpr={[1, 1.75]}
            gl={{
                antialias: false,
                alpha: true,
                powerPreference: "high-performance",
            }}
            camera={{ fov: 42, position: [0, -0.6, 6.2] }}
            style={{ pointerEvents: "none" }}
        >
            <Particles
                shape={shape}
                count={particleCount}
                scroll={scroll}
                orbit={orbit}
                offsetX={offsetX}
                onQualityDrop={() => setQuality((prev) => prev * 0.6)}
            />
            <AnchorProjector anchors={anchors} onProject={onProject} />
        </Canvas>
    );
}
