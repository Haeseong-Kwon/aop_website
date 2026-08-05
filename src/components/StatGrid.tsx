"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PARTNERS, PATENTS, PIPELINE, PRODUCTS } from "@/lib/constants";

/**
 * 숫자는 전부 데이터 길이에서 계산한다 — 콘텐츠가 바뀌어도 어긋나지 않고,
 * 지어낸 실적이 끼어들 자리가 없다.
 */
const STATS = [
    {
        value: PRODUCTS.length,
        label: "Products",
        caption: "마케팅, 건설, 교육, 수출 분야에서 운영 및 준비 중인 에이전트 제품",
    },
    {
        value: PIPELINE.length,
        label: "Pipeline stages",
        caption: "요청을 결과로 만들기 위해 거치는 실행 단계",
    },
    {
        value: PATENTS.length,
        label: "Patents filed",
        caption: "공정 검증과 개인화 추천에 관해 출원한 특허",
    },
    {
        value: PARTNERS.length,
        label: "Network",
        caption: "산업 현장에서 기술을 함께 검증하는 계열사와 파트너사",
    },
];

/**
 * 화면에 들어올 때 0에서 목표값까지 세어 올린다.
 * 모션 축소 환경에서는 애니메이션 없이 최종값을 바로 반환한다 —
 * 이펙트 안에서 setState로 처리하면 불필요한 연쇄 렌더가 생긴다.
 */
function useCountUp(target: number, active: boolean) {
    const [counted, setCounted] = useState(0);
    const prefersReduced = useReducedMotion();

    useEffect(() => {
        if (!active || prefersReduced) return;

        const duration = 900;
        const start = performance.now();
        let frame = 0;

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            // easeOutExpo — 끝에서 부드럽게 멈춘다
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCounted(Math.round(eased * target));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [active, target, prefersReduced]);

    return prefersReduced ? target : counted;
}

function StatCell({
    stat,
    index,
    active,
}: {
    stat: (typeof STATS)[number];
    index: number;
    active: boolean;
}) {
    const value = useCountUp(stat.value, active);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
            className="group relative px-6 py-10 md:px-10 md:py-14"
        >
            <p className="type-eyebrow">{stat.label}</p>
            <p className="stat-value mt-6">{String(value).padStart(2, "0")}</p>

            {/* 셀마다 밑줄이 빛을 머금는다 — 그래픽이 텍스트를 피해 경계로 물러난다 */}
            <span className="mt-6 block h-px w-full bg-border">
                <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-15%" }}
                    transition={{
                        duration: 1,
                        delay: 0.25 + index * 0.09,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="block h-px w-full origin-left bg-[linear-gradient(90deg,var(--color-glow),var(--color-beam)_55%,transparent)]"
                />
            </span>

            <p className="mt-5 max-w-[24ch] text-[13.5px] leading-relaxed text-muted">
                {stat.caption}
            </p>
        </motion.div>
    );
}

export function StatGrid() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-20%" });

    return (
        <section className="relative pb-[clamp(4rem,8vw,7rem)]">
            <div className="container-x">
                <div ref={ref} className="light-panel">
                    {/* 셀 사이 하이라인 격자 — 카드가 하나의 설계된 단위로 읽힌다 */}
                    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                        {/* 셀 배경은 최소한만 — 패널 그라디언트가 비쳐야 카드가 하나로 읽힌다 */}
                        {STATS.map((stat, index) => (
                            <div key={stat.label} className="bg-bg/15">
                                <StatCell stat={stat} index={index} active={inView} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
