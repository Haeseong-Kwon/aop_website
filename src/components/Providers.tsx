"use client";

import { MotionConfig } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";
import { EASE } from "@/lib/motion";

export function Providers({ children }: { children: React.ReactNode }) {
    useLenis();

    return (
        <MotionConfig reducedMotion="user" transition={{ ease: EASE.out }}>
            {children}
        </MotionConfig>
    );
}
