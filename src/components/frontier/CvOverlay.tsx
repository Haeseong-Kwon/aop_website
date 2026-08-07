"use client";

import type { Projected } from "@/components/frontier/PerceptionScene";
import type { ShapeAnchor } from "@/components/frontier/shapes";

/*
 * 3D 위에 겹치는 2D 인식 오버레이.
 *
 * 좌표는 camera.project()로 계산해 넘어온 화면 픽셀이라, 오브젝트가 돌면 박스도
 * 같이 돈다. 고정된 장식 박스를 얹어 '인식하는 척'하면 이 섹션의 주장 자체가 거짓이 된다.
 *
 * 박스는 모서리 브래킷만 그린다 — 네 변을 다 그리면 파티클을 가린다.
 */

const BRACKET = 9;
const HALF = 34;

export function CvOverlay({
    anchors,
    projected,
    scan,
    height,
}: {
    anchors: readonly ShapeAnchor[];
    projected: readonly Projected[];
    /** 스캔라인이 내려온 높이(0~1). 이 선을 지난 앵커만 나타난다. */
    scan: number;
    /** 캔버스 높이(px). projected.y와 같은 좌표계여야 한다. */
    height: number;
}) {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/*
             * 스캔 스윕 — 이 선이 지나가야 박스가 붙는다.
             * 선 한 줄이 아니라 위로 끌리는 잔광을 함께 둔다. DetectionOverlay가 표면 위에
             * 세우는 스캔 평면과 같은 언어라야 두 섹션의 인식 레이어가 한 장치로 읽힌다.
             */}
            <div
                className="absolute inset-x-0"
                style={{ top: `${scan * 100}%`, opacity: 0.8 }}
            >
                <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,rgba(188,216,255,0.14),transparent)]" />
                <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-glow),transparent)]" />
            </div>

            {anchors.map((anchor, index) => {
                const point = projected[index];
                if (!point?.visible) return null;

                // 스캔라인이 아직 닿지 않은 앵커는 그리지 않는다
                if (point.y / Math.max(1, height) > scan) return null;

                return (
                    <div
                        key={anchor.label + index}
                        className="absolute"
                        style={{
                            left: point.x,
                            top: point.y,
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <svg
                            width={HALF * 2}
                            height={HALF * 2}
                            viewBox={`0 0 ${HALF * 2} ${HALF * 2}`}
                            className="overflow-visible"
                        >
                            {/* 네 모서리 브래킷 */}
                            {[
                                `M0 ${BRACKET} V0 H${BRACKET}`,
                                `M${HALF * 2 - BRACKET} 0 H${HALF * 2} V${BRACKET}`,
                                `M${HALF * 2} ${HALF * 2 - BRACKET} V${HALF * 2} H${HALF * 2 - BRACKET}`,
                                `M${BRACKET} ${HALF * 2} H0 V${HALF * 2 - BRACKET}`,
                            ].map((d) => (
                                <path
                                    key={d}
                                    d={d}
                                    fill="none"
                                    stroke="var(--color-glow)"
                                    strokeWidth={1.25}
                                />
                            ))}
                            {/* 중심 키포인트 */}
                            <circle
                                cx={HALF}
                                cy={HALF}
                                r={1.75}
                                fill="var(--color-glow)"
                                opacity={0.85}
                            />
                        </svg>

                        {/* 라벨은 DetectionOverlay와 같은 규격 — 검은 판에 글로우 테두리 */}
                        <span className="absolute left-0 top-full mt-1.5 flex items-center gap-1.5 whitespace-nowrap border border-glow/35 bg-black/72 px-1.5 py-[3px] font-mono text-[10px] leading-none tracking-[0.04em] text-glow backdrop-blur-[2px]">
                            {anchor.label}
                            <span className="h-2.5 w-px bg-glow/30" />
                            <span className="text-glow/65">
                                {anchor.confidence.toFixed(2)}
                            </span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
