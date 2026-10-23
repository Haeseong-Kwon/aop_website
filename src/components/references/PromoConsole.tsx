"use client";

import { cn } from "@/lib/utils";
import { payoutQueue, promoTotals, signupWindow, type PayoutStatus } from "./caseSims";
import { useSceneClock } from "./useSceneClock";

/** 정산 큐에 대기·승인·지급이 섞여 있는 순간 */
const STILL_T = 9.4;
const CHART = { days: 14, w: 300, h: 110, max: 90 } as const;

const STATUS: Record<PayoutStatus, { label: string; className: string }> = {
    pending: { label: "대기", className: "border-glow/30 text-glow" },
    approved: { label: "승인", className: "border-beam/50 bg-beam/15 text-bright" },
    paid: { label: "지급", className: "border-signal/40 text-signal" },
};

const won = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

function SignupChart({ time }: { time: number }) {
    const values = signupWindow(time, CHART.days);
    const step = CHART.w / (CHART.days - 1);
    const points = values.map((v, i) => `${(i * step).toFixed(1)},${(CHART.h - (v / CHART.max) * CHART.h).toFixed(1)}`);
    const today = values[values.length - 1];

    return (
        <div className="flex min-h-0 flex-1 flex-col rounded-md border border-white/[0.07] bg-white/[0.02] p-2.5">
            <div className="flex items-baseline justify-between text-[9px] tracking-[0.14em] text-faint">
                <span>최근 14일 가입</span>
                <span className="tabular-nums text-glow">TODAY +{Math.round(today)}</span>
            </div>
            <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} preserveAspectRatio="none" className="mt-1.5 block min-h-0 w-full flex-1" aria-hidden>
                <defs>
                    <linearGradient id="promo-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-beam)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--color-beam)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((k) => (
                    <line key={k} x1="0" x2={CHART.w} y1={CHART.h * k} y2={CHART.h * k} stroke="rgb(255 255 255 / 0.05)" />
                ))}
                {values.map((v, i) => (
                    <rect
                        key={i}
                        x={i * step - 3}
                        y={CHART.h - (v / CHART.max) * CHART.h * 0.55}
                        width="6"
                        height={(v / CHART.max) * CHART.h * 0.55}
                        fill="rgb(188 216 255 / 0.08)"
                    />
                ))}
                <path d={`M0,${CHART.h} L${points.join(" L")} L${CHART.w},${CHART.h} Z`} fill="url(#promo-area)" />
                <polyline points={points.join(" ")} fill="none" stroke="var(--color-glow)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
}

/**
 * PROMO 운영자 대시보드 재현. 댄스 클래스·크루 소셜 앱의 운영 화면 — 가입·스토어 다운로드 지표와
 * 크리에이터 정산 요청 처리 — 을 저장소 문서의 화면 구성대로 다시 그렸다. 실데이터가 아니다.
 */
export function PromoConsole({ className }: { className?: string }) {
    const [ref, time] = useSceneClock<HTMLDivElement>(STILL_T);
    const totals = promoTotals(time);
    const queue = payoutQueue(time);
    const kpis = [
        ["누적 가입", totals.signups],
        ["iOS 다운로드", totals.downloads],
        ["클래스 예약", totals.bookings],
    ] as const;

    return (
        <div ref={ref} className={cn("relative flex size-full flex-col bg-[#03060c] font-mono", className)}>
            <p className="sr-only">가입자·다운로드 지표와 크리에이터 정산 요청 처리 상태를 보여주는 PROMO 운영자 대시보드를 재현한 그래픽입니다.</p>

            <div aria-hidden className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2 text-[9.5px] tracking-[0.16em] text-faint">
                    <span className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-signal" />
                        <span className="text-bright">PROMO</span>
                        <span>ADMIN</span>
                    </span>
                    <span className="hidden gap-3 sm:flex">
                        <span className="text-bright">대시보드</span>
                        <span>정산</span>
                        <span>분석</span>
                        <span>세금</span>
                    </span>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-[1.2fr_1fr] gap-2 p-2.5">
                    <div className="flex min-h-0 flex-col gap-2">
                        <dl className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                            {kpis.map(([label, value]) => (
                                <div key={label} className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1.5 last:hidden sm:last:block">
                                    <dt className="truncate text-[8.5px] tracking-[0.08em] text-faint">{label}</dt>
                                    <dd className="mt-0.5 text-[clamp(10px,1.6vw,13px)] font-medium whitespace-nowrap tabular-nums text-bright">
                                        {value.toLocaleString("ko-KR")}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <SignupChart time={time} />
                    </div>

                    <div className="flex min-h-0 flex-col rounded-md border border-white/[0.07] bg-white/[0.02]">
                        <p className="flex items-center justify-between border-b border-white/[0.07] px-2.5 py-1.5 text-[9px] tracking-[0.14em] text-faint">
                            <span>정산 요청</span>
                            <span>수수료 10%</span>
                        </p>
                        <ul className="flex min-h-0 flex-1 flex-col justify-around">
                            {queue.map((row) => (
                                <li key={row.creator} className="flex items-center justify-between gap-2 px-2.5 py-1 max-sm:last:hidden">
                                    <span className="min-w-0">
                                        <span className="block truncate text-[10px] text-bright">{row.creator}</span>
                                        <span className="block truncate text-[9px] tabular-nums text-faint">
                                            <span className="hidden sm:inline">{won(row.gross)} → </span>
                                            <span className="text-muted">{won(row.payout)}</span>
                                        </span>
                                    </span>
                                    <span
                                        className={cn(
                                            "shrink-0 rounded-sm border px-1.5 py-px text-[9px] transition-colors duration-500",
                                            STATUS[row.status].className
                                        )}
                                    >
                                        {STATUS[row.status].label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
