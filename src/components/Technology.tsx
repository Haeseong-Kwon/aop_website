"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import {
    PipelineDiagram,
    VIEW_W,
    nodeCenter,
} from "@/components/technology/PipelineDiagram";
import { PIPELINE, PIPELINE_FALLBACKS, SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** 활성 노드에서 갈라지거나 그 노드로 되돌아오는 경로 설명. */
function FallbackNotes({ nodeId }: { nodeId: string }) {
    const related = PIPELINE_FALLBACKS.filter(
        (fallback) => fallback.from === nodeId || fallback.to === nodeId
    );
    if (related.length === 0) return null;

    return (
        <ul className="mt-4 space-y-2 border-t border-border pt-3">
            {related.map((fallback) => (
                <li key={`${fallback.from}-${fallback.to}`} className="flex gap-2.5">
                    <span className="mt-[3px] shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-destructive">
                        {fallback.label}
                    </span>
                    <span className="text-[13px] leading-relaxed text-muted">
                        {fallback.description}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/**
 * 실행 파이프라인.
 *
 * 정밀 포인터가 있으면 핀 고정 + hover, 없으면 가로 스냅 스크롤 + 탭 선택으로 간다.
 *
 * 분기 기준이 뷰포트 폭이 아니라 포인터 종류인 이유: 태블릿은 md 브레이크포인트를
 * 넘기면서도 hover가 없어서, 폭으로 나누면 hover 전용 UI를 그대로 받아버린다.
 * 분기를 JS가 아니라 CSS(pointer-fine)로 하는 이유: JS로 하면 SSR이 항상 터치
 * 레이아웃을 뱉고, 하이드레이션 시점에 300vh가 튀어나와 스크롤 위치가 밀린다.
 */
export function Technology() {
    const pinRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState(0);
    const [hovered, setHovered] = useState<number | null>(null);

    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });

    // 앞 18% 구간은 헤딩이 읽히도록 비워두고, 그 뒤부터 다이어그램을 그린다
    const drawProgress = useTransform(scrollYProgress, [0.18, 0.92], [0, 1]);

    // hover는 스쳐 지나가는 상태, 탭/포커스 선택은 남는 상태
    const active = hovered ?? selected;
    const activeNode = PIPELINE[active];

    const select = useCallback((index: number) => {
        setSelected(index);
        setHovered(null);
    }, []);

    // 화살표 키로 단계를 이동한다
    const handleKeyDown = (event: React.KeyboardEvent) => {
        const delta =
            event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (delta === 0) return;

        event.preventDefault();
        select((active + delta + PIPELINE.length) % PIPELINE.length);
    };

    /*
     * 선택이 바뀌면 해당 카드를 트랙 안으로 끌어온다.
     * 데스크톱에서는 이 트랙이 display:none이라 호출이 무해하게 지나간다.
     */
    useEffect(() => {
        trackRef.current
            ?.querySelector(`[data-step="${selected}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, [selected]);

    const heading = <SectionHeading {...SECTIONS.technology} />;

    const detail = (
        <>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bright">
                {activeNode.label}
            </p>
            <p className="text-sm leading-relaxed text-muted">
                {activeNode.description}
            </p>
            <FallbackNotes nodeId={activeNode.id} />
        </>
    );

    return (
        <section id="technology" className="relative">
            {/* 정밀 포인터: 핀 고정 + hover */}
            <div ref={pinRef} className="relative hidden h-[300vh] pointer-fine:block">
                <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
                    <div className="container-x">
                        {heading}

                        <div className="relative mt-14 pb-32" onKeyDown={handleKeyDown}>
                            <PipelineDiagram
                                progress={drawProgress}
                                active={active}
                                onSelect={select}
                                onHover={setHovered}
                                interactive
                            />

                            <div
                                role="status"
                                aria-live="polite"
                                className="surface-card pointer-events-none absolute bottom-0 w-80 -translate-x-1/2 p-4"
                                style={{
                                    // 양 끝 노드에서 카드가 컨테이너 밖으로 나가지 않도록 클램프
                                    left: `clamp(10rem, ${(nodeCenter(active) / VIEW_W) * 100}%, calc(100% - 10rem))`,
                                }}
                            >
                                {detail}
                            </div>
                        </div>

                        <p className="type-eyebrow text-center">
                            노드를 가리키거나 ← → 키로 단계를 이동하세요
                        </p>
                    </div>
                </div>
            </div>

            {/*
             * 터치: 핀을 걸지 않는다. 가로 스냅 스크롤로 단계를 넘기고,
             * 선택한 단계의 설명은 트랙 아래 고정 영역에 나온다.
             */}
            <div className="section-y pointer-fine:hidden">
                <div className="container-x">{heading}</div>

                <div
                    ref={trackRef}
                    role="tablist"
                    aria-label="에이전트 실행 파이프라인 단계"
                    onKeyDown={handleKeyDown}
                    className="mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[clamp(1.25rem,5vw,3.5rem)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {PIPELINE.map((node, index) => (
                        <button
                            key={node.id}
                            type="button"
                            data-step={index}
                            role="tab"
                            aria-selected={selected === index}
                            onClick={() => select(index)}
                            className={cn(
                                "surface-card w-[68vw] max-w-[260px] shrink-0 snap-center p-5 text-left transition-colors",
                                selected === index
                                    ? "border-bright bg-surface-2"
                                    : "border-border"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[11px] tracking-[0.16em] text-faint">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="font-mono text-sm text-bright">
                                    {node.label}
                                </span>
                            </div>
                            <p className="mt-3 text-[13px] leading-relaxed text-muted">
                                {node.description}
                            </p>
                        </button>
                    ))}
                </div>

                <div className="container-x">
                    {/* 되돌림 경로는 터치에서도 반드시 드러나야 한다 */}
                    <div role="status" aria-live="polite" className="surface-card mt-6 p-5">
                        {detail}
                    </div>

                    <p className="type-eyebrow mt-6 text-center">
                        좌우로 밀어 단계를 확인하세요
                    </p>
                </div>
            </div>
        </section>
    );
}
