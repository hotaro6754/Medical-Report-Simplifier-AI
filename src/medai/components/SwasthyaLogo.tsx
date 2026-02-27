'use client';

import { motion } from 'framer-motion';

export function SwasthyaLogo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <motion.div
            className={`relative flex items-center justify-center ${className}`}
            whileHover={{ scale: 1.05 }}
        >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Abstract "S" that forms a medical cross or a healing hand */}
                <motion.path
                    d="M30 20C30 20 45 15 60 20C75 25 80 40 70 55C60 70 40 70 30 80C20 90 40 95 60 85"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <motion.circle
                    cx="50" cy="50" r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-20"
                />
                {/* Inner Heart/Pulse shape */}
                <motion.path
                    d="M40 50L45 40L55 60L60 50"
                    stroke="var(--color-medical-accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                />
            </svg>
        </motion.div>
    );
}
