import type { ComponentType } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { GuardionConsole } from "@/components/references/GuardionConsole";
import { PotentialFunnel } from "@/components/references/PotentialFunnel";
import { PromoConsole } from "@/components/references/PromoConsole";
import { SnapsnapFlow } from "@/components/references/SnapsnapFlow";
import { STAGGER } from "@/lib/motion";
import { SECTIONS } from "@/lib/constants";
import { FEATURED_REFERENCE, REFERENCES, type Reference, type ReferenceGraphic } from "@/lib/references";

/** 공공 실증 납품은 화면 하나를 통째로 쓴다 — 레퍼런스 중 유일하게 현장 장비와 붙는 일이라서다. */
function FeaturedCase() {
    const ref = FEATURED_REFERENCE;

    return (
        <Reveal y={18} blur className="light-panel mt-16 p-5 md:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-12">
                <div>
                    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-glow">
                        <span>Case 01</span>
                        <span className="h-px w-8 bg-glow/40" />
                        <span>Public pilot</span>
                    </p>

                    <p className="mt-6 text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-none tracking-[-0.05em] text-bright">
                        {ref.name}
                    </p>
                    <p className="mt-3 text-[17px] font-medium text-text">{ref.title}</p>
                    <p className="type-body mt-5 max-w-[32rem] text-muted">{ref.summary}</p>

                    <ul className="mt-7 flex flex-wrap gap-2">
                        {ref.results.map((result) => (
                            <li
                                key={result}
                                className="rounded-full border border-beam/40 bg-beam/10 px-3 py-1 text-[12.5px] font-medium text-glow"
                            >
                                {result}
                            </li>
                        ))}
                    </ul>

                    <dl className="mt-8 border-t border-border">
                        {ref.facts.map((fact) => (
                            <div key={fact.label} className="grid grid-cols-[3.5rem_1fr] gap-3 border-b border-border py-3.5">
                                <dt className="text-[13px] font-medium text-glow">{fact.label}</dt>
                                <dd className="text-[14px] text-text">{fact.value}</dd>
                            </div>
                        ))}
                    </dl>

                    <p className="mt-5 font-mono text-[11px] tracking-[0.12em] text-faint">{ref.stack.join(" · ")}</p>
                </div>

                <div>
                    <GuardionConsole />
                    <p className="mt-3 text-[12px] text-faint">
                        납품한 관제 시스템의 화면 구성을 웹 그래픽으로 재현한 화면입니다. 표시 수치는 실데이터가 아닙니다.
                    </p>
                </div>
            </div>
        </Reveal>
    );
}

const GRAPHICS: Record<ReferenceGraphic, ComponentType> = {
    promo: PromoConsole,
    snapsnap: SnapsnapFlow,
    potential: PotentialFunnel,
};

function GraphicScene({ graphic }: { graphic: ReferenceGraphic }) {
    const Scene = GRAPHICS[graphic];
    return <Scene />;
}

/** 카드 상단 창 — 캡처는 공개 화면, 그래픽은 비공개 시스템을 재현한 화면이다 */
function MediaWindow({ item }: { item: Reference }) {
    const { media } = item;
    const isCapture = media.kind === "capture";

    return (
        <div className="relative m-2.5 mb-0 overflow-hidden rounded-[14px] border border-white/[0.08] bg-surface">
            <div className="flex items-center gap-1.5 border-b border-white/[0.08] bg-black/50 px-3 py-2">
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="ml-2 truncate font-mono text-[10.5px] text-faint">
                    {isCapture ? new URL(media.url).host : media.label}
                </span>
                {isCapture ? null : (
                    <span className="ml-auto shrink-0 font-mono text-[9.5px] tracking-[0.14em] text-glow/70">REPLICA</span>
                )}
            </div>
            <div className="relative aspect-[16/10] overflow-hidden">
                {media.kind === "graphic" ? (
                    <GraphicScene graphic={media.graphic} />
                ) : (
                    <>
                        <Image
                            src={media.image}
                            alt={`${item.client} ${item.title} 화면`}
                            fill
                            sizes="(max-width: 768px) 100vw, 560px"
                            className="object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                        />
                        {/* 화면 하단을 카드 표면으로 녹여 캡처의 흰 배경이 튀지 않게 한다 */}
                        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                    </>
                )}
            </div>
        </div>
    );
}

function ReferenceCard({ item, index }: { item: Reference; index: number }) {
    const number = String(index + 2).padStart(2, "0");
    const url = item.media.kind === "capture" ? item.media.url : null;

    const body = (
        <>
            <MediaWindow item={item} />

            <div className="flex flex-1 flex-col p-6 md:p-7">
                <p className="flex items-center justify-between font-mono text-[11px] tracking-[0.16em] text-faint">
                    <span className="text-glow">{number}</span>
                    <span>{item.year}</span>
                </p>
                <p className="mt-4 text-[13px] text-muted">
                    {item.client}
                    <span className="text-faint"> · {item.sector}</span>
                </p>
                <p className="mt-1.5 text-[clamp(1.25rem,1.8vw,1.5rem)] font-semibold leading-snug tracking-[-0.03em] text-bright">
                    {item.title}
                </p>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted">{item.summary}</p>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="font-mono text-[11px] tracking-[0.1em] text-faint">{item.stack.join(" · ")}</span>
                    {url ? (
                        <span className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-text transition-colors group-hover:text-bright">
                            사이트 보기
                            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                    ) : (
                        <span className="shrink-0 text-[12.5px] text-faint">비공개 시스템 · 화면 재현</span>
                    )}
                </div>
            </div>
        </>
    );

    const className = "surface-card group relative flex h-full flex-col overflow-hidden";

    return (
        <Reveal delay={(index % 2) * STAGGER.base} y={14} className="h-full">
            {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
                    {body}
                </a>
            ) : (
                <article className={className}>{body}</article>
            )}
        </Reveal>
    );
}

export function References() {
    return (
        <section id="references" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.references} />

                <FeaturedCase />

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {REFERENCES.map((item, index) => (
                        <ReferenceCard key={item.id} item={item} index={index} />
                    ))}
                </div>

                <p className="mt-5 text-[13px] text-faint">
                    공개된 결과물은 URL을 캡처했고, 공개 화면이 없는 앱·관리자 시스템은 화면 구성을 그래픽으로 재현했습니다(REPLICA 표시,
                    수치는 실데이터가 아님). 자체 제품과 협력사 플랫폼은 Products 섹션에 따로 정리했습니다.
                </p>
            </div>
        </section>
    );
}
