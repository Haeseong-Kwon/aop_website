"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { useEnterChild, useEnterList } from "@/hooks/useEnter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { STAGGER } from "@/lib/motion";
import { LEADER, SECTIONS } from "@/lib/constants";

function FounderCard() {
    return (
        <div className="light-panel flex h-full flex-col p-7 md:p-9">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-glow">{LEADER.title}</p>
            <p className="mt-5 text-[clamp(2.5rem,4.4vw,3.5rem)] font-semibold leading-none tracking-[-0.05em] text-bright">
                {LEADER.name}
            </p>
            <p className="mt-4 text-[14px] text-muted">{LEADER.role}</p>

            <span className="my-7 block h-px w-full bg-[linear-gradient(90deg,var(--color-beam),transparent)]" />

            <dl className="space-y-5">
                {LEADER.profile.map((item) => (
                    <div key={item.label} className="grid grid-cols-[3rem_1fr] gap-3">
                        <dt className="pt-0.5 text-[13px] font-medium text-glow">{item.label}</dt>
                        <dd>
                            <p className="text-[15px] font-medium text-bright">{item.value}</p>
                            <p className="mt-1 text-[13px] text-faint">{item.note}</p>
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function Roles() {
    const list = useEnterList(STAGGER.base);
    const item = useEnterChild({ y: 12 });

    return (
        <div>
            <p className="type-eyebrow">Roles</p>
            <motion.ul {...list} className="mt-5 space-y-2.5">
                {LEADER.roles.map((role) => (
                    <motion.li
                        key={role.en}
                        {...item}
                        className="surface-card group flex items-center justify-between gap-4 px-5 py-4"
                    >
                        <span>
                            <span className="block text-[15px] font-medium text-bright">{role.company}</span>
                            <span className="font-mono text-[11px] tracking-[0.12em] text-faint">{role.en}</span>
                        </span>
                        <span className="shrink-0 rounded-full border border-beam/40 bg-beam/10 px-3 py-1 text-[12px] font-medium text-glow transition-colors duration-500 group-hover:border-glow/60">
                            {role.role}
                        </span>
                    </motion.li>
                ))}
            </motion.ul>
        </div>
    );
}

/**
 * 수상·선정 타임라인. 세로 레일이 스크롤을 따라 위에서 아래로 차오른다 —
 * 연도가 위에서부터 '쌓인' 기록이라는 걸 선 하나로 말한다.
 */
function Awards() {
    const ref = useRef<HTMLDivElement>(null);
    const prefersReduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
    const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
    const list = useEnterList(STAGGER.tight);
    const item = useEnterChild({ y: 10 });

    return (
        <div>
            <p className="type-eyebrow">Awards &amp; selections</p>
            <div ref={ref} className="relative mt-5 pl-7">
                <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-border" />
                <motion.span
                    aria-hidden
                    style={{ scaleY: prefersReduced ? 1 : fill }}
                    className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-[linear-gradient(to_bottom,var(--color-glow),var(--color-beam))]"
                />

                <motion.ol {...list} className="space-y-4">
                    {LEADER.awards.map((award) => (
                        <motion.li key={award.title} {...item} className="relative grid grid-cols-[3rem_1fr] gap-3">
                            <span
                                aria-hidden
                                className="absolute -left-7 top-[0.4rem] size-[11px] rounded-full border border-beam bg-bg shadow-[0_0_0_3px_rgba(74,140,255,0.12)]"
                            />
                            <span className="font-mono text-[13px] font-medium text-glow">{award.year}</span>
                            <span className="text-[14.5px] leading-snug text-text">{award.title}</span>
                        </motion.li>
                    ))}
                </motion.ol>
            </div>
        </div>
    );
}

export function Leadership() {
    return (
        <section id="leadership" className="relative pb-[clamp(6rem,12vw,12rem)]">
            <div className="container-x">
                <SectionHeading {...SECTIONS.leadership} />

                <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
                    <Reveal y={18} blur className="h-full">
                        <FounderCard />
                    </Reveal>
                    <Roles />
                    <Awards />
                </div>
            </div>
        </section>
    );
}
