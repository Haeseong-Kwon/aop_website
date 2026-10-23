"use client";

import { cn } from "@/lib/utils";
import { CAMPAIGN_DAYS, campaignAt } from "./caseSims";
import { useSceneClock } from "./useSceneClock";

/** 캠페인 후반 — 표본이 충분히 쌓여 구간이 좁아진 순간 */
const STILL_T = 11.5;
/** 전환율 구간 막대의 눈금 상한(%) */
const RATE_AXIS_MAX = 12;
const CHANNEL_TONES = ["bg-beam", "bg-glow/70", "bg-signal/70"] as const;

/**
 * POTENTIAL 분석 화면 재현. 결제 없이 관심 등록·구매 의향을 모으는 제품 사전검증 SaaS의 핵심 —
 * 고유 방문자 기준 퍼널, Wilson 신뢰구간과 표본 부족 표시, 채널·가격 버전별 반응 — 을 다시 그렸다.
 * 실데이터가 아니다.
 */
export function PotentialFunnel({ className }: { className?: string }) {
    const [ref, time] = useSceneClock<HTMLDivElement>(STILL_T);
    const c = campaignAt(time);
    const top = Math.max(1, c.stages[0].count);
    const channelTotal = Math.max(1, c.channels.reduce((sum, ch) => sum + ch.count, 0));
    const pct = (v: number) => `${Math.min(100, (v / RATE_AXIS_MAX) * 100)}%`;

    return (
        <div ref={ref} className={cn("relative flex size-full flex-col bg-[#03060c] font-mono", className)}>
            <p className="sr-only">
                방문, 관심 등록, 구매 의향, 설문 완료로 이어지는 검증 퍼널과 전환율 신뢰구간을 보여주는 POTENTIAL 분석 화면을 재현한 그래픽입니다.
            </p>

            <div aria-hidden className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2 text-[9.5px] tracking-[0.16em] text-faint">
                    <span className="flex items-center gap-2">
                        <span className="text-bright">POTENTIAL</span>
                        <span className="hidden sm:inline">· 컨셉 검증 · 결제 없음</span>
                    </span>
                    <span className="tabular-nums">
                        D{String(Math.min(CAMPAIGN_DAYS, Math.floor(c.day) + 1)).padStart(2, "0")}/{CAMPAIGN_DAYS}
                    </span>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-[1.25fr_1fr] gap-3 p-3">
                    <div className="flex min-h-0 flex-col justify-between">
                        <ul className="space-y-[clamp(4px,1vw,8px)]">
                            {c.stages.map((stage, i) => (
                                <li key={stage.label}>
                                    <div className="flex items-baseline justify-between text-[9px]">
                                        <span className="text-muted">{stage.label}</span>
                                        <span className="tabular-nums text-bright">{stage.count.toLocaleString("ko-KR")}</span>
                                    </div>
                                    <span className="mt-0.5 block h-[clamp(5px,1vw,8px)] overflow-hidden rounded-sm bg-white/[0.06]">
                                        <span
                                            className="block h-full origin-left rounded-sm"
                                            style={{
                                                // 하위 단계는 수가 작아 보이지 않으므로 로그 축으로 그린다
                                                transform: `scaleX(${stage.count ? Math.log1p(stage.count) / Math.log1p(top) : 0})`,
                                                background: i === 0 ? "var(--color-beam)" : `rgb(188 216 255 / ${0.75 - i * 0.12})`,
                                            }}
                                        />
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-2 rounded-md border border-white/[0.07] bg-white/[0.02] p-2">
                            <div className="flex items-center justify-between text-[9px]">
                                <span className="text-faint">방문 → 등록</span>
                                {c.isThin ? (
                                    <span className="rounded-sm border border-destructive/40 px-1 text-[8px] text-destructive">표본 부족</span>
                                ) : (
                                    <span className="tabular-nums text-bright">{c.rate.value.toFixed(1)}%</span>
                                )}
                            </div>
                            <div className="relative mt-1.5 h-2.5">
                                <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                                <span
                                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-beam/35 transition-[left,width] duration-300"
                                    style={{ left: pct(c.rate.lo), width: `calc(${pct(c.rate.hi)} - ${pct(c.rate.lo)})` }}
                                />
                                <span className="absolute top-0 h-full w-px bg-glow" style={{ left: pct(c.rate.value) }} />
                            </div>
                            <p className="mt-1 text-[8px] tabular-nums text-faint">
                                95% CI {c.rate.lo.toFixed(1)}–{c.rate.hi.toFixed(1)}% · n={c.stages[0].count}
                            </p>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-col justify-between gap-2">
                        <div>
                            <p className="text-[9px] tracking-[0.12em] text-faint">유입 채널</p>
                            <span className="mt-1 flex h-2 overflow-hidden rounded-sm bg-white/[0.06]">
                                {c.channels.map((ch, i) => (
                                    <span key={ch.name} className={CHANNEL_TONES[i]} style={{ width: `${(ch.count / channelTotal) * 100}%` }} />
                                ))}
                            </span>
                            <ul className="mt-1.5 space-y-0.5 text-[8.5px]">
                                {c.channels.map((ch, i) => (
                                    <li key={ch.name} className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1 text-muted">
                                            <span className={cn("size-1.5 rounded-full", CHANNEL_TONES[i])} />
                                            {ch.name}
                                        </span>
                                        <span className="tabular-nums text-faint">{ch.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="text-[9px] tracking-[0.12em] text-faint">가격별 구매 의향</p>
                            <ul className="mt-1 space-y-1 text-[8.5px]">
                                {c.prices.map((p) => (
                                    <li key={p.label} className="flex items-center gap-1.5">
                                        <span className="w-12 shrink-0 tabular-nums text-muted">{p.label}</span>
                                        <span className="h-1.5 flex-1 overflow-hidden rounded-sm bg-white/[0.06]">
                                            <span className="block h-full origin-left bg-glow/70" style={{ transform: `scaleX(${p.rate / 100})` }} />
                                        </span>
                                        <span className="w-7 text-right tabular-nums text-faint">{Math.round(p.rate)}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p
                            className={cn(
                                "rounded-md border px-2 py-1 text-center text-[8.5px] transition-colors duration-500",
                                c.isFrozen ? "border-signal/40 bg-signal/10 text-signal" : "border-white/10 text-faint"
                            )}
                        >
                            {c.isFrozen ? "리포트 동결 · 결정 기록 대기" : "캠페인 수집 중"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
