"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { NodeField } from "@/components/visual/NodeField";
import { EQUATION } from "@/lib/constants";

/**
 * 핀 고정 구간 1 — 스크롤이 진행되는 동안 화면이 멈추고 낱말이 가로로 흘러간다.
 * 레퍼런스의 `Mycelium = Platform = Materials` 전개를 우리 명제로 옮긴 것.
 */
export function WordEquation() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    });

    // 첫 낱말이 중앙에서 시작해 마지막 낱말이 중앙에서 끝나도록 이동시킨다
    const x = useTransform(scrollYProgress, [0, 1], ["38%", "-38%"]);
    const captionOpacity = useTransform(
        scrollYProgress,
        [0, 0.2, 0.85, 1],
        [0, 1, 1, 0]
    );

    return (
        <div ref={ref} className="relative h-[260vh]">
            <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
                <div aria-hidden className="vignette-y absolute inset-0 -z-10">
                    <NodeField opacity={0.3} density={30} />
                </div>

                <motion.div
                    style={{ x }}
                    className="flex shrink-0 items-center gap-8 whitespace-nowrap md:gap-16"
                >
                    {EQUATION.terms.map((term, index) => (
                        <div key={term.en} className="flex items-center gap-8 md:gap-16">
                            {index > 0 ? (
                                <span className="text-4xl font-extralight text-faint md:text-6xl">
                                    =
                                </span>
                            ) : null}
                            <span className="type-display">{term.en}</span>
                        </div>
                    ))}
                </motion.div>

                <motion.p
                    style={{ opacity: captionOpacity }}
                    className="type-body absolute bottom-[16vh] max-w-lg px-6 text-center text-muted"
                >
                    {EQUATION.caption}
                </motion.p>
            </div>
        </div>
    );
}
