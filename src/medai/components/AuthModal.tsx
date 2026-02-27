'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Mail, Lock, User, Loader2, AlertCircle, ArrowRight, CheckSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    message?: string; // e.g. "Sign in to save your report analysis"
}

type AuthMode = 'login' | 'signup';

export function AuthModal({ isOpen, onClose, onSuccess, message }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const reset = () => {
        setEmail(''); setPassword(''); setName('');
        setAgreed(false); setLoading(false);
        setError(null); setSuccessMsg(null);
    };

    const switchMode = (m: AuthMode) => { reset(); setMode(m); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                // User-friendly error messages
                if (error.message.toLowerCase().includes('not confirmed')) {
                    setError('Please verify your email. Check your inbox for the OTP code.');
                } else if (error.message.toLowerCase().includes('invalid')) {
                    setError('Incorrect email or password. Please try again.');
                } else {
                    setError(error.message);
                }
                setLoading(false);
            } else {
                onSuccess();
            }
        } else {
            if (!agreed) { setError('Please agree to the privacy policy.'); setLoading(false); return; }
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: name } },
            });
            if (error) {
                if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                    setError('Email rate limit reached. Please wait a few minutes and try again, or use a different email.');
                } else {
                    setError(error.message);
                }
                setLoading(false);
            } else {
                setSuccessMsg('Account created! Check your email for a 6-digit verification code, then sign in.');
                setMode('login');
                setLoading(false);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md bg-slate-900/95 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top gradient bar */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                    </h2>
                                    {message && (
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Success message */}
                            <AnimatePresence>
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold uppercase tracking-wide"
                                    >
                                        {successMsg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'signup' && (
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            type="text" placeholder="Full Name" value={name}
                                            onChange={(e) => setName(e.target.value)} required
                                            className="pl-11 py-6 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-blue-500/50 font-bold"
                                        />
                                    </div>
                                )}

                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <Input
                                        type="email" placeholder="name@example.com" value={email}
                                        onChange={(e) => setEmail(e.target.value)} required
                                        className="pl-11 py-6 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-blue-500/50 font-bold"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <Input
                                        type="password" placeholder="••••••••" value={password}
                                        onChange={(e) => setPassword(e.target.value)} required
                                        className="pl-11 py-6 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-blue-500/50 font-bold"
                                    />
                                </div>

                                {mode === 'signup' && (
                                    <div className="flex items-start gap-2 cursor-pointer" onClick={() => setAgreed(!agreed)}>
                                        <div className="mt-0.5 flex-shrink-0">
                                            {agreed
                                                ? <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center"><CheckSquare className="w-3 h-3 text-white" /></div>
                                                : <div className="w-4 h-4 border border-white/20 rounded bg-white/5" />}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed">
                                            I agree to the <span className="text-blue-400">Privacy Policy</span> and AI medical analysis consent.
                                        </p>
                                    </div>
                                )}

                                {/* Error */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-2 text-red-400"
                                        >
                                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    type="submit" disabled={loading}
                                    className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-3.5 h-3.5" /></>}
                                </Button>
                            </form>

                            {/* Mode Switch */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                                >
                                    {mode === 'login' ? "Don't have an account? → Sign Up" : 'Already have an account? → Sign In'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
