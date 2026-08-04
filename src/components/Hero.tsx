"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MaskedText } from "@/components/motion/MaskedText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { HERO, SITE } from "@/lib/constants";

export function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // 0.3배속 패럴랙스 — reducedMotion="user"에서는 MotionConfig가 transform을 무력화한다.
    const meshY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const meshScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <section
            ref={ref}
            id="hero"
            className="relative flex min-h-[100svh] items-center overflow-hidden pt-32 pb-24"
        >
            {/* TODO: 실제 에셋 교체 — 현재는 CSS gradient mesh */}
            <motion.div
                aria-hidden
                style={{ y: meshY, scale: meshScale }}
                className="pointer-events-none absolute inset-0 -z-10"
            >
                <div className="absolute left-1/2 top-[-20%] h-[70vh] w-[110vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(91,91,214,0.22),transparent_62%)] blur-3xl" />
                <div className="absolute left-[10%] top-[35%] h-[40vh] w-[45vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(61,214,140,0.08),transparent_65%)] blur-3xl" />
            </motion.div>

            <motion.div style={{ opacity: contentOpacity }} className="container-x relative">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="type-eyebrow"
                >
                    {HERO.eyebrow}
                </motion.p>

                <MaskedText
                    as="h1"
                    text={HERO.headline}
                    delay={0.15}
                    className="type-display mt-8 max-w-[16ch]"
                />

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="type-body mt-10 max-w-xl text-muted"
                >
                    {HERO.sub}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-12 flex flex-wrap items-center gap-4"
                >
                    <MagneticButton
                        href={HERO.primaryCta.href}
                        className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-text transition-colors hover:bg-accent/85"
                    >
                        {HERO.primaryCta.label}
                        <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </MagneticButton>

                    <MagneticButton
                        href={HERO.secondaryCta.href}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted transition-colors hover:border-text/30 hover:text-text"
                    >
                        {HERO.secondaryCta.label}
                    </MagneticButton>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="type-eyebrow mt-24"
                >
                    {SITE.slogan} — {SITE.fullName}
                </motion.p>
            </motion.div>
        </section>
    );
}
