import { NAV_ITEMS, PARTNERS, SITE } from "@/lib/constants";

export function Footer() {
    return (
        <footer className="relative border-t border-border bg-bg">
            <div className="container-x py-14 md:py-16">
                <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <div>
                        <p className="font-mono text-[17px] font-medium tracking-[-0.02em]">
                            {SITE.name}
                        </p>
                        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                            {SITE.legalName} · {SITE.fullName}
                            <br />
                            에이전트 제품을 운영하며 실행 기술을 연구합니다.
                        </p>
                        <a
                            href={`mailto:${SITE.email}`}
                            className="underline-sweep mt-5 inline-block text-sm"
                        >
                            {SITE.email}
                        </a>
                    </div>

                    <nav aria-label="푸터 메뉴">
                        <p className="type-eyebrow">Sitemap</p>
                        <ul className="mt-4 space-y-2.5">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        className="underline-sweep text-sm text-muted transition-colors hover:text-text"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div>
                        <p className="type-eyebrow">Network</p>
                        <ul className="mt-4 space-y-2.5">
                            {PARTNERS.map((partner) => (
                                <li
                                    key={partner.id}
                                    className="flex items-baseline gap-2 text-sm text-muted"
                                >
                                    {partner.name}
                                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                                        {partner.relation}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-14 flex flex-col gap-2 border-t border-border pt-7 font-mono text-[11px] tracking-[0.06em] text-faint sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
                    </p>
                    <p>{SITE.slogan}</p>
                </div>
            </div>
        </footer>
    );
}
