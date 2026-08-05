"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * 화면 위 요소를 검출한 것처럼 보이는 인식 레이어.
 *
 * Frontier의 CvOverlay는 3D 좌표를 camera.project()로 투영하지만, 이쪽은 DOM 요소
 * 위에 퍼센트 좌표로 붙는다. 스크린샷·그래픽처럼 대상이 평면일 때는 3D 투영을 쓸
 * 이유가 없다.
 *
 * 이 레이어의 근거: 자사 제품 화면을 에이전트가 읽는다는 것이 Frontier의
 * Visual Grounding 트랙 내용 그대로다. 장식이 아니라 같은 주장의 다른 표현이다.
 */

export interface DetectionBox {
    /** 대상 요소 기준 퍼센트(0~100). */
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    confidence: number;
}

/** 모서리 브래킷 길이(px). 네 변을 다 그리면 아래 내용이 가려진다. */
const BRACKET = 10;

function Bracket({ box, delay }: { box: DetectionBox; delay: number }) {
    const prefersReduced = useReducedMotion();

    return (
        <motion.div
            className="absolute"
            style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
            }}
            variants={{
                idle: { opacity: 0 },
                scanned: { opacity: 1 },
            }}
            transition={
                prefersReduced
                    ? { duration: 0.01 }
                    : { duration: DUR.fast, delay, ease: EASE.out }
            }
        >
            {/*
             * 네 모서리를 각각 절대 배치한다. SVG로 그리면 박스마다 종횡비가 달라
             * preserveAspectRatio="none"에서 브래킷이 찌그러진다.
             */}
            <span className="absolute left-0 top-0 border-l border-t border-glow" style={{ width: BRACKET, height: BRACKET }} />
            <span className="absolute right-0 top-0 border-r border-t border-glow" style={{ width: BRACKET, height: BRACKET }} />
            <span className="absolute bottom-0 right-0 border-b border-r border-glow" style={{ width: BRACKET, height: BRACKET }} />
            <span className="absolute bottom-0 left-0 border-b border-l border-glow" style={{ width: BRACKET, height: BRACKET }} />

            {/* 중심 키포인트 */}
            <span className="absolute left-1/2 top-1/2 size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow" />

            <span
                className={cn(
                    "absolute whitespace-nowrap rounded-[3px] bg-beam/90 px-1.5 py-[3px] font-mono text-[10px] leading-none text-white",
                    // 위쪽 박스는 라벨을 아래에, 아래쪽 박스는 위에 — 프레임 밖으로 나가지 않게
                    box.y < 12 ? "left-0 top-full mt-1" : "bottom-full left-0 mb-1"
                )}
            >
                {box.label} · {box.confidence.toFixed(2)}
            </span>
        </motion.div>
    );
}

interface DetectionOverlayProps {
    boxes: readonly DetectionBox[];
    /** 스캔라인이 지나가고 박스가 붙기 시작하는 조건. */
    active: boolean;
    className?: string;
}

export function DetectionOverlay({ boxes, active, className }: DetectionOverlayProps) {
    const prefersReduced = useReducedMotion();

    return (
        <motion.div
            aria-hidden
            initial="idle"
            animate={active ? "scanned" : "idle"}
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden",
                className
            )}
        >
            {/*
             * 스캔라인은 한 번만 훑고 사라진다. 계속 왕복하면 무한 반복 금지에 걸리고,
             * 무엇보다 '지금 인식했다'는 신호가 '항상 인식 중'이라는 소음으로 바뀐다.
             */}
            {prefersReduced ? null : (
                <motion.span
                    className="absolute inset-x-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-glow),transparent)]"
                    variants={{
                        idle: { top: "0%", opacity: 0 },
                        scanned: { top: "100%", opacity: [0, 1, 1, 0] },
                    }}
                    transition={{ duration: 1.1, ease: EASE.inOut }}
                />
            )}

            {boxes.map((box, index) => (
                <Bracket
                    key={box.label + index}
                    box={box}
                    // 스캔라인이 그 높이를 지나는 시점에 맞춰 박스가 붙는다
                    delay={prefersReduced ? 0 : 0.15 + (box.y / 100) * 0.9 + index * STAGGER.tight}
                />
            ))}
        </motion.div>
    );
}
