"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { useTransition } from "@/hooks/useEnter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DUR, EASE, STAGGER, VIEWPORT } from "@/lib/motion";
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
    stagger = STAGGER.tight,
    as: Tag = "span",
    trigger = "load",
}: MaskedTextProps) {
    const words = parseEmphasisWords(text);
    const isInView = trigger === "inView";
    // 마스크 리빌은 overflow-hidden 안의 y 이동이라 모션 축소 시 완전히 죽여야 한다.
    // duration만 줄이고 delay를 남기면 어절이 순서대로 '툭툭' 나타나 오히려 더 산만하다.
    const prefersReduced = useReducedMotion();
    const transition = useTransition({ duration: DUR.hero, ease: EASE.out });
    const step = prefersReduced ? 0 : stagger;
    const startAt = prefersReduced ? 0 : delay;

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
                                      viewport: VIEWPORT,
                                  }
                                : { animate: { y: 0 } })}
                            transition={{
                                ...transition,
                                delay: startAt + wordIndex * step,
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
