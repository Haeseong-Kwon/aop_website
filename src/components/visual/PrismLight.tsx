import { cn } from "@/lib/utils";

/**
 * 히어로 배경의 모서리 발광 기하 그래픽.
 * 한 점(꼭짓점)에서 세 개의 면이 갈라지고, 그 경계선만 빛난다.
 * 사진 대신 벡터로 그리므로 어떤 해상도에서도 뭉개지지 않는다.
 */
// TODO: 실제 에셋 교체 — 3D 렌더 이미지 확보 시 이 레이어를 next/image로 대체

const VX = 700;
const VY = 585;

export function PrismLight({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            className={cn("h-full w-full", className)}
        >
            <defs>
                {/* 면: 경계에서 멀어질수록 검게 떨어진다 */}
                <linearGradient id="prism-top" x1="0.5" y1="1" x2="0.35" y2="0">
                    <stop offset="0%" stopColor="var(--color-violet)" stopOpacity="0.42" />
                    <stop offset="55%" stopColor="var(--color-violet-deep)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="prism-left" x1="1" y1="0" x2="0" y2="0.7">
                    <stop offset="0%" stopColor="var(--color-violet)" stopOpacity="0.5" />
                    <stop offset="45%" stopColor="var(--color-violet-deep)" stopOpacity="0.26" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.98" />
                </linearGradient>

                <linearGradient id="prism-right" x1="0" y1="0" x2="1" y2="0.85">
                    <stop offset="0%" stopColor="var(--color-violet)" stopOpacity="0.3" />
                    <stop offset="60%" stopColor="#000000" stopOpacity="0.96" />
                    <stop offset="100%" stopColor="#000000" />
                </linearGradient>

                {/* 경계선의 블룸 */}
                <filter id="prism-bloom" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="14" result="wide" />
                    <feGaussianBlur stdDeviation="4" result="tight" />
                    <feMerge>
                        <feMergeNode in="wide" />
                        <feMergeNode in="wide" />
                        <feMergeNode in="tight" />
                    </feMerge>
                </filter>

                <radialGradient id="prism-core" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="var(--color-glow)" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="var(--color-violet)" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* 세 개의 면 */}
            <path
                d={`M${VX},${VY} L120,300 L0,240 L0,0 L1440,0 L1440,100 Z`}
                fill="url(#prism-top)"
            />
            <path
                d={`M${VX},${VY} L120,300 L0,240 L0,900 L${VX},900 Z`}
                fill="url(#prism-left)"
            />
            <path
                d={`M${VX},${VY} L1440,100 L1440,900 L${VX},900 Z`}
                fill="url(#prism-right)"
            />

            {/* 빛나는 경계선 — 넓은 블룸을 먼저 깔고 위에 흰 코어를 얹는다 */}
            <g filter="url(#prism-bloom)" opacity="0.75">
                <path
                    d={`M120,300 L${VX},${VY} L1440,100 M${VX},${VY} L${VX},900`}
                    stroke="var(--color-violet)"
                    strokeWidth="6"
                    fill="none"
                />
            </g>
            <path
                d={`M120,300 L${VX},${VY} L1440,100 M${VX},${VY} L${VX},900`}
                stroke="var(--color-glow)"
                strokeWidth="1.4"
                fill="none"
                opacity="0.92"
            />

            {/* 꼭짓점의 핫스팟 */}
            <circle cx={VX} cy={VY} r="150" fill="url(#prism-core)" opacity="0.5" />
        </svg>
    );
}
