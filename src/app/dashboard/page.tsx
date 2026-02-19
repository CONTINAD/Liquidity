"use client";

import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useEngineData } from "../../lib/data-context";
import EventFeed from "../../components/EventFeed";
import MockBadge from "../../components/MockBadge";
import OdometerNumber from "../../components/OdometerNumber";

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function shortenTx(sig: string): string {
    if (sig.length < 12) return sig;
    return `${sig.slice(0, 6)}...${sig.slice(-4)}`;
}

const WidgetCard = ({
    children,
    title,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    title: string;
    className?: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={`glass glow-border rounded-2xl p-6 ${className}`}
    >
        <h3 className="text-xs mono text-aqua/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-aqua/40" />
            {title}
        </h3>
        {children}
    </motion.div>
);

export default function DashboardPage() {
    const {
        status,
        events,
        liquidityHistory,
        buybackHistory,
        depthSnapshots,
        topMoments,
        isMockMode,
    } = useEngineData();

    const liquidityChartData = liquidityHistory.slice(-48).map((p) => ({
        time: formatTime(p.timestamp),
        value: p.liquiditySOL,
    }));

    const buybackChartData = buybackHistory.slice(-24).map((p) => ({
        time: formatTime(p.timestamp),
        value: p.amountSOL,
    }));

    return (
        <>
            <MockBadge show={isMockMode} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Engine <span className="text-gradient">Dashboard</span>
                    </h1>
                    <p className="text-muted text-sm mt-2">
                        Real-time engine status & on-chain proof. All data verifiable on Solscan.
                    </p>
                </motion.div>

                {/* ──── Engine Status Row ──── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        {
                            label: "Accumulator",
                            value: status.accumulatorBalance,
                            suffix: "SOL",
                            color: "text-foreground",
                        },
                        {
                            label: "Threshold",
                            value: status.triggerThreshold,
                            suffix: "SOL",
                            color: "text-aqua/70",
                        },
                        {
                            label: "Fill Level",
                            value: status.fillPercentage,
                            suffix: "%",
                            color: status.fillPercentage > 80 ? "text-aqua" : "text-foreground",
                        },
                        {
                            label: "Next Trigger",
                            value: status.nextTriggerEstimate,
                            suffix: "s",
                            decimals: 0,
                            color: "text-foreground",
                        },
                    ].map((item, i) => (
                        <WidgetCard key={item.label} title={item.label} delay={i * 0.05}>
                            <OdometerNumber
                                value={item.value}
                                decimals={"decimals" in item ? item.decimals as number : 2}
                                suffix={item.suffix}
                                className={`text-2xl font-bold ${item.color}`}
                            />
                        </WidgetCard>
                    ))}
                </div>

                {/* ──── Safety Status ──── */}
                <WidgetCard title="Engine Safety" className="mb-6" delay={0.2}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <span className="text-xs text-muted block mb-1">Max Slippage</span>
                            <span className="mono text-sm font-semibold">{status.maxSlippageBps / 100}%</span>
                        </div>
                        <div>
                            <span className="text-xs text-muted block mb-1">Cooldown</span>
                            <span className="mono text-sm font-semibold">
                                {status.cooldownRemaining > 0 ? `${status.cooldownRemaining}s` : "Ready"}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-muted block mb-1">Circuit Breaker</span>
                            <span
                                className={`mono text-sm font-semibold ${status.circuitBreakerActive ? "text-danger" : "text-success"
                                    }`}
                            >
                                {status.circuitBreakerActive ? "ACTIVE" : "NORMAL"}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-muted block mb-1">Last TX</span>
                            <a
                                href={`https://solscan.io/tx/${status.lastTriggerTx}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mono text-sm text-aqua/70 hover:text-aqua transition-colors"
                            >
                                {shortenTx(status.lastTriggerTx)}
                            </a>
                        </div>
                    </div>
                </WidgetCard>

                {/* ──── Charts Row ──── */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Liquidity Over Time */}
                    <WidgetCard title="Liquidity Over Time (SOL)" delay={0.25}>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={liquidityChartData}>
                                    <defs>
                                        <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: "#6b7280", fontSize: 10 }}
                                        axisLine={{ stroke: "#1e2530" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#6b7280", fontSize: 10 }}
                                        axisLine={{ stroke: "#1e2530" }}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#0f1419",
                                            border: "1px solid #1e2530",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                        labelStyle={{ color: "#6b7280" }}
                                        itemStyle={{ color: "#00f0ff" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#00f0ff"
                                        strokeWidth={2}
                                        fill="url(#liqGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </WidgetCard>

                    {/* Buybacks Over Time */}
                    <WidgetCard title="Buybacks Over Time (SOL)" delay={0.3}>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={buybackChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: "#6b7280", fontSize: 10 }}
                                        axisLine={{ stroke: "#1e2530" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#6b7280", fontSize: 10 }}
                                        axisLine={{ stroke: "#1e2530" }}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#0f1419",
                                            border: "1px solid #1e2530",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                        labelStyle={{ color: "#6b7280" }}
                                        itemStyle={{ color: "#00f0ff" }}
                                    />
                                    <Bar dataKey="value" fill="#00f0ff" radius={[4, 4, 0, 0]} opacity={0.7} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </WidgetCard>
                </div>

                {/* ──── Event Feed + Depth ──── */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Event Feed */}
                    <WidgetCard title="Auto-LP Events Feed" delay={0.35}>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            <EventFeed events={events} maxItems={12} />
                        </div>
                    </WidgetCard>

                    {/* Depth Snapshot */}
                    <WidgetCard title="Depth Snapshot" delay={0.4}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-muted mono uppercase">
                                        <th className="pb-3 pr-4">Trade Size ($)</th>
                                        <th className="pb-3 pr-4">Price Impact</th>
                                        <th className="pb-3">Execution Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {depthSnapshots.map((snap, i) => (
                                        <tr
                                            key={i}
                                            className="border-t border-border/50 hover:bg-surface-light transition-colors"
                                        >
                                            <td className="py-3 pr-4 mono font-medium">
                                                ${snap.tradeSize.toLocaleString()}
                                            </td>
                                            <td
                                                className={`py-3 pr-4 mono ${snap.priceImpactPct > 2
                                                        ? "text-warning"
                                                        : snap.priceImpactPct > 1
                                                            ? "text-aqua-dim"
                                                            : "text-success"
                                                    }`}
                                            >
                                                {snap.priceImpactPct.toFixed(2)}%
                                            </td>
                                            <td className="py-3 mono text-muted">
                                                ${snap.executionPrice.toFixed(7)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </WidgetCard>
                </div>

                {/* ──── Top Engine Moments ──── */}
                <WidgetCard title="Top Engine Moments" delay={0.45} className="mb-6">
                    <div className="grid sm:grid-cols-3 gap-4">
                        {topMoments.map((moment) => (
                            <div
                                key={moment.id}
                                className="rounded-xl bg-surface-light border border-border p-5 hover:border-aqua/20 transition-colors"
                            >
                                <div className="text-xs text-muted mb-2">{moment.title}</div>
                                <div className="text-2xl font-bold text-foreground mono">
                                    {moment.value} <span className="text-sm text-aqua/60">{moment.unit}</span>
                                </div>
                                <div className="text-xs text-muted mt-2">{moment.description}</div>
                                <a
                                    href={`https://solscan.io/tx/${moment.txSignature}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs mono text-aqua/50 hover:text-aqua mt-2 inline-block transition-colors"
                                >
                                    {shortenTx(moment.txSignature)} →
                                </a>
                            </div>
                        ))}
                    </div>
                </WidgetCard>
            </div>
        </>
    );
}
