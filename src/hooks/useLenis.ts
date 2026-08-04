"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

/**
 * 관성 스크롤. prefers-reduced-motion에서는 아예 붙이지 않아 네이티브 스크롤을 유지한다.
 */
export function useLenis() {
    const prefersReduced = useReducedMotion();

    useEffect(() => {
        if (prefersReduced) return;

        const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

        let frame = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);

        // 앵커 링크(#section)를 lenis 경유로 이동시켜 네이티브 점프와 충돌하지 않게 한다.
        const handleAnchorClick = (event: MouseEvent) => {
            const anchor = (event.target as HTMLElement | null)?.closest?.(
                'a[href^="#"]'
            ) as HTMLAnchorElement | null;
            if (!anchor) return;

            const id = anchor.getAttribute("href");
            if (!id || id === "#") return;

            const target = document.querySelector(id);
            if (!target) return;

            event.preventDefault();
            lenis.scrollTo(target as HTMLElement, { offset: -80 });
        };

        document.addEventListener("click", handleAnchorClick);

        return () => {
            document.removeEventListener("click", handleAnchorClick);
            cancelAnimationFrame(frame);
            lenis.destroy();
        };
    }, [prefersReduced]);
}
