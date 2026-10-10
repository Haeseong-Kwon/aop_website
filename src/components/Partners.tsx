import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { STAGGER } from "@/lib/motion";
import { PARTNERS, SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * 파트너는 카드 격자가 아니라 명부로 읽힌다 — 워드마크가 행의 주인공이고,
 * 관계와 분야는 같은 행 오른쪽에 조용히 붙는다. 넷뿐이라 크게 써도 넘치지 않는다.
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
                            <div className="grid items-baseline gap-x-8 gap-y-2 py-7 grid-cols-[minmax(0,1fr)_3.5rem] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_3.5rem] md:py-9">
                                {/* TODO: 로고 SVG 교체 — 현재는 워드마크 타이포그래피 */}
                                <p className="text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-none tracking-[-0.045em] text-bright/60 transition-colors duration-500 group-hover:text-bright">
                                    {partner.nameEn}
                                </p>

                                <p className="text-[15px] leading-relaxed text-muted">
                                    {partner.name}
                                    <span className="block text-faint">{partner.description}</span>
                                </p>

                                <span
                                    className={cn(
                                        "col-start-2 row-start-1 text-right text-[13px] md:col-start-3",
                                        partner.relation === "계열" ? "text-bright" : "text-faint"
                                    )}
                                >
                                    {partner.relation}
                                </span>
                            </div>

                            {/* hover 시 행 아래 선이 빔으로 채워진다 — 명부에서 지금 읽는 줄 */}
                            <span
                                aria-hidden
                                className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-[linear-gradient(90deg,var(--color-glow),var(--color-beam)_60%,transparent)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                            />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
