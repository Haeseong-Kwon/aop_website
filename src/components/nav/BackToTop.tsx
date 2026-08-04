"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
    const [shown, setShown] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (value) => setShown(value > 700));

    return (
        <AnimatePresence>
            {shown ? (
                <motion.a
                    href="#hero"
                    aria-label="맨 위로"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.35 }}
                    className="fixed bottom-7 right-6 z-[105] grid size-12 place-items-center rounded-full border border-border-strong bg-bg/70 text-text backdrop-blur-md transition-colors hover:border-bright hover:text-bright"
                >
                    <ArrowUp size={18} strokeWidth={1.5} />
                </motion.a>
            ) : null}
        </AnimatePresence>
    );
}
