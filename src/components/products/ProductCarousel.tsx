"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import type { Product } from "@/lib/constants";

/*
 * 제품 곡면 캐러셀.
 *
 * 카메라는 원통 한가운데에 서 있고, 카드는 원통 안쪽 벽에 붙어 있다. 그래서 가장자리
 * 카드일수록 관객 쪽으로 감겨 들어오고, 바닥 격자도 같은 축으로 함께 돈다.
 * 스크롤은 회전각만 정한다 — 카드가 휘고 기우는 건 회전 '속도'다. 멈추면 판이 펴지고,
 * 빠르게 넘기면 천처럼 휘었다가 관성으로 돌아온다. 정지 화면이 아니라 물성으로 읽히는 이유다.
 */

/** 원통 반지름(월드 단위). 줄이면 곡률이 세져 가장자리 카드가 깔때기처럼 말린다. */
const RADIUS = 9;
const CARD_W = 4.6;
/** 캡처 원본 비율(1280×820)과 맞춘다. 다르면 커버 크롭이 화면 위아래를 잘라낸다. */
const CARD_H = CARD_W / (1280 / 820);
const GAP = 0.32;
/** 카드 하나가 차지하는 각도. */
const STEP = (CARD_W + GAP) / RADIUS;
const FLOOR_Y = -CARD_H / 2 - 1.1;
/**
 * 원통에 놓는 최소 칸 수. 제품이 4개뿐이면 감아 넘기는 지점(±2칸)이 화면 가장자리라
 * 카드가 한쪽에서 사라지고 반대쪽에서 툭 튀어나온다. 사본을 채워 넘김 지점을 등 뒤로 보낸다.
 */
const MIN_SLOTS = 8;
/**
 * 카드 하나 구간에서 정면에 머무는 비율(앞뒤 각각). 이 구간에서는 스크롤해도 카드가
 * 정면에 고정되고, 가운데 구간에서만 다음 카드로 넘어간다 — 어중간한 각도에 멈추지 않는다.
 */
const DWELL = 0.3;

/** 연속 진행도를 카드 정면에서 머물다 넘어가는 계단형 곡선으로 바꾼다. */
function snapToCards(raw: number) {
    const base = Math.floor(raw);
    const t = raw - base;
    const s = Math.min(1, Math.max(0, (t - DWELL) / (1 - DWELL * 2)));
    return base + s * s * (3 - 2 * s);
}

const CARD_VERTEX = /* glsl */ `
uniform float uAngle;
uniform float uRadius;
uniform float uVelocity;

varying vec2 vUv;
varying float vAngle;

void main() {
  vUv = uv;

  // 평면의 x를 원통 둘레 위의 호 길이로 읽는다
  float a = uAngle + position.x / uRadius;
  vAngle = a;

  vec3 world = vec3(sin(a) * uRadius, position.y, -cos(a) * uRadius);

  /*
   * 속도 변형 두 가지.
   * 1) 기울기: 회전 방향 쪽 카드가 내려가고 반대쪽이 올라간다 — 원통이 관성으로 비틀린다.
   *    각도를 그대로 곱하면 링 반대편 카드가 크게 튀어 '어긋나' 보인다. sin으로 묶어 상한을 둔다.
   * 2) 배부름: 카드 가운데가 바깥으로 밀려 천처럼 부푼다. 가장자리는 고정이라 휨이 생긴다.
   */
  world.y += uVelocity * sin(a) * 0.9;
  float belly = sin(uv.x * 3.14159265);
  float push = abs(uVelocity) * belly * 0.9;
  world.x += sin(a) * push;
  world.z -= cos(a) * push;

  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

const CARD_FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uSize;
uniform float uVelocity;
uniform float uFocus;
uniform float uHover;

varying vec2 vUv;
varying float vAngle;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  // 모서리 라운드. 셰이더에서 잘라야 원통에 감겨도 곡선이 일그러지지 않는다.
  vec2 p = (vUv - 0.5) * uSize;
  float d = roundedBox(p, uSize * 0.5, 0.16);
  float edge = 1.0 - smoothstep(-0.01, 0.01, d);
  if (edge <= 0.0) discard;

  // 호버하면 화면이 프레임 안에서 살짝 다가온다 — 프레임은 그대로, 내용만
  vec2 uv = (vUv - 0.5) * (1.0 - uHover * 0.06) + 0.5;

  // 속도에 비례한 색수차. 정지 상태에서는 0이라 캡처가 깨끗하게 보인다.
  float shift = uVelocity * 0.012;
  vec3 color = vec3(
    texture2D(uMap, uv + vec2(shift, 0.0)).r,
    texture2D(uMap, uv).g,
    texture2D(uMap, uv - vec2(shift, 0.0)).b
  );

  // 초점 밖 카드는 채도와 밝기를 덜어낸다 — 지금 읽을 카드가 하나여야 한다
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, 0.35 + uFocus * 0.65);
  color *= 0.18 + uFocus * 0.82;

  // 곡면을 따라 흐르는 광택 띠. 원통 각도에 묶여 있어 회전할 때 판 위를 미끄러진다.
  float sheen = smoothstep(0.32, 0.0, abs(vUv.x - 0.5 + vAngle * 1.4));
  color += sheen * 0.07;

  // 아래쪽을 살짝 눌러 바닥 격자와 이어지게 한다
  color *= mix(0.78, 1.0, smoothstep(0.0, 0.35, vUv.y));

  gl_FragColor = vec4(color, edge);
  #include <colorspace_fragment>
}
`;

const FLOOR_VERTEX = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

/*
 * 바닥 격자. 선 두께를 fwidth로 화면 픽셀에 맞춰서, 멀어져도 선이 뭉개지거나
 * 지글거리지 않는다. 격자는 원점 기준 로컬 좌표라 메시를 돌리면 카드와 함께 돈다.
 */
const FLOOR_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec3 vWorld;

void main() {
  vec2 coord = vWorld.xz / 1.1;
  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = 1.0 - min(min(grid.x, grid.y), 1.0);

  float dist = length(vWorld.xz);
  float fade = smoothstep(26.0, 6.0, dist) * smoothstep(0.0, 3.0, dist);

  gl_FragColor = vec4(uColor, line * fade * uOpacity);
}
`;

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

interface Motion {
    /** 스무딩된 현재 위치(카드 단위). */
    offset: number;
    /** 카드/초. 셰이더가 쓰는 건 이 값을 다시 눌러 담은 것이다. */
    velocity: number;
}

interface CardProps {
    /** 제품 번호. 호버·클릭은 사본이어도 같은 제품을 가리킨다. */
    index: number;
    /** 원통 위 칸 번호와 전체 칸 수. */
    slot: number;
    slots: number;
    texture: THREE.Texture;
    motionRef: React.RefObject<Motion>;
    hoveredRef: React.RefObject<number>;
    onHover: (index: number | null) => void;
    onSelect: (index: number) => void;
}

function Card({ index, slot, slots, texture, motionRef, hoveredRef, onHover, onSelect }: CardProps) {
    const hit = useRef<THREE.Mesh>(null);
    const card = useRef<THREE.Mesh>(null);
    const material = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(
        () => ({
            uMap: { value: texture },
            uAngle: { value: 0 },
            uRadius: { value: RADIUS },
            uVelocity: { value: 0 },
            uSize: { value: new THREE.Vector2(CARD_W, CARD_H) },
            uFocus: { value: 0 },
            uHover: { value: 0 },
        }),
        [texture]
    );

    useFrame((_, delta) => {
        const { offset, velocity } = motionRef.current;
        // 원형 목록: 상대 위치를 [-칸/2, 칸/2)로 감아 끝없이 이어지게 한다
        const rel = ((((slot - offset) % slots) + slots * 1.5) % slots) - slots / 2;
        const ease = 1 - Math.exp(-delta * 8);

        const live = material.current?.uniforms;
        if (live) {
            live.uAngle.value = rel * STEP;
            live.uVelocity.value = velocity;
            live.uFocus.value = Math.max(0, 1 - Math.abs(rel) * 1.15);
            const isHovered = hoveredRef.current === index && Math.abs(rel) < 1.5;
            live.uHover.value += ((isHovered ? 1 : 0) - live.uHover.value) * ease;
        }

        /*
         * 카드는 셰이더 안에서만 휘므로 레이캐스트는 그 모양을 모른다.
         * 보이지 않는 평면 하나를 원통 위 같은 자리에 세워 히트 판정을 대신 받는다.
         */
        const plane = hit.current;
        if (plane) {
            const angle = rel * STEP;
            plane.position.set(Math.sin(angle) * RADIUS, 0, -Math.cos(angle) * RADIUS);
            plane.rotation.y = -angle;
            // 뒤로 감겨 넘어간 카드는 클릭을 받지 않는다
            plane.visible = Math.abs(rel) < 1.5;
            const mesh = card.current;
            if (mesh) mesh.visible = Math.abs(rel) < 2.6;
        }
    });

    return (
        <group>
            <mesh ref={card} frustumCulled={false} renderOrder={1}>
                <planeGeometry args={[CARD_W, CARD_H, 48, 12]} />
                <shaderMaterial
                    ref={material}
                    vertexShader={CARD_VERTEX}
                    fragmentShader={CARD_FRAGMENT}
                    uniforms={uniforms}
                    transparent
                    depthWrite={false}
                />
            </mesh>
            <mesh
                ref={hit}
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
                <planeGeometry args={[CARD_W, CARD_H]} />
                <meshBasicMaterial colorWrite={false} depthWrite={false} />
            </mesh>
        </group>
    );
}

function Floor({ motionRef }: { motionRef: React.RefObject<Motion> }) {
    const mesh = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(
        () => ({
            uColor: { value: new THREE.Color("#ffffff") },
            uOpacity: { value: 0.16 },
        }),
        []
    );

    useFrame(() => {
        // 카드와 같은 각속도로 돈다. 바닥이 따로 놀면 카드가 미끄러지는 것처럼 보인다.
        if (mesh.current) mesh.current.rotation.z = motionRef.current.offset * STEP;
    });

    return (
        <mesh ref={mesh} position={[0, FLOOR_Y, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[28, 96]} />
            <shaderMaterial
                vertexShader={FLOOR_VERTEX}
                fragmentShader={FLOOR_FRAGMENT}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                extensions={{ derivatives: true } as never}
            />
        </mesh>
    );
}

interface DriverProps {
    target: MotionValue<number>;
    motionRef: React.RefObject<Motion>;
    count: number;
    onActive: (index: number) => void;
    animate: boolean;
}

/** 스크롤 목표를 따라가는 스프링. 속도는 여기서 한 번만 계산해 카드와 바닥이 공유한다. */
function Driver({ target, motionRef, count, onActive, animate }: DriverProps) {
    const lastActive = useRef(-1);

    useFrame((_, rawDelta) => {
        const delta = Math.min(rawDelta, 1 / 20);
        const goal = snapToCards(Math.min(1, Math.max(0, target.get())) * (count - 1));
        const previous = motionRef.current.offset;
        // Lenis가 이미 스크롤을 한 번 부드럽게 한다 — 여기 감쇠까지 느리면 카드가 스크롤에 끌려오듯 늦는다
        const offset = animate
            ? previous + (goal - previous) * (1 - Math.exp(-delta * 8))
            : goal;

        const instant = delta > 0 ? (offset - previous) / delta : 0;
        // 속도도 한 번 더 감쇠시킨다 — 원값을 바로 쓰면 휨이 프레임마다 떨린다
        const clamped = Math.max(-1, Math.min(1, instant * 0.22));
        const velocity = animate
            ? motionRef.current.velocity +
              (clamped - motionRef.current.velocity) * (1 - Math.exp(-delta * 7))
            : 0;
        motionRef.current = { offset, velocity };

        const active = ((Math.round(offset) % count) + count) % count;
        if (active !== lastActive.current) {
            lastActive.current = active;
            onActive(active);
        }
    });

    return null;
}

interface SceneProps {
    products: readonly Product[];
    /** 텍스처가 올라가 첫 프레임을 그릴 준비가 됐을 때 한 번 부른다. */
    onReady?: () => void;
    progress: MotionValue<number>;
    hoveredRef: React.RefObject<number>;
    onActive: (index: number) => void;
    onHover: (index: number | null) => void;
    onSelect: (index: number) => void;
    animate: boolean;
}

function Scene({ products, progress, hoveredRef, onActive, onHover, onSelect, onReady, animate }: SceneProps) {
    const motionRef = useRef<Motion>({ offset: 0, velocity: 0 });
    const gl = useThree((state) => state.gl);
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

    const copies = Math.ceil(MIN_SLOTS / products.length);
    const slots = products.length * copies;

    return (
        <>
            <Driver
                target={progress}
                motionRef={motionRef}
                count={products.length}
                onActive={onActive}
                animate={animate}
            />
            <Floor motionRef={motionRef} />
            {Array.from({ length: slots }, (_, slot) => (
                <Card
                    key={slot}
                    index={slot % products.length}
                    slot={slot}
                    slots={slots}
                    texture={textures[slot % products.length]}
                    motionRef={motionRef}
                    hoveredRef={hoveredRef}
                    onHover={onHover}
                    onSelect={onSelect}
                />
            ))}
        </>
    );
}

interface ProductCarouselProps extends Omit<SceneProps, "hoveredRef"> {
    /** false면 렌더 루프를 멈춘다(화면 밖, 인덱스 보기). */
    running: boolean;
    hoveredIndex: number | null;
    className?: string;
}

/** 섹션에 닿기 전에 텍스처를 캐시에 받아 둔다. 같은 URL이라 마운트 때 다시 받지 않는다. */
export function preloadProductTextures(products: readonly Product[]) {
    const urls = products.map((product) => product.image).filter((url): url is string => url !== null);
    useLoader.preload(THREE.TextureLoader, urls);
}

export default function ProductCarousel({
    running,
    hoveredIndex,
    className,
    ...scene
}: ProductCarouselProps) {
    const hoveredRef = useRef(-1);

    useEffect(() => {
        hoveredRef.current = hoveredIndex ?? -1;
    }, [hoveredIndex]);

    return (
        <div className={className}>
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0.35, 0], rotation: [-0.05, 0, 0], fov: 42, near: 0.1, far: 60 }}
                frameloop={running ? "always" : "never"}
                gl={{ antialias: true, alpha: true }}
            >
                {/* 텍스처가 다 올 때까지 무대를 비워 둔다 — 반쯤 빈 원통을 보여주지 않는다 */}
                <Suspense fallback={null}>
                    <Scene hoveredRef={hoveredRef} {...scene} />
                </Suspense>
            </Canvas>
        </div>
    );
}
