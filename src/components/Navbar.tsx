"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** 레퍼런스를 따라 화면 상단에 떠 있는 알약형 내비. */
export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeId, setActiveId] = useState("");

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
            <header className="fixed inset-x-0 top-4 z-[110] flex justify-center px-4 md:top-6">
                <nav
                    aria-label="주요 메뉴"
                    className={cn(
                        "flex w-full max-w-3xl items-center justify-between gap-4 py-2.5 pl-5 pr-2.5 md:pl-6",
                        isOpen ? "bg-transparent" : "pill-bar"
                    )}
                >
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="relative z-[120] flex items-baseline gap-2"
                    >
                        <span className="font-mono text-[16px] font-medium tracking-[-0.02em] text-bright">
                            {SITE.name}
                        </span>
                        <span className="hidden text-[12px] text-faint sm:inline">
                            {SITE.slogan}
                        </span>
                    </Link>

                    <ul className="hidden items-center gap-0.5 md:flex">
                        {NAV_ITEMS.map((item) => {
                            const isActive = activeId === item.href;

                            return (
                                <li key={item.href} className="relative">
                                    <a
                                        href={item.href}
                                        className={cn(
                                            "relative z-10 block rounded-full px-3 py-1.5 font-mono text-[12px] tracking-[0.02em] transition-colors duration-300",
                                            isActive
                                                ? "text-bright"
                                                : "text-muted hover:text-bright"
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

                    <button
                        type="button"
                        onClick={() => setIsOpen((open) => !open)}
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                        aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
                        className="relative z-[120] grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted transition-colors hover:border-bright hover:text-bright md:hidden"
                    >
                        {isOpen ? <X size={16} /> : <Menu size={16} />}
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
                                        className="flex items-baseline gap-4 border-b border-border py-4 text-2xl tracking-[-0.03em] text-bright"
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
