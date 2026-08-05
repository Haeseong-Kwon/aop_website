"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTransition } from "@/hooks/useEnter";
import { EASE, VIEWPORT } from "@/lib/motion";
import { APPROACH, SECTIONS } from "@/lib/constants";

const COUNT = APPROACH.length;

/** 진행 중이 아닌 단계는 0.35로 물러난다. 읽는 위치가 곧 진행 표시기가 된다. */
const DIMMED = 0.35;

function Step({
    step,
    index,
    progress,
}: {
    step: (typeof APPROACH)[number];
    index: number;
    progress: MotionValue<number>;
}) {
    const prefersReduced = useReducedMotion();

    /*
     * 자기 구간의 앞뒤로 여유를 둬서, 두 단계가 동시에 반쯤 켜진 어정쩡한 상태가
     * 오래 남지 않게 한다. 경계에서만 짧게 교차한다.
     */
    const span = 1 / COUNT;
    const start = index * span;
    const opacity = useTransform(
        progress,
        [start - span * 0.35, start + span * 0.15, start + span * 0.85, start + span * 1.35],
        [DIMMED, 1, 1, DIMMED]
    );

    const markerTransition = useTransition({ duration: 0.5, ease: EASE.out });

    return (
        <motion.li
            style={prefersReduced ? undefined : { opacity }}
            className="relative sm:pl-12"
        >
            <motion.span
                aria-hidden
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT}
                transition={markerTransition}
                className="absolute left-0 top-2 hidden size-[15px] place-items-center rounded-full border border-beam bg-bg sm:grid"
            >
                <span className="size-[5px] rounded-full bg-beam" />
            </motion.span>

            <p className="font-mono text-[11px] tracking-[0.18em] text-faint">
                {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="type-h3 mt-3">{step.title}</h3>
            <p className="type-body mt-4 text-muted">{step.description}</p>
        </motion.li>
    );
}

/**
 * 세 단계가 순환한다는 것을 세로 레일과 순차 점등으로 보여준다.
 * 스크롤 하이재킹은 하지 않는다 — 스크롤 속도는 사용자가 쥐고, 우리는 강조만 옮긴다.
 */
export function Approach() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.8", "end 0.5"],
    });

    const railTransition = useTransition({ duration: 1.6, ease: EASE.out });

    return (
        <section id="approach" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.approach} />

                <div ref={ref} className="relative mx-auto mt-20 max-w-3xl">
                    {/* 세로 레일 */}
                    <span
                        aria-hidden
                        className="absolute left-[7px] top-2 hidden h-full w-px bg-border sm:block"
                    >
                        <motion.span
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={VIEWPORT}
                            transition={railTransition}
                            className="block h-full w-px origin-top bg-[linear-gradient(180deg,var(--color-glow),var(--color-beam)_45%,transparent)]"
                        />
                    </span>

                    <ol className="space-y-14">
                        {APPROACH.map((step, index) => (
                            <Step
                                key={step.id}
                                step={step}
                                index={index}
                                progress={scrollYProgress}
                            />
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
