"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** 히어로 하단 스크롤 유도. 캡슐 안에서 점이 내려간다. */
export function ScrollCue() {
    const prefersReduced = useReducedMotion();

    return (
        <div className="flex flex-col items-center gap-2.5">
            <span className="flex h-8 w-[19px] items-start justify-center rounded-full border border-border-strong pt-1.5">
                <motion.span
                    className="size-1 rounded-full bg-text"
                    animate={prefersReduced ? undefined : { y: [0, 11, 0], opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                Scroll
            </span>
        </div>
    );
}
