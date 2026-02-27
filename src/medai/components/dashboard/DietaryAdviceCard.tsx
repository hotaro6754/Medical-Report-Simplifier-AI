'use client';

import { motion } from 'framer-motion';
import { Utensils, Apple, Leaf, Zap } from 'lucide-react';
import { VoiceControls } from '../VoiceControls';


interface DietaryAdviceCardProps {
    advice: string[];
}

export function DietaryAdviceCard({ advice }: DietaryAdviceCardProps) {
    if (!advice || advice.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border border-white/10 shadow-3xl glass-effect relative overflow-hidden"
        >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                        <Utensils className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-1">Tailored for Bharat</span>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Indian Dietary Plan</h3>
                    </div>
                </div>
                <VoiceControls text={`Dietary recommendations. ${advice.join('. ')}`} compact />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advice.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-start gap-4 p-5 rounded-[2rem] bg-slate-950/40 border border-white/5 hover:border-blue-500/30 transition-all hover:bg-slate-950/60 group"
                    >
                        <div className="mt-1">
                            <Leaf className="w-4 h-4 text-emerald-500 group-hover:animate-bounce" />
                        </div>
                        <p className="text-sm font-bold text-slate-200 leading-relaxed">
                            {item}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-center gap-3">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                    This plan focuses on locally available regional superfoods.
                </span>
            </div>
        </motion.div>
    );
}
