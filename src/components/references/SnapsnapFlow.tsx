"use client";

import { cn } from "@/lib/utils";
import { SNAP_MIN_PORTFOLIO, SNAP_STEPS, snapAt, type SnapState } from "./caseSims";
import { useSceneClock } from "./useSceneClock";

/** 승인 푸시가 막 도착한 순간 */
const STILL_T = 7.2;
const NUDGES = ["포트폴리오 10장 채우기", "가격 패키지 등록", "소개글 50자 이상", "연락처 확인"] as const;
const ARTISTS = [
    { name: "온유 스냅", tag: "성수 · 커플", price: "12만" },
    { name: "필름하루", tag: "한남 · 웨딩", price: "15만" },
    { name: "윤슬", tag: "서촌 · 프로필", price: "9만" },
] as const;

/** 포트폴리오 타일 — 사진 대신 색면으로 그린다 */
const TILE_HUES = [212, 198, 226, 186, 240, 205, 218, 192, 232, 200] as const;

function PortfolioGrid({ count }: { count: number }) {
    return (
        <div className="grid grid-cols-3 gap-[3px]">
            {Array.from({ length: SNAP_MIN_PORTFOLIO + 2 }, (_, i) => (
                <span
                    key={i}
                    className="aspect-square rounded-[3px] transition-opacity duration-300"
                    style={{
                        background: i < count ? `linear-gradient(140deg, hsl(${TILE_HUES[i % 10]} 70% 62% / 0.75), hsl(${TILE_HUES[i % 10]} 60% 30% / 0.6))` : "rgb(255 255 255 / 0.05)",
                    }}
                />
            ))}
        </div>
    );
}

function Screen({ state }: { state: SnapState }) {
    const { step, progress, portfolio, nudge } = state;

    if (step <= 1) {
        return (
            <>
                <p className="text-[8px] tracking-[0.12em] text-faint">작가 프로필 · 승인 대기</p>
                <p className="mt-1 text-[10px] font-medium tabular-nums text-bright">
                    포트폴리오 {portfolio}/{SNAP_MIN_PORTFOLIO}
                </p>
                <div className="mt-1.5">
                    <PortfolioGrid count={portfolio} />
                </div>
                {step === 1 ? (
                    <div className="mt-2 rounded-md border border-beam/40 bg-beam/10 p-1.5">
                        <p className="text-[7.5px] text-glow">오늘의 할 일 {nudge + 1}/4</p>
                        <p className="text-[8.5px] text-bright">{NUDGES[nudge]}</p>
                    </div>
                ) : null}
            </>
        );
    }

    if (step === 2) {
        return (
            <>
                <div
                    className="rounded-md border border-white/15 bg-white/10 p-1.5 backdrop-blur transition-transform duration-500"
                    style={{ transform: `translateY(${progress < 0.15 ? -40 : 0}px)` }}
                >
                    <p className="text-[7.5px] text-faint">snapsnap · 지금</p>
                    <p className="text-[8.5px] text-bright">승인 완료 — 이제 예약을 받을 수 있어요</p>
                </div>
                <p className="mt-2 inline-block rounded-sm border border-signal/40 px-1.5 text-[8px] text-signal">APPROVED</p>
                <div className="mt-1.5 opacity-60">
                    <PortfolioGrid count={SNAP_MIN_PORTFOLIO} />
                </div>
            </>
        );
    }

    if (step === 3) {
        const shown = Math.min(ARTISTS.length, 1 + Math.floor(progress * 4));
        return (
            <>
                <div className="flex flex-wrap gap-1">
                    {["서울", "커플", "15만↓"].map((chip) => (
                        <span key={chip} className="rounded-full border border-beam/40 bg-beam/10 px-1.5 text-[7.5px] text-glow">
                            {chip}
                        </span>
                    ))}
                </div>
                <ul className="mt-2 space-y-1.5">
                    {ARTISTS.slice(0, shown).map((a, i) => (
                        <li key={a.name} className="flex items-center gap-1.5">
                            <span
                                className="size-6 shrink-0 rounded-[4px]"
                                style={{ background: `linear-gradient(140deg, hsl(${TILE_HUES[i * 3]} 70% 62% / 0.8), hsl(${TILE_HUES[i * 3]} 60% 30% / 0.6))` }}
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[8.5px] text-bright">{a.name}</span>
                                <span className="block truncate text-[7.5px] text-faint">{a.tag}</span>
                            </span>
                            <span className="text-[8px] text-muted">{a.price}</span>
                        </li>
                    ))}
                </ul>
            </>
        );
    }

    if (step === 4) {
        const bubbles = Math.min(3, Math.floor(progress * 4));
        return (
            <>
                <p className="text-[8px] tracking-[0.12em] text-faint">온유 스냅 · 채팅</p>
                <div className="mt-1.5 flex flex-col gap-1 text-[8px]">
                    {bubbles > 0 ? <span className="self-end rounded-md bg-beam/30 px-1.5 py-0.5 text-bright">11/8 오후 가능할까요?</span> : null}
                    {bubbles > 1 ? <span className="self-start rounded-md bg-white/10 px-1.5 py-0.5 text-text">2시 비어 있어요!</span> : null}
                    {bubbles > 2 ? (
                        <span className="mt-1 rounded-md border border-signal/40 bg-signal/10 p-1.5 text-signal">예약 확정 · 11/8 14:00</span>
                    ) : null}
                </div>
            </>
        );
    }

    return (
        <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="flex size-8 items-center justify-center rounded-full border border-signal/50 bg-signal/10 text-[13px] text-signal">✓</span>
            <p className="mt-2 text-[9px] text-bright">결제 완료</p>
            <p className="text-[11px] font-medium tabular-nums text-bright">₩120,000</p>
            <p className="mt-1 text-[7.5px] text-faint">커플 스냅 · 1시간</p>
        </div>
    );
}

/**
 * snapsnap 앱 재현. 스냅 작가 마켓플레이스의 핵심 흐름 — 작가 등록·승인, 검색, 채팅 예약, 결제 — 을
 * 기능 명세 순서대로 휴대폰 화면 하나에 돌려 보인다. 실데이터가 아니다.
 */
export function SnapsnapFlow({ className }: { className?: string }) {
    const [ref, time] = useSceneClock<HTMLDivElement>(STILL_T);
    const state = snapAt(time);

    return (
        <div ref={ref} className={cn("relative flex size-full items-center gap-[6%] bg-[#03060c] px-[7%] font-mono", className)}>
            <p className="sr-only">스냅 작가 승인부터 고객 검색, 채팅 예약, 결제까지 이어지는 snapsnap 앱 흐름을 재현한 그래픽입니다.</p>

            <div aria-hidden className="relative h-[88%] aspect-[9/18.5] shrink-0 rounded-[18px] border border-white/15 bg-black p-[5px] shadow-[0_24px_60px_-20px_rgba(74,140,255,0.5)]">
                <div className="flex h-full flex-col overflow-hidden rounded-[14px] bg-[#070b14]">
                    <div className="flex items-center justify-between px-2.5 pt-1.5 text-[7px] text-faint">
                        <span>9:41</span>
                        <span className="h-1.5 w-8 rounded-full bg-black" />
                        <span>5G</span>
                    </div>
                    <div className="min-h-0 flex-1 px-2.5 pt-2">
                        <Screen state={state} />
                    </div>
                </div>
            </div>

            <ol aria-hidden className="relative flex min-w-0 flex-1 flex-col gap-[clamp(4px,1.2vw,10px)]">
                <span className="absolute bottom-1 left-[3px] top-1 w-px bg-white/10" />
                {SNAP_STEPS.map((label, i) => {
                    const isActive = i === state.step;
                    const isDone = i < state.step;
                    return (
                        <li key={label} className="relative flex items-center gap-2.5 pl-0">
                            <span
                                className={cn(
                                    "relative size-[7px] shrink-0 rounded-full border transition-colors duration-300",
                                    isActive ? "border-glow bg-glow shadow-[0_0_10px_var(--color-glow)]" : isDone ? "border-beam bg-beam" : "border-white/25 bg-[#03060c]"
                                )}
                            />
                            <span className={cn("truncate text-[clamp(9px,1.4vw,11.5px)] transition-colors duration-300", isActive ? "text-bright" : isDone ? "text-muted" : "text-faint")}>
                                <span className="mr-1.5 tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                                {label}
                            </span>
                        </li>
                    );
                })}
                <p className="mt-1 truncate text-[clamp(8px,1.2vw,10px)] tracking-[0.1em] text-faint">Supabase Realtime · FCM · Edge Functions</p>
            </ol>
        </div>
    );
}
