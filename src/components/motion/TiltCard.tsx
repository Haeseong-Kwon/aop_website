"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRichMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/*
 * 커서를 따라 기우는 3D 틸트 + 커서 위치를 따라오는 하이라이트.
 *
 * 각도를 6도 위로 올리면 스크린샷 속 글자가 사다리꼴로 뭉개져서, 실화면을 보여준다는
 * 목적 자체가 무너진다. 기울기는 '만질 수 있다'는 신호까지만 준다.
 */

const MAX_DEG = 6;

export function TiltCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const rich = useRichMotion();

    // -0.5 ~ 0.5 범위의 정규화된 커서 위치
    const px = useMotionValue(0);
    const py = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 18, mass: 0.4 };
    const rotateX = useSpring(
        useTransform(py, [-0.5, 0.5], [MAX_DEG, -MAX_DEG]),
        springConfig
    );
    const rotateY = useSpring(
        useTransform(px, [-0.5, 0.5], [-MAX_DEG, MAX_DEG]),
        springConfig
    );

    const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;

        px.set(nx);
        py.set(ny);

        // 하이라이트는 CSS 변수로 넘긴다 — 리렌더 없이 그라디언트만 이동한다
        event.currentTarget.style.setProperty("--tx", `${(nx + 0.5) * 100}%`);
        event.currentTarget.style.setProperty("--ty", `${(ny + 0.5) * 100}%`);
    };

    const handleLeave = () => {
        px.set(0);
        py.set(0);
    };

    if (!rich) return <div className={className}>{children}</div>;

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ perspective: 1200 }}
            className={cn("tilt-stage", className)}
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative"
            >
                {children}
                {/* 커서 추종 하이라이트 — 표면이 빛을 받는 방향을 알려준다 */}
                <span aria-hidden className="tilt-sheen" />
            </motion.div>
        </div>
    );
}
