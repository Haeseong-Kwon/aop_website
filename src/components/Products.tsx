"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { useEnter } from "@/hooks/useEnter";
import { DUR, EASE } from "@/lib/motion";
import { PRODUCTS, SECTIONS, type Product } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Product["status"], string> = {
    live: "Live",
    "coming-soon": "Coming Soon",
};

function StatusBadge({ status }: { status: Product["status"] }) {
    const isLive = status === "live";

    return (
        <span
            className={cn(
                "badge",
                isLive
                    ? "border-transparent bg-signal/12 text-signal"
                    : "border-border text-muted"
            )}
        >
            <span
                className={cn(
                    "size-1.5 rounded-full",
                    isLive ? "bg-signal" : "bg-faint"
                )}
            />
            {STATUS_LABEL[status]}
        </span>
    );
}

/**
 * 프로덕션 실화면. 이미지가 없는 제품(미출시)만 그라디언트 목업으로 떨어진다.
 * 스크롤에 따라 이미지가 프레임 안에서 천천히 밀려 깊이감을 만든다.
 */
function ProductVisual({ product }: { product: Product }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

    return (
        <div
            ref={ref}
            className="relative overflow-hidden rounded-xl border border-border"
        >
            <div className="browser-chrome">
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="ml-3 truncate rounded-md bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                    {product.domain}
                </span>
            </div>

            <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
                {/* 오버스캔은 세로로만 — 좌우까지 넓히면 화면 양끝 글자가 잘린다 */}
                {product.image ? (
                    <motion.div
                        style={{ y: imageY }}
                        className="absolute inset-x-0 -top-[6%] -bottom-[6%]"
                    >
                        <Image
                            src={product.image}
                            alt={`${product.name} 서비스 화면`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 720px"
                            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                    </motion.div>
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(110% 120% at 18% 0%, ${product.hue[0]}, ${product.hue[1]})`,
                        }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:38px_38px]" />
                        <span className="absolute bottom-5 left-6 font-mono text-[11px] uppercase tracking-[0.22em] text-white/85">
                            {product.id}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductPanel({ product, index }: { product: Product; index: number }) {
    const hasLink = product.link !== null;

    const body = (
        <>
            <ProductVisual product={product} />

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] tracking-[0.18em] text-faint">
                    {String(index + 1).padStart(2, "0")}
                </span>
                <StatusBadge status={product.status} />
                {product.nameKo ? (
                    <span className="text-sm text-muted">{product.nameKo}</span>
                ) : null}
            </div>

            <h3 className="type-h2 mt-5">{product.name}</h3>
            <p className="mt-4 text-[clamp(1.0625rem,1.5vw,1.375rem)] leading-snug tracking-[-0.02em] text-bright">
                {product.tagline}
            </p>
            <p className="type-body mt-5 max-w-xl text-muted">{product.description}</p>

            <ul className="mt-8 flex flex-wrap gap-2">
                {product.highlights.map((highlight) => (
                    <li
                        key={highlight}
                        className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[12.5px] text-text"
                    >
                        {highlight}
                    </li>
                ))}
            </ul>

            {hasLink ? (
                <span className="mt-9 inline-flex items-center gap-1.5 text-sm font-medium text-bright">
                    <span className="underline-sweep">{product.domain} 방문</span>
                    <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                </span>
            ) : (
                <span className="mt-9 inline-flex text-sm text-muted">출시 준비 중</span>
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
            className={cn(shared, "hover:-translate-y-1 hover:border-beam/50")}
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
    const enter = useEnter({ y: 20, blur: true, duration: DUR.slow });

    useEffect(() => {
        if (inView) onActivate(index);
    }, [inView, index, onActivate]);

    return (
        <motion.div ref={ref} id={`product-${product.id}`} {...enter}>
            <ProductPanel product={product} index={index} />
        </motion.div>
    );
}

export function Products() {
    const [active, setActive] = useState(0);

    return (
        <section id="products" className="section-y relative">
            <div className="container-x">
                <SectionHeading {...SECTIONS.products} />

                <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)] lg:gap-16">
                    {/* 좌측 인디케이터 — lg 이상에서만 스티키 */}
                    <div className="hidden lg:block">
                        <div className="sticky top-28">
                            <ul className="space-y-0.5 border-l border-border">
                                {PRODUCTS.map((product, index) => (
                                    <li key={product.id}>
                                        <a
                                            href={`#product-${product.id}`}
                                            className="relative flex items-baseline gap-3 py-3 pl-5"
                                        >
                                            {active === index ? (
                                                <motion.span
                                                    layoutId="product-indicator"
                                                    className="absolute -left-px top-0 h-full w-0.5 bg-beam"
                                                    transition={EASE.spring}
                                                />
                                            ) : null}
                                            <span className="font-mono text-[11px] tracking-[0.16em] text-faint">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-[15px] transition-colors duration-300",
                                                    active === index
                                                        ? "text-bright"
                                                        : "text-muted hover:text-bright"
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

                    <div className="space-y-6 lg:space-y-24">
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
