"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import {
    DUR,
    EASE,
    REDUCED_TRANSITION,
    VIEWPORT,
    enterVariants,
    type EnterOptions,
} from "@/lib/motion";

/**
 * 모션 축소 환경이면 전환을 0.01s로 눌러 최종 상태만 남긴다.
 * 각 섹션이 prefers-reduced-motion을 개별로 분기하지 않게 하는 것이 목적이다.
 */
export function useTransition(transition: Transition): Transition {
    const prefersReduced = useReducedMotion();
    return prefersReduced ? REDUCED_TRANSITION : transition;
}

/**
 * 스크롤 등장 모션 한 벌. 스프레드해서 그대로 쓴다.
 *
 *   <motion.div {...useEnter({ delay: 0.1 })}>
 *
 * opacity + translateY(+선택적 blur)만 움직인다. scale/rotate 등장은 쓰지 않는다.
 */
export function useEnter({
    y = 16,
    delay = 0,
    duration = DUR.base,
    blur = false,
}: EnterOptions = {}) {
    const transition = useTransition({ duration, delay, ease: EASE.out });

    return {
        variants: enterVariants({ y, blur }),
        initial: "hidden" as const,
        whileInView: "shown" as const,
        viewport: VIEWPORT,
        transition,
    };
}

/**
 * 부모가 순서를 쥐고 자식은 위치만 아는 형태. 자식에게는 enterChild()를 쓴다.
 * 자식마다 delay를 계산해 넘기는 방식보다 항목 수가 바뀔 때 덜 깨진다.
 */
export function useEnterList(step: number = 0.07) {
    const prefersReduced = useReducedMotion();

    return {
        initial: "hidden" as const,
        whileInView: "shown" as const,
        viewport: VIEWPORT,
        variants: {
            hidden: {},
            shown: {
                transition: { staggerChildren: prefersReduced ? 0 : step },
            },
        },
    };
}

/** useEnterList 컨테이너의 자식. */
export function useEnterChild({ y = 16, blur = false, duration = DUR.base }: EnterOptions = {}) {
    const transition = useTransition({ duration, ease: EASE.out });
    return { variants: enterVariants({ y, blur }), transition };
}
