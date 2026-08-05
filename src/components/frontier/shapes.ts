/*
 * 트랙별 파티클 목표 형태.
 *
 * 각 함수는 [x,y,z, x,y,z, ...] Float32Array를 count개 만큼 채워 돌려준다.
 * 형태는 트랙 내용을 그대로 옮긴 것이라, 이 오브젝트는 장식이 아니라 설명이다.
 *
 * Math.random()을 그대로 쓰지 않고 시드 난수를 쓰는 이유: 탭을 오갈 때마다
 * 목표 형태가 미묘하게 달라지면 모프가 '되돌아오지' 않고 매번 다른 곳에 착지한다.
 */

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

export type ShapeId = "grounding" | "parsing" | "verification" | "trace";

type Builder = (count: number, random: () => number) => Float32Array;

/** 01 — 격자형 UI 와이어프레임. 화면 위 요소 상자들이 평면에 놓인다. */
const grounding: Builder = (count, random) => {
    const out = new Float32Array(count * 3);

    // 화면을 흉내 낸 직사각형 영역 안에 블록을 배치하고, 블록 테두리에 점을 뿌린다
    const blocks = [
        { x: -1.5, y: 1.05, w: 3.0, h: 0.32 }, // 헤더 바
        { x: -1.5, y: 0.3, w: 1.75, h: 0.95 }, // 본문 영역
        { x: 0.45, y: 0.3, w: 1.05, h: 0.42 }, // 사이드 카드
        { x: 0.45, y: -0.22, w: 1.05, h: 0.42 },
        { x: -1.5, y: -0.85, w: 1.4, h: 0.3 }, // 버튼
        { x: 0.05, y: -0.85, w: 0.75, h: 0.3 },
        { x: -1.5, y: -1.45, w: 3.0, h: 0.36 }, // 표
    ];

    for (let i = 0; i < count; i += 1) {
        const block = blocks[i % blocks.length];
        // 둘레를 따라 놓아야 '검출된 박스'로 읽힌다. 채우면 그냥 판이 된다.
        const perimeter = 2 * (block.w + block.h);
        let t = random() * perimeter;

        let x: number;
        let y: number;
        if (t < block.w) {
            x = block.x + t;
            y = block.y;
        } else if ((t -= block.w) < block.h) {
            x = block.x + block.w;
            y = block.y - t;
        } else if ((t -= block.h) < block.w) {
            x = block.x + block.w - t;
            y = block.y - block.h;
        } else {
            t -= block.w;
            x = block.x;
            y = block.y - block.h + t;
        }

        out[i * 3] = x;
        out[i * 3 + 1] = y;
        // 살짝 두께를 줘야 회전할 때 평면이 사라지지 않는다
        out[i * 3 + 2] = (random() - 0.5) * 0.06;
    }

    return out;
};

/** 02 — 계층 트리. 문서 구조가 위에서 아래로 갈라진다. */
const parsing: Builder = (count, random) => {
    const out = new Float32Array(count * 3);

    const DEPTH = 4;
    const nodes: { x: number; y: number; z: number }[] = [];

    // 층마다 폭을 2배씩 늘리며 노드를 배치한다
    for (let level = 0; level < DEPTH; level += 1) {
        const nodesInLevel = 2 ** level;
        const y = 1.4 - level * 0.9;
        const spread = 0.6 + level * 0.75;

        for (let n = 0; n < nodesInLevel; n += 1) {
            const x =
                nodesInLevel === 1
                    ? 0
                    : (n / (nodesInLevel - 1) - 0.5) * spread * 2;
            nodes.push({ x, y, z: (n % 2 === 0 ? 1 : -1) * level * 0.14 });
        }
    }

    for (let i = 0; i < count; i += 1) {
        // 2/3은 간선 위, 1/3은 노드 주변 — 간선이 있어야 '계층'으로 읽힌다
        if (i % 3 === 0) {
            const node = nodes[i % nodes.length];
            out[i * 3] = node.x + (random() - 0.5) * 0.16;
            out[i * 3 + 1] = node.y + (random() - 0.5) * 0.16;
            out[i * 3 + 2] = node.z + (random() - 0.5) * 0.16;
            continue;
        }

        // 자식 인덱스에서 부모를 역산해 간선을 잇는다
        const childIndex = 1 + (i % (nodes.length - 1));
        const child = nodes[childIndex];
        const parent = nodes[(childIndex - 1) >> 1];
        const t = random();

        out[i * 3] = parent.x + (child.x - parent.x) * t;
        out[i * 3 + 1] = parent.y + (child.y - parent.y) * t;
        out[i * 3 + 2] = parent.z + (child.z - parent.z) * t;
    }

    return out;
};

/** 03 — 공간 포인트 클라우드. 방의 바닥과 벽 모서리가 스캔된 형태. */
const verification: Builder = (count, random) => {
    const out = new Float32Array(count * 3);

    const W = 2.0;
    const H = 1.3;
    const D = 1.6;

    for (let i = 0; i < count; i += 1) {
        const face = i % 5;
        let x = 0;
        let y = 0;
        let z = 0;

        // 천장은 비운다 — 실내를 위에서 들여다보는 스캔의 형태에 가깝다
        if (face === 0) {
            // 바닥
            x = (random() - 0.5) * W * 2;
            y = -H;
            z = (random() - 0.5) * D * 2;
        } else if (face === 1 || face === 2) {
            // 좌우 벽
            x = (face === 1 ? -1 : 1) * W;
            y = -H + random() * H * 2;
            z = (random() - 0.5) * D * 2;
        } else {
            // 앞뒤 벽
            x = (random() - 0.5) * W * 2;
            y = -H + random() * H * 2;
            z = (face === 3 ? -1 : 1) * D;
        }

        // 스캔 노이즈 — 완벽히 평평하면 측정이 아니라 CAD로 보인다
        out[i * 3] = x + (random() - 0.5) * 0.07;
        out[i * 3 + 1] = y + (random() - 0.5) * 0.07;
        out[i * 3 + 2] = z + (random() - 0.5) * 0.07;
    }

    return out;
};

/** 04 — 나선형 타임라인. 트레이스가 시간축을 따라 감긴다. */
const trace: Builder = (count, random) => {
    const out = new Float32Array(count * 3);

    const TURNS = 3.5;
    const HEIGHT = 3.0;

    for (let i = 0; i < count; i += 1) {
        const t = i / count;
        const angle = t * Math.PI * 2 * TURNS;
        // 위로 갈수록 좁아진다 — 실행이 좁혀지는 방향을 형태로 보여준다
        const radius = 1.65 - t * 0.55;

        out[i * 3] = Math.cos(angle) * radius + (random() - 0.5) * 0.08;
        out[i * 3 + 1] = -HEIGHT / 2 + t * HEIGHT + (random() - 0.5) * 0.05;
        out[i * 3 + 2] = Math.sin(angle) * radius + (random() - 0.5) * 0.08;
    }

    return out;
};

const BUILDERS: Record<ShapeId, Builder> = {
    grounding,
    parsing,
    verification,
    trace,
};

/** 트랙 하나의 목표 좌표. 같은 (id, count)면 항상 같은 결과가 나온다. */
export function buildShape(id: ShapeId, count: number): Float32Array {
    // id마다 다른 시드를 주되 고정한다 — 탭을 오가면 같은 형태로 돌아와야 한다
    const seed = id.charCodeAt(0) * 7919 + id.length * 104729;
    return BUILDERS[id](count, makeRandom(seed));
}

/**
 * CV 오버레이가 박스를 걸 앵커 좌표. 파티클 전체가 아니라 몇 개의 대표 지점만
 * 고른다 — 모든 점에 박스를 그리면 화면이 읽히지 않는다.
 */
export interface ShapeAnchor {
    position: [number, number, number];
    label: string;
    confidence: number;
}

export const ANCHORS: Record<ShapeId, readonly ShapeAnchor[]> = {
    grounding: [
        { position: [0, 1.05, 0], label: "header", confidence: 0.97 },
        { position: [-0.62, -0.17, 0], label: "content", confidence: 0.93 },
        { position: [0.97, 0.09, 0], label: "card", confidence: 0.89 },
        { position: [-0.8, -1.0, 0], label: "button", confidence: 0.94 },
        { position: [0, -1.63, 0], label: "table", confidence: 0.91 },
    ],
    parsing: [
        { position: [0, 1.4, 0], label: "root", confidence: 0.99 },
        { position: [-0.6, 0.5, 0], label: "section", confidence: 0.95 },
        { position: [0.6, 0.5, 0], label: "section", confidence: 0.92 },
        { position: [-1.05, -0.4, 0], label: "row", confidence: 0.88 },
        { position: [1.05, -0.4, 0], label: "row", confidence: 0.9 },
    ],
    verification: [
        { position: [-2.0, 0, 0], label: "wall · 마감", confidence: 0.92 },
        { position: [0, -1.3, 0], label: "floor · 시공", confidence: 0.96 },
        { position: [2.0, 0.3, 0], label: "wall · 결함 후보", confidence: 0.71 },
        { position: [0, 0.2, -1.6], label: "opening", confidence: 0.86 },
    ],
    trace: [
        { position: [1.65, -1.5, 0], label: "span · plan", confidence: 0.98 },
        { position: [-1.4, -0.5, 0], label: "span · tool", confidence: 0.94 },
        { position: [1.25, 0.5, 0], label: "span · critic", confidence: 0.87 },
        { position: [-1.1, 1.5, 0], label: "span · output", confidence: 0.95 },
    ],
};
