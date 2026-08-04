"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { RibbonLight } from "@/components/visual/RibbonLight";
import { MANIFESTO } from "@/lib/constants";

/** 어절 하나. 스크롤 진행도가 자기 구간을 지날 때 흐린 글자에서 흰 글자로 켜진다. */
function Word({
    word,
    start,
    end,
    progress,
}: {
    word: string;
    start: number;
    end: number;
    progress: MotionValue<number>;
}) {
    const opacity = useTransform(progress, [start, end], [0.18, 1]);

    return (
        <motion.span style={{ opacity }} className="inline-block">
            {word}&nbsp;
        </motion.span>
    );
}

/*
 * 선언문은 정적이므로 어절별 점등 구간을 모듈 로드 시 한 번만 계산한다.
 * 각 어절은 자기 구간에서 켜지고, 뒤 4어절만큼 겹쳐 파도처럼 이어진다.
 */
const RAW_WORDS = MANIFESTO.lines.flatMap((line, lineIndex) =>
    line.split(" ").map((word) => ({ word, lineIndex }))
);

const WORDS = RAW_WORDS.map((entry, index) => ({
    ...entry,
    start: index / RAW_WORDS.length,
    end: Math.min(1, (index + 5) / RAW_WORDS.length),
    isLineBreak: index > 0 && RAW_WORDS[index - 1].lineIndex !== entry.lineIndex,
}));

/**
 * 스크롤에 연동해 선언문이 어절 단위로 점등된다.
 * 읽는 속도와 스크롤 속도를 붙여 두는 장치라, 텍스트가 곧 진행 표시기가 된다.
 */
export function Manifesto() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.85", "end 0.4"],
    });

    return (
        <section className="relative overflow-hidden py-[clamp(6rem,12vw,12rem)]">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-45">
                <RibbonLight id="manifesto" />
            </div>

            <div ref={ref} className="container-x relative">
                <p className="type-eyebrow">{MANIFESTO.eyebrow}</p>

                <p className="mt-10 max-w-[22ch] text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.28] tracking-[-0.035em] text-bright sm:max-w-[26ch]">
                    {WORDS.map((entry, index) => (
                        <span key={`${entry.word}-${index}`}>
                            {entry.isLineBreak ? <br className="hidden sm:block" /> : null}
                            <Word
                                word={entry.word}
                                start={entry.start}
                                end={entry.end}
                                progress={scrollYProgress}
                            />
                        </span>
                    ))}
                </p>
            </div>
        </section>
    );
}
