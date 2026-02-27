'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/medai/components/LanguageContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useLanguage();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-medical-surface flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex justify-center mb-10">
                    <Link href="/" className="flex items-center gap-3 group transition-all duration-500">
                        <div className="w-14 h-14 bg-blue-600/20 rounded-[1.5rem] flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform shadow-2xl shadow-blue-500/20">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter uppercase group-hover:tracking-widest transition-all">SWASTHYA AI</span>
                    </Link>
                </div>

                <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-3xl shadow-3xl rounded-[3rem] overflow-hidden glass-effect">
                    <CardHeader className="p-10 pb-6 text-center">
                        <CardTitle className="text-3xl font-black text-white tracking-tight uppercase leading-tight mb-2">Welcome Back</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-xs">Unlock your health intelligence</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="name@ruralcare.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-12 py-7 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500/50 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-12 py-7 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500/50 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] group flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-10 text-center space-y-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Don't have an account?{' '}
                                <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    Create one here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
