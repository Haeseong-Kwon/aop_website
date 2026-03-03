"use client";

import { motion } from "framer-motion";

export function Hero() {
    return (
        <section id="hero" className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white noise px-8">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-black z-0 animate-pulse-slow" />

            <div className="relative z-10 text-center w-full max-w-[120rem] mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-12"
                >
                    <h1 className="text-huge leading-[0.8] tracking-[-0.05em] mb-4">
                        AOP: The<br className="md:hidden" /> Art of<br />Platform
                    </h1>
                </motion.div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mt-12 md:mt-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-left md:max-w-xs"
                    >
                        <p className="text-sm font-bold uppercase tracking-widest text-[#0052FF] mb-2">Vision 2026</p>
                        <h2 className="text-xl md:text-2xl font-bold leading-tight">
                            "기술로 일상을 설계하고, 플랫폼으로 가치를 증명합니다."
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-left md:max-w-md border-l border-white/10 pl-8"
                    >
                        <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                            AOP는 복잡한 세상의 문제들을 명쾌한 사용자 경험으로 치환하는
                            '테크 솔루션 & 브랜드 랩'입니다. 비즈니스의 본질을 꿰뚫는
                            아키텍처와 사용자 중심의 인터페이스를 통해 새로운 연결의 가치를 창조합니다.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-16"
                >
                    <a
                        href="#services"
                        className="group relative inline-flex items-center gap-4 text-sm font-black uppercase tracking-widest"
                    >
                        <span className="w-12 h-[1px] bg-white group-hover:w-24 transition-all duration-500" />
                        Explore Services
                    </a>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 2, delay: 1.2 }}
                className="absolute bottom-10 left-12 flex items-center gap-4"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 [writing-mode:vertical-lr]">Scroll</p>
            </motion.div>
        </section>
    );
}
