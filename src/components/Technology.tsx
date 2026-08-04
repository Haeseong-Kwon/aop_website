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
import { PIPELINE, type PipelineNode } from "@/lib/constants";

const NODE_W = 148;
const NODE_H = 64;
const GAP = 24;
const COUNT = PIPELINE.length;
const VIEW_W = COUNT * NODE_W + (COUNT - 1) * GAP;
const VIEW_H = 120;
const NODE_Y = (VIEW_H - NODE_H) / 2;

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
        [index / COUNT, (index + 0.8) / COUNT],
        [0.25, 1]
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
                rx={10}
                fill="var(--color-surface)"
                stroke={isHovered ? "var(--color-accent)" : "var(--color-border)"}
                strokeWidth={1}
            />
            <text
                x={nodeCenter(index)}
                y={VIEW_H / 2 + 4}
                textAnchor="middle"
                fill="var(--color-text)"
                fontFamily="var(--font-mono)"
                fontSize={13}
            >
                {node.label}
            </text>
        </motion.g>
    );
}

export function Technology() {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState<number | null>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.9", "center 0.45"],
    });

    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const active = hovered ?? 0;

    return (
        <section id="technology" className="section-y relative">
            <div className="container-x">
                <SectionHeading
                    eyebrow="TECHNOLOGY"
                    title="에이전트 실행 파이프라인"
                    description="요청 하나가 결과가 되기까지 거치는 경로입니다. 각 단계는 독립적으로 교체·재시도할 수 있고, 실행 상태는 체크포인트로 남습니다."
                />

                <div ref={ref} className="mt-16">
                    {/* 데스크톱: SVG 다이어그램 + 하단 툴팁 */}
                    <div className="relative hidden pb-36 md:block">
                        <svg
                            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                            className="w-full"
                            role="list"
                            aria-label="에이전트 실행 파이프라인 단계"
                        >
                            {PIPELINE.slice(0, -1).map((node, index) => (
                                <motion.line
                                    key={`edge-${node.id}`}
                                    x1={nodeX(index) + NODE_W}
                                    y1={VIEW_H / 2}
                                    x2={nodeX(index + 1)}
                                    y2={VIEW_H / 2}
                                    stroke="var(--color-accent)"
                                    strokeWidth={1.5}
                                    style={{ pathLength }}
                                />
                            ))}

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
                            className="pointer-events-none absolute top-[calc(100%-7rem)] w-72 -translate-x-1/2 rounded-lg border border-border bg-surface-2 p-4 text-sm leading-relaxed text-muted shadow-xl transition-opacity duration-200"
                            style={{
                                // 양 끝 노드에서 툴팁이 컨테이너 밖으로 나가지 않도록 클램프
                                left: `clamp(9rem, ${(nodeCenter(active) / VIEW_W) * 100}%, calc(100% - 9rem))`,
                                opacity: hovered === null ? 0 : 1,
                            }}
                        >
                            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text">
                                {PIPELINE[active].label}
                            </p>
                            {PIPELINE[active].description}
                        </div>

                        <p className="type-eyebrow absolute bottom-0 left-0">
                            Hover a node for detail
                        </p>
                    </div>

                    {/* 모바일: 세로 스택 */}
                    <ol className="space-y-3 md:hidden">
                        {PIPELINE.map((node, index) => (
                            <Reveal key={node.id} delay={index * 0.05} y={12}>
                                <li className="surface-card p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[11px] tracking-[0.18em] text-accent">
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
