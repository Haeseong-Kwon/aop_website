"use client";

import { motion } from "framer-motion";
import { PORTFOLIO } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";

export function Portfolio() {
    return (
        <section id="portfolio" className="py-20 md:py-28 px-6 md:px-10 bg-black text-white noise">
            <div className="max-w-[120rem] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 border-b border-white/10 pb-8 md:pb-10">
                    <div className="max-w-2xl">
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-neutral-500 mb-4 font-black">The Craft</p>
                        <h3 className="text-5xl md:text-8xl leading-[0.82] mb-5 tracking-[-0.03em]">
                            Selected<br />Works
                        </h3>
                    </div>
                    <div className="md:max-w-xs">
                        <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                            기술적 복잡성과 프리미엄 디자인이 만나는 지점에서 탄생한
                            AOP의 주요 프로젝트들을 소개합니다.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
                    {PORTFOLIO.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="group relative bg-black p-8 md:p-12 h-[380px] md:h-[480px] flex flex-col justify-between overflow-hidden cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-700" />

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="max-w-md">
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#0052FF] mb-4 block">
                                        {project.category}
                                    </span>
                                    <h4 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight group-hover:tracking-tighter transition-all duration-700">
                                        {project.title}
                                    </h4>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                                    <ArrowUpRight size={18} strokeWidth={1.5} />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-neutral-400 max-w-sm text-sm md:text-[15px] leading-relaxed mb-5 opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-700">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {project.tech.map((t) => (
                                        <span key={t} className="text-[10px] font-black uppercase tracking-widest border border-white/10 px-3 py-1 text-neutral-500 group-hover:border-white/30 group-hover:text-white transition-colors">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Background Number or Identifier for Cheil Style */}
                            <span className="absolute -bottom-7 -right-7 text-[10rem] md:text-[12rem] font-black text-white/[0.03] pointer-events-none group-hover:text-white/[0.06] transition-colors duration-700">
                                0{index + 1}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
