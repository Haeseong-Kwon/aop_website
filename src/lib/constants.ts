/**
 * 운영 도메인. Vercel/로컬 모두 NEXT_PUBLIC_SITE_URL로 덮어쓸 수 있고,
 * 미설정 시에도 절대 localhost가 메타데이터로 나가지 않도록 운영 도메인을 폴백으로 둔다.
 */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aop-website-five.vercel.app";

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
    { label: "Approach", href: "#approach" },
    { label: "Research", href: "#research" },
    { label: "Partners", href: "#partners" },
    { label: "Contact", href: "#contact" },
];

/** `*강조*` 로 감싼 구간은 세리프 이탤릭으로 렌더된다. */
export const HERO = {
    eyebrow: "AI AGENT TECHNOLOGY",
    headline: "에이전트가 끝까지 일하는 구조를 설계합니다",
    sub: "AOP는 마케팅, 수출, 교육, 건설 분야의 AI 에이전트 제품을 직접 만들고 운영합니다. 서로 다른 현장의 일을 하나의 실행 구조로 풀어냅니다.",
    subSecondary:
        "제품을 운영하며 마주친 문제가 곧 연구 주제가 됩니다. 아래 지표는 지금까지 만든 실행 기반입니다.",
    primaryCta: { label: "제품 보기", href: "#products" },
    secondaryCta: { label: "기술 살펴보기", href: "#technology" },
} as const;

/** 핀 고정 구간에서 가로로 전개되는 회사 명제. */
export const EQUATION = {
    terms: [{ en: "Agent" }, { en: "Product" }, { en: "Research" }],
    caption:
        "에이전트를 제품으로 만들고, 제품에서 발견한 문제를 다시 연구합니다. 세 가지는 따로 움직이지 않고 하나의 순환을 이룹니다.",
} as const;

export interface Capability {
    id: string;
    title: string;
    subtitle: string;
    description: string;
}

export const CAPABILITIES: readonly Capability[] = [
    {
        id: "orchestration",
        title: "Agent Orchestration",
        subtitle: "실행 제어",
        description:
            "계획, 실행, 검증과 서브에이전트 위임을 하나의 흐름으로 제어합니다. 실패한 툴 호출은 보상 트랜잭션으로 정리합니다.",
    },
    {
        id: "durable-execution",
        title: "Durable Execution",
        subtitle: "중단과 재개",
        description:
            "그래프 기반 체크포인트로 중단된 작업을 이어갑니다. 사람의 승인이 필요한 지점에서는 실행을 멈추고 상태를 보존합니다.",
    },
    {
        id: "context-engineering",
        title: "Context Engineering",
        subtitle: "비용 설계",
        description:
            "프롬프트 캐싱과 토큰 예산 배분으로 필요한 품질에 더 낮은 비용으로 도달합니다. 컨텍스트를 비용 자원으로 다룹니다.",
    },
    {
        id: "evaluation",
        title: "Evaluation & Observability",
        subtitle: "품질 측정",
        description:
            "트레이스 단위로 비용, 지연, 실패 유형을 추적합니다. 회귀 스위트로 품질 저하를 배포 전에 확인합니다.",
    },
];

export type ProductStatus = "live" | "coming-soon";

export interface Product {
    id: string;
    name: string;
    nameKo?: string;
    domain: string;
    tagline: string;
    description: string;
    /** 제품이 해결하는 단계 — 카드 하단 칩. */
    highlights: readonly string[];
    link: string | null;
    status: ProductStatus;
    /** 프로덕션 실화면 캡처. 없으면 그라디언트 목업으로 대체된다. */
    image: string | null;
    /** image가 없을 때 쓰는 플레이스홀더 그라디언트 스톱. */
    hue: [string, string];
}

export const PRODUCTS: readonly Product[] = [
    {
        id: "autopilot",
        name: "Autopilot",
        domain: "autopilot.it.kr",
        tagline: "마케팅 업무를 자동 실행 흐름으로 연결합니다",
        description:
            "제품 정보만 입력하면 시장 판단, 추적 세팅, 상세페이지 진단, 퍼포먼스 리포트까지 한 번에 이어집니다. 담당자는 여러 도구를 오가지 않고 결과를 확인합니다.",
        highlights: ["시장 판단", "추적 세팅", "상세페이지 진단", "퍼포먼스 리포트"],
        link: "https://www.autopilot.it.kr/",
        status: "live",
        image: "/products/autopilot.jpg",
        hue: ["#4a8cff", "#0a2a66"],
    },
    {
        id: "inspec",
        name: "INSPEC",
        nameKo: "인스펙",
        domain: "inspec.it.kr",
        tagline: "시공 과정을 사진과 체크리스트로 남깁니다",
        description:
            "중립 감리자가 철거부터 마감까지 현장을 확인합니다. 말로만 지나가기 쉬운 시공 과정을 사진, 체크리스트, 위치 정보로 남겨 품질 분쟁을 줄입니다.",
        highlights: ["중립 감리", "단계별 분리 결제", "GPS·촬영시간 증거", "결과 공유"],
        link: "https://inspec.it.kr/",
        status: "live",
        image: "/products/inspec.jpg",
        hue: ["#4a8cff", "#0a2a66"],
    },
    {
        id: "talkpicplus",
        name: "TalkPic Plus",
        nameKo: "톡픽플러스",
        domain: "talkpic-plus.vercel.app",
        tagline: "학습 이력으로 수업을 조정하는 영어교육 플랫폼",
        description:
            "패턴 기반 교수법을 온라인 VOD 구조로 옮겼습니다. 학습 이력은 진단과 추천에 반영되고, 수업이 반복될수록 개인별 흐름이 더 선명해집니다.",
        highlights: ["패턴 교수법", "VOD 구조", "학습 이력 진단", "추천"],
        link: "https://talkpic-plus.vercel.app/",
        status: "live",
        image: "/products/talkpicplus.jpg",
        hue: ["#4a8cff", "#0a2a66"],
    },
    {
        id: "buyerpilot",
        name: "BuyerPilot",
        nameKo: "바이어에이전트",
        domain: "출시 예정",
        tagline: "첫 해외 고객을 찾는 수출 에이전트",
        description:
            "HS코드와 품목을 바탕으로 해외 시장을 진단하고, 진입 가능한 국가와 바이어 후보를 리포트로 정리합니다. 데이터 반출이 어려운 기관을 위해 온프레미스 배포도 지원합니다.",
        highlights: ["HS코드 분석", "국가별 진입성", "바이어 후보", "온프레미스"],
        link: null,
        status: "coming-soon",
        // TODO: 실제 에셋 교체 — 출시 후 프로덕션 화면 캡처로 대체
        image: null,
        hue: ["#4a8cff", "#0a2a66"],
    },
];

/** 스크롤에 따라 어절 단위로 점등되는 선언문. */
export const MANIFESTO = {
    eyebrow: "What we build",
    lines: [
        "우리는 모델을 만들지 않습니다.",
        "모델이 실제 업무를 끝내도록 실행 계층을 만듭니다.",
        "계획하고, 멈추고, 되돌리고, 측정하는 구조.",
        "그 구조가 제품과 연구를 연결합니다.",
    ],
} as const;

export interface ApproachStep {
    id: string;
    title: string;
    description: string;
}

export const APPROACH: readonly ApproachStep[] = [
    {
        id: "observe",
        title: "운영에서 문제를 찾습니다",
        description:
            "네 개의 제품이 실제 사용자 흐름 안에서 돌아갑니다. 실패 지점은 추정하지 않습니다. 트레이스, 비용, 지연 시간을 함께 기록합니다.",
    },
    {
        id: "solve",
        title: "원천기술로 해결합니다",
        description:
            "반복되는 실패를 제어 계층의 문제로 다시 정의합니다. 먼저 회귀 스위트를 만들고, 같은 실패가 다시 나오면 배포 전에 잡아냅니다.",
    },
    {
        id: "return",
        title: "제품으로 다시 검증합니다",
        description:
            "검증한 해법은 자사 제품에 먼저 배포합니다. 실제 운영에서 버틴 뒤 계열사와 파트너사의 현장으로 확장합니다.",
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
        description: "사용자 요청과 작업 맥락을 구조화된 입력으로 받습니다.",
    },
    {
        id: "planner",
        label: "Planner",
        description: "목표를 실행 가능한 단계로 나누고, 단계별 도구를 선택합니다.",
    },
    {
        id: "tools",
        label: "Tool Layer",
        description: "MCP 규격으로 사내외 도구와 데이터 소스를 연결합니다.",
    },
    {
        id: "executor",
        label: "Executor",
        description: "계획된 단계를 툴 호출로 실행하고 중간 상태를 기록합니다.",
    },
    {
        id: "critic",
        label: "Critic",
        description: "결과를 기준과 대조하고, 실패 시 재시도 또는 롤백을 결정합니다.",
    },
    {
        id: "checkpoint",
        label: "Checkpoint",
        description: "실행 그래프를 저장해 작업을 재개하고, 승인 지점에서는 사람에게 넘깁니다.",
    },
    {
        id: "output",
        label: "Output",
        description: "검증된 결과물과 비용, 지연, 툴 호출 트레이스를 함께 제공합니다.",
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
            "생성 알고리즘으로 광학 메타표면 구조를 탐색합니다. 설계안과 시뮬레이션 결과를 한 화면에서 비교합니다.",
    },
    {
        title: "Medical GenAI Augmentor",
        category: "Medical AI",
        tech: ["PyTorch", "Diffusion", "FastAPI"],
        description:
            "생성 모델로 의료 영상 데이터셋을 보강하고, 증강 데이터가 진단 성능에 미치는 영향을 측정합니다.",
    },
    {
        title: "CMOS Sensor Dashboard",
        category: "Observability",
        tech: ["TypeScript", "D3.js", "Next.js"],
        description:
            "CMOS 이미징 센서의 상태 지표를 실시간으로 모으고, 이상 구간을 시간축에서 추적합니다.",
    },
    {
        title: "PINN WaveLab",
        category: "Scientific ML",
        tech: ["JAX", "PINN", "Python"],
        description:
            "물리 정보 신경망으로 파동 방정식의 해를 근사하고, 기존 수치 해석 결과와 오차를 비교합니다.",
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
        description: "수출 에이전트 기술",
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

/** 섹션 헤더 카피. `*강조*` 구간은 세리프 이탤릭. */
export const SECTIONS = {
    capability: {
        eyebrow: "CAPABILITY",
        title: "모델 위에 필요한 네 겹의 기술",
        description:
            "좋은 모델만으로는 에이전트 제품을 만들 수 없습니다. 계획, 실행 중단, 복구, 품질 측정까지 담당하는 계층이 필요합니다.",
    },
    products: {
        eyebrow: "PRODUCTS",
        title: "현장에서 쓰이고 있는 제품들",
        description:
            "연구한 기술은 자사 제품에서 먼저 검증합니다. 마케팅, 수출, 교육, 건설 분야의 제품이 같은 실행 엔진을 각자의 방식으로 사용하거나 준비 중입니다.",
    },
    technology: {
        eyebrow: "TECHNOLOGY",
        title: "요청 하나가 결과가 되는 경로",
        description:
            "각 단계는 독립적으로 교체하고 재시도할 수 있습니다. 실행 상태는 체크포인트로 남기 때문에 멈춘 자리에서 이어갈 수 있습니다.",
    },
    research: {
        eyebrow: "RESEARCH & IP",
        title: "제품이 되기 전의 문제들",
        description:
            "당장 제품에 들어가지 않는 주제도 연구합니다. 생성 설계, 과학 계산, 관측 가능성 트랙은 다음 기능이나 특허로 이어집니다.",
    },
    approach: {
        eyebrow: "APPROACH",
        title: "문제는 운영에서 찾고, 해법은 제품에서 검증합니다",
        description:
            "연구실에서 출발해 제품으로 내려오는 방식이 아닙니다. 실제로 운영되는 제품에서 문제를 찾고, 반복되는 것만 기술로 풉니다.",
    },
    partners: {
        eyebrow: "PARTNERS",
        title: "기술이 적용되는 현장",
        description:
            "계열사와 파트너사는 각자의 산업에서 에이전트를 실무에 적용합니다. 현장에서 나온 요구는 다음 기술 과제로 돌아옵니다.",
    },
    contact: {
        eyebrow: "CONTACT",
        title: "어떤 문제를 풀고 계신가요",
        description:
            "제품 도입, 공동 연구, 제휴 논의가 필요하다면 현재 막혀 있는 지점을 남겨 주세요. 담당자가 직접 회신합니다.",
    },
} as const;
