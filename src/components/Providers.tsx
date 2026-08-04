"use client";

import { MotionConfig } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";

export function Providers({ children }: { children: React.ReactNode }) {
    useLenis();

    return (
        <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
            {children}
        </MotionConfig>
    );
}
