"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * 화면 위 요소를 검출하는 인식 레이어 — 평면 사각형이 아니라 깊이를 가진 판이다.
 *
 * 이전 버전은 화면 위에 2D 사각형을 얹고 스캔라인 한 줄을 내렸다. 그림은 붙었지만
 * "에이전트가 평면 픽셀에서 계층을 복원한다"는 주장은 어디에도 없었다.
 * 지금은 스캔 평면이 표면에서 솟아 훑고 지나가고, 검출된 영역은 그 자리에서
 * 판으로 떠올랐다가 제 좌표로 내려앉는다 — 인식의 순서가 공간으로 보인다.
 *
 * 마지막 상태에서 판은 표면에 거의 붙는다. 계속 떠 있으면 좌표가 어긋나 보이고,
 * 그러면 이 레이어는 인식이 아니라 장식이 된다.
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
const BRACKET = 12;

/** 카메라 거리. 작을수록 입체감이 세지고 판이 커 보인다. */
const PERSPECTIVE = 900;

/** 스캔 중 판이 표면에서 떠오르는 높이(px). */
const LIFT = 64;

/**
 * 착지 후 남기는 부양(px). 층이 다르다는 것만 남기는 값이라 좌표는 어긋나지 않는다
 * — 900px 원근에서 21px는 2.4% 확대이고, 그 이상 띄우면 박스가 대상에서 벗어난다.
 */
const REST = [0, 7, 14, 21];

/** 스캔 평면이 표면 위로 세우는 벽의 높이(px). */
const PLANE_DEPTH = 110;

function Plate({
    box,
    index,
    delay,
}: {
    box: DetectionBox;
    index: number;
    delay: number;
}) {
    const prefersReduced = useReducedMotion();
    const rest = REST[index % REST.length];

    return (
        <motion.div
            className="absolute"
            style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                transformStyle: "preserve-3d",
            }}
            variants={{
                idle: { opacity: 0, z: LIFT + rest, rotateX: -12 },
                scanned: { opacity: 1, z: rest, rotateX: 0 },
            }}
            transition={
                prefersReduced
                    ? { duration: 0.01 }
                    : { duration: DUR.slow, delay, ease: EASE.out }
            }
        >
            {/* 판의 몸통 — 유리 한 겹. 아래 화면이 비쳐야 '위에 얹혔다'로 읽힌다 */}
            <span className="absolute inset-0 bg-[linear-gradient(150deg,rgba(188,216,255,0.09),rgba(74,140,255,0.02)_60%,transparent)]" />
            <span className="absolute inset-0 border border-glow/12" />

            {/*
             * 네 모서리를 각각 절대 배치한다. SVG로 그리면 박스마다 종횡비가 달라
             * preserveAspectRatio="none"에서 브래킷이 찌그러진다.
             */}
            <span className="absolute left-0 top-0 border-l border-t border-glow/80" style={{ width: BRACKET, height: BRACKET }} />
            <span className="absolute right-0 top-0 border-r border-t border-glow/80" style={{ width: BRACKET, height: BRACKET }} />
            <span className="absolute bottom-0 right-0 border-b border-r border-glow/80" style={{ width: BRACKET, height: BRACKET }} />
            <span className="absolute bottom-0 left-0 border-b border-l border-glow/80" style={{ width: BRACKET, height: BRACKET }} />

            {/* 중심 키포인트 + 십자 눈금 */}
            <span className="absolute left-1/2 top-1/2 h-px w-2.5 -translate-x-1/2 -translate-y-1/2 bg-glow/50" />
            <span className="absolute left-1/2 top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-glow/50" />

            <span
                className={cn(
                    "absolute flex items-center gap-1.5 whitespace-nowrap border border-glow/35 bg-black/72 px-1.5 py-[3px] font-mono text-[10px] leading-none tracking-[0.04em] text-glow backdrop-blur-[2px]",
                    // 위쪽 박스는 라벨을 아래에, 아래쪽 박스는 위에 — 프레임 밖으로 나가지 않게
                    box.y < 12 ? "left-0 top-full mt-1.5" : "bottom-full left-0 mb-1.5"
                )}
            >
                {box.label}
                <span className="h-2.5 w-px bg-glow/30" />
                <span className="text-glow/65">{box.confidence.toFixed(2)}</span>
            </span>
        </motion.div>
    );
}

/**
 * 표면을 훑고 지나가는 스캔 평면.
 *
 * 선 한 줄이 아니라 세워진 판이다 — 바닥의 밝은 경계선과, 거기서 화면 앞쪽으로
 * 솟은 격자 벽이 함께 내려간다. 라이다 한 스윕이 지나간 자리처럼 보여야 한다.
 */
function ScanPlane() {
    return (
        <motion.div
            className="absolute inset-x-0 top-0 h-0"
            style={{ transformStyle: "preserve-3d" }}
            variants={{
                idle: { top: "0%", opacity: 0 },
                scanned: { top: "100%", opacity: [0, 1, 1, 0] },
            }}
            transition={{ duration: 1.35, ease: EASE.inOut }}
        >
            {/* 표면과 만나는 경계선 */}
            <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-glow),transparent)]" />
            {/* 앞쪽으로 세워진 격자 벽 */}
            <span
                className="absolute inset-x-0 bottom-0 origin-bottom"
                style={{
                    height: PLANE_DEPTH,
                    transform: "rotateX(-90deg)",
                    backgroundImage:
                        "linear-gradient(to top, rgba(188,216,255,0.2), transparent 78%), repeating-linear-gradient(90deg, rgba(188,216,255,0.16) 0 1px, transparent 1px 36px)",
                }}
            />
        </motion.div>
    );
}

interface DetectionOverlayProps {
    boxes: readonly DetectionBox[];
    /** 스캔 평면이 지나가고 판이 붙기 시작하는 조건. */
    active: boolean;
    className?: string;
}

export function DetectionOverlay({ boxes, active, className }: DetectionOverlayProps) {
    const prefersReduced = useReducedMotion();

    return (
        /*
         * 클리핑은 바깥에서만 한다. overflow:hidden은 그 요소의 3D 컨텍스트를
         * 평면으로 접어버려서, 같은 요소에 perspective를 걸면 입체가 통째로 사라진다.
         */
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden",
                className
            )}
        >
            <div
                className="absolute inset-0"
                style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 38%" }}
            >
                <motion.div
                    initial="idle"
                    animate={active ? "scanned" : "idle"}
                    className="relative h-full w-full"
                    style={{ transformStyle: "preserve-3d" }}
                    /*
                     * 스캔하는 동안만 무대를 기울인다. 기울어져 있어야 떠오른 판의
                     * 시차가 보이고, 다 읽고 나면 0으로 돌아와야 박스가 대상 위에
                     * 정확히 놓인다. 계속 기울여 두면 좌표가 어긋난 그림이 된다.
                     */
                    variants={
                        prefersReduced
                            ? { idle: {}, scanned: {} }
                            : {
                                  idle: { rotateX: 0, rotateY: 0 },
                                  scanned: {
                                      rotateX: [0, -11, -11, 0],
                                      rotateY: [0, 9, 9, 0],
                                  },
                              }
                    }
                    transition={{
                        duration: 2.6,
                        times: [0, 0.24, 0.68, 1],
                        ease: EASE.inOut,
                    }}
                >
                    {/*
                     * 스캔은 한 번만 훑고 사라진다. 계속 왕복하면 '지금 인식했다'는
                     * 신호가 '항상 인식 중'이라는 소음으로 바뀐다.
                     */}
                    {prefersReduced ? null : <ScanPlane />}

                    {boxes.map((box, index) => (
                        <Plate
                            key={box.label + index}
                            box={box}
                            index={index}
                            // 스캔 평면이 그 높이를 지날 때 판이 내려앉는다
                            delay={
                                prefersReduced
                                    ? 0
                                    : 0.2 + (box.y / 100) * 1.05 + index * STAGGER.tight
                            }
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
