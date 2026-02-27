'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Activity, Mic, MapPin, FileText, ChevronRight, History, LogOut, User } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { SwasthyaLogo } from './SwasthyaLogo';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function NavigationHUB() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Close menu on outside click
    useEffect(() => {
        const handler = () => setShowUserMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const navItems = [
        { id: 'narrative', label: t('storyTitle'), icon: FileText, href: '#narrative' },
        { id: 'voice', label: t('voiceTitle'), icon: Mic, href: '#narrative' },
        { id: 'analysis', label: t('analysisTitle'), icon: Activity, href: '#analysis' },
        { id: 'care', label: t('careTitle'), icon: MapPin, href: '#analysis' },
    ];

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogout = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    // Get initials from email
    const initials = user?.email
        ? user.email.slice(0, 2).toUpperCase()
        : '??';

    const displayName = user?.user_metadata?.full_name
        ?? user?.email?.split('@')[0]
        ?? 'User';

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

                {/* Analyse CTA */}
                <button
                    onClick={() => scrollToSection('analysis')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                >
                    {t('analyzeBtn')} <ChevronRight className="w-3 h-3" />
                </button>

                {/* User Avatar / Auth Controls */}
                {user ? (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowUserMenu(v => !v)}
                            className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-[11px] uppercase tracking-widest hover:bg-blue-600/30 transition-all"
                            title={displayName}
                        >
                            {initials}
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-12 w-52 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                                >
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <p className="text-white font-black text-[11px] uppercase tracking-wider truncate">{displayName}</p>
                                        <p className="text-slate-600 text-[9px] font-bold truncate mt-0.5">{user.email}</p>
                                    </div>

                                    {/* My Reports */}
                                    <button
                                        onClick={() => { router.push('/history'); setShowUserMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <History className="w-3.5 h-3.5" />
                                        My Reports
                                    </button>

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all border-t border-white/5"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-all"
                    >
                        <User className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Sign In</span>
                    </button>
                )}
            </div>
        </motion.header>
    );
}
