"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { buildLines, buildShape, type ShapeId } from "@/components/frontier/shapes";

/*
 * 인식 오브젝트.
 *
 * 세 겹으로 그린다.
 *  1) 파티클 — 형태 사이를 GPU에서 모프한다. 이전/다음 형태를 attribute 두 벌로 올리고
 *     uniform 하나(u_mix)만 움직인다. 1만 점을 JS로 보간하면 메인 스레드가 그것만 하다 끝난다.
 *  2) 뼈대 선 — 형태가 바뀔 때마다 순서대로 그려지며 나타난다. 점만으로는 구조가
 *     먼지구름이 되고, 선이 붙어야 '읽어낸 구조'가 된다.
 *  3) 스캔 시트 — 오브젝트를 위에서 아래로 실제로 통과하는 수평면. 시트가 지나간 자리의
 *     점이 순간 밝아지고, 지나간 높이의 앵커에만 검출 박스가 붙는다. 화면 위에 따로 긋는
 *     2D 선이 아니라 같은 공간 안의 장치라서, 인식이 '물체를 읽는 일'로 보인다.
 */

const OBJECT_NAME = "perception-object";
/** 스캔 시트가 훑는 높이 범위(월드 단위). 형태들의 위아래 끝보다 조금 넓다. */
const SCAN_TOP = 1.75;
const SCAN_BOTTOM = -1.75;
const FLOOR_Y = -2.05;

/**
 * 트랙별 기본 시점(yaw). 분해도는 비스듬해야 층이 보이고, 트리는 정면에 가까워야
 * 가지가 겹치지 않는다. 형태마다 읽히는 각도가 다르다.
 */
const BASE_YAW: Record<ShapeId, number> = {
    grounding: -0.72,
    parsing: -0.32,
    // 결함 후보가 있는 오른쪽 벽의 안쪽 면이 보이도록 반대로 돈다
    verification: 0.62,
    trace: 0,
};

const BEAM = new THREE.Color("#4a8cff");
const GLOW = new THREE.Color("#bcd8ff");
const DEEP = new THREE.Color("#1b4fc4");
const ALERT = new THREE.Color("#ff7b76");

/** 진행도(0~1) → 스캔 시트 높이. */
export function scanHeight(scan: number) {
    return SCAN_TOP + (SCAN_BOTTOM - SCAN_TOP) * scan;
}

const POINT_VERTEX = /* glsl */ `
attribute vec3 a_next;
attribute float a_seed;

uniform float u_mix;
uniform float u_time;
uniform float u_size;
uniform float u_dpr;
uniform float u_scanY;
uniform float u_scanOn;

varying float v_depth;
varying float v_seed;
varying float v_scan;

void main() {
  float m = smoothstep(0.0, 1.0, u_mix);
  // 점마다 출발을 조금씩 늦춘다 — 한꺼번에 움직이면 판이 통째로 미끄러지는 것처럼 보인다
  float stagger = clamp(m * 1.35 - a_seed * 0.35, 0.0, 1.0);
  stagger = stagger * stagger * (3.0 - 2.0 * stagger);
  vec3 pos = mix(position, a_next, stagger);

  // 이동 중인 점만 바깥으로 살짝 부풀었다 돌아온다
  float travel = sin(stagger * 3.14159265);
  pos += normalize(pos + 0.0001) * travel * 0.18 * (0.4 + a_seed);

  float phase = a_seed * 6.2831;
  pos += vec3(
    sin(u_time * 0.6 + phase) * 0.006,
    cos(u_time * 0.5 + phase * 1.3) * 0.006,
    sin(u_time * 0.45 + phase * 0.7) * 0.006
  );

  vec4 world = modelMatrix * vec4(pos, 1.0);
  // 스캔 시트와의 거리. 시트가 지나가는 얇은 띠 안의 점만 반응한다.
  v_scan = exp(-pow((world.y - u_scanY) * 9.0, 2.0)) * u_scanOn;

  vec4 mv = viewMatrix * world;
  v_depth = -mv.z;
  v_seed = a_seed;

  gl_Position = projectionMatrix * mv;
  float spread = 0.6 + a_seed * 0.9;
  gl_PointSize = u_size * u_dpr * spread * (1.0 + v_scan * 1.4) * (3.2 / max(v_depth, 0.1));
}
`;

const POINT_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 u_core;
uniform vec3 u_far;
uniform float u_time;

varying float v_depth;
varying float v_seed;
varying float v_scan;

void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  if (r > 1.0) discard;

  // 심과 헤일로 두 겹. 가산 합성에서 점이 몰린 곳이 저절로 광원이 된다.
  float core = exp(-r * r * 10.0);
  float halo = exp(-r * r * 3.0) * 0.32;

  float near = 1.0 - smoothstep(3.5, 9.0, v_depth);
  vec3 color = mix(u_far, u_core, near);
  color = mix(color, vec3(1.0), core * 0.35 * near + v_scan * 0.8);

  float shimmer = 0.9 + 0.1 * sin(u_time * 0.8 + v_seed * 6.2831);
  float alpha = (core + halo) * (0.16 + near * 0.4 + v_scan * 0.7) * shimmer;

  gl_FragColor = vec4(color, alpha);
}
`;

const LINE_VERTEX = /* glsl */ `
attribute float a_order;
attribute float a_tone;

uniform float u_scanY;
uniform float u_scanOn;

varying float v_order;
varying float v_tone;
varying float v_scan;
varying float v_depth;

void main() {
  v_order = a_order;
  v_tone = a_tone;
  vec4 world = modelMatrix * vec4(position, 1.0);
  v_scan = exp(-pow((world.y - u_scanY) * 7.0, 2.0)) * u_scanOn;
  vec4 mv = viewMatrix * world;
  v_depth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

/*
 * 선은 a_order 순서대로 켜진다. 막 켜진 선분(머리)은 흰빛으로 타고, 뒤로 갈수록
 * 제 색으로 식는다 — 플로터가 도면을 그려 나가는 인상이다.
 */
const LINE_FRAGMENT = /* glsl */ `
precision highp float;

uniform float u_reveal;
uniform float u_opacity;
uniform vec3 u_core;
uniform vec3 u_dim;
uniform vec3 u_alert;

varying float v_order;
varying float v_tone;
varying float v_scan;
varying float v_depth;

void main() {
  float head = u_reveal * 1.15;
  if (v_order > head) discard;

  float fresh = 1.0 - smoothstep(0.0, 0.12, head - v_order);
  vec3 base = v_tone < 0.5 ? u_core : (v_tone < 1.5 ? u_dim : u_alert);
  float strength = v_tone < 0.5 ? 0.75 : (v_tone < 1.5 ? 0.3 : 1.0);

  float near = 1.0 - smoothstep(3.5, 9.5, v_depth);
  vec3 color = mix(base, vec3(1.0), fresh * 0.85 + v_scan * 0.6);
  float alpha = (strength * (0.45 + near * 0.55) + fresh * 0.6 + v_scan * 0.5) * u_opacity;

  gl_FragColor = vec4(color, alpha);
}
`;

const SHEET_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** 스캔 시트 — 가운데가 밝고 가장자리로 꺼지는 얇은 판, 테두리에 레이저 링. */
const SHEET_FRAGMENT = /* glsl */ `
uniform vec3 u_color;
uniform float u_opacity;
uniform float u_time;
varying vec2 vUv;

void main() {
  vec2 p = vUv - 0.5;
  float d = length(p) * 2.0;
  float body = (1.0 - smoothstep(0.0, 1.0, d)) * 0.16;
  float ring = exp(-pow((d - 0.92) * 28.0, 2.0)) * 0.5;
  // 판 위를 흐르는 가는 주사선
  float lines = smoothstep(0.82, 1.0, sin((p.x * 60.0) + u_time * 2.0)) * 0.08 * (1.0 - d);
  float alpha = (body + ring + lines) * u_opacity;
  if (d > 1.0) discard;
  gl_FragColor = vec4(u_color, alpha);
}
`;

interface SceneRefs {
    scroll: React.RefObject<number>;
    orbit: React.RefObject<{ x: number; y: number }>;
    scan: React.RefObject<number>;
}

interface ParticlesProps extends SceneRefs {
    shape: ShapeId;
    count: number;
    offsetX: number;
    onQualityDrop: () => void;
}

function Particles({ shape, count, offsetX, scroll, orbit, scan, onQualityDrop }: ParticlesProps) {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { camera } = useThree();

    // 형태는 (id, count)에 대해 결정적이라 캐시가 안전하다
    const shapes = useMemo(
        () => ({
            grounding: buildShape("grounding", count),
            parsing: buildShape("parsing", count),
            verification: buildShape("verification", count),
            trace: buildShape("trace", count),
        }),
        [count]
    );

    const geometry = useMemo(() => {
        const seeds = new Float32Array(count);
        for (let i = 0; i < count; i += 1) seeds[i] = (i * 0.6180339887) % 1;

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(shapes[shape].slice(), 3));
        geo.setAttribute("a_next", new THREE.BufferAttribute(shapes[shape].slice(), 3));
        geo.setAttribute("a_seed", new THREE.BufferAttribute(seeds, 1));
        return geo;
        // 초기 지오메트리만 만든다. 이후 형태 변경은 아래 이펙트가 attribute를 갈아 끼운다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    const uniforms = useMemo(
        () => ({
            u_mix: { value: 1 },
            u_time: { value: 0 },
            u_size: { value: 3.6 },
            u_dpr: { value: 1 },
            u_scanY: { value: SCAN_TOP },
            u_scanOn: { value: 0 },
            u_core: { value: GLOW.clone() },
            u_far: { value: DEEP.clone() },
        }),
        []
    );

    // 형태가 바뀌면 현재 보간 상태를 새 출발점으로 굳히고 새 목표를 올린다
    useEffect(() => {
        const material = materialRef.current;
        if (!material) return;

        const position = geometry.getAttribute("position") as THREE.BufferAttribute;
        const next = geometry.getAttribute("a_next") as THREE.BufferAttribute;
        const mix = material.uniforms.u_mix.value as number;
        const from = position.array as Float32Array;
        const to = next.array as Float32Array;
        const eased = mix * mix * (3 - 2 * mix);
        for (let i = 0; i < from.length; i += 1) {
            from[i] = from[i] + (to[i] - from[i]) * eased;
        }

        to.set(shapes[shape]);
        position.needsUpdate = true;
        next.needsUpdate = true;
        material.uniforms.u_mix.value = 0;
    }, [shape, shapes, geometry]);

    const current = useRef({ x: 0, y: 0 });
    const autoYaw = useRef(0);
    const baseYaw = useRef(BASE_YAW[shape]);
    const fps = useRef({ start: 0, frames: 0, slow: 0, dropped: false });

    useFrame((state, delta) => {
        const material = materialRef.current;
        const group = groupRef.current;
        if (!material || !group) return;

        material.uniforms.u_time.value = state.clock.elapsedTime;
        material.uniforms.u_dpr.value = state.gl.getPixelRatio();
        if (material.uniforms.u_mix.value < 1) {
            material.uniforms.u_mix.value = Math.min(1, material.uniforms.u_mix.value + delta / 1.1);
        }

        const progress = scan.current ?? 1;
        material.uniforms.u_scanY.value = scanHeight(progress);
        material.uniforms.u_scanOn.value = progress < 1 ? 1 : 0;

        const target = orbit.current ?? { x: 0, y: 0 };
        current.current.x += (target.x - current.current.x) * 0.08;
        current.current.y += (target.y - current.current.y) * 0.08;

        group.position.x = offsetX;
        autoYaw.current += delta * 0.1;
        // 기본 시점은 형태가 바뀔 때 모프와 같은 속도로 넘어간다
        baseYaw.current += (BASE_YAW[shape] - baseYaw.current) * (1 - Math.exp(-delta * 2.5));
        group.rotation.y = baseYaw.current + Math.sin(autoYaw.current) * 0.22 + current.current.x;
        group.rotation.x = 0.08 + current.current.y;

        // 스크롤에 따라 카메라가 물러나며 위로 올라간다
        const scroll01 = scroll.current ?? 0;
        camera.position.set(offsetX * 0.15, -0.2 + scroll01 * 1.2, 6.3 + scroll01 * 1.1);
        camera.lookAt(offsetX * 0.15, -0.1, 0);

        // 적응형 품질 — 60프레임 표본에서 두 번 연속 느리면 점 수를 낮춘다
        const now = state.clock.elapsedTime;
        const meter = fps.current;
        if (meter.start === 0) meter.start = now;
        meter.frames += 1;
        if (meter.frames >= 60) {
            const rate = meter.frames / (now - meter.start);
            meter.slow = rate < 45 ? meter.slow + 1 : 0;
            meter.start = now;
            meter.frames = 0;
            if (meter.slow >= 2 && !meter.dropped) {
                meter.dropped = true;
                onQualityDrop();
            }
        }
    });

    return (
        <group ref={groupRef} name={OBJECT_NAME} scale={0.92}>
            <points geometry={geometry} frustumCulled={false}>
                <shaderMaterial
                    ref={materialRef}
                    uniforms={uniforms}
                    vertexShader={POINT_VERTEX}
                    fragmentShader={POINT_FRAGMENT}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
            {(["grounding", "parsing", "verification", "trace"] as const).map((id) => (
                <Skeleton key={id} id={id} active={id === shape} scan={scan} />
            ))}
        </group>
    );
}

/** 형태 하나의 뼈대 선. 활성화되면 순서대로 그려지고, 비활성이면 빠르게 사라진다. */
function Skeleton({ id, active, scan }: { id: ShapeId; active: boolean; scan: React.RefObject<number> }) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const lineRef = useRef<THREE.LineSegments>(null);

    const geometry = useMemo(() => {
        const lines = buildLines(id);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(lines.positions, 3));
        geo.setAttribute("a_order", new THREE.BufferAttribute(lines.order, 1));
        geo.setAttribute("a_tone", new THREE.BufferAttribute(lines.tone, 1));
        return geo;
    }, [id]);

    const uniforms = useMemo(
        () => ({
            u_reveal: { value: 0 },
            u_opacity: { value: 0 },
            u_scanY: { value: SCAN_TOP },
            u_scanOn: { value: 0 },
            u_core: { value: GLOW.clone() },
            u_dim: { value: BEAM.clone() },
            u_alert: { value: ALERT.clone() },
        }),
        []
    );

    // 다시 활성화될 때마다 처음부터 그린다
    useEffect(() => {
        if (active && materialRef.current) materialRef.current.uniforms.u_reveal.value = 0;
    }, [active]);

    useFrame((_, delta) => {
        const material = materialRef.current;
        const line = lineRef.current;
        if (!material || !line) return;

        const live = material.uniforms;
        const opacityTarget = active ? 1 : 0;
        live.u_opacity.value += (opacityTarget - live.u_opacity.value) * (1 - Math.exp(-delta * (active ? 3 : 9)));
        // 파티클이 자리를 잡기 시작한 뒤부터 긋는다
        if (active) live.u_reveal.value = Math.min(1, live.u_reveal.value + delta / 1.8);

        const progress = scan.current ?? 1;
        live.u_scanY.value = scanHeight(progress);
        live.u_scanOn.value = progress < 1 ? 1 : 0;
        line.visible = live.u_opacity.value > 0.01;
    });

    return (
        <lineSegments ref={lineRef} geometry={geometry} frustumCulled={false}>
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={LINE_VERTEX}
                fragmentShader={LINE_FRAGMENT}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </lineSegments>
    );
}

/** 오브젝트 뒤에 번지는 빛. 검은 무대에 공기를 만든다 — 블룸 후처리 없이. */
function Backlight({ offsetX }: { offsetX: number }) {
    const texture = useMemo(() => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (context) {
            const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            gradient.addColorStop(0, "rgba(74,140,255,0.55)");
            gradient.addColorStop(0.4, "rgba(27,79,196,0.18)");
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            context.fillStyle = gradient;
            context.fillRect(0, 0, size, size);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <mesh position={[offsetX, 0, -3.2]} renderOrder={-1}>
            <planeGeometry args={[9, 7]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.55}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
            />
        </mesh>
    );
}

/** 오브젝트를 위에서 아래로 통과하는 수평 스캔 시트. */
function ScanSheet({ offsetX, scan }: { offsetX: number; scan: React.RefObject<number> }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(
        () => ({
            u_color: { value: GLOW.clone() },
            u_opacity: { value: 0 },
            u_time: { value: 0 },
        }),
        []
    );

    useFrame((state, delta) => {
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!mesh || !material) return;

        const progress = scan.current ?? 1;
        mesh.position.set(offsetX, scanHeight(progress), 0);
        const visible = progress > 0.001 && progress < 1 ? 1 : 0;
        material.uniforms.u_opacity.value +=
            (visible - material.uniforms.u_opacity.value) * (1 - Math.exp(-delta * 6));
        material.uniforms.u_time.value = state.clock.elapsedTime;
        mesh.visible = material.uniforms.u_opacity.value > 0.01;
    });

    return (
        <mesh ref={meshRef} rotation-x={-Math.PI / 2} renderOrder={2}>
            <planeGeometry args={[5.4, 5.4]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={SHEET_VERTEX}
                fragmentShader={SHEET_FRAGMENT}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

/**
 * 매 프레임 앵커의 화면 좌표를 계산해 오버레이에 넘긴다.
 * 스캔 시트가 이미 지나간 높이의 앵커만 revealed가 된다.
 */
function AnchorProjector({
    anchors,
    scan,
    onProject,
}: {
    anchors: readonly [number, number, number][];
    scan: React.RefObject<number>;
    onProject: (projected: Projected[]) => void;
}) {
    const vector = useMemo(() => new THREE.Vector3(), []);
    const { camera, size, scene } = useThree();
    const frame = useRef(0);

    useFrame(() => {
        // 오버레이는 DOM이라 매 프레임 setState하면 React가 따라오지 못한다 — 3프레임에 한 번
        frame.current += 1;
        if (frame.current % 3 !== 0) return;

        const object = scene.getObjectByName(OBJECT_NAME);
        const matrix = object?.matrixWorld;
        const progress = scan.current ?? 1;
        const sheetY = scanHeight(progress);

        onProject(
            anchors.map((anchor) => {
                vector.set(anchor[0], anchor[1], anchor[2]);
                if (matrix) vector.applyMatrix4(matrix);

                const worldY = vector.y;
                const depth = vector.distanceTo(camera.position);
                vector.project(camera);

                return {
                    x: ((vector.x + 1) / 2) * size.width,
                    y: ((1 - vector.y) / 2) * size.height,
                    visible:
                        vector.z < 1 &&
                        Math.abs(vector.x) < 1.05 &&
                        Math.abs(vector.y) < 1.05 &&
                        depth < 12,
                    revealed: progress >= 1 || worldY >= sheetY,
                    // 오른쪽 가장자리에 붙은 앵커는 라벨을 왼쪽으로 단다 — 무대 밖으로 잘리지 않게
                    flip: ((vector.x + 1) / 2) * size.width > size.width - 150,
                };
            })
        );
    });

    return null;
}

export interface Projected {
    x: number;
    y: number;
    visible: boolean;
    /** 스캔 시트가 이 앵커의 높이를 지나갔는지. */
    revealed: boolean;
    /** 라벨을 박스 왼쪽에 달아야 하는지. */
    flip: boolean;
}

interface PerceptionSceneProps {
    shape: ShapeId;
    count: number;
    scroll: React.RefObject<number>;
    orbit: React.RefObject<{ x: number; y: number }>;
    /** 트랙 안의 스캔 진행도(0~1). 1이면 스캔이 끝난 상태다. */
    scan: number;
    anchors: readonly [number, number, number][];
    offsetX: number;
    onProject: (projected: Projected[]) => void;
}

export function PerceptionScene({
    shape,
    count,
    scroll,
    orbit,
    scan,
    anchors,
    offsetX,
    onProject,
}: PerceptionSceneProps) {
    // 기기가 못 따라오면 점 수를 60%씩 낮춘다. count를 복제하지 않고 배율만 든다.
    const [quality, setQuality] = useState(1);
    const particleCount = Math.round(count * quality);

    // 스캔 값은 렌더마다 바뀌지만 씬은 프레임 루프에서 읽는다 — ref로 건넨다
    const scanRef = useRef(scan);
    useEffect(() => {
        scanRef.current = scan;
    }, [scan]);

    return (
        <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ fov: 38, position: [0, -0.2, 6.1] }}
            style={{ pointerEvents: "none" }}
        >
            <Particles
                shape={shape}
                count={particleCount}
                scroll={scroll}
                orbit={orbit}
                scan={scanRef}
                offsetX={offsetX}
                onQualityDrop={() => setQuality((prev) => prev * 0.6)}
            />
            <ScanSheet offsetX={offsetX} scan={scanRef} />
            <Backlight offsetX={offsetX} />
            {/* 바닥 격자 — 오브젝트가 허공이 아니라 측정대 위에 놓여 있다는 기준면 */}
            <Grid
                position={[offsetX, FLOOR_Y, 0]}
                args={[14, 14]}
                cellSize={0.35}
                cellThickness={0.6}
                cellColor="#16264a"
                sectionSize={1.4}
                sectionThickness={1}
                sectionColor="#2b4f96"
                fadeDistance={9}
                fadeStrength={2.2}
                infiniteGrid
            />
            <AnchorProjector anchors={anchors} scan={scanRef} onProject={onProject} />
        </Canvas>
    );
}
