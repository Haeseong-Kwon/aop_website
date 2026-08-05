import { Activity, Layers, ShieldCheck, Workflow } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { SectionHeading } from "@/components/SectionHeading";
import { STAGGER } from "@/lib/motion";
import { CAPABILITIES, SECTIONS } from "@/lib/constants";

const ICONS = {
    orchestration: Workflow,
    "durable-execution": ShieldCheck,
    "context-engineering": Layers,
    evaluation: Activity,
} as const;

export function Capability() {
    return (
        <section id="capability" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.capability} />

                <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {CAPABILITIES.map((capability, index) => {
                        const Icon = ICONS[capability.id as keyof typeof ICONS];

                        return (
                            <Reveal
                                key={capability.id}
                                delay={index * STAGGER.base}
                                y={18}
                            >
                                <SpotlightCard className="group h-full p-7 md:p-9">
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="grid size-10 place-items-center rounded-xl border border-border bg-surface-2 text-bright transition-colors duration-500 group-hover:border-bright/30">
                                            <Icon size={17} strokeWidth={1.75} />
                                        </span>
                                        <span className="font-mono text-[11px] tracking-[0.14em] text-faint">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                    </div>

                                    <p className="type-eyebrow mt-7">{capability.subtitle}</p>
                                    <h3 className="type-h3 mt-2">{capability.title}</h3>
                                    <p className="mt-4 text-[15px] leading-relaxed text-muted">
                                        {capability.description}
                                    </p>
                                </SpotlightCard>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
