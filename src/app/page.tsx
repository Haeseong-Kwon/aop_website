import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Ventures } from "@/components/Ventures";
import { Portfolio } from "@/components/Portfolio";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";

export default function Home() {
  return (
    <main className="min-h-screen bg-black transition-colors duration-700">
      <CustomCursor />
      <Navbar />
      <Hero />
      <Ventures />
      <Portfolio />
      <Services />
      <Footer />
    </main>
  );
}
