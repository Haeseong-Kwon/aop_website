"use client";

import { useRef, useState } from "react";
import {
    motion,
    useScroll,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PIPELINE, SECTIONS, type PipelineNode } from "@/lib/constants";

const NODE_W = 142;
const NODE_H = 74;
const GAP = 28;
const COUNT = PIPELINE.length;
const VIEW_W = COUNT * NODE_W + (COUNT - 1) * GAP;
const VIEW_H = 140;
const NODE_Y = (VIEW_H - NODE_H) / 2;
const MID_Y = VIEW_H / 2;

const nodeX = (index: number) => index * (NODE_W + GAP);
const nodeCenter = (index: number) => nodeX(index) + NODE_W / 2;

/** 스크롤 진행도에 따라 좌→우로 순차 점등되는 노드. */
function DiagramNode({
    node,
    index,
    progress,
    isHovered,
    onHover,
}: {
    node: PipelineNode;
    index: number;
    progress: MotionValue<number>;
    isHovered: boolean;
    onHover: (index: number | null) => void;
}) {
    const opacity = useTransform(
        progress,
        [index / COUNT, (index + 0.75) / COUNT],
        [0.2, 1]
    );

    return (
        <motion.g
            style={{ opacity }}
            tabIndex={0}
            role="listitem"
            aria-label={`${node.label}. ${node.description}`}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(index)}
            onBlur={() => onHover(null)}
            className="outline-none"
        >
            <rect
                x={nodeX(index)}
                y={NODE_Y}
                width={NODE_W}
                height={NODE_H}
                rx={13}
                fill={isHovered ? "var(--color-surface-2)" : "var(--color-surface)"}
                stroke={
                    isHovered ? "var(--color-bright)" : "var(--color-border-strong)"
                }
                strokeWidth={1}
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
        </motion.g>
    );
}

/**
 * 핀 고정 구간 2 — 화면이 멈춘 채로 파이프라인이 좌에서 우로 그려진다.
 * 모바일에서는 핀을 걸지 않고 세로 스택으로 떨어뜨린다.
 */
export function Technology() {
    const pinRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const prefersReduced = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });

    // 앞 20% 구간은 헤딩이 읽히도록 비워두고, 그 뒤부터 다이어그램을 그린다
    const drawProgress = useTransform(scrollYProgress, [0.18, 0.92], [0, 1]);
    const active = hovered ?? 0;

    return (
        <section id="technology" className="relative">
            {/* 데스크톱: 핀 고정 */}
            <div ref={pinRef} className="relative hidden h-[300vh] md:block">
                <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
                    <div className="container-x">
                        <SectionHeading {...SECTIONS.technology} />

                        <div className="relative mt-16 pb-28">
                            <svg
                                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                                className="w-full overflow-visible"
                                role="list"
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
                                        <stop
                                            offset="0%"
                                            stopColor="var(--color-bright)"
                                            stopOpacity="0.3"
                                        />
                                        <stop
                                            offset="50%"
                                            stopColor="var(--color-bright)"
                                            stopOpacity="0.9"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="var(--color-bright)"
                                            stopOpacity="0.3"
                                        />
                                    </linearGradient>
                                </defs>

                                {PIPELINE.slice(0, -1).map((node, index) => {
                                    const from = nodeX(index) + NODE_W;
                                    const to = nodeX(index + 1);

                                    return (
                                        <g key={`edge-${node.id}`}>
                                            <motion.line
                                                x1={from}
                                                y1={MID_Y}
                                                x2={to}
                                                y2={MID_Y}
                                                stroke="url(#edge-gradient)"
                                                strokeWidth={1.5}
                                                style={{ pathLength: drawProgress }}
                                            />
                                            {prefersReduced ? null : (
                                                <motion.circle
                                                    r={2.5}
                                                    cy={MID_Y}
                                                    fill="var(--color-bright)"
                                                    initial={{ cx: from, opacity: 0 }}
                                                    animate={{
                                                        cx: [from, to],
                                                        opacity: [0, 1, 1, 0],
                                                    }}
                                                    transition={{
                                                        duration: 1.4,
                                                        delay: index * 0.22,
                                                        repeat: Infinity,
                                                        repeatDelay: COUNT * 0.22,
                                                        ease: "easeInOut",
                                                    }}
                                                />
                                            )}
                                        </g>
                                    );
                                })}

                                {PIPELINE.map((node, index) => (
                                    <DiagramNode
                                        key={node.id}
                                        node={node}
                                        index={index}
                                        progress={drawProgress}
                                        isHovered={hovered === index}
                                        onHover={setHovered}
                                    />
                                ))}
                            </svg>

                            <div
                                role="status"
                                aria-live="polite"
                                className="surface-card pointer-events-none absolute top-[calc(100%-6.5rem)] w-72 -translate-x-1/2 p-4 text-sm leading-relaxed text-muted transition-opacity duration-200"
                                style={{
                                    // 양 끝 노드에서 툴팁이 컨테이너 밖으로 나가지 않도록 클램프
                                    left: `clamp(9rem, ${(nodeCenter(active) / VIEW_W) * 100}%, calc(100% - 9rem))`,
                                    opacity: hovered === null ? 0 : 1,
                                }}
                            >
                                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bright">
                                    {PIPELINE[active].label}
                                </p>
                                {PIPELINE[active].description}
                            </div>

                            <p className="type-eyebrow absolute bottom-0 left-1/2 -translate-x-1/2">
                                Hover a node for detail
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모바일: 핀 없이 세로 스택 */}
            <div className="section-y md:hidden">
                <div className="container-x">
                    <SectionHeading {...SECTIONS.technology} />

                    <ol className="mt-12 space-y-3">
                        {PIPELINE.map((node, index) => (
                            <Reveal key={node.id} delay={index * 0.05} y={12}>
                                <li className="surface-card p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[11px] tracking-[0.16em] text-faint">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="font-mono text-sm text-bright">
                                            {node.label}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-muted">
                                        {node.description}
                                    </p>
                                </li>
                            </Reveal>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
