"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight } from "lucide-react";

export function Services() {
    const process = [
        { step: "01", title: "Strategy & Architecture", desc: "목표에 맞는 기술 로드맵과 서비스 구조를 선행 설계합니다." },
        { step: "02", title: "Technical Execution", desc: "AI와 최신 스택을 결합해 빠르고 안정적인 제품을 구현합니다." },
        { step: "03", title: "Venture Growth", desc: "MVP 이후 지표 기반 개선으로 확장 가능한 성장 구조를 만듭니다." },
    ];

    return (
        <section id="partnership" className="py-20 md:py-28 px-6 md:px-10 bg-white text-black noise">
            <div className="max-w-[120rem] mx-auto border-y border-black/10 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16">
                <div>
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-neutral-400 mb-5 font-black">The Partnership</p>
                    <h3 className="text-5xl md:text-8xl leading-[0.82] mb-8 tracking-[-0.03em]">
                        Work<br />With AOP
                    </h3>
                    <p className="text-neutral-600 text-base md:text-lg max-w-xl leading-relaxed mb-10 font-medium">
                        비즈니스 초기 검증부터 본격 확장까지, AOP는 기술과 브랜딩을
                        하나의 실행 체계로 연결해 성과를 만듭니다.
                    </p>

                    <div className="space-y-7">
                        {process.map((item) => (
                            <div key={item.step} className="flex items-start gap-5 border-b border-black/10 pb-7 group">
                                <span className="text-xl md:text-2xl font-black text-neutral-300 group-hover:text-black transition-colors">{item.step}</span>
                                <div>
                                    <h4 className="text-lg md:text-xl font-black uppercase tracking-tight mb-2.5 group-hover:translate-x-1 transition-transform">{item.title}</h4>
                                    <p className="text-neutral-600 text-sm md:text-[15px] leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div id="contact" className="relative bg-black text-white p-8 md:p-12 flex flex-col justify-center border border-black/20">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
                    <h4 className="relative text-3xl md:text-5xl font-black tracking-tighter mb-8 uppercase leading-none">
                        Start a<br />Conversation.
                    </h4>
                    <form className="relative space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Full Name</Label>
                                <Input id="name" placeholder="Name" className="bg-transparent border-0 border-b border-white/25 rounded-none h-12 text-base focus:border-white transition-colors outline-none px-0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Email Address</Label>
                                <Input id="email" type="email" placeholder="Email" className="bg-transparent border-0 border-b border-white/25 rounded-none h-12 text-base focus:border-white transition-colors outline-none px-0" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="service" className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Service Interest</Label>
                            <Input id="service" placeholder="Venture Building / AI / Web Development" className="bg-transparent border-0 border-b border-white/25 rounded-none h-12 text-base focus:border-white transition-colors outline-none px-0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Project Details</Label>
                            <textarea
                                id="message"
                                rows={3}
                                placeholder="Your Vision..."
                                className="w-full bg-transparent border-0 border-b border-white/25 p-0 py-3 text-base focus:outline-none focus:border-white transition-colors rounded-none resize-none"
                            />
                        </div>
                        <button className="group inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] pt-4">
                            <span className="w-10 h-[1px] bg-white group-hover:w-16 transition-all duration-500" />
                            Send Inquiry
                            <ArrowUpRight size={15} />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
