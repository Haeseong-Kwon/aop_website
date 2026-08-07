"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * 스크롤이 각도를 만드는 정육면체.
 *
 * 자동 회전은 쓰지 않는다 — 혼자 도는 물체는 배경 장식이지만, 스크롤이 각도를
 * 만들면 읽는 사람의 동작이 곧 회전이 된다. 여섯 면에는 실행 계층의 단계를 새겨
 * 돌 때마다 다음 단계가 정면으로 온다.
 *
 * WebGL을 쓰지 않는 이유: Frontier 섹션이 이미 캔버스를 하나 물고 있다.
 * 히어로에 두 번째 컨텍스트를 띄우는 값이 이 그림 하나에 비해 너무 비싸다.
 */

const FACES = [
    { label: "PLAN", rotate: "rotateY(0deg)" },
    { label: "EXECUTE", rotate: "rotateY(90deg)" },
    { label: "VERIFY", rotate: "rotateY(180deg)" },
    { label: "RECOVER", rotate: "rotateY(270deg)" },
    { label: "TRACE", rotate: "rotateX(90deg)" },
    { label: "STATE", rotate: "rotateX(-90deg)" },
] as const;

interface ScrollCubeProps {
    /** 0~1 스크롤 진행도. 이 값이 회전각이 된다. */
    progress: MotionValue<number>;
    /** 한 변의 길이(CSS 길이). 면을 밀어내는 거리는 이 값의 절반이다. */
    size?: string;
    className?: string;
}

export function ScrollCube({
    progress,
    size = "clamp(9rem,14vw,13.5rem)",
    className,
}: ScrollCubeProps) {
    // 반 바퀴 조금 못 되게 돈다. 한 바퀴를 다 돌리면 시작과 끝이 같은 면이 된다.
    const rotateY = useTransform(progress, [0, 1], [-38, 128]);
    const rotateX = useTransform(progress, [0, 1], [17, -13]);

    return (
        <div
            aria-hidden
            className={cn("pointer-events-none select-none", className)}
            style={{
                width: size,
                height: size,
                perspective: "1100px",
                // 면을 밀어내는 거리 — 한 변의 절반이라야 정육면체가 닫힌다
                ["--half" as string]: `calc(${size} / 2)`,
            }}
        >
            <motion.div
                className="relative h-full w-full"
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            >
                {FACES.map((face) => (
                    <div
                        key={face.label}
                        className="absolute inset-0 border border-glow/22 bg-[linear-gradient(150deg,rgba(74,140,255,0.16),rgba(0,0,0,0.55))]"
                        style={{ transform: `${face.rotate} translateZ(var(--half))` }}
                    >
                        {/* 면 위의 격자 — 빈 유리판은 입체보다 판넬로 읽힌다 */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(188,216,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(188,216,255,0.08)_1px,transparent_1px)] bg-[size:22px_22px]" />
                        {/* 상단 엣지 라이트 — 모서리가 광원이 되어야 면이 얇게 읽힌다 */}
                        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-glow),transparent)] opacity-60" />

                        <span className="absolute left-2.5 top-2.5 font-mono text-[9px] tracking-[0.2em] text-glow/75">
                            {face.label}
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 size-1 rounded-full bg-glow/60" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
