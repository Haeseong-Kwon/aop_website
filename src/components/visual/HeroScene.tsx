"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Environment,
    Lightformer,
    MeshTransmissionMaterial,
    RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

/*
 * 히어로 오브젝트 — 굴절하는 유리 정육면체.
 *
 * 점 격자 큐브는 캔버스 2D 투영이라 아무리 다듬어도 '점 더미'를 넘지 못했다.
 * 여기서는 물체를 실제 재질로 만든다: 모서리를 깎은 유리 블록이 뒤에 선 광선을
 * 굴절·분산시키고, 안에는 에이전트의 '실행 코어'에 해당하는 발광 격자가 떠 있다.
 * 형태를 그리는 건 선이 아니라 빛이 유리를 통과하며 꺾이는 모습이다.
 *
 * HDR 파일을 받지 않는다. 환경광은 Lightformer 몇 장으로 직접 굽는다 —
 * 외부 에셋 요청이 없고, 반사 하이라이트의 위치와 색을 브랜드 톤으로 통제할 수 있다.
 */

const BEAM = "#4a8cff";
const GLOW = "#bcd8ff";
const BLACK = new THREE.Color("#000000");

/** 길이 방향으로 양끝이 꺼지는 광선 텍스처. 단색 막대는 스티커처럼 보인다. */
function useBeamTexture() {
    return useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 256;
        const context = canvas.getContext("2d");
        if (context) {
            const gradient = context.createLinearGradient(0, 0, 0, 256);
            gradient.addColorStop(0, "rgba(255,255,255,0)");
            gradient.addColorStop(0.5, "rgba(255,255,255,1)");
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            context.fillStyle = gradient;
            context.fillRect(0, 0, 4, 256);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);
}

/** 유리 뒤에 세운 광선. 굴절할 대상이 있어야 유리가 유리로 보인다. */
function LightBars() {
    const beam = useBeamTexture();
    const bars = useMemo(
        () => [
            { x: -1.25, z: -2.4, h: 4.6, w: 0.022, color: GLOW, o: 0.9 },
            { x: -0.3, z: -3.2, h: 5.6, w: 0.06, color: BEAM, o: 0.8 },
            { x: 0.7, z: -2.8, h: 4.8, w: 0.014, color: GLOW, o: 0.75 },
            { x: 1.7, z: -3.6, h: 5.4, w: 0.1, color: BEAM, o: 0.4 },
        ],
        []
    );

    return (
        <group rotation={[0, 0, -0.42]}>
            {bars.map((bar, index) => (
                <mesh key={index} position={[bar.x, 0, bar.z]}>
                    <planeGeometry args={[bar.w, bar.h]} />
                    <meshBasicMaterial
                        map={beam}
                        color={bar.color}
                        transparent
                        opacity={bar.o}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

/** 유리 안의 실행 코어 — 모서리만 빛나는 작은 정육면체 두 겹. */
function Core() {
    const outer = useRef<THREE.LineSegments>(null);
    const inner = useRef<THREE.Mesh>(null);
    const glow = useGlowTexture();
    const edges = useMemo(
        () => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.6, 0.6, 0.6)),
        []
    );

    useFrame((_, delta) => {
        if (outer.current) {
            outer.current.rotation.x -= delta * 0.18;
            outer.current.rotation.y += delta * 0.26;
        }
        if (inner.current) {
            inner.current.rotation.x += delta * 0.32;
            inner.current.rotation.z += delta * 0.21;
        }
    });

    return (
        <group>
            <lineSegments ref={outer} geometry={edges}>
                <lineBasicMaterial color={GLOW} toneMapped={false} />
            </lineSegments>
            <mesh ref={inner}>
                <octahedronGeometry args={[0.2, 0]} />
                <meshBasicMaterial color={BEAM} toneMapped={false} />
            </mesh>
            {/* 코어 주변의 발광 — 블룸 패스 없이 가산 스프라이트로 번짐을 만든다 */}
            <sprite scale={[1.8, 1.8, 1]}>
                <spriteMaterial
                    map={glow}
                    color={BEAM}
                    transparent
                    opacity={0.75}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </sprite>
        </group>
    );
}

/** 방사형 그라디언트 텍스처 한 장. 블룸 후처리 의존성 대신 쓴다. */
function useGlowTexture() {
    return useMemo(() => {
        const size = 128;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (context) {
            const gradient = context.createRadialGradient(
                size / 2, size / 2, 0, size / 2, size / 2, size / 2
            );
            gradient.addColorStop(0, "rgba(255,255,255,1)");
            gradient.addColorStop(0.25, "rgba(255,255,255,0.35)");
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            context.fillStyle = gradient;
            context.fillRect(0, 0, size, size);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }, []);
}

interface MonolithProps {
    progress: MotionValue<number>;
    animate: boolean;
}

function Monolith({ progress, animate }: MonolithProps) {
    const group = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const node = group.current;
        if (!node) return;

        const value = progress.get();
        const time = animate ? state.clock.elapsedTime : 0;
        // 포인터 방향으로 아주 조금만 기운다. 크게 따라오면 물체가 가벼워 보인다.
        const pointerX = animate ? state.pointer.x : 0;
        const pointerY = animate ? state.pointer.y : 0;

        const targetY = 0.62 + time * 0.12 + value * 1.4 + pointerX * 0.25;
        const targetX = 0.48 + Math.sin(time * 0.3) * 0.06 - value * 0.5 - pointerY * 0.18;

        const ease = 1 - Math.exp(-delta * 3.2);
        node.rotation.y += (targetY - node.rotation.y) * ease;
        node.rotation.x += (targetX - node.rotation.x) * ease;
        node.position.y = Math.sin(time * 0.6) * 0.06 - value * 0.6;
        node.scale.setScalar(1 + value * 0.18);
    });

    return (
        <group ref={group}>
            <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.11} smoothness={6}>
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={0.6}
                    samples={6}
                    resolution={768}
                    thickness={1.1}
                    roughness={0.04}
                    ior={1.45}
                    chromaticAberration={0.08}
                    anisotropicBlur={0.12}
                    distortion={0.18}
                    distortionScale={0.4}
                    temporalDistortion={animate ? 0.08 : 0}
                    clearcoat={1}
                    attenuationDistance={5}
                    attenuationColor="#c4d8ff"
                    color="#f4f7ff"
                    background={BLACK}
                />
            </RoundedBox>
            <Core />
        </group>
    );
}

/** 반사 하이라이트를 결정하는 환경광. 위치가 곧 모서리에 맺히는 빛의 위치다. */
function StudioLights() {
    return (
        <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={4} color="#ffffff" position={[0, 5, -2]} scale={[10, 1.2, 1]} />
            <Lightformer form="rect" intensity={2} color="#ffffff" position={[3, -4, 3]} rotation-x={-Math.PI / 3} scale={[6, 0.6, 1]} />
            <Lightformer form="rect" intensity={3.5} color={BEAM} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 0.5, 1]} />
            <Lightformer form="rect" intensity={4} color={GLOW} position={[5, -1, -1]} rotation-y={-Math.PI / 2} scale={[8, 0.35, 1]} />
            <Lightformer form="ring" intensity={1.2} color={GLOW} position={[0, 0, 6]} scale={3} />
        </Environment>
    );
}

/** 넓은 화면에서는 오른쪽 열로 비켜 헤드라인 자리를 비운다. 광선도 함께 옮긴다. */
function Rig({ children }: { children: React.ReactNode }) {
    const { viewport } = useThree();
    const isWide = viewport.aspect > 1.2;
    // 세로 화면에서는 헤드라인 위 빈 띠로 올리고 줄인다 — 본문 뒤에서 굴절이 일렁이면 읽히지 않는다
    const x = isWide ? viewport.width * 0.23 : viewport.width * 0.18;
    const y = isWide ? 0.05 : viewport.height * 0.27;
    const scale = isWide ? 1 : 0.58;

    return (
        <group position={[x, y, 0]} scale={scale}>
            {children}
        </group>
    );
}

interface HeroSceneProps {
    progress: MotionValue<number>;
    animate: boolean;
    className?: string;
}

export default function HeroScene({ progress, animate, className }: HeroSceneProps) {
    return (
        <div className={className}>
            <Canvas
                dpr={[1, 1.75]}
                camera={{ position: [0, 0, 6.2], fov: 32 }}
                frameloop={animate ? "always" : "demand"}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
                <Rig>
                    <LightBars />
                    <Monolith progress={progress} animate={animate} />
                </Rig>
                <StudioLights />
            </Canvas>
        </div>
    );
}
