"use client";

import type { Projected } from "@/components/frontier/PerceptionScene";
import { isAlertAnchor, type ShapeAnchor } from "@/components/frontier/shapes";
import { cn } from "@/lib/utils";

/*
 * 3D 위에 겹치는 2D 인식 오버레이.
 *
 * 좌표는 camera.project()로 계산해 넘어온 화면 픽셀이라, 오브젝트가 돌면 박스도
 * 같이 돈다. 박스는 3D 스캔 시트가 그 높이를 지나간 뒤에야 붙는다 — 고정된 장식 박스를
 * 얹어 '인식하는 척'하면 이 섹션의 주장 자체가 거짓이 된다.
 *
 * 박스는 모서리 브래킷만 그린다 — 네 변을 다 그리면 파티클을 가린다. 라벨은 박스 오른쪽
 * 위로 짧은 지시선을 빼서 단다. 박스 아래에 붙이면 가까운 앵커끼리 라벨이 겹친다.
 */

const BRACKET = 7;
const HALF = 22;

export function CvOverlay({
    anchors,
    projected,
}: {
    anchors: readonly ShapeAnchor[];
    projected: readonly Projected[];
}) {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {anchors.map((anchor, index) => {
                const point = projected[index];
                const isShown = Boolean(point?.visible && point.revealed);
                const isAlert = isAlertAnchor(anchor);
                const stroke = isAlert ? "var(--color-destructive)" : "var(--color-glow)";
                const isFlipped = Boolean(point?.flip);

                return (
                    <div
                        key={anchor.label + index}
                        className="absolute transition-[opacity,scale] duration-500 ease-out"
                        style={{
                            left: point?.x ?? 0,
                            top: point?.y ?? 0,
                            transform: "translate(-50%, -50%)",
                            opacity: isShown ? 1 : 0,
                            scale: isShown ? "1" : "1.35",
                        }}
                    >
                        <svg
                            width={HALF * 2}
                            height={HALF * 2}
                            viewBox={`0 0 ${HALF * 2} ${HALF * 2}`}
                            className="overflow-visible"
                        >
                            {[
                                `M0 ${BRACKET} V0 H${BRACKET}`,
                                `M${HALF * 2 - BRACKET} 0 H${HALF * 2} V${BRACKET}`,
                                `M${HALF * 2} ${HALF * 2 - BRACKET} V${HALF * 2} H${HALF * 2 - BRACKET}`,
                                `M${BRACKET} ${HALF * 2} H0 V${HALF * 2 - BRACKET}`,
                            ].map((d) => (
                                <path key={d} d={d} fill="none" stroke={stroke} strokeWidth={1.25} />
                            ))}
                            <circle cx={HALF} cy={HALF} r={2} fill={stroke} />
                            {/* 지시선: 박스 오른쪽 위 모서리에서 라벨까지 */}
                            <path
                                d={
                                    isFlipped
                                        ? "M0 0 L-14 -14 H-22"
                                        : `M${HALF * 2} 0 L${HALF * 2 + 14} -14 H${HALF * 2 + 22}`
                                }
                                fill="none"
                                stroke={stroke}
                                strokeOpacity={0.6}
                                strokeWidth={1}
                            />
                        </svg>

                        <span
                            className={cn(
                                "absolute top-[-21px] flex items-center gap-1.5 whitespace-nowrap rounded-[3px] border bg-black/75 px-1.5 py-[3px] font-mono text-[10px] leading-none tracking-[0.04em] backdrop-blur-[2px]",
                                isFlipped ? "right-[calc(100%+22px)]" : "left-[calc(100%+22px)]",
                                isAlert
                                    ? "border-destructive/50 text-destructive"
                                    : "border-glow/35 text-glow"
                            )}
                        >
                            {anchor.label}
                            <span className={cn("h-2.5 w-px", isAlert ? "bg-destructive/40" : "bg-glow/30")} />
                            <span className="opacity-65">{anchor.confidence.toFixed(2)}</span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
