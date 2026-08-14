"use client";

import { useEffect, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * 스크롤에 따라 회전하는 다면체 무대.
 *
 * 각 면에 한 단계씩 올리고, 스크롤 진행도가 회전각을 만든다. 면의 내용은 진짜 DOM이라
 * 글자가 선택되고 스크린리더에 잡힌다 — 이걸 WebGL 텍스처로 그렸다면 전부 잃는다.
 *
 * 회전은 등속이 아니다. 진행도의 대부분을 '면이 정면으로 서 있는' 상태로 쓰고,
 * 넘어가는 구간만 짧게 준다. 등속으로 돌리면 읽을 수 있는 순간이 거의 없어서
 * 3D가 내용을 방해하는 장치가 되어버린다.
 */

interface RotaryStageProps {
    /** 0~1 스크롤 진행도. 이 값이 회전각이 된다. */
    progress: MotionValue<number>;
    faces: React.ReactNode[];
    /** 현재 정면에 선 면. 접근성 처리와 오버레이 동기화에 쓴다. */
    activeIndex: number;
    className?: string;
    /** 면 하나의 높이. 모든 면이 같은 높이를 쓴다. */
    faceClassName?: string;
}

/**
 * 원근 거리(px). 이 값이 작을수록 입체감이 강해지고 앞면이 크게 확대된다.
 * CSS 변수로 빼지 않는 이유: 아래 역보정 계산이 같은 값을 알아야 한다.
 */
const PERSPECTIVE = 2200;

/**
 * 사인 ease-in-out. 회전이 서서히 붙었다 서서히 풀린다.
 *
 * 3차(cubic)를 쓰지 않는다: 3차는 최고 각속도가 평균의 2배까지 솟아서, 이징을 넣는
 * 것만으로 "가장 빠른 순간"이 오히려 등속일 때보다 빨라진다. 사인은 그 배수가
 * π/2(약 1.57)로 훨씬 얌전하다.
 */
function easeInOut(t: number) {
    return 0.5 * (1 - Math.cos(Math.PI * t));
}

/** 사인 이징의 최고 각속도 / 평균 각속도. 아래 hold 기본값이 이 값에서 나왔다. */
const PEAK_RATIO = Math.PI / 2;

/** 넘어가는 구간을 몇 조각으로 쪼개 이징을 표본화할지. */
const EASE_SAMPLES = 10;

/**
 * 면을 정면에 고정해 두는 비율.
 *
 * 이징을 넣으면 같은 구간 안에서 최고 각속도가 PEAK_RATIO배로 솟는다. 그래서 넘어가는
 * 구간도 그만큼 넓혀 준다 — 그러면 최고 각속도가 이징 전의 등속과 같아지고, 빨라지는
 * 것 없이 붙고 푸는 맛만 얻는다. 0.62는 이징이 없던 시절의 값이다.
 */
const DEFAULT_HOLD = 1 - (1 - 0.62) * PEAK_RATIO;

/**
 * 진행도 → 회전각 구간표.
 *
 * hold 비율만큼은 각도를 고정하고, 나머지 구간에서만 다음 면으로 넘어간다.
 *
 * 넘어가는 구간은 등속이 아니다. useTransform은 구간 사이를 직선으로 잇기 때문에,
 * 시작·끝 각도만 찍어두면 각속도가 0에서 최대로 튀었다가 다시 0으로 끊긴다 —
 * 그게 "너무 빠르게 홱 돈다"는 인상의 정체다. 중간 점을 ease-in-out으로 표본화해
 * 넣으면 같은 스크롤 거리를 쓰면서도 붙고 푸는 맛이 생긴다.
 */
function buildSteps(count: number, hold: number) {
    const segment = 1 / count;
    const step = 360 / count;

    const input: number[] = [];
    const output: number[] = [];

    for (let i = 0; i < count; i += 1) {
        const start = i * segment;
        const holdEnd = start + segment * hold;

        input.push(start, holdEnd);
        output.push(-i * step, -i * step);

        // 마지막 면 뒤에는 넘어갈 면이 없다
        if (i === count - 1) break;

        const span = segment * (1 - hold);
        for (let k = 1; k < EASE_SAMPLES; k += 1) {
            const t = k / EASE_SAMPLES;
            input.push(holdEnd + span * t);
            output.push(-i * step - step * easeInOut(t));
        }
    }

    // 마지막 면은 끝까지 정면을 유지한다 — 섹션을 벗어나며 뒤통수를 보일 이유가 없다
    input.push(1);
    output.push(-(count - 1) * step);

    return { input, output };
}

/*
 * 회전을 쓸 수 없는 환경(모션 축소·좁은 화면)에서는 이 컴포넌트를 마운트하지 않고,
 * 호출부가 통째로 다른 레이아웃을 렌더한다. 여기서 면을 세로로 쌓는 폴백을 두면
 * 무대의 고정 높이 안에 카드 여러 장이 들어가 잘린다 — 실제로 그렇게 잘렸었다.
 */
export function RotaryStage({
    progress,
    faces,
    activeIndex,
    className,
    faceClassName,
}: RotaryStageProps) {
    const count = faces.length;
    const step = 360 / count;

    const { input, output } = buildSteps(count, DEFAULT_HOLD);
    const rotateY = useTransform(progress, input, output);
    // 아주 얕은 상하 기울기. 정면 투영만 있으면 입체로 읽히지 않는다.
    const rotateX = useTransform(progress, [0, 0.5, 1], [5, -1, 5]);

    /*
     * 면을 밖으로 밀어내는 거리. 정N각기둥의 아포템이다.
     * 이 값이 틀어지면 회전할 때 이웃한 면끼리 모서리가 어긋나 벌어진다.
     */
    const [radius, setRadius] = useState(0);
    const [stage, setStage] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!stage) return;

        const measure = () => {
            const width = stage.getBoundingClientRect().width;
            setRadius(width / 2 / Math.tan(Math.PI / count));
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(stage);
        return () => observer.disconnect();
    }, [stage, count]);

    /*
     * 원근 역보정.
     *
     * 면을 translateZ(radius)로 앞으로 밀면 원근 때문에 확대되어 그려진다. 반지름이
     * 폭의 절반쯤 되는 4면체에서는 30% 가까이 커져서 카드가 컨테이너를 넘고 옆 요소를
     * 덮는다. 무리를 s배 줄이면 최종 배율이 s·P/(P−r·s)가 되고, 이걸 1로 놓고 풀면
     * s = P/(P+r)이다. 정면에 선 면이 정확히 무대 크기가 된다.
     */
    const scale = PERSPECTIVE / (PERSPECTIVE + radius);

    return (
        <div
            ref={setStage}
            style={{ perspective: `${PERSPECTIVE}px` }}
            className={cn("relative", className)}
        >
            <motion.div
                style={{
                    rotateY,
                    rotateX,
                    scale,
                    transformStyle: "preserve-3d",
                }}
                className="relative h-full w-full"
            >
                {faces.map((face, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <div
                            key={index}
                            /*
                             * 뒤를 보는 면은 접근성 트리에서도 빼야 한다.
                             * 보이지 않는 카드의 링크로 탭이 들어가면 포커스가 사라진다.
                             */
                            aria-hidden={!isActive}
                            inert={!isActive}
                            style={{
                                transform: `rotateY(${index * step}deg) translateZ(${radius}px)`,
                                backfaceVisibility: "hidden",
                            }}
                            className={cn(
                                "absolute inset-0 transition-opacity duration-300",
                                // 옆면이 완전히 또렷하면 정면이 어느 쪽인지 읽히지 않는다
                                isActive ? "opacity-100" : "opacity-45",
                                faceClassName
                            )}
                        >
                            {face}
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
}

/** 진행도에서 현재 정면 면의 인덱스를 뽑는다. */
export function faceIndexFromProgress(value: number, count: number) {
    return Math.min(count - 1, Math.max(0, Math.floor(value * count + 0.001)));
}
