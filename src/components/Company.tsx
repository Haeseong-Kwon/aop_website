"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { useEnterChild, useEnterList, useTransition } from "@/hooks/useEnter";
import { EASE, STAGGER, VIEWPORT } from "@/lib/motion";
import { COMPANY_FACTS, COMPANY_PILLARS, SECTIONS, SITE, type CompanyPillar } from "@/lib/constants";

/** 회사 기본 정보 — 행이 위에서부터 차례로 들어오고, 구분선은 왼쪽에서 그어진다. */
function FactSheet() {
    const list = useEnterList(STAGGER.base);
    const row = useEnterChild({ y: 10 });
    const rule = useTransition({ duration: 0.9, ease: EASE.out });

    return (
        <div className="light-panel flex h-full flex-col p-7 md:p-9">
            <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-glow">Company facts</p>
                <p className="font-mono text-[17px] font-medium tracking-[-0.02em] text-bright">{SITE.name}</p>
            </div>

            <motion.dl {...list} className="mt-8 flex-1">
                {COMPANY_FACTS.map((fact) => (
                    <motion.div key={fact.label} {...row} className="relative grid grid-cols-[6.5rem_1fr] gap-4 py-4">
                        <dt className="text-[13px] text-faint">{fact.label}</dt>
                        <dd className="text-[15px] font-medium tracking-[-0.01em] text-bright">{fact.value}</dd>
                        <motion.span
                            aria-hidden
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={VIEWPORT}
                            transition={rule}
                            className="absolute inset-x-0 bottom-0 h-px origin-left bg-border"
                        />
                    </motion.div>
                ))}
            </motion.dl>

            <a href={`mailto:${SITE.email}`} className="underline-sweep mt-8 w-fit text-sm text-muted hover:text-bright">
                {SITE.email}
            </a>
        </div>
    );
}

/** 사업의 한 축. 숫자는 크게, 근거는 오른쪽 위에 작게 — 주장보다 근거가 먼저 보이도록. */
function PillarRow({ pillar }: { pillar: CompanyPillar }) {
    const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    return (
        <div
            onMouseMove={handleMove}
            className="surface-card spotlight group relative grid h-full grid-cols-[auto_1fr] gap-x-6 overflow-hidden p-6 md:gap-x-8 md:p-8"
        >
            <span className="font-mono text-[clamp(2rem,3.2vw,2.75rem)] font-light leading-none tracking-[-0.04em] text-white/20 transition-colors duration-500 group-hover:text-glow">
                {pillar.index}
            </span>

            <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="type-h3">
                        {pillar.title}
                        <span className="ml-2.5 font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-faint">
                            {pillar.en}
                        </span>
                    </h3>
                    <span className="text-[12.5px] font-medium text-glow">{pillar.evidence}</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{pillar.description}</p>
            </div>

            {/* 세 축을 잇는 빔 — 호버한 축만 아래 경계가 빛난다 */}
            <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,var(--color-glow),var(--color-beam)_60%,transparent)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
            />
        </div>
    );
}

export function Company() {
    return (
        <section id="company" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.company} />

                <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <Reveal y={18} blur className="h-full">
                        <FactSheet />
                    </Reveal>

                    <div className="grid gap-4">
                        {COMPANY_PILLARS.map((pillar, index) => (
                            <Reveal key={pillar.index} y={14} delay={0.1 + index * STAGGER.loose} className="h-full">
                                <PillarRow pillar={pillar} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
