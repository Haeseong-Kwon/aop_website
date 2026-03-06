"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function Ventures() {
    const services = [
        {
            id: "inspec",
            name: "Inspec",
            category: "Platform 01 / 인테리어 전문 감리 및 시공 검수 서비스",
            tagline: "공간의 신뢰를 검증하는 정직한 눈",
            body: "인테리어 공사의 불투명성을 해소하는 전문가 파견 플랫폼입니다. 숙련된 감리자가 현장을 직접 확인하고 객관적인 리포트를 제공하여 시공 퀄리티를 보장하고 소비자의 권익을 보호합니다.",
            color: "var(--inspec-blue)",
        },
        {
            id: "snapsnap",
            name: "snapsnap",
            category: "Platform 02 / 포토그래퍼-소비자 스마트 매칭 플랫폼",
            tagline: "당신의 찰나를 가장 완벽하게 담는 방법",
            body: "위치와 스타일 분석을 기반으로 최적의 작가를 연결하는 촬영 중개 서비스입니다. 작가에게는 새로운 기회를, 소비자에게는 신뢰할 수 있는 매칭 경험을 선사하여 일상의 모든 순간을 예술로 기록합니다.",
            color: "var(--snapsnap-sunset)",
        }
    ];

    return (
        <section id="services" className="py-20 md:py-28 px-6 md:px-10 bg-white text-black relative">
            <div className="max-w-[120rem] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 border-b border-black/10 pb-8 md:pb-10">
                    <div className="max-w-2xl">
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-neutral-400 mb-4 font-black">Innovation Hub</p>
                        <h3 className="text-5xl md:text-8xl leading-[0.82] mb-5 tracking-[-0.03em]">
                            Internal<br />Ventures
                        </h3>
                    </div>
                    <div className="md:max-w-xs">
                        <p className="text-neutral-600 text-sm leading-relaxed font-medium">
                            AOP는 단순히 타사의 프로젝트를 개발하는 것에 그치지 않고,
                            산업을 재정의하는 혁신적인 독자 플랫폼들을 직접 인큐베이팅합니다.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="group relative border-b border-black/10 hover:bg-neutral-50 transition-colors duration-500 py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
                        >
                            <div className="flex flex-col max-w-2xl">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-4 inline-flex items-center gap-3">
                                    <span
                                        className="w-8 h-[2px]"
                                        style={{ backgroundColor: service.color }}
                                    />
                                    {service.category}
                                </span>
                                <h4 className="text-4xl md:text-7xl font-black mb-4 uppercase tracking-[-0.04em]">
                                    {service.name}
                                </h4>
                                <p
                                    className="text-lg md:text-2xl font-bold mb-5 leading-tight tracking-tight"
                                    style={{ color: service.color }}
                                >
                                    {service.tagline}
                                </p>
                                <p className="text-neutral-600 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                                    {service.body}
                                </p>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 45 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Link
                                    href="#"
                                    className="w-14 h-14 md:w-20 md:h-20 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500"
                                >
                                    <ArrowUpRight size={22} strokeWidth={1.5} />
                                </Link>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
