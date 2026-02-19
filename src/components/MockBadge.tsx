"use client";

import { motion } from "framer-motion";

export default function MockBadge({ show }: { show: boolean }) {
    if (!show) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-4 z-40 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs mono font-semibold"
        >
            MOCK MODE
        </motion.div>
    );
}
