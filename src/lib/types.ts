export interface EngineEvent {
    id: string;
    timestamp: number;
    type: "buyback" | "lp_add" | "trigger";
    txSignature: string;
    buyAmountSOL: number;
    buyAmountToken: number;
    lpAddedSOL: number;
    lpAddedToken: number;
    accumulatorBalanceBefore: number;
    accumulatorBalanceAfter: number;
}

export interface EngineStatus {
    accumulatorBalance: number;
    triggerThreshold: number;
    fillPercentage: number;
    cooldownRemaining: number;
    maxSlippageBps: number;
    circuitBreakerActive: boolean;
    lastTriggerTime: number;
    lastTriggerTx: string;
    nextTriggerEstimate: number;
    totalBuybacks: number;
    totalLiquidityAdded: number;
    totalEventsCount: number;
}

export interface DepthSnapshot {
    tradeSize: number;
    priceImpactPct: number;
    executionPrice: number;
}

export interface LiquidityDataPoint {
    timestamp: number;
    liquiditySOL: number;
    liquidityUSD: number;
}

export interface BuybackDataPoint {
    timestamp: number;
    amountSOL: number;
    amountToken: number;
    txSignature: string;
}

export interface TopMoment {
    id: string;
    title: string;
    description: string;
    value: number;
    unit: string;
    txSignature: string;
    timestamp: number;
}

export interface DataProvider {
    getStatus: () => EngineStatus;
    getEvents: () => EngineEvent[];
    getLiquidityHistory: () => LiquidityDataPoint[];
    getBuybackHistory: () => BuybackDataPoint[];
    getDepthSnapshots: () => DepthSnapshot[];
    getTopMoments: () => TopMoment[];
    subscribe: (callback: () => void) => () => void;
}
