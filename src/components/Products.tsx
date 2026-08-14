"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { DetectionOverlay } from "@/components/visual/DetectionOverlay";
import {
    RotaryStage,
    faceIndexFromProgress,
} from "@/components/motion/RotaryStage";
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
            <span className={cn("size-1.5 rounded-full", isLive ? "bg-signal" : "bg-faint")} />
            {STATUS_LABEL[status]}
        </span>
    );
}

/**
 * 프로덕션 실화면 + 인식 오버레이.
 *
 * 패럴랙스 오버스캔은 걷어냈다. 이미지를 프레임 안에서 밀면 검출 박스가 화면 요소에서
 * 어긋나고, 그러면 이 오버레이는 '인식'이 아니라 그냥 붙어 있는 사각형이 된다.
 */
function ProductVisual({ product, scanned }: { product: Product; scanned: boolean }) {
    const isPending = product.status === "coming-soon";

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border border-border",
                isPending && "pending-visual"
            )}
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
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={`${product.name} 서비스 화면`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 720px"
                        className="object-cover object-top"
                    />
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

                {/* 에이전트가 이 화면에서 무엇을 집어내는지 — Visual Grounding 트랙 그대로다 */}
                <DetectionOverlay boxes={product.regions} active={scanned} />
            </div>
        </div>
    );
}

function ProductFace({ product, index, scanned }: { product: Product; index: number; scanned: boolean }) {
    const hasLink = product.link !== null;

    const body = (
        <div className="grid h-full gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
            <ProductVisual product={product} scanned={scanned} />

            <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-faint">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <StatusBadge status={product.status} />
                    {product.nameKo ? (
                        <span className="text-sm text-muted">{product.nameKo}</span>
                    ) : null}
                </div>

                <h3 className="type-h2 mt-4">{product.name}</h3>
                <p className="mt-3 text-[clamp(1.0625rem,1.4vw,1.3rem)] leading-snug tracking-[-0.02em] text-bright">
                    {product.tagline}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">
                    {product.description}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
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
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-bright">
                        <span className="underline-sweep">{product.domain} 방문</span>
                        <ArrowUpRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </span>
                ) : (
                    <span className="mt-auto inline-flex pt-6 text-sm text-muted">
                        출시 준비 중
                    </span>
                )}
            </div>
        </div>
    );

    const shared =
        "group surface-card block h-full overflow-hidden p-5 md:p-7 lg:p-8";

    return hasLink ? (
        <a
            href={product.link ?? undefined}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="card"
            className={cn(shared, "hover:border-beam/50")}
        >
            {body}
        </a>
    ) : (
        <div className={shared}>{body}</div>
    );
}

export function Products() {
    const pinRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    // 한 번 스캔한 면은 다시 스캔하지 않는다 — 돌아올 때마다 훑으면 소음이 된다
    const [scanned, setScanned] = useState<Set<number>>(new Set([0]));

    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });

    // 앞뒤로 여백을 둬 헤딩이 읽히고, 마지막 면이 충분히 머문 뒤 섹션을 빠져나간다
    const stageProgress = useTransform(scrollYProgress, [0.12, 0.94], [0, 1]);

    useMotionValueEvent(stageProgress, "change", (value) => {
        const index = faceIndexFromProgress(value, PRODUCTS.length);
        setActive(index);
        setScanned((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
    });

    const faces = PRODUCTS.map((product, index) => (
        <ProductFace
            key={product.id}
            product={product}
            index={index}
            scanned={scanned.has(index)}
        />
    ));

    const heading = <SectionHeading {...SECTIONS.products} />;

    return (
        <section id="products" className="relative">
            {/*
             * 넓은 화면 + 정밀 포인터: 스크롤이 회전을 만든다.
             * 좁은 화면에서는 카드 하나가 3D 면에 들어가지 않아 세로로 쌓는다.
             */}
            <div
                ref={pinRef}
                className="relative hidden h-[420vh] lg:motion-safe:block"
            >
                <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
                    <div className="container-x">
                        {heading}

                        {/*
                         * 여백을 넉넉히 둔다. 무대는 rotateX로 앞으로 기울어 있어서
                         * 카드 윗변이 실제 상자 높이보다 위로 올라온다 — mt-10에서는
                         * 그 윗변이 헤딩 설명문 마지막 줄을 덮었다.
                         */}
                        <div className="mt-16 flex items-start gap-10">
                            <ProductRail active={active} />

                            <RotaryStage
                                progress={stageProgress}
                                faces={faces}
                                activeIndex={active}
                                className="h-[clamp(24rem,46vh,30rem)] flex-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 좁은 화면: 회전 없이 세로 스택 */}
            <div className="section-y lg:motion-safe:hidden">
                <div className="container-x">
                    {heading}

                    <div className="mt-14 space-y-6">
                        {PRODUCTS.map((product, index) => (
                            <StackedProduct key={product.id} product={product} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/** 좌측 진행 레일. 지금 몇 번째 면인지 알려준다. */
function ProductRail({ active }: { active: number }) {
    return (
        <ul className="w-44 shrink-0 space-y-0.5 border-l border-border">
            {PRODUCTS.map((product, index) => (
                <li key={product.id} className="relative py-2.5 pl-5">
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
                            "ml-3 text-[15px] transition-colors duration-300",
                            active === index ? "text-bright" : "text-muted"
                        )}
                    >
                        {product.name}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/** 좁은 화면용 — 뷰포트에 들어오면 그 카드만 스캔한다. */
function StackedProduct({ product, index }: { product: Product; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setScanned(true);
                observer.disconnect();
            },
            { threshold: 0.35 }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: DUR.slow, ease: EASE.out }}
        >
            <ProductFace product={product} index={index} scanned={scanned} />
        </motion.div>
    );
}
