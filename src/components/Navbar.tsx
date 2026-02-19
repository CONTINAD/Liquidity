"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { siteConfig } from "../config/site.config";

const navLinks = [
    { href: "/", label: "Engine" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/mechanics", label: "Mechanics" },
    { href: "/media", label: "Media" },
    { href: "/whitepaper", label: "Whitepaper" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 glass-strong"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-aqua/10 border border-aqua/20 flex items-center justify-center group-hover:border-aqua/40 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-aqua">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 2.69 3 6s-1.34 6-3 6-3-2.69-3-6 1.34-6 3-6z"
                                fill="currentColor"
                                opacity="0.8"
                            />
                        </svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        <span className="text-aqua">{siteConfig.token.symbol}</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${isActive
                                    ? "text-aqua"
                                    : "text-muted hover:text-foreground"
                                    }`}
                            >
                                {link.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="navIndicator"
                                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-aqua rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <a
                        href={siteConfig.links.buy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 rounded-lg bg-aqua/10 border border-aqua/30 text-aqua text-sm font-semibold hover:bg-aqua/20 hover:border-aqua/50 transition-all duration-200"
                    >
                        Buy {siteConfig.token.symbol}
                    </a>
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden w-10 h-10 flex items-center justify-center text-muted hover:text-foreground"
                    aria-label="Toggle menu"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                        {mobileOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        ) : (
                            <>
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </>
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md:hidden border-t border-border"
                >
                    <div className="px-4 py-4 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                                    ? "bg-aqua/10 text-aqua"
                                    : "text-muted hover:text-foreground hover:bg-surface-light"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href={siteConfig.links.buy}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 px-4 py-3 rounded-lg bg-aqua/10 border border-aqua/30 text-aqua text-sm font-semibold text-center"
                        >
                            Buy {siteConfig.token.symbol}
                        </a>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
