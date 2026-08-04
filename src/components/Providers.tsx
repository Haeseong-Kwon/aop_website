"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { useLenis } from "@/hooks/useLenis";

export function Providers({ children }: { children: React.ReactNode }) {
    useLenis();

    return (
        <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark"]}
        >
            <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
                {children}
            </MotionConfig>
        </ThemeProvider>
    );
}
