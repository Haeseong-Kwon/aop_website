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
    /** 레퍼런스를 따라 기본은 중앙 정렬. */
    align?: "left" | "center";
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    className,
    align = "center",
}: SectionHeadingProps) {
    const centered = align === "center";
    const eyebrowEnter = useEnter({ y: 8, duration: DUR.base });
    const descriptionEnter = useEnter({ y: 14, delay: 0.2, duration: DUR.slow });

    return (
        <div className={cn("max-w-3xl", centered && "mx-auto text-center", className)}>
            <motion.p {...eyebrowEnter} className="type-eyebrow">
                {eyebrow}
            </motion.p>

            <MaskedText
                as="h2"
                text={title}
                trigger="inView"
                delay={0.08}
                className="type-h2 mt-6"
            />

            {description ? (
                <motion.p
                    {...descriptionEnter}
                    className={cn(
                        "type-body mt-7 max-w-2xl text-muted",
                        centered && "mx-auto"
                    )}
                >
                    {description}
                </motion.p>
            ) : null}
        </div>
    );
}
