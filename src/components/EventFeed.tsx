"use client";

import { motion } from "framer-motion";
import type { EngineEvent } from "../lib/types";

function shortenTx(sig: string): string {
    if (sig.length < 12) return sig;
    return `${sig.slice(0, 6)}...${sig.slice(-4)}`;
}

function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

interface EventFeedProps {
    events: EngineEvent[];
    maxItems?: number;
    compact?: boolean;
}

export default function EventFeed({ events, maxItems = 8, compact = false }: EventFeedProps) {
    const displayed = events.slice(0, maxItems);

    return (
        <div className="space-y-1">
            {displayed.map((event, i) => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className={`flex items-center justify-between gap-3 px-3 rounded-lg hover:bg-surface-light transition-colors ${compact ? "py-2" : "py-3"
                        }`}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Type indicator */}
                        <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${event.type === "trigger"
                                    ? "bg-aqua animate-pulse-glow"
                                    : event.type === "buyback"
                                        ? "bg-success"
                                        : "bg-aqua-dim"
                                }`}
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="mono text-xs font-semibold uppercase text-foreground">
                                    {event.type === "trigger" ? "ENGINE TRIGGERED" : event.type === "buyback" ? "BUYBACK" : "LP ADD"}
                                </span>
                                <span className="text-xs text-muted">{timeAgo(event.timestamp)}</span>
                            </div>
                            {!compact && (
                                <div className="flex items-center gap-3 mt-0.5">
                                    <span className="mono text-xs text-aqua">
                                        Buy: {event.buyAmountSOL} SOL
                                    </span>
                                    <span className="mono text-xs text-aqua-dim">
                                        LP: +{event.lpAddedSOL} SOL
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TX link */}
                    <a
                        href={`https://solscan.io/tx/${event.txSignature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs mono text-muted hover:text-aqua transition-colors flex-shrink-0"
                    >
                        {shortenTx(event.txSignature)}
                        <svg viewBox="0 0 12 12" className="w-3 h-3">
                            <path d="M3.5 3.5h5v5M8.5 3.5L3.5 8.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </motion.div>
            ))}

            {events.length === 0 && (
                <div className="text-center py-8 text-muted text-sm">
                    No events yet. The engine is warming up.
                </div>
            )}
        </div>
    );
}
