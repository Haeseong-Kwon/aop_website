"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import {
    BASE,
    CONTOURS,
    DRONES,
    GEOFENCE,
    MAP,
    RIVER,
    droneAt,
    patrolPath,
    tempHistory,
    trailAt,
    type DronePhase,
    type DroneSnapshot,
} from "./guardionSim";

/** SSR·모션 축소 환경에서 보여줄 고정 시각 — 세 기체가 비행·경보·충전으로 갈려 있는 순간 */
const STILL_T = 7.3;
/** 화면 갱신 간격(ms). 관제 화면은 30fps면 충분하고, 그 이상은 배터리만 쓴다 */
const FRAME_MS = 33;
const TRAIL = { count: 16, step: 0.09 } as const;
const SPARK = { count: 48, step: 0.25, w: 240, h: 44 } as const;
const PATHS = DRONES.map(patrolPath);

const PHASE_LABEL: Record<DronePhase, string> = {
    takeoff: "TAKEOFF",
    flight: "FLIGHT",
    rtb: "RTB",
    charge: "CHARGE",
};

/** 화면에 보일 때만 흐르는 시뮬레이션 시계 */
function useSimTime(isActive: boolean): number {
    const [time, setTime] = useState(STILL_T);

    useEffect(() => {
        if (!isActive) return;
        let frame = 0;
        let last = performance.now();
        let acc = 0;

        const tick = (now: number) => {
            const dt = now - last;
            last = now;
            acc += dt;
            if (acc >= FRAME_MS) {
                // 탭 전환 뒤 돌아왔을 때 수십 초를 한 번에 건너뛰지 않게 상한을 둔다
                const step = Math.min(acc, 100) / 1000;
                acc = 0;
                setTime((prev) => prev + step);
            }
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [isActive]);

    return time;
}

function tone(drone: DroneSnapshot) {
    if (drone.isLow || drone.phase === "rtb") return { stroke: "var(--color-destructive)", text: "text-destructive" };
    if (drone.phase === "charge") return { stroke: "var(--color-signal)", text: "text-signal" };
    return { stroke: "var(--color-beam)", text: "text-glow" };
}

function formatClock(seconds: number): string {
    const total = Math.floor(seconds) + 2 * 3600 + 14 * 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
}

function MapLayer({ time, drones }: { time: number; drones: readonly DroneSnapshot[] }) {
    const ringR = 13;
    const ringC = 2 * Math.PI * ringR;

    return (
        <svg
            viewBox={`0 0 ${MAP.w} ${MAP.h}`}
            className="absolute inset-0 block size-full"
            aria-hidden
        >
            <defs>
                <pattern id="gd-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M30 0H0V30" fill="none" stroke="rgb(255 255 255 / 0.045)" strokeWidth="1" />
                </pattern>
                <radialGradient id="gd-glow">
                    <stop offset="0%" stopColor="var(--color-beam)" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="var(--color-beam)" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="gd-sweep" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-glow)" stopOpacity="0" />
                    <stop offset="100%" stopColor="var(--color-glow)" stopOpacity="0.22" />
                </linearGradient>
            </defs>

            <rect width={MAP.w} height={MAP.h} fill="url(#gd-grid)" />

            {CONTOURS.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="rgb(188 216 255 / 0.09)" strokeWidth="1" />
            ))}

            <path d={RIVER} fill="none" stroke="rgb(74 140 255 / 0.16)" strokeWidth="10" strokeLinecap="round" />
            <path d={RIVER} fill="none" stroke="rgb(74 140 255 / 0.55)" strokeWidth="1.2" />

            <path d={GEOFENCE} fill="rgb(74 140 255 / 0.025)" stroke="rgb(188 216 255 / 0.3)" strokeDasharray="5 6" />
            <text x="48" y="58" className="fill-glow/60 font-mono text-[11px] tracking-[0.18em]">
                TEST AIRSPACE · ZONE A
            </text>

            {/* 기지 레이더 스윕 — 회전각도 t에서 바로 나온다 */}
            <g transform={`rotate(${(time * 40) % 360} ${BASE.x} ${BASE.y})`}>
                <path d={`M${BASE.x},${BASE.y} L${BASE.x + 150},${BASE.y - 26} A152,152 0 0 1 ${BASE.x + 150},${BASE.y + 26} Z`} fill="url(#gd-sweep)" />
            </g>
            {[40, 80, 120].map((r) => (
                <circle key={r} cx={BASE.x} cy={BASE.y} r={r} fill="none" stroke="rgb(188 216 255 / 0.08)" />
            ))}

            {PATHS.map((d, i) => (
                <path key={DRONES[i].id} d={d} fill="none" stroke="rgb(188 216 255 / 0.14)" strokeDasharray="2 5" />
            ))}

            {/* 충전 기지 */}
            <g transform={`translate(${BASE.x} ${BASE.y})`}>
                <polygon points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5" fill="rgb(61 214 140 / 0.12)" stroke="var(--color-signal)" />
                <path d="M-2,-6 L-5,1 L0,1 L-2,7 L5,-1 L0,-1 Z" fill="var(--color-signal)" />
                <text x="20" y="4" className="fill-signal font-mono text-[10px] tracking-[0.16em]">
                    BASE
                </text>
            </g>

            {drones.map((drone, i) => {
                const color = tone(drone).stroke;
                const trail = trailAt(DRONES[i], time, TRAIL.count, TRAIL.step);
                const isDocked = drone.phase === "charge";
                // 오른쪽 가장자리에서는 라벨을 왼쪽으로 돌려 잘리지 않게 한다
                const isRightEdge = drone.pos.x > MAP.w - 140;
                const labelX = isRightEdge ? -22 : 22;
                const anchor = isRightEdge ? "end" : "start";

                return (
                    <g key={drone.id}>
                        {isDocked
                            ? null
                            : trail.map((p, k) => (
                                  <circle key={k} cx={p.x} cy={p.y} r={2.6 - k * 0.12} fill={color} opacity={0.5 * (1 - k / TRAIL.count)} />
                              ))}
                        <g transform={`translate(${drone.pos.x} ${drone.pos.y + (isDocked ? -30 : 0)})`}>
                            <circle r="26" fill="url(#gd-glow)" opacity={isDocked ? 0 : 0.8} />
                            {/* 배터리 잔량 링 */}
                            <circle r={ringR} fill="rgb(0 0 0 / 0.6)" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2.5" />
                            <circle
                                r={ringR}
                                fill="none"
                                stroke={color}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray={`${(drone.soc / 100) * ringC} ${ringC}`}
                                transform="rotate(-90)"
                            />
                            {/* 쿼드콥터 아이콘 */}
                            <path d="M-5,-5 L5,5 M5,-5 L-5,5" stroke="white" strokeWidth="1.4" />
                            {[[-5, -5], [5, -5], [-5, 5], [5, 5]].map(([x, y]) => (
                                <circle key={`${x}${y}`} cx={x} cy={y} r="2.1" fill="none" stroke="white" strokeWidth="1" />
                            ))}
                            {drone.isLow ? (
                                <circle r="20" fill="none" stroke="var(--color-destructive)" opacity={(0.5 + 0.5 * Math.sin(time * 8)).toFixed(2)} />
                            ) : null}
                            <text x={labelX} y="-7" textAnchor={anchor} className="fill-bright font-mono text-[12px] font-medium">
                                {drone.id}
                            </text>
                            <text x={labelX} y="8" textAnchor={anchor} className="font-mono text-[10.5px]" fill={color}>
                                {Math.round(drone.soc)}% · {PHASE_LABEL[drone.phase]}
                            </text>
                        </g>
                    </g>
                );
            })}
        </svg>
    );
}

function DroneRow({ drone }: { drone: DroneSnapshot }) {
    const { stroke, text } = tone(drone);

    return (
        <li className="border-b border-white/[0.07] px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-l sm:first:border-l-0">
            <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                <span className="font-medium text-bright">{drone.id}</span>
                <span className={cn("rounded-sm border border-current/30 px-1.5 py-px text-[9.5px] tracking-[0.14em]", text)}>
                    {PHASE_LABEL[drone.phase]}
                </span>
            </div>
            <div className="mt-2 flex items-center gap-2.5">
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <span
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${drone.soc}%`, background: stroke, boxShadow: `0 0 10px ${stroke}` }}
                    />
                </span>
                <span className="w-9 text-right font-mono text-[11px] tabular-nums text-text">{Math.round(drone.soc)}%</span>
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-1 font-mono text-[10px] tabular-nums">
                {[
                    ["TEMP", `${drone.temp.toFixed(1)}°C`],
                    ["PACK", `${drone.voltage.toFixed(1)}V`],
                    ["SPD", `${Math.round(drone.speed)}km/h`],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-faint">{label}</dt>
                        <dd className="text-muted">{value}</dd>
                    </div>
                ))}
            </dl>
        </li>
    );
}

function Sparkline({ time }: { time: number }) {
    const values = tempHistory(DRONES[0], time, SPARK.count, SPARK.step);
    const min = 26;
    const max = 44;
    const points = values.map((v, i) => {
        const x = (i / (SPARK.count - 1)) * SPARK.w;
        const y = SPARK.h - ((v - min) / (max - min)) * SPARK.h;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const latest = values[values.length - 1];

    return (
        <div>
            <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.14em] text-faint">
                <span>CELL TEMP · GD-01</span>
                <span className="text-glow tabular-nums">{latest.toFixed(1)}°C</span>
            </div>
            <svg viewBox={`0 0 ${SPARK.w} ${SPARK.h}`} preserveAspectRatio="none" className="mt-2 block h-9 w-full" aria-hidden>
                <defs>
                    <linearGradient id="gd-spark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-beam)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--color-beam)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,${SPARK.h} L${points.join(" L")} L${SPARK.w},${SPARK.h} Z`} fill="url(#gd-spark)" />
                <polyline points={points.join(" ")} fill="none" stroke="var(--color-glow)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
}

/**
 * GUARDION 관제 화면 재현. 실제 납품 시스템의 관제 화면 구성 — 장치 목록, 통합 데이터,
 * 알림 — 를 웹 그래픽으로 다시 그린 것이며 실데이터가 아니다.
 */
export function GuardionConsole({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { margin: "0px 0px -10% 0px" });
    const prefersReduced = useReducedMotion();
    const time = useSimTime(isInView && !prefersReduced);
    const drones = DRONES.map((spec) => droneAt(spec, time));
    const alerts = drones.filter((d) => d.isLow || d.phase === "rtb");

    return (
        <div
            ref={ref}
            className={cn(
                "relative overflow-hidden rounded-[22px] border border-white/10 bg-[#03060c]/90 shadow-[0_40px_120px_-40px_rgba(74,140,255,0.45)]",
                className
            )}
        >
            <p className="sr-only">
                드론 세 대의 위치, 배터리 잔량, 셀 온도를 실시간으로 표시하는 GUARDION 관제 화면을 재현한 그래픽입니다.
            </p>

            <div aria-hidden>
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-2.5 font-mono text-[10px] tracking-[0.16em] text-faint">
                    <span className="flex items-center gap-2">
                        <span className="relative flex size-1.5">
                            <span className="absolute inset-0 rounded-full bg-signal motion-safe:animate-ping" />
                            <span className="relative size-1.5 rounded-full bg-signal" />
                        </span>
                        <span className="text-bright">GUARDION</span>
                        <span className="hidden sm:inline">· FIELD CONTROL</span>
                    </span>
                    <span className="hidden md:inline">YEONGJU · 36.80°N 128.62°E</span>
                    <span className="tabular-nums text-muted">{formatClock(time)}</span>
                </div>

                {/* 지도는 고유 비율 그대로 — 패널 높이에 맞춰 자르면 기체가 화면 밖으로 밀려난다 */}
                <div className="relative aspect-[600/380]">
                    <MapLayer time={time} drones={drones} />
                    <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex flex-wrap gap-2 font-mono text-[10px]">
                        {alerts.length === 0 ? (
                            <span className="rounded-md border border-white/10 bg-black/60 px-2 py-1 text-faint backdrop-blur">
                                ALL SYSTEMS NOMINAL
                            </span>
                        ) : (
                            alerts.map((d) => (
                                <span
                                    key={d.id}
                                    className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-destructive backdrop-blur"
                                >
                                    ▲ {d.id} {d.phase === "rtb" ? "복귀 중" : "저전압 · 복귀 권고"}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <ul className="grid border-t border-white/[0.08] sm:grid-cols-3">
                    {drones.map((drone) => (
                        <DroneRow key={drone.id} drone={drone} />
                    ))}
                </ul>

                <div className="border-t border-white/[0.08] px-4 py-3">
                    <Sparkline time={time} />
                </div>
            </div>
        </div>
    );
}
