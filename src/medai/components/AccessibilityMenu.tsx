'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Type, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { useAccessibility } from './AccessibilityContext';

export function AccessibilityMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { highContrast, setHighContrast, textSize, setTextSize } = useAccessibility();

    return (
        <div className="fixed bottom-6 left-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-full mb-4 left-0 w-64 bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-black text-xs uppercase tracking-widest">Accessibility</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Eye className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold text-slate-300">High Contrast</span>
                                </div>
                                <div className="flex bg-slate-800 p-1 rounded-lg">
                                    <button
                                        className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-all ${!highContrast ? 'bg-blue-500 text-white' : 'text-slate-400'}`}
                                        onClick={() => setHighContrast(false)}
                                    >
                                        Off
                                    </button>
                                    <button
                                        className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-all ${highContrast ? 'bg-blue-500 text-white' : 'text-slate-400'}`}
                                        onClick={() => setHighContrast(true)}
                                    >
                                        On
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Type className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold text-slate-300">Text Size</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTextSize('normal')}
                                        className={`flex-1 py-1 text-xs font-bold rounded border ${textSize === 'normal' ? 'border-blue-500 bg-blue-500/20 text-blue-200' : 'border-white/10 text-slate-400'}`}
                                    >A</button>
                                    <button
                                        onClick={() => setTextSize('large')}
                                        className={`flex-1 py-1 text-sm font-bold rounded border ${textSize === 'large' ? 'border-blue-500 bg-blue-500/20 text-blue-200' : 'border-white/10 text-slate-400'}`}
                                    >A</button>
                                    <button
                                        onClick={() => setTextSize('extralarge')}
                                        className={`flex-1 py-1 text-lg font-bold rounded border ${textSize === 'extralarge' ? 'border-blue-500 bg-blue-500/20 text-blue-200' : 'border-white/10 text-slate-400'}`}
                                    >A</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center border-2 border-white/10 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
            >
                <Settings2 className="w-5 h-5 text-white" />
            </button>
        </div>
    );
}
