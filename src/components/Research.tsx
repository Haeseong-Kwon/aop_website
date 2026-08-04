"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { Reveal } from "@/components/motion/Reveal";
import { PATENTS, RESEARCH } from "@/lib/constants";

export function Research() {
    return (
        <section id="research" className="section-y relative">
            <div className="container-x">
                <SectionHeading
                    eyebrow="RESEARCH & IP"
                    title="연구 트랙"
                    description="제품에 바로 들어가지 않는 문제도 다룹니다. 생성 설계, 과학 계산, 관측 가능성 — 각 트랙은 제품의 다음 기능이 되거나 논문·특허로 남습니다."
                />

                <div className="mt-16 grid gap-5 md:grid-cols-2">
                    {RESEARCH.map((track, index) => (
                        <motion.div
                            key={track.title}
                            initial={{ opacity: 0, y: 24, rotate: -1 }}
                            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                            viewport={{ once: true, margin: "-15%" }}
                            transition={{
                                duration: 0.7,
                                delay: index * 0.08,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <SpotlightCard className="flex h-full flex-col p-8 md:p-10">
                                <span className="type-eyebrow text-accent">
                                    {track.category}
                                </span>
                                <h3 className="type-h3 mt-5">{track.title}</h3>
                                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-muted">
                                    {track.description}
                                </p>
                                <div className="mt-8 flex flex-wrap gap-2">
                                    {track.tech.map((tech) => (
                                        <span
                                            key={tech}
                                            className="rounded-full border border-border px-3 py-1 font-mono text-[11px] tracking-wide text-muted"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>

                <Reveal className="mt-5 rounded-xl border border-border p-8 md:p-10">
                    <p className="type-eyebrow">Patents Filed</p>
                    <ul className="mt-6 divide-y divide-border">
                        {PATENTS.map((patent) => (
                            <li
                                key={patent.number}
                                className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                            >
                                <span className="text-[15px]">{patent.title}</span>
                                <span className="font-mono text-[13px] text-muted">
                                    {patent.number}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </div>
        </section>
    );
}
