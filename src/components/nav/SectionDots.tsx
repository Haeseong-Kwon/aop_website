"use client";

import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TARGETS = [{ label: "Home", href: "#hero" }, ...NAV_ITEMS];

/** 우측 섹션 인디케이터. 데스크톱에서만 뜬다. */
export function SectionDots() {
    const [activeId, setActiveId] = useState("#hero");

    useEffect(() => {
        const sections = TARGETS.map((item) =>
            document.querySelector(item.href)
        ).filter((el): el is Element => el !== null);

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) setActiveId(`#${visible.target.id}`);
            },
            { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5] }
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    return (
        <nav
            aria-label="섹션 바로가기"
            className="fixed right-6 top-1/2 z-[105] hidden -translate-y-1/2 flex-col gap-3.5 lg:flex"
        >
            {TARGETS.map((item) => {
                const isActive = activeId === item.href;

                return (
                    <a
                        key={item.href}
                        href={item.href}
                        aria-label={item.label}
                        aria-current={isActive ? "true" : undefined}
                        className="group grid size-3 place-items-center"
                    >
                        <span
                            className={cn(
                                "transition-all duration-500",
                                isActive
                                    ? "size-[7px] bg-bright"
                                    : "size-[5px] bg-faint group-hover:bg-muted"
                            )}
                        />
                    </a>
                );
            })}
        </nav>
    );
}
