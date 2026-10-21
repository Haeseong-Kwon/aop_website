"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { useTransition } from "@/hooks/useEnter";
import { DUR, EASE, VIEWPORT } from "@/lib/motion";
import { MATURITY_STAGES, PORTFOLIO, SECTIONS, type PortfolioItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STAGES = MATURITY_STAGES.length;
/** 아직 도달한 제품이 없는 마지막 단계 — 점선 상자로 '다음 목표'임을 표시한다. */
const TARGET_STAGE = STAGES - 1;
const LIVE_STAGE = 4;

const GROUPS: { id: PortfolioItem["group"]; label: string }[] = [
    { id: "own", label: "AOP 자체 제품" },
    { id: "partner", label: "협력·관계사 플랫폼" },
];

/** 단계 칸의 가운데 x(%). 트랙의 점과 머리글이 같은 식을 써야 줄이 맞는다. */
const stageX = (stage: number) => ((stage + 0.5) / STAGES) * 100;

function StageHeader() {
    return (
        <div className="relative hidden grid-cols-6 md:grid">
            {MATURITY_STAGES.map((stage, index) => (
                <div key={stage} className="text-center">
                    <p className="font-mono text-[11px] tracking-[0.16em] text-glow">
                        {String(index + 1).padStart(2, "0")}
                        {index === TARGET_STAGE ? " · NEXT" : ""}
                    </p>
                    <p className="mt-1.5 text-[13px] font-medium text-text">{stage}</p>
                </div>
            ))}
        </div>
    );
}

/** 한 제품의 진행선. 화면에 들어오면 기획 칸에서 현재 단계까지 빔이 그어진다. */
function Track({ item, order }: { item: PortfolioItem; order: number }) {
    const delay = 0.15 + order * 0.045;
    const draw = useTransition({ duration: DUR.hero, delay, ease: EASE.out });
    const pop = useTransition({ duration: DUR.base, delay: delay + DUR.hero * 0.75, ease: EASE.out });
    const start = stageX(0);
    const end = stageX(item.stage);
    const isLive = item.stage >= LIVE_STAGE;

    return (
        <div className="relative h-6">
            {/* 레일과 단계 눈금 */}
            <span
                className="absolute top-1/2 h-px -translate-y-1/2 bg-white/12"
                style={{ left: `${start}%`, right: `${100 - stageX(TARGET_STAGE)}%` }}
            />
            {MATURITY_STAGES.map((stage, index) => (
                <span
                    key={stage}
                    className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25"
                    style={{ left: `${stageX(index)}%` }}
                />
            ))}

            {/* 진행 빔 */}
            <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={VIEWPORT}
                transition={draw}
                className="absolute top-1/2 h-[2px] origin-left -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,var(--color-beam-deep),var(--color-beam)_40%,var(--color-glow))]"
                style={{ left: `${start}%`, width: `${end - start}%` }}
            />

            {/* 현재 단계 노드 */}
            <motion.span
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={VIEWPORT}
                transition={pop}
                className="absolute top-1/2 -ml-[9px] -mt-[9px] size-[18px]"
                style={{ left: `${end}%` }}
            >
                {isLive ? (
                    <span className="absolute inset-0 rounded-full bg-beam/50 motion-safe:animate-ping" />
                ) : null}
                <span
                    className={cn(
                        "absolute inset-0 rounded-full border-2 border-beam shadow-[0_0_18px_rgba(74,140,255,0.55)]",
                        isLive ? "bg-beam" : "bg-bg"
                    )}
                />
            </motion.span>
        </div>
    );
}

function Row({ item, order }: { item: PortfolioItem; order: number }) {
    return (
        <li className="group grid items-center gap-x-6 gap-y-2 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-white/[0.04] md:grid-cols-[14rem_minmax(0,1fr)]">
            <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-bright">{item.name}</span>
                <span className="text-[13px] text-faint">
                    {item.operator ? `${item.operator} · ` : ""}
                    {item.domain}
                </span>
                {/* 좁은 화면에서는 머리글이 없으니 단계 이름을 이름 옆에 붙인다 */}
                <span className="ml-auto text-[12px] font-medium text-glow md:hidden">
                    {MATURITY_STAGES[item.stage]}
                </span>
            </p>
            <Track item={item} order={order} />
        </li>
    );
}

export function Portfolio() {
    return (
        <section id="portfolio" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.portfolio} />

                <Reveal y={18} className="surface-card relative mt-14 overflow-hidden p-4 md:p-8">
                    {/* 다음 목표 칸 — 비어 있는 것 자체가 메시지다. 행과 같은 격자에 얹어 줄을 맞춘다 */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-8 inset-y-5 hidden grid-cols-[14rem_minmax(0,1fr)] gap-x-6 px-3 md:grid"
                    >
                        <span />
                        <span className="relative">
                            <span
                                className="absolute inset-y-0 rounded-2xl border border-dashed border-beam/40 bg-beam/[0.06]"
                                style={{ left: `${(TARGET_STAGE / STAGES) * 100}%`, width: `${100 / STAGES}%` }}
                            />
                        </span>
                    </div>

                    <div className="relative md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-6 md:px-3">
                        <span />
                        <StageHeader />
                    </div>

                    {GROUPS.map((group) => (
                        <div key={group.id} className="relative mt-6 first-of-type:mt-8">
                            <p className="border-b border-border px-3 pb-2.5 text-[13px] font-semibold text-glow">
                                {group.label}
                            </p>
                            <ul className="mt-2">
                                {PORTFOLIO.filter((item) => item.group === group.id).map((item) => (
                                    <Row key={item.name} item={item} order={PORTFOLIO.indexOf(item)} />
                                ))}
                            </ul>
                        </div>
                    ))}
                </Reveal>

                <p className="mt-5 text-[13px] text-faint">
                    단계 기준: 공개 운영(공개 URL에서 운영) · 공개 배포(공개 URL 배포) · MVP(핵심 흐름이 코드·테스트로
                    동작) · 프로토타입(실데이터 경로 미실행) · 기획(코드 없음)
                </p>
            </div>
        </section>
    );
}
