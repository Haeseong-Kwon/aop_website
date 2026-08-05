"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { useEnter, useTransition } from "@/hooks/useEnter";
import { DUR, EASE, STAGGER, VIEWPORT } from "@/lib/motion";
import { APPROACH, SECTIONS } from "@/lib/constants";

/** 세로 레일 위의 단계 마커. 토큰 규칙상 scale 등장은 쓰지 않는다. */
function StepMarker({ delay }: { delay: number }) {
    const transition = useTransition({ duration: DUR.base, delay, ease: EASE.out });

    return (
        <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={VIEWPORT}
            transition={transition}
            className="absolute left-0 top-2 hidden size-[15px] place-items-center rounded-full border border-beam bg-bg sm:grid"
        >
            <span className="size-[5px] rounded-full bg-beam" />
        </motion.span>
    );
}

function Step({
    step,
    index,
}: {
    step: (typeof APPROACH)[number];
    index: number;
}) {
    const enter = useEnter({ y: 18, delay: index * STAGGER.loose, duration: DUR.slow });

    return (
        <motion.li {...enter} className="relative sm:pl-12">
            <StepMarker delay={0.15 + index * STAGGER.loose} />

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
 * 레일은 스크롤 진입에 맞춰 위에서 아래로 그려진다.
 */
export function Approach() {
    const railTransition = useTransition({ duration: 1.6, ease: EASE.out });

    return (
        <section id="approach" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.approach} />

                <div className="relative mx-auto mt-20 max-w-3xl">
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
                            <Step key={step.id} step={step} index={index} />
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
