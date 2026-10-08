"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
    AnimatePresence,
    motion,
    useInView,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { DetectionOverlay } from "@/components/visual/DetectionOverlay";
import { scrollToY } from "@/hooks/useLenis";
import { DUR, EASE } from "@/lib/motion";
import { PRODUCTS, SECTIONS, type Product } from "@/lib/constants";
import { cn } from "@/lib/utils";

// three 청크는 섹션에 가까워졌을 때만 받는다 — 히어로 씬과 같은 런타임을 공유한다
const ProductCarousel = dynamic(() => import("@/components/products/ProductCarousel"), {
    ssr: false,
});

const COUNT = PRODUCTS.length;
/** 스크롤 진행도 중 캐러셀이 실제로 도는 구간. 앞뒤 여백 동안 무대가 자리를 잡는다. */
const STAGE_RANGE: [number, number] = [0.06, 0.94];

type View = "gallery" | "index";

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
    const heading = <SectionHeading {...SECTIONS.products} />;

    return (
        <section id="products" className="relative">
            {/*
             * 넓은 화면 + 모션 허용: 곡면 캐러셀. 스크롤이 원통을 돌린다.
             * 좁은 화면에서는 카드가 원통 위에서 읽히지 않을 만큼 작아져 세로로 쌓는다.
             */}
            <div className="hidden lg:motion-safe:block">
                <ProductStage />
            </div>

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

/** 360° 갤러리 무대. 레퍼런스처럼 네 귀퉁이에만 UI를 두고 가운데는 작품에 내준다. */
function ProductStage() {
    const pinRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const [hovered, setHovered] = useState<number | null>(null);
    const [view, setView] = useState<View>("gallery");
    // 렌더 루프는 무대 근처에서만 돈다
    const isNear = useInView(pinRef, { margin: "100% 0px 100% 0px" });
    /*
     * 캔버스는 두 화면 앞에서 한 번 만들고 다시 부수지 않는다. 지나갈 때마다 내렸다
     * 올리면 컨텍스트·셰이더·텍스처 업로드를 매번 처음부터 해서 돌아올 때마다 늦다.
     */
    const shouldMount = useInView(pinRef, { margin: "200% 0px 200% 0px", once: true });
    const [isReady, setIsReady] = useState(false);
    const handleReady = useCallback(() => setIsReady(true), []);

    // 페이지가 한가해지면 three 청크와 캡처 이미지를 미리 받아 둔다 — 섹션에 닿았을 때는 이미 캐시에 있다
    useEffect(() => {
        const query = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
        if (!window.matchMedia(query).matches) return;

        const warm = () => {
            import("@/components/products/ProductCarousel")
                .then((mod) => mod.preloadProductTextures(PRODUCTS))
                .catch(() => {
                    // 미리 받기는 최적화일 뿐이다 — 실패하면 마운트 시점에 평소대로 받는다
                });
        };
        if ("requestIdleCallback" in window) {
            const handle = window.requestIdleCallback(warm, { timeout: 4000 });
            return () => window.cancelIdleCallback(handle);
        }
        const timer = setTimeout(warm, 2000);
        return () => clearTimeout(timer);
    }, []);

    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });
    const stageProgress = useTransform(scrollYProgress, STAGE_RANGE, [0, 1]);
    const barScale = useTransform(stageProgress, (value) => Math.min(1, Math.max(0, value)));

    // 클릭한 카드로 페이지 스크롤을 옮긴다. 회전의 주인은 언제나 스크롤이다.
    const scrollToCard = useCallback((index: number) => {
        const element = pinRef.current;
        if (!element) return;

        const top = element.getBoundingClientRect().top + window.scrollY;
        const range = element.offsetHeight - window.innerHeight;
        const [start, end] = STAGE_RANGE;
        const progress = start + (index / (COUNT - 1)) * (end - start);
        scrollToY(top + progress * range);
    }, []);

    const handleSelect = useCallback(
        (index: number) => {
            const product = PRODUCTS[index];
            if (index === active && product.link) {
                window.open(product.link, "_blank", "noopener,noreferrer");
                return;
            }
            scrollToCard(index);
        },
        [active, scrollToCard]
    );

    // 인덱스 보기에서 바깥 클릭 대신 Esc로 갤러리에 돌아온다
    useEffect(() => {
        if (view !== "index") return;
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setView("gallery");
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [view]);

    const product = PRODUCTS[active];
    const isGallery = view === "gallery";

    return (
        <div ref={pinRef} className="relative h-[460vh]">
            <div
                className="sticky top-0 h-[100svh] overflow-hidden"
                data-cursor={isGallery && hovered !== null ? "card" : undefined}
            >
                <motion.div
                    aria-hidden
                    className="absolute inset-0"
                    animate={{ opacity: isGallery ? 1 : 0, scale: isGallery ? 1 : 1.04 }}
                    transition={{ duration: DUR.slow, ease: EASE.out }}
                >
                    {shouldMount ? (
                        <ProductCarousel
                            products={PRODUCTS}
                            progress={stageProgress}
                            running={isNear && isGallery}
                            hoveredIndex={hovered}
                            onActive={setActive}
                            onHover={setHovered}
                            onSelect={handleSelect}
                            onReady={handleReady}
                            animate
                            className={cn(
                                "absolute inset-0 transition-opacity duration-1000 ease-out",
                                isReady ? "opacity-100" : "opacity-0"
                            )}
                        />
                    ) : null}
                    {/* 위아래 가장자리를 눌러 코너 UI가 카드 위에서도 읽히게 한다 */}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#000_0%,transparent_22%,transparent_70%,#000_100%)]" />
                </motion.div>

                {/* 상단 코너 */}
                <div className="container-x pointer-events-none relative flex items-start justify-between pt-28">
                    <div>
                        <p className="type-eyebrow">{SECTIONS.products.eyebrow}</p>
                        <h2 className="mt-4 max-w-[18ch] text-[clamp(1.5rem,2.3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-bright">
                            {SECTIONS.products.title}
                        </h2>
                    </div>

                    <ViewToggle view={view} onChange={setView} />
                </div>

                <AnimatePresence mode="wait">
                    {isGallery ? (
                        <GalleryCaption
                            key="caption"
                            product={product}
                            index={active}
                            barScale={barScale}
                        />
                    ) : (
                        <ProductIndex key="index" />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (view: View) => void }) {
    const options: { value: View; label: string }[] = [
        { value: "gallery", label: "Gallery" },
        { value: "index", label: "Index" },
    ];

    return (
        <div
            role="group"
            aria-label="제품 보기 방식"
            className="pointer-events-auto flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]"
        >
            {options.map((option, index) => (
                <span key={option.value} className="flex items-center gap-2">
                    {index > 0 ? <span className="text-faint">/</span> : null}
                    <button
                        type="button"
                        aria-pressed={view === option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "transition-colors duration-300",
                            view === option.value ? "text-bright" : "text-faint hover:text-muted"
                        )}
                    >
                        {option.label}
                    </button>
                </span>
            ))}
        </div>
    );
}

/** 하단 코너 — 지금 정면에 선 제품. 이름은 마스크 안에서 위로 갈아 끼운다. */
function GalleryCaption({
    product,
    index,
    barScale,
}: {
    product: Product;
    index: number;
    barScale: MotionValue<number>;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base }}
            className="container-x absolute inset-x-0 bottom-0 flex items-end justify-between gap-10 pb-10"
        >
            <div className="min-w-0" aria-live="polite">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-faint">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <StatusBadge status={product.status} />
                    {product.nameKo ? <span className="text-sm text-muted">{product.nameKo}</span> : null}
                </div>

                <div className="mt-3 overflow-hidden pb-[0.08em]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.h3
                            key={product.id}
                            initial={{ y: "105%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-105%" }}
                            transition={{ duration: DUR.slow, ease: EASE.out }}
                            className="text-[clamp(2.5rem,5vw,4.75rem)] font-semibold leading-[1] tracking-[-0.045em] text-bright"
                        >
                            {product.name}
                        </motion.h3>
                    </AnimatePresence>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                        key={product.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: DUR.base, ease: EASE.out }}
                        className="mt-3 max-w-[36rem] text-[clamp(1rem,1.2vw,1.125rem)] leading-snug tracking-[-0.015em] text-muted"
                    >
                        {product.tagline}
                    </motion.p>
                </AnimatePresence>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-5">
                {product.link ? (
                    <a
                        href={product.link}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group inline-flex items-center gap-1.5 text-sm font-medium text-bright"
                    >
                        <span className="underline-sweep">{product.domain} 방문</span>
                        <ArrowUpRight
                            size={15}
                            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                    </a>
                ) : (
                    <span className="text-sm text-muted">출시 준비 중</span>
                )}

                <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.18em] text-faint">
                    <span className="text-bright">{String(index + 1).padStart(2, "0")}</span>
                    <span className="relative h-px w-28 bg-border">
                        <motion.span
                            style={{ scaleX: barScale }}
                            className="absolute inset-0 origin-left bg-bright"
                        />
                    </span>
                    <span>{String(COUNT).padStart(2, "0")}</span>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * 인덱스 보기 — 이름만 문장처럼 이어 놓는다. 이름에 올리면 그 화면이 커서 곁에 뜬다.
 * 레퍼런스의 텍스트 목록에 미리보기를 더한 형태다: 목록이 길어도 무엇인지 바로 보인다.
 */
function ProductIndex() {
    const [preview, setPreview] = useState<number | null>(null);
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const x = useSpring(pointerX, { stiffness: 220, damping: 26, mass: 0.5 });
    const y = useSpring(pointerY, { stiffness: 220, damping: 26, mass: 0.5 });

    const stageRef = useRef<HTMLDivElement>(null);

    // 좌표는 무대 기준. 처음 뜰 때는 스프링을 건너뛰고 그 자리에 바로 놓는다 — 안 그러면 구석에서 날아온다.
    const placeAt = (clientX: number, clientY: number, jump: boolean) => {
        const bounds = stageRef.current?.getBoundingClientRect();
        if (!bounds) return;
        const nextX = clientX - bounds.left;
        const nextY = clientY - bounds.top;
        pointerX.set(nextX);
        pointerY.set(nextY);
        if (jump) {
            x.jump(nextX);
            y.jump(nextY);
        }
    };

    const show = (index: number, clientX: number, clientY: number) => {
        placeAt(clientX, clientY, preview === null);
        setPreview(index);
    };

    // 키보드 포커스에는 포인터 좌표가 없으니 이름 바로 위에 띄운다
    const showForElement = (index: number, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        show(index, rect.left + rect.width / 2, rect.top - rect.height * 0.6);
    };

    const previewProduct = preview === null ? null : PRODUCTS[preview];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base }}
            ref={stageRef}
            onPointerMove={(event) => placeAt(event.clientX, event.clientY, false)}
            className="absolute inset-0 flex items-center justify-center"
        >
            <AnimatePresence>
                {previewProduct ? (
                    <motion.div
                        key={previewProduct.id}
                        aria-hidden
                        style={{ x, y }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: DUR.base, ease: EASE.out }}
                        className="pointer-events-none absolute left-0 top-0 z-20 ml-8 -mt-[14rem] h-[12rem] w-[18rem] overflow-hidden rounded-xl border border-border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
                    >
                        <PreviewFace product={previewProduct} />
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <ul className="container-x relative z-10 flex max-w-[66rem] flex-wrap items-baseline justify-center gap-x-[0.3em] gap-y-1 text-center text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[1.15] tracking-[-0.04em]">
                {PRODUCTS.map((product, index) => {
                    const isDimmed = preview !== null && preview !== index;
                    const label = (
                        <>
                            {product.name}
                            {product.status === "coming-soon" ? (
                                <sup className="ml-1 font-mono text-[11px] tracking-[0.14em] text-faint">SOON</sup>
                            ) : null}
                        </>
                    );
                    const className = cn(
                        "transition-colors duration-300",
                        isDimmed ? "text-white/25" : "text-bright"
                    );
                    const isLast = index === COUNT - 1;

                    return (
                        <motion.li
                            key={product.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: DUR.slow, delay: 0.05 * index, ease: EASE.out }}
                            className="flex items-baseline gap-[0.3em]"
                            onPointerEnter={(event) => show(index, event.clientX, event.clientY)}
                            onPointerLeave={() => setPreview(null)}
                        >
                            {product.link ? (
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    onFocus={(event) => showForElement(index, event.currentTarget)}
                                    onBlur={() => setPreview(null)}
                                    className={className}
                                >
                                    {label}
                                </a>
                            ) : (
                                <span className={className}>{label}</span>
                            )}
                            {/* 구분점은 이름 뒤에 붙인다 — 줄이 바뀌어도 새 줄이 점으로 시작하지 않는다 */}
                            {isLast ? null : <span aria-hidden className="text-white/30">·</span>}
                        </motion.li>
                    );
                })}
            </ul>
        </motion.div>
    );
}

function PreviewFace({ product }: { product: Product }) {
    if (product.image) {
        return (
            <Image
                src={product.image}
                alt=""
                fill
                sizes="288px"
                className="object-cover object-top"
            />
        );
    }

    return (
        <div
            className="absolute inset-0"
            style={{
                backgroundImage: `radial-gradient(110% 120% at 18% 0%, ${product.hue[0]}, ${product.hue[1]})`,
            }}
        />
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
