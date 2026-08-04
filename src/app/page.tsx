import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Capability } from "@/components/Capability";
import { Products } from "@/components/Products";
import { Research } from "@/components/Research";
import { Partners } from "@/components/Partners";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

// 스크롤 연동 다이어그램과 커서는 클라이언트 전용 — 초기 번들에서 분리한다.
const Technology = dynamic(() =>
  import("@/components/Technology").then((mod) => mod.Technology)
);
const CustomCursor = dynamic(() =>
  import("@/components/CustomCursor").then((mod) => mod.CustomCursor)
);

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-surface-2 focus:px-4 focus:py-2 focus:text-sm"
      >
        본문으로 건너뛰기
      </a>

      <div aria-hidden className="backdrop-grid" />
      <div aria-hidden className="backdrop-noise" />

      <ScrollProgress />
      <CustomCursor />
      <Navbar />

      <main id="main" className="relative z-10">
        <Hero />
        <Capability />
        <Products />
        <Technology />
        <Research />
        <Partners />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
