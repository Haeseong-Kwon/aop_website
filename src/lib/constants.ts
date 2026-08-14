/**
 * 운영 도메인. Vercel/로컬 모두 NEXT_PUBLIC_SITE_URL로 덮어쓸 수 있고,
 * 미설정 시에도 절대 localhost가 메타데이터로 나가지 않도록 운영 도메인을 폴백으로 둔다.
 */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aop.it.kr";

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
    { label: "Frontier", href: "#frontier" },
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

/**
 * 제품 화면에서 에이전트가 읽어야 하는 영역. 퍼센트 좌표.
 *
 * Frontier의 Visual Grounding 트랙이 실제로 하는 일을 자사 제품 화면 위에
 * 그대로 표시한 것이다 — 연구 섹션의 주장과 제품 섹션의 그림이 같은 내용이어야
 * 두 섹션이 따로 노는 인상을 주지 않는다.
 */
export interface ProductRegion {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    confidence: number;
}

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
    regions: readonly ProductRegion[];
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
        /*
         * 좌표는 실제 캡처를 보고 잡았다. 화면은 16:9로 잘리고 위를 기준으로 정렬되므로
         * 원본 세로의 위쪽 약 88%만 보인다 — 그 보이는 영역을 100%로 놓은 값이다.
         */
        regions: [
            { x: 2.5, y: 1, w: 95, h: 5.5, label: "nav", confidence: 0.98 },
            { x: 33, y: 36, w: 33, h: 19, label: "headline", confidence: 0.96 },
            { x: 21, y: 66.5, w: 57.5, h: 8, label: "body", confidence: 0.93 },
            { x: 38, y: 79, w: 23.5, h: 6.5, label: "cta", confidence: 0.97 },
        ],
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
        regions: [
            { x: 2, y: 2, w: 96, h: 5, label: "nav", confidence: 0.98 },
            { x: 81.5, y: 13, w: 16.5, h: 12, label: "lidar status", confidence: 0.95 },
            { x: 2.5, y: 29, w: 45, h: 21, label: "headline", confidence: 0.96 },
            { x: 2.5, y: 71, w: 28, h: 7.5, label: "cta", confidence: 0.94 },
        ],
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
        regions: [
            { x: 3, y: 2, w: 94, h: 6.5, label: "nav", confidence: 0.97 },
            { x: 5, y: 26, w: 40, h: 32, label: "headline", confidence: 0.95 },
            { x: 63, y: 33, w: 20, h: 44, label: "figure", confidence: 0.92 },
            { x: 5, y: 78, w: 30, h: 8, label: "cta", confidence: 0.95 },
        ],
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
        // 아직 검출할 화면이 없다. 없는 제품에 신뢰도 숫자를 지어내지 않는다.
        regions: [],
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

/**
 * 정방향 경로에서 벗어나는 되돌림 경로. 이게 AOP의 차별점이라 다이어그램에서
 * 점선으로 반드시 드러나야 한다 — 대부분의 파이프라인 그림은 왼쪽에서 오른쪽으로만
 * 흐르고, 실패했을 때 어디로 가는지는 그리지 않는다.
 */
export interface PipelineFallback {
    /** 되돌림이 시작되는 노드 id */
    from: string;
    /** 되돌아가는 목적지 노드 id */
    to: string;
    label: string;
    description: string;
}

export const PIPELINE_FALLBACKS: readonly PipelineFallback[] = [
    {
        from: "critic",
        to: "executor",
        label: "retry",
        description:
            "검증에 실패한 단계는 Executor로 되돌아가 다시 실행됩니다. 재시도 횟수와 사유는 트레이스에 남습니다.",
    },
    {
        from: "critic",
        to: "planner",
        label: "replan",
        description:
            "재시도로 풀리지 않으면 계획 자체를 다시 세웁니다. 이미 실행된 툴 호출은 보상 트랜잭션으로 정리합니다.",
    },
    {
        from: "checkpoint",
        to: "executor",
        label: "resume",
        description:
            "승인 대기나 중단으로 멈춘 실행은 저장된 체크포인트에서 그대로 이어집니다.",
    },
];

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
    {
        title: "Brain MRI Assist",
        category: "Biomedical AI",
        tech: ["Python", "PyTorch", "Next.js"],
        description:
            "MRI를 올리면 분할과 분류 결과를 원본 위에 겹쳐 보여주고, 판독 요약 리포트를 자동으로 만듭니다.",
    },
    {
        title: "Metasurface Process Yield Predictor",
        category: "Process Analytics",
        tech: ["Python", "TypeScript", "Next.js"],
        description:
            "공정 파라미터와 측정 지표로 수율이 떨어진 원인을 예측하고, 다음에 바꿀 조건을 추천합니다.",
    },
    {
        title: "Solar Cell Curve Intelligence",
        category: "Energy Analytics",
        tech: ["Python", "NumPy", "FastAPI"],
        description:
            "IV 곡선과 환경 변수로 태양전지 효율을 추정하고, 손실 구간의 원인과 개선 방향을 짚어냅니다.",
    },
    {
        title: "Photonics Experiment Log Analyzer",
        category: "Experiment Analytics",
        tech: ["TypeScript", "Next.js", "D3.js"],
        description:
            "분광·스펙트럼 실험 로그에서 피크를 찾아 피팅하고, 이상치를 분류해 리포트로 정리합니다.",
    },
    {
        title: "AR/VR Display Calibrator",
        category: "Display Calibration",
        tech: ["Python", "OpenCV", "TypeScript"],
        description:
            "캘리브레이션 패턴 촬영본에서 왜곡과 색수차를 추정해 보정 LUT와 파라미터를 생성합니다.",
    },
    {
        title: "Optics Restoration Studio",
        category: "Computational Imaging",
        tech: ["Python", "PyTorch", "Next.js"],
        description:
            "광학 블러와 센서 노이즈 모델을 고르면 복원 모델을 적용하고, 정량 지표로 전후를 비교합니다.",
    },
    {
        title: "Meta-Atom Dataset Factory",
        category: "Data Infrastructure",
        tech: ["Python", "PostgreSQL", "TypeScript"],
        description:
            "메타-아톰 파라미터를 스윕해 결과를 모으고 검증까지 거쳐, 학습용 데이터셋을 제품처럼 찍어냅니다.",
    },
];

/**
 * 원천기술 트랙. RESEARCH와 계층이 다르다 —
 * RESEARCH는 제품이 되기 전의 탐색 과제, FRONTIER는 제품이 지금 쓰고 있는 기술이다.
 * 카피와 시각 위계가 그 차이를 드러내야 한다.
 */
export interface FrontierTrack {
    id: string;
    /** 01~04 */
    index: string;
    name: string;
    title: string;
    description: string;
    /** 이 트랙을 실제로 쓰고 있는 제품 */
    product: string;
}

export const FRONTIER_TRACKS: readonly FrontierTrack[] = [
    {
        id: "grounding",
        index: "01",
        name: "Visual Grounding",
        title: "화면 요소를 좌표로 이해합니다",
        description:
            "스크린샷에서 버튼, 입력창, 표를 검출하고 실행 가능한 액션 좌표로 변환합니다. 에이전트가 DOM 없이도 화면을 조작할 수 있는 근거가 됩니다.",
        product: "Autopilot",
    },
    {
        id: "parsing",
        index: "02",
        name: "Structure Parsing",
        title: "문서와 표를 구조로 복원합니다",
        description:
            "상세페이지, 리포트, 견적서의 레이아웃을 계층 구조로 복원해 에이전트가 항목 단위로 판단하게 합니다.",
        product: "Autopilot / BuyerPilot",
    },
    {
        id: "verification",
        index: "03",
        name: "Site Verification",
        title: "현장 사진을 검증 가능한 증거로 만듭니다",
        description:
            "시공 단계별 사진에서 마감 상태와 결함 후보를 검출하고, 촬영 시각·위치와 대조합니다.",
        product: "INSPEC",
    },
    {
        id: "trace",
        index: "04",
        name: "Trace Alignment",
        title: "판단 근거를 되돌려 봅니다",
        description:
            "에이전트의 시각적 판단을 트레이스에 정렬해, 어떤 픽셀 근거로 결정했는지 사후 검증합니다.",
        product: "전 제품 공통",
    },
];

export const FRONTIER = {
    eyebrow: "FRONTIER R&D",
    title: "에이전트가 화면을 읽는 방식을 직접 만듭니다",
    description:
        "LLM은 텍스트를 읽습니다. 그러나 실제 업무는 화면, 도면, 현장 사진 위에서 벌어집니다. AOP는 에이전트가 시각 정보를 근거로 판단하도록 만드는 인식 계층을 연구합니다.",
    caption: "이 트랙들은 자사 제품에서 먼저 검증된 뒤 계열사 현장으로 확장됩니다.",
} as const;

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
