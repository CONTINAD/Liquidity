"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { siteConfig } from "../../config/site.config";
import { useEffect, useState, useRef } from "react";

/* ─── Helpers ─────────────────────────────────────────────────── */

const sections = [
    { id: "abstract", n: "01", label: "Abstract" },
    { id: "problem", n: "02", label: "Problem Statement" },
    { id: "engine", n: "03", label: "The Liquidity Engine" },
    { id: "architecture", n: "04", label: "Protocol Architecture" },
    { id: "fees", n: "05", label: "Fee Structure" },
    { id: "triggers", n: "06", label: "Trigger Mechanics" },
    { id: "safety", n: "07", label: "Safety Mechanisms" },
    { id: "tokenomics", n: "08", label: "Tokenomics" },
    { id: "game-theory", n: "09", label: "Game Theory" },
    { id: "transparency", n: "10", label: "Transparency" },
    { id: "roadmap", n: "11", label: "Roadmap" },
    { id: "risks", n: "12", label: "Risks & Disclaimers" },
];

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay, duration: 0.55, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

/* ─── Sidebar TOC ─────────────────────────────────────────────── */

function SidebarTOC({ activeId }: { activeId: string }) {
    return (
        <nav className="space-y-1">
            <span className="text-[10px] mono uppercase tracking-[0.2em] text-aqua/30 block mb-3 pl-3">
                Contents
            </span>
            {sections.map((s) => {
                const isActive = activeId === s.id;
                return (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-200 ${isActive
                            ? "bg-aqua/8 text-aqua border-l-2 border-aqua ml-[-1px]"
                            : "text-muted/50 hover:text-muted hover:bg-surface-light/50"
                            }`}
                    >
                        <span className={`mono text-[10px] w-4 flex-shrink-0 ${isActive ? "text-aqua" : "text-muted/30"}`}>
                            {s.n}
                        </span>
                        <span className="truncate">{s.label}</span>
                    </a>
                );
            })}
        </nav>
    );
}

/* ─── Section Header ──────────────────────────────────────────── */

function SectionHeader({ n, title, subtitle }: { n: string; title: string; subtitle?: string }) {
    return (
        <FadeIn>
            <div className="mb-10 pt-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-aqua/20 to-transparent" />
                    <span className="mono text-[11px] text-aqua/40 tracking-widest">SECTION {n}</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-aqua/20 to-transparent" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-3 text-base text-muted/70 max-w-2xl leading-relaxed">{subtitle}</p>
                )}
            </div>
        </FadeIn>
    );
}

/* ─── Callout Box ─────────────────────────────────────────────── */

function Callout({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "warning" | "quote" }) {
    const styles = {
        default: "border-aqua/15 bg-aqua/[0.03]",
        warning: "border-warning/20 bg-warning/[0.04]",
        quote: "border-aqua/10 bg-aqua/[0.02] italic",
    };
    return (
        <div className={`rounded-xl border p-5 sm:p-6 ${styles[variant]}`}>
            {children}
        </div>
    );
}

/* ─── Stat Card ───────────────────────────────────────────────── */

function StatGrid({ items }: { items: { label: string; value: string; sub?: string }[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {items.map((item) => (
                <FadeIn key={item.label}>
                    <div className="glass rounded-xl p-4 text-center border border-border/50 hover:border-aqua/20 transition-colors">
                        <div className="mono text-xl sm:text-2xl font-bold text-foreground">{item.value}</div>
                        <div className="text-xs text-muted mt-1 uppercase tracking-wide">{item.label}</div>
                        {item.sub && <div className="text-[10px] text-aqua/40 mt-0.5">{item.sub}</div>}
                    </div>
                </FadeIn>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
/*                        PAGE COMPONENT                          */
/* ═══════════════════════════════════════════════════════════════ */

export default function WhitepaperPage() {
    const [activeSection, setActiveSection] = useState("abstract");
    const containerRef = useRef<HTMLDivElement>(null);

    // Reading progress bar
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Track active section
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) setActiveSection(visible[0].target.id);
            },
            { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
        );

        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* Reading progress bar */}
            <motion.div
                className="fixed top-16 left-0 right-0 h-[2px] bg-aqua/80 origin-left z-40"
                style={{ scaleX }}
            />

            <div className="relative max-w-[1440px] mx-auto" ref={containerRef}>
                {/* Left sidebar — sticky TOC (wide desktop only) */}
                <aside className="hidden 2xl:block fixed left-[max(2rem,calc((100vw-1440px)/2))] top-28 w-52 z-30">
                    <SidebarTOC activeId={activeSection} />
                </aside>

                {/* Right decorative line */}
                <div className="hidden 2xl:block fixed right-[max(2rem,calc((100vw-1440px)/2+1rem))] top-28 bottom-28 w-px z-30">
                    <div className="h-full bg-gradient-to-b from-transparent via-aqua/8 to-transparent" />
                </div>

                {/* Main content — wide reading column */}
                <article className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 2xl:ml-72 2xl:mr-auto py-16 sm:py-24">

                    {/* ═══ COVER ═══ */}
                    <FadeIn>
                        <header className="text-center mb-24">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.7 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-aqua/15 bg-aqua/5 text-xs mono text-aqua/70 mb-8">
                                    <span className="w-1.5 h-1.5 rounded-full bg-aqua animate-pulse" />
                                    WHITEPAPER v1.0
                                </div>

                                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6">
                                    <span className="text-gradient block">{siteConfig.token.symbol}</span>
                                    <span className="text-foreground block mt-1">Liquidity</span>
                                    <span className="text-foreground block">Engine</span>
                                </h1>

                                <p className="text-lg sm:text-xl text-muted/70 max-w-xl mx-auto leading-relaxed font-light">
                                    A self-reinforcing on-chain protocol that converts trading fees into
                                    permanent liquidity depth.
                                </p>

                                <div className="flex items-center justify-center gap-6 mt-10 text-xs mono text-muted/40">
                                    <span>SOLANA</span>
                                    <span className="w-1 h-1 rounded-full bg-muted/20" />
                                    <span>SPL TOKEN</span>
                                    <span className="w-1 h-1 rounded-full bg-muted/20" />
                                    <span>FEB 2025</span>
                                </div>
                            </motion.div>

                            {/* Decorative divider */}
                            <div className="mt-16 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-aqua/15" />
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-aqua/20" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-aqua/40" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-aqua/20" />
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-aqua/15" />
                            </div>
                        </header>
                    </FadeIn>

                    {/* ═══ MOBILE TOC ═══ */}
                    <FadeIn>
                        <div className="2xl:hidden glass rounded-2xl p-6 border border-border/50 mb-20">
                            <h3 className="text-[11px] mono uppercase tracking-[0.2em] text-aqua/40 mb-4">Table of Contents</h3>
                            <div className="grid sm:grid-cols-2 gap-1">
                                {sections.map((s) => (
                                    <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted/60 hover:text-foreground hover:bg-surface-light/50 transition-colors">
                                        <span className="mono text-[10px] text-aqua/30 w-5">{s.n}</span>
                                        <span>{s.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </FadeIn>


                    {/* ═══ 01. ABSTRACT ═══ */}
                    <section id="abstract" className="mb-24 scroll-mt-24">
                        <SectionHeader n="01" title="Abstract" />
                        <div className="prose-body space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <p>
                                    <span className="text-foreground font-semibold">{siteConfig.token.symbol}</span> introduces the <strong className="text-foreground">Liquidity Engine</strong> — a
                                    deterministic, on-chain mechanism that captures protocol trading fees and autonomously converts them into
                                    market buybacks and permanent liquidity pool additions.
                                </p>
                            </FadeIn>
                            <FadeIn>
                                <p>
                                    Unlike traditional token models where fees are extracted from the ecosystem, {siteConfig.token.symbol}&apos;s architecture
                                    recycles every fee back into the token&apos;s liquidity infrastructure. The result is a self-reinforcing system
                                    where trading activity directly and verifiably deepens market depth.
                                </p>
                            </FadeIn>
                            <FadeIn>
                                <p>
                                    Every action of the engine — accumulation, buyback execution, and LP addition — is an on-chain transaction,
                                    publicly verifiable by any participant at any time. There are no custodial intermediaries, no off-chain
                                    processes, and no human discretion in execution.
                                </p>
                            </FadeIn>
                            <FadeIn>
                                <Callout variant="quote">
                                    <p className="text-aqua/70 mono text-sm leading-relaxed">
                                        &quot;Fees don&apos;t disappear. They become depth. The engine converts activity into liquidity.&quot;
                                    </p>
                                </Callout>
                            </FadeIn>
                            <FadeIn>
                                <StatGrid items={[
                                    { label: "Fee Allocation", value: "100%", sub: "to engine" },
                                    { label: "Buyback", value: `${siteConfig.engine.buybackPct}%`, sub: "of fees" },
                                    { label: "LP Addition", value: `${siteConfig.engine.lpAddPct}%`, sub: "of fees" },
                                    { label: "Team Take", value: "0%", sub: "extraction" },
                                ]} />
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 02. PROBLEM ═══ */}
                    <section id="problem" className="mb-24 scroll-mt-24">
                        <SectionHeader n="02" title="Problem Statement" subtitle="The structural liquidity crisis facing Solana memecoins." />
                        <div className="space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <p>
                                    The memecoin ecosystem on Solana faces a structural liquidity problem. Most tokens launch with
                                    thin liquidity pools, creating several cascading failures:
                                </p>
                            </FadeIn>

                            <FadeIn>
                                <div className="grid sm:grid-cols-2 gap-4 my-8">
                                    {[
                                        { icon: "📉", title: "High Slippage", desc: "Thin pools cause significant price impact on even modest trades, discouraging participation and creating unfair execution." },
                                        { icon: "💥", title: "Fragile Markets", desc: "A single large sell can drain the pool, causing cascading liquidations, panic sells, and permanent confidence loss." },
                                        { icon: "💸", title: "Fee Extraction", desc: "Most protocols extract fees to team wallets, permanently removing capital from the ecosystem that supported it." },
                                        { icon: "🔒", title: "Trust Deficit", desc: "Off-chain fee handling creates information asymmetry — holders can't verify where their fees actually go." },
                                    ].map((item) => (
                                        <div key={item.title} className="glass rounded-xl p-5 border border-border/50 hover:border-aqua/15 transition-all duration-300 group">
                                            <span className="text-2xl block mb-3">{item.icon}</span>
                                            <h4 className="text-sm font-bold text-foreground mb-2 group-hover:text-aqua transition-colors">{item.title}</h4>
                                            <p className="text-xs text-muted/70 leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>

                            <FadeIn>
                                <Callout>
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        <strong className="text-aqua">Core insight:</strong> Liquidity itself is the most valuable product a token protocol can offer.
                                        Deeper liquidity reduces execution risk, enables larger position sizes, and creates a more stable,
                                        tradeable market structure. Instead of treating fees as revenue to be extracted, the Liquidity Engine
                                        treats them as <strong className="text-foreground">fuel to be recycled into the very infrastructure
                                            that makes the token tradeable.</strong>
                                    </p>
                                </Callout>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 03. ENGINE ═══ */}
                    <section id="engine" className="mb-24 scroll-mt-24">
                        <SectionHeader n="03" title="The Liquidity Engine" subtitle="A closed-loop system with four sequential phases." />
                        <div className="space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <div className="glass glow-border rounded-2xl p-6 sm:p-8 border border-border/50 my-8">
                                    <div className="space-y-0">
                                        {[
                                            {
                                                phase: "Fee Collection",
                                                desc: "Every trade generates a protocol fee denominated in SOL, automatically routed to the Accumulator Wallet — a publicly visible on-chain address.",
                                                detail: "The fee rate is fixed at the protocol level. No exemptions, no variable rates, no hidden allocations.",
                                                color: "from-aqua/30 to-aqua/10",
                                            },
                                            {
                                                phase: "Accumulation",
                                                desc: "The Accumulator Wallet acts as a transparent reservoir. Its balance grows with every trade. Its current state is readable by anyone via standard Solana RPC calls.",
                                                detail: `Once the wallet balance reaches the trigger threshold (${siteConfig.engine.triggerThresholdSOL} SOL), the engine enters execution phase.`,
                                                color: "from-aqua/25 to-aqua/8",
                                            },
                                            {
                                                phase: "Auto-Buyback",
                                                desc: `${siteConfig.engine.buybackPct}% of accumulated balance executes a market buy of ${siteConfig.token.symbol} tokens through the existing liquidity pool — a standard swap subject to the same market conditions as any other trade.`,
                                                detail: "Creates genuine buy pressure sourced entirely from protocol fees — not from new capital or inflationary emissions.",
                                                color: "from-aqua/20 to-aqua/5",
                                            },
                                            {
                                                phase: "Auto-LP Addition",
                                                desc: `The remaining ${siteConfig.engine.lpAddPct}% of accumulated SOL is paired with a corresponding amount of ${siteConfig.token.symbol} tokens and added to the liquidity pool as a new LP position.`,
                                                detail: "Directly increases pool depth, reducing slippage for all future trades and creating a more stable market structure.",
                                                color: "from-aqua/15 to-aqua/3",
                                            },
                                        ].map((item, i) => (
                                            <FadeIn key={item.phase} delay={i * 0.08}>
                                                <div className="flex gap-5 group">
                                                    <div className="flex flex-col items-center flex-shrink-0">
                                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} border border-aqua/15 flex items-center justify-center shadow-lg shadow-aqua/5 group-hover:shadow-aqua/15 transition-shadow`}>
                                                            <span className="mono text-sm font-black text-aqua">{i + 1}</span>
                                                        </div>
                                                        {i < 3 && (
                                                            <div className="w-px h-full min-h-[40px] bg-gradient-to-b from-aqua/15 to-transparent mt-2" />
                                                        )}
                                                    </div>
                                                    <div className="pb-8">
                                                        <h4 className="text-base font-bold text-foreground mb-2 group-hover:text-aqua transition-colors">
                                                            Phase {i + 1} — {item.phase}
                                                        </h4>
                                                        <p className="text-sm text-muted/70 leading-relaxed mb-2">{item.desc}</p>
                                                        <p className="text-xs text-muted/40 italic leading-relaxed">{item.detail}</p>
                                                    </div>
                                                </div>
                                            </FadeIn>
                                        ))}
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn>
                                <p>
                                    After execution, the Accumulator resets to zero and the cycle begins again. The engine operates as a
                                    perpetual loop:
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-4 text-sm mono">
                                    {["FEES", "ACCUMULATE", "BUY", "ADD LP", "DEEPER POOL", "BETTER EXECUTION", "MORE VOLUME"].map((step, i) => (
                                        <span key={step} className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-md bg-aqua/8 border border-aqua/15 text-aqua text-xs font-semibold">{step}</span>
                                            {i < 6 && <span className="text-aqua/30">→</span>}
                                        </span>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 04. ARCHITECTURE ═══ */}
                    <section id="architecture" className="mb-24 scroll-mt-24">
                        <SectionHeader n="04" title="Protocol Architecture" subtitle="Three primary on-chain components built on Solana." />
                        <div className="space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <div className="space-y-4 my-8">
                                    {[
                                        {
                                            title: "Token Contract",
                                            desc: "Standard SPL token with integrated fee-on-transfer logic. Every transfer triggers a fee calculation that routes the fee portion to the Accumulator.",
                                            specs: ["SPL Token Standard", "Fixed fee rate", "Mint authority renounced", "Freeze authority renounced"],
                                        },
                                        {
                                            title: "Accumulator Wallet",
                                            desc: "A program-derived address (PDA) that holds accumulated fees. Its balance is publicly readable and serves as the engine's 'fuel gauge.'",
                                            specs: ["Publicly auditable", "No manual withdrawal", "Threshold-based trigger", "Full on-chain history"],
                                        },
                                        {
                                            title: "Engine Executor",
                                            desc: "A permissionless instruction that anyone can call once the threshold is met. Executes buyback swap and LP addition in a single atomic transaction.",
                                            specs: ["Permissionless execution", "Atomic swap + LP", "Slippage protection", "Cooldown enforcement"],
                                        },
                                    ].map((c, i) => (
                                        <FadeIn key={c.title} delay={i * 0.05}>
                                            <div className="glass rounded-xl p-6 border border-border/50 hover:border-aqua/15 transition-all duration-300 group">
                                                <h4 className="text-base font-bold text-foreground mb-2 group-hover:text-aqua transition-colors">{c.title}</h4>
                                                <p className="text-sm text-muted/70 mb-4 leading-relaxed">{c.desc}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {c.specs.map((spec) => (
                                                        <span key={spec} className="text-[10px] mono px-2 py-0.5 rounded-md bg-surface-light/60 text-aqua/50 border border-border/50">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </FadeIn>
                                    ))}
                                </div>
                            </FadeIn>

                            <FadeIn>
                                <h3 className="text-xl font-bold text-foreground mt-10 mb-5">Transaction Flow</h3>
                                <div className="glass rounded-xl p-6 border border-border/50">
                                    <ol className="space-y-3 text-sm text-muted/70">
                                        {[
                                            "Verify accumulator balance ≥ threshold",
                                            "Verify cooldown period has elapsed",
                                            `Calculate buyback amount (${siteConfig.engine.buybackPct}% of balance)`,
                                            `Execute swap: SOL → ${siteConfig.token.symbol} via AMM with max slippage guard`,
                                            `Calculate LP amounts (${siteConfig.engine.lpAddPct}% SOL + proportional tokens)`,
                                            "Add liquidity to pool",
                                            "Reset accumulator balance → 0",
                                            "Emit event log with execution details",
                                        ].map((step, i) => (
                                            <li key={i} className="flex gap-4 items-start">
                                                <span className="mono text-[10px] text-aqua/30 mt-1 w-6 flex-shrink-0 text-right">IX{i + 1}</span>
                                                <span className="leading-relaxed">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    <p className="text-xs text-muted/40 mt-4 pt-4 border-t border-border/30 italic">
                                        The entire sequence executes atomically — either all instructions succeed or the entire transaction reverts.
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 05. FEES ═══ */}
                    <section id="fees" className="mb-24 scroll-mt-24">
                        <SectionHeader n="05" title="Fee Structure & Allocation" subtitle="100% of fees go to the engine. Zero team extraction." />
                        <div className="space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <div className="glass glow-border rounded-2xl p-6 sm:p-8 border border-border/50 my-8">
                                    <h4 className="text-[11px] mono uppercase tracking-[0.2em] text-aqua/40 mb-8">Allocation Breakdown</h4>

                                    <div className="relative h-14 rounded-xl overflow-hidden bg-surface-light mb-8">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${siteConfig.engine.buybackPct}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-aqua to-aqua/70 flex items-center justify-center"
                                        >
                                            <span className="text-xs mono font-black text-background">BUYBACK — {siteConfig.engine.buybackPct}%</span>
                                        </motion.div>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${siteConfig.engine.lpAddPct}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                                            className="absolute top-0 h-full bg-gradient-to-r from-aqua/40 to-aqua/25 flex items-center justify-center"
                                            style={{ left: `${siteConfig.engine.buybackPct}%` }}
                                        >
                                            <span className="text-xs mono font-black text-foreground/80">LP — {siteConfig.engine.lpAddPct}%</span>
                                        </motion.div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <h5 className="text-sm font-bold text-foreground mb-2">Buyback — {siteConfig.engine.buybackPct}%</h5>
                                            <p className="text-xs text-muted/60 leading-relaxed">
                                                The majority allocation goes to market buybacks. This creates direct buy pressure from organic
                                                protocol revenue, executed through the same AMM and price discovery as any other trade.
                                            </p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-foreground mb-2">LP Addition — {siteConfig.engine.lpAddPct}%</h5>
                                            <p className="text-xs text-muted/60 leading-relaxed">
                                                The remaining allocation is paired with {siteConfig.token.symbol} tokens and deposited into the pool,
                                                directly increasing TVL and reducing price impact for all subsequent trades.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn>
                                <h3 className="text-xl font-bold text-foreground mt-10 mb-5">Key Properties</h3>
                                <ul className="space-y-3">
                                    {[
                                        "100% of fees go to the engine — zero team allocation, zero marketing wallet, zero treasury extraction.",
                                        "The allocation ratio is fixed at the protocol level and cannot be changed after deployment.",
                                        "Fee routing is enforced by the token contract — it cannot be bypassed or redirected.",
                                        "All fee transactions are standard Solana transfers, fully visible on any block explorer.",
                                    ].map((item, i) => (
                                        <FadeIn key={i} delay={i * 0.04}>
                                            <li className="flex gap-3 text-sm text-muted/70">
                                                <span className="text-aqua mt-0.5 flex-shrink-0">◆</span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        </FadeIn>
                                    ))}
                                </ul>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 06. TRIGGERS ═══ */}
                    <section id="triggers" className="mb-24 scroll-mt-24">
                        <SectionHeader n="06" title="Trigger Mechanics" subtitle="Threshold-based batching for maximum impact per execution." />
                        <div className="space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <div className="grid sm:grid-cols-2 gap-4 my-8">
                                    <div className="glass rounded-xl p-5 border border-border/50">
                                        <h4 className="text-sm font-bold text-foreground mb-3">Why Batch Execution?</h4>
                                        <ul className="space-y-2 text-xs text-muted/60">
                                            <li className="flex gap-2"><span className="text-aqua/40">•</span> Reduces gas costs per unit of liquidity added</li>
                                            <li className="flex gap-2"><span className="text-aqua/40">•</span> Creates meaningful price impact per buyback</li>
                                            <li className="flex gap-2"><span className="text-aqua/40">•</span> Prevents MEV sandwich attacks on micro-txs</li>
                                            <li className="flex gap-2"><span className="text-aqua/40">•</span> Produces clear, auditable on-chain events</li>
                                        </ul>
                                    </div>
                                    <div className="glass rounded-xl p-5 border border-aqua/10">
                                        <h4 className="text-sm font-bold text-foreground mb-3">Current Parameters</h4>
                                        <div className="space-y-2.5 text-xs">
                                            {[
                                                { k: "Trigger Threshold", v: `${siteConfig.engine.triggerThresholdSOL} SOL` },
                                                { k: "Cooldown Period", v: `${siteConfig.engine.cooldownSeconds}s` },
                                                { k: "Max Slippage", v: `${siteConfig.engine.maxSlippageBps / 100}%` },
                                                { k: "Execution Mode", v: "Permissionless" },
                                            ].map((p) => (
                                                <div key={p.k} className="flex justify-between">
                                                    <span className="text-muted/50">{p.k}</span>
                                                    <span className="mono text-foreground font-semibold">{p.v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn>
                                <h3 className="text-xl font-bold text-foreground mt-10 mb-5">Trigger Types</h3>
                                <div className="space-y-3">
                                    {[
                                        { type: "Threshold Trigger", mode: "Primary", status: "Active", desc: `Fires when the accumulator reaches ${siteConfig.engine.triggerThresholdSOL} SOL. Default and most common trigger. Ensures every execution has sufficient volume for meaningful impact.` },
                                        { type: "Time-Based Trigger", mode: "Secondary", status: "Planned", desc: "If the accumulator hasn't triggered within a configurable window (e.g., 24h), the engine fires regardless of balance. Prevents idle funds during low-volume periods." },
                                        { type: "Manual Trigger", mode: "Emergency", status: "Available", desc: "A governance multisig can force-trigger the engine at any balance. Reserved for edge cases like protocol migration or emergency liquidity events." },
                                    ].map((t) => (
                                        <FadeIn key={t.type}>
                                            <div className="glass rounded-xl p-5 border border-border/50 hover:border-aqua/15 transition-all group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-foreground group-hover:text-aqua transition-colors">{t.type}</h4>
                                                        <span className="text-[10px] mono text-muted/30">{t.mode}</span>
                                                    </div>
                                                    <span className={`text-[10px] mono px-2 py-0.5 rounded-md ${t.status === "Active" ? "bg-aqua/10 text-aqua border border-aqua/15" :
                                                        t.status === "Planned" ? "bg-surface-light text-muted/50 border border-border/50" :
                                                            "bg-warning/10 text-warning border border-warning/15"
                                                        }`}>{t.status}</span>
                                                </div>
                                                <p className="text-xs text-muted/60 leading-relaxed">{t.desc}</p>
                                            </div>
                                        </FadeIn>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 07. SAFETY ═══ */}
                    <section id="safety" className="mb-24 scroll-mt-24">
                        <SectionHeader n="07" title="Safety Mechanisms" subtitle="Multiple layers of protection for automated on-chain execution." />
                        <div className="space-y-4 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            {[
                                { name: "Slippage Guard", icon: "🛡", desc: `Every buyback enforces max ${siteConfig.engine.maxSlippageBps / 100}% slippage tolerance. If the pool can't fill within tolerance, the entire transaction reverts.`, tech: "Minimum output amount check on swap instruction. Expected output calculated from current reserves with percentage discount tolerance." },
                                { name: "Cooldown Timer", icon: "⏱", desc: `${siteConfig.engine.cooldownSeconds}s cooldown after each trigger. Prevents rapid-fire execution during high-volume periods that could cause excessive price impact.`, tech: "Last execution timestamp stored on-chain. Each trigger verifies current slot timestamp exceeds stored + cooldown." },
                                { name: "Circuit Breaker", icon: "⚡", desc: "Auto-pauses all triggers if pool liquidity drops below critical threshold or abnormal price movement is detected.", tech: "Monitors pool reserves and oracle feeds. Triggers if reserves < 20% of 24h average or price deviates > 50% from TWAP." },
                                { name: "Emergency Pause", icon: "🔒", desc: "Governance multisig (3-of-5) can pause the entire engine for discovered vulnerabilities or black swan events.", tech: "Pause state in global config PDA. All trigger instructions fail when paused. Unpause requires same multisig threshold." },
                                { name: "Atomic Execution", icon: "⚛️", desc: "Buyback, LP addition, and reset execute in a single atomic transaction. If any step fails, everything reverts — no partial states.", tech: "All instructions composed in single Solana transaction via CPI calls. Program enforces instruction ordering and state consistency." },
                            ].map((m, i) => (
                                <FadeIn key={m.name} delay={i * 0.04}>
                                    <div className="glass rounded-xl p-5 sm:p-6 border border-border/50 hover:border-aqua/10 transition-all group">
                                        <div className="flex gap-4">
                                            <span className="text-2xl flex-shrink-0">{m.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-foreground mb-1.5 group-hover:text-aqua transition-colors">{m.name}</h4>
                                                <p className="text-sm text-muted/60 leading-relaxed mb-3">{m.desc}</p>
                                                <div className="p-3 rounded-lg bg-surface-light/50 border border-border/30">
                                                    <span className="text-[10px] mono text-aqua/30 mr-1">IMPLEMENTATION:</span>
                                                    <span className="text-[11px] text-muted/40 leading-relaxed">{m.tech}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </section>


                    {/* ═══ 08. TOKENOMICS ═══ */}
                    <section id="tokenomics" className="mb-24 scroll-mt-24">
                        <SectionHeader n="08" title="Tokenomics" subtitle="Simple. Transparent. No hidden allocations." />
                        <div className="space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <div className="glass glow-border rounded-2xl p-6 sm:p-8 border border-border/50 my-8">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-[11px] mono uppercase tracking-[0.2em] text-aqua/40 mb-5">Supply Details</h4>
                                            <div className="space-y-4">
                                                {[
                                                    { label: "Total Supply", value: "1,000,000,000", mono: true },
                                                    { label: "Decimals", value: String(siteConfig.token.decimals), mono: true },
                                                    { label: "Mint Authority", value: "Renounced", danger: true },
                                                    { label: "Freeze Authority", value: "Renounced", danger: true },
                                                ].map((item) => (
                                                    <div key={item.label} className="flex justify-between text-sm items-center">
                                                        <span className="text-muted/50">{item.label}</span>
                                                        <span className={`font-bold ${item.danger ? "text-red-400/80" : "text-foreground"} ${item.mono ? "mono" : ""}`}>
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] mono uppercase tracking-[0.2em] text-aqua/40 mb-5">Distribution</h4>
                                            <div className="space-y-4">
                                                {[
                                                    { label: "Liquidity Pool", pct: 85, color: "bg-aqua/60" },
                                                    { label: "Community & Marketing", pct: 10, color: "bg-aqua/30" },
                                                    { label: "Development Reserve", pct: 5, color: "bg-metal/50" },
                                                ].map((item) => (
                                                    <div key={item.label}>
                                                        <div className="flex justify-between text-sm mb-1.5">
                                                            <span className="text-muted/60">{item.label}</span>
                                                            <span className="mono text-foreground font-bold">{item.pct}%</span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-surface-light overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                whileInView={{ width: `${item.pct}%` }}
                                                                viewport={{ once: true }}
                                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                                className={`h-full rounded-full ${item.color}`}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn>
                                <h3 className="text-xl font-bold text-foreground mt-10 mb-5">Deflationary Pressure</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-sm text-muted/70">
                                        <span className="text-aqua flex-shrink-0 mt-0.5 font-bold">1.</span>
                                        <span className="leading-relaxed"><strong className="text-foreground">Buyback removal:</strong> Tokens purchased via buybacks are permanently placed in LP, reducing circulating supply available for trading.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm text-muted/70">
                                        <span className="text-aqua flex-shrink-0 mt-0.5 font-bold">2.</span>
                                        <span className="leading-relaxed"><strong className="text-foreground">LP lock:</strong> LP tokens generated by the engine are burned or locked permanently, preventing liquidity withdrawal and ensuring pool depth is permanent.</span>
                                    </li>
                                </ul>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 09. GAME THEORY ═══ */}
                    <section id="game-theory" className="mb-24 scroll-mt-24">
                        <SectionHeader n="09" title="Game Theory & Incentives" subtitle="Self-reinforcing mechanics that align all participants." />
                        <div className="space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <div className="glass glow-border rounded-2xl p-6 sm:p-8 border border-border/50 my-8">
                                    <h4 className="text-[11px] mono uppercase tracking-[0.2em] text-aqua/40 mb-6">The Flywheel Effect</h4>
                                    <div className="space-y-3">
                                        {[
                                            { step: "More trading volume", result: "More fees collected" },
                                            { step: "More fees collected", result: "More frequent engine triggers" },
                                            { step: "More engine triggers", result: "More buybacks + LP additions" },
                                            { step: "More LP additions", result: "Deeper liquidity pool" },
                                            { step: "Deeper liquidity", result: "Lower slippage for traders" },
                                            { step: "Lower slippage", result: "More attractive to trade → More volume" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm group">
                                                <div className="w-7 h-7 rounded-lg bg-aqua/8 border border-aqua/10 flex items-center justify-center flex-shrink-0 group-hover:bg-aqua/15 transition-colors">
                                                    <span className="mono text-[10px] text-aqua/60">{i + 1}</span>
                                                </div>
                                                <span className="text-foreground/80">{item.step}</span>
                                                <span className="text-aqua/30 mono text-xs">→</span>
                                                <span className="text-muted/50">{item.result}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn>
                                <h3 className="text-xl font-bold text-foreground mt-10 mb-5">Participant Incentive Matrix</h3>
                                <div className="glass rounded-xl border border-border/50 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-[10px] text-aqua/30 mono uppercase border-b border-border/30 bg-surface-light/30">
                                                <th className="p-4">Participant</th>
                                                <th className="p-4">Action</th>
                                                <th className="p-4">Benefit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-muted/60">
                                            {[
                                                { who: "Traders", action: "Buy / Sell", benefit: "Every trade deepens the pool they trade in" },
                                                { who: "Holders", action: "Hold", benefit: "Pool depth and structural support increase over time" },
                                                { who: "LPs", action: "Provide liquidity", benefit: "Engine adds LP alongside, reducing IL concentration" },
                                                { who: "Bot Operators", action: "Trigger engine", benefit: "Gas refund + priority for executing trigger txs" },
                                            ].map((row, i) => (
                                                <tr key={row.who} className={`${i < 3 ? "border-b border-border/20" : ""} hover:bg-surface-light/30 transition-colors`}>
                                                    <td className="p-4 text-foreground font-semibold">{row.who}</td>
                                                    <td className="p-4">{row.action}</td>
                                                    <td className="p-4">{row.benefit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 10. TRANSPARENCY ═══ */}
                    <section id="transparency" className="mb-24 scroll-mt-24">
                        <SectionHeader n="10" title="On-Chain Transparency" subtitle="Every aspect is publicly verifiable on Solana." />
                        <div className="space-y-5 text-[15px] sm:text-base text-muted/80 leading-[1.8]">
                            <FadeIn>
                                <div className="glass glow-border rounded-2xl p-6 sm:p-8 border border-border/50 my-8">
                                    <div className="space-y-4">
                                        {[
                                            { label: "Accumulator Wallet", value: siteConfig.engine.accumulatorWallet, desc: "View current balance and all incoming fee transfers" },
                                            { label: "Token Mint", value: siteConfig.token.mint, desc: "Verify supply, authorities, and holder distribution" },
                                            { label: "LP Pair Address", value: siteConfig.token.pair, desc: "Check pool TVL, LP additions, and historical depth" },
                                        ].map((item) => (
                                            <div key={item.label} className="p-4 rounded-lg bg-surface-light/40 border border-border/30 hover:border-aqua/10 transition-colors">
                                                <div className="text-sm font-bold text-foreground mb-1">{item.label}</div>
                                                <code className="text-[11px] mono text-aqua/50 break-all block mb-1.5">{item.value}</code>
                                                <span className="text-[11px] text-muted/40">{item.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn>
                                <h3 className="text-xl font-bold text-foreground mt-10 mb-5">Verification Methods</h3>
                                <ul className="space-y-3">
                                    {[
                                        "Check the accumulator wallet balance on Solscan at any time to see how close the engine is to firing.",
                                        "Every engine transaction includes a full event log with buyback amount, LP amount, and pool reserves.",
                                        "The live dashboard at /dashboard displays all engine events with clickable transaction links.",
                                        "Pool TVL can be independently verified on DexScreener or Birdeye — it should increase monotonically over time.",
                                        "Transaction history provides a complete audit trail of all fee collections and engine executions.",
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-muted/60">
                                            <span className="text-aqua/50 flex-shrink-0 mt-0.5">✓</span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ 11. ROADMAP ═══ */}
                    <section id="roadmap" className="mb-24 scroll-mt-24">
                        <SectionHeader n="11" title="Roadmap" subtitle="Phased development building toward Engine-as-a-Service." />
                        <div className="space-y-4">
                            {[
                                {
                                    phase: "Phase 1 — Genesis", status: "Complete", color: "border-green-500/20 bg-green-500/[0.03]", badge: "bg-green-500/10 text-green-400 border-green-500/15", check: true,
                                    items: ["Token deployment on Solana (SPL)", "Initial liquidity provisioning", "Engine smart contract deployment", "Website and dashboard launch", "Community formation (TG, X)"]
                                },
                                {
                                    phase: "Phase 2 — Engine Activation", status: "In Progress", color: "border-aqua/15 bg-aqua/[0.03]", badge: "bg-aqua/10 text-aqua border-aqua/15", check: false,
                                    items: ["Live engine activation with real fee routing", "Dashboard connected to on-chain data", "First public engine trigger event", "Community bot for trigger notifications", "Third-party verification tools"]
                                },
                                {
                                    phase: "Phase 3 — Optimization", status: "Planned", color: "border-border/40 bg-surface-light/20", badge: "bg-surface-light text-muted/40 border-border/30", check: false,
                                    items: ["Dynamic threshold adjustment based on volume", "Multi-pool engine support (Raydium + Orca)", "Gas-optimized engine executor", "Open-source SDK for engine integrations", "Governance framework for parameter updates"]
                                },
                                {
                                    phase: "Phase 4 — Expansion", status: "Planned", color: "border-border/40 bg-surface-light/20", badge: "bg-surface-light text-muted/40 border-border/30", check: false,
                                    items: ["Engine-as-a-Service for other tokens", "Cross-DEX liquidity aggregation", "Advanced analytics dashboard", "Partnership integrations", "Protocol revenue sharing exploration"]
                                },
                            ].map((p, i) => (
                                <FadeIn key={p.phase} delay={i * 0.06}>
                                    <div className={`rounded-xl p-6 border ${p.color} transition-all`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-base font-bold text-foreground">{p.phase}</h4>
                                            <span className={`text-[10px] mono px-2.5 py-0.5 rounded-md border ${p.badge}`}>{p.status}</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {p.items.map((item, j) => (
                                                <li key={j} className="flex gap-2.5 text-xs text-muted/60">
                                                    <span className={p.check ? "text-green-400" : "text-muted/20"}>{p.check ? "✓" : "○"}</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </section>


                    {/* ═══ 12. RISKS ═══ */}
                    <section id="risks" className="mb-24 scroll-mt-24">
                        <SectionHeader n="12" title="Risks & Disclaimers" subtitle="Transparency requires acknowledging what can go wrong." />
                        <div className="space-y-4">
                            {[
                                { risk: "Smart Contract Risk", desc: "Despite safety mechanisms, smart contracts may contain undiscovered vulnerabilities. The protocol has not undergone a formal audit at launch." },
                                { risk: "Market Risk", desc: "The engine improves market microstructure but does not guarantee price stability or appreciation. Value is subject to market forces and sentiment." },
                                { risk: "Impermanent Loss", desc: "LP additions by the engine are subject to the same IL dynamics as any AMM position. The engine prioritizes pool depth, not IL hedging." },
                                { risk: "Oracle Risk", desc: "If price oracles used by safety mechanisms are manipulated or fail, circuit breakers may not activate correctly." },
                                { risk: "Regulatory Risk", desc: "The DeFi regulatory landscape is evolving. Future regulations may affect the protocol's operation or token classification." },
                                { risk: "Dependency Risk", desc: "The engine depends on Solana network availability, AMM protocol uptime, and RPC infrastructure." },
                            ].map((item, i) => (
                                <FadeIn key={item.risk} delay={i * 0.04}>
                                    <div className="glass rounded-xl p-5 border border-border/50 hover:border-red-500/10 transition-all">
                                        <h4 className="text-sm font-bold text-foreground mb-1.5">{item.risk}</h4>
                                        <p className="text-xs text-muted/50 leading-relaxed">{item.desc}</p>
                                    </div>
                                </FadeIn>
                            ))}

                            <FadeIn>
                                <Callout variant="warning">
                                    <h3 className="text-sm font-bold text-warning mb-3">Legal Disclaimer</h3>
                                    <div className="space-y-2 text-[11px] text-muted/50 leading-relaxed">
                                        <p>This whitepaper is for informational purposes only. It does not constitute financial, investment, or trading advice.</p>
                                        <p>{siteConfig.token.symbol} tokens are not securities, shares, or equivalent instruments. They do not represent ownership and confer no rights to dividends or revenue share beyond what is explicitly described.</p>
                                        <p>The Liquidity Engine does not guarantee any specific outcome including price appreciation, return on investment, liquidity stability, or protection from loss.</p>
                                        <p className="font-semibold text-warning/70">Always do your own research. Never invest more than you can afford to lose.</p>
                                    </div>
                                </Callout>
                            </FadeIn>
                        </div>
                    </section>


                    {/* ═══ END MARK ═══ */}
                    <FadeIn>
                        <div className="text-center pt-8 pb-12">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-aqua/15" />
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-aqua/20" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-aqua/40" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-aqua/20" />
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-aqua/15" />
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-aqua/10 bg-aqua/[0.03] text-[11px] mono text-aqua/50 mb-4">
                                END OF WHITEPAPER
                            </div>
                            <p className="text-sm text-muted/40">
                                {siteConfig.token.symbol} Liquidity Engine — Built on Solana
                            </p>
                            <p className="text-[11px] text-muted/20 mt-1.5 mono">
                                v1.0 • February 2025
                            </p>
                        </div>
                    </FadeIn>

                </article>
            </div>
        </>
    );
}
