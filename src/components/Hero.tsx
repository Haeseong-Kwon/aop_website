"use client";

import { motion } from "framer-motion";

export function Hero() {
    return (
        <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white noise px-6 md:px-10 pt-24">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-black z-0 animate-pulse-slow" />
            <div className="absolute inset-y-0 left-6 md:left-10 w-px bg-white/10" />
            <div className="absolute inset-y-0 right-6 md:right-10 w-px bg-white/10" />

            <div className="relative z-10 text-center w-full max-w-[120rem] mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                >
                    <h1 className="text-6xl md:text-9xl leading-[0.82] tracking-[-0.05em] mb-3">
                        AOP: The<br className="md:hidden" /> Art of<br />Programming
                    </h1>
                </motion.div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10 mt-8 md:mt-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-left md:max-w-xs"
                    >
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0052FF] mb-2">Vision 2026</p>
                        <h2 className="text-lg md:text-xl font-bold leading-tight">
                            &ldquo;기술로 일상을 설계하고, 플랫폼으로 가치를 증명합니다.&rdquo;
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-left md:max-w-md border-l border-white/10 pl-6"
                    >
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            AOP는 복잡한 세상의 문제들을 명쾌한 사용자 경험으로 치환하는
                            &lsquo;테크 솔루션 & 브랜드 랩&rsquo;입니다. 비즈니스의 본질을 꿰뚫는
                            아키텍처와 사용자 중심의 인터페이스를 통해 새로운 연결의 가치를 창조합니다.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-10"
                >
                    <a
                        href="#services"
                        className="group relative inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em]"
                    >
                        <span className="w-10 h-[1px] bg-white group-hover:w-16 transition-all duration-500" />
                        Explore Services
                    </a>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 2, delay: 1.2 }}
                className="absolute bottom-8 left-6 md:left-10 flex items-center gap-3"
            >
                <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent" />
                <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-500 [writing-mode:vertical-lr]">Scroll</p>
            </motion.div>
        </section>
    );
}
