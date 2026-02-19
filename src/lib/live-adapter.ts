/**
 * Live Data Adapter — Solana RPC + DexScreener
 *
 * Connects to real on-chain data via Helius RPC and DexScreener API.
 * Polls every ~15s for fresh data and notifies subscribers.
 *
 * To activate: set dataMode to "live" in site.config.ts and
 * paste real token addresses (mint, pair, accumulatorWallet).
 */

import { siteConfig } from "../config/site.config";
import type {
    DataProvider,
    EngineEvent,
    EngineStatus,
    LiquidityDataPoint,
    BuybackDataPoint,
    DepthSnapshot,
    TopMoment,
} from "./types";

const RPC = siteConfig.apis.solanaRpc;
const LAMPORTS = 1_000_000_000; // 1 SOL = 1e9 lamports
const POLL_INTERVAL = 15_000; // 15 seconds
const TOKEN_DECIMALS = siteConfig.token.decimals;

/* ─── Solana RPC helpers ──────────────────────────── */

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
    const res = await fetch(RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method,
            params,
        }),
    });
    const json = await res.json();
    if (json.error) {
        console.error(`[TIDE RPC] ${method} error:`, json.error);
        throw new Error(json.error.message);
    }
    return json.result as T;
}

/** Get SOL balance of a wallet in SOL (not lamports) */
async function getBalance(address: string): Promise<number> {
    const result = await rpcCall<{ value: number }>("getBalance", [address]);
    return result.value / LAMPORTS;
}

/** Get recent signatures for an address */
async function getSignatures(
    address: string,
    limit = 50
): Promise<{ signature: string; blockTime: number; err: unknown }[]> {
    return rpcCall("getSignaturesForAddress", [
        address,
        { limit, commitment: "confirmed" },
    ]);
}

/** Get parsed transaction details */
async function getTransaction(signature: string): Promise<unknown> {
    return rpcCall("getTransaction", [
        signature,
        { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
    ]);
}

/* ─── DexScreener API ─────────────────────────────── */

interface DexScreenerPair {
    pairAddress: string;
    baseToken: { symbol: string; address: string };
    quoteToken: { symbol: string; address: string };
    priceUsd: string;
    priceNative: string;
    liquidity: { usd: number; base: number; quote: number };
    volume: { h24: number };
    txns: { h24: { buys: number; sells: number } };
    fdv: number;
}

async function getDexScreenerPair(
    pairAddress: string
): Promise<DexScreenerPair | null> {
    try {
        const res = await fetch(
            `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`
        );
        const json = await res.json();
        if (json.pairs && json.pairs.length > 0) return json.pairs[0];
        return null;
    } catch (e) {
        console.error("[TIDE DexScreener] Error fetching pair:", e);
        return null;
    }
}

async function getDexScreenerByToken(
    tokenMint: string
): Promise<DexScreenerPair | null> {
    try {
        const res = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`
        );
        const json = await res.json();
        if (json.pairs && json.pairs.length > 0) return json.pairs[0];
        return null;
    } catch (e) {
        console.error("[TIDE DexScreener] Error fetching token:", e);
        return null;
    }
}

/* ─── Transaction parser ──────────────────────────── */

interface ParsedEngineEvent {
    signature: string;
    blockTime: number;
    buyAmountSOL: number;
    buyAmountToken: number;
    lpAddedSOL: number;
    lpAddedToken: number;
    preBalance: number;
    postBalance: number;
}

function parseEngineTransaction(tx: unknown): ParsedEngineEvent | null {
    try {
        const t = tx as {
            transaction: {
                message: { accountKeys: { pubkey: string }[] };
                signatures: string[];
            };
            blockTime: number;
            meta: {
                preBalances: number[];
                postBalances: number[];
                err: unknown;
            };
        };

        if (!t || !t.meta || t.meta.err) return null;

        const accWallet = siteConfig.engine.accumulatorWallet;
        const accIndex = t.transaction.message.accountKeys.findIndex(
            (k: { pubkey: string }) =>
                (typeof k === "string" ? k : k.pubkey) === accWallet
        );

        if (accIndex < 0) return null;

        const preBal = (t.meta.preBalances[accIndex] || 0) / LAMPORTS;
        const postBal = (t.meta.postBalances[accIndex] || 0) / LAMPORTS;
        const spent = Math.max(0, preBal - postBal);

        if (spent < 0.01) return null; // Ignore dust

        const buybackPct = siteConfig.engine.buybackPct / 100;
        const lpPct = siteConfig.engine.lpAddPct / 100;

        return {
            signature: t.transaction.signatures[0],
            blockTime: t.blockTime,
            buyAmountSOL: spent * buybackPct,
            buyAmountToken: 0, // Would need token account parsing for exact amount
            lpAddedSOL: spent * lpPct,
            lpAddedToken: 0,
            preBalance: preBal,
            postBalance: postBal,
        };
    } catch {
        return null;
    }
}

/* ─── Depth estimate from pool reserves ───────────── */

function estimateDepthSnapshots(
    liquidityUSD: number,
    priceUSD: number
): DepthSnapshot[] {
    if (!liquidityUSD || !priceUSD) return [];

    const poolSOL = liquidityUSD / 2 / priceUSD; // Rough SOL side of pool

    return [100, 500, 1000, 2500, 5000, 10000]
        .filter((size) => size < liquidityUSD * 0.5)
        .map((tradeSize) => {
            // Constant-product AMM price impact formula: impact ≈ tradeSize / poolReserve
            const impactPct = Math.min(
                (tradeSize / liquidityUSD) * 100,
                99
            );
            return {
                tradeSize,
                priceImpactPct: Math.round(impactPct * 100) / 100,
                executionPrice: priceUSD * (1 + impactPct / 100),
            };
        });
}

/* ═══════════════════════════════════════════════════ */
/*               LIVE PROVIDER FACTORY                 */
/* ═══════════════════════════════════════════════════ */

export function createLiveProvider(): DataProvider {
    // Internal state
    let status: EngineStatus = {
        accumulatorBalance: 0,
        triggerThreshold: siteConfig.engine.triggerThresholdSOL,
        fillPercentage: 0,
        cooldownRemaining: 0,
        maxSlippageBps: siteConfig.engine.maxSlippageBps,
        circuitBreakerActive: false,
        lastTriggerTime: 0,
        lastTriggerTx: "",
        nextTriggerEstimate: 0,
        totalBuybacks: 0,
        totalLiquidityAdded: 0,
        totalEventsCount: 0,
    };

    let events: EngineEvent[] = [];
    let liquidityHistory: LiquidityDataPoint[] = [];
    let buybackHistory: BuybackDataPoint[] = [];
    let depthSnapshots: DepthSnapshot[] = [];
    let topMoments: TopMoment[] = [];
    let subscribers: (() => void)[] = [];
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let currentPriceUSD = 0;
    let currentLiquidityUSD = 0;

    function notify() {
        subscribers.forEach((cb) => {
            try {
                cb();
            } catch {
                /* ignore */
            }
        });
    }

    /* ─── Fetch accumulator balance ──────────────── */
    async function fetchAccumulator() {
        try {
            const wallet = siteConfig.engine.accumulatorWallet;
            if (!wallet || wallet.startsWith("YOUR_")) return;

            const balance = await getBalance(wallet);
            const threshold = siteConfig.engine.triggerThresholdSOL;
            const fillPct = Math.min((balance / threshold) * 100, 100);

            // Estimate next trigger time based on fill rate
            let nextEstimate = 0;
            if (fillPct > 0 && fillPct < 100) {
                // Very rough: assume linear fill, estimate time to full
                const remaining = threshold - balance;
                // Estimate from recent fill rate or fallback to 1h
                nextEstimate = Date.now() + remaining * 3600 * 1000;
            }

            status = {
                ...status,
                accumulatorBalance: Math.round(balance * 1000) / 1000,
                fillPercentage: Math.round(fillPct * 10) / 10,
                nextTriggerEstimate: nextEstimate,
            };
        } catch (e) {
            console.error("[TIDE] Error fetching accumulator:", e);
        }
    }

    /* ─── Fetch engine events (tx history) ───────── */
    async function fetchEvents() {
        try {
            const wallet = siteConfig.engine.accumulatorWallet;
            if (!wallet || wallet.startsWith("YOUR_")) return;

            const sigs = await getSignatures(wallet, 30);
            const parsed: EngineEvent[] = [];

            // Fetch up to 10 most recent transactions for details
            const recentSigs = sigs
                .filter((s) => !s.err)
                .slice(0, 10);

            for (const sig of recentSigs) {
                try {
                    const tx = await getTransaction(sig.signature);
                    const event = parseEngineTransaction(tx);
                    if (event) {
                        parsed.push({
                            id: event.signature.slice(0, 8),
                            timestamp: event.blockTime * 1000,
                            type: event.buyAmountSOL > 0 ? "buyback" : "lp_add",
                            txSignature: event.signature,
                            buyAmountSOL: event.buyAmountSOL,
                            buyAmountToken: event.buyAmountToken,
                            lpAddedSOL: event.lpAddedSOL,
                            lpAddedToken: event.lpAddedToken,
                            accumulatorBalanceBefore: event.preBalance,
                            accumulatorBalanceAfter: event.postBalance,
                        });
                    }
                } catch {
                    // Skip failed tx fetches
                }
            }

            if (parsed.length > 0) {
                events = parsed.sort((a, b) => b.timestamp - a.timestamp);

                // Derive totals
                status = {
                    ...status,
                    totalBuybacks: events.reduce((sum, e) => sum + e.buyAmountSOL, 0),
                    totalLiquidityAdded: events.reduce((sum, e) => sum + e.lpAddedSOL, 0),
                    totalEventsCount: events.length,
                    lastTriggerTime: events[0]?.timestamp || 0,
                    lastTriggerTx: events[0]?.txSignature || "",
                    cooldownRemaining: Math.max(
                        0,
                        (events[0]?.timestamp || 0) +
                        siteConfig.engine.cooldownSeconds * 1000 -
                        Date.now()
                    ) / 1000,
                };

                // Build buyback history from events
                buybackHistory = events
                    .filter((e) => e.buyAmountSOL > 0)
                    .map((e) => ({
                        timestamp: e.timestamp,
                        amountSOL: e.buyAmountSOL,
                        amountToken: e.buyAmountToken,
                        txSignature: e.txSignature,
                    }));

                // Top moments
                topMoments = events
                    .sort((a, b) => b.buyAmountSOL + b.lpAddedSOL - (a.buyAmountSOL + a.lpAddedSOL))
                    .slice(0, 5)
                    .map((e, i) => ({
                        id: `top-${i}`,
                        title:
                            e.type === "buyback"
                                ? `Buyback #${events.length - events.indexOf(e)}`
                                : `LP Add #${events.length - events.indexOf(e)}`,
                        description: `Engine executed ${e.buyAmountSOL.toFixed(2)} SOL buyback + ${e.lpAddedSOL.toFixed(2)} SOL to LP`,
                        value: e.buyAmountSOL + e.lpAddedSOL,
                        unit: "SOL",
                        txSignature: e.txSignature,
                        timestamp: e.timestamp,
                    }));
            }
        } catch (e) {
            console.error("[TIDE] Error fetching events:", e);
        }
    }

    /* ─── Fetch market data from DexScreener ─────── */
    async function fetchMarketData() {
        try {
            const pair = siteConfig.token.pair;
            const mint = siteConfig.token.mint;

            if ((!pair || pair.startsWith("YOUR_")) && (!mint || mint.startsWith("YOUR_"))) return;

            let pairData: DexScreenerPair | null = null;

            if (pair && !pair.startsWith("YOUR_")) {
                pairData = await getDexScreenerPair(pair);
            }
            if (!pairData && mint && !mint.startsWith("YOUR_")) {
                pairData = await getDexScreenerByToken(mint);
            }

            if (pairData) {
                currentPriceUSD = parseFloat(pairData.priceUsd) || 0;
                currentLiquidityUSD = pairData.liquidity?.usd || 0;

                // Add to liquidity history
                const now = Date.now();
                liquidityHistory.push({
                    timestamp: now,
                    liquiditySOL: pairData.liquidity?.quote || 0,
                    liquidityUSD: currentLiquidityUSD,
                });

                // Keep last 200 data points
                if (liquidityHistory.length > 200) {
                    liquidityHistory = liquidityHistory.slice(-200);
                }

                // Update depth snapshots
                depthSnapshots = estimateDepthSnapshots(
                    currentLiquidityUSD,
                    currentPriceUSD
                );
            }
        } catch (e) {
            console.error("[TIDE] Error fetching market data:", e);
        }
    }

    /* ─── Poll loop ──────────────────────────────── */
    async function poll() {
        await Promise.all([
            fetchAccumulator(),
            fetchMarketData(),
        ]);
        // Events fetch is heavier, do it less frequently
        await fetchEvents();
        notify();
    }

    /* ─── Initialize ─────────────────────────────── */
    const hasRealAddresses =
        siteConfig.engine.accumulatorWallet &&
        !siteConfig.engine.accumulatorWallet.startsWith("YOUR_");

    if (hasRealAddresses) {
        console.log("[TIDE] 🌊 Live adapter initialized — polling every 15s");
        poll(); // Initial fetch
        pollTimer = setInterval(poll, POLL_INTERVAL);
    } else {
        console.warn(
            "[TIDE] Live adapter loaded but addresses are placeholders. " +
            "Paste real addresses in site.config.ts to activate."
        );
    }

    /* ─── Return DataProvider interface ───────────── */
    return {
        getStatus: () => status,
        getEvents: () => events,
        getLiquidityHistory: () => liquidityHistory,
        getBuybackHistory: () => buybackHistory,
        getDepthSnapshots: () => depthSnapshots,
        getTopMoments: () => topMoments,
        subscribe: (callback: () => void) => {
            subscribers.push(callback);
            return () => {
                subscribers = subscribers.filter((cb) => cb !== callback);
                if (subscribers.length === 0 && pollTimer) {
                    clearInterval(pollTimer);
                    pollTimer = null;
                }
            };
        },
    };
}
