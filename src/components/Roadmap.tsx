"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { useEnterChild, useEnterList } from "@/hooks/useEnter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { STAGGER } from "@/lib/motion";
import { ROADMAP, SECTIONS, type RoadmapPhase } from "@/lib/constants";
import { cn } from "@/lib/utils";

const COUNT = ROADMAP.length;

/**
 * 단계 노드. 스크롤 레일이 이 노드의 자리를 지나는 순간 켜진다 —
 * 지금(Now)은 처음부터 켜져 있고, 다음과 확장은 읽는 속도에 맞춰 차례로 밝아진다.
 */
function PhaseNode({ index, progress }: { index: number; progress: MotionValue<number> }) {
    const at = index / COUNT;
    const lit = useTransform(progress, [at - 0.02, at + 0.04], [0, 1]);
    const isNow = index === 0;

    return (
        <span className="relative z-10 block size-[18px]">
            {isNow ? <span className="absolute inset-0 rounded-full bg-beam/50 motion-safe:animate-ping" /> : null}
            <span className="absolute inset-0 rounded-full border-2 border-beam bg-bg" />
            <motion.span
                style={{ opacity: isNow ? 1 : lit }}
                className="absolute inset-0 rounded-full border-2 border-glow bg-beam shadow-[0_0_20px_rgba(74,140,255,0.7)]"
            />
        </span>
    );
}

function PhaseCard({ phase, index }: { phase: RoadmapPhase; index: number }) {
    const list = useEnterList(STAGGER.base);
    const item = useEnterChild({ y: 10 });
    const isNow = index === 0;

    return (
        <motion.div
            {...list}
            className={cn(
                "relative h-full overflow-hidden rounded-[22px] border p-6 md:p-8",
                isNow ? "light-panel border-beam/50" : "surface-card"
            )}
        >
            <motion.p {...item} className="font-mono text-[11px] uppercase tracking-[0.24em] text-glow">
                {phase.label}
            </motion.p>
            <motion.h3 {...item} className="type-h3 mt-3">
                {phase.title}
            </motion.h3>
            <ul className="mt-6 space-y-3.5">
                {phase.items.map((text) => (
                    <motion.li key={text} {...item} className="flex gap-3 text-[15px] leading-snug text-text">
                        <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-beam" />
                        {text}
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}

export function Roadmap() {
    const ref = useRef<HTMLDivElement>(null);
    const prefersReduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
    const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 });
    const still = useTransform(progress, () => 1);
    const rail = prefersReduced ? still : progress;

    return (
        <section id="roadmap" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.roadmap} />

                <div ref={ref} className="mt-16">
                    {/* 가로 레일 — 넓은 화면에서만. 좁은 화면은 카드가 위아래로 쌓여 순서가 스스로 드러난다 */}
                    <div className="relative mb-8 hidden md:block">
                        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
                        <motion.span
                            style={{ scaleX: rail }}
                            className="absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 bg-[linear-gradient(90deg,var(--color-glow),var(--color-beam)_70%,transparent)]"
                        />
                        <div className="relative grid grid-cols-3 gap-4">
                            {ROADMAP.map((phase, index) => (
                                <PhaseNode key={phase.id} index={index} progress={rail} />
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {ROADMAP.map((phase, index) => (
                            <PhaseCard key={phase.id} phase={phase} index={index} />
                        ))}
                    </div>
                </div>

                <p className="mt-5 text-[13px] text-faint">
                    계획 단계의 방향이며 확정 일정이 아닙니다. 항목은 각 제품의 개발 문서에 기록된 다음 단계에서 정리했습니다.
                </p>
            </div>
        </section>
    );
}
