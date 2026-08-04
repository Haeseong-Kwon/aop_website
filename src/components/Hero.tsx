"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MaskedText } from "@/components/motion/MaskedText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { NodeField } from "@/components/visual/NodeField";
import { ScrollCue } from "@/components/ScrollCue";
import { HERO } from "@/lib/constants";

export function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // 스크롤에 따라 히어로가 뒤로 물러나며 다음 섹션에 자리를 내준다
    const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
    const fieldScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

    return (
        <section
            ref={ref}
            id="hero"
            className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-28"
        >
            {/* TODO: 실제 에셋 교체 — 사진/영상 확보 시 이 레이어를 next/image로 대체 */}
            <motion.div
                aria-hidden
                style={{ scale: fieldScale }}
                className="absolute inset-0 -z-10"
            >
                <div className="vignette-y absolute inset-0">
                    <NodeField opacity={0.5} />
                </div>
                <div className="absolute left-1/2 top-1/2 h-[62vh] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07),transparent_66%)] blur-2xl" />
            </motion.div>

            <motion.div
                style={{ y: contentY, opacity: contentOpacity }}
                className="relative flex flex-col items-center text-center"
            >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="type-eyebrow"
                >
                    {HERO.eyebrow}
                </motion.span>

                <MaskedText
                    as="h1"
                    text={HERO.headline}
                    delay={0.2}
                    className="type-display mt-8 max-w-[15ch] text-balance"
                />

                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="type-body mt-9 max-w-xl text-muted"
                >
                    {HERO.sub}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-11 flex flex-wrap items-center justify-center gap-3"
                >
                    <MagneticButton href={HERO.primaryCta.href} className="btn btn-primary group">
                        {HERO.primaryCta.label}
                        <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </MagneticButton>

                    <MagneticButton href={HERO.secondaryCta.href} className="btn btn-ghost">
                        {HERO.secondaryCta.label}
                    </MagneticButton>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.4 }}
                style={{ opacity: contentOpacity }}
                className="absolute bottom-9 left-1/2 -translate-x-1/2"
            >
                <ScrollCue />
            </motion.div>
        </section>
    );
}
