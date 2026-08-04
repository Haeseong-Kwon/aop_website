"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { EMPHASIS_CLASS, parseEmphasisWords, stripEmphasis } from "@/lib/emphasis";
import { cn } from "@/lib/utils";

interface MaskedTextProps {
    text: string;
    className?: string;
    delay?: number;
    stagger?: number;
    as?: "h1" | "h2" | "p" | "span";
    /** 히어로는 로드 즉시, 하위 섹션은 스크롤 진입 시 시작한다. */
    trigger?: "load" | "inView";
}

/**
 * 어절 단위 마스크 리빌. 부모가 overflow-hidden, 자식이 y:100% → 0으로 올라온다.
 * `*강조*` 구간은 발광 그라디언트로 렌더된다.
 */
export function MaskedText({
    text,
    className,
    delay = 0,
    stagger = 0.055,
    as: Tag = "span",
    trigger = "load",
}: MaskedTextProps) {
    const words = parseEmphasisWords(text);
    const isInView = trigger === "inView";

    return (
        <Tag className={cn("inline-block", className)} aria-label={stripEmphasis(text)}>
            {words.map((segments, wordIndex) => (
                <Fragment key={wordIndex}>
                    {/*
                     * 어절 사이 공백은 마스크 밖에 둔다.
                     * overflow-hidden 래퍼 안의 후행 공백은 클리핑되어 사라진다.
                     */}
                    {wordIndex > 0 ? <span aria-hidden> </span> : null}
                    <span
                        aria-hidden
                        className="inline-block overflow-hidden align-bottom pb-[0.14em]"
                    >
                        <motion.span
                            className="inline-block"
                            initial={{ y: "105%" }}
                            {...(isInView
                                ? {
                                      whileInView: { y: 0 },
                                      viewport: { once: true, margin: "-12%" },
                                  }
                                : { animate: { y: 0 } })}
                            transition={{
                                duration: 1,
                                delay: delay + wordIndex * stagger,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            {segments.map((segment, i) => (
                                <span
                                    key={i}
                                    className={segment.em ? EMPHASIS_CLASS : undefined}
                                >
                                    {segment.text}
                                </span>
                            ))}
                        </motion.span>
                    </span>
                </Fragment>
            ))}
        </Tag>
    );
}
