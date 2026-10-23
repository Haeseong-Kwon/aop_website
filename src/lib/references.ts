/**
 * 납품·구축 레퍼런스. 출처는 대표 GitHub(프로필 README, Portfolio-Website 데이터, 저장소 이력·문서)다.
 * 공개된 결과물은 URL을 직접 캡처했고, 공개 화면이 없는 시스템(앱·관리자 화면·미배포 MVP)은
 * 저장소 명세대로 화면 구성을 웹 그래픽으로 재현한다. 자체 제품(PRODUCTS)과 겹치는 것은 넣지 않는다.
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

/** 재현 그래픽 키 — References.tsx에서 컴포넌트로 매핑한다 */
export type ReferenceGraphic = "promo" | "snapsnap" | "potential";

export type ReferenceMedia =
    /** 공개 URL 캡처(1280×820) */
    | { kind: "capture"; url: string; image: string }
    /** 공개 화면이 없어 재현한 그래픽. label은 창 상단에 쓰는 시스템 이름 */
    | { kind: "graphic"; graphic: ReferenceGraphic; label: string };

export interface Reference {
    id: string;
    client: string;
    /** 발주처 업종 또는 기관 성격 */
    sector: string;
    title: string;
    summary: string;
    year: string;
    media: ReferenceMedia;
    stack: readonly string[];
}

export const REFERENCES: readonly Reference[] = [
    {
        id: "promo",
        client: "PROMO",
        sector: "댄스 클래스 · 소셜 앱",
        title: "앱 백엔드와 운영자 대시보드",
        summary: "Supabase 스키마·RLS와 Cloudflare Workers 브리지를 설계하고, 가입·스토어 다운로드 지표와 크리에이터 정산 승인을 처리하는 운영 화면을 만들었습니다.",
        year: "2025",
        media: { kind: "graphic", graphic: "promo", label: "promo · admin" },
        stack: ["Next.js", "Supabase", "Cloudflare Workers"],
    },
    {
        id: "snapsnap",
        client: "snapsnap",
        sector: "스냅 사진 · 작가 마켓플레이스",
        title: "작가·고객 매칭 모바일 앱",
        summary: "작가 승인과 넛지, 지역·스타일·가격 검색, 1:1 채팅 예약, 결제까지 iOS·Android 앱 하나로 이었습니다. 승인 상태는 실시간으로 반영되고 푸시로 알립니다.",
        year: "2026",
        media: { kind: "graphic", graphic: "snapsnap", label: "snapsnap · iOS / Android" },
        stack: ["Flutter", "Supabase", "FCM"],
    },
    {
        id: "potential",
        client: "그로윙업 주식회사",
        sector: "제품 사전검증 SaaS",
        title: "POTENTIAL MVP 구축",
        summary: "발주처 기획서를 PRD로 정리하고, 결제 없이 관심 등록·구매 의향을 모아 신뢰구간과 표본 크기까지 밝히는 검증 분석 MVP를 구현했습니다.",
        year: "2026",
        media: { kind: "graphic", graphic: "potential", label: "potential · analytics" },
        stack: ["Next.js", "PostgreSQL", "Drizzle"],
    },
    {
        id: "leedaepyo",
        client: "리대표의 솔직 검증",
        sector: "제품 리뷰 미디어",
        title: "티스토리 리뷰 미디어 스킨",
        summary: "다섯 축 별점을 가중 평균으로 자동 계산해 본문·목록·구조화 데이터에 같은 값을 싣고, 제휴 고지와 SEO·GEO 기반을 갖춘 블로그 스킨을 납품했습니다.",
        year: "2026",
        media: { kind: "capture", url: "https://startupinsight-1.tistory.com/3", image: "/references/leedaepyo.jpg" },
        stack: ["Tistory Skin", "JavaScript"],
    },
    {
        id: "growingup",
        client: "그로윙업 주식회사",
        sector: "퍼포먼스 마케팅",
        title: "에이전시 기업 홈페이지 전면 개편",
        summary: "브랜드 톤을 다시 정의하고, 성과 사례와 제안 요청까지 이어지는 반응형 인터랙션을 설계했습니다.",
        year: "2026",
        media: { kind: "capture", url: "https://growingup-homepage.vercel.app", image: "/references/growingup.jpg" },
        stack: ["Next.js", "Framer Motion"],
    },
    {
        id: "shotcrete",
        client: "덕림기초개발",
        sector: "토목 기초공사",
        title: "B2B 건설 기업 홈페이지",
        summary: "숏크리트·녹생토 등 공법과 시공 실적을 발주처가 찾기 쉬운 정보 구조로 정리하고 견적 문의로 연결했습니다.",
        year: "2026",
        media: { kind: "capture", url: "https://shotcrete.vercel.app", image: "/references/shotcrete.jpg" },
        stack: ["Next.js", "Supabase"],
    },
    {
        id: "swcapstone",
        client: "한양대학교 ERICA",
        sector: "대학 · SW창업 교과",
        title: "SW창업캡스톤디자인 통합 플랫폼",
        summary: "기업멘토로 참여한 과목에 수강생·팀·멘토 역할을 나눈 과목 운영과 창업 팀빌딩 커뮤니티를 제공했습니다.",
        year: "2026",
        media: { kind: "capture", url: "https://swcapstone.vercel.app", image: "/references/swcapstone.jpg" },
        stack: ["Next.js", "Supabase"],
    },
    {
        id: "ipswitch",
        client: "Harris Prep & Ipswitch",
        sector: "호주 단기유학",
        title: "유학 프로그램 판촉 랜딩",
        summary: "캠프에서 정규 과정으로 이어지는 선택을 한 장의 흐름으로 보여주고, 무료 로드맵 진단으로 전환을 모읍니다.",
        year: "2026",
        media: { kind: "capture", url: "https://ipswitch-landing.vercel.app", image: "/references/ipswitch.jpg" },
        stack: ["HTML", "JavaScript"],
    },
];
