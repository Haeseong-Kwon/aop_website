/*
 * 트랙별 인식 오브젝트의 형태.
 *
 * 형태 하나는 두 겹이다.
 *  - 점(points): 파티클이 모프로 옮겨 가는 목표 좌표. 표면과 모서리에 밀도를 다르게 뿌려
 *    '스캔된 물체'의 질감을 만든다.
 *  - 선(lines): 형태의 뼈대. 점만으로는 구조가 흐려져 먼지구름이 되고, 선만으로는
 *    CAD 도면이 된다. 둘을 겹쳐야 '읽어낸 구조'로 보인다.
 *
 * 형태는 트랙 내용을 그대로 옮긴 것이다 — 이 오브젝트는 장식이 아니라 설명이다.
 * Math.random() 대신 시드 난수를 쓴다: 트랙을 오갈 때 형태가 매번 달라지면
 * 모프가 '돌아오지' 않고 다른 곳에 착지한다.
 */

export type ShapeId = "grounding" | "parsing" | "verification" | "trace";

type Vec3 = [number, number, number];

/** 선의 톤. core=뼈대, dim=보조선(연결선·격자), alert=결함 후보. */
export type Tone = "core" | "dim" | "alert";

/** mulberry32 — 짧고 분포가 고른 시드 난수. */
function makeRandom(seed: number) {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** 점을 뿌릴 원천. weight는 전체 점 중 이 원천이 가져갈 몫이다. */
type Source =
    | { kind: "seg"; a: Vec3; b: Vec3; weight: number; jitter: number }
    | { kind: "area"; origin: Vec3; u: Vec3; v: Vec3; weight: number; jitter: number; holes?: Hole[] }
    | { kind: "blob"; center: Vec3; radius: number; weight: number };

/** area 원천의 (u,v) 0~1 좌표계에서 비워 둘 직사각형. 창문·문 같은 개구부. */
type Hole = [number, number, number, number];

interface Segment {
    a: Vec3;
    b: Vec3;
    tone: Tone;
}

/** 형태 하나를 그리는 스케치북. 선과 점 원천을 함께 쌓는다. */
class Sketch {
    readonly segments: Segment[] = [];
    readonly sources: Source[] = [];

    line(a: Vec3, b: Vec3, tone: Tone = "core", weight = 0) {
        this.segments.push({ a, b, tone });
        if (weight > 0) this.sources.push({ kind: "seg", a, b, weight, jitter: 0.012 });
    }

    polyline(points: Vec3[], tone: Tone = "core", weight = 0, closed = false) {
        const last = closed ? points.length : points.length - 1;
        for (let i = 0; i < last; i += 1) {
            this.line(points[i], points[(i + 1) % points.length], tone, weight);
        }
    }

    /** z가 고정된 직사각형 테두리. */
    rect(x0: number, y0: number, x1: number, y1: number, z: number, tone: Tone = "core", weight = 0) {
        this.polyline(
            [
                [x0, y0, z],
                [x1, y0, z],
                [x1, y1, z],
                [x0, y1, z],
            ],
            tone,
            weight,
            true
        );
    }

    area(origin: Vec3, u: Vec3, v: Vec3, weight: number, jitter = 0.02, holes?: Hole[]) {
        this.sources.push({ kind: "area", origin, u, v, weight, jitter, holes });
    }

    blob(center: Vec3, radius: number, weight: number) {
        this.sources.push({ kind: "blob", center, radius, weight });
    }
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/* ------------------------------------------------------------------ */
/* 01 — 분해된 화면. 스크린 위 요소들이 층별로 떠올라 각자 검출된다.       */
/* ------------------------------------------------------------------ */

const SCREEN = { x0: -1.7, y0: -1.2, x1: 1.7, y1: 1.2, z: -0.5 };

const UI_BLOCKS = [
    { name: "header", x0: -1.55, y0: 0.82, x1: 1.55, y1: 1.06, z: -0.15 },
    { name: "content", x0: -1.55, y0: -0.62, x1: 0.2, y1: 0.62, z: 0.15 },
    { name: "card", x0: 0.42, y0: 0.12, x1: 1.55, y1: 0.62, z: 0.45 },
    { name: "card-b", x0: 0.42, y0: -0.5, x1: 1.55, y1: 0.0, z: 0.3 },
    { name: "button", x0: -1.55, y0: -1.02, x1: -0.55, y1: -0.78, z: 0.6 },
] as const;

function grounding(sketch: Sketch) {
    const { x0, y0, x1, y1, z } = SCREEN;
    sketch.rect(x0, y0, x1, y1, z, "core", 1.2);
    // 바탕 화면은 점 격자로 채운다 — 화면이라는 평면이 먼저 읽혀야 요소가 그 위에 뜬다
    sketch.area([x0, y0, z], [x1 - x0, 0, 0], [0, y1 - y0, 0], 3.2, 0.006);

    for (const block of UI_BLOCKS) {
        sketch.rect(block.x0, block.y0, block.x1, block.y1, block.z, "core", 1.1);
        sketch.area(
            [block.x0, block.y0, block.z],
            [block.x1 - block.x0, 0, 0],
            [0, block.y1 - block.y0, 0],
            0.45,
            0.004
        );

        // 분해도의 연결선 — 요소가 화면 어디에서 떠올랐는지 보여준다
        for (const [cx, cy] of [
            [block.x0, block.y0],
            [block.x1, block.y0],
            [block.x1, block.y1],
            [block.x0, block.y1],
        ] as const) {
            sketch.line([cx, cy, z], [cx, cy, block.z], "dim");
        }
    }

    // 본문 블록 안의 글줄
    for (let row = 0; row < 5; row += 1) {
        const y = 0.42 - row * 0.22;
        const end = row === 4 ? -0.6 : 0.02 - (row % 2) * 0.28;
        sketch.line([-1.4, y, 0.15], [end, y, 0.15], "dim", 0.35);
    }
}

/* ------------------------------------------------------------------ */
/* 02 — 문서에서 트리로. 왼쪽 페이지의 레이아웃이 오른쪽 계층으로 복원된다. */
/* ------------------------------------------------------------------ */

const PAGE = { x0: -1.95, y0: -1.4, x1: -0.55, y1: 1.4, z: -0.35 };
const TREE_Z = 0.2;
const TREE = {
    root: [0.55, 1.2] as const,
    sections: [
        [-0.05, 0.3],
        [1.15, 0.3],
    ] as const,
    rows: [
        [-0.4, -0.55],
        [0.3, -0.55],
        [0.8, -0.55],
        [1.5, -0.55],
    ] as const,
};

function node(sketch: Sketch, x: number, y: number, size: number) {
    sketch.rect(x - size, y - size, x + size, y + size, TREE_Z, "core", 0.5);
    sketch.blob([x, y, TREE_Z], size * 0.8, 0.6);
}

/** 문서 트리 특유의 꺾인 연결선. 대각선보다 '구조'로 읽힌다. */
function elbow(sketch: Sketch, from: readonly [number, number], to: readonly [number, number]) {
    const mid = (from[1] + to[1]) / 2;
    sketch.polyline(
        [
            [from[0], from[1], TREE_Z],
            [from[0], mid, TREE_Z],
            [to[0], mid, TREE_Z],
            [to[0], to[1], TREE_Z],
        ],
        "core",
        0.9
    );
}

function parsing(sketch: Sketch) {
    const { x0, y0, x1, y1, z } = PAGE;
    sketch.rect(x0, y0, x1, y1, z, "core", 0.8);
    sketch.area([x0, y0, z], [x1 - x0, 0, 0], [0, y1 - y0, 0], 0.8, 0.004);

    // 페이지 레이아웃: 제목, 두 단락, 작은 표
    sketch.line([x0 + 0.15, 1.15, z], [x1 - 0.35, 1.15, z], "core", 0.6);
    for (let row = 0; row < 4; row += 1) {
        const y = 0.75 - row * 0.16;
        sketch.line([x0 + 0.15, y, z], [x1 - 0.15 - (row % 3) * 0.2, y, z], "dim", 0.4);
    }
    for (let row = 0; row < 3; row += 1) {
        const y = -0.05 - row * 0.16;
        sketch.line([x0 + 0.15, y, z], [x1 - 0.15 - (row % 2) * 0.35, y, z], "dim", 0.4);
    }
    const table = { x0: x0 + 0.15, x1: x1 - 0.15, y0: -1.2, y1: -0.6 };
    sketch.rect(table.x0, table.y0, table.x1, table.y1, z, "core", 0.4);
    sketch.line([table.x0, -0.9, z], [table.x1, -0.9, z], "dim", 0.2);
    sketch.line([(table.x0 + table.x1) / 2, table.y0, z], [(table.x0 + table.x1) / 2, table.y1, z], "dim", 0.2);

    // 트리
    node(sketch, TREE.root[0], TREE.root[1], 0.11);
    TREE.sections.forEach((section, index) => {
        node(sketch, section[0], section[1], 0.09);
        elbow(sketch, TREE.root, section);
        TREE.rows.slice(index * 2, index * 2 + 2).forEach((row) => {
            node(sketch, row[0], row[1], 0.07);
            elbow(sketch, section, row);
            // 행 아래 셀 잎
            for (const dx of [-0.12, 0.12]) {
                sketch.line([row[0], row[1] - 0.07, TREE_Z], [row[0] + dx, row[1] - 0.55, TREE_Z], "dim", 0.15);
                sketch.blob([row[0] + dx, row[1] - 0.6, TREE_Z], 0.035, 0.12);
            }
        });
    });

    // 어느 영역이 어느 노드가 되었는지 — 페이지에서 트리로 건너가는 대응선
    sketch.line([x1, 1.15, z], [TREE.root[0] - 0.11, TREE.root[1], TREE_Z], "dim");
    sketch.line([x1, 0.6, z], [TREE.sections[0][0] - 0.09, TREE.sections[0][1], TREE_Z], "dim");
    sketch.line([x1, -0.9, z], [TREE.rows[0][0] - 0.07, TREE.rows[0][1], TREE_Z], "dim");
}

/* ------------------------------------------------------------------ */
/* 03 — 현장 스캔. 방의 포인트 클라우드 위에서 결함 후보 영역을 짚는다.    */
/* ------------------------------------------------------------------ */

const ROOM = { x: 1.7, y: 1.1, z: 1.3 };
const DEFECT = { z0: -0.55, z1: 0.25, y0: -0.35, y1: 0.45 };

function verification(sketch: Sketch) {
    const { x, y, z } = ROOM;

    // 바닥: 타일 줄눈까지 그려야 '시공된 바닥'으로 읽힌다
    sketch.polyline(
        [
            [-x, -y, -z],
            [x, -y, -z],
            [x, -y, z],
            [-x, -y, z],
        ],
        "core",
        0.6,
        true
    );
    for (let i = 1; i < 8; i += 1) {
        const gx = -x + (i / 8) * x * 2;
        sketch.line([gx, -y, -z], [gx, -y, z], "dim");
    }
    for (let i = 1; i < 6; i += 1) {
        const gz = -z + (i / 6) * z * 2;
        sketch.line([-x, -y, gz], [x, -y, gz], "dim");
    }

    // 벽 모서리 — 천장과 앞벽은 비워 안을 들여다보는 단면으로 둔다
    for (const [cx, cz] of [
        [-x, -z],
        [x, -z],
        [-x, z],
        [x, z],
    ] as const) {
        sketch.line([cx, -y, cz], [cx, y, cz], "core", 0.5);
    }
    sketch.polyline(
        [
            [-x, y, z],
            [-x, y, -z],
            [x, y, -z],
            [x, y, z],
        ],
        "core",
        0.5
    );

    // 뒷벽 창, 왼쪽 벽 문
    sketch.rect(-0.6, -0.1, 0.6, 0.7, -z, "core", 0.4);
    sketch.polyline(
        [
            [-x, -y, -0.2],
            [-x, 0.5, -0.2],
            [-x, 0.5, 0.6],
            [-x, -y, 0.6],
        ],
        "core",
        0.4
    );

    // 결함 후보 — 오른쪽 벽의 한 영역만 경고색으로 둘러 표시한다
    const { z0, z1, y0, y1 } = DEFECT;
    sketch.polyline(
        [
            [x, y0, z0],
            [x, y1, z0],
            [x, y1, z1],
            [x, y0, z1],
        ],
        "alert",
        0,
        true
    );
    const cy = (y0 + y1) / 2;
    const cz = (z0 + z1) / 2;
    sketch.line([x, cy - 0.14, cz], [x, cy + 0.14, cz], "alert");
    sketch.line([x, cy, cz - 0.14], [x, cy, cz + 0.14], "alert");
    sketch.blob([x, cy, cz], 0.22, 0.9);

    // 표면 점: 스캔 노이즈를 조금 남긴다 — 완벽히 평평하면 측정이 아니라 CAD다
    sketch.area([-x, -y, -z], [x * 2, 0, 0], [0, 0, z * 2], 3.0, 0.03);
    sketch.area([-x, -y, -z], [x * 2, 0, 0], [0, y * 2, 0], 2.2, 0.03, [[0.32, 0.45, 0.68, 0.82]]);
    sketch.area([-x, -y, -z], [0, 0, z * 2], [0, y * 2, 0], 1.6, 0.03, [[0.42, 0.0, 0.73, 0.73]]);
    sketch.area([x, -y, -z], [0, 0, z * 2], [0, y * 2, 0], 1.6, 0.03);
}

/* ------------------------------------------------------------------ */
/* 04 — 트레이스 나선. 실행 구간(span)이 시간축을 따라 감겨 올라간다.      */
/* ------------------------------------------------------------------ */

const TRACE = { turns: 2.25, bottom: -1.45, top: 1.45 };
/** 나선 위 span 마커의 위치(0~1). 앵커와 공유한다. */
const SPAN_AT = [0.06, 0.36, 0.64, 0.94] as const;

function helix(t: number): Vec3 {
    const angle = t * Math.PI * 2 * TRACE.turns;
    // 위로 갈수록 좁아진다 — 실행이 결론으로 좁혀지는 방향을 형태로 보여준다
    const radius = 1.55 - t * 0.45;
    return [
        Math.cos(angle) * radius,
        TRACE.bottom + t * (TRACE.top - TRACE.bottom),
        Math.sin(angle) * radius,
    ];
}

function trace(sketch: Sketch) {
    const STEPS = 220;
    for (let i = 0; i < STEPS; i += 1) {
        sketch.line(helix(i / STEPS), helix((i + 1) / STEPS), "core", 0.04);
    }

    // 시간축
    sketch.line([0, TRACE.bottom - 0.2, 0], [0, TRACE.top + 0.2, 0], "dim", 0.4);

    for (const at of SPAN_AT) {
        const center = helix(at);
        // 축에서 span까지 뻗는 눈금
        sketch.line([0, center[1], 0], center, "dim");
        // span 마커 — 나선을 감싸는 작은 고리
        const RING = 24;
        for (let i = 0; i < RING; i += 1) {
            const a0 = (i / RING) * Math.PI * 2;
            const a1 = ((i + 1) / RING) * Math.PI * 2;
            sketch.line(
                [center[0] + Math.cos(a0) * 0.13, center[1], center[2] + Math.sin(a0) * 0.13],
                [center[0] + Math.cos(a1) * 0.13, center[1], center[2] + Math.sin(a1) * 0.13],
                "core"
            );
        }
        sketch.blob(center, 0.1, 0.8);
    }

    // span 사이 구간은 굵게 — 시간이 실제로 쓰인 자리
    for (let s = 0; s < SPAN_AT.length - 1; s += 1) {
        const from = SPAN_AT[s] + 0.03;
        const to = SPAN_AT[s + 1] - 0.03;
        const SUB = 40;
        for (let i = 0; i < SUB; i += 1) {
            const t0 = from + ((to - from) * i) / SUB;
            const t1 = from + ((to - from) * (i + 1)) / SUB;
            sketch.sources.push({ kind: "seg", a: helix(t0), b: helix(t1), weight: 0.1, jitter: 0.05 });
        }
    }
}

const SKETCHERS: Record<ShapeId, (sketch: Sketch) => void> = {
    grounding,
    parsing,
    verification,
    trace,
};

const sketchCache = new Map<ShapeId, Sketch>();

function getSketch(id: ShapeId) {
    const cached = sketchCache.get(id);
    if (cached) return cached;
    const sketch = new Sketch();
    SKETCHERS[id](sketch);
    sketchCache.set(id, sketch);
    return sketch;
}

/** 원천 하나에서 점 하나를 뽑는다. */
function sample(source: Source, random: () => number): Vec3 {
    if (source.kind === "seg") {
        const p = lerp3(source.a, source.b, random());
        const j = source.jitter;
        return [p[0] + (random() - 0.5) * j, p[1] + (random() - 0.5) * j, p[2] + (random() - 0.5) * j];
    }

    if (source.kind === "blob") {
        // 가우시안에 가깝게 — 중심이 빽빽하고 가장자리로 갈수록 성기다
        const r = source.radius * Math.sqrt(-2 * Math.log(Math.max(1e-6, random()))) * 0.5;
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        return [
            source.center[0] + r * Math.sin(phi) * Math.cos(theta),
            source.center[1] + r * Math.sin(phi) * Math.sin(theta),
            source.center[2] + r * Math.cos(phi),
        ];
    }

    // area: 개구부에 떨어지면 다시 뽑는다
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const u = random();
        const v = random();
        const inHole = source.holes?.some(([u0, v0, u1, v1]) => u > u0 && u < u1 && v > v0 && v < v1);
        if (inHole) continue;

        const j = source.jitter;
        return [
            source.origin[0] + source.u[0] * u + source.v[0] * v + (random() - 0.5) * j,
            source.origin[1] + source.u[1] * u + source.v[1] * v + (random() - 0.5) * j,
            source.origin[2] + source.u[2] * u + source.v[2] * v + (random() - 0.5) * j,
        ];
    }
    return source.origin;
}

/** 트랙 하나의 파티클 목표 좌표. 같은 (id, count)면 항상 같은 결과가 나온다. */
export function buildShape(id: ShapeId, count: number): Float32Array {
    const seed = id.charCodeAt(0) * 7919 + id.length * 104729;
    const random = makeRandom(seed);
    const { sources } = getSketch(id);

    const total = sources.reduce((sum, source) => sum + source.weight, 0);
    const out = new Float32Array(count * 3);

    // 원천별 몫을 층화해서 나눈다 — 무작위로 고르면 짧은 선이 통째로 빠지기도 한다
    let written = 0;
    sources.forEach((source, index) => {
        const isLast = index === sources.length - 1;
        const share = isLast ? count - written : Math.round((source.weight / total) * count);
        for (let k = 0; k < share && written < count; k += 1) {
            const p = sample(source, random);
            out.set(p, written * 3);
            written += 1;
        }
    });

    // 점 순서를 섞는다. 모프 때 같은 원천의 점이 한 덩어리로 이동하면 띠가 진다.
    for (let i = count - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        for (let axis = 0; axis < 3; axis += 1) {
            const tmp = out[i * 3 + axis];
            out[i * 3 + axis] = out[j * 3 + axis];
            out[j * 3 + axis] = tmp;
        }
    }

    return out;
}

export interface ShapeLines {
    positions: Float32Array;
    /** 선분 끝점마다 0~1. 이 순서로 선이 그려지며 나타난다. */
    order: Float32Array;
    /** 0=core, 1=dim, 2=alert */
    tone: Float32Array;
}

const TONE_INDEX: Record<Tone, number> = { core: 0, dim: 1, alert: 2 };

/** 트랙 하나의 뼈대 선분. LineSegments 한 벌로 그린다. */
export function buildLines(id: ShapeId): ShapeLines {
    const { segments } = getSketch(id);
    const positions = new Float32Array(segments.length * 6);
    const order = new Float32Array(segments.length * 2);
    const tone = new Float32Array(segments.length * 2);

    segments.forEach((segment, index) => {
        positions.set(segment.a, index * 6);
        positions.set(segment.b, index * 6 + 3);
        // 선분의 시작과 끝에 같은 순서값을 준다 — 선분 단위로 켜진다
        const at = index / Math.max(1, segments.length - 1);
        order[index * 2] = at;
        order[index * 2 + 1] = at;
        tone[index * 2] = TONE_INDEX[segment.tone];
        tone[index * 2 + 1] = TONE_INDEX[segment.tone];
    });

    return { positions, order, tone };
}

/**
 * CV 오버레이가 박스를 걸 앵커. 형태의 실제 특징점 위에 둔다 — 아무 데나 두면
 * 인식이 아니라 무늬가 된다. 좌표는 위 형태 상수에서 그대로 끌어온다.
 */
export interface ShapeAnchor {
    position: Vec3;
    label: string;
    confidence: number;
}

function blockCenter(name: (typeof UI_BLOCKS)[number]["name"]): Vec3 {
    const block = UI_BLOCKS.find((item) => item.name === name);
    if (!block) return [0, 0, 0];
    return [(block.x0 + block.x1) / 2, (block.y0 + block.y1) / 2, block.z];
}

export const ANCHORS: Record<ShapeId, readonly ShapeAnchor[]> = {
    grounding: [
        { position: blockCenter("header"), label: "header", confidence: 0.97 },
        { position: blockCenter("content"), label: "content", confidence: 0.93 },
        { position: blockCenter("card"), label: "card", confidence: 0.89 },
        { position: blockCenter("button"), label: "button", confidence: 0.94 },
    ],
    parsing: [
        { position: [(PAGE.x0 + PAGE.x1) / 2, 0.2, PAGE.z], label: "source", confidence: 0.98 },
        { position: [TREE.root[0], TREE.root[1], TREE_Z], label: "root", confidence: 0.99 },
        { position: [TREE.sections[1][0], TREE.sections[1][1], TREE_Z], label: "section", confidence: 0.94 },
        { position: [TREE.rows[1][0], TREE.rows[1][1], TREE_Z], label: "row", confidence: 0.9 },
    ],
    verification: [
        { position: [-ROOM.x, 0.75, -0.75], label: "wall · 마감", confidence: 0.92 },
        { position: [0.2, -ROOM.y, 0.45], label: "floor · 시공", confidence: 0.96 },
        {
            position: [ROOM.x, (DEFECT.y0 + DEFECT.y1) / 2, (DEFECT.z0 + DEFECT.z1) / 2],
            label: "결함 후보",
            confidence: 0.71,
        },
        { position: [0, 0.3, -ROOM.z], label: "opening", confidence: 0.86 },
    ],
    trace: [
        { position: helix(SPAN_AT[0]), label: "span · plan", confidence: 0.98 },
        { position: helix(SPAN_AT[1]), label: "span · tool", confidence: 0.94 },
        { position: helix(SPAN_AT[2]), label: "span · critic", confidence: 0.87 },
        { position: helix(SPAN_AT[3]), label: "span · output", confidence: 0.95 },
    ],
};

/** 앵커 중 경고색으로 그릴 것. 결함 후보처럼 '문제'를 짚은 검출이다. */
export function isAlertAnchor(anchor: ShapeAnchor) {
    return anchor.confidence < 0.8;
}
