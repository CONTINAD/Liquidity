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

export default function MediaPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            {/* Header */}
            <FadeIn>
                <span className="text-xs mono text-aqua/60 uppercase tracking-widest">Downloads & Verification</span>
                <h1 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
                    Media <span className="text-gradient">Kit</span>
                </h1>
                <p className="text-muted max-w-xl mb-16">
                    Brand assets, logos, and a guide to verifying the engine on-chain.
                </p>
            </FadeIn>

            {/* ──── Brand Assets ──── */}
            <FadeIn delay={0.1} className="mb-20">
                <h2 className="text-2xl font-bold mb-6">
                    Brand <span className="text-gradient">Assets</span>
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    {[
                        {
                            title: "Logo Mark",
                            desc: "SVG logo, dark + light variants",
                            type: "SVG",
                        },
                        {
                            title: "Banner",
                            desc: "Social media banner (1500×500)",
                            type: "PNG",
                        },
                        {
                            title: "Meme Kit",
                            desc: "Community meme templates",
                            type: "ZIP",
                        },
                    ].map((asset, i) => (
                        <motion.div
                            key={asset.title}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="glass glow-border rounded-xl overflow-hidden group"
                        >
                            {/* Preview area */}
                            <div className="h-32 bg-surface-light flex items-center justify-center border-b border-border">
                                <div className="w-16 h-16 rounded-xl bg-aqua/10 border border-aqua/20 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-aqua/50">
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 2.69 3 6s-1.34 6-3 6-3-2.69-3-6 1.34-6 3-6z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-semibold">{asset.title}</h3>
                                    <span className="text-xs mono text-aqua/50 px-2 py-0.5 rounded bg-aqua/5">
                                        {asset.type}
                                    </span>
                                </div>
                                <p className="text-xs text-muted mb-3">{asset.desc}</p>
                                <button className="text-xs mono text-aqua/60 hover:text-aqua transition-colors flex items-center gap-1 group-hover:text-aqua">
                                    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M8 2v9M4 7l4 4 4-4M2 13h12" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </FadeIn>

            {/* ──── On-Chain Verification Guide ──── */}
            <FadeIn delay={0.15}>
                <h2 className="text-2xl font-bold mb-6">
                    How to <span className="text-gradient">Verify</span> On-Chain
                </h2>
                <div className="glass glow-border rounded-2xl p-6 md:p-8">
                    <p className="text-sm text-muted mb-6">
                        Every engine action is a Solana transaction. Here&apos;s how to independently verify each event:
                    </p>

                    <div className="space-y-6">
                        {[
                            {
                                step: 1,
                                title: "Find the Accumulator Wallet",
                                desc: (
                                    <>
                                        The fee accumulator wallet is{" "}
                                        <code className="text-xs mono text-aqua/70 bg-surface-light px-2 py-0.5 rounded">
                                            {siteConfig.engine.accumulatorWallet}
                                        </code>
                                        . You can view its balance and transactions on{" "}
                                        <a href="https://solscan.io" target="_blank" rel="noopener noreferrer" className="text-aqua/70 hover:text-aqua">
                                            Solscan
                                        </a>.
                                    </>
                                ),
                            },
                            {
                                step: 2,
                                title: "Check Transaction Signatures",
                                desc: "Every buyback and LP add shown in the dashboard includes a transaction signature (tx hash). Click any tx link to validate it on Solscan.",
                            },
                            {
                                step: 3,
                                title: "Verify LP Pool",
                                desc: (
                                    <>
                                        The LP pair address is{" "}
                                        <code className="text-xs mono text-aqua/70 bg-surface-light px-2 py-0.5 rounded">
                                            {siteConfig.token.pair}
                                        </code>
                                        . Check it on DexScreener or Birdeye to see the total liquidity and confirm LP additions match dashboard data.
                                    </>
                                ),
                            },
                            {
                                step: 4,
                                title: "Cross-Reference Timestamps",
                                desc: "Compare the timestamps in the dashboard with transaction timestamps on Solscan. They should match within a few seconds.",
                            },
                            {
                                step: 5,
                                title: "Monitor the Accumulator Balance",
                                desc: "Watch the accumulator wallet balance grow over time. When it drops (trigger event), a corresponding buyback + LP add transaction should appear on-chain.",
                            },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-aqua/10 border border-aqua/20 flex items-center justify-center flex-shrink-0">
                                    <span className="mono text-sm font-bold text-aqua">{item.step}</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                                    <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
