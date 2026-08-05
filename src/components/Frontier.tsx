"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MaskedText } from "@/components/motion/MaskedText";
import { FlipPanel } from "@/components/motion/FlipPanel";
import { FrontierVisualizer } from "@/components/frontier/FrontierVisualizer";
import { WebcamDemo } from "@/components/frontier/WebcamDemo";
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
 *
 * 트랙 설명은 3D 무대 밖이 아니라 안에 올린다 — 인식 대상과 인식 결과가
 * 나란히 놓여야 "무엇을 어떻게 읽는가"가 한 장면으로 읽힌다.
 */
export function Frontier() {
    const [activeIndex, setActiveIndex] = useState(0);
    const tabsRef = useRef<HTMLDivElement>(null);
    const prefersReduced = useReducedMotion();

    /*
     * 회전 목표 각도를 섹션이 소유한다. 드래그와 웹캠 데모가 같은 값을 쓰기 때문에,
     * 어느 쪽으로 돌리든 오브젝트는 하나의 상태만 따라간다.
     */
    const orbitRef = useRef({ x: 0, y: 0 });
    const handleCameraControl = useCallback((delta: { x: number; y: number }) => {
        orbitRef.current = delta;
    }, []);

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

                    <motion.p {...descriptionEnter} className="type-body mt-7 text-muted">
                        {FRONTIER.description}
                    </motion.p>
                </div>

                {/* 트랙 탭 — 무대 위에 가로로 얹는다 */}
                <div
                    ref={tabsRef}
                    role="tablist"
                    aria-label="원천기술 연구 트랙"
                    onKeyDown={handleKeyDown}
                    className="mt-14 grid grid-cols-2 gap-px border-y border-border bg-border md:grid-cols-4"
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
                                aria-controls="frontier-panel"
                                /* 활성 탭만 탭 순서에 남긴다 — 나머지는 화살표 키로 이동한다 */
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setActiveIndex(index)}
                                className={cn(
                                    "relative bg-bg px-4 py-5 text-left transition-colors",
                                    isActive ? "text-bright" : "text-muted hover:text-bright"
                                )}
                            >
                                {isActive ? (
                                    <motion.span
                                        layoutId="frontier-indicator"
                                        aria-hidden
                                        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,var(--color-glow),var(--color-beam)_60%,transparent)]"
                                        transition={EASE.spring}
                                    />
                                ) : null}

                                <span className="block font-mono text-[11px] tracking-[0.18em] text-faint">
                                    {track.index}
                                </span>
                                <span className="mt-2 block font-mono text-[14px] tracking-[-0.01em]">
                                    {track.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/*
                 * 3D 무대. 인식 오브젝트가 뒤에서 돌고, 그 위에 이번 트랙의 설명이
                 * 유리판처럼 얹혀 넘어간다.
                 */}
                <motion.div {...visualEnter} className="relative mt-8">
                    <FrontierVisualizer
                        shape={active.id as ShapeId}
                        disabled={prefersReduced ?? false}
                        orbit={orbitRef}
                    />

                    <div
                        role="tabpanel"
                        id="frontier-panel"
                        aria-labelledby={`frontier-tab-${active.id}`}
                        /*
                         * 무대 안쪽 하단. 포인터 이벤트를 통과시켜야 패널 위에서도
                         * 오브젝트를 드래그해 돌릴 수 있다 — 안의 버튼만 다시 켠다.
                         */
                        className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:inset-y-0 lg:right-auto lg:flex lg:w-[46%] lg:flex-col lg:justify-center lg:p-8"
                    >
                        <FlipPanel trigger={active.id} axis="x">
                            <div className="pointer-events-auto rounded-xl border border-border bg-bg/72 p-5 backdrop-blur-md sm:p-6">
                                <h3 className="type-h3">{active.title}</h3>
                                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                                    {active.description}
                                </p>

                                <p className="mt-5 flex flex-wrap items-center gap-2.5">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                                        적용 제품
                                    </span>
                                    <span className="badge border-transparent bg-surface-2 text-bright">
                                        {active.product}
                                    </span>
                                </p>
                            </div>
                        </FlipPanel>
                    </div>
                </motion.div>

                {/*
                 * 실시간 데모는 Visual Grounding 트랙에만 붙인다 — 화면 요소를 좌표로
                 * 읽는 트랙이라야 손 추적 데모가 설명의 일부가 되고, 그 밖에서는
                 * 그냥 장난감이 된다. 무대 밖에 두는 이유: 카메라 미리보기까지 무대 위에
                 * 겹치면 무엇이 인식 대상인지 알 수 없게 된다.
                 */}
                {active.id === "grounding" && !prefersReduced ? (
                    <div className="mx-auto max-w-2xl">
                        <WebcamDemo onControl={handleCameraControl} />
                    </div>
                ) : null}

                <p className="mt-12 border-t border-border pt-6 text-sm text-faint">
                    {FRONTIER.caption}
                </p>
            </div>
        </section>
    );
}
