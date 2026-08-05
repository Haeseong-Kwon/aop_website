"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { FlipPanel } from "@/components/motion/FlipPanel";
import {
    RotaryStage,
    faceIndexFromProgress,
} from "@/components/motion/RotaryStage";
import { useEnter, useTransition } from "@/hooks/useEnter";
import { DUR, EASE, STAGGER, VIEWPORT } from "@/lib/motion";
import { APPROACH, SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const COUNT = APPROACH.length;

/** 한 단계가 놓이는 면. 3면 프리즘이라 폭이 넓고 낮다. */
function StepFace({
    step,
    index,
}: {
    step: (typeof APPROACH)[number];
    index: number;
}) {
    return (
        <div className="surface-card flex h-full flex-col justify-center p-8 md:p-12">
            <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] tracking-[0.18em] text-faint">
                    {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-[linear-gradient(90deg,var(--color-beam),transparent)]" />
            </div>

            <h3 className="type-h2 mt-6 max-w-[18ch]">{step.title}</h3>
            <p className="type-body mt-5 max-w-2xl text-muted">{step.description}</p>
        </div>
    );
}

/**
 * 세 단계가 하나의 순환을 이룬다는 것을, 같은 기둥의 세 면을 돌려 보여준다.
 *
 * 이전에는 세 단계를 세로로 쌓고 흐림 정도만 바꿨다. 그러면 "위에서 아래로 흐르는
 * 목록"으로 읽히는데, 이 섹션이 말하려는 건 순환이다. 같은 입체를 돌리면 세 단계가
 * 서로 다른 항목이 아니라 한 물체의 세 면이라는 게 형태로 드러난다.
 *
 * 스크롤을 가로채지는 않는다 — 속도는 사용자가 쥐고, 우리는 회전만 따라 붙인다.
 */
export function Approach() {
    const pinRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });

    const stageProgress = useTransform(scrollYProgress, [0.14, 0.92], [0, 1]);

    useMotionValueEvent(stageProgress, "change", (value) => {
        setActive(faceIndexFromProgress(value, COUNT));
    });

    const faces = APPROACH.map((step, index) => (
        <StepFace key={step.id} step={step} index={index} />
    ));

    const heading = <SectionHeading {...SECTIONS.approach} />;

    return (
        <section id="approach" className="relative">
            {/* 넓은 화면: 스크롤이 기둥을 돌린다 */}
            <div
                ref={pinRef}
                className="relative hidden h-[300vh] md:motion-safe:block"
            >
                <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
                    <div className="container-x">
                        {heading}

                        <StepTicks active={active} />

                        <RotaryStage
                            progress={stageProgress}
                            faces={faces}
                            activeIndex={active}
                            className="mx-auto mt-8 h-[clamp(17rem,34vh,22rem)] max-w-4xl"
                        />
                    </div>
                </div>
            </div>

            {/* 좁은 화면: 회전 대신 순차 등장 */}
            <div className="section-y md:motion-safe:hidden">
                <div className="container-x">
                    {heading}

                    <div className="mt-12 space-y-4">
                        {APPROACH.map((step, index) => (
                            <StackedStep key={step.id} step={step} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/** 단계 눈금. 회전 중 지금 어디쯤인지 알려주고, 라벨은 판이 넘어가듯 바뀐다. */
function StepTicks({ active }: { active: number }) {
    return (
        <div className="mx-auto mt-12 flex max-w-4xl items-center gap-4">
            <div className="flex flex-1 gap-1.5">
                {APPROACH.map((step, index) => (
                    <span
                        key={step.id}
                        className={cn(
                            "h-px flex-1 transition-colors duration-500",
                            index <= active ? "bg-beam" : "bg-border"
                        )}
                    />
                ))}
            </div>

            <FlipPanel trigger={active} axis="x" className="w-40 shrink-0">
                <span className="block text-right font-mono text-[11px] uppercase tracking-[0.18em] text-bright">
                    {String(active + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
                </span>
            </FlipPanel>
        </div>
    );
}

function StackedStep({
    step,
    index,
}: {
    step: (typeof APPROACH)[number];
    index: number;
}) {
    const enter = useEnter({ y: 18, delay: index * STAGGER.loose, duration: DUR.slow });
    const markerTransition = useTransition({
        duration: DUR.base,
        delay: 0.15 + index * STAGGER.loose,
        ease: EASE.out,
    });

    return (
        <motion.div {...enter} className="surface-card relative p-6">
            <motion.span
                aria-hidden
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT}
                transition={markerTransition}
                className="absolute left-0 top-6 h-8 w-px bg-beam"
            />
            <p className="font-mono text-[11px] tracking-[0.18em] text-faint">
                {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="type-h3 mt-3">{step.title}</h3>
            <p className="type-body mt-4 text-muted">{step.description}</p>
        </motion.div>
    );
}
