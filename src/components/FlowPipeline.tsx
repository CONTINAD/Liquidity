"use client";

import { motion } from "framer-motion";

const steps = [
    {
        label: "FEES",
        desc: "Trading activity generates protocol fees",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        label: "ACCUMULATE",
        desc: "Fees pool in the accumulator wallet",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: "AUTO-BUY",
        desc: "Threshold hit → engine executes buyback",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        label: "AUTO-LP",
        desc: "Bought tokens added to liquidity pool",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
];

export default function FlowPipeline() {
    return (
        <div className="relative">
            {/* Desktop: horizontal */}
            <div className="hidden md:flex items-start justify-between gap-2">
                {steps.map((step, i) => (
                    <div key={step.label} className="flex items-center flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.5 }}
                            className="flex flex-col items-center text-center flex-1"
                        >
                            <div className="w-16 h-16 rounded-xl glass glow-border flex items-center justify-center text-aqua mb-4">
                                {step.icon}
                            </div>
                            <h4 className="mono text-sm font-semibold text-aqua mb-1">{step.label}</h4>
                            <p className="text-xs text-muted max-w-[140px]">{step.desc}</p>
                        </motion.div>

                        {/* Connector arrow */}
                        {i < steps.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                whileInView={{ opacity: 1, scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 + 0.1, duration: 0.4 }}
                                className="flex-shrink-0 mt-6"
                            >
                                <svg width="40" height="12" viewBox="0 0 40 12" className="text-aqua opacity-40">
                                    <line x1="0" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3">
                                        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
                                    </line>
                                    <polygon points="30,2 38,6 30,10" fill="currentColor" />
                                </svg>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile: vertical */}
            <div className="md:hidden flex flex-col gap-6">
                {steps.map((step, i) => (
                    <div key={step.label} className="flex flex-col items-center gap-3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                            className="flex items-center gap-4 w-full max-w-sm"
                        >
                            <div className="w-14 h-14 rounded-xl glass glow-border flex items-center justify-center text-aqua flex-shrink-0">
                                {step.icon}
                            </div>
                            <div>
                                <h4 className="mono text-sm font-semibold text-aqua">{step.label}</h4>
                                <p className="text-xs text-muted">{step.desc}</p>
                            </div>
                        </motion.div>
                        {i < steps.length - 1 && (
                            <svg width="2" height="24" className="text-aqua opacity-30">
                                <line x1="1" y1="0" x2="1" y2="24" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3">
                                    <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite" />
                                </line>
                            </svg>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
