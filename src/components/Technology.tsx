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
const NODE_H = 72;
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
        [0.28, 1]
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
                rx={12}
                fill="var(--surface)"
                stroke={isHovered ? "var(--accent)" : "var(--border)"}
                strokeWidth={isHovered ? 1.5 : 1}
            />
            <text
                x={nodeX(index) + 16}
                y={NODE_Y + 24}
                fill="var(--faint)"
                fontFamily="var(--font-mono)"
                fontSize={10}
                letterSpacing="0.14em"
            >
                {String(index + 1).padStart(2, "0")}
            </text>
            <text
                x={nodeX(index) + 16}
                y={NODE_Y + 50}
                fill="var(--text)"
                fontFamily="var(--font-mono)"
                fontSize={13}
                letterSpacing="-0.01em"
            >
                {node.label}
            </text>
        </motion.g>
    );
}

export function Technology() {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const prefersReduced = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.9", "center 0.45"],
    });

    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const active = hovered ?? 0;

    return (
        <section id="technology" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.technology} />

                <div ref={ref} className="mt-14">
                    {/* 데스크톱: SVG 다이어그램 + 하단 툴팁 */}
                    <div className="relative hidden pb-28 md:block">
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
                                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                                    <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.95" />
                                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.35" />
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
                                            style={{ pathLength }}
                                        />
                                        {prefersReduced ? null : (
                                            <motion.circle
                                                r={2.5}
                                                cy={MID_Y}
                                                fill="var(--accent)"
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
                                    progress={scrollYProgress}
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
                            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-text">
                                {PIPELINE[active].label}
                            </p>
                            {PIPELINE[active].description}
                        </div>

                        <p className="type-eyebrow absolute bottom-0 left-0">
                            Hover a node for detail
                        </p>
                    </div>

                    {/* 모바일: 세로 스택 */}
                    <ol className="relative space-y-3 md:hidden">
                        {PIPELINE.map((node, index) => (
                            <Reveal key={node.id} delay={index * 0.05} y={12}>
                                <li className="surface-card p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[11px] tracking-[0.14em] text-accent">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="font-mono text-sm">{node.label}</span>
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
