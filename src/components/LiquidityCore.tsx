"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LiquidityCoreProps {
    fillPercentage: number;
    triggerThreshold: number;
    accumulatorBalance: number;
    className?: string;
}

export default function LiquidityCore({
    fillPercentage,
    accumulatorBalance,
    className = "",
}: LiquidityCoreProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isPulsing, setIsPulsing] = useState(false);
    const prevFillRef = useRef(fillPercentage);

    // Detect trigger pulse: fill drops significantly
    useEffect(() => {
        if (prevFillRef.current > 80 && fillPercentage < 20) {
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 2000);
        }
        prevFillRef.current = fillPercentage;
    }, [fillPercentage]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePos({ x, y });
    }, []);

    const fillHeight = Math.min(100, Math.max(0, fillPercentage));
    const glowIntensity = fillPercentage / 100;

    return (
        <div
            ref={containerRef}
            className={`relative select-none ${className}`}
            onMouseMove={handleMouseMove}
            style={{ width: "320px", height: "320px" }}
        >
            <svg
                viewBox="0 0 320 320"
                className="w-full h-full"
                style={{
                    transform: `perspective(800px) rotateX(${mousePos.y * -3}deg) rotateY(${mousePos.x * 3}deg)`,
                    transition: "transform 0.15s ease-out",
                }}
            >
                <defs>
                    {/* Glow filter */}
                    <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation={8 + glowIntensity * 12} result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
                    </filter>

                    {/* Gradient for the fill */}
                    <linearGradient id="fillGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#00d4aa" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.2" />
                    </linearGradient>

                    {/* Clip for fill level */}
                    <clipPath id="fillClip">
                        <rect
                            x="80"
                            y={80 + (160 * (1 - fillHeight / 100))}
                            width="160"
                            height={160 * (fillHeight / 100)}
                            rx="4"
                        />
                    </clipPath>

                    {/* Radial glow for background */}
                    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.05 + glowIntensity * 0.1} />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Background glow */}
                <circle cx="160" cy="160" r="150" fill="url(#bgGlow)" />

                {/* Outer ring */}
                <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="#1e2530"
                    strokeWidth="2"
                    opacity="0.5"
                />
                <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="1"
                    opacity={0.1 + glowIntensity * 0.3}
                    filter="url(#coreGlow)"
                />

                {/* Inner chamber outline */}
                <rect
                    x="78"
                    y="78"
                    width="164"
                    height="164"
                    rx="12"
                    fill="none"
                    stroke="#1e2530"
                    strokeWidth="2"
                />
                <rect
                    x="78"
                    y="78"
                    width="164"
                    height="164"
                    rx="12"
                    fill="rgba(10, 14, 20, 0.6)"
                    stroke="#00f0ff"
                    strokeWidth="1"
                    opacity={0.15 + glowIntensity * 0.2}
                />

                {/* Fill level */}
                <rect
                    x="80"
                    y={80 + (160 * (1 - fillHeight / 100))}
                    width="160"
                    height={160 * (fillHeight / 100)}
                    rx="4"
                    fill="url(#fillGrad)"
                    opacity={0.4 + glowIntensity * 0.4}
                >
                    <animate
                        attributeName="opacity"
                        values={`${0.4 + glowIntensity * 0.3};${0.5 + glowIntensity * 0.4};${0.4 + glowIntensity * 0.3}`}
                        dur="3s"
                        repeatCount="indefinite"
                    />
                </rect>

                {/* Threshold marker line */}
                <line
                    x1="75"
                    y1={80 + 160 * 0.0}
                    x2="245"
                    y2={80 + 160 * 0.0}
                    stroke="#00f0ff"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.4"
                />
                <text
                    x="250"
                    y={80 + 160 * 0.0 + 4}
                    fill="#00f0ff"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    opacity="0.6"
                >
                    TRIGGER
                </text>

                {/* Tick marks */}
                {[25, 50, 75].map((pct) => (
                    <g key={pct} opacity="0.25">
                        <line
                            x1="75"
                            y1={80 + 160 * (1 - pct / 100)}
                            x2="82"
                            y2={80 + 160 * (1 - pct / 100)}
                            stroke="#e8eaed"
                            strokeWidth="1"
                        />
                        <text
                            x="68"
                            y={80 + 160 * (1 - pct / 100) + 3}
                            fill="#e8eaed"
                            fontSize="8"
                            fontFamily="var(--font-mono)"
                            textAnchor="end"
                        >
                            {pct}%
                        </text>
                    </g>
                ))}

                {/* Center readout */}
                <text
                    x="160"
                    y="155"
                    textAnchor="middle"
                    fill="#e8eaed"
                    fontSize="28"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                >
                    {accumulatorBalance.toFixed(2)}
                </text>
                <text
                    x="160"
                    y="175"
                    textAnchor="middle"
                    fill="#00f0ff"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    opacity="0.7"
                >
                    SOL ACCUMULATED
                </text>

                {/* Corner decorations */}
                {[
                    { x: 40, y: 40, rotate: 0 },
                    { x: 280, y: 40, rotate: 90 },
                    { x: 280, y: 280, rotate: 180 },
                    { x: 40, y: 280, rotate: 270 },
                ].map((corner, i) => (
                    <g
                        key={i}
                        transform={`translate(${corner.x}, ${corner.y}) rotate(${corner.rotate})`}
                        opacity="0.3"
                    >
                        <line x1="0" y1="0" x2="15" y2="0" stroke="#00f0ff" strokeWidth="1" />
                        <line x1="0" y1="0" x2="0" y2="15" stroke="#00f0ff" strokeWidth="1" />
                    </g>
                ))}

                {/* Orbiting dots */}
                {[0, 120, 240].map((angle, i) => {
                    const rad = ((angle + Date.now() / 50) * Math.PI) / 180;
                    const orbitR = 145;
                    return (
                        <circle
                            key={i}
                            cx={160 + Math.cos(rad) * orbitR}
                            cy={160 + Math.sin(rad) * orbitR}
                            r="2"
                            fill="#00f0ff"
                            opacity={0.3 + glowIntensity * 0.4}
                        >
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from={`${angle} 160 160`}
                                to={`${angle + 360} 160 160`}
                                dur={`${12 + i * 2}s`}
                                repeatCount="indefinite"
                            />
                        </circle>
                    );
                })}
            </svg>

            {/* Pulse explosion overlay */}
            <AnimatePresence>
                {isPulsing && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
