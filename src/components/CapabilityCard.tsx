"use client";

import { motion } from "framer-motion";
import { Activity, Layers, ShieldCheck, Workflow } from "lucide-react";
import {
    CapabilityDiagram,
    type CapabilityDiagramId,
} from "@/components/visual/CapabilityDiagram";
import { useFinePointer } from "@/hooks/useReducedMotion";
import type { Capability } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * 아이콘 매핑이 여기 있는 이유: 서버 컴포넌트에서 클라이언트 컴포넌트로 컴포넌트
 * 함수를 prop으로 넘길 수 없다(RSC 직렬화 경계). id만 넘기고 선택은 이쪽에서 한다.
 */
const ICONS = {
    orchestration: Workflow,
    "durable-execution": ShieldCheck,
    "context-engineering": Layers,
    evaluation: Activity,
} as const;

interface CapabilityCardProps {
    capability: Capability;
    index: number;
}

/**
 * 카드는 border와 배경만 바뀐다 — translate/scale을 걸면 4장 그리드가 출렁인다.
 * 움직이는 건 안쪽 다이어그램뿐이다.
 */
export function CapabilityCard({ capability, index }: CapabilityCardProps) {
    const Icon = ICONS[capability.id as keyof typeof ICONS];

    /*
     * hover가 없는 기기에서는 다이어그램이 영원히 흐린 채로 남는다.
     * 터치에서는 뷰포트 진입을 hover 대신 쓴다.
     */
    const isFine = useFinePointer();

    const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    return (
        <motion.div
            onMouseMove={handleMove}
            initial="rest"
            whileHover={isFine ? "active" : undefined}
            whileInView={isFine ? undefined : "active"}
            viewport={{ once: true, amount: 0.4 }}
            className={cn(
                "surface-card spotlight group relative flex h-full flex-col overflow-hidden p-7 md:p-9"
            )}
        >
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

            {/* 다이어그램은 본문 아래에 놓아 읽기 흐름을 끊지 않는다 */}
            <div className="mt-8 flex flex-1 items-end pt-2">
                <CapabilityDiagram id={capability.id as CapabilityDiagramId} />
            </div>
        </motion.div>
    );
}
