import type { Transition, Variants } from "framer-motion";

/**
 * 모션 토큰 — 사이트 전체 애니메이션의 단일 소스.
 *
 * 섹션마다 [0.16, 1, 0.3, 1] 같은 값을 각자 들고 있으면 리듬이 조금씩 어긋난다.
 * 여기 없는 duration/easing은 쓰지 않는다.
 */

/**
 * framer-motion의 BezierDefinition은 가변 튜플이라 `as const`의 readonly 배열을
 * 그대로 넘길 수 없다. 토큰 객체는 as const로 얼리되 베지어만 튜플로 단언한다.
 */
type Bezier = [number, number, number, number];

export const EASE = {
    /** 등장 — 빠르게 튀어나와 길게 감속한다. */
    out: [0.16, 1, 0.3, 1] as Bezier,
    /** 상태 전환 — 시작과 끝이 대칭이라 되돌아가는 동작에 어울린다. */
    inOut: [0.65, 0, 0.35, 1] as Bezier,
    /** 포인터를 따라가는 물리 반응(탭 인디케이터, 틸트). */
    spring: { type: "spring", stiffness: 120, damping: 20, mass: 0.6 },
} as const;

export const DUR = { fast: 0.25, base: 0.5, slow: 0.8, hero: 1.1 } as const;

export const STAGGER = { tight: 0.04, base: 0.07, loose: 0.12 } as const;

/**
 * 스크롤 등장의 공통 뷰포트 설정. once: true — 재진입 재생은 하지 않는다.
 * 스크롤을 되감을 때마다 다시 재생되면 페이지가 안절부절 못하는 인상을 준다.
 */
export const VIEWPORT = {
    once: true,
    amount: 0.25,
    margin: "0px 0px -12% 0px",
} as const;

/** 모션 축소 환경에서 쓰는 전환 — 최종 상태로 즉시 점프시킨다. */
export const REDUCED_TRANSITION: Transition = { duration: 0.01 };

export interface EnterOptions {
    /** 아래에서 올라오는 거리(px). 20을 넘기면 시선이 글자를 놓친다. */
    y?: number;
    delay?: number;
    duration?: number;
    /**
     * 초점이 맞는 듯한 blur 등장. filter 애니메이션은 리페인트를 유발하므로
     * 헤딩·패널처럼 개수가 적은 큰 블록에만 켠다. 리스트 아이템에는 쓰지 않는다.
     */
    blur?: boolean;
}

/** 등장 모션의 유일한 정의. scale은 쓰지 않는다 — 텍스트가 흐려진다. */
export function enterVariants({
    y = 16,
    blur = false,
}: Pick<EnterOptions, "y" | "blur"> = {}): Variants {
    return {
        hidden: { opacity: 0, y, ...(blur ? { filter: "blur(6px)" } : null) },
        shown: { opacity: 1, y: 0, ...(blur ? { filter: "blur(0px)" } : null) },
    };
}

/** 자식 요소를 순차로 흘려보내는 컨테이너. */
export function staggerVariants(step: number = STAGGER.base): Variants {
    return {
        hidden: {},
        shown: { transition: { staggerChildren: step } },
    };
}
