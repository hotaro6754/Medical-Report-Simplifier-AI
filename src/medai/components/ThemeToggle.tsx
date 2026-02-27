'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const cycleTheme = () => {
        if (theme === 'dark') setTheme('light');
        else if (theme === 'light') setTheme('system');
        else setTheme('dark');
    };

    return (
        <button
            onClick={cycleTheme}
            className="fixed top-6 right-6 z-[100] bg-white/5 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl shadow-2xl hover:bg-white/10 transition-all group overflow-hidden"
            aria-label="Toggle Theme"
        >
            <div className="relative w-6 h-6">
                <AnimatePresence mode="wait">
                    {theme === 'dark' && (
                        <motion.div
                            key="dark"
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center text-blue-400"
                        >
                            <Moon className="w-5 h-5 fill-current" />
                        </motion.div>
                    )}
                    {theme === 'light' && (
                        <motion.div
                            key="light"
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center text-yellow-500"
                        >
                            <Sun className="w-5 h-5 fill-current" />
                        </motion.div>
                    )}
                    {theme === 'system' && (
                        <motion.div
                            key="system"
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center text-slate-400"
                        >
                            <Monitor className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Visual tool-tip on hover */}
            <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-slate-900/90 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {theme?.toUpperCase()} MODE
            </span>
        </button>
    );
}
