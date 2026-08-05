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

const MOTION_TAGS = {
    h1: motion.h1,
    h2: motion.h2,
    p: motion.p,
    span: motion.span,
} as const;

const WORD_VARIANTS = {
    hidden: { y: "105%" },
    shown: { y: 0 },
};

/**
 * 어절 단위 마스크 리빌. 부모가 overflow-hidden, 자식이 y:105% → 0으로 올라온다.
 * `*강조*` 구간은 발광 그라디언트로 렌더된다.
 *
 * 스크롤 트리거를 어절 span이 아니라 제목 요소 전체에 거는 것이 중요하다.
 * 밀려 내려간 어절은 마스크에 완전히 잘려서 교차 면적이 0이고, 그 상태로
 * IntersectionObserver를 걸면 "보이지 않으니 애니메이션하지 않고, 애니메이션하지
 * 않으니 영원히 보이지 않는" 교착에 빠진다. 실제로 그렇게 제목이 통째로 사라졌었다.
 * 변형(variant)은 부모에서 자식 motion 컴포넌트로 전파되므로, 중간 마스크 래퍼도
 * motion.span이어야 한다.
 */
export function MaskedText({
    text,
    className,
    delay = 0,
    stagger = STAGGER.tight,
    as = "span",
    trigger = "load",
}: MaskedTextProps) {
    const words = parseEmphasisWords(text);
    const Tag = MOTION_TAGS[as];

    // duration만 줄이고 delay를 남기면 어절이 순서대로 '툭툭' 나타나 오히려 더 산만하다
    const prefersReduced = useReducedMotion();
    const transition = useTransition({ duration: DUR.hero, ease: EASE.out });
    const step = prefersReduced ? 0 : stagger;
    const startAt = prefersReduced ? 0 : delay;

    return (
        <Tag
            className={cn("inline-block", className)}
            aria-label={stripEmphasis(text)}
            initial="hidden"
            {...(trigger === "inView"
                ? { whileInView: "shown", viewport: VIEWPORT }
                : { animate: "shown" })}
        >
            {words.map((segments, wordIndex) => (
                <Fragment key={wordIndex}>
                    {/*
                     * 어절 사이 공백은 마스크 밖에 둔다.
                     * overflow-hidden 래퍼 안의 후행 공백은 클리핑되어 사라진다.
                     */}
                    {wordIndex > 0 ? <span aria-hidden> </span> : null}
                    <motion.span
                        aria-hidden
                        className="inline-block overflow-hidden align-bottom pb-[0.14em]"
                    >
                        <motion.span
                            className="inline-block"
                            variants={WORD_VARIANTS}
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
                    </motion.span>
                </Fragment>
            ))}
        </Tag>
    );
}
