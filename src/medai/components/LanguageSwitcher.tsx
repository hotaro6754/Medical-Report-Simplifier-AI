'use client';

import { useLanguage, Language } from './LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const languages: { code: Language; name: string; native: string }[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
];

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === language);

    return (
        <div className="fixed top-6 right-24 z-[100]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl hover:bg-white/10 transition-all group"
            >
                <Languages className="w-4 h-4 text-medical-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">
                    {currentLang?.native}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform text-slate-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 right-0 bg-medical-surface/90 backdrop-blur-3xl border border-glass-border p-2 rounded-2xl shadow-premium min-w-[160px] grid grid-cols-1 gap-1"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`flex flex-col items-start px-3 py-2 rounded-xl transition-all ${language === lang.code
                                    ? 'bg-medical-primary text-white'
                                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                    }`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-tighter">{lang.name}</span>
                                <span className="text-sm font-medium">{lang.native}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
