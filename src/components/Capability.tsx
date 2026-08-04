import { Reveal } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { SectionHeading } from "@/components/SectionHeading";
import { CAPABILITIES } from "@/lib/constants";

export function Capability() {
    return (
        <section id="capability" className="section-y relative">
            <div className="container-x">
                <SectionHeading
                    eyebrow="CORE CAPABILITY"
                    title="원천기술 4축"
                    description="에이전트를 제품으로 운영하려면 모델 위에 제어 계층이 필요합니다. AOP는 그 계층을 네 갈래로 나눠 연구하고, 자사 제품에 먼저 적용합니다."
                />

                <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
                    {CAPABILITIES.map((capability, index) => (
                        <Reveal key={capability.id} delay={index * 0.08} y={16}>
                            <SpotlightCard className="h-full rounded-none border-0 p-8 md:p-12">
                                <span className="type-eyebrow">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <h3 className="type-h3 mt-6">{capability.title}</h3>
                                <p className="type-body mt-4 text-muted">
                                    {capability.description}
                                </p>
                            </SpotlightCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
