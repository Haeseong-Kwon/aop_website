import { NAV_ITEMS, PARTNERS, SITE } from "@/lib/constants";

export function Footer() {
    return (
        <footer className="relative border-t border-border">
            <div className="container-x py-16 md:py-20">
                <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <div>
                        <p className="font-mono text-lg tracking-[-0.02em]">{SITE.name}</p>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
                            {SITE.legalName} · {SITE.fullName}
                            <br />
                            AI 에이전트 제품과 원천기술.
                        </p>
                        <a
                            href={`mailto:${SITE.email}`}
                            className="underline-sweep mt-6 inline-block text-sm"
                        >
                            {SITE.email}
                        </a>
                    </div>

                    <nav aria-label="푸터 메뉴">
                        <p className="type-eyebrow">Sitemap</p>
                        <ul className="mt-5 space-y-3">
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
                        <ul className="mt-5 space-y-3">
                            {PARTNERS.map((partner) => (
                                <li key={partner.id} className="text-sm text-muted">
                                    {partner.name}
                                    <span className="ml-2 font-mono text-[11px] tracking-[0.14em]">
                                        {partner.relation}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-16 flex flex-col gap-3 border-t border-border pt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
                    </p>
                    <p>{SITE.slogan}</p>
                </div>
            </div>
        </footer>
    );
}
