import { Reveal } from "@/components/motion/Reveal";
import { PARTNERS, PATENTS, PIPELINE, PRODUCTS } from "@/lib/constants";

/**
 * 숫자는 전부 데이터 길이에서 계산한다 — 콘텐츠가 바뀌어도 어긋나지 않고,
 * 지어낸 실적이 끼어들 자리가 없다.
 */
const STATS = [
    { value: PRODUCTS.length, label: "운영·개발 중인 제품" },
    { value: PIPELINE.length, label: "실행 파이프라인 단계" },
    { value: PATENTS.length, label: "출원 특허" },
    { value: PARTNERS.length, label: "계열 · 파트너사" },
];

export function StatGrid() {
    return (
        <section className="border-y border-border">
            <div className="container-x grid grid-cols-2 gap-px lg:grid-cols-4">
                {STATS.map((stat, index) => (
                    <Reveal
                        key={stat.label}
                        delay={index * 0.07}
                        y={14}
                        className="px-2 py-12 md:py-16"
                    >
                        <p className="type-display text-[clamp(2.75rem,5vw,4.5rem)] tabular-nums">
                            {String(stat.value).padStart(2, "0")}
                        </p>
                        <p className="mt-3 text-sm text-muted">{stat.label}</p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
