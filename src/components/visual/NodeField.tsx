"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
}

interface NodeFieldProps {
    className?: string;
    /** 화면 100만 픽셀당 노드 수. 밀도를 올리면 더 촘촘해진다. */
    density?: number;
    /** 이 거리 안의 노드끼리 선을 잇는다(px). */
    linkDistance?: number;
    opacity?: number;
}

// ponytail: 이웃 탐색이 O(n²). 노드 상한이 90이라 프레임당 4천 비교 수준으로,
// 공간 해싱이 필요할 규모가 아니다. 밀도를 크게 올릴 일이 생기면 그때 격자로 나눈다.
const MAX_NODES = 90;

/**
 * 에이전트 노드 네트워크. 레퍼런스의 풀블리드 사진 자리를 대신한다.
 * three.js 없이 Canvas 2D만 쓰고, 화면 밖이면 렌더 루프를 멈춘다.
 */
export function NodeField({
    className,
    density = 42,
    linkDistance = 132,
    opacity = 1,
}: NodeFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prefersReduced = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        let nodes: Node[] = [];
        let width = 0;
        let height = 0;
        let frame = 0;
        let visible = true;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const seed = () => {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(
                MAX_NODES,
                Math.round((width * height) / 1_000_000 * density) + 18
            );

            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.16,
                vy: (Math.random() - 0.5) * 0.16,
                r: Math.random() * 1.1 + 0.7,
            }));
        };

        const draw = () => {
            context.clearRect(0, 0, width, height);

            for (let i = 0; i < nodes.length; i += 1) {
                const a = nodes[i];

                for (let j = i + 1; j < nodes.length; j += 1) {
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.hypot(dx, dy);
                    if (distance > linkDistance) continue;

                    const strength = (1 - distance / linkDistance) * 0.22;
                    context.strokeStyle = `rgba(255,255,255,${strength})`;
                    context.lineWidth = 0.6;
                    context.beginPath();
                    context.moveTo(a.x, a.y);
                    context.lineTo(b.x, b.y);
                    context.stroke();
                }

                context.fillStyle = "rgba(255,255,255,0.55)";
                context.beginPath();
                context.arc(a.x, a.y, a.r, 0, Math.PI * 2);
                context.fill();
            }
        };

        const step = () => {
            for (const node of nodes) {
                node.x += node.vx;
                node.y += node.vy;

                // 가장자리에서 반사시켜 노드가 화면 밖으로 빠져나가지 않게 한다
                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;
            }

            draw();
            frame = requestAnimationFrame(step);
        };

        seed();
        draw();

        // 화면 밖에서는 루프를 돌리지 않는다
        const observer = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                cancelAnimationFrame(frame);
                if (visible && !prefersReduced) frame = requestAnimationFrame(step);
            },
            { threshold: 0 }
        );
        observer.observe(canvas);

        const handleResize = () => {
            seed();
            draw();
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            window.removeEventListener("resize", handleResize);
        };
    }, [density, linkDistance, prefersReduced]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            style={{ opacity }}
            className={cn("pointer-events-none h-full w-full", className)}
        />
    );
}
