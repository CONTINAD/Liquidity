import {
    DataProvider,
    EngineEvent,
    EngineStatus,
    LiquidityDataPoint,
    BuybackDataPoint,
    DepthSnapshot,
    TopMoment,
} from "./types";

// Seeded PRNG for deterministic mock data
function seededRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

const rand = seededRandom(42);

function randomBetween(min: number, max: number): number {
    return min + rand() * (max - min);
}

function generateTxSig(): string {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let sig = "";
    for (let i = 0; i < 88; i++) {
        sig += chars[Math.floor(rand() * chars.length)];
    }
    return sig;
}

// Generate historical events
function generateHistoricalEvents(count: number): EngineEvent[] {
    const events: EngineEvent[] = [];
    const now = Date.now();
    let accumulatorBalance = 0;

    for (let i = 0; i < count; i++) {
        const timestamp = now - (count - i) * 3600000 * randomBetween(0.5, 2);
        const buyAmountSOL = randomBetween(0.8, 3.5);
        const lpAddSOL = randomBetween(0.4, 2.0);
        const buyAmountToken = buyAmountSOL * randomBetween(80000, 250000);
        const lpAddToken = lpAddSOL * randomBetween(80000, 250000);
        const balanceBefore = accumulatorBalance + randomBetween(2, 5);
        const balanceAfter = balanceBefore - buyAmountSOL - lpAddSOL;
        accumulatorBalance = Math.max(0, balanceAfter);

        events.push({
            id: `evt-${i}`,
            timestamp,
            type: i % 3 === 0 ? "trigger" : i % 2 === 0 ? "buyback" : "lp_add",
            txSignature: generateTxSig(),
            buyAmountSOL: Math.round(buyAmountSOL * 1000) / 1000,
            buyAmountToken: Math.round(buyAmountToken),
            lpAddedSOL: Math.round(lpAddSOL * 1000) / 1000,
            lpAddedToken: Math.round(lpAddToken),
            accumulatorBalanceBefore: Math.round(balanceBefore * 1000) / 1000,
            accumulatorBalanceAfter: Math.round(Math.max(0, balanceAfter) * 1000) / 1000,
        });
    }

    return events;
}

function generateLiquidityHistory(count: number): LiquidityDataPoint[] {
    const points: LiquidityDataPoint[] = [];
    const now = Date.now();
    let liquidity = 50;

    for (let i = 0; i < count; i++) {
        liquidity += randomBetween(-2, 8);
        liquidity = Math.max(20, liquidity);
        const timestamp = now - (count - i) * 3600000;
        points.push({
            timestamp,
            liquiditySOL: Math.round(liquidity * 100) / 100,
            liquidityUSD: Math.round(liquidity * 145 * 100) / 100,
        });
    }

    return points;
}

function generateBuybackHistory(count: number): BuybackDataPoint[] {
    const points: BuybackDataPoint[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const timestamp = now - (count - i) * 3600000 * randomBetween(1, 3);
        const amountSOL = randomBetween(0.5, 4);
        points.push({
            timestamp,
            amountSOL: Math.round(amountSOL * 1000) / 1000,
            amountToken: Math.round(amountSOL * randomBetween(80000, 250000)),
            txSignature: generateTxSig(),
        });
    }

    return points;
}

const depthSnapshots: DepthSnapshot[] = [
    { tradeSize: 100, priceImpactPct: 0.02, executionPrice: 0.0000124 },
    { tradeSize: 500, priceImpactPct: 0.12, executionPrice: 0.0000123 },
    { tradeSize: 1000, priceImpactPct: 0.31, executionPrice: 0.0000122 },
    { tradeSize: 5000, priceImpactPct: 1.8, executionPrice: 0.0000118 },
    { tradeSize: 10000, priceImpactPct: 4.2, executionPrice: 0.0000112 },
];

const topMoments: TopMoment[] = [
    {
        id: "tm-1",
        title: "Largest LP Add",
        description: "Single largest liquidity add event",
        value: 8.42,
        unit: "SOL",
        txSignature: generateTxSig(),
        timestamp: Date.now() - 86400000 * 3,
    },
    {
        id: "tm-2",
        title: "Biggest Buyback",
        description: "Largest single buyback execution",
        value: 5.17,
        unit: "SOL",
        txSignature: generateTxSig(),
        timestamp: Date.now() - 86400000 * 1.5,
    },
    {
        id: "tm-3",
        title: "Most Active Hour",
        description: "Hour with most engine triggers",
        value: 7,
        unit: "triggers",
        txSignature: generateTxSig(),
        timestamp: Date.now() - 86400000 * 2,
    },
];

export function createMockProvider(): DataProvider {
    let events = generateHistoricalEvents(48);
    let liquidityHistory = generateLiquidityHistory(72);
    let buybackHistory = generateBuybackHistory(32);
    let eventCounter = events.length;
    const subscribers: Set<() => void> = new Set();

    // Accumulator starts at random fill
    let accumulatorBalance = randomBetween(0.5, 2.0);
    let lastTriggerTime = Date.now() - randomBetween(60000, 300000);

    // Simulate live ticking
    if (typeof window !== "undefined") {
        setInterval(() => {
            accumulatorBalance += randomBetween(0.01, 0.08);

            // Fire trigger when threshold reached
            if (accumulatorBalance >= 2.5) {
                const buyAmount = accumulatorBalance * 0.6;
                const lpAmount = accumulatorBalance * 0.4;
                const newEvent: EngineEvent = {
                    id: `evt-${eventCounter++}`,
                    timestamp: Date.now(),
                    type: "trigger",
                    txSignature: generateTxSig(),
                    buyAmountSOL: Math.round(buyAmount * 1000) / 1000,
                    buyAmountToken: Math.round(buyAmount * randomBetween(80000, 250000)),
                    lpAddedSOL: Math.round(lpAmount * 1000) / 1000,
                    lpAddedToken: Math.round(lpAmount * randomBetween(80000, 250000)),
                    accumulatorBalanceBefore: Math.round(accumulatorBalance * 1000) / 1000,
                    accumulatorBalanceAfter: 0,
                };
                events = [newEvent, ...events].slice(0, 100);
                buybackHistory = [
                    {
                        timestamp: Date.now(),
                        amountSOL: newEvent.buyAmountSOL,
                        amountToken: newEvent.buyAmountToken,
                        txSignature: newEvent.txSignature,
                    },
                    ...buybackHistory,
                ].slice(0, 100);

                const lastLiq = liquidityHistory[liquidityHistory.length - 1];
                liquidityHistory = [
                    ...liquidityHistory,
                    {
                        timestamp: Date.now(),
                        liquiditySOL: lastLiq.liquiditySOL + lpAmount,
                        liquidityUSD: (lastLiq.liquiditySOL + lpAmount) * 145,
                    },
                ].slice(-100);

                lastTriggerTime = Date.now();
                accumulatorBalance = 0;
            }

            subscribers.forEach((cb) => cb());
        }, 8000);
    }

    return {
        getStatus: (): EngineStatus => {
            const totalBuybacks = events.reduce((s, e) => s + e.buyAmountSOL, 0);
            const totalLiquidity = events.reduce((s, e) => s + e.lpAddedSOL, 0);
            const fillPct = Math.min(100, (accumulatorBalance / 2.5) * 100);
            const elapsed = (Date.now() - lastTriggerTime) / 1000;
            const avgInterval = 300;
            const nextEst = Math.max(0, avgInterval - elapsed);

            return {
                accumulatorBalance: Math.round(accumulatorBalance * 1000) / 1000,
                triggerThreshold: 2.5,
                fillPercentage: Math.round(fillPct * 10) / 10,
                cooldownRemaining: 0,
                maxSlippageBps: 500,
                circuitBreakerActive: false,
                lastTriggerTime,
                lastTriggerTx: events[0]?.txSignature || "",
                nextTriggerEstimate: Math.round(nextEst),
                totalBuybacks: Math.round(totalBuybacks * 100) / 100,
                totalLiquidityAdded: Math.round(totalLiquidity * 100) / 100,
                totalEventsCount: events.length,
            };
        },
        getEvents: () => events,
        getLiquidityHistory: () => liquidityHistory,
        getBuybackHistory: () => buybackHistory,
        getDepthSnapshots: () => depthSnapshots,
        getTopMoments: () => topMoments,
        subscribe: (callback: () => void) => {
            subscribers.add(callback);
            return () => subscribers.delete(callback);
        },
    };
}
