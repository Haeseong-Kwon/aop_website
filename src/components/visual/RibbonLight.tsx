"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 패널을 가로지르는 발광 리본. 스크롤 진입 시 좌→우로 그려진다.
 * id를 받는 이유: 한 페이지에 여러 개가 놓이면 SVG defs의 id가 충돌한다.
 */
export function RibbonLight({
    id,
    className,
    delay = 0,
}: {
    id: string;
    className?: string;
    delay?: number;
}) {
    const gradientId = `ribbon-grad-${id}`;
    const bloomId = `ribbon-bloom-${id}`;
    const path =
        "M-60,560 C 240,520 420,400 620,290 S 1000,90 1320,-40";

    return (
        <svg
            aria-hidden
            viewBox="0 0 1240 560"
            preserveAspectRatio="xMidYMid slice"
            className={cn("h-full w-full", className)}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-violet)" stopOpacity="0.15" />
                    <stop offset="45%" stopColor="var(--color-glow)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--color-violet)" stopOpacity="0.35" />
                </linearGradient>

                <filter id={bloomId} x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="18" result="wide" />
                    <feGaussianBlur stdDeviation="5" result="tight" />
                    <feMerge>
                        <feMergeNode in="wide" />
                        <feMergeNode in="wide" />
                        <feMergeNode in="tight" />
                    </feMerge>
                </filter>
            </defs>

            <motion.path
                d={path}
                stroke="var(--color-violet)"
                strokeWidth="9"
                fill="none"
                filter={`url(#${bloomId})`}
                opacity="0.85"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
                d={path}
                stroke={`url(#${gradientId})`}
                strokeWidth="1.6"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] }}
            />
        </svg>
    );
}
