"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { APPROACH, SECTIONS } from "@/lib/constants";

/**
 * 세 단계가 순환한다는 것을 세로 레일과 순차 점등으로 보여준다.
 * 레일은 스크롤 진입에 맞춰 위에서 아래로 그려진다.
 */
export function Approach() {
    return (
        <section id="approach" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.approach} />

                <div className="relative mx-auto mt-20 max-w-3xl">
                    {/* 세로 레일 */}
                    <span
                        aria-hidden
                        className="absolute left-[7px] top-2 hidden h-full w-px bg-border sm:block"
                    >
                        <motion.span
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true, margin: "-20%" }}
                            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                            className="block h-full w-px origin-top bg-[linear-gradient(180deg,var(--color-glow),var(--color-beam)_45%,transparent)]"
                        />
                    </span>

                    <ol className="space-y-14">
                        {APPROACH.map((step, index) => (
                            <motion.li
                                key={step.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-18%" }}
                                transition={{
                                    duration: 0.75,
                                    delay: index * 0.14,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className="relative sm:pl-12"
                            >
                                <motion.span
                                    aria-hidden
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true, margin: "-18%" }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.2 + index * 0.14,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="absolute left-0 top-2 hidden size-[15px] place-items-center rounded-full border border-beam bg-bg sm:grid"
                                >
                                    <span className="size-[5px] rounded-full bg-beam" />
                                </motion.span>

                                <p className="font-mono text-[11px] tracking-[0.18em] text-faint">
                                    {String(index + 1).padStart(2, "0")}
                                </p>
                                <h3 className="type-h3 mt-3">{step.title}</h3>
                                <p className="type-body mt-4 text-muted">{step.description}</p>
                            </motion.li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
