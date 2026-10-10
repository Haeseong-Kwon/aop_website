"use client";

import { motion } from "framer-motion";
import { MaskedText } from "@/components/motion/MaskedText";
import { useEnter } from "@/hooks/useEnter";
import { DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    description?: string;
    className?: string;
    /**
     * split: 넓은 화면에서 제목은 왼쪽, 설명은 오른쪽 아래에 붙는다 — 기본값.
     * 모든 섹션이 가운데 정렬이면 페이지가 같은 박자로만 흐른다. 비대칭 2열이
     * 섹션마다 시선이 출발하는 자리를 왼쪽 축 하나로 고정해 준다.
     * stack: 좁은 열 안에 놓일 때(문의 섹션 등) 위아래로 쌓는다.
     */
    layout?: "split" | "stack";
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    className,
    layout = "split",
}: SectionHeadingProps) {
    const isSplit = layout === "split";
    const labelEnter = useEnter({ y: 8, duration: DUR.base });
    const descriptionEnter = useEnter({ y: 12, delay: 0.18, duration: DUR.slow });

    return (
        <div
            className={cn(
                isSplit &&
                    "grid gap-x-16 gap-y-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end",
                className
            )}
        >
            <div>
                <motion.p {...labelEnter} className="section-label">
                    {eyebrow}
                </motion.p>

                <MaskedText
                    as="h2"
                    text={title}
                    trigger="inView"
                    delay={0.06}
                    className="type-h2 mt-6 max-w-[20ch]"
                />
            </div>

            {description ? (
                <motion.p
                    {...descriptionEnter}
                    className={cn(
                        "type-body max-w-[34rem] text-muted",
                        isSplit ? "lg:pb-2" : "mt-7"
                    )}
                >
                    {description}
                </motion.p>
            ) : null}
        </div>
    );
}
