/**
 * 납품·구축 레퍼런스. 출처는 대표 GitHub(프로필 README, Portfolio-Website 데이터, 저장소 이력)이고
 * 결과물 화면은 공개 URL을 직접 캡처했다. 자체 제품(PRODUCTS)과 겹치는 것은 넣지 않는다.
 *
 * 역할은 실제 맡은 범위만 적는다. GUARDION은 팀 프로젝트로 하드웨어·배터리·소프트웨어 통합 시스템을 개발했다
 * (GitHub README의 'Flutter 프론트엔드 담당' 표기는 잘못된 기록 — 대표 확인).
 */

export interface FeaturedReference {
    name: string;
    title: string;
    summary: string;
    facts: readonly { label: string; value: string }[];
    results: readonly string[];
    stack: readonly string[];
}

export const FEATURED_REFERENCE: FeaturedReference = {
    name: "GUARDION",
    title: "드론 배터리 통합관제 시스템",
    summary:
        "비행 중인 드론의 배터리 잔량, 셀 온도, 전압, 속도를 실시간으로 받아 한 화면에서 관제합니다. 위험 구간에 들어선 기체는 알림으로 먼저 띄워 회수 판단을 앞당깁니다.",
    facts: [
        { label: "발주", value: "경상북도 영주시 · 드론실증사업" },
        { label: "범위", value: "배터리 상태관리 장치부터 실시간 관제 소프트웨어까지" },
        { label: "역할", value: "팀 프로젝트 · 하드웨어·배터리·소프트웨어 통합 시스템 개발" },
    ],
    results: ["실증사업 선정·납품", "Deep-Tech Audition 최우수상"],
    stack: ["Hardware", "Battery", "Software", "실시간 텔레메트리"],
};

export interface Reference {
    id: string;
    client: string;
    /** 발주처 업종 또는 기관 성격 */
    sector: string;
    title: string;
    summary: string;
    year: string;
    url: string;
    /** 공개 URL 캡처(1280×820) */
    image: string;
    stack: readonly string[];
}

export const REFERENCES: readonly Reference[] = [
    {
        id: "growingup",
        client: "그로윙업 주식회사",
        sector: "퍼포먼스 마케팅",
        title: "에이전시 기업 홈페이지 전면 개편",
        summary: "브랜드 톤을 다시 정의하고, 성과 사례와 제안 요청까지 이어지는 반응형 인터랙션을 설계했습니다.",
        year: "2026",
        url: "https://growingup-homepage.vercel.app",
        image: "/references/growingup.jpg",
        stack: ["Next.js", "Framer Motion"],
    },
    {
        id: "shotcrete",
        client: "덕림기초개발",
        sector: "토목 기초공사",
        title: "B2B 건설 기업 홈페이지",
        summary: "숏크리트·녹생토 등 공법과 시공 실적을 발주처가 찾기 쉬운 정보 구조로 정리하고 견적 문의로 연결했습니다.",
        year: "2026",
        url: "https://shotcrete.vercel.app",
        image: "/references/shotcrete.jpg",
        stack: ["Next.js", "Supabase"],
    },
    {
        id: "swcapstone",
        client: "한양대학교 ERICA",
        sector: "대학 · SW창업 교과",
        title: "SW창업캡스톤디자인 통합 플랫폼",
        summary: "기업멘토로 참여한 과목에 수강생·팀·멘토 역할을 나눈 과목 운영과 창업 팀빌딩 커뮤니티를 제공했습니다.",
        year: "2026",
        url: "https://swcapstone.vercel.app",
        image: "/references/swcapstone.jpg",
        stack: ["Next.js", "Supabase"],
    },
    {
        id: "ipswitch",
        client: "Harris Prep & Ipswitch",
        sector: "호주 단기유학",
        title: "유학 프로그램 판촉 랜딩",
        summary: "캠프에서 정규 과정으로 이어지는 선택을 한 장의 흐름으로 보여주고, 무료 로드맵 진단으로 전환을 모읍니다.",
        year: "2026",
        url: "https://ipswitch-landing.vercel.app",
        image: "/references/ipswitch.jpg",
        stack: ["HTML", "JavaScript"],
    },
];
