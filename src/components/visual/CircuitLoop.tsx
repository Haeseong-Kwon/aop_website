"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/*
 * 세 낱말을 감싸고 도는 닫힌 회로.
 *
 * "따로 움직이지 않고 하나의 순환을 이룬다"는 문장을 글자 그대로 그린 것이라,
 * 사이트에서 유일하게 허용된 무한 반복이다. 다른 어떤 요소도 이렇게 돌지 않는다.
 *
 * 곡선을 쓰지 않는 이유: preserveAspectRatio="none"으로 늘릴 때 사각형은 사각형으로
 * 남지만 곡선은 계란형으로 뭉개진다. 선 굵기는 non-scaling-stroke가 지킨다.
 */

const W = 1000;
const H = 200;
const PERIMETER = 2 * (W + H);

/** 회로를 도는 밝은 구간의 길이. 전체의 1/6 정도라야 '흐른다'로 읽힌다. */
const DASH = PERIMETER / 6;

export function CircuitLoop() {
    const prefersReduced = useReducedMotion();

    return (
        <svg
            aria-hidden
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
        >
            {/* 바닥 회로 — 항상 보이는 아주 흐린 경로 */}
            <rect
                x={0.5}
                y={0.5}
                width={W - 1}
                height={H - 1}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
            />

            {/* 그 위를 도는 밝은 구간 */}
            <motion.rect
                x={0.5}
                y={0.5}
                width={W - 1}
                height={H - 1}
                fill="none"
                stroke="var(--color-beam)"
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                strokeDasharray={`${DASH} ${PERIMETER - DASH}`}
                initial={{ strokeDashoffset: PERIMETER }}
                {...(prefersReduced
                    ? {}
                    : {
                          animate: { strokeDashoffset: 0 },
                          transition: {
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear",
                          },
                      })}
            />
        </svg>
    );
}
