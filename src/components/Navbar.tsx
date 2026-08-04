"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
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
                        ? "border-b border-border bg-bg/70 backdrop-blur-xl"
                        : "border-b border-transparent"
                )}
            >
                <nav
                    aria-label="주요 메뉴"
                    className="container-x flex h-16 items-center justify-between md:h-20"
                >
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="relative z-[120] font-mono text-lg tracking-[-0.02em]"
                    >
                        {SITE.name}
                    </Link>

                    <ul className="hidden items-center gap-8 md:flex">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className={cn(
                                        "underline-sweep font-mono text-[13px] tracking-[0.06em] transition-colors duration-300",
                                        activeId === item.href
                                            ? "text-text"
                                            : "text-muted hover:text-text"
                                    )}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <button
                        type="button"
                        onClick={() => setIsOpen((open) => !open)}
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                        aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
                        className="relative z-[120] -mr-2 p-2 md:hidden"
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
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
                        <ul className="space-y-2">
                            {NAV_ITEMS.map((item, index) => (
                                <motion.li
                                    key={item.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.1 + index * 0.06,
                                        duration: 0.5,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                >
                                    <a
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block py-3 text-3xl tracking-[-0.03em]"
                                    >
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
