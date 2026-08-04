"use client";

import { motion } from "framer-motion";
import { MaskedText } from "@/components/motion/MaskedText";
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

    return (
        <div className={cn("max-w-3xl", centered && "mx-auto text-center", className)}>
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.6 }}
                className="type-eyebrow"
            >
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
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-12%" }}
                    transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
