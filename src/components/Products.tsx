"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { PRODUCTS, SECTIONS, type Product } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Product["status"], string> = {
    live: "Live",
    "coming-soon": "Coming Soon",
    affiliate: "계열 서비스",
};

function StatusBadge({ status }: { status: Product["status"] }) {
    const isLive = status === "live";

    return (
        <span
            className={cn(
                "badge",
                isLive
                    ? "border-transparent bg-accent-2-soft text-accent-2"
                    : "border-border text-muted"
            )}
        >
            <span
                className={cn(
                    "size-1.5 rounded-full",
                    isLive ? "bg-accent-2" : "bg-faint"
                )}
            />
            {STATUS_LABEL[status]}
        </span>
    );
}

/** 제품 화면 자리를 채우는 브라우저 크롬 목업. */
// TODO: 실제 에셋 교체 — 제품 스크린샷을 next/image로 대체
function ProductVisual({ product }: { product: Product }) {
    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <div className="browser-chrome">
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="ml-3 truncate rounded-md bg-surface px-2.5 py-1 font-mono text-[11px] text-faint">
                    {product.domain}
                </span>
            </div>
            <div
                className="relative h-44 w-full md:h-56"
                style={{
                    backgroundImage: `radial-gradient(110% 120% at 18% 0%, ${product.hue[0]}, ${product.hue[1]})`,
                }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:38px_38px]" />
                <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_120%,rgba(0,0,0,0.35),transparent)]" />
                <span className="absolute bottom-5 left-6 font-mono text-[11px] uppercase tracking-[0.22em] text-white/80">
                    {product.id}
                </span>
            </div>
        </div>
    );
}

function ProductPanel({ product }: { product: Product }) {
    const hasLink = product.link !== null;

    const body = (
        <>
            <ProductVisual product={product} />

            <div className="mt-7 flex flex-wrap items-center gap-3">
                <StatusBadge status={product.status} />
                {product.nameKo ? (
                    <span className="text-sm text-muted">{product.nameKo}</span>
                ) : null}
            </div>

            <h3 className="type-h2 mt-5">{product.name}</h3>
            <p className="mt-3 text-lg text-accent">{product.tagline}</p>
            <p className="type-body mt-5 max-w-xl text-muted">{product.description}</p>

            <ul className="mt-7 flex flex-wrap gap-2">
                {product.highlights.map((highlight) => (
                    <li
                        key={highlight}
                        className="rounded-full border border-border bg-surface-2 px-3 py-1 text-[12px] text-muted"
                    >
                        {highlight}
                    </li>
                ))}
            </ul>

            {hasLink ? (
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    <span className="underline-sweep">사이트 방문</span>
                    <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                </span>
            ) : (
                <span className="mt-8 inline-flex text-sm text-faint">
                    {product.status === "coming-soon" ? "출시 준비 중" : "계열사 운영 서비스"}
                </span>
            )}
        </>
    );

    const shared = "group surface-card block p-5 md:p-8";

    return hasLink ? (
        <a
            href={product.link ?? undefined}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="card"
            className={cn(shared, "hover:-translate-y-1 hover:border-accent/50")}
        >
            {body}
        </a>
    ) : (
        <div className={shared}>{body}</div>
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
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
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
                <SectionHeading {...SECTIONS.products} />

                <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-16">
                    {/* 좌측 인디케이터 — lg 이상에서만 스티키 */}
                    <div className="hidden lg:block">
                        <div className="sticky top-28">
                            <ul className="space-y-0.5 border-l border-border">
                                {PRODUCTS.map((product, index) => (
                                    <li key={product.id}>
                                        <a
                                            href={`#product-${product.id}`}
                                            className="relative flex items-baseline gap-3 py-2.5 pl-5"
                                        >
                                            {active === index ? (
                                                <motion.span
                                                    layoutId="product-indicator"
                                                    className="absolute -left-px top-0 h-full w-0.5 bg-accent"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 36,
                                                    }}
                                                />
                                            ) : null}
                                            <span className="font-mono text-[11px] tracking-[0.14em] text-faint">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-[15px] transition-colors duration-300",
                                                    active === index
                                                        ? "text-text"
                                                        : "text-muted hover:text-text"
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

                    <div className="space-y-6 lg:space-y-20">
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
