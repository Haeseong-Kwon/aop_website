"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRichMotion } from "@/hooks/useReducedMotion";

const RADIUS = 80;
const MAX_PULL = 8;

interface MagneticButtonProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    external?: boolean;
}

/**
 * 커서가 반경 80px 안에 들어오면 최대 8px까지 끌려가는 링크.
 * 터치·모션 축소 환경에서는 일반 링크로 동작한다.
 */
export function MagneticButton({
    children,
    href,
    className,
    external = false,
}: MagneticButtonProps) {
    const ref = useRef<HTMLAnchorElement>(null);
    const rich = useRichMotion();

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 });
    const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 });

    const handleMove = (event: React.MouseEvent) => {
        if (!rich || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        if (distance > RADIUS + Math.max(rect.width, rect.height) / 2) return;

        const strength = Math.min(1, RADIUS / Math.max(distance, 1));
        x.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, dx * 0.35 * strength)));
        y.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, dy * 0.35 * strength)));
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.a
            ref={ref}
            href={href}
            className={className}
            style={rich ? { x: springX, y: springY } : undefined}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            onBlur={reset}
            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        >
            {children}
        </motion.a>
    );
}
