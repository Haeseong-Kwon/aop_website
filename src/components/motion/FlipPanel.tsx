"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * 내용이 바뀔 때 판이 축을 중심으로 넘어가는 전환.
 *
 * 공항 안내판(split-flap)의 동작을 빌렸다. 페이드는 '내용이 바뀌었다'만 말하지만
 * 넘어가는 판은 '이전 것이 물러나고 다음 것이 왔다'는 순서까지 말한다.
 *
 * 나가는 판과 들어오는 판이 같은 자리를 쓰도록 절대 배치한다. 문서 흐름에 두면
 * 전환 중 두 판이 세로로 쌓여 컨테이너 높이가 튄다.
 */

interface FlipPanelProps {
    /** 이 값이 바뀔 때 판이 넘어간다. */
    trigger: string | number;
    children: React.ReactNode;
    /** 넘어가는 축. 세로 목록은 x, 좌우 전환은 y가 자연스럽다. */
    axis?: "x" | "y";
    className?: string;
}

export function FlipPanel({
    trigger,
    children,
    axis = "x",
    className,
}: FlipPanelProps) {
    const prefersReduced = useReducedMotion();
    const key = axis === "x" ? "rotateX" : "rotateY";

    if (prefersReduced) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div className={cn("relative [perspective:1400px]", className)}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={trigger}
                    initial={{ opacity: 0, [key]: axis === "x" ? 42 : 38 }}
                    animate={{ opacity: 1, [key]: 0 }}
                    exit={{ opacity: 0, [key]: axis === "x" ? -42 : -38 }}
                    transition={{ duration: DUR.base, ease: EASE.inOut }}
                    style={{
                        transformStyle: "preserve-3d",
                        // 위쪽 모서리를 축으로 삼아야 판이 '넘어가는' 것으로 읽힌다
                        transformOrigin: axis === "x" ? "50% 0%" : "0% 50%",
                    }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
