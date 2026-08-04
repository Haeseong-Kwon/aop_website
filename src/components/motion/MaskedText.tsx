"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MaskedTextProps {
    text: string;
    className?: string;
    delay?: number;
    as?: "h1" | "h2" | "p" | "span";
}

/**
 * 단어 단위 마스크 리빌. 부모가 overflow-hidden, 자식이 y:100% → 0으로 올라온다.
 */
export function MaskedText({
    text,
    className,
    delay = 0,
    as: Tag = "span",
}: MaskedTextProps) {
    const words = text.split(" ");

    return (
        <Tag className={cn("inline-block", className)}>
            {words.map((word, index) => (
                <span
                    key={`${word}-${index}`}
                    className="inline-block overflow-hidden align-bottom pb-[0.12em]"
                >
                    <motion.span
                        className="inline-block"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            duration: 0.9,
                            delay: delay + index * 0.06,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        {word}
                        {index < words.length - 1 ? " " : ""}
                    </motion.span>
                </span>
            ))}
        </Tag>
    );
}
