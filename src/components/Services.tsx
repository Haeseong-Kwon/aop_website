"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Services() {
    return (
        <section id="partnership" className="py-24 md:py-48 px-8 md:px-12 bg-white text-black noise">
            <div className="max-w-[120rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32">
                <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-neutral-400 mb-6 font-bold">The Partnership</p>
                    <h3 className="text-huge leading-[0.8] mb-12">
                        Work<br />With AOP
                    </h3>
                    <p className="text-neutral-500 text-lg md:text-xl max-w-md leading-relaxed mb-16 font-medium">
                        비즈니스의 시작부터 도약까지, AOP는 당신의 기술적 기반을
                        설계하고 증명하는 파트너로서 함께합니다.
                    </p>

                    <div className="space-y-12">
                        {[
                            { step: "01", title: "Strategy & Architecture", desc: "기술적 근간을 설계하고 지속 가능한 아키텍처를 제안합니다." },
                            { step: "02", title: "Technical Execution", desc: "최신 기술 스택과 AI를 활용한 고성능 엔지니어링을 수행합니다." },
                            { step: "03", title: "Venture Growth", desc: "MVP 개발을 넘어 시장을 정의하는 에코시스템으로 확장합니다." }
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-8 border-b border-black/5 pb-12 group">
                                <span className="text-2xl font-black text-neutral-200 group-hover:text-black transition-colors">{item.step}</span>
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:translate-x-2 transition-transform">{item.title}</h4>
                                    <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div id="contact" className="bg-black text-white p-12 md:p-24 flex flex-col justify-center">
                    <h4 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase leading-none">
                        Start a<br />Conversation
                    </h4>
                    <form className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Full Name</Label>
                                <Input id="name" placeholder="Name" className="bg-transparent border-0 border-b border-white/20 rounded-none h-14 text-lg focus:border-white transition-colors outline-none px-0" />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Email Address</Label>
                                <Input id="email" type="email" placeholder="Email" className="bg-transparent border-0 border-b border-white/20 rounded-none h-14 text-lg focus:border-white transition-colors outline-none px-0" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="service" className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Service Interest</Label>
                            <Input id="service" placeholder="Venture Building / AI / Web Dev" className="bg-transparent border-0 border-b border-white/20 rounded-none h-14 text-lg focus:border-white transition-colors outline-none px-0" />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="message" className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Project Details</Label>
                            <textarea
                                id="message"
                                rows={4}
                                placeholder="Your Vision..."
                                className="w-full bg-transparent border-0 border-b border-white/20 p-0 py-4 text-lg focus:outline-none focus:border-white transition-colors rounded-none resize-none"
                            />
                        </div>
                        <button className="group flex items-center gap-4 text-sm font-black uppercase tracking-widest pt-8">
                            <span className="w-12 h-[1px] bg-white group-hover:w-24 transition-all duration-500" />
                            Send Inquiry
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
