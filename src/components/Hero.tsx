"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MaskedText } from "@/components/motion/MaskedText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { AgentRunPanel } from "@/components/hero/AgentRunPanel";
import { HERO, PARTNERS } from "@/lib/constants";

export function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // 0.3배속 패럴랙스 — reducedMotion="user"에서는 MotionConfig가 transform을 무력화한다.
    const auroraY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
    const panelY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

    return (
        <section ref={ref} id="hero" className="relative overflow-hidden pt-32 pb-20 md:pt-40">
            <motion.div
                aria-hidden
                style={{ y: auroraY }}
                className="pointer-events-none absolute inset-x-0 top-[-30%] -z-10 h-[80vh]"
            >
                <div className="absolute left-1/2 top-0 h-full w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_50%_at_50%_45%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_70%)] blur-2xl" />
                <div className="absolute left-[12%] top-[45%] h-[36vh] w-[40vw] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--accent-2)_14%,transparent),transparent_70%)] blur-3xl" />
            </motion.div>

            <div className="container-x relative">
                <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="badge border-border bg-surface text-muted"
                        >
                            <span className="size-1.5 rounded-full bg-accent-2" />
                            {HERO.eyebrow}
                        </motion.span>

                        <MaskedText
                            as="h1"
                            text={HERO.headline}
                            delay={0.18}
                            className="type-display mt-7 max-w-[14ch] text-balance"
                        />

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                            className="type-body mt-8 max-w-lg text-muted"
                        >
                            {HERO.sub}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-10 flex flex-wrap items-center gap-3"
                        >
                            <MagneticButton
                                href={HERO.primaryCta.href}
                                className="btn btn-primary group"
                            >
                                {HERO.primaryCta.label}
                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </MagneticButton>

                            <MagneticButton
                                href={HERO.secondaryCta.href}
                                className="btn btn-ghost"
                            >
                                {HERO.secondaryCta.label}
                            </MagneticButton>
                        </motion.div>
                    </div>

                    <motion.div
                        style={{ y: panelY }}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <AgentRunPanel />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="mt-16 border-t border-border pt-8 md:mt-20"
                >
                    <p className="type-eyebrow">계열 · 파트너</p>
                    <ul className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
                        {PARTNERS.map((partner) => (
                            // TODO: 로고 SVG 교체 — 현재는 워드마크 타이포그래피
                            <li
                                key={partner.id}
                                className="font-mono text-sm tracking-[-0.01em] text-faint transition-colors duration-300 hover:text-muted"
                            >
                                {partner.nameEn}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </section>
    );
}
