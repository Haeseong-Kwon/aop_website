"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * 라이트/다크 토글.
 * 어떤 아이콘을 보일지는 html[data-theme]를 읽는 CSS가 결정한다 —
 * 마운트 플래그 없이도 서버/클라이언트 마크업이 같아 하이드레이션이 깨지지 않는다.
 */
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="라이트/다크 테마 전환"
            className="relative grid size-9 place-items-center overflow-hidden rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-text"
        >
            <Sun size={15} className="theme-icon theme-icon-light" />
            <Moon size={15} className="theme-icon theme-icon-dark" />
        </button>
    );
}
