"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import type { Product } from "@/lib/constants";
import {
    CARD_FRAGMENT,
    CARD_VERTEX,
    FLOOR_FRAGMENT,
    FLOOR_VERTEX,
} from "@/components/products/carouselShaders";

/*
 * 제품 리본 캐러셀.
 *
 * 카메라는 정면에서 평평한 카드 줄을 본다. 카드를 휘게 하는 건 화면 가로에 고정된 곡면
 * (carouselShaders.ts의 sheet)이고, 카드는 그 면을 통과한다. 스크롤은 줄의 위치만 정한다.
 * 속도는 '목표와 현재의 거리'로 읽는다 — 늦게 따라오는 만큼 리본이 깊어지고, 왼쪽이 들리고,
 * 가장자리가 비틀린다. 멈추면 거리가 0이 되어 면이 쉬는 모양으로 돌아온다.
 *
 * 렌더는 요청형이다. 스크롤·호버·인트로가 움직이는 동안만 프레임을 그리고, 다 멈추면
 * GPU를 완전히 쉬게 한다.
 */

const FOV = 53.4;
const CAM_Z = 41.18;
/** 카드 높이 = 화면 높이의 이 비율. */
const CARD_VH = 0.435;
/** 캡처 원본 비율(1280×820)과 맞춘다. */
const CARD_ASPECT = 1280 / 820;
/** 세로가 긴 화면에서 카드가 화면을 꽉 채우지 않게 하는 상한(화면 폭 대비). */
const CARD_MAX_VW = 0.62;
const GAP_PX = 14;
const CORNER_PX = 18;

/** 깊이 S의 진폭(화면 반폭 대비)과 속도에 따른 증폭. */
const DEPTH = 0.2;
const DEPTH_VEL = 1.1;
const SPAN = 1.15;
/** 문짝 경사 — 오른쪽이 물러나고 왼쪽이 다가온다. */
const DOOR = -0.12;
/** 호버 시 가운데가 물러나는 깊이(카드 높이 대비). */
const DENT = 0.1;

/** 60fps 한 프레임에 남은 거리의 몇 할을 따라가는가. */
const FOLLOW = 0.1;
/** 한 번에 끌려갈 수 있는 최대 거리(카드). 빠른 스크롤이 리본을 찢지 않게 한다. */
const LEASH = 1.2;
/** 이 거리(px)만큼 뒤처지면 속도 변형이 약 60%에 이른다. */
const VEL_NORM_PX = 550;
const HOVER_RATE = 6;

const INTRO_DUR = 1.5;
const INTRO_STAGGER = 0.05;
/** 인트로 시작 모양 — 지평선 위의 작은 알약 줄. */
const INTRO_SCALE: [number, number] = [0.13, 0.077];

const FLOOR = { drop: 0.06, run: 6, cell: 0.22, grid: 0.02, alpha: 0.9, refl: 0.5, lip: 0.2 };
/** 반사 패스 해상도(화면 대비). 흐릿할수록 바닥이 거울이 아니라 광택 면으로 읽힌다. */
const REFL_SCALE = 0.1;

/**
 * 줄에 놓는 최소 칸 수. 제품이 적으면 감아 넘기는 지점이 화면 안에 들어와
 * 카드가 한쪽에서 사라지고 반대쪽에서 튀어나온다. 사본으로 넘김 지점을 화면 밖으로 보낸다.
 */
const MIN_SLOTS = 8;
/** 카드 하나 구간에서 정면에 머무는 비율(앞뒤 각각). */
const DWELL = 0.3;
const EPSILON = 1e-4;

/** 연속 진행도를 카드 정면에서 머물다 넘어가는 계단형 곡선으로 바꾼다. */
function snapToCards(raw: number) {
    const base = Math.floor(raw);
    const t = raw - base;
    const s = Math.min(1, Math.max(0, (t - DWELL) / (1 - DWELL * 2)));
    return base + s * s * (3 - 2 * s);
}

function expoInOut(t: number) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** 화면 크기에서 유도한 월드 치수. z=0 평면에서 1px이 몇 월드 단위인지가 기준이다. */
interface Layout {
    W: number;
    H: number;
    px: number;
    cardW: number;
    cardH: number;
    pitch: number;
    corner: number;
    floorY: number;
}

function useLayout(): Layout {
    const width = useThree((state) => state.size.width);
    const height = useThree((state) => state.size.height);

    return useMemo(() => {
        const H = Math.tan(((FOV / 2) * Math.PI) / 180) * CAM_Z;
        const W = H * (width / Math.max(height, 1));
        const px = (2 * H) / Math.max(height, 1);
        const cardW = Math.min(2 * H * CARD_VH * CARD_ASPECT, 2 * W * CARD_MAX_VW);
        const cardH = cardW / CARD_ASPECT;
        return {
            W,
            H,
            px,
            cardW,
            cardH,
            pitch: cardW + GAP_PX * px,
            corner: CORNER_PX * px,
            floorY: -cardH / 2 - H * FLOOR.drop,
        };
    }, [width, height]);
}

/** 프로덕션 캡처가 없는 제품용 카드 면. 지어낸 화면 대신 출시 예정 표지를 그린다. */
function buildPendingTexture(product: Product) {
    const width = 1280;
    const height = 820;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (context) {
        const gradient = context.createRadialGradient(
            width * 0.2, 0, 0, width * 0.2, 0, width * 1.1
        );
        gradient.addColorStop(0, product.hue[0]);
        gradient.addColorStop(1, product.hue[1]);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        context.strokeStyle = "rgba(255,255,255,0.08)";
        context.lineWidth = 1;
        for (let x = 0; x <= width; x += 48) {
            context.beginPath();
            context.moveTo(x + 0.5, 0);
            context.lineTo(x + 0.5, height);
            context.stroke();
        }
        for (let y = 0; y <= height; y += 48) {
            context.beginPath();
            context.moveTo(0, y + 0.5);
            context.lineTo(width, y + 0.5);
            context.stroke();
        }

        context.fillStyle = "#ffffff";
        context.font = "600 132px 'SUIT Variable', SUIT, sans-serif";
        context.fillText(product.name, 72, height - 150);
        context.fillStyle = "rgba(255,255,255,0.72)";
        context.font = "500 30px ui-monospace, monospace";
        context.fillText("COMING SOON", 76, height - 84);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

/** 프레임 사이에 공유하는 움직임 상태. React 상태가 아니라 매 프레임 덮어쓰는 값이다. */
interface Motion {
    /** 스무딩된 현재 위치(카드 단위). */
    offset: number;
    /** 인트로 시작 시각(초). null이면 아직 무대에 오르지 않았다. */
    introAt: number | null;
    /** 이번 프레임에 아직 움직이는 것이 있으면 true — 다음 프레임을 요청한다. */
    busy: boolean;
    /** 곡면 값. 드라이버가 한 번 계산하고 카드·바닥이 각자 유니폼으로 옮겨 담는다. */
    sheet: SheetState;
}

interface SheetState {
    /** z=0에서의 화면 반폭. */
    W: number;
    /** 깊이 S의 진폭. */
    D: number;
    /** 속도 0..1. */
    V: number;
    /** 문짝 깊이. */
    A: number;
}

/** R3F는 재질마다 uniforms를 복사해 가므로 객체를 공유할 수 없다 — 값을 매 프레임 옮긴다. */
function applySheet(uniforms: Record<string, THREE.IUniform>, sheet: SheetState) {
    uniforms.uSheetW.value = sheet.W;
    uniforms.uSheetD.value = sheet.D;
    uniforms.uSheetV.value = sheet.V;
    uniforms.uLeanA.value = sheet.A;
}

function createSheetUniforms() {
    return {
        uSheetW: { value: 1 },
        uSheetD: { value: 0 },
        uSheetT: { value: SPAN },
        uSheetV: { value: 0 },
        uLeanA: { value: 0 },
    };
}

interface CardProps {
    /** 제품 번호. 호버·클릭은 사본이어도 같은 제품을 가리킨다. */
    index: number;
    slot: number;
    slots: number;
    texture: THREE.Texture;
    layout: Layout;
    motionRef: React.RefObject<Motion>;
    hoveredRef: React.RefObject<number>;
    onHover: (index: number | null) => void;
    onSelect: (index: number) => void;
}

function Card({ index, slot, slots, texture, layout, motionRef, hoveredRef, onHover, onSelect }: CardProps) {
    const mesh = useRef<THREE.Mesh>(null);
    const material = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(
        () => ({
            ...createSheetUniforms(),
            uMap: { value: texture },
            uRes: { value: new THREE.Vector2(1, 1) },
            uHover: { value: 0 },
            uDent: { value: DENT },
            uSheetP: { value: 0 },
            uCorner: { value: 0 },
            uWhite: { value: 1 },
            uWash: { value: new THREE.Color("#d9d9d9") },
            uHaze: { value: new THREE.Color("#0f0f0f") },
        }),
        [texture]
    );

    useFrame((_, rawDelta) => {
        const node = mesh.current;
        const live = material.current?.uniforms;
        if (!node || !live) return;
        const motion = motionRef.current;
        const { W, cardW, cardH, pitch, corner } = layout;

        // 원형 목록: 상대 위치를 [-칸/2, 칸/2)로 감는다
        const rel = ((((slot - motion.offset) % slots) + slots * 1.5) % slots) - slots / 2;

        /*
         * 인트로: 간격은 줄 전체가 한 시계로 펴지고, 카드 크기만 가운데부터 바깥으로 조금씩 늦는다.
         * 크기가 간격보다 늦으니 펴지는 동안 카드끼리 겹치지 않는다.
         */
        let spread = 0;
        let intro = 0;
        if (motion.introAt !== null) {
            const elapsed = performance.now() / 1000 - motion.introAt;
            const delay = Math.abs(rel) * INTRO_STAGGER;
            spread = expoInOut(elapsed / INTRO_DUR);
            intro = expoInOut((elapsed - delay) / INTRO_DUR);
            if (elapsed - delay < INTRO_DUR) motion.busy = true;
        }

        const sx = mix(INTRO_SCALE[0], 1, intro);
        const sy = mix(INTRO_SCALE[1], 1, intro);
        const x = rel * pitch * mix(INTRO_SCALE[0], 1, spread);
        node.position.set(x, 0, 0);
        node.scale.set(cardW * sx, cardH * sy, 1);
        node.visible = motion.introAt !== null && Math.abs(x) < W + cardW;

        applySheet(live, motion.sheet);
        live.uRes.value.set(cardW * sx, cardH * sy);
        live.uCorner.value = corner;
        live.uSheetP.value = intro;
        live.uWhite.value = 1 - THREE.MathUtils.smoothstep(intro, 0.2, 0.85);

        const isHovered = hoveredRef.current === index && Math.abs(rel) < 1.5;
        const target = isHovered ? 1 : 0;
        const delta = Math.min(rawDelta, 1 / 30);
        const hover = live.uHover.value;
        live.uHover.value = hover + (target - hover) * (1 - Math.exp(-delta * HOVER_RATE));
        if (Math.abs(target - live.uHover.value) > EPSILON) motion.busy = true;
        else live.uHover.value = target;
    });

    return (
        <mesh
            ref={mesh}
            frustumCulled={false}
            renderOrder={1}
            onPointerOver={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                onHover(index);
            }}
            onPointerOut={() => onHover(null)}
            onClick={(event: ThreeEvent<MouseEvent>) => {
                event.stopPropagation();
                onSelect(index);
            }}
        >
            {/* 휨은 셰이더가 하지만 실루엣은 정점이 그린다 — 비틀림이 각지지 않을 만큼 나눈다 */}
            <planeGeometry args={[1, 1, 48, 16]} />
            <shaderMaterial
                ref={material}
                vertexShader={CARD_VERTEX}
                fragmentShader={CARD_FRAGMENT}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                depthTest={false}
                // 반사 패스는 거울 카메라라 면의 감김이 뒤집힌다
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

interface FloorProps {
    layout: Layout;
    motionRef: React.RefObject<Motion>;
    reflection: THREE.Texture;
    reflVP: THREE.Matrix4;
    meshRef: React.RefObject<THREE.Mesh | null>;
}

/** 카드 아래로 뻗어 나가는 바닥. 카드 줄 바로 앞에서 시작해 먼 지평선으로 사라진다. */
function Floor({ layout, motionRef, reflection, reflVP, meshRef }: FloorProps) {
    const material = useRef<THREE.ShaderMaterial>(null);
    const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 32, 12).rotateX(-Math.PI / 2), []);
    const { H, W, floorY } = layout;
    const run = H * FLOOR.run;
    const near = Math.min(CAM_Z * (1 - Math.abs(floorY) / H) + H * FLOOR.lip, CAM_Z * 0.8);
    const width = W * 2 * 4;
    const cell = H * FLOOR.cell;

    const uniforms = useMemo(
        () => ({
            ...createSheetUniforms(),
            uRun: { value: run },
            uGrid: { value: FLOOR.grid },
            uAlpha: { value: FLOOR.alpha },
            uGridF: { value: new THREE.Vector2(width / cell, run / cell) },
            uRefl: { value: reflection },
            uReflA: { value: FLOOR.refl },
            uReflVP: { value: reflVP },
        }),
        [reflection, reflVP, run, width, cell]
    );

    useFrame(() => {
        const live = material.current?.uniforms;
        if (live) applySheet(live, motionRef.current.sheet);
    });

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            position={[0, floorY, (near - run) / 2]}
            scale={[width, 1, near + run]}
            renderOrder={0}
        >
            <shaderMaterial
                ref={material}
                vertexShader={FLOOR_VERTEX}
                fragmentShader={FLOOR_FRAGMENT}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
}

interface DriverProps {
    target: MotionValue<number>;
    motionRef: React.RefObject<Motion>;
    layout: Layout;
    count: number;
    onActive: (index: number) => void;
    animate: boolean;
}

/** 스크롤 목표를 따라가며 속도를 한 번만 계산해 곡면 유니폼에 쓴다. */
function Driver({ target, motionRef, layout, count, onActive, animate }: DriverProps) {
    const lastActive = useRef(-1);

    useFrame((_, rawDelta) => {
        // 요청형 렌더라 쉬고 난 첫 프레임의 delta가 길다 — 한 번에 튀지 않게 자른다
        const delta = Math.min(rawDelta, 1 / 30);
        const motion = motionRef.current;
        const goal = snapToCards(Math.min(1, Math.max(0, target.get())) * (count - 1));

        const leashed = Math.tanh((goal - motion.offset) / LEASH) * LEASH;
        const follow = animate ? 1 - Math.pow(1 - FOLLOW, delta * 60) : 1;
        motion.offset += leashed * follow;
        if (Math.abs(goal - motion.offset) < EPSILON) motion.offset = goal;
        else motion.busy = true;

        // 남은 거리 = 리본이 받는 속도. 부호 있는 제곱이라 작은 흔들림은 거의 무시된다
        const lagPx = ((goal - motion.offset) * layout.pitch) / layout.px;
        const t = Math.tanh(lagPx / VEL_NORM_PX);
        const speed = animate ? Math.min(1, t * t) : 0;

        motion.sheet = {
            W: layout.W,
            D: layout.W * DEPTH * (1 + DEPTH_VEL * speed),
            V: speed,
            A: layout.W * DOOR,
        };

        const active = ((Math.round(motion.offset) % count) + count) % count;
        if (active !== lastActive.current) {
            lastActive.current = active;
            onActive(active);
        }
    }, -1);

    return null;
}

interface PassesProps {
    layout: Layout;
    floorRef: React.RefObject<THREE.Mesh | null>;
    reflection: THREE.WebGLRenderTarget;
    reflVP: THREE.Matrix4;
    motionRef: React.RefObject<Motion>;
}

/**
 * 렌더를 직접 맡는다: 바닥을 기준으로 뒤집은 카메라로 카드를 저해상도 타깃에 한 번,
 * 그다음 화면에 한 번. 움직임이 남아 있을 때만 다음 프레임을 요청한다.
 */
function Passes({ layout, floorRef, reflection, reflVP, motionRef }: PassesProps) {
    const mirror = useMemo(() => {
        const camera = new THREE.PerspectiveCamera();
        camera.matrixAutoUpdate = false;
        camera.matrixWorldAutoUpdate = false;
        return camera;
    }, []);
    const flip = useMemo(() => new THREE.Matrix4(), []);

    useFrame(({ gl, scene, camera, invalidate }) => {
        const floor = floorRef.current;
        (window as unknown as { __dbg: unknown }).__dbg = { floor: !!floor, u: floor ? (floor.material as THREE.ShaderMaterial).uniforms.uSheetW.value : null };
        if (floor) {
            // y = floorY 평면에 대한 반사: y' = 2·floorY − y
            flip.makeScale(1, -1, 1).setPosition(0, 2 * layout.floorY, 0);
            mirror.projectionMatrix.copy(camera.projectionMatrix);
            mirror.matrixWorld.multiplyMatrices(flip, camera.matrixWorld);
            mirror.matrixWorldInverse.copy(mirror.matrixWorld).invert();
            reflVP.multiplyMatrices(mirror.projectionMatrix, mirror.matrixWorldInverse);

            floor.visible = false;
            gl.setRenderTarget(reflection);
            gl.clear();
            gl.render(scene, mirror);
            gl.setRenderTarget(null);
            floor.visible = true;
        }
        gl.render(scene, camera);

        const motion = motionRef.current;
        if (motion.busy) invalidate();
        motion.busy = false;
    }, 1);

    return null;
}

interface SceneProps {
    products: readonly Product[];
    /** 텍스처가 올라가 첫 프레임을 그릴 준비가 됐을 때 한 번 부른다. */
    onReady?: () => void;
    progress: MotionValue<number>;
    onActive: (index: number) => void;
    onHover: (index: number | null) => void;
    onSelect: (index: number) => void;
    animate: boolean;
}

interface StageProps extends SceneProps {
    hoveredIndex: number | null;
    /** true가 되는 순간 인트로가 시작된다. */
    revealed: boolean;
    running: boolean;
}

function Scene({
    products,
    progress,
    hoveredIndex,
    revealed,
    running,
    onActive,
    onHover,
    onSelect,
    onReady,
    animate,
}: StageProps) {
    const motionRef = useRef<Motion>({
        offset: 0,
        introAt: null,
        busy: true,
        sheet: { W: 1, D: 0, V: 0, A: 0 },
    });
    const hoveredRef = useRef(-1);
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);
    const size = useThree((state) => state.size);
    const layout = useLayout();
    const reflection = useFBO(
        Math.max(1, Math.round(size.width * REFL_SCALE)),
        Math.max(1, Math.round(size.height * REFL_SCALE))
    );
    const reflVP = useMemo(() => new THREE.Matrix4(), []);
    const floorRef = useRef<THREE.Mesh>(null);

    const urls = useMemo(
        () => products.map((product) => product.image).filter((url): url is string => url !== null),
        [products]
    );
    const loaded = useLoader(THREE.TextureLoader, urls);

    const textures = useMemo(() => {
        let cursor = 0;
        return products.map((product) => {
            if (!product.image) return buildPendingTexture(product);
            const texture = loaded[cursor++];
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 8;
            return texture;
        });
    }, [products, loaded]);

    // 첫 프레임 전에 텍스처를 GPU로 올린다. 안 그러면 처음 보이는 순간 업로드로 프레임이 끊긴다.
    useEffect(() => {
        textures.forEach((texture) => gl.initTexture(texture));
        onReady?.();
    }, [textures, gl, onReady]);

    // 요청형 렌더의 깨우는 신호들: 스크롤, 호버, 무대 등장, 루프 재개
    useEffect(() => progress.on("change", () => invalidate()), [progress, invalidate]);

    useEffect(() => {
        hoveredRef.current = hoveredIndex ?? -1;
        invalidate();
    }, [hoveredIndex, invalidate]);

    useEffect(() => {
        if (!revealed || motionRef.current.introAt !== null) return;
        // 모션 축소에서는 인트로 끝 상태로 바로 선다
        motionRef.current.introAt = performance.now() / 1000 - (animate ? 0 : INTRO_DUR * 4);
        invalidate();
    }, [revealed, animate, invalidate]);

    useEffect(() => {
        if (running) invalidate();
    }, [running, invalidate, size]);

    const copies = Math.ceil(MIN_SLOTS / products.length);
    const slots = products.length * copies;

    return (
        <>
            <Driver
                target={progress}
                motionRef={motionRef}
                layout={layout}
                count={products.length}
                onActive={onActive}
                animate={animate}
            />
            <Floor
                layout={layout}
                motionRef={motionRef}
                reflection={reflection.texture}
                reflVP={reflVP}
                meshRef={floorRef}
            />
            {Array.from({ length: slots }, (_, slot) => (
                <Card
                    key={slot}
                    index={slot % products.length}
                    slot={slot}
                    slots={slots}
                    texture={textures[slot % products.length]}
                    layout={layout}
                    motionRef={motionRef}
                    hoveredRef={hoveredRef}
                    onHover={onHover}
                    onSelect={onSelect}
                />
            ))}
            <Passes
                layout={layout}
                floorRef={floorRef}
                reflection={reflection}
                reflVP={reflVP}
                motionRef={motionRef}
            />
        </>
    );
}

interface ProductCarouselProps extends StageProps {
    className?: string;
}

/** 섹션에 닿기 전에 텍스처를 캐시에 받아 둔다. 같은 URL이라 마운트 때 다시 받지 않는다. */
export function preloadProductTextures(products: readonly Product[]) {
    const urls = products.map((product) => product.image).filter((url): url is string => url !== null);
    useLoader.preload(THREE.TextureLoader, urls);
}

export default function ProductCarousel({ className, ...stage }: ProductCarouselProps) {
    return (
        <div className={className}>
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 1, far: 400 }}
                frameloop={stage.running ? "demand" : "never"}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
                {/* 텍스처가 다 올 때까지 무대를 비워 둔다 — 반쯤 빈 줄을 보여주지 않는다 */}
                <Suspense fallback={null}>
                    <Scene {...stage} />
                </Suspense>
            </Canvas>
        </div>
    );
}
