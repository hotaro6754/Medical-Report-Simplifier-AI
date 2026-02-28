'use client';

import { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Activity, Mic, MapPin, FileText, ChevronRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { SwasthyaLogo } from './SwasthyaLogo';
import { useAuth } from './AuthContext';
import Link from 'next/link';

export function NavigationHUB() {
    const { t } = useLanguage();
    const { user, signOut } = useAuth();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const navItems = [
        { id: 'narrative', label: t('storyTitle'), icon: FileText },
        { id: 'voice', label: t('voiceTitle'), icon: Mic },
        { id: 'analysis', label: t('analysisTitle'), icon: Activity },
        { id: 'care', label: t('careTitle'), icon: MapPin },
    ];

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-[90] flex justify-center p-6 pointer-events-none"
        >
            <div className="bg-medical-surface/80 backdrop-blur-2xl border border-glass-border px-6 py-3 rounded-full shadow-glass flex items-center gap-6 pointer-events-auto relative overflow-hidden">
                {/* Scroll progress bar */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-medical-primary/30 origin-left"
                    style={{ scaleX }}
                />

                {/* Logo */}
                <div
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => scrollToSection('hero')}
                >
                    <div className="w-10 h-10 flex items-center justify-center">
                        <SwasthyaLogo className="w-8 h-8 text-medical-primary" />
                    </div>
                    <span className="font-black text-[12px] uppercase tracking-[0.2em] group-hover:text-medical-primary transition-colors">
                        Swasthya <span className="text-slate-600 dark:text-slate-500">AI</span>
                    </span>
                </div>

                <div className="h-4 w-[1px] bg-glass-border mx-1" />

                {/* Nav items */}
                <nav className="flex items-center gap-5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-500 hover:text-medical-primary transition-all relative group"
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">{item.label}</span>
                            <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-medical-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        </button>
                    ))}
                </nav>

                <div className="h-4 w-[1px] bg-glass-border mx-1" />

                {/* Analyse CTA & Auth */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => scrollToSection('analysis')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 whitespace-nowrap"
                    >
                        {t('analyzeBtn')} <ChevronRight className="w-3 h-3" />
                    </button>

                    <div className="h-4 w-[1px] bg-glass-border mx-1" />

                    {user ? (
                        <button
                            onClick={signOut}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors whitespace-nowrap px-2"
                        >
                            Log Out
                        </button>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors whitespace-nowrap px-2"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
