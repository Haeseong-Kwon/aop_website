import { Reveal } from "@/components/motion/Reveal";
import { CapabilityCard } from "@/components/CapabilityCard";
import { SectionHeading } from "@/components/SectionHeading";
import { STAGGER } from "@/lib/motion";
import { CAPABILITIES, SECTIONS } from "@/lib/constants";

export function Capability() {
    return (
        <section id="capability" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.capability} />

                <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {CAPABILITIES.map((capability, index) => (
                        <Reveal
                            key={capability.id}
                            delay={index * STAGGER.base}
                            y={18}
                            className="h-full"
                        >
                            <CapabilityCard capability={capability} index={index} />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
