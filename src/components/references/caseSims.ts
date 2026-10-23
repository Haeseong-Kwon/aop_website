/**
 * 화면이 공개되지 않은 납품 사례(PROMO · snapsnap · POTENTIAL)를 재현하는 결정적 시뮬레이션.
 *
 * guardionSim과 같은 규칙 — 모든 값이 시각 t의 순수 함수라 SSR과 첫 렌더가 같은 숫자를 낸다.
 * 화면 구성은 각 저장소의 명세(운영자 대시보드 문서, 기능 명세, PRD)를 따르고, 수치는 실데이터가 아니다.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;
/** 음수 t도 0~1로 감는 사이클 위상 */
const wrap = (n: number) => ((n % 1) + 1) % 1;

/* ───────────── PROMO · 운영자 대시보드 ───────────── */

/** 시뮬레이션 하루 길이(초) */
export const PROMO_DAY_SEC = 1.6;
const PAYOUT_CYCLE = 12;
const PLATFORM_FEE = 0.1;

export type PayoutStatus = "pending" | "approved" | "paid";

export interface PayoutRow {
    creator: string;
    gross: number;
    fee: number;
    payout: number;
    status: PayoutStatus;
}

const CREATORS = [
    { creator: "CREW NOVA", gross: 412_000, offset: 0.05 },
    { creator: "J.HOON", gross: 268_000, offset: 0.3 },
    { creator: "LUMI WAACK", gross: 545_000, offset: 0.55 },
    { creator: "BOUNCE LAB", gross: 189_000, offset: 0.8 },
] as const;

/** 하루 가입자 수. 요일 리듬(sin) 두 개를 겹쳐 그래프가 단조롭지 않게 한다 */
export function dailySignups(day: number): number {
    return round2(52 + 16 * Math.sin(day * 0.9) + 8 * Math.sin(day * 2.3 + 1));
}

/** 최근 count일 가입자 — 마지막 값은 오늘 지금까지 쌓인 수라 하루 동안 차오른다 */
export function signupWindow(t: number, count: number): number[] {
    const day = Math.floor(t / PROMO_DAY_SEC);
    const frac = wrap(t / PROMO_DAY_SEC);
    return Array.from({ length: count }, (_, i) => {
        const d = day - (count - 1 - i);
        return i === count - 1 ? round2(dailySignups(d) * frac) : dailySignups(d);
    });
}

export function promoTotals(t: number): { signups: number; downloads: number; bookings: number } {
    const days = Math.max(0, t / PROMO_DAY_SEC);
    return {
        signups: 12_480 + Math.floor(days * 52),
        downloads: 8_210 + Math.floor(days * 31),
        bookings: 340 + Math.floor(days * 6),
    };
}

function payoutStatus(u: number): PayoutStatus {
    if (u < 0.5) return "pending";
    if (u < 0.78) return "approved";
    return "paid";
}

/** 정산 요청 큐. 총액에서 플랫폼 수수료를 뺀 금액이 정산액이다 */
export function payoutQueue(t: number): PayoutRow[] {
    return CREATORS.map(({ creator, gross, offset }) => {
        const fee = Math.round(gross * PLATFORM_FEE);
        return { creator, gross, fee, payout: gross - fee, status: payoutStatus(wrap(t / PAYOUT_CYCLE + offset)) };
    });
}

/* ───────────── snapsnap · 작가 마켓플레이스 앱 ───────────── */

export const SNAP_STEPS = [
    "포트폴리오 등록",
    "승인 대기 · 넛지",
    "승인 푸시 알림",
    "작가 검색",
    "채팅 · 예약 확정",
    "결제 완료",
] as const;

const SNAP_STEP_SEC = 3;
export const SNAP_MIN_PORTFOLIO = 10;
const NUDGE_STAGES = 4;

export interface SnapState {
    step: number;
    /** 현재 단계 안의 진행률 0~1 */
    progress: number;
    /** 등록된 포트폴리오 장수 */
    portfolio: number;
    /** 넛지 카드 단계 0~3 */
    nudge: number;
}

export function snapAt(t: number): SnapState {
    const u = wrap(t / (SNAP_STEP_SEC * SNAP_STEPS.length)) * SNAP_STEPS.length;
    const step = Math.min(SNAP_STEPS.length - 1, Math.floor(u));
    const progress = round2(u - step);
    return {
        step,
        progress,
        portfolio: step === 0 ? Math.min(SNAP_MIN_PORTFOLIO, Math.floor(progress * (SNAP_MIN_PORTFOLIO + 1))) : SNAP_MIN_PORTFOLIO,
        nudge: step === 1 ? Math.min(NUDGE_STAGES - 1, Math.floor(progress * NUDGE_STAGES)) : step < 1 ? 0 : NUDGE_STAGES - 1,
    };
}

/* ───────────── POTENTIAL · 제품 사전검증 SaaS ───────────── */

export const CAMPAIGN_DAYS = 14;
const CAMPAIGN_DAY_SEC = 1;
/** 캠페인이 끝난 뒤 동결된 리포트를 보여주는 시간(초) */
const REPORT_HOLD_SEC = 3;
const VISITOR_TARGET = 1_240;
/** 이보다 적은 등록 수는 '표본 부족'으로 표시한다 */
export const MIN_SAMPLE = 30;

const CHANNELS = [
    { name: "Instagram", share: 0.46 },
    { name: "Meta 광고", share: 0.33 },
    { name: "Threads", share: 0.21 },
] as const;

export interface FunnelStage {
    label: string;
    count: number;
}

export interface CampaignSnapshot {
    /** 0~14, 소수 */
    day: number;
    stages: FunnelStage[];
    /** 방문 → 관심 등록 전환의 Wilson 95% 구간 */
    rate: { value: number; lo: number; hi: number };
    channels: { name: string; count: number }[];
    prices: { label: string; rate: number }[];
    isThin: boolean;
    isFrozen: boolean;
}

/** 이항 비율의 Wilson 점수 구간. 표본이 없으면 아무것도 모른다는 뜻으로 [0, 1] */
export function wilson(successes: number, trials: number, z = 1.96): { lo: number; hi: number } {
    if (trials <= 0) return { lo: 0, hi: 1 };
    const p = successes / trials;
    const z2 = z * z;
    const denom = 1 + z2 / trials;
    const center = (p + z2 / (2 * trials)) / denom;
    const half = (z * Math.sqrt((p * (1 - p)) / trials + z2 / (4 * trials * trials))) / denom;
    return { lo: Math.max(0, center - half), hi: Math.min(1, center + half) };
}

export function campaignAt(t: number): CampaignSnapshot {
    const cycle = CAMPAIGN_DAYS * CAMPAIGN_DAY_SEC + REPORT_HOLD_SEC;
    const day = Math.min(CAMPAIGN_DAYS, wrap(t / cycle) * cycle / CAMPAIGN_DAY_SEC);
    // 초반 광고 집행으로 빨리 붙고 뒤로 갈수록 완만해지는 유입
    const k = Math.sqrt(day / CAMPAIGN_DAYS);
    const visitors = Math.round(VISITOR_TARGET * k);
    const registered = Math.round(visitors * 0.046);
    const intent = Math.round(registered * 0.41);
    const surveyed = Math.round(intent * 0.68);
    const ci = wilson(registered, visitors);

    return {
        day: round2(day),
        stages: [
            { label: "고유 방문", count: visitors },
            { label: "관심 등록", count: registered },
            { label: "구매 의향", count: intent },
            { label: "설문 완료", count: surveyed },
        ],
        rate: {
            value: round2(visitors ? (registered / visitors) * 100 : 0),
            lo: round2(ci.lo * 100),
            hi: round2(ci.hi * 100),
        },
        channels: CHANNELS.map((c) => ({ name: c.name, count: Math.round(visitors * c.share) })),
        prices: [
            { label: "₩89,000", rate: round2(registered ? (intent * 0.6) / (registered / 2) * 100 : 0) },
            { label: "₩119,000", rate: round2(registered ? (intent * 0.4) / (registered / 2) * 100 : 0) },
        ],
        isThin: registered < MIN_SAMPLE,
        isFrozen: day >= CAMPAIGN_DAYS,
    };
}
