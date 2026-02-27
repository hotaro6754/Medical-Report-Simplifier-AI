'use client';

import { motion } from 'framer-motion';

interface RiskMeterProps {
    score: number;
    assessment: 'low' | 'moderate' | 'high';
}

export function RiskMeter({ score, assessment }: RiskMeterProps) {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (assessment === 'high') return '#ef4444'; // Red-500
        if (assessment === 'moderate') return '#f59e0b'; // Amber-500
        return '#10b981'; // Emerald-500
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Shadow Circle */}
                <div className="absolute inset-0 rounded-full border-[12px] border-white/5 shadow-inner" />

                {/* SVG Gauge */}
                <svg className="w-full h-full -rotate-90 transform overflow-visible">
                    {/* Background Track */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-white/5"
                    />

                    {/* Progress Circle */}
                    <motion.circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="transparent"
                        stroke={getColor()}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                    />
                </svg>

                {/* Score Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-5xl font-black text-white tracking-tighter"
                    >
                        {score}
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
                    >
                        Health Score
                    </motion.span>
                </div>
            </div>

            {/* Assessment Label */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-6 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
            >
                <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: getColor() }} />
                    <span className="text-slate-400">Risk Level:</span>
                    <span style={{ color: getColor() }}>{assessment}</span>
                </span>
            </motion.div>
        </div>
    );
}
