"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        q: "What is the Liquidity Engine?",
        a: "A smart contract mechanism that collects protocol fees and automatically converts them into buybacks and liquidity pool additions. No manual intervention — the engine runs itself.",
    },
    {
        q: "How does the auto-buy work?",
        a: "When accumulated fees hit the trigger threshold, the engine executes a market buy of $TIDE tokens. These tokens are then paired with SOL and added to the liquidity pool, deepening market depth.",
    },
    {
        q: "What triggers the engine?",
        a: "The engine fires when the fee accumulator wallet reaches the configured SOL threshold. There's also a cooldown period between triggers to prevent spam and ensure optimal execution.",
    },
    {
        q: "Is there any risk of failed triggers?",
        a: "The engine includes safety mechanisms: max slippage limits, cooldown timers, and a circuit breaker that pauses execution if market conditions are extreme. All parameters are transparent.",
    },
    {
        q: "Can I verify the engine on-chain?",
        a: "Yes. Every buyback and LP add generates an on-chain transaction. You can verify each event via Solscan using the tx signatures shown in the dashboard. The accumulator wallet is public.",
    },
    {
        q: "Does this guarantee profit?",
        a: "No. The engine deepens liquidity and reduces slippage — it doesn't guarantee price appreciation. Better liquidity means better execution for all participants. Always DYOR.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-2 max-w-2xl mx-auto">
            {faqs.map((faq, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border overflow-hidden"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-light transition-colors"
                    >
                        <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                        <motion.span
                            animate={{ rotate: openIndex === i ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-aqua text-lg flex-shrink-0"
                        >
                            +
                        </motion.span>
                    </button>
                    <AnimatePresence>
                        {openIndex === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="px-5 pb-4 text-sm text-muted leading-relaxed">
                                    {faq.a}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
}
