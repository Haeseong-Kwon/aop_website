import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { PARTNERS } from "@/lib/constants";

export function Partners() {
    return (
        <section id="partners" className="section-y relative">
            <div className="container-x">
                <SectionHeading
                    eyebrow="PARTNERS"
                    title="함께 만드는 조직"
                    description="계열사와 파트너사가 각자의 도메인에서 에이전트를 실제 업무에 붙이고, 그 과정에서 나온 요구가 다시 원천기술로 돌아옵니다."
                />

                <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {PARTNERS.map((partner, index) => (
                        <Reveal key={partner.id} delay={index * 0.08} y={16}>
                            {/* TODO: 로고 SVG 교체 — 현재는 워드마크 타이포그래피 */}
                            <SpotlightCard className="flex h-full flex-col justify-between p-8">
                                <span className="type-eyebrow">{partner.relation}</span>
                                <div className="mt-12">
                                    <p className="font-mono text-2xl tracking-[-0.02em]">
                                        {partner.nameEn}
                                    </p>
                                    <p className="mt-2 text-sm text-muted">{partner.name}</p>
                                    <p className="mt-5 text-sm leading-relaxed text-muted">
                                        {partner.description}
                                    </p>
                                </div>
                            </SpotlightCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
