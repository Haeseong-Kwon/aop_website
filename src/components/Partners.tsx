import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { PARTNERS, SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Partners() {
    return (
        <section id="partners" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.partners} />

                <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {PARTNERS.map((partner, index) => (
                        <Reveal key={partner.id} delay={index * 0.07} y={18}>
                            {/* TODO: 로고 SVG 교체 — 현재는 워드마크 타이포그래피 */}
                            <SpotlightCard className="flex h-full flex-col p-7">
                                <span
                                    className={cn(
                                        "badge self-start",
                                        partner.relation === "계열"
                                            ? "border-transparent bg-surface-2 text-bright"
                                            : "border-border text-muted"
                                    )}
                                >
                                    {partner.relation}
                                </span>

                                <p className="mt-10 font-mono text-xl tracking-[-0.02em]">
                                    {partner.nameEn}
                                </p>
                                <p className="mt-1.5 text-sm text-faint">{partner.name}</p>
                                <p className="mt-5 text-sm leading-relaxed text-muted">
                                    {partner.description}
                                </p>
                            </SpotlightCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
