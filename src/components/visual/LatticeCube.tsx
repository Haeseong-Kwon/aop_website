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
 * three 청크가 LCP 앞으로 끌려온다. 점 4천 개 투영은 캔버스 2D로 충분하다.
 *
 * 화질을 결정하는 건 점의 개수가 아니라 점 하나의 생김새다. 사각 픽셀을 찍으면
 * 아무리 많이 찍어도 먼지 더미로 보인다. 여기서는 깊이 단계마다 미리 구워둔
 * 원형 스프라이트를 찍고(보케), 마지막에 화면 전체를 한 번 블룸으로 덮는다.
 */

/** 한 변에 놓이는 점의 개수. 26을 넘기면 격자가 뭉개져 면이 판처럼 보인다. */
const N = 26;

/**
 * 카메라 거리(월드 단위).
 *
 * 가까이 두면 앞면이 크게 벌어져 정육면체가 아니라 깔때기로 보인다. 레퍼런스처럼
 * 살짝만 좁아지는 등각에 가까운 투영이라야 여섯 면이 같은 정사각형으로 읽힌다.
 */
const CAMERA = 6.5;

/** 깊이 단계 수. 이 개수만큼 스프라이트를 미리 굽는다. */
const LEVELS = 18;

/** 블룸 버퍼 축소 배율. 줄였다 늘리는 것으로 블러를 대신한다. */
const BLOOM_DOWN = 4;

/**
 * 정육면체 여섯 면 위의 점을 만든다. 모서리 점은 면끼리 겹치도록 둔다 — 그게 광원이 된다.
 * 좌표 뒤에 파동 위상을 하나 더 붙여 4개씩 끊어 담는다: 프레임마다 sin을 한 번만 부르려면
 * 위상은 미리 굳어 있어야 한다.
 */
function buildLattice() {
    const points = new Float32Array(6 * N * N * 4);
    const step = 2 / (N - 1);
    let at = 0;

    for (let axis = 0; axis < 3; axis += 1) {
        for (const side of [-1, 1]) {
            for (let i = 0; i < N; i += 1) {
                for (let j = 0; j < N; j += 1) {
                    const u = -1 + i * step;
                    const v = -1 + j * step;

                    const x = axis === 0 ? side : u;
                    const y = axis === 1 ? side : axis === 0 ? u : v;
                    const z = axis === 2 ? side : v;

                    points[at++] = x;
                    points[at++] = y;
                    points[at++] = z;
                    // 세 축을 서로 다른 주기로 섞어야 파동이 면을 가로질러 흐른다
                    points[at++] = x * 2.6 + y * 1.9 + z * 2.2;
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

/**
 * 깊이 단계별 점 스프라이트를 미리 굽는다.
 *
 * 앞쪽 점일수록 크고 가장자리가 무른 원반이 된다 — 초점면을 안쪽에 두면 카메라가
 * 그렇게 찍는다. 가우시안으로 흐리지 않는 이유: 실제 보케는 중심이 평평하고
 * 테두리에서 한 번에 떨어지는 원반이라, 가장자리를 세워야 점이 살아 있다.
 */
function buildSprites(
    dpr: number,
    far: [number, number, number],
    near: [number, number, number]
) {
    return Array.from({ length: LEVELS }, (_, index) => {
        const t = index / (LEVELS - 1);

        const radius = (0.75 + Math.pow(t, 1.45) * 6.1) * dpr;
        const size = Math.ceil(radius * 2) + 2;

        const sprite = document.createElement("canvas");
        sprite.width = size;
        sprite.height = size;

        const context = sprite.getContext("2d");
        if (!context) return sprite;

        /*
         * 색은 알파보다 한참 늦게 밝아진다(t^2.4). 선형으로 섞으면 절반 넘는 점이
         * 흰색에 가까워져 파랑이 통째로 빠지고 회색 먼지 덩어리가 된다.
         */
        const hue = Math.pow(t, 2.4);
        const channel = (i: number) => Math.round(far[i] + (near[i] - far[i]) * hue);
        const rgb = `${channel(0)},${channel(1)},${channel(2)}`;

        const core = 0.08 + Math.pow(t, 1.15) * 0.92;
        // 멀수록 원반이 작고 단단하다. 가까울수록 평평한 부분이 넓어진다.
        const plateau = 0.3 + t * 0.28;

        const middle = size / 2;
        const gradient = context.createRadialGradient(
            middle,
            middle,
            0,
            middle,
            middle,
            radius
        );
        gradient.addColorStop(0, `rgba(${rgb},${core})`);
        gradient.addColorStop(plateau, `rgba(${rgb},${(core * 0.88).toFixed(3)})`);
        gradient.addColorStop(0.74, `rgba(${rgb},${(core * 0.34).toFixed(3)})`);
        gradient.addColorStop(1, `rgba(${rgb},0)`);

        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);

        return sprite;
    });
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

        // 줄였다 늘리는 것만으로 블러를 만든다. 점마다 그림자를 그리면 프레임이 무너진다.
        const bloom = document.createElement("canvas");
        const bloomContext = bloom.getContext("2d");

        let dpr = 1;
        let sprites: HTMLCanvasElement[] = [];

        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            canvas.width = Math.round(canvas.clientWidth * dpr);
            canvas.height = Math.round(canvas.clientHeight * dpr);

            bloom.width = Math.max(1, Math.round(canvas.width / BLOOM_DOWN));
            bloom.height = Math.max(1, Math.round(canvas.height / BLOOM_DOWN));

            // 스프라이트 크기는 dpr에 묶여 있으므로 화면이 바뀌면 다시 굽는다
            sprites = buildSprites(dpr, far, near);
        };
        resize();

        const draw = (time: number) => {
            const value = Math.min(1, Math.max(0, progress.get()));
            const { width, height } = canvas;
            // 좁은 화면에서는 부모가 display:none이라 캔버스가 0×0이다.
            // 그대로 두면 아래 블룸이 0폭 이미지를 그리려다 예외를 던진다.
            if (width === 0 || height === 0) return;

            context.globalCompositeOperation = "source-over";
            context.globalAlpha = 1;
            context.clearRect(0, 0, width, height);

            // 겹친 점이 더 밝아져야 모서리가 광원이 된다
            context.globalCompositeOperation = "lighter";
            // 스크롤이 끝나갈수록 물러나며 사라진다
            const fade = 1 - Math.min(1, Math.max(0, (value - 0.35) / 0.4)) * 0.92;
            context.globalAlpha = fade;

            /*
             * 회전의 주인은 스크롤이다. 시간 항은 아주 느린 표류만 담당한다 —
             * 이게 없으면 스크롤을 멈춘 순간 물체가 그림으로 죽는다.
             */
            /*
             * 모서리가 정면으로 오는 3/4 시점에서 출발한다 — 여섯 면 중 셋이 함께 보인다.
             *
             * 요(yaw)를 크게 돌리지 않는다. 90°에 가까워지면 한 면이 화면과 나란해져
             * 정육면체가 휘어진 판때기로 납작해진다. 퇴장까지 도는 각을 0.7rad으로 묶어
             * 35°~75° 안에만 머물게 했다 — 많이 도는 것보다 형태가 우선이다.
             */
            const ry = 0.62 + value * 0.7 + time * 0.00006;
            const rx = 0.5 + value * -0.24 + Math.sin(time * 0.00013) * 0.07;

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
            // 격자 전체를 훑고 지나가는 숨. 면이 통째로 흔들리지 않도록 진폭은 점 간격 이하로 둔다.
            const wave = time * 0.0009;

            for (let i = 0; i < lattice.length; i += 4) {
                const breath = 1 + Math.sin(lattice[i + 3] + wave) * 0.02;
                const x0 = lattice[i] * breath;
                const y0 = lattice[i + 1] * breath;
                const z0 = lattice[i + 2] * breath;

                const x1 = x0 * cosY + z0 * sinY;
                const z1 = z0 * cosY - x0 * sinY;
                const y1 = y0 * cosX - z1 * sinX;
                const z2 = y0 * sinX + z1 * cosX;

                const depth = CAMERA - z2;
                if (depth < 0.35) continue;

                const k = CAMERA / depth;
                const sx = cx + x1 * radius * k;
                const sy = cy + y1 * radius * k;
                if (sx < -24 || sy < -24 || sx > width + 24 || sy > height + 24) continue;

                // 앞쪽 점일수록 밝고 굵고 무르다. 이 셋이 이 물체의 유일한 깊이 단서다.
                const t = Math.min(1, Math.max(0, (z2 + 1.35) / 2.7));
                const sprite = sprites[Math.min(LEVELS - 1, (t * LEVELS) | 0)];
                const half = sprite.width / 2;

                context.drawImage(sprite, sx - half, sy - half);
            }

            /*
             * 블룸. 그린 결과를 1/4로 줄였다가 그대로 늘려 덮는다 — 축소가 곧 평균이고,
             * 확대 보간이 곧 블러다. 검정 위 가산 합성이라 어두운 곳은 아무것도 더하지 않고
             * 모서리처럼 점이 겹쳐 밝아진 자리만 번진다.
             */
            if (!bloomContext || fade <= 0.02) return;

            bloomContext.globalCompositeOperation = "copy";
            bloomContext.drawImage(canvas, 0, 0, bloom.width, bloom.height);

            // 0.65까지 올리면 가장 가까운 면이 흰색으로 타서 파랑이 빠진다
            context.globalAlpha = fade * 0.5;
            context.drawImage(bloom, 0, 0, width, height);
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
            /*
             * 위쪽 모서리를 흐린다. 헤드라인이 이 위를 지나는데, 흰 글자 뒤에서
             * 점이 그대로 밝으면 글자가 읽히지 않는다 — 물체를 치우는 대신 물체가 비킨다.
             */
            style={{
                maskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.62) 10%, #000 22%)",
                WebkitMaskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.62) 10%, #000 22%)",
            }}
        />
    );
}
