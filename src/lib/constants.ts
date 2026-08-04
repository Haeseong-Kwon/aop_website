export const SITE = {
    name: "AOP",
    legalName: "주식회사 에이오피",
    fullName: "Art of Programming",
    slogan: "기술을 예술로",
    email: "aopbusiness2025@gmail.com",
} as const;

export interface NavItem {
    label: string;
    href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
    { label: "Capability", href: "#capability" },
    { label: "Products", href: "#products" },
    { label: "Technology", href: "#technology" },
    { label: "Research", href: "#research" },
    { label: "Partners", href: "#partners" },
    { label: "Contact", href: "#contact" },
];

export const HERO = {
    eyebrow: "AI AGENT TECHNOLOGY",
    headline: "에이전트가 일하는 방식을 설계합니다",
    sub: "AOP는 AI 에이전트 제품을 직접 운영하며, 에이전트를 더 정확하고 저렴하게 만드는 원천기술을 연구합니다.",
    primaryCta: { label: "제품 보기", href: "#products" },
    secondaryCta: { label: "기술 살펴보기", href: "#technology" },
} as const;

export interface Capability {
    id: string;
    title: string;
    description: string;
}

export const CAPABILITIES: readonly Capability[] = [
    {
        id: "orchestration",
        title: "Agent Orchestration",
        description:
            "계획·실행·검증 루프와 서브에이전트 위임. 실패한 툴 호출을 보상 트랜잭션으로 되돌리는 제어 구조.",
    },
    {
        id: "durable-execution",
        title: "Durable Execution",
        description:
            "그래프 기반 체크포인팅으로 중단된 작업을 재개하고, 사람의 승인이 필요한 지점에서 안전하게 멈춥니다.",
    },
    {
        id: "context-engineering",
        title: "Context Engineering",
        description:
            "프롬프트 캐싱과 토큰 예산 배분으로, 같은 품질을 더 낮은 비용에 도달시킵니다.",
    },
    {
        id: "evaluation",
        title: "Evaluation & Observability",
        description:
            "트레이스 단위로 비용·지연·실패 유형을 추적하고, 회귀 스위트로 품질 저하를 배포 전에 잡습니다.",
    },
];

export type ProductStatus = "live" | "coming-soon";

export interface Product {
    id: string;
    name: string;
    nameKo?: string;
    tagline: string;
    description: string;
    link: string | null;
    status: ProductStatus;
    /** CSS gradient stops used for the placeholder visual. */
    // TODO: 실제 에셋 교체 — 제품 스크린샷 확보 시 next/image로 대체
    hue: [string, string];
}

export const PRODUCTS: readonly Product[] = [
    {
        id: "autopilot",
        name: "Autopilot",
        tagline: "마케팅, 자동 운항 시작",
        description:
            "제품 하나만 넣으면 시장 판단 → 추적 세팅 → 상세페이지 진단 → 퍼포먼스 리포트가 한 흐름으로 이어지는 마케팅 실행 에이전트.",
        link: "https://www.autopilot.it.kr/",
        status: "live",
        hue: ["#5B5BD6", "#2A2A7A"],
    },
    {
        id: "buyerpilot",
        name: "BuyerPilot",
        nameKo: "바이어에이전트",
        tagline: "수출의 첫 고객을 찾아내는 에이전트",
        description:
            "HS코드와 품목만으로 해외 시장을 진단하고, 진입 가능한 국가와 실제 바이어 후보를 리포트로 만들어냅니다. 온프레미스 배포 지원.",
        link: null,
        status: "coming-soon",
        hue: ["#2E6F5E", "#16303A"],
    },
    {
        id: "talkpicplus",
        name: "TalkPic Plus",
        nameKo: "톡픽플러스",
        tagline: "학습 데이터가 쌓이는 영어교육 플랫폼",
        description:
            "패턴 기반 교수법을 온라인 VOD 구조로 옮기고, 학습 이력을 진단·추천에 연결하는 교육 제품.",
        link: "https://talkpic-plus.vercel.app/",
        status: "live",
        hue: ["#7A4BC4", "#331C5C"],
    },
];

export interface PipelineNode {
    id: string;
    label: string;
    description: string;
}

export const PIPELINE: readonly PipelineNode[] = [
    {
        id: "input",
        label: "Input",
        description: "사용자 요청과 작업 컨텍스트가 구조화된 입력으로 들어옵니다.",
    },
    {
        id: "planner",
        label: "Planner",
        description: "목표를 실행 가능한 단계로 분해하고 필요한 도구를 미리 선택합니다.",
    },
    {
        id: "tools",
        label: "Tool Layer",
        description: "MCP 규격으로 사내외 도구와 데이터 소스를 동일한 인터페이스에 연결합니다.",
    },
    {
        id: "executor",
        label: "Executor",
        description: "계획된 단계를 실제 툴 호출로 수행하고 중간 상태를 기록합니다.",
    },
    {
        id: "critic",
        label: "Critic",
        description: "결과를 기준에 대조해 검증하고, 실패 시 재시도 또는 보상 경로를 정합니다.",
    },
    {
        id: "checkpoint",
        label: "Checkpoint / HITL",
        description: "실행 그래프를 저장해 재개를 보장하고, 승인이 필요한 지점에서 사람에게 넘깁니다.",
    },
    {
        id: "output",
        label: "Output",
        description: "검증된 결과물을 비용·지연·툴 호출 트레이스와 함께 반환합니다.",
    },
];

export interface ResearchTrack {
    title: string;
    category: string;
    tech: readonly string[];
    description: string;
}

export const RESEARCH: readonly ResearchTrack[] = [
    {
        title: "Metasurface Designer",
        category: "Generative Design",
        tech: ["Python", "PyTorch", "Next.js"],
        description:
            "생성 알고리즘으로 광학 메타표면 구조를 탐색하고, 설계안을 시뮬레이션 결과와 함께 비교합니다.",
    },
    {
        title: "Medical GenAI Augmentor",
        category: "Medical AI",
        tech: ["PyTorch", "Diffusion", "FastAPI"],
        description:
            "부족한 의료 영상 데이터셋을 생성 모델로 증강하고, 증강 데이터가 downstream 성능에 미치는 영향을 측정합니다.",
    },
    {
        title: "CMOS Sensor Dashboard",
        category: "Observability",
        tech: ["TypeScript", "D3.js", "Next.js"],
        description:
            "CMOS 이미징 센서의 상태 지표를 실시간으로 수집·시각화하고 이상 구간을 추적합니다.",
    },
    {
        title: "PINN WaveLab",
        category: "Scientific ML",
        tech: ["JAX", "PINN", "Python"],
        description:
            "물리 정보 신경망으로 파동 방정식 해를 근사하고, 수치 해석 결과와의 오차를 정량 비교합니다.",
    },
];

export interface Patent {
    number: string;
    title: string;
}

export const PATENTS: readonly Patent[] = [
    { number: "KR-10-2025-0098033", title: "공정 검증 및 대금 분할지급" },
    { number: "KR-10-2025-0009967", title: "개인 맞춤형 추천" },
];

export type PartnerRelation = "계열" | "파트너";

export interface Partner {
    id: string;
    name: string;
    nameEn: string;
    relation: PartnerRelation;
    description: string;
}

// TODO: 로고 SVG 교체 — 현재는 워드마크 타이포그래피로 대체
export const PARTNERS: readonly Partner[] = [
    {
        id: "inspec",
        name: "주식회사 인스펙",
        nameEn: "INSPEC",
        relation: "계열",
        description: "인테리어 감리자 파견 플랫폼",
    },
    {
        id: "onax",
        name: "주식회사 온엑스",
        nameEn: "ON-AX",
        relation: "계열",
        description: "수출 분야 글로벌 에이전트 기술",
    },
    {
        id: "growingup",
        name: "그로윙업 주식회사",
        nameEn: "GROWINGUP",
        relation: "파트너",
        description: "퍼포먼스 마케팅",
    },
    {
        id: "aenox",
        name: "애녹스",
        nameEn: "AENOX",
        relation: "파트너",
        description: "수출 컨설팅",
    },
];

export const INQUIRY_TYPES = [
    "제품 도입",
    "기술 협력",
    "투자·제휴",
    "채용",
    "기타",
] as const;
