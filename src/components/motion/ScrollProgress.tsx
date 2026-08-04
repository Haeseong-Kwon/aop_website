"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 220,
        damping: 40,
        restDelta: 0.001,
    });

    return (
        <motion.div
            aria-hidden
            style={{ scaleX }}
            className="fixed inset-x-0 top-0 z-[120] h-0.5 origin-left bg-bright"
        />
    );
}
