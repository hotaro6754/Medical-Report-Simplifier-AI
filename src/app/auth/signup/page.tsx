'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            setError('You must agree to the privacy policy');
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Redirect to verification page or home
            router.push('/auth/login?message=Check your email for verification');
        }
    };

    return (
        <div className="min-h-screen bg-medical-surface flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
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
                        <CardTitle className="text-3xl font-black text-white tracking-tight uppercase leading-tight mb-2">Create Account</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-xs">Join the future of Bharat's healthcare</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Arjun Singh"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="pl-12 py-7 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500/50 transition-all font-bold"
                                    />
                                </div>
                            </div>

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

                            <div className="flex items-start gap-3 py-2 cursor-pointer" onClick={() => setAgreed(!agreed)}>
                                <div className="mt-1 flex-shrink-0">
                                    {agreed ? (
                                        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center border border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                                            <CheckSquare className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 border border-white/20 rounded hover:border-blue-500/50 transition-colors bg-white/5" />
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wide">
                                    I agree to the <span className="text-blue-400">Privacy Policy</span> and consent to AI analysis of my medical documents.
                                </p>
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
                                        Create Account
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
