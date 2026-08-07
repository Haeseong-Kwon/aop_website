"use client";

import { useCallback, useRef, useState } from "react";
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { MaskedText } from "@/components/motion/MaskedText";
import { FlipPanel } from "@/components/motion/FlipPanel";
import { FrontierVisualizer } from "@/components/frontier/FrontierVisualizer";
import { WebcamDemo } from "@/components/frontier/WebcamDemo";
import { faceIndexFromProgress } from "@/components/motion/RotaryStage";
import type { ShapeId } from "@/components/frontier/shapes";
import { useEnter } from "@/hooks/useEnter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DUR } from "@/lib/motion";
import { FRONTIER, FRONTIER_TRACKS, type FrontierTrack } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * FRONTIER R&D — 제품이 지금 쓰고 있는 에이전트 특화 원천기술.
 *
 * Research 섹션과 계층이 다르다. Research는 제품이 되기 전의 탐색이고,
 * 여기는 이미 제품 안에서 돌고 있는 인식 계층이다. 그 차이가 카피뿐 아니라
 * 시각 위계에서도 드러나야 해서, 이 섹션만 3D 무대를 갖는다.
 *
 * 트랙 전환은 클릭이 아니라 스크롤이다. 탭을 눌러야 다음 트랙이 나오면 대부분의
 * 방문자는 첫 트랙만 보고 지나간다. 무대를 핀으로 고정하고 스크롤 진행도가 트랙을
 * 넘기면, 페이지를 내리는 동작 자체가 인식 계층을 한 겹씩 통과하는 일이 된다.
 */

const COUNT = FRONTIER_TRACKS.length;

/**
 * 스캔이 트랙 구간의 앞 절반 동안 끝나도록 하는 계수.
 * 나머지 절반은 검출 결과를 읽는 시간이다 — 스캔이 끝날 때까지 계속 훑으면
 * 무엇을 찾았는지 보이지 않는다.
 */
const SCAN_SPAN = 0.5;

export function Frontier() {
    const pinRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const prefersReduced = useReducedMotion();

    /*
     * 회전 목표 각도를 섹션이 소유한다. 드래그와 웹캠 데모가 같은 값을 쓰기 때문에,
     * 어느 쪽으로 돌리든 오브젝트는 하나의 상태만 따라간다.
     */
    const orbitRef = useRef({ x: 0, y: 0 });
    const handleCameraControl = useCallback((delta: { x: number; y: number }) => {
        orbitRef.current = delta;
    }, []);

    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });

    // 앞뒤로 여백을 둬 무대가 자리를 잡은 뒤 첫 트랙이 시작한다
    const stageProgress = useTransform(scrollYProgress, [0.08, 0.94], [0, 1]);

    /*
     * 스캔은 트랙마다 처음부터 다시 훑는다. 전역 진행도를 그대로 쓰면 첫 트랙에서
     * 한 번 지나간 뒤로는 영영 바닥에 붙어 있어, 형태가 바뀌어도 다시 읽지 않는다.
     */
    const scanProgress = useTransform(stageProgress, (value) => {
        const clamped = Math.min(0.9999, Math.max(0, value));
        return Math.min(1, ((clamped * COUNT) % 1) / SCAN_SPAN);
    });

    useMotionValueEvent(stageProgress, "change", (value) => {
        setActiveIndex(faceIndexFromProgress(value, COUNT));
    });

    const eyebrowEnter = useEnter({ y: 8 });
    const descriptionEnter = useEnter({ y: 14, delay: 0.2, duration: DUR.slow });

    const active = FRONTIER_TRACKS[activeIndex];

    return (
        <section id="frontier" className="relative">
            <div className="container-x pt-[clamp(7rem,14vw,14rem)]">
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
            </div>

            {/*
             * 스크롤 무대. 트랙 하나에 100vh씩 배정한다 — 이보다 짧으면 형태 모프가
             * 끝나기 전에 다음 트랙으로 넘어가 무엇이 바뀌었는지 읽히지 않는다.
             */}
            <div ref={pinRef} className="relative hidden h-[420vh] motion-safe:block">
                <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
                    <div className="container-x w-full">
                        <StageHud active={active} progress={stageProgress} />

                        <div className="mt-6 flex items-stretch gap-10">
                            <TrackRail active={activeIndex} progress={stageProgress} />

                            <div className="relative flex-1">
                                <FrontierVisualizer
                                    shape={active.id as ShapeId}
                                    disabled={prefersReduced ?? false}
                                    orbit={orbitRef}
                                    camera={stageProgress}
                                    scan={scanProgress}
                                    className="h-[clamp(19rem,52vh,28rem)]"
                                />

                                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:inset-y-0 lg:right-auto lg:flex lg:w-[44%] lg:flex-col lg:justify-center lg:p-8">
                                    <FlipPanel trigger={active.id} axis="x">
                                        <TrackCard track={active} />
                                    </FlipPanel>
                                </div>

                                {/*
                                 * 실시간 데모는 Visual Grounding 트랙에만 붙인다 — 화면 요소를
                                 * 좌표로 읽는 트랙이라야 손 추적이 설명의 일부가 된다.
                                 *
                                 * 무대 바로 아래에 절대 배치한다. 핀 구간 안이라 손으로 돌리는
                                 * 대상이 같은 화면에 남고, 무대 위에 겹치지 않아 검출 박스를
                                 * 가리지도 않는다. 흐름에 넣으면 트랙이 바뀔 때마다 sticky
                                 * 콘텐츠 높이가 달라져 무대가 위아래로 튄다.
                                 */}
                                {active.id === "grounding" && !prefersReduced ? (
                                    <div className="absolute right-0 top-full mt-4 hidden w-[21rem] rounded-xl bg-bg/80 backdrop-blur-md lg:block">
                                        <WebcamDemo onControl={handleCameraControl} />
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <TrackTicker active={activeIndex} />
                    </div>
                </div>
            </div>

            {/*
             * 모션 축소 폴백. 핀 구간은 스크롤 위치를 가로채는 장치라서, 모션을 줄인
             * 환경에서는 네 트랙을 그냥 다 펼쳐 놓는다.
             */}
            <div className="container-x mt-14 space-y-4 motion-safe:hidden">
                {FRONTIER_TRACKS.map((track) => (
                    <TrackCard key={track.id} track={track} />
                ))}
            </div>

            <div className="container-x pb-[clamp(7rem,14vw,14rem)]">
                <p className="mt-12 border-t border-border pt-6 text-sm text-faint">
                    {FRONTIER.caption}
                </p>
            </div>
        </section>
    );
}

/** 무대 상단 계기판 — 지금 몇 번째 트랙이고 전체의 어디쯤인지. */
function StageHud({
    active,
    progress,
}: {
    active: FrontierTrack;
    progress: MotionValue<number>;
}) {
    return (
        <div>
            <div className="flex items-center justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.2em]">
                <span className="text-faint">Perception stage</span>
                <span className="hidden text-faint sm:inline">
                    scroll to advance
                </span>
                <span className="text-bright">
                    Track {active.index} / {String(COUNT).padStart(2, "0")}
                </span>
            </div>

            <div className="relative mt-2.5 h-px bg-border">
                <motion.span
                    style={{ scaleX: progress }}
                    className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--color-glow),var(--color-beam))]"
                />
            </div>
        </div>
    );
}

/** 좌측 트랙 레일. 활성 트랙의 세로선이 그 구간 진행도만큼 차오른다. */
function TrackRail({
    active,
    progress,
}: {
    active: number;
    progress: MotionValue<number>;
}) {
    return (
        <ol className="hidden w-52 shrink-0 lg:block">
            {FRONTIER_TRACKS.map((track, index) => (
                <RailRow
                    key={track.id}
                    track={track}
                    index={index}
                    active={active === index}
                    progress={progress}
                />
            ))}
        </ol>
    );
}

function RailRow({
    track,
    index,
    active,
    progress,
}: {
    track: FrontierTrack;
    index: number;
    active: boolean;
    progress: MotionValue<number>;
}) {
    // 이 트랙 구간 안에서의 진행도. 구간 밖에서는 0 또는 1로 고정된다.
    const fill = useTransform(progress, [index / COUNT, (index + 1) / COUNT], [0, 1]);

    return (
        <li aria-current={active ? "step" : undefined} className="relative py-4 pl-6">
            <span className="absolute left-0 top-0 h-full w-px bg-border" />
            <motion.span
                aria-hidden
                style={{ scaleY: fill }}
                className="absolute left-0 top-0 h-full w-px origin-top bg-[linear-gradient(180deg,var(--color-glow),var(--color-beam))]"
            />

            <span
                className={cn(
                    "block font-mono text-[10px] tracking-[0.2em] transition-colors duration-300",
                    active ? "text-glow" : "text-faint"
                )}
            >
                {track.index}
            </span>
            <span
                className={cn(
                    "mt-1.5 block font-mono text-[14px] tracking-[-0.01em] transition-colors duration-300",
                    active ? "text-bright" : "text-muted"
                )}
            >
                {track.name}
            </span>
        </li>
    );
}

/** 레일이 들어가지 않는 폭에서 쓰는 가로 진행 눈금. */
function TrackTicker({ active }: { active: number }) {
    return (
        <ol className="mt-5 grid grid-cols-4 gap-2 lg:hidden">
            {FRONTIER_TRACKS.map((track, index) => (
                <li
                    key={track.id}
                    aria-current={active === index ? "step" : undefined}
                    className={cn(
                        "border-t pt-2 font-mono text-[10px] tracking-[0.16em] transition-colors duration-300",
                        index <= active
                            ? "border-glow/70 text-bright"
                            : "border-border text-faint"
                    )}
                >
                    {track.index}
                    <span className="mt-1 block truncate text-[11px] tracking-normal">
                        {track.name}
                    </span>
                </li>
            ))}
        </ol>
    );
}

/** 트랙 설명 카드. 무대 위에서는 유리판으로, 폴백에서는 그냥 카드로 쓴다. */
function TrackCard({ track }: { track: FrontierTrack }) {
    return (
        <div className="pointer-events-auto rounded-2xl border border-border bg-bg/72 p-5 backdrop-blur-md sm:p-6">
            <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                <span className="text-glow">{track.index}</span>
                <span className="h-2.5 w-px bg-border" />
                {track.name}
            </p>

            <h3 className="type-h3 mt-3">{track.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {track.description}
            </p>

            <p className="mt-5 flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    적용 제품
                </span>
                <span className="badge border-transparent bg-surface-2 text-bright">
                    {track.product}
                </span>
            </p>
        </div>
    );
}
