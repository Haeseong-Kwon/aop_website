"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { MotionValue } from "framer-motion";
import {
    ANCHORS,
    type ShapeId,
    type ShapeAnchor,
} from "@/components/frontier/shapes";
import { CvOverlay } from "@/components/frontier/CvOverlay";
import { cn } from "@/lib/utils";
import type { Projected } from "@/components/frontier/PerceptionScene";

/*
 * three.js 청크는 이 컴포넌트가 실제로 뷰포트에 들어온 뒤에만 받는다.
 * page.tsx는 서버 컴포넌트라 거기서 ssr:false를 쓸 수 없어, 지연 로드의
 * 경계를 이 클라이언트 파일 안에 둔다.
 */
const PerceptionScene = dynamic(
    () =>
        import("@/components/frontier/PerceptionScene").then(
            (mod) => mod.PerceptionScene
        ),
    { ssr: false }
);

const DESKTOP_PARTICLES = 8000;
/** 모바일은 40%로 줄인다 — 화면이 작아 밀도 차이가 눈에 띄지 않는다. */
const MOBILE_PARTICLES = Math.round(DESKTOP_PARTICLES * 0.4);

/** WebGL 컨텍스트를 실제로 딸 수 있는지. 지원 목록이 아니라 시도로 판정한다. */
function detectWebgl(): boolean {
    try {
        const canvas = document.createElement("canvas");
        return Boolean(
            canvas.getContext("webgl2") ?? canvas.getContext("webgl")
        );
    } catch {
        return false;
    }
}

interface FrontierVisualizerProps {
    shape: ShapeId;
    /** 모션 축소 환경이면 3D를 아예 마운트하지 않는다. */
    disabled: boolean;
    /**
     * 회전 목표 각도. 부모가 소유해서 웹캠 데모 같은 외부 입력도 같은 값을 쓴다.
     * ref로 두는 이유: 매 프레임 바뀌는 값을 state로 두면 리렌더가 프레임을 잡아먹는다.
     */
    orbit: React.RefObject<{ x: number; y: number }>;
    /**
     * 카메라 거리와 스캔 위치를 부모가 직접 몰 때 쓴다.
     *
     * 무대가 sticky로 고정되면 이 요소의 뷰포트 좌표가 멈춰서, 자체 스크롤 계산은
     * 상수가 된다 — 핀 구간 내내 카메라도 스캔도 얼어붙는다. 핀을 쓰는 호출부는
     * 무대 진행도를 직접 넘긴다.
     */
    camera?: MotionValue<number>;
    scan?: MotionValue<number>;
    /** 무대 높이는 호출부가 정한다 — 핀 구간에서는 뷰포트 높이에 맞춰야 한다. */
    className?: string;
}

/**
 * 3D 인식 오브젝트 + CV 오버레이.
 *
 * 레이아웃(높이)은 3D 로드 여부와 무관하게 항상 같다 — 폴백이 떠도 페이지가
 * 밀리지 않아야 하고, 그래야 지연 로드가 LCP에 영향을 주지 않는다.
 */
export function FrontierVisualizer({
    shape,
    disabled,
    orbit: orbitRef,
    camera,
    scan: scanValue,
    className,
}: FrontierVisualizerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [supported, setSupported] = useState<boolean | null>(null);
    const [projected, setProjected] = useState<Projected[]>([]);
    // 초기값은 구독이 아니라 첫 렌더에서 읽는다 — 이펙트에서 setState하면 렌더가 한 번 더 돈다
    const [scan, setScan] = useState(() => scanValue?.get() ?? 0);
    const [height, setHeight] = useState(1);

    // 매 프레임 바뀌는 값은 state로 두지 않는다 — 리렌더가 프레임을 잡아먹는다
    const scrollRef = useRef(0);
    const dragRef = useRef<{ x: number; y: number } | null>(null);

    const anchors: readonly ShapeAnchor[] = ANCHORS[shape];
    const anchorPositions = anchors.map((anchor) => anchor.position);

    const [count, setCount] = useState(DESKTOP_PARTICLES);
    /*
     * 설명 패널은 lg 이상에서만 무대 왼쪽 46%를 덮는다. 그 아래 폭에서는 패널이
     * 하단에 가로로 눕기 때문에 오브젝트를 옆으로 밀 이유가 없다.
     */
    const [offsetX, setOffsetX] = useState(0);

    /*
     * 뷰포트에 들어올 때만 마운트하고, 벗어나면 언마운트해 렌더 루프를 끊는다.
     * WebGL 지원 판정과 파티클 수 결정도 이 시점에 한다 — 페이지 상단에 있는
     * 동안에는 확인용 컨텍스트조차 만들지 않는다.
     */
    useEffect(() => {
        const element = containerRef.current;
        if (!element || disabled) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    setMounted(false);
                    return;
                }

                setSupported((prev) => prev ?? detectWebgl());
                setCount(
                    window.matchMedia("(max-width: 767px)").matches
                        ? MOBILE_PARTICLES
                        : DESKTOP_PARTICLES
                );
                setOffsetX(
                    window.matchMedia("(min-width: 1024px)").matches ? 1.5 : 0
                );
                setMounted(true);
            },
            { rootMargin: "200px 0px" }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [disabled]);

    // 오버레이 좌표계는 캔버스 높이를 알아야 한다 — 스크롤 방식과 무관하게 항상 잰다
    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const measure = () => setHeight(element.getBoundingClientRect().height);
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // 무대 진행도를 외부에서 받는 경우 — 자체 스크롤 계산은 돌리지 않는다
    useEffect(() => {
        if (!camera) return;

        scrollRef.current = camera.get();
        return camera.on("change", (value) => {
            scrollRef.current = value;
        });
    }, [camera]);

    useEffect(() => {
        if (!scanValue) return;
        return scanValue.on("change", setScan);
    }, [scanValue]);

    // 외부 진행도가 없으면 이 요소의 뷰포트 위치에서 직접 계산한다
    useEffect(() => {
        const element = containerRef.current;
        if (!element || camera || scanValue) return;

        const update = () => {
            const rect = element.getBoundingClientRect();
            const total = window.innerHeight + rect.height;
            const progress = (window.innerHeight - rect.top) / total;
            scrollRef.current = Math.min(1, Math.max(0, progress));

            // 스캔라인은 진행도보다 빠르게 훑고 지나간다
            setScan(Math.min(1, Math.max(0, (progress - 0.15) * 2.6)));
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [camera, scanValue]);

    // 드래그 orbit. 포인터 캡처로 캔버스 밖으로 나가도 끊기지 않게 한다.
    const handlePointerDown = (event: React.PointerEvent) => {
        dragRef.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent) => {
        const start = dragRef.current;
        if (!start) return;

        orbitRef.current = {
            x: orbitRef.current.x + (event.clientX - start.x) * 0.006,
            // 위아래는 제한한다 — 뒤집히면 형태가 읽히지 않는다
            y: Math.max(
                -0.6,
                Math.min(0.6, orbitRef.current.y + (event.clientY - start.y) * 0.004)
            ),
        };
        dragRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: React.PointerEvent) => {
        dragRef.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
    };

    const handleProject = useCallback(
        (next: Projected[]) => setProjected(next),
        []
    );

    const showScene = mounted && supported && !disabled;

    return (
        <div
            ref={containerRef}
            onPointerDown={showScene ? handlePointerDown : undefined}
            onPointerMove={showScene ? handlePointerMove : undefined}
            onPointerUp={showScene ? handlePointerUp : undefined}
            onPointerCancel={showScene ? handlePointerUp : undefined}
            /*
             * 무대가 가로로 넓어졌다. 정사각형을 유지하면 데스크톱에서 한 화면을
             * 통째로 잡아먹어 아래 캡션까지 스크롤이 한참 필요해진다.
             */
            className={cn(
                "relative h-[clamp(26rem,62vh,40rem)] w-full touch-pan-y select-none overflow-hidden rounded-2xl border border-border bg-[radial-gradient(70%_80%_at_62%_45%,rgba(74,140,255,0.1),transparent_70%)]",
                className
            )}
        >
            {showScene ? (
                <>
                    <PerceptionScene
                        shape={shape}
                        count={count}
                        scroll={scrollRef}
                        orbit={orbitRef}
                        anchors={anchorPositions}
                        offsetX={offsetX}
                        onProject={handleProject}
                    />
                    <CvOverlay
                        anchors={anchors}
                        projected={projected}
                        scan={scan}
                        height={height}
                    />
                </>
            ) : (
                /*
                 * 폴백. 레이아웃은 동일하게 유지하고 정적 그래픽만 남긴다 —
                 * WebGL 미지원, 모션 축소, 아직 뷰포트 밖인 경우가 모두 여기로 온다.
                 */
                <FallbackPoster anchors={anchors} />
            )}

            <p className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                {showScene ? "drag to orbit" : "perception layer"}
            </p>
        </div>
    );
}

/** 3D 없이도 무엇을 보여주려 했는지 전달되는 정적 도식. */
function FallbackPoster({ anchors }: { anchors: readonly ShapeAnchor[] }) {
    return (
        <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
        >
            {anchors.map((anchor, index) => {
                // 3D 좌표를 대략적인 평면 위치로 눌러 배치한다
                const x = 50 + anchor.position[0] * 14;
                const y = 50 - anchor.position[1] * 14;

                return (
                    <g key={anchor.label + index} opacity={0.55}>
                        <rect
                            x={x - 9}
                            y={y - 6}
                            width={18}
                            height={12}
                            fill="none"
                            stroke="var(--color-glow)"
                            strokeWidth={0.4}
                        />
                        <circle cx={x} cy={y} r={0.7} fill="var(--color-glow)" />
                    </g>
                );
            })}
        </svg>
    );
}
