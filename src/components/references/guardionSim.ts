/**
 * GUARDION 관제 화면을 재현하는 결정적 시뮬레이션.
 *
 * 모든 값이 시각 t의 순수 함수다 — 상태를 들고 다니지 않으니 SSR과 첫 렌더가
 * 같은 숫자를 내고(hydration 불일치 없음), 꼬리 궤적이나 그래프도 과거 t를 다시
 * 계산하는 것만으로 그린다.
 */

export type DronePhase = "takeoff" | "flight" | "rtb" | "charge";

export interface Point {
    x: number;
    y: number;
}

export interface DroneSnapshot {
    id: string;
    phase: DronePhase;
    /** 배터리 잔량 % */
    soc: number;
    /** 셀 온도 °C */
    temp: number;
    /** 6S 팩 전압 V */
    voltage: number;
    /** km/h */
    speed: number;
    pos: Point;
    isLow: boolean;
}

interface DroneSpec {
    id: string;
    /** 사이클 위상 오프셋 0~1 — 세 기체가 서로 다른 단계에 있게 한다 */
    offset: number;
    center: Point;
    radius: Point;
}

/** 지도 viewBox 크기 */
export const MAP = { w: 600, h: 380 } as const;
export const BASE: Point = { x: 96, y: 312 };

/** 한 사이클(이륙→비행→복귀→충전) 길이(초) */
export const CYCLE = 18;
const TAKEOFF_END = 0.06;
const FLIGHT_END = 0.7;
const RTB_END = 0.78;
const SOC_AT_RTB = 22;
const SOC_DOCKED = 18;
export const LOW_SOC = 30;

export const DRONES: readonly DroneSpec[] = [
    { id: "GD-01", offset: 0.08, center: { x: 300, y: 150 }, radius: { x: 150, y: 70 } },
    { id: "GD-02", offset: 0.42, center: { x: 410, y: 230 }, radius: { x: 120, y: 90 } },
    { id: "GD-03", offset: 0.74, center: { x: 250, y: 220 }, radius: { x: 110, y: 60 } },
];

const TAU = Math.PI * 2;
/**
 * 서버와 브라우저의 Math.sin은 마지막 자릿수가 다를 수 있다 — 화면에 나가는 값은
 * 소수 둘째 자리로 잘라 SSR 마크업과 hydration 값이 같게 한다.
 */
const round2 = (n: number) => Math.round(n * 100) / 100;
const roundPoint = (p: Point): Point => ({ x: round2(p.x), y: round2(p.y) });
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpPoint = (a: Point, b: Point, k: number): Point => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
/** 이·착륙 구간을 부드럽게 — 선형 보간이면 꺾이는 순간이 눈에 띈다 */
const smooth = (k: number) => k * k * (3 - 2 * k);

/** 순찰 경로: 8자 리사주. s는 0~1, 닫힌 곡선이라 path(0) === path(1). */
function patrol(spec: DroneSpec, s: number): Point {
    return {
        x: spec.center.x + spec.radius.x * Math.sin(TAU * s),
        y: spec.center.y + spec.radius.y * Math.sin(2 * TAU * s) * 0.5,
    };
}

/** 순찰 경로 전체를 SVG path로 — 지도에 옅게 깔아 두는 계획 경로 */
export function patrolPath(spec: DroneSpec): string {
    const steps = 64;
    const points = Array.from({ length: steps }, (_, i) => {
        const p = patrol(spec, i / steps);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    });
    return `M${points.join("L")}Z`;
}

function phaseAt(u: number): DronePhase {
    if (u < TAKEOFF_END) return "takeoff";
    if (u < FLIGHT_END) return "flight";
    if (u < RTB_END) return "rtb";
    return "charge";
}

function cycleU(spec: DroneSpec, t: number): number {
    const u = (t / CYCLE + spec.offset) % 1;
    return u < 0 ? u + 1 : u;
}

function positionAt(spec: DroneSpec, u: number): Point {
    const start = patrol(spec, 0);
    if (u < TAKEOFF_END) return lerpPoint(BASE, start, smooth(u / TAKEOFF_END));
    if (u < FLIGHT_END) return patrol(spec, (u - TAKEOFF_END) / (FLIGHT_END - TAKEOFF_END));
    if (u < RTB_END) return lerpPoint(start, BASE, smooth((u - FLIGHT_END) / (RTB_END - FLIGHT_END)));
    return BASE;
}

function socAt(u: number): number {
    if (u < FLIGHT_END) return lerp(100, SOC_AT_RTB, u / FLIGHT_END);
    if (u < RTB_END) return lerp(SOC_AT_RTB, SOC_DOCKED, (u - FLIGHT_END) / (RTB_END - FLIGHT_END));
    return lerp(SOC_DOCKED, 100, (u - RTB_END) / (1 - RTB_END));
}

const HEAT = { cool: 0.3, hot: 0.82 } as const;

/**
 * 셀 발열(0~1). 비행 내내 달아오르고 착륙 뒤 충전 동안 식는다 — 사이클 경계에서
 * 이어지도록 비행 시작값과 충전 끝값을 같게 둔다(그래프가 계단처럼 튀지 않게).
 */
function heatAt(u: number): number {
    if (u < FLIGHT_END) return lerp(HEAT.cool, HEAT.hot, u / FLIGHT_END);
    if (u < RTB_END) return HEAT.hot;
    return lerp(HEAT.hot, HEAT.cool, smooth((u - RTB_END) / (1 - RTB_END)));
}

export function droneAt(spec: DroneSpec, t: number): DroneSnapshot {
    const u = cycleU(spec, t);
    const phase = phaseAt(u);
    const soc = socAt(u);
    const isAirborne = phase !== "charge";
    const load = heatAt(u);
    const jitter = Math.sin(t * 2.3 + spec.offset * 40) * 0.6;
    const temp = 24 + load * 18 + jitter;
    const voltage = 6 * (3.5 + 0.7 * (soc / 100));
    const speed = phase === "flight" ? 38 + Math.sin(t * 1.7 + spec.offset * 9) * 6 : phase === "charge" ? 0 : 22;

    return {
        id: spec.id,
        phase,
        soc: round2(soc),
        temp: round2(temp),
        voltage: round2(voltage),
        speed: round2(speed),
        pos: roundPoint(positionAt(spec, u)),
        isLow: isAirborne && soc < LOW_SOC,
    };
}

/** 과거 t를 거슬러 올라간 궤적 — 최신 점이 배열 앞에 온다. */
export function trailAt(spec: DroneSpec, t: number, count: number, step: number): Point[] {
    return Array.from({ length: count }, (_, i) => roundPoint(positionAt(spec, cycleU(spec, t - i * step))));
}

/** 셀 온도 이력 — 오래된 값이 앞에 온다. */
export function tempHistory(spec: DroneSpec, t: number, count: number, step: number): number[] {
    return Array.from({ length: count }, (_, i) => droneAt(spec, t - (count - 1 - i) * step).temp);
}

/** 등고선: 봉우리 주위로 일그러진 닫힌 곡선. 모듈 로드 시 한 번만 만든다. */
function contour(cx: number, cy: number, r: number, seed: number): string {
    const steps = 72;
    const points = Array.from({ length: steps }, (_, i) => {
        const a = (i / steps) * TAU;
        const wobble = 1 + 0.16 * Math.sin(3 * a + seed) + 0.08 * Math.sin(5 * a + seed * 1.7);
        return `${(cx + Math.cos(a) * r * wobble * 1.35).toFixed(1)},${(cy + Math.sin(a) * r * wobble).toFixed(1)}`;
    });
    return `M${points.join("L")}Z`;
}

const PEAKS = [
    { x: 470, y: 90, rings: 6, seed: 0.4 },
    { x: 150, y: 120, rings: 5, seed: 2.1 },
    { x: 380, y: 320, rings: 4, seed: 4.2 },
];

export const CONTOURS: readonly string[] = PEAKS.flatMap((peak) =>
    Array.from({ length: peak.rings }, (_, i) => contour(peak.x, peak.y, 14 + i * 17, peak.seed + i * 0.35))
);

/** 시내를 가로지르는 하천 — 위치 감각만 주는 장식 */
export const RIVER = "M-10,250 C90,230 140,280 230,262 S380,200 450,236 S560,300 620,280";

/** 실증 공역 경계 */
export const GEOFENCE = "M40,40 L560,30 L585,350 L60,365 Z";
