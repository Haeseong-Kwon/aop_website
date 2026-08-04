"use client";

import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

/**
 * 마우스 좌표를 --mx/--my CSS 변수로 넘겨 radial-gradient 하이라이트가 커서를 따라온다.
 * 하이라이트 자체는 globals.css의 .spotlight가 그린다(리렌더 없음).
 */
export function SpotlightCard({
    children,
    className,
    ...props
}: SpotlightCardProps) {
    const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
            "--mx",
            `${event.clientX - rect.left}px`
        );
        event.currentTarget.style.setProperty(
            "--my",
            `${event.clientY - rect.top}px`
        );
    };

    return (
        <div
            onMouseMove={handleMove}
            className={cn("surface-card spotlight relative overflow-hidden", className)}
            {...props}
        >
            {children}
        </div>
    );
}
