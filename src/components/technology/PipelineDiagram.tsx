"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DUR, EASE } from "@/lib/motion";
import { PIPELINE, PIPELINE_FALLBACKS } from "@/lib/constants";

/*
 * 7노드 실행 파이프라인.
 *
 * 정방향(Input → Output) 위를 데이터 패킷이 흐르고, 실패 시 되돌아가는 경로를
 * 점선으로 아래에 그린다. 되돌림 경로가 이 다이어그램의 핵심이다 —
 * 왼쪽에서 오른쪽으로만 흐르는 그림은 어느 회사 슬라이드에나 있다.
 */

const NODE_W = 142;
const NODE_H = 74;
const GAP = 28;
const COUNT = PIPELINE.length;

/** 되돌림 곡선이 지나갈 아래쪽 여백 */
const FALLBACK_BAND = 74;

export const VIEW_W = COUNT * NODE_W + (COUNT - 1) * GAP;
export const VIEW_H = 140 + FALLBACK_BAND;

const NODE_Y = (140 - NODE_H) / 2;
const MID_Y = 140 / 2;
const NODE_BOTTOM = NODE_Y + NODE_H;

export const nodeX = (index: number) => index * (NODE_W + GAP);
export const nodeCenter = (index: number) => nodeX(index) + NODE_W / 2;

const indexOf = (id: string) => PIPELINE.findIndex((node) => node.id === id);

/**
 * 되돌림 경로. 노드 아래로 내려갔다가 목적지 아래에서 다시 올라온다.
 * 레인을 나눠 세 경로가 서로 겹쳐 읽히지 않게 한다.
 */
function fallbackPath(fromIndex: number, toIndex: number, lane: number) {
    const x1 = nodeCenter(fromIndex);
    const x2 = nodeCenter(toIndex);
    const y = NODE_BOTTOM + 18 + lane * 20;

    return `M${x1} ${NODE_BOTTOM} V${y - 8} Q${x1} ${y} ${x1 - 10} ${y} H${x2 + 10} Q${x2} ${y} ${x2} ${y - 8} V${NODE_BOTTOM}`;
}

interface NodeProps {
    index: number;
    progress: MotionValue<number>;
    isActive: boolean;
    onSelect: (index: number) => void;
    onHover: (index: number | null) => void;
    /** 터치 기기에서는 hover 대신 탭으로만 선택한다. */
    interactive: boolean;
}

function DiagramNode({
    index,
    progress,
    isActive,
    onSelect,
    onHover,
    interactive,
}: NodeProps) {
    const node = PIPELINE[index];
    // 스크롤이 자기 자리를 지날 때 점등된다
    const opacity = useTransform(
        progress,
        [index / COUNT, (index + 0.75) / COUNT],
        [0.2, 1]
    );

    return (
        <motion.g style={{ opacity }}>
            {/* 활성 링 — 1회만 퍼진다. 무한 펄스는 쓰지 않는다 */}
            {isActive ? (
                <motion.rect
                    key={`ring-${index}`}
                    x={nodeX(index)}
                    y={NODE_Y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={13}
                    fill="none"
                    stroke="var(--color-beam)"
                    strokeWidth={1.5}
                    initial={{ opacity: 0.9, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.08 }}
                    transition={{ duration: DUR.slow, ease: EASE.out }}
                    style={{
                        transformOrigin: `${nodeCenter(index)}px ${MID_Y}px`,
                    }}
                />
            ) : null}

            <rect
                x={nodeX(index)}
                y={NODE_Y}
                width={NODE_W}
                height={NODE_H}
                rx={13}
                fill={isActive ? "var(--color-surface-2)" : "var(--color-surface)"}
                stroke={isActive ? "var(--color-bright)" : "var(--color-border-strong)"}
                strokeWidth={1}
                className="transition-[fill,stroke] duration-300"
            />
            <text
                x={nodeX(index) + 16}
                y={NODE_Y + 25}
                fill="var(--color-faint)"
                fontFamily="var(--font-mono)"
                fontSize={10}
                letterSpacing="0.16em"
            >
                {String(index + 1).padStart(2, "0")}
            </text>
            <text
                x={nodeX(index) + 16}
                y={NODE_Y + 51}
                fill="var(--color-bright)"
                fontFamily="var(--font-mono)"
                fontSize={13}
                letterSpacing="-0.01em"
            >
                {node.label}
            </text>

            {/*
             * 히트 영역은 투명 사각형으로 분리한다. <g>에 이벤트를 걸면
             * 텍스트 글리프 사이 빈 공간에서 포인터가 빠져나간다.
             */}
            <rect
                x={nodeX(index)}
                y={NODE_Y}
                width={NODE_W}
                height={NODE_H}
                rx={13}
                fill="transparent"
                tabIndex={0}
                role="tab"
                aria-selected={isActive}
                aria-label={`${node.label}. ${node.description}`}
                className="cursor-pointer outline-none focus-visible:stroke-bright"
                onClick={() => onSelect(index)}
                onFocus={() => onSelect(index)}
                onMouseEnter={interactive ? () => onHover(index) : undefined}
                onMouseLeave={interactive ? () => onHover(null) : undefined}
            />
        </motion.g>
    );
}

/** 정방향 연결선 위를 스크롤 진행도에 따라 흐르는 패킷. */
function Packet({
    index,
    progress,
}: {
    index: number;
    progress: MotionValue<number>;
}) {
    const from = nodeX(index) + NODE_W;
    const to = nodeX(index + 1);

    /*
     * 패킷은 자기 구간의 진행도에서만 존재한다. 스크롤을 멈추면 패킷도 멈춘다 —
     * 스크롤과 무관하게 도는 애니메이션은 진행 상황을 알려주지 않는 장식일 뿐이다.
     */
    const span = 1 / COUNT;
    const start = index * span;
    const end = start + span;

    const cx = useTransform(progress, [start, end], [from, to]);
    const opacity = useTransform(
        progress,
        [start, start + span * 0.15, end - span * 0.15, end],
        [0, 1, 1, 0]
    );

    return (
        <motion.circle
            r={3}
            cy={MID_Y}
            fill="var(--color-glow)"
            style={{ cx, opacity }}
        />
    );
}

interface PipelineDiagramProps {
    progress: MotionValue<number>;
    active: number;
    onSelect: (index: number) => void;
    onHover: (index: number | null) => void;
    interactive: boolean;
}

export function PipelineDiagram({
    progress,
    active,
    onSelect,
    onHover,
    interactive,
}: PipelineDiagramProps) {
    const prefersReduced = useReducedMotion();

    return (
        <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="w-full overflow-visible"
            role="tablist"
            aria-label="에이전트 실행 파이프라인 단계"
        >
            <defs>
                {/*
                 * userSpaceOnUse 필수 — 수평 line은 bounding box 높이가 0이라
                 * 기본값(objectBoundingBox)에서는 그라디언트가 무너져 선이 사라진다.
                 */}
                <linearGradient
                    id="edge-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2={VIEW_W}
                    y2="0"
                >
                    <stop offset="0%" stopColor="var(--color-bright)" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="var(--color-bright)" stopOpacity="0.9" />
                    <stop
                        offset="100%"
                        stopColor="var(--color-bright)"
                        stopOpacity="0.3"
                    />
                </linearGradient>
            </defs>

            {/* 되돌림 경로 — 정방향보다 먼저 그려 뒤에 깔리게 한다 */}
            {PIPELINE_FALLBACKS.map((fallback, lane) => {
                const fromIndex = indexOf(fallback.from);
                const toIndex = indexOf(fallback.to);
                if (fromIndex < 0 || toIndex < 0) return null;

                const isLit = active === fromIndex || active === toIndex;
                const d = fallbackPath(fromIndex, toIndex, lane);
                const midX = (nodeCenter(fromIndex) + nodeCenter(toIndex)) / 2;
                const labelY = NODE_BOTTOM + 18 + lane * 20 - 4;

                return (
                    <g key={`${fallback.from}-${fallback.to}`}>
                        {/*
                         * 점선 자체는 정적으로 두고 등장만 진행도에 맡긴다.
                         * framer의 pathLength는 strokeDasharray로 구현돼 있어서
                         * 둘을 같이 걸면 점선 패턴이 통째로 덮어써진다.
                         */}
                        <motion.path
                            d={d}
                            fill="none"
                            stroke={
                                isLit ? "var(--color-destructive)" : "var(--color-border-strong)"
                            }
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            style={{ opacity: progress }}
                            className="transition-[stroke] duration-300"
                        />
                        <motion.text
                            x={midX}
                            y={labelY}
                            textAnchor="middle"
                            fontFamily="var(--font-mono)"
                            fontSize={9}
                            letterSpacing="0.14em"
                            fill={isLit ? "var(--color-destructive)" : "var(--color-faint)"}
                            style={{ opacity: progress }}
                            className="transition-[fill] duration-300"
                        >
                            {fallback.label}
                        </motion.text>
                    </g>
                );
            })}

            {/* 정방향 연결선 + 패킷 */}
            {PIPELINE.slice(0, -1).map((node, index) => (
                <g key={`edge-${node.id}`}>
                    <motion.line
                        x1={nodeX(index) + NODE_W}
                        y1={MID_Y}
                        x2={nodeX(index + 1)}
                        y2={MID_Y}
                        stroke="url(#edge-gradient)"
                        strokeWidth={1.5}
                        style={{ pathLength: progress }}
                    />
                    {prefersReduced ? null : (
                        <Packet index={index} progress={progress} />
                    )}
                </g>
            ))}

            {PIPELINE.map((node, index) => (
                <DiagramNode
                    key={node.id}
                    index={index}
                    progress={progress}
                    isActive={active === index}
                    onSelect={onSelect}
                    onHover={onHover}
                    interactive={interactive}
                />
            ))}
        </svg>
    );
}
