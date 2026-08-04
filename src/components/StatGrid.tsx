import { Reveal } from "@/components/motion/Reveal";
import { RibbonLight } from "@/components/visual/RibbonLight";
import { PARTNERS, PATENTS, PIPELINE, PRODUCTS } from "@/lib/constants";

/**
 * 숫자는 전부 데이터 길이에서 계산한다 — 콘텐츠가 바뀌어도 어긋나지 않고,
 * 지어낸 실적이 끼어들 자리가 없다.
 */
const STATS = [
    {
        value: PRODUCTS.length,
        caption: ["마케팅·수출·교육·건설에서", "운영·개발 중인 에이전트 제품"],
    },
    {
        value: PIPELINE.length,
        caption: ["요청 하나가 결과가 되기까지", "거치는 실행 파이프라인 단계"],
    },
    {
        value: PATENTS.length,
        caption: ["공정 검증과 개인화 추천에", "관해 출원한 특허"],
    },
    {
        value: PARTNERS.length,
        caption: ["각자의 산업에서 기술을 검증하는", "계열사와 파트너사"],
    },
];

export function StatGrid() {
    return (
        <section className="relative pb-[clamp(4rem,8vw,7rem)]">
            <div className="container-x">
                <div className="light-panel px-6 py-14 md:px-14 md:py-20">
                    <div aria-hidden className="absolute inset-0 opacity-90">
                        <RibbonLight id="stats" />
                    </div>

                    <Reveal className="relative" y={14}>
                        <p className="type-eyebrow">By the numbers</p>
                    </Reveal>

                    <div className="relative mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2">
                        {STATS.map((stat, index) => (
                            <Reveal key={stat.caption[1]} delay={index * 0.08} y={16}>
                                <p className="stat-value">
                                    {String(stat.value).padStart(2, "0")}
                                </p>
                                <div className="mt-5 border-t border-border pt-4">
                                    <p className="text-[13px] leading-relaxed text-muted">
                                        {stat.caption[0]}
                                        <br />
                                        {stat.caption[1]}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
