import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SITE } from "@/lib/constants";
import "./globals.css";

// 기술적 크롬(파이프라인 노드 라벨, 도메인 칩)에만 쓰는 보조 서체.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// TODO: 실제 운영 도메인 확정 시 NEXT_PUBLIC_SITE_URL 환경변수로 주입
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const title = "AOP — 에이전트가 끝까지 일하는 구조를 설계합니다";
const description =
  "AOP는 AI 에이전트 제품을 직접 만들고 운영하며, 에이전트가 실제 업무를 끝내도록 만드는 실행 기술을 연구합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s — ${SITE.name}`,
  },
  description,
  applicationName: SITE.name,
  keywords: [
    "AI 에이전트",
    "AI Agent",
    "Agent Orchestration",
    "MCP",
    "AOP",
    "에이오피",
    "Art of Programming",
  ],
  authors: [{ name: SITE.legalName }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: SITE.name,
    title,
    description,
    // TODO: 실제 에셋 교체 — OG 이미지(1200x630) 제작 후 images 필드 추가
  },
  twitter: { card: "summary_large_image", title, description },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.legalName,
  alternateName: [SITE.name, SITE.fullName],
  url: siteUrl,
  description,
  email: SITE.email,
  slogan: SITE.slogan,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
        />
        <meta name="theme-color" content="#000000" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
