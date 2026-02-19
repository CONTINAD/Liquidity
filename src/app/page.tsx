"use client";

import { motion } from "framer-motion";
import LiquidityCore from "../components/LiquidityCore";
import OdometerNumber from "../components/OdometerNumber";
import FlowPipeline from "../components/FlowPipeline";
import EventFeed from "../components/EventFeed";
import FAQ from "../components/FAQ";
import MockBadge from "../components/MockBadge";
import { useEngineData } from "../lib/data-context";
import { siteConfig } from "../config/site.config";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

export default function HomePage() {
  const { status, events, liquidityHistory, isMockMode } = useEngineData();

  return (
    <>
      <MockBadge show={isMockMode} />

      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background radial */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-aqua/[0.03] blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-aqua/[0.02] blur-[80px]" />
        </div>

        <div className="section relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 px-4 py-1.5 rounded-full border border-aqua/20 bg-aqua/5 text-xs mono text-aqua"
          >
            LIQUIDITY ENGINE — ON-CHAIN PROOF
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
          >
            <span className="text-gradient glow-text">LIQUIDITY</span>
            <br />
            <span className="text-foreground">IS THE PRODUCT.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-lg sm:text-xl text-muted max-w-xl mb-10"
          >
            Fees accumulate. The engine buys. Liquidity deepens. On-chain proof.
          </motion.p>

          {/* LiquidityCore */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mb-10"
          >
            <LiquidityCore
              fillPercentage={status.fillPercentage}
              triggerThreshold={status.triggerThreshold}
              accumulatorBalance={status.accumulatorBalance}
            />
          </motion.div>

          {/* Live Counters */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-3xl mb-10"
          >
            {[
              { label: "Total Liquidity Added", value: status.totalLiquidityAdded, suffix: "SOL" },
              { label: "Total Buybacks", value: status.totalBuybacks, suffix: "SOL" },
              { label: "Last Trigger", value: null, display: timeAgo(status.lastTriggerTime) },
              { label: "Next Trigger Est.", value: null, display: `~${Math.round(status.nextTriggerEstimate)}s` },
            ].map((counter, i) => (
              <div key={i} className="glass glow-border rounded-xl px-4 py-4 text-center">
                <div className="text-xs text-muted mb-2 mono uppercase">{counter.label}</div>
                {counter.value !== null ? (
                  <OdometerNumber
                    value={counter.value}
                    suffix={counter.suffix}
                    className="text-xl font-bold text-foreground"
                  />
                ) : (
                  <span className="mono text-xl font-bold text-foreground">{counter.display}</span>
                )}
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <a
              href={siteConfig.links.buy}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl bg-aqua text-background font-bold text-sm hover:bg-aqua/90 transition-all duration-200 shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.4)]"
            >
              Buy {siteConfig.token.symbol}
            </a>
            <a
              href="#mechanism"
              className="px-8 py-3.5 rounded-xl border border-border text-muted font-medium text-sm hover:border-aqua/30 hover:text-foreground transition-all duration-200"
            >
              Watch the Engine ↓
            </a>
          </motion.div>
        </div>
      </section>

      {/* ───────── THE TIDE MECHANISM ───────── */}
      <section id="mechanism" className="relative border-t border-border">
        <div className="section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs mono text-aqua/60 uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3">
              The <span className="text-gradient">Tide</span> Mechanism
            </h2>
            <p className="text-muted mt-4 max-w-lg mx-auto">
              A self-reinforcing cycle. Every trade generates fees. Every fee deepens the ocean.
            </p>
          </motion.div>

          <FlowPipeline />
        </div>
      </section>

      {/* ───────── PRESSURE = SUPPORT ───────── */}
      <section className="relative border-t border-border">
        <div className="section">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs mono text-aqua/60 uppercase tracking-widest">Why It Matters</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6">
                Pressure = <span className="text-gradient">Support</span>
              </h2>
              <div className="space-y-4 text-muted">
                <p>
                  Deeper liquidity means lower slippage. Lower slippage means better execution for
                  every participant — whether you&apos;re buying 0.1 SOL or 100 SOL.
                </p>
                <p>
                  The engine doesn&apos;t promise price action. It builds structural depth that makes
                  the market more efficient, more confident, and more resilient.
                </p>
                <p className="text-aqua/80 mono text-sm">
                  &quot;Fees don&apos;t disappear. They become depth.&quot;
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { metric: "Lower", desc: "Slippage", icon: "↓" },
                { metric: "Better", desc: "Execution", icon: "◎" },
                { metric: "Deeper", desc: "Orderbook", icon: "▤" },
                { metric: "Stronger", desc: "Confidence", icon: "◆" },
              ].map((item) => (
                <div
                  key={item.desc}
                  className="glass glow-border rounded-xl p-5 text-center group hover:border-aqua/30 transition-colors"
                >
                  <div className="text-2xl mb-2 text-aqua/50 group-hover:text-aqua transition-colors">
                    {item.icon}
                  </div>
                  <div className="text-lg font-bold text-foreground">{item.metric}</div>
                  <div className="text-xs text-muted mono">{item.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────── LIVE PROOF PREVIEW ───────── */}
      <section className="relative border-t border-border">
        <div className="section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs mono text-aqua/60 uppercase tracking-widest">Live Data</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              Proof in <span className="text-gradient">Real Time</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Event Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass glow-border rounded-2xl p-6"
            >
              <h3 className="text-sm mono text-aqua/60 uppercase tracking-wider mb-4">Recent Engine Activity</h3>
              <EventFeed events={events} maxItems={6} compact />
            </motion.div>

            {/* Mini chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass glow-border rounded-2xl p-6"
            >
              <h3 className="text-sm mono text-aqua/60 uppercase tracking-wider mb-4">Liquidity Depth (SOL)</h3>
              <div className="h-48 flex items-end gap-1">
                {liquidityHistory.slice(-24).map((point, i) => {
                  const max = Math.max(...liquidityHistory.slice(-24).map((p) => p.liquiditySOL));
                  const min = Math.min(...liquidityHistory.slice(-24).map((p) => p.liquiditySOL));
                  const range = max - min || 1;
                  const height = ((point.liquiditySOL - min) / range) * 100;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.max(8, height)}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                      className="flex-1 rounded-t bg-gradient-to-t from-aqua/20 to-aqua/60 min-h-[4px]"
                      title={`${point.liquiditySOL.toFixed(1)} SOL`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted mono">
                <span>24h ago</span>
                <span>now</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────── TOKEN / LINKS ───────── */}
      <section className="relative border-t border-border">
        <div className="section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass glow-border rounded-2xl p-8 md:p-10"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <span className="text-xs mono text-aqua/60 uppercase tracking-widest">Token Info</span>
                <h3 className="text-2xl font-bold mt-2 mb-4">{siteConfig.token.symbol}</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted block mb-1">Mint Address</span>
                    <code className="text-sm mono text-aqua/70 break-all bg-surface-light px-3 py-2 rounded-lg block">
                      {siteConfig.token.mint}
                    </code>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">LP Pair</span>
                    <code className="text-sm mono text-aqua/70 break-all bg-surface-light px-3 py-2 rounded-lg block">
                      {siteConfig.token.pair}
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs mono text-aqua/60 uppercase tracking-widest">Links</span>
                <h3 className="text-2xl font-bold mt-2 mb-4">Ecosystem</h3>
                <div className="grid grid-cols-2 gap-3">
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
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-aqua/30 text-sm text-muted hover:text-foreground transition-all"
                    >
                      {link.label}
                      <svg viewBox="0 0 12 12" className="w-3 h-3">
                        <path d="M3.5 3.5h5v5M8.5 3.5L3.5 8.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="relative border-t border-border">
        <div className="section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs mono text-aqua/60 uppercase tracking-widest">Questions</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              Frequently <span className="text-gradient">Asked</span>
            </h2>
          </motion.div>

          <FAQ />
        </div>
      </section>
    </>
  );
}
