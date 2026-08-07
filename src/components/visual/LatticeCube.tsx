"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/*
 * 점 격자 정육면체.
 *
 * 면을 유리판으로 채우지 않는다. 여섯 면에 점을 격자로 깔고, 앞뒤를 밝기와 크기로만
 * 구분한다 — 속이 비어 있어 뒷면 격자가 앞면 사이로 비치고, 두 면이 만나는 모서리는
 * 점이 겹쳐 저절로 가장 밝아진다. 선을 한 줄도 긋지 않고 형태가 서는 이유가 이것이다.
 *
 * WebGL을 쓰지 않는다: 히어로는 첫 화면이라 여기서 컨텍스트를 하나 더 따면
 * three 청크가 LCP 앞으로 끌려온다. 점 2400개 투영은 캔버스 2D로 충분하다.
 */

/** 한 변에 놓이는 점의 개수. 26을 넘기면 격자가 뭉개져 면이 판처럼 보인다. */
const N = 24;

/**
 * 카메라 거리(월드 단위).
 *
 * 가까이 두면 앞면이 크게 벌어져 정육면체가 아니라 깔때기로 보인다. 레퍼런스처럼
 * 살짝만 좁아지는 등각에 가까운 투영이라야 여섯 면이 같은 정사각형으로 읽힌다.
 */
const CAMERA = 6.5;

/** 밝기 계단 수. 점마다 색 문자열을 만들면 프레임마다 수천 개가 버려진다. */
const SHADES = 14;

/** 정육면체 여섯 면 위의 점을 만든다. 모서리 점은 면끼리 겹치도록 둔다 — 그게 광원이 된다. */
function buildLattice() {
    const points = new Float32Array(6 * N * N * 3);
    const step = 2 / (N - 1);
    let at = 0;

    for (let axis = 0; axis < 3; axis += 1) {
        for (const side of [-1, 1]) {
            for (let i = 0; i < N; i += 1) {
                for (let j = 0; j < N; j += 1) {
                    const u = -1 + i * step;
                    const v = -1 + j * step;

                    points[at++] = axis === 0 ? side : u;
                    points[at++] = axis === 1 ? side : axis === 0 ? u : v;
                    points[at++] = axis === 2 ? side : v;
                }
            }
        }
    }

    return points;
}

/** `#rrggbb` → [r,g,b]. 색은 CSS 토큰에서 읽어온다 — 캔버스는 var()를 못 쓴다. */
function readRgb(styles: CSSStyleDeclaration, token: string, fallback: [number, number, number]) {
    const hex = styles.getPropertyValue(token).trim();
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return fallback;

    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ] as [number, number, number];
}

interface LatticeCubeProps {
    /** 0~1 스크롤 진행도. 회전과 확대, 그리고 퇴장 페이드를 만든다. */
    progress: MotionValue<number>;
    className?: string;
}

export function LatticeCube({ progress, className }: LatticeCubeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prefersReduced = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        const lattice = buildLattice();
        const styles = getComputedStyle(canvas);
        /*
         * 뒷면 색으로 beam-deep(#0a2a66)을 쓰면 검정 위에서 사실상 사라진다.
         * 가산 합성에서는 어두운 값이 아무것도 더하지 못한다 — 뒤쪽도 파랑으로 남기고
         * 깊이는 알파와 크기로 만든다.
         */
        const far = readRgb(styles, "--color-beam", [74, 140, 255]);
        const near = readRgb(styles, "--color-glow", [188, 216, 255]);

        /*
         * 깊이별 색을 미리 굳혀 둔다. 점마다 rgba() 문자열을 만들면 초당 14만 개가
         * 생겼다 버려지고, 그 쓰레기 수거가 그대로 프레임 끊김으로 나온다.
         */
        const shades = Array.from({ length: SHADES }, (_, index) => {
            const t = index / (SHADES - 1);
            /*
             * 색은 알파보다 늦게 밝아진다(t^1.7). 선형으로 섞으면 절반 넘는 점이
             * 흰색에 가까워져 파랑이 통째로 빠지고 회색 먼지 덩어리가 된다.
             */
            const hue = Math.pow(t, 1.7);
            const channel = (i: number) =>
                Math.round(far[i] * 0.8 + (near[i] - far[i] * 0.8) * hue);
            return `rgba(${channel(0)},${channel(1)},${channel(2)},${(0.14 + t * 0.86).toFixed(3)})`;
        });

        let dpr = 1;
        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            canvas.width = Math.round(canvas.clientWidth * dpr);
            canvas.height = Math.round(canvas.clientHeight * dpr);
        };
        resize();

        const draw = (time: number) => {
            const value = Math.min(1, Math.max(0, progress.get()));
            const { width, height } = canvas;

            context.clearRect(0, 0, width, height);
            // 겹친 점이 더 밝아져야 모서리가 광원이 된다
            context.globalCompositeOperation = "lighter";
            // 스크롤이 끝나갈수록 물러나며 사라진다
            context.globalAlpha = 1 - Math.min(1, Math.max(0, (value - 0.35) / 0.4)) * 0.92;

            /*
             * 회전의 주인은 스크롤이다. 시간 항은 아주 느린 표류만 담당한다 —
             * 이게 없으면 스크롤을 멈춘 순간 물체가 그림으로 죽는다.
             */
            // 모서리가 정면으로 오는 3/4 시점에서 출발한다 — 여섯 면 중 셋이 함께 보인다
            const ry = 0.62 + value * 2.1 + time * 0.00006;
            const rx = 0.5 + value * -0.42 + Math.sin(time * 0.00013) * 0.07;

            const cosX = Math.cos(rx);
            const sinX = Math.sin(rx);
            const cosY = Math.cos(ry);
            const sinY = Math.sin(ry);

            const cx = width / 2;
            const cy = height / 2;
            /*
             * 스크롤과 함께 관객 쪽으로 다가온다. 배율을 더 키우면 앞면 격자가 화면을
             * 덮어 정육면체의 실루엣이 사라진다 — 커지는 것보다 형태가 우선이다.
             */
            const radius = Math.min(width, height) * 0.27 * (1 + value * 0.35);

            for (let i = 0; i < lattice.length; i += 3) {
                const x0 = lattice[i];
                const y0 = lattice[i + 1];
                const z0 = lattice[i + 2];

                const x1 = x0 * cosY + z0 * sinY;
                const z1 = z0 * cosY - x0 * sinY;
                const y1 = y0 * cosX - z1 * sinX;
                const z2 = y0 * sinX + z1 * cosX;

                const depth = CAMERA - z2;
                if (depth < 0.35) continue;

                const k = CAMERA / depth;
                const sx = cx + x1 * radius * k;
                const sy = cy + y1 * radius * k;
                if (sx < -8 || sy < -8 || sx > width + 8 || sy > height + 8) continue;

                // 앞쪽 점일수록 밝고 굵다. 이 두 가지가 이 물체의 유일한 깊이 단서다.
                const t = Math.min(1, Math.max(0, (z2 + 1.35) / 2.7));
                context.fillStyle = shades[Math.min(SHADES - 1, (t * SHADES) | 0)];

                const size = dpr * (0.8 + t * t * 2.3);
                context.fillRect(sx - size / 2, sy - size / 2, size, size);
            }
        };

        if (prefersReduced) {
            draw(0);
            return;
        }

        let frame = 0;
        let running = false;

        const loop = (time: number) => {
            draw(time);
            frame = requestAnimationFrame(loop);
        };

        // 화면 밖에서는 루프를 끊는다 — 보이지도 않는 물체가 프레임을 먹을 이유가 없다
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting === running) return;

            running = entry.isIntersecting;
            if (running) frame = requestAnimationFrame(loop);
            else cancelAnimationFrame(frame);
        });
        observer.observe(canvas);

        const handleResize = () => {
            resize();
            if (!running) draw(0);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", handleResize);
        };
    }, [progress, prefersReduced]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={cn("pointer-events-none select-none", className)}
            /* 점마다 그림자를 그리면 프레임이 무너진다. 블룸은 합성 단계에서 한 번에 건다. */
            style={{ filter: "drop-shadow(0 0 14px rgba(74,140,255,0.6))" }}
        />
    );
}
