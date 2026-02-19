"use client";

import { siteConfig } from "../config/site.config";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-surface/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded bg-aqua/10 border border-aqua/20 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-aqua">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 2.69 3 6s-1.34 6-3 6-3-2.69-3-6 1.34-6 3-6z" fill="currentColor" opacity="0.8" />
                                </svg>
                            </div>
                            <span className="font-bold text-aqua">{siteConfig.token.symbol}</span>
                        </div>
                        <p className="text-sm text-muted max-w-xs">
                            Fees don&apos;t disappear. They become depth. The engine converts activity into liquidity.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-foreground">Links</h4>
                        <div className="flex flex-col gap-2">
                            {[
                                { label: "DexScreener", href: siteConfig.links.dexscreener },
                                { label: "Birdeye", href: siteConfig.links.birdeye },
                                { label: "Telegram", href: siteConfig.links.telegram },
                                { label: "Twitter / X", href: siteConfig.links.twitter },
                            ].map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted hover:text-aqua transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Token */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-foreground">Token</h4>
                        <div className="space-y-2">
                            <div>
                                <span className="text-xs text-muted block mb-1">Mint Address</span>
                                <code className="text-xs mono text-aqua/70 break-all">{siteConfig.token.mint}</code>
                            </div>
                            <div>
                                <span className="text-xs text-muted block mb-1">LP Pair</span>
                                <code className="text-xs mono text-aqua/70 break-all">{siteConfig.token.pair}</code>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted">
                        © {new Date().getFullYear()} {siteConfig.token.symbol} — Liquidity Engine
                    </p>
                    <p className="text-xs text-muted/50">
                        Not financial advice. No profit guarantees. DYOR.
                    </p>
                </div>
            </div>
        </footer>
    );
}
