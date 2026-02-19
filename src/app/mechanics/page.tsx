"use client";

import { motion } from "framer-motion";
import { siteConfig } from "../../config/site.config";

const FadeIn = ({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className={className}
    >
        {children}
    </motion.div>
);

export default function MechanicsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            {/* Header */}
            <FadeIn>
                <span className="text-xs mono text-aqua/60 uppercase tracking-widest">Under the Hood</span>
                <h1 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
                    How the <span className="text-gradient">Engine</span> Works
                </h1>
                <p className="text-muted max-w-xl mb-16">
                    A transparent breakdown of the Liquidity Engine — triggers, allocations, safety mechanisms, and on-chain verification.
                </p>
            </FadeIn>

            {/* ──── Flow Diagram ──── */}
            <FadeIn delay={0.1} className="mb-20">
                <div className="glass glow-border rounded-2xl p-8 md:p-10">
                    <h2 className="text-sm mono text-aqua/60 uppercase tracking-wider mb-8">Engine Flow</h2>
                    <svg viewBox="0 0 800 200" className="w-full max-w-full" fill="none">
                        {/* Nodes */}
                        {[
                            { x: 40, label: "Trading", sub: "Activity" },
                            { x: 200, label: "Fee", sub: "Collection" },
                            { x: 380, label: "Accumulator", sub: "Wallet" },
                            { x: 560, label: "Auto-Buy", sub: "Execution" },
                            { x: 720, label: "Auto-LP", sub: "Addition" },
                        ].map((node, i) => (
                            <g key={node.label}>
                                <rect
                                    x={node.x}
                                    y="60"
                                    width="100"
                                    height="80"
                                    rx="12"
                                    fill="#0f1419"
                                    stroke="#1e2530"
                                    strokeWidth="1.5"
                                />
                                <rect
                                    x={node.x}
                                    y="60"
                                    width="100"
                                    height="80"
                                    rx="12"
                                    fill="none"
                                    stroke="#00f0ff"
                                    strokeWidth="0.5"
                                    opacity="0.2"
                                />
                                <text
                                    x={node.x + 50}
                                    y="95"
                                    textAnchor="middle"
                                    fill="#e8eaed"
                                    fontSize="12"
                                    fontWeight="600"
                                    fontFamily="var(--font-sans)"
                                >
                                    {node.label}
                                </text>
                                <text
                                    x={node.x + 50}
                                    y="115"
                                    textAnchor="middle"
                                    fill="#6b7280"
                                    fontSize="10"
                                    fontFamily="var(--font-mono)"
                                >
                                    {node.sub}
                                </text>
                                {/* Connector */}
                                {i < 4 && (
                                    <line
                                        x1={node.x + 100}
                                        y1="100"
                                        x2={node.x + 120}
                                        y2="100"
                                        stroke="#00f0ff"
                                        strokeWidth="1"
                                        strokeDasharray="4 3"
                                        opacity="0.4"
                                    >
                                        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.5s" repeatCount="indefinite" />
                                    </line>
                                )}
                            </g>
                        ))}

                        {/* Cycle arrow back */}
                        <path
                            d="M 770 140 Q 770 180, 400 180 Q 40 180, 40 140"
                            stroke="#00f0ff"
                            strokeWidth="1"
                            strokeDasharray="6 4"
                            opacity="0.15"
                            fill="none"
                        />
                        <text x="400" y="175" textAnchor="middle" fill="#00f0ff" fontSize="9" fontFamily="var(--font-mono)" opacity="0.3">
                            cycle repeats
                        </text>
                    </svg>
                </div>
            </FadeIn>

            {/* ──── Triggers ──── */}
            <FadeIn delay={0.15} className="mb-16">
                <h2 className="text-2xl font-bold mb-6">
                    <span className="text-gradient">Trigger</span> Logic
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    {[
                        {
                            title: "Threshold-Based",
                            desc: `The engine fires when the accumulator wallet reaches ${siteConfig.engine.triggerThresholdSOL} SOL. This is the primary trigger.`,
                            active: true,
                        },
                        {
                            title: "Time-Based",
                            desc: "Optional: if the accumulator hasn't been triggered in X hours, force a trigger regardless of balance.",
                            active: false,
                        },
                        {
                            title: "Hybrid",
                            desc: "Combination of threshold + time. Whichever condition is met first initiates the engine cycle.",
                            active: false,
                        },
                    ].map((trigger) => (
                        <div
                            key={trigger.title}
                            className={`glass rounded-xl p-5 border ${trigger.active ? "border-aqua/30" : "border-border"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${trigger.active ? "bg-aqua animate-pulse-glow" : "bg-metal"
                                        }`}
                                />
                                <h3 className="text-sm font-semibold">{trigger.title}</h3>
                            </div>
                            <p className="text-xs text-muted leading-relaxed">{trigger.desc}</p>
                            {trigger.active && (
                                <span className="inline-block mt-3 text-xs mono text-aqua/60 px-2 py-0.5 rounded bg-aqua/5 border border-aqua/10">
                                    ACTIVE
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </FadeIn>

            {/* ──── Allocations ──── */}
            <FadeIn delay={0.2} className="mb-16">
                <h2 className="text-2xl font-bold mb-6">
                    Fee <span className="text-gradient">Allocation</span>
                </h2>
                <div className="glass glow-border rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-6 mb-6">
                        {/* Bar visualization */}
                        <div className="flex-1 h-8 rounded-full overflow-hidden bg-surface-light flex">
                            <div
                                className="h-full bg-gradient-to-r from-aqua to-aqua/70 flex items-center justify-center"
                                style={{ width: `${siteConfig.engine.buybackPct}%` }}
                            >
                                <span className="text-xs mono font-semibold text-background">
                                    {siteConfig.engine.buybackPct}% BUY
                                </span>
                            </div>
                            <div
                                className="h-full bg-gradient-to-r from-aqua-dim to-aqua-dim/70 flex items-center justify-center"
                                style={{ width: `${siteConfig.engine.lpAddPct}%` }}
                            >
                                <span className="text-xs mono font-semibold text-background">
                                    {siteConfig.engine.lpAddPct}% LP
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-surface-light">
                            <h4 className="text-sm font-semibold mb-1">Buyback Allocation</h4>
                            <p className="text-xs text-muted">
                                {siteConfig.engine.buybackPct}% of accumulated fees are used to execute a market buy of {siteConfig.token.symbol} tokens.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-surface-light">
                            <h4 className="text-sm font-semibold mb-1">LP Addition</h4>
                            <p className="text-xs text-muted">
                                {siteConfig.engine.lpAddPct}% of accumulated fees are paired with bought tokens and added to the liquidity pool.
                            </p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* ──── Safety ──── */}
            <FadeIn delay={0.25} className="mb-16">
                <h2 className="text-2xl font-bold mb-6">
                    Safety <span className="text-gradient">Mechanisms</span>
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            title: "Cooldown Period",
                            desc: `After each trigger, the engine enters a ${siteConfig.engine.cooldownSeconds}s cooldown to prevent rapid-fire execution and ensure market stability.`,
                            icon: "⏱",
                        },
                        {
                            title: "Max Slippage Guard",
                            desc: `Buybacks are executed with a maximum slippage of ${siteConfig.engine.maxSlippageBps / 100}%. If the market is too thin, the transaction reverts and retries on the next cycle.`,
                            icon: "🛡",
                        },
                        {
                            title: "Circuit Breaker",
                            desc: "If unusual market conditions are detected (extreme volatility, very low liquidity), the engine pauses automatically. It can be manually resumed after review.",
                            icon: "⚡",
                        },
                        {
                            title: "Emergency Pause",
                            desc: "A multisig can pause the engine entirely in case of contract vulnerabilities or black swan events. All pauses are logged on-chain.",
                            icon: "🔒",
                        },
                    ].map((safety) => (
                        <div
                            key={safety.title}
                            className="glass rounded-xl p-5 border border-border hover:border-aqua/20 transition-colors flex gap-4"
                        >
                            <span className="text-2xl flex-shrink-0">{safety.icon}</span>
                            <div>
                                <h3 className="text-sm font-semibold mb-1">{safety.title}</h3>
                                <p className="text-xs text-muted leading-relaxed">{safety.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </FadeIn>

            {/* ──── Disclaimer ──── */}
            <FadeIn delay={0.3}>
                <div className="rounded-xl border border-warning/20 bg-warning/5 p-6">
                    <h3 className="text-sm font-semibold text-warning mb-2">Important Disclaimer</h3>
                    <p className="text-xs text-muted leading-relaxed">
                        The Liquidity Engine deepens market liquidity and improves execution quality. It does not
                        guarantee price appreciation, returns, or profits. Cryptocurrency trading carries
                        inherent risk. Always do your own research (DYOR) before participating.
                    </p>
                </div>
            </FadeIn>
        </div>
    );
}
