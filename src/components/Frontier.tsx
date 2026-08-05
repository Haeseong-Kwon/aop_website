"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MaskedText } from "@/components/motion/MaskedText";
import { FrontierVisualizer } from "@/components/frontier/FrontierVisualizer";
import type { ShapeId } from "@/components/frontier/shapes";
import { useEnter } from "@/hooks/useEnter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DUR, EASE } from "@/lib/motion";
import { FRONTIER, FRONTIER_TRACKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * FRONTIER R&D — 제품이 지금 쓰고 있는 에이전트 특화 원천기술.
 *
 * Research 섹션과 계층이 다르다. Research는 제품이 되기 전의 탐색이고,
 * 여기는 이미 제품 안에서 돌고 있는 인식 계층이다. 그 차이가 카피뿐 아니라
 * 시각 위계에서도 드러나야 해서, 이 섹션만 3D 오브젝트를 갖는다.
 */
export function Frontier() {
    const [activeIndex, setActiveIndex] = useState(0);
    const tabsRef = useRef<HTMLDivElement>(null);
    const prefersReduced = useReducedMotion();

    const eyebrowEnter = useEnter({ y: 8 });
    const descriptionEnter = useEnter({ y: 14, delay: 0.2, duration: DUR.slow });
    const visualEnter = useEnter({ y: 20, duration: DUR.slow, blur: true });

    const active = FRONTIER_TRACKS[activeIndex];

    /** 화살표 키로 탭을 이동하고 포커스도 함께 옮긴다(WAI-ARIA tabs 패턴). */
    const handleKeyDown = (event: React.KeyboardEvent) => {
        const delta =
            event.key === "ArrowRight" || event.key === "ArrowDown"
                ? 1
                : event.key === "ArrowLeft" || event.key === "ArrowUp"
                  ? -1
                  : 0;

        const next =
            event.key === "Home"
                ? 0
                : event.key === "End"
                  ? FRONTIER_TRACKS.length - 1
                  : delta === 0
                    ? -1
                    : (activeIndex + delta + FRONTIER_TRACKS.length) %
                      FRONTIER_TRACKS.length;

        if (next < 0) return;

        event.preventDefault();
        setActiveIndex(next);
        tabsRef.current
            ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
            [next]?.focus();
    };

    return (
        <section id="frontier" className="section-y relative">
            <div className="container-x">
                <div className="max-w-3xl">
                    <motion.p {...eyebrowEnter} className="type-eyebrow text-bright">
                        {FRONTIER.eyebrow}
                    </motion.p>

                    <MaskedText
                        as="h2"
                        text={FRONTIER.title}
                        trigger="inView"
                        delay={0.08}
                        className="type-h2 mt-6"
                    />

                    <motion.p
                        {...descriptionEnter}
                        className="type-body mt-7 text-muted"
                    >
                        {FRONTIER.description}
                    </motion.p>
                </div>

                <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
                    {/* 좌: 트랙 탭 + 본문 */}
                    <div>
                        <div
                            ref={tabsRef}
                            role="tablist"
                            aria-label="원천기술 연구 트랙"
                            aria-orientation="vertical"
                            onKeyDown={handleKeyDown}
                            className="flex flex-col"
                        >
                            {FRONTIER_TRACKS.map((track, index) => {
                                const isActive = index === activeIndex;

                                return (
                                    <button
                                        key={track.id}
                                        type="button"
                                        role="tab"
                                        id={`frontier-tab-${track.id}`}
                                        aria-selected={isActive}
                                        aria-controls={`frontier-panel-${track.id}`}
                                        /* 활성 탭만 탭 순서에 남긴다 — 나머지는 화살표 키로 이동한다 */
                                        tabIndex={isActive ? 0 : -1}
                                        onClick={() => setActiveIndex(index)}
                                        className={cn(
                                            "relative flex items-baseline gap-4 border-t border-border py-4 text-left transition-colors last:border-b",
                                            isActive
                                                ? "text-bright"
                                                : "text-muted hover:text-bright"
                                        )}
                                    >
                                        {isActive ? (
                                            <motion.span
                                                layoutId="frontier-indicator"
                                                aria-hidden
                                                className="absolute -top-px left-0 h-px w-full bg-[linear-gradient(90deg,var(--color-glow),var(--color-beam)_60%,transparent)]"
                                                transition={EASE.spring}
                                            />
                                        ) : null}

                                        <span className="font-mono text-[11px] tracking-[0.18em] text-faint">
                                            {track.index}
                                        </span>
                                        <span className="font-mono text-[15px] tracking-[-0.01em]">
                                            {track.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div
                            role="tabpanel"
                            id={`frontier-panel-${active.id}`}
                            aria-labelledby={`frontier-tab-${active.id}`}
                            className="mt-8"
                        >
                            {/*
                             * key를 바꿔 탭 전환마다 다시 마운트한다.
                             * 모션 축소 환경에서는 transition이 0.01s라 즉시 교체된다.
                             */}
                            <motion.div
                                key={active.id}
                                initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={
                                    prefersReduced
                                        ? { duration: 0.01 }
                                        : { duration: DUR.base, ease: EASE.out }
                                }
                            >
                                <h3 className="type-h3">{active.title}</h3>
                                <p className="type-body mt-4 text-muted">
                                    {active.description}
                                </p>

                                <p className="mt-6 flex items-center gap-2.5">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                                        적용 제품
                                    </span>
                                    <span className="badge border-transparent bg-surface-2 text-bright">
                                        {active.product}
                                    </span>
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* 우: 3D 인식 오브젝트 */}
                    <motion.div {...visualEnter}>
                        <FrontierVisualizer
                            shape={active.id as ShapeId}
                            disabled={prefersReduced ?? false}
                        />
                    </motion.div>
                </div>

                <p className="mt-12 border-t border-border pt-6 text-sm text-faint">
                    {FRONTIER.caption}
                </p>
            </div>
        </section>
    );
}
