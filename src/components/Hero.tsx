"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MaskedText } from "@/components/motion/MaskedText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { PrismLight } from "@/components/visual/PrismLight";
import { HERO } from "@/lib/constants";

export function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // 배경 그래픽만 느리게 밀어 깊이감을 만든다
    const prismScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
    const prismY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <section
            ref={ref}
            id="hero"
            className="relative flex min-h-[100svh] flex-col overflow-hidden pt-28 md:pt-32"
        >
            <motion.div
                aria-hidden
                style={{ scale: prismScale, y: prismY }}
                className="absolute inset-0 -z-10"
            >
                <PrismLight />
                {/* 좌측 스크림 — 발광면 위에서도 헤드라인 대비를 유지한다 */}
                <div className="absolute inset-0 bg-[linear-gradient(100deg,#000_6%,rgba(0,0,0,0.72)_30%,transparent_58%)]" />
                {/* 좁은 화면에서는 본문이 빔 위로 겹치므로 전면 베일을 한 겹 더 얹는다 */}
                <div className="absolute inset-0 bg-black/45 lg:hidden" />
            </motion.div>

            <motion.div
                style={{ opacity: contentOpacity }}
                className="container-x flex flex-1 flex-col"
            >
                <div className="grid flex-1 items-start gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-12">
                    {/* 좌상단 대형 디스플레이 */}
                    <div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="type-eyebrow"
                        >
                            {HERO.eyebrow}
                        </motion.p>

                        <MaskedText
                            as="h1"
                            text={HERO.headline}
                            delay={0.18}
                            className="type-display mt-7 max-w-[20ch]"
                        />
                    </div>

                    {/* 우측 본문 블록 — 레퍼런스처럼 아래 문단을 한 단계 흐리게 */}
                    <div className="lg:pt-[38vh]">
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[clamp(1.0625rem,1.55vw,1.4rem)] leading-[1.65] tracking-[-0.015em] text-bright"
                        >
                            {HERO.sub}
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-7 text-[clamp(1.0625rem,1.55vw,1.4rem)] leading-[1.65] tracking-[-0.015em] text-muted"
                        >
                            {HERO.subSecondary}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-10 flex flex-wrap items-center gap-3"
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
                    </div>
                </div>

                <motion.a
                    href="#products"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.3 }}
                    className="scroll-rail mb-8 mt-14 transition-colors hover:text-bright"
                >
                    <span>Scroll down</span>
                    <motion.span
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronDown size={18} strokeWidth={1.5} />
                    </motion.span>
                </motion.a>
            </motion.div>
        </section>
    );
}
