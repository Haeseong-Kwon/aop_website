"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DUR, EASE } from "@/lib/motion";

/*
 * 4계층 카드의 미니 다이어그램.
 *
 * 각 카드가 말하는 내용을 아이콘이 아니라 구조로 보여준다 — Workflow 아이콘은
 * 어느 회사 카드에나 붙지만, 분기 트리와 체크포인트 타임라인은 이 회사 것이다.
 *
 * 그리기 애니메이션은 hover에서만 돈다. 카드 자체는 border/배경만 바뀌고
 * translate는 걸지 않는다 — 4장이 동시에 들썩이면 그리드가 흔들린다.
 */

const VW = 260;
const VH = 96;

/**
 * hover 시 stroke가 그려지는 선.
 *
 * 흐린 고스트 경로를 항상 깔고, 그 위에 밝은 경로가 그려진다.
 * pathLength만 0에서 시작시키면 hover 전에는 선이 아예 없어서, 마우스를 올리지 않는
 * 방문자(그리고 모든 터치 사용자)에게는 다이어그램이 깨진 것처럼 보인다.
 */
function DrawLine({
    d,
    delay = 0,
    dashed = false,
    strong = false,
}: {
    d: string;
    delay?: number;
    dashed?: boolean;
    strong?: boolean;
}) {
    const prefersReduced = useReducedMotion();
    const dash = dashed ? "3 3" : undefined;

    return (
        <>
            <path
                d={d}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={1}
                strokeLinecap="round"
                strokeDasharray={dash}
            />
            <motion.path
                d={d}
                fill="none"
                stroke={strong ? "var(--color-beam)" : "var(--color-border-strong)"}
                strokeWidth={1}
                strokeLinecap="round"
                strokeDasharray={dash}
                /*
                 * 점선은 pathLength를 건드리지 않는다 — framer는 pathLength를
                 * strokeDasharray로 구현해서, 둘을 같이 쓰면 점선 패턴이 덮어써진다.
                 * 점선 구간은 불투명도만 올린다.
                 */
                variants={
                    dashed
                        ? { rest: { opacity: 0 }, active: { opacity: 1 } }
                        : {
                              rest: {
                                  pathLength: prefersReduced ? 1 : 0,
                                  opacity: prefersReduced ? 1 : 0,
                              },
                              active: { pathLength: 1, opacity: 1 },
                          }
                }
                transition={
                    prefersReduced
                        ? { duration: 0.01 }
                        : { duration: 0.6, delay, ease: EASE.out }
                }
            />
        </>
    );
}

function Dot({
    cx,
    cy,
    r = 3,
    delay = 0,
    strong = false,
}: {
    cx: number;
    cy: number;
    r?: number;
    delay?: number;
    strong?: boolean;
}) {
    const prefersReduced = useReducedMotion();

    return (
        <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill={strong ? "var(--color-beam)" : "var(--color-bg)"}
            stroke={strong ? "var(--color-beam)" : "var(--color-border-strong)"}
            strokeWidth={1}
            variants={{
                rest: { opacity: 0.4 },
                active: { opacity: 1 },
            }}
            transition={
                prefersReduced ? { duration: 0.01 } : { duration: DUR.fast, delay }
            }
        />
    );
}

/** 01 — 하나의 계획이 서브에이전트로 갈라지고 다시 합류한다. */
function OrchestrationTree() {
    return (
        <>
            <DrawLine d="M14 48 H62" delay={0} strong />
            <DrawLine d="M62 48 C86 48 86 20 110 20" delay={0.08} />
            <DrawLine d="M62 48 H110" delay={0.08} />
            <DrawLine d="M62 48 C86 48 86 76 110 76" delay={0.08} />
            <DrawLine d="M150 20 C174 20 174 48 198 48" delay={0.22} />
            <DrawLine d="M150 48 H198" delay={0.22} />
            <DrawLine d="M150 76 C174 76 174 48 198 48" delay={0.22} />
            <DrawLine d="M198 48 H246" delay={0.3} strong />

            {[20, 48, 76].map((y, i) => (
                <motion.rect
                    key={y}
                    x={110}
                    y={y - 9}
                    width={40}
                    height={18}
                    rx={4}
                    fill="var(--color-surface)"
                    stroke="var(--color-border-strong)"
                    strokeWidth={1}
                    variants={{ rest: { opacity: 0.4 }, active: { opacity: 1 } }}
                    transition={{ duration: DUR.fast, delay: 0.14 + i * 0.05 }}
                />
            ))}
            <Dot cx={14} cy={48} delay={0} strong />
            <Dot cx={246} cy={48} delay={0.36} strong />
        </>
    );
}

/** 02 — 타임라인 위의 체크포인트. 가운데에서 끊기고 그 지점에서 재개한다. */
function CheckpointTimeline() {
    const marks = [24, 78, 132, 186, 240];

    return (
        <>
            {/* 중단 이전 구간 */}
            <DrawLine d="M24 58 H132" delay={0} strong />
            {/* 중단 지점 — 점선으로 끊긴 구간 */}
            <DrawLine d="M132 58 H186" delay={0.18} dashed />
            {/* 재개 이후 */}
            <DrawLine d="M186 58 H240" delay={0.32} strong />

            {marks.map((x, i) => (
                <g key={x}>
                    <DrawLine d={`M${x} 44 V58`} delay={0.1 + i * 0.05} />
                    <Dot cx={x} cy={58} delay={0.12 + i * 0.05} strong={x <= 132} />
                </g>
            ))}

            {/* 중단 표시 — 두 줄의 세로 바 */}
            <motion.g
                variants={{ rest: { opacity: 0 }, active: { opacity: 1 } }}
                transition={{ duration: DUR.fast, delay: 0.4 }}
            >
                <rect x={155} y={24} width={2} height={14} fill="var(--color-destructive)" />
                <rect x={161} y={24} width={2} height={14} fill="var(--color-destructive)" />
            </motion.g>
        </>
    );
}

/** 03 — 토큰 예산 배분. 캐시된 구간이 밝고, 나머지가 실제 비용이다. */
function TokenBudgetBars() {
    const rows = [
        { y: 22, cached: 96, live: 54 },
        { y: 48, cached: 62, live: 88 },
        { y: 74, cached: 138, live: 32 },
    ];

    return (
        <>
            {rows.map((row, i) => (
                <g key={row.y}>
                    <rect
                        x={14}
                        y={row.y - 6}
                        width={232}
                        height={12}
                        rx={2}
                        fill="var(--color-surface)"
                    />
                    <motion.rect
                        x={14}
                        y={row.y - 6}
                        height={12}
                        rx={2}
                        fill="var(--color-beam)"
                        style={{ transformOrigin: "14px center" }}
                        variants={{
                            rest: { width: row.cached, opacity: 0.35 },
                            active: { width: row.cached, opacity: 0.9 },
                        }}
                        transition={{ duration: DUR.base, delay: i * 0.06, ease: EASE.out }}
                    />
                    <motion.rect
                        y={row.y - 6}
                        height={12}
                        rx={2}
                        fill="var(--color-border-strong)"
                        variants={{
                            rest: { x: 14 + row.cached + 3, width: row.live, opacity: 0.3 },
                            active: { x: 14 + row.cached + 3, width: row.live, opacity: 0.8 },
                        }}
                        transition={{
                            duration: DUR.base,
                            delay: 0.1 + i * 0.06,
                            ease: EASE.out,
                        }}
                    />
                </g>
            ))}
        </>
    );
}

/** 04 — 트레이스 스팬 워터폴. 자식 스팬이 부모 구간 안에 들여쓰기된다. */
function TraceWaterfall() {
    const spans = [
        { y: 18, x: 14, w: 232, depth: 0 },
        { y: 38, x: 34, w: 128, depth: 1 },
        { y: 58, x: 52, w: 64, depth: 2 },
        { y: 78, x: 170, w: 68, depth: 1 },
    ];

    return (
        <>
            {spans.map((span, i) => (
                <g key={span.y}>
                    {span.depth > 0 ? (
                        <DrawLine
                            d={`M${span.x - 10} ${span.y - 20} V${span.y} H${span.x}`}
                            delay={i * 0.07}
                        />
                    ) : null}
                    <motion.rect
                        x={span.x}
                        y={span.y - 5}
                        height={10}
                        rx={2}
                        fill={span.depth === 0 ? "var(--color-beam)" : "var(--color-border-strong)"}
                        variants={{
                            rest: { width: span.w, opacity: 0.35 },
                            active: { width: span.w, opacity: span.depth === 0 ? 0.9 : 0.75 },
                        }}
                        transition={{
                            duration: DUR.base,
                            delay: i * 0.07,
                            ease: EASE.out,
                        }}
                    />
                </g>
            ))}
        </>
    );
}

const DIAGRAMS = {
    orchestration: OrchestrationTree,
    "durable-execution": CheckpointTimeline,
    "context-engineering": TokenBudgetBars,
    evaluation: TraceWaterfall,
} as const;

export type CapabilityDiagramId = keyof typeof DIAGRAMS;

/**
 * 부모 카드가 `initial="rest" whileHover="active" whileInView="active"`를 걸어
 * 상태를 내려준다. 터치 기기에는 hover가 없으므로 뷰포트 진입만으로도 켜진다.
 */
export function CapabilityDiagram({ id }: { id: CapabilityDiagramId }) {
    const Diagram = DIAGRAMS[id];

    return (
        <svg
            aria-hidden
            viewBox={`0 0 ${VW} ${VH}`}
            className="h-auto w-full max-w-[280px]"
        >
            <Diagram />
        </svg>
    );
}
