"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { PRODUCTS, type Product } from "@/lib/constants";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: Product["status"] }) {
    const isLive = status === "live";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]",
                isLive
                    ? "border-accent-2/30 text-accent-2"
                    : "border-border text-muted"
            )}
        >
            <span
                className={cn(
                    "size-1.5 rounded-full",
                    isLive ? "bg-accent-2" : "bg-muted"
                )}
            />
            {isLive ? "Live" : "Coming Soon"}
        </span>
    );
}

function ProductPanel({ product }: { product: Product }) {
    const isLive = product.link !== null;

    const content = (
        <>
            {/* TODO: 실제 에셋 교체 — 제품 스크린샷을 next/image로 대체 */}
            <div
                aria-hidden
                className="relative h-48 w-full overflow-hidden rounded-lg border border-border md:h-64"
                style={{
                    backgroundImage: `radial-gradient(120% 120% at 20% 0%, ${product.hue[0]}55, transparent 60%), linear-gradient(160deg, ${product.hue[1]}, var(--color-surface))`,
                }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <span className="absolute bottom-5 left-6 font-mono text-[11px] uppercase tracking-[0.24em] text-text/70">
                    {product.id}
                </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <StatusBadge status={product.status} />
                {product.nameKo ? (
                    <span className="text-sm text-muted">{product.nameKo}</span>
                ) : null}
            </div>

            <h3 className="type-h2 mt-6">{product.name}</h3>
            <p className="mt-3 text-lg text-accent">{product.tagline}</p>
            <p className="type-body mt-5 max-w-xl text-muted">{product.description}</p>

            {isLive ? (
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium">
                    <span className="underline-sweep">사이트 방문</span>
                    <ArrowUpRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                </span>
            ) : (
                <span className="mt-8 inline-flex text-sm text-muted">출시 준비 중</span>
            )}
        </>
    );

    const shared =
        "group surface-card block p-6 transition-transform duration-500 md:p-10";

    return isLive ? (
        <a
            href={product.link ?? undefined}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="card"
            className={cn(shared, "hover:-translate-y-1 hover:border-accent")}
        >
            {content}
        </a>
    ) : (
        <div className={shared}>{content}</div>
    );
}

/** 뷰포트 중앙에 걸린 제품을 좌측 인디케이터에 알린다. */
function ProductSlide({
    product,
    index,
    onActivate,
}: {
    product: Product;
    index: number;
    onActivate: (index: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });

    useEffect(() => {
        if (inView) onActivate(index);
    }, [inView, index, onActivate]);

    return (
        <motion.div
            ref={ref}
            id={`product-${product.id}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            <ProductPanel product={product} />
        </motion.div>
    );
}

export function Products() {
    const [active, setActive] = useState(0);

    return (
        <section id="products" className="section-y relative">
            <div className="container-x">
                <SectionHeading
                    eyebrow="PRODUCTS"
                    title="직접 운영하는 제품"
                    description="연구한 기술은 자사 제품에서 먼저 검증합니다. 세 제품 모두 실사용 트래픽 위에서 에이전트 실행 구조를 다듬고 있습니다."
                />

                <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-20">
                    {/* 좌측 인디케이터 — lg 이상에서만 스티키 */}
                    <div className="hidden lg:block">
                        <div className="sticky top-32">
                            <ul className="space-y-1">
                                {PRODUCTS.map((product, index) => (
                                    <li key={product.id}>
                                        <a
                                            href={`#product-${product.id}`}
                                            className="relative flex items-center gap-4 py-3 pl-5 text-left"
                                        >
                                            {active === index ? (
                                                <motion.span
                                                    layoutId="product-indicator"
                                                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-accent"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 420,
                                                        damping: 38,
                                                    }}
                                                />
                                            ) : null}
                                            <span className="font-mono text-[11px] tracking-[0.18em] text-muted">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-base transition-colors duration-300",
                                                    active === index ? "text-text" : "text-muted"
                                                )}
                                            >
                                                {product.name}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-8 lg:space-y-24">
                        {PRODUCTS.map((product, index) => (
                            <ProductSlide
                                key={product.id}
                                product={product}
                                index={index}
                                onActivate={setActive}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
