export const siteConfig = {
  name: "$TIDE",
  tagline: "LIQUIDITY IS THE PRODUCT.",
  description:
    "Fees accumulate. The engine buys. Liquidity deepens. On-chain proof.",

  // Token details — paste your values
  token: {
    mint: "YOUR_TOKEN_MINT_ADDRESS",
    pair: "YOUR_LP_PAIR_ADDRESS",
    decimals: 9,
    symbol: "$TIDE",
  },

  // Fee accumulator
  engine: {
    accumulatorWallet: "YOUR_FEE_ACCUMULATOR_WALLET",
    triggerThresholdSOL: 2.5,
    cooldownSeconds: 300,
    maxSlippageBps: 500,
    buybackPct: 60,
    lpAddPct: 40,
  },

  // Data mode
  dataMode: "mock" as "mock" | "live",

  // API keys (live mode)
  apis: {
    solanaRpc: "https://mainnet.helius-rpc.com/?api-key=d319b384-85ac-4f12-bd1f-18458edc923b",
    heliusKey: "d319b384-85ac-4f12-bd1f-18458edc923b",
    birdeyeKey: "",
  },

  // Links
  links: {
    buy: "https://raydium.io/swap",
    dexscreener: "https://dexscreener.com/solana/YOUR_PAIR",
    birdeye: "https://birdeye.so/token/YOUR_MINT",
    telegram: "https://t.me/YOUR_TG",
    twitter: "https://x.com/YOUR_TWITTER",
    github: "",
  },
};

export type SiteConfig = typeof siteConfig;
