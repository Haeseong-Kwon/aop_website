"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { Reveal } from "@/components/motion/Reveal";
import { PATENTS, RESEARCH, SECTIONS } from "@/lib/constants";

export function Research() {
    return (
        <section id="research" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.research} />

                <div className="mt-14 grid gap-4 md:grid-cols-2">
                    {RESEARCH.map((track, index) => (
                        <motion.div
                            key={track.title}
                            initial={{ opacity: 0, y: 26, rotate: -0.8 }}
                            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                            viewport={{ once: true, margin: "-15%" }}
                            transition={{
                                duration: 0.75,
                                delay: index * 0.07,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <SpotlightCard className="flex h-full flex-col p-7 md:p-9">
                                <span className="type-eyebrow text-bright">
                                    {track.category}
                                </span>
                                <h3 className="type-h3 mt-4">{track.title}</h3>
                                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-muted">
                                    {track.description}
                                </p>
                                <div className="mt-7 flex flex-wrap gap-2">
                                    {track.tech.map((tech) => (
                                        <span
                                            key={tech}
                                            className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>

                <Reveal className="surface-card mt-4 p-7 md:p-9">
                    <p className="type-eyebrow">출원 특허</p>
                    <ul className="mt-5 divide-y divide-border">
                        {PATENTS.map((patent) => (
                            <li
                                key={patent.number}
                                className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                            >
                                <span className="flex items-center gap-3 text-[15px]">
                                    <FileText size={15} className="shrink-0 text-faint" />
                                    {patent.title}
                                </span>
                                <span className="pl-[27px] font-mono text-[13px] text-muted sm:pl-0">
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
