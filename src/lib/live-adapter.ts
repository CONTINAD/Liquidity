/**
 * Live Adapter Interfaces
 *
 * Scaffold for connecting to real on-chain data.
 * Replace these stubs with real implementations when ready.
 */

import { DataProvider, EngineEvent, EngineStatus, LiquidityDataPoint, BuybackDataPoint, DepthSnapshot, TopMoment } from "./types";

export interface SolanaRpcAdapter {
    getAccumulatorBalance(wallet: string): Promise<number>;
    getRecentTransactions(wallet: string, limit: number): Promise<EngineEvent[]>;
}

export interface DexDataAdapter {
    getPrice(mint: string): Promise<number>;
    getLiquidity(pair: string): Promise<number>;
    getVolume24h(pair: string): Promise<number>;
    getPriceHistory(pair: string, hours: number): Promise<{ timestamp: number; price: number }[]>;
}

// Stub implementation that always returns empty/zero
export function createLiveProvider(): DataProvider {
    console.warn("[TIDE] Live adapters not configured — data will be empty.");

    const empty: EngineStatus = {
        accumulatorBalance: 0,
        triggerThreshold: 2.5,
        fillPercentage: 0,
        cooldownRemaining: 0,
        maxSlippageBps: 500,
        circuitBreakerActive: false,
        lastTriggerTime: 0,
        lastTriggerTx: "",
        nextTriggerEstimate: 0,
        totalBuybacks: 0,
        totalLiquidityAdded: 0,
        totalEventsCount: 0,
    };

    return {
        getStatus: () => empty,
        getEvents: (): EngineEvent[] => [],
        getLiquidityHistory: (): LiquidityDataPoint[] => [],
        getBuybackHistory: (): BuybackDataPoint[] => [],
        getDepthSnapshots: (): DepthSnapshot[] => [],
        getTopMoments: (): TopMoment[] => [],
        subscribe: () => () => { },
    };
}
