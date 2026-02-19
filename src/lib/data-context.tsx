"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { siteConfig } from "../config/site.config";
import { createMockProvider } from "./mock-provider";
import { createLiveProvider } from "./live-adapter";
import type { DataProvider, EngineStatus, EngineEvent, LiquidityDataPoint, BuybackDataPoint, DepthSnapshot, TopMoment } from "./types";

interface EngineData {
    status: EngineStatus;
    events: EngineEvent[];
    liquidityHistory: LiquidityDataPoint[];
    buybackHistory: BuybackDataPoint[];
    depthSnapshots: DepthSnapshot[];
    topMoments: TopMoment[];
    isMockMode: boolean;
}

const EngineDataContext = createContext<EngineData | null>(null);

export function DataProviderWrapper({ children }: { children: React.ReactNode }) {
    const providerRef = useRef<DataProvider | null>(null);
    const [data, setData] = useState<EngineData | null>(null);

    const refresh = useCallback(() => {
        if (!providerRef.current) return;
        const p = providerRef.current;
        setData({
            status: p.getStatus(),
            events: p.getEvents(),
            liquidityHistory: p.getLiquidityHistory(),
            buybackHistory: p.getBuybackHistory(),
            depthSnapshots: p.getDepthSnapshots(),
            topMoments: p.getTopMoments(),
            isMockMode: siteConfig.dataMode === "mock",
        });
    }, []);

    useEffect(() => {
        const isMock = siteConfig.dataMode === "mock";
        const provider = isMock ? createMockProvider() : createLiveProvider();
        providerRef.current = provider;
        refresh();

        const unsub = provider.subscribe(refresh);
        return unsub;
    }, [refresh]);

    if (!data) return null;

    return (
        <EngineDataContext.Provider value={data}>
            {children}
        </EngineDataContext.Provider>
    );
}

export function useEngineData(): EngineData {
    const ctx = useContext(EngineDataContext);
    if (!ctx) throw new Error("useEngineData must be used within DataProviderWrapper");
    return ctx;
}
