"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { useEnter } from "@/hooks/useEnter";
import { DUR } from "@/lib/motion";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: React.ReactNode;
    delay?: number;
    /** 진입 시 위로 올라오는 거리(px). 토큰 규칙상 20을 넘기지 않는다. */
    y?: number;
    /** 큰 블록에만 켜는 포커스 인 효과. */
    blur?: boolean;
}

/**
 * 섹션·카드 공통 진입 모션. 모든 값은 lib/motion.ts의 토큰에서 온다.
 * 모션 축소 처리는 useEnter가 흡수한다.
 */
export function Reveal({
    children,
    delay = 0,
    y = 16,
    blur = false,
    ...props
}: RevealProps) {
    const enter = useEnter({ y, delay, blur, duration: DUR.slow });

    return (
        <motion.div {...enter} {...props}>
            {children}
        </motion.div>
    );
}
