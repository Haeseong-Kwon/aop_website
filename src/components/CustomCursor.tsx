"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRichMotion } from "@/hooks/useReducedMotion";

type CursorMode = "default" | "link" | "card";

const RING_SIZE = { default: 28, link: 48, card: 64 } as const;

/**
 * 도트 + 지연 추종 링. 터치 기기와 prefers-reduced-motion에서는 렌더 자체를 하지 않는다.
 * 카드에는 data-cursor="card"를 붙이면 링 안에 VIEW 라벨이 뜬다.
 */
export function CustomCursor() {
    const rich = useRichMotion();
    const [mode, setMode] = useState<CursorMode>("default");
    const [visible, setVisible] = useState(false);

    const dotX = useMotionValue(-100);
    const dotY = useMotionValue(-100);
    const ringX = useSpring(dotX, { stiffness: 150, damping: 20, mass: 0.5 });
    const ringY = useSpring(dotY, { stiffness: 150, damping: 20, mass: 0.5 });

    useEffect(() => {
        if (!rich) return;

        const handleMove = (event: MouseEvent) => {
            dotX.set(event.clientX);
            dotY.set(event.clientY);
            setVisible(true);

            const target = event.target as HTMLElement | null;
            if (target?.closest?.('[data-cursor="card"]')) {
                setMode("card");
            } else if (target?.closest?.("a, button, [role='button'], input, textarea, select")) {
                setMode("link");
            } else {
                setMode("default");
            }
        };

        const handleLeave = () => setVisible(false);

        window.addEventListener("mousemove", handleMove, { passive: true });
        document.addEventListener("mouseleave", handleLeave);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseleave", handleLeave);
        };
    }, [rich, dotX, dotY]);

    if (!rich) return null;

    const size = RING_SIZE[mode];

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
            <motion.div
                className="absolute rounded-full bg-text"
                style={{ x: dotX, y: dotY, width: 6, height: 6, translateX: "-50%", translateY: "-50%" }}
                animate={{ opacity: visible && mode === "default" ? 1 : 0 }}
                transition={{ duration: 0.2 }}
            />
            <motion.div
                className="absolute flex items-center justify-center rounded-full border border-text font-mono text-[9px] tracking-[0.18em] text-text mix-blend-difference"
                style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
                animate={{
                    width: size,
                    height: size,
                    opacity: visible ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
                <motion.span animate={{ opacity: mode === "card" ? 1 : 0 }} transition={{ duration: 0.2 }}>
                    VIEW
                </motion.span>
            </motion.div>
        </div>
    );
}
