import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { HERO, SECTIONS, SITE } from "@/lib/constants";
import { emphasizedChars } from "@/lib/emphasis";
import "./globals.css";

/*
 * 한글 강조어에만 명조를 쓰므로, 실제로 쓰인 글자만 서브셋으로 받는다.
 * 카피가 바뀌면 이 목록도 자동으로 따라간다 (수 KB 수준).
 */
const serifKoUrl = `https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500&text=${encodeURIComponent(
  emphasizedChars([HERO.headline, ...Object.values(SECTIONS).map((s) => s.title)])
)}&display=swap`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// TODO: 실제 운영 도메인 확정 시 NEXT_PUBLIC_SITE_URL 환경변수로 주입
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const title = "AOP — 에이전트가 일하는 방식을 설계합니다";
const description =
  "AOP는 네 개의 AI 에이전트 제품을 직접 운영하며, 에이전트를 더 정확하고 더 싸게 만드는 원천기술을 연구합니다.";

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
    <html
      lang="ko"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="stylesheet" href={serifKoUrl} />
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
