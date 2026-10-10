"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MaskedText } from "@/components/motion/MaskedText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { NoiseField } from "@/components/visual/NoiseField";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTransition } from "@/hooks/useEnter";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { HERO } from "@/lib/constants";

/*
 * 유리 정육면체 씬. three/drei는 첫 페인트 뒤에 받는다 — 헤드라인이 LCP이고,
 * 3D는 그 뒤에 페이드로 들어와도 첫인상을 해치지 않는다.
 */
const HeroScene = dynamic(() => import("@/components/visual/HeroScene"), {
    ssr: false,
});

/** 로드 직후 순차로 들어오는 블록. 스크롤 등장이 아니라 시간축 등장이다. */
function LoadIn({
    delay,
    y = 14,
    children,
    className,
}: {
    delay: number;
    y?: number;
    children: React.ReactNode;
    className?: string;
}) {
    const transition = useTransition({ duration: DUR.slow, delay, ease: EASE.out });

    return (
        <motion.div
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function Hero() {
    const ref = useRef<HTMLElement>(null);
    const prefersReduced = useReducedMotion();
    /*
     * 히어로를 벗어나면 씬을 통째로 내린다. 투과 재질의 렌더 타깃은 화면 밖에서도
     * GPU 메모리를 쥐고 있어서, 아래 섹션의 캔버스들과 겹치면 컨텍스트가 소실된다.
     */
    const isHeroVisible = useInView(ref);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // 배경 레이어만 느리게 밀어 깊이감을 만든다. 회전·확대는 씬이 직접 진행도를 읽는다.
    const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <section
            ref={ref}
            id="hero"
            className="relative flex min-h-[100svh] flex-col overflow-hidden pt-28 md:pt-32"
        >
            <motion.div
                aria-hidden
                style={{ y: sceneY }}
                className="absolute inset-0 -z-10"
            >
                {/*
                 * 노이즈 필드가 가장 아래, 유리 오브젝트가 그 위.
                 * 캔버스는 투명 배경이라 노이즈가 유리 가장자리 너머로 비친다.
                 */}
                <div className="absolute inset-0">
                    <NoiseField />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2.2, delay: 0.3, ease: EASE.out }}
                    className="absolute inset-0"
                >
                    {isHeroVisible ? (
                        <HeroScene
                            progress={scrollYProgress}
                            animate={!prefersReduced}
                            className="absolute inset-0"
                        />
                    ) : null}
                </motion.div>

                {/* 좌측 스크림 — 발광면 위에서도 헤드라인 대비를 유지한다 */}
                <div className="absolute inset-0 bg-[linear-gradient(100deg,#000_8%,rgba(0,0,0,0.6)_34%,transparent_52%)]" />
                {/* 좁은 화면에서는 본문이 빔 위로 겹치므로 전면 베일을 한 겹 더 얹는다 */}
                <div className="absolute inset-0 bg-black/45 lg:hidden" />
            </motion.div>

            <motion.div
                style={{ opacity: contentOpacity }}
                className="container-x flex flex-1 flex-col"
            >
                {/*
                 * 왼쪽 열에 메시지를 모두 모으고 오른쪽 열은 비운다 — 유리 오브젝트의 자리다.
                 * 본문이 물체 위에 겹치면 굴절 무늬가 글자 뒤에서 일렁여 읽히지 않는다.
                 */}
                <div className="grid flex-1 items-center lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <div className="max-w-[40rem]">
                        <LoadIn delay={0} y={8}>
                            <p className="section-label">{HERO.eyebrow}</p>
                        </LoadIn>

                        <MaskedText
                            as="h1"
                            text={HERO.headline}
                            delay={0.18}
                            stagger={STAGGER.tight}
                            className="type-display mt-7"
                        />

                        <LoadIn delay={0.6} y={16} className="mt-9">
                            <p className="max-w-[34rem] text-[clamp(1.0625rem,1.3vw,1.25rem)] leading-[1.65] tracking-[-0.015em] text-bright">
                                {HERO.sub}
                            </p>
                        </LoadIn>

                        <LoadIn delay={0.72} y={16} className="mt-4">
                            <p className="max-w-[34rem] text-[clamp(1rem,1.15vw,1.0625rem)] leading-[1.7] tracking-[-0.01em] text-muted">
                                {HERO.subSecondary}
                            </p>
                        </LoadIn>

                        <LoadIn
                            delay={0.84}
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
                        </LoadIn>
                    </div>
                </div>

                <LoadIn delay={1.1} y={0} className="mb-8 mt-14">
                    {/*
                     * 무한 바운스를 걷어냈다. 화살표는 hover에서만 내려간다 —
                     * 계속 튀는 화살표는 안내가 아니라 소음이다.
                     */}
                    <a
                        href="#products"
                        className="scroll-rail group transition-colors hover:text-bright"
                    >
                        <span>Scroll down</span>
                        <ChevronDown
                            size={18}
                            strokeWidth={1.5}
                            className="transition-transform duration-300 group-hover:translate-y-1"
                        />
                    </a>
                </LoadIn>
            </motion.div>
        </section>
    );
}
