"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useScroll,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeId, setActiveId] = useState<string>("");
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

    // 현재 화면에 걸린 섹션 하이라이트
    useEffect(() => {
        const sections = NAV_ITEMS.map((item) =>
            document.querySelector(item.href)
        ).filter((el): el is Element => el !== null);

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) setActiveId(`#${visible.target.id}`);
            },
            { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] }
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    // 모바일 메뉴가 열린 동안 배경 스크롤 잠금
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            <header
                className={cn(
                    "fixed inset-x-0 top-0 z-[110] transition-colors duration-500",
                    scrolled && !isOpen
                        ? "border-b border-border bg-bg/72 backdrop-blur-xl backdrop-saturate-150"
                        : "border-b border-transparent"
                )}
            >
                <nav
                    aria-label="주요 메뉴"
                    className="container-x flex h-16 items-center justify-between gap-6 md:h-[68px]"
                >
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="relative z-[120] flex items-baseline gap-2"
                    >
                        <span className="font-mono text-[17px] font-medium tracking-[-0.02em]">
                            {SITE.name}
                        </span>
                        <span className="hidden text-[13px] text-faint sm:inline">
                            {SITE.slogan}
                        </span>
                    </Link>

                    <ul className="hidden items-center gap-1 md:flex">
                        {NAV_ITEMS.map((item) => {
                            const isActive = activeId === item.href;

                            return (
                                <li key={item.href} className="relative">
                                    <a
                                        href={item.href}
                                        className={cn(
                                            "relative z-10 block rounded-full px-3.5 py-1.5 font-mono text-[12.5px] tracking-[0.02em] transition-colors duration-300",
                                            isActive ? "text-text" : "text-muted hover:text-text"
                                        )}
                                    >
                                        {item.label}
                                    </a>
                                    {isActive ? (
                                        <motion.span
                                            layoutId="nav-pill"
                                            className="absolute inset-0 rounded-full bg-surface-2"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 34,
                                            }}
                                        />
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={() => setIsOpen((open) => !open)}
                            aria-expanded={isOpen}
                            aria-controls="mobile-menu"
                            aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
                            className="relative z-[120] grid size-9 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-text md:hidden"
                        >
                            {isOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    </div>
                </nav>
            </header>

            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        id="mobile-menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="fixed inset-0 z-[100] flex flex-col justify-center bg-bg px-6 md:hidden"
                    >
                        <ul className="space-y-1">
                            {NAV_ITEMS.map((item, index) => (
                                <motion.li
                                    key={item.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.1 + index * 0.055,
                                        duration: 0.5,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                >
                                    <a
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-baseline gap-4 border-b border-border py-4 text-2xl tracking-[-0.03em]"
                                    >
                                        <span className="font-mono text-[11px] text-faint">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        {item.label}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="type-eyebrow absolute bottom-10 left-6"
                        >
                            {SITE.slogan} — {SITE.fullName}
                        </motion.p>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}
