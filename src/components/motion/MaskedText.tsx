"use client";

import { motion } from "framer-motion";
import { emphasisClass, parseEmphasisWords, stripEmphasis } from "@/lib/emphasis";
import { cn } from "@/lib/utils";

interface MaskedTextProps {
    text: string;
    className?: string;
    delay?: number;
    stagger?: number;
    as?: "h1" | "h2" | "p" | "span";
}

/**
 * 어절 단위 마스크 리빌. 부모가 overflow-hidden, 자식이 y:100% → 0으로 올라온다.
 * `*강조*` 구간은 세리프 이탤릭으로 렌더된다.
 */
export function MaskedText({
    text,
    className,
    delay = 0,
    stagger = 0.06,
    as: Tag = "span",
}: MaskedTextProps) {
    const words = parseEmphasisWords(text);

    return (
        <Tag className={cn("inline-block", className)} aria-label={stripEmphasis(text)}>
            {words.map((segments, wordIndex) => (
                <span
                    key={wordIndex}
                    aria-hidden
                    className="inline-block overflow-hidden align-bottom pb-[0.14em]"
                >
                    <motion.span
                        className="inline-block"
                        initial={{ y: "105%" }}
                        animate={{ y: 0 }}
                        transition={{
                            duration: 1,
                            delay: delay + wordIndex * stagger,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        {segments.map((segment, i) => (
                            <span
                                key={i}
                                className={segment.em ? emphasisClass(segment.text) : undefined}
                            >
                                {segment.text}
                            </span>
                        ))}
                        {wordIndex < words.length - 1 ? " " : ""}
                    </motion.span>
                </span>
            ))}
        </Tag>
    );
}
