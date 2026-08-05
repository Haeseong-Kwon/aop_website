"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { CopyableCode } from "@/components/CopyableCode";
import { Reveal } from "@/components/motion/Reveal";
import { useFinePointer } from "@/hooks/useReducedMotion";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { PATENTS, RESEARCH, SECTIONS, type ResearchTrack } from "@/lib/constants";

/**
 * 기술 스택 태그는 카드에 hover할 때 아래에서 순차로 올라온다.
 * hover가 없는 기기에서는 처음부터 보여야 하므로 뷰포트 진입을 트리거로 쓴다.
 */
function TechTags({ tech }: { tech: readonly string[] }) {
    const isFine = useFinePointer();

    return (
        <motion.div
            initial="rest"
            whileHover={isFine ? "active" : undefined}
            whileInView={isFine ? undefined : "active"}
            viewport={{ once: true, amount: 0.4 }}
            variants={{
                rest: {},
                active: { transition: { staggerChildren: STAGGER.tight } },
            }}
            className="mt-7 flex flex-wrap gap-2"
        >
            {tech.map((item) => (
                <motion.span
                    key={item}
                    variants={{
                        rest: { opacity: 0.45, y: 6 },
                        active: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: DUR.fast, ease: EASE.out }}
                    className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted"
                >
                    {item}
                </motion.span>
            ))}
        </motion.div>
    );
}

function TrackCard({ track }: { track: ResearchTrack }) {
    const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    return (
        <div
            onMouseMove={handleMove}
            className="surface-card spotlight group relative flex h-full flex-col overflow-hidden p-7 md:p-9"
        >
            <span className="type-eyebrow text-bright">{track.category}</span>
            <h3 className="type-h3 mt-4">{track.title}</h3>
            <p className="mt-4 flex-1 text-[15px] leading-relaxed text-muted">
                {track.description}
            </p>
            <TechTags tech={track.tech} />
        </div>
    );
}

export function Research() {
    return (
        <section id="research" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.research} />

                <div className="mt-14 grid gap-4 md:grid-cols-2">
                    {RESEARCH.map((track, index) => (
                        <Reveal
                            key={track.title}
                            y={18}
                            delay={index * STAGGER.base}
                            className="h-full"
                        >
                            <TrackCard track={track} />
                        </Reveal>
                    ))}
                </div>

                <Reveal className="surface-card mt-4 p-7 md:p-9">
                    <p className="type-eyebrow">출원 특허</p>
                    <ul className="mt-5 divide-y divide-border">
                        {PATENTS.map((patent) => (
                            <li
                                key={patent.number}
                                className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                            >
                                <span className="flex items-center gap-3 text-[15px]">
                                    <FileText size={15} className="shrink-0 text-faint" />
                                    {patent.title}
                                </span>
                                <span className="pl-[27px] sm:pl-0">
                                    <CopyableCode
                                        value={patent.number}
                                        label={patent.title}
                                    />
                                </span>
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </div>
        </section>
    );
}
