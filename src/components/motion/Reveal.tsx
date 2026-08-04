"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: React.ReactNode;
    delay?: number;
    /** 진입 시 위로 올라오는 거리(px). */
    y?: number;
}

/**
 * 섹션·카드 공통 진입 모션. reducedMotion="user"가 걸려 있어
 * 모션 축소 환경에서는 opacity 페이드만 남는다.
 */
export function Reveal({
    children,
    delay = 0,
    y = 24,
    ...props
}: RevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
