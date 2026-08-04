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
    headline: "에이전트가 일하는 방식을 *설계*합니다",
    sub: "AOP는 네 개의 AI 에이전트 제품을 직접 운영합니다. 마케팅, 수출, 교육, 건설 — 서로 다른 산업이 같은 실행 엔진 위에서 돌아갑니다.",
    subSecondary:
        "그 제품을 굴리며 나온 문제가 우리의 연구 주제가 됩니다. 아래 지표는 지금까지 만들어 온 것들입니다.",
    primaryCta: { label: "제품 보기", href: "#products" },
    secondaryCta: { label: "기술 살펴보기", href: "#technology" },
} as const;

/** 핀 고정 구간에서 가로로 전개되는 회사 명제. */
export const EQUATION = {
    terms: [{ en: "Agent" }, { en: "Product" }, { en: "Research" }],
    caption:
        "에이전트를 제품으로 만들고, 제품을 굴리며 나온 문제를 연구로 되돌립니다. 세 가지는 순서가 아니라 하나의 순환입니다.",
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
            "계획·실행·검증 루프와 서브에이전트 위임을 하나의 제어 구조로 묶습니다. 실패한 툴 호출은 보상 트랜잭션으로 되돌립니다.",
    },
    {
        id: "durable-execution",
        title: "Durable Execution",
        subtitle: "중단과 재개",
        description:
            "그래프 기반 체크포인팅으로 중단된 작업을 이어서 실행하고, 사람의 승인이 필요한 지점에서는 안전하게 멈춥니다.",
    },
    {
        id: "context-engineering",
        title: "Context Engineering",
        subtitle: "비용 설계",
        description:
            "프롬프트 캐싱과 토큰 예산 배분으로 같은 품질에 더 낮은 비용으로 도달합니다. 컨텍스트는 무한하지 않은 자원입니다.",
    },
    {
        id: "evaluation",
        title: "Evaluation & Observability",
        subtitle: "품질 측정",
        description:
            "트레이스 단위로 비용·지연·실패 유형을 추적하고, 회귀 스위트로 품질 저하를 배포 전에 잡아냅니다.",
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
        tagline: "마케팅, 자동 운항 시작",
        description:
            "제품 하나만 넣으면 시장 판단, 추적 세팅, 상세페이지 진단, 퍼포먼스 리포트가 한 흐름으로 이어집니다. 담당자가 도구 사이를 오갈 필요가 없습니다.",
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
        tagline: "시공의 모든 순간을 기록으로 지킵니다",
        description:
            "중립적인 감리자가 철거부터 마감까지 현장에 동행합니다. 인테리어 시공에서 가장 불투명한 구간을 사진과 체크리스트로 남겨, 시공 품질을 말이 아니라 기록으로 증명합니다.",
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
        tagline: "학습 데이터가 쌓이는 영어교육 플랫폼",
        description:
            "패턴 기반 교수법을 온라인 VOD 구조로 옮겼습니다. 학습 이력이 그대로 진단과 추천으로 되돌아와, 강의가 반복될수록 정확해집니다.",
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
        tagline: "수출의 첫 고객을 찾아내는 에이전트",
        description:
            "HS코드와 품목만으로 해외 시장을 진단하고, 진입 가능한 국가와 실제 바이어 후보를 리포트로 만들어냅니다. 데이터 반출이 어려운 곳을 위해 온프레미스 배포를 지원합니다.",
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
        "모델 위에서 일이 실제로 끝나게 만드는 층을 만듭니다.",
        "계획하고, 멈추고, 되돌리고, 측정하는 것 —",
        "그 층이 제품과 연구를 잇습니다.",
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
        title: "운영에서 문제를 만난다",
        description:
            "네 개의 제품이 실사용 트래픽 위에서 돌아갑니다. 무엇이 실패했는지는 추정이 아니라 트레이스로 남고, 비용과 지연이 함께 기록됩니다.",
    },
    {
        id: "solve",
        title: "원천기술로 푼다",
        description:
            "반복되는 실패 유형만 골라 제어 계층의 문제로 다시 정의합니다. 고치기 전에 회귀 스위트를 먼저 만들어, 같은 실패가 다시 나면 배포 전에 걸리게 합니다.",
    },
    {
        id: "return",
        title: "제품으로 되돌린다",
        description:
            "검증된 해법은 자사 제품에 가장 먼저 배포됩니다. 거기서 한 번 더 버티면 계열사와 파트너사의 현장으로 나갑니다.",
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
        description: "목표를 실행 가능한 단계로 쪼개고, 각 단계에 필요한 도구를 미리 고릅니다.",
    },
    {
        id: "tools",
        label: "Tool Layer",
        description: "MCP 규격으로 사내외 도구와 데이터 소스를 하나의 인터페이스에 연결합니다.",
    },
    {
        id: "executor",
        label: "Executor",
        description: "계획된 단계를 실제 툴 호출로 수행하고, 중간 상태를 빠짐없이 기록합니다.",
    },
    {
        id: "critic",
        label: "Critic",
        description: "결과를 기준에 대조해 검증하고, 실패하면 재시도할지 되돌릴지를 결정합니다.",
    },
    {
        id: "checkpoint",
        label: "Checkpoint",
        description: "실행 그래프를 저장해 재개를 보장하고, 승인이 필요한 지점에서 사람에게 넘깁니다.",
    },
    {
        id: "output",
        label: "Output",
        description: "검증된 결과물을 비용·지연·툴 호출 트레이스와 함께 돌려줍니다.",
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
            "생성 알고리즘으로 광학 메타표면 구조를 탐색합니다. 설계안과 시뮬레이션 결과를 나란히 놓고 비교할 수 있게 만듭니다.",
    },
    {
        title: "Medical GenAI Augmentor",
        category: "Medical AI",
        tech: ["PyTorch", "Diffusion", "FastAPI"],
        description:
            "부족한 의료 영상 데이터셋을 생성 모델로 늘리고, 증강된 데이터가 실제 진단 성능에 얼마나 기여하는지를 측정합니다.",
    },
    {
        title: "CMOS Sensor Dashboard",
        category: "Observability",
        tech: ["TypeScript", "D3.js", "Next.js"],
        description:
            "CMOS 이미징 센서의 상태 지표를 실시간으로 모으고, 이상이 생긴 구간을 시간축 위에서 되짚을 수 있게 합니다.",
    },
    {
        title: "PINN WaveLab",
        category: "Scientific ML",
        tech: ["JAX", "PINN", "Python"],
        description:
            "물리 정보 신경망으로 파동 방정식의 해를 근사하고, 기존 수치 해석 결과와의 오차를 정량으로 비교합니다.",
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

/** 섹션 헤더 카피. `*강조*` 구간은 세리프 이탤릭. */
export const SECTIONS = {
    capability: {
        eyebrow: "CAPABILITY",
        title: "모델 위에 필요한 *네 겹*의 기술",
        description:
            "좋은 모델을 붙이는 것만으로 에이전트는 제품이 되지 않습니다. 계획하고, 멈추고, 되돌리고, 측정하는 층이 그 위에 있어야 합니다.",
    },
    products: {
        eyebrow: "PRODUCTS",
        title: "이미 쓰이고 있는 *제품*들",
        description:
            "연구한 것은 자사 제품에서 먼저 검증합니다. 마케팅, 수출, 교육, 건설 — 네 개의 산업이 같은 실행 엔진을 서로 다른 방식으로 시험하고 있습니다.",
    },
    technology: {
        eyebrow: "TECHNOLOGY",
        title: "요청 하나가 지나는 *경로*",
        description:
            "각 단계는 따로 교체하고 따로 재시도합니다. 실행 상태는 체크포인트로 남아, 멈춘 자리에서 다시 이어집니다.",
    },
    research: {
        eyebrow: "RESEARCH & IP",
        title: "제품이 되기 *이전*의 문제들",
        description:
            "당장 제품에 들어가지 않는 주제도 다룹니다. 생성 설계, 과학 계산, 관측 가능성 — 각 트랙은 다음 기능이 되거나 특허로 남습니다.",
    },
    approach: {
        eyebrow: "APPROACH",
        title: "문제는 운영에서 오고, *해법*은 제품으로 돌아갑니다",
        description:
            "연구실에서 시작해 제품으로 내려오는 순서가 아닙니다. 반대로 갑니다. 실제로 돌아가는 제품에서 문제를 만나고, 그것만 기술로 풉니다.",
    },
    partners: {
        eyebrow: "PARTNERS",
        title: "기술이 닿는 *현장*",
        description:
            "계열사와 파트너사가 각자의 산업에서 에이전트를 실무에 붙입니다. 거기서 나온 요구가 다시 원천기술의 다음 과제가 됩니다.",
    },
    contact: {
        eyebrow: "CONTACT",
        title: "무엇을 만들고 *계신가요*",
        description:
            "제품 도입이든 공동 연구든, 지금 막혀 있는 지점을 적어주시면 담당자가 직접 회신합니다.",
    },
} as const;
