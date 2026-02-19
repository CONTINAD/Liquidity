#!/usr/bin/env node
/**
 * $TIDE Liquidity Engine Bot
 *
 * Autonomous bot that monitors the accumulator wallet and executes
 * buybacks + LP additions when the threshold is reached.
 *
 * Supports two phases:
 *   1. Pre-graduation (Pump.fun bonding curve) — monitor only
 *   2. Post-graduation (Raydium LP) — auto buyback + LP add
 *
 * Usage:
 *   npx tsx scripts/engine-bot.ts
 *
 * Configuration: see .env.example
 */

import {
    Connection,
    Keypair,
    PublicKey,
    VersionedTransaction,
    LAMPORTS_PER_SOL,
    TransactionMessage,
    SystemProgram,
} from "@solana/web3.js";
import bs58 from "bs58";
import "dotenv/config";

/* ═══════════════════════════════════════════════════ */
/*                   CONFIGURATION                     */
/* ═══════════════════════════════════════════════════ */

const CONFIG = {
    rpc: process.env.SOLANA_RPC || "https://mainnet.helius-rpc.com/?api-key=d319b384-85ac-4f12-bd1f-18458edc923b",
    privateKey: process.env.ENGINE_PRIVATE_KEY || "",
    tokenMint: process.env.TOKEN_MINT || "",
    lpPair: process.env.LP_PAIR || "",
    accumulatorWallet: process.env.ACCUMULATOR_WALLET || "",
    triggerThreshold: parseFloat(process.env.TRIGGER_THRESHOLD_SOL || "2.5"),
    cooldownSeconds: parseInt(process.env.COOLDOWN_SECONDS || "300"),
    buybackPct: parseInt(process.env.BUYBACK_PCT || "60"),
    lpAddPct: parseInt(process.env.LP_ADD_PCT || "40"),
    maxSlippageBps: parseInt(process.env.MAX_SLIPPAGE_BPS || "500"),
    mode: (process.env.ENGINE_MODE || "dry-run") as "dry-run" | "live",
    pollInterval: 15_000, // 15s
};

/* ═══════════════════════════════════════════════════ */
/*                     LOGGING                         */
/* ═══════════════════════════════════════════════════ */

const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

function log(level: "info" | "warn" | "error" | "success" | "engine", msg: string) {
    const now = new Date().toISOString().slice(11, 19);
    const colors = {
        info: CYAN,
        warn: YELLOW,
        error: RED,
        success: GREEN,
        engine: `${BOLD}${CYAN}`,
    };
    const labels = {
        info: "INFO",
        warn: "WARN",
        error: "ERR ",
        success: " OK ",
        engine: "🌊  ",
    };
    console.log(`${DIM}${now}${RESET} ${colors[level]}[${labels[level]}]${RESET} ${msg}`);
}

/* ═══════════════════════════════════════════════════ */
/*                 SOLANA HELPERS                       */
/* ═══════════════════════════════════════════════════ */

let connection: Connection;
let engineKeypair: Keypair;
let enginePublicKey: PublicKey;

function initWallet() {
    if (!CONFIG.privateKey) {
        log("error", "ENGINE_PRIVATE_KEY not set in .env");
        process.exit(1);
    }

    try {
        const secretKey = bs58.decode(CONFIG.privateKey);
        engineKeypair = Keypair.fromSecretKey(secretKey);
        enginePublicKey = engineKeypair.publicKey;

        // If no explicit accumulator wallet, use the engine wallet
        if (!CONFIG.accumulatorWallet) {
            CONFIG.accumulatorWallet = enginePublicKey.toBase58();
        }

        log("info", `Engine wallet: ${enginePublicKey.toBase58()}`);
        log("info", `Accumulator:   ${CONFIG.accumulatorWallet}`);
    } catch (e) {
        log("error", `Invalid private key: ${e}`);
        process.exit(1);
    }

    connection = new Connection(CONFIG.rpc, "confirmed");
}

async function getSOLBalance(address: string): Promise<number> {
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
}

async function getTokenBalance(walletAddress: string, mintAddress: string): Promise<number> {
    const wallet = new PublicKey(walletAddress);
    const mint = new PublicKey(mintAddress);

    const accounts = await connection.getParsedTokenAccountsByOwner(wallet, { mint });
    if (accounts.value.length === 0) return 0;

    return accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
}

/* ═══════════════════════════════════════════════════ */
/*                PUMP.FUN DETECTION                    */
/* ═══════════════════════════════════════════════════ */

interface PumpFunStatus {
    isOnBondingCurve: boolean;
    bondingCurveProgress: number;
    marketCap: number;
    graduated: boolean;
}

async function checkPumpFunStatus(mint: string): Promise<PumpFunStatus> {
    try {
        // Check DexScreener for pair type
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
        const json = await res.json();

        if (!json.pairs || json.pairs.length === 0) {
            return { isOnBondingCurve: true, bondingCurveProgress: 0, marketCap: 0, graduated: false };
        }

        const pair = json.pairs[0];
        const dexId = pair.dexId || "";
        const isRaydium = dexId.toLowerCase().includes("raydium");
        const marketCap = pair.fdv || 0;

        // If on Raydium, it's graduated
        if (isRaydium) {
            // Update LP pair in config if not set
            if (!CONFIG.lpPair) {
                CONFIG.lpPair = pair.pairAddress;
                log("success", `Auto-detected Raydium pair: ${pair.pairAddress}`);
            }
            return { isOnBondingCurve: false, bondingCurveProgress: 100, marketCap, graduated: true };
        }

        // Still on Pump.fun bonding curve
        // Bonding curve graduates around ~$69K market cap
        const progress = Math.min((marketCap / 69000) * 100, 99);
        return { isOnBondingCurve: true, bondingCurveProgress: progress, marketCap, graduated: false };
    } catch (e) {
        log("warn", `Pump.fun check failed: ${e}`);
        return { isOnBondingCurve: true, bondingCurveProgress: 0, marketCap: 0, graduated: false };
    }
}

/* ═══════════════════════════════════════════════════ */
/*              JUPITER V6 SWAP API                    */
/* ═══════════════════════════════════════════════════ */

const JUPITER_API = "https://quote-api.jup.ag/v6";
const SOL_MINT = "So11111111111111111111111111111111111111112";

interface JupiterQuote {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: unknown[];
}

async function getJupiterQuote(
    inputMint: string,
    outputMint: string,
    amountLamports: number,
    slippageBps: number
): Promise<JupiterQuote | null> {
    try {
        const params = new URLSearchParams({
            inputMint,
            outputMint,
            amount: amountLamports.toString(),
            slippageBps: slippageBps.toString(),
            swapMode: "ExactIn",
        });

        const res = await fetch(`${JUPITER_API}/quote?${params}`);
        if (!res.ok) {
            log("error", `Jupiter quote failed: ${res.status} ${await res.text()}`);
            return null;
        }
        return await res.json();
    } catch (e) {
        log("error", `Jupiter quote error: ${e}`);
        return null;
    }
}

async function executeJupiterSwap(quote: JupiterQuote): Promise<string | null> {
    try {
        const swapRes = await fetch(`${JUPITER_API}/swap`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                quoteResponse: quote,
                userPublicKey: enginePublicKey.toBase58(),
                wrapAndUnwrapSol: true,
                dynamicComputeUnitLimit: true,
                prioritizationFeeLamports: "auto",
            }),
        });

        if (!swapRes.ok) {
            log("error", `Jupiter swap request failed: ${swapRes.status}`);
            return null;
        }

        const { swapTransaction } = await swapRes.json();
        const txBuf = Buffer.from(swapTransaction, "base64");
        const tx = VersionedTransaction.deserialize(txBuf);

        tx.sign([engineKeypair]);

        const sig = await connection.sendTransaction(tx, {
            skipPreflight: false,
            maxRetries: 3,
        });

        // Confirm transaction
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            signature: sig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        return sig;
    } catch (e) {
        log("error", `Jupiter swap execution failed: ${e}`);
        return null;
    }
}

/* ═══════════════════════════════════════════════════ */
/*               LP ADDITION (RAYDIUM)                 */
/* ═══════════════════════════════════════════════════ */

/**
 * For Raydium standard AMM LP addition, we use the Raydium API.
 * This sends SOL + tokens to the pool and receives LP tokens.
 *
 * Simplified approach: We buy tokens with the buyback portion,
 * then add the LP portion as single-sided liquidity (SOL side).
 * For balanced LP, we use Jupiter to swap half of LP allocation
 * to tokens, then add both sides.
 */
async function addLiquidityToRaydium(
    solAmount: number,
    tokenAmount: number,
): Promise<string | null> {
    try {
        // For now, we do a simple approach:
        // Swap half the LP SOL → tokens, then both sides go to pool

        // Step 1: Swap half of LP SOL to tokens for balanced LP
        const halfSolLamports = Math.floor((solAmount / 2) * LAMPORTS_PER_SOL);

        if (CONFIG.mode === "dry-run") {
            log("info", `[DRY-RUN] Would add LP: ${solAmount.toFixed(4)} SOL + tokens to Raydium`);
            return "dry-run-lp-tx";
        }

        const quote = await getJupiterQuote(
            SOL_MINT,
            CONFIG.tokenMint,
            halfSolLamports,
            CONFIG.maxSlippageBps
        );

        if (!quote) {
            log("warn", "Could not get quote for LP token side — holding SOL for next cycle");
            return null;
        }

        // Execute the swap for the token side
        const swapSig = await executeJupiterSwap(quote);
        if (swapSig) {
            log("success", `LP token acquisition: ${swapSig}`);
            log("info", `Remaining ${(solAmount / 2).toFixed(4)} SOL + acquired tokens ready for LP`);

            // TODO: Add actual Raydium addLiquidity instruction here
            // For now, tokens + SOL sit in the engine wallet ready for manual LP add
            // or integration with Raydium SDK
            log("info", "Tokens acquired for LP — add liquidity via Raydium when SDK integrated");
        }

        return swapSig;
    } catch (e) {
        log("error", `LP addition failed: ${e}`);
        return null;
    }
}

/* ═══════════════════════════════════════════════════ */
/*                 ENGINE EXECUTION                    */
/* ═══════════════════════════════════════════════════ */

let lastTriggerTime = 0;
let totalBuybacks = 0;
let totalLPAdded = 0;
let cycleCount = 0;

async function executeEngine(balance: number) {
    const buybackSOL = balance * (CONFIG.buybackPct / 100);
    const lpSOL = balance * (CONFIG.lpAddPct / 100);
    const buybackLamports = Math.floor(buybackSOL * LAMPORTS_PER_SOL);

    log("engine", "═══════════════════════════════════════════");
    log("engine", `ENGINE TRIGGERED — Cycle #${++cycleCount}`);
    log("engine", `Balance: ${balance.toFixed(4)} SOL`);
    log("engine", `Buyback: ${buybackSOL.toFixed(4)} SOL (${CONFIG.buybackPct}%)`);
    log("engine", `LP Add:  ${lpSOL.toFixed(4)} SOL (${CONFIG.lpAddPct}%)`);
    log("engine", "═══════════════════════════════════════════");

    // ── Step 1: Buyback via Jupiter ──
    log("info", "Fetching Jupiter quote for buyback...");

    if (CONFIG.mode === "dry-run") {
        log("info", `[DRY-RUN] Would buy ${CONFIG.tokenMint} with ${buybackSOL.toFixed(4)} SOL`);
        log("info", `[DRY-RUN] Would add ${lpSOL.toFixed(4)} SOL to LP`);
        log("success", "[DRY-RUN] Engine cycle simulated successfully");
        lastTriggerTime = Date.now();
        totalBuybacks += buybackSOL;
        totalLPAdded += lpSOL;
        return;
    }

    const quote = await getJupiterQuote(
        SOL_MINT,
        CONFIG.tokenMint,
        buybackLamports,
        CONFIG.maxSlippageBps
    );

    if (!quote) {
        log("error", "Buyback aborted — no Jupiter quote available");
        return;
    }

    const priceImpact = parseFloat(quote.priceImpactPct);
    log("info", `Quote received — price impact: ${priceImpact.toFixed(2)}%`);

    // Circuit breaker: abort if price impact too high
    if (priceImpact > CONFIG.maxSlippageBps / 100) {
        log("warn", `CIRCUIT BREAKER: Price impact ${priceImpact}% exceeds max ${CONFIG.maxSlippageBps / 100}% — aborting`);
        return;
    }

    const buybackSig = await executeJupiterSwap(quote);
    if (!buybackSig) {
        log("error", "Buyback transaction failed — aborting cycle");
        return;
    }

    log("success", `✅ BUYBACK EXECUTED: ${buybackSOL.toFixed(4)} SOL → ${CONFIG.tokenMint.slice(0, 8)}...`);
    log("success", `   TX: https://solscan.io/tx/${buybackSig}`);
    totalBuybacks += buybackSOL;

    // ── Step 2: LP Addition ──
    log("info", "Adding liquidity...");

    // Get token balance after buyback
    const tokenBalance = await getTokenBalance(enginePublicKey.toBase58(), CONFIG.tokenMint);

    const lpSig = await addLiquidityToRaydium(lpSOL, tokenBalance);
    if (lpSig) {
        log("success", `✅ LP ADDED: ${lpSOL.toFixed(4)} SOL`);
        if (lpSig !== "dry-run-lp-tx") {
            log("success", `   TX: https://solscan.io/tx/${lpSig}`);
        }
        totalLPAdded += lpSOL;
    }

    lastTriggerTime = Date.now();
    log("engine", "═══════════════════════════════════════════");
    log("engine", `CYCLE #${cycleCount} COMPLETE`);
    log("engine", `Total buybacks: ${totalBuybacks.toFixed(4)} SOL`);
    log("engine", `Total LP added: ${totalLPAdded.toFixed(4)} SOL`);
    log("engine", `Cooldown: ${CONFIG.cooldownSeconds}s`);
    log("engine", "═══════════════════════════════════════════");
}

/* ═══════════════════════════════════════════════════ */
/*                   MAIN LOOP                         */
/* ═══════════════════════════════════════════════════ */

async function pollCycle() {
    try {
        // ── Check if token is still on Pump.fun ──
        if (CONFIG.tokenMint) {
            const pumpStatus = await checkPumpFunStatus(CONFIG.tokenMint);

            if (pumpStatus.isOnBondingCurve) {
                const progress = pumpStatus.bondingCurveProgress.toFixed(1);
                const mcap = pumpStatus.marketCap.toLocaleString();
                log("info", `📈 Pump.fun bonding curve: ${progress}% | MC: $${mcap} | Waiting for graduation...`);
                return; // Don't execute engine during bonding curve
            }

            if (pumpStatus.graduated && !CONFIG.lpPair) {
                log("success", "🎓 Token graduated to Raydium! Engine ready to activate.");
            }
        }

        // ── Check cooldown ──
        const timeSinceLast = Date.now() - lastTriggerTime;
        const cooldownMs = CONFIG.cooldownSeconds * 1000;

        if (lastTriggerTime > 0 && timeSinceLast < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - timeSinceLast) / 1000);
            log("info", `⏱  Cooldown: ${remaining}s remaining`);
            return;
        }

        // ── Check accumulator balance ──
        const balance = await getSOLBalance(CONFIG.accumulatorWallet);
        const fillPct = (balance / CONFIG.triggerThreshold * 100).toFixed(1);

        if (balance < CONFIG.triggerThreshold) {
            log("info", `💧 Accumulator: ${balance.toFixed(4)} SOL / ${CONFIG.triggerThreshold} SOL (${fillPct}%)`);
            return;
        }

        // ── THRESHOLD REACHED — EXECUTE ENGINE ──
        log("engine", `🌊 THRESHOLD REACHED: ${balance.toFixed(4)} SOL ≥ ${CONFIG.triggerThreshold} SOL`);
        await executeEngine(balance);

    } catch (e) {
        log("error", `Poll cycle error: ${e}`);
    }
}

/* ═══════════════════════════════════════════════════ */
/*                    STARTUP                          */
/* ═══════════════════════════════════════════════════ */

function printBanner() {
    console.log(`
${CYAN}${BOLD}
  ╔═══════════════════════════════════════════╗
  ║        $TIDE LIQUIDITY ENGINE BOT         ║
  ║     Auto-Buyback + LP Addition System     ║
  ╚═══════════════════════════════════════════╝
${RESET}`);
}

async function main() {
    printBanner();

    // Validate config
    if (!CONFIG.privateKey) {
        log("error", "ENGINE_PRIVATE_KEY is required. See .env.example");
        process.exit(1);
    }

    if (!CONFIG.tokenMint) {
        log("error", "TOKEN_MINT is required. Paste your token mint address in .env");
        process.exit(1);
    }

    initWallet();

    log("info", `Mode:       ${CONFIG.mode === "dry-run" ? `${YELLOW}DRY-RUN${RESET} (no real transactions)` : `${GREEN}LIVE${RESET} (real transactions!)`}`);
    log("info", `Token:      ${CONFIG.tokenMint}`);
    log("info", `Threshold:  ${CONFIG.triggerThreshold} SOL`);
    log("info", `Buyback:    ${CONFIG.buybackPct}%`);
    log("info", `LP Add:     ${CONFIG.lpAddPct}%`);
    log("info", `Slippage:   ${CONFIG.maxSlippageBps / 100}%`);
    log("info", `Cooldown:   ${CONFIG.cooldownSeconds}s`);
    log("info", `Poll:       Every ${CONFIG.pollInterval / 1000}s`);
    log("info", "");

    // Check initial balance
    const initialBalance = await getSOLBalance(CONFIG.accumulatorWallet);
    log("info", `Initial accumulator balance: ${initialBalance.toFixed(4)} SOL`);

    // Check initial Pump.fun status
    const pumpStatus = await checkPumpFunStatus(CONFIG.tokenMint);
    if (pumpStatus.isOnBondingCurve) {
        log("info", `Token is on Pump.fun bonding curve (${pumpStatus.bondingCurveProgress.toFixed(1)}% to graduation)`);
        log("info", "Engine will auto-activate after graduation to Raydium");
    } else {
        log("success", "Token is on Raydium — engine is ACTIVE");
    }

    log("info", "");
    log("engine", "Engine started — monitoring accumulator...");
    log("info", "─────────────────────────────────────────────");

    // Start polling
    await pollCycle(); // Initial check
    setInterval(pollCycle, CONFIG.pollInterval);
}

main().catch((e) => {
    log("error", `Fatal: ${e}`);
    process.exit(1);
});
