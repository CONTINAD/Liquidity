"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OdometerNumberProps {
    value: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export default function OdometerNumber({
    value,
    decimals = 2,
    prefix = "",
    suffix = "",
    className = "",
}: OdometerNumberProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const prevValue = useRef(value);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const start = prevValue.current;
        const end = value;
        const duration = 800;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(start + (end - start) * eased);

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                prevValue.current = end;
            }
        };

        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [value]);

    const formatted = displayValue.toFixed(decimals);
    const [intPart, decPart] = formatted.split(".");

    return (
        <span className={`mono inline-flex items-baseline ${className}`}>
            {prefix && <span className="text-muted mr-0.5">{prefix}</span>}
            <AnimatePresence mode="popLayout">
                {intPart.split("").map((digit, i) => (
                    <motion.span
                        key={`${i}-${digit}`}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="inline-block"
                    >
                        {digit}
                    </motion.span>
                ))}
            </AnimatePresence>
            {decPart && (
                <>
                    <span className="opacity-50">.</span>
                    <span className="opacity-60 text-[0.85em]">{decPart}</span>
                </>
            )}
            {suffix && <span className="text-muted ml-1 text-[0.7em]">{suffix}</span>}
        </span>
    );
}
