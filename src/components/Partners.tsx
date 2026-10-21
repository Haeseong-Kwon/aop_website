import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { STAGGER } from "@/lib/motion";
import { PARTNERS, SECTIONS } from "@/lib/constants";

/**
 * 파트너는 카드 격자가 아니라 명부로 읽힌다 — 워드마크가 행의 주인공이고,
 * 함께 만드는 것과 참여 방식은 같은 행 오른쪽에 조용히 붙는다.
 */
export function Partners() {
    return (
        <section id="partners" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.partners} />

                <div role="list" className="mt-16 border-t border-border">
                    {PARTNERS.map((partner, index) => (
                        <Reveal
                            key={partner.id}
                            delay={index * STAGGER.base}
                            y={12}
                            role="listitem"
                            className="group relative border-b border-border"
                        >
                            <div className="grid items-baseline gap-x-8 gap-y-3 py-7 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.95fr)] md:py-9">
                                {/* TODO: 로고 SVG 교체 — 현재는 워드마크 타이포그래피 */}
                                <p className="text-[clamp(1.75rem,3.6vw,3rem)] font-semibold leading-none tracking-[-0.045em] text-bright/60 transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:text-bright">
                                    {partner.nameEn}
                                </p>

                                <p className="text-[15px] leading-relaxed text-muted">
                                    {/* 워드마크와 법인명이 같으면 한 번만 쓴다 */}
                                    {partner.name === partner.nameEn ? null : partner.name}
                                    <span className="block text-faint">{partner.description}</span>
                                </p>

                                <p className="flex flex-wrap items-center gap-2 md:justify-end">
                                    <span className="text-[13.5px] font-medium text-text">{partner.project}</span>
                                    <span className="rounded-full border border-beam/40 bg-beam/10 px-2.5 py-0.5 text-[12px] text-glow">
                                        {partner.relation}
                                    </span>
                                </p>
                            </div>

                            {/* hover 시 행 아래 선이 빔으로 채워진다 — 명부에서 지금 읽는 줄 */}
                            <span
                                aria-hidden
                                className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-[linear-gradient(90deg,var(--color-glow),var(--color-beam)_60%,transparent)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                            />
                        </Reveal>
                    ))}
                </div>

                <p className="mt-5 text-[13px] text-faint">
                    표기는 협력 관계와 대표의 참여 방식이며, 지분·지배 관계를 뜻하지 않습니다.
                </p>
            </div>
        </section>
    );
}
