'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resending, setResending] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    useEffect(() => {
        if (!email) router.push('/auth/login');
    }, [email, router]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = otp.join('');
        if (token.length < 6) return;
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
        if (error) { setError(error.message); setLoading(false); }
        else router.push('/');
    };

    const resendOtp = async () => {
        setResending(true);
        const { error } = await supabase.auth.resend({ email, type: 'signup' });
        setResending(false);
        if (error) setError(error.message);
    };

    return (
        <div className="min-h-screen bg-medical-surface flex items-center justify-center p-4 relative overflow-hidden">
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
                    <Link href="/" className="flex items-center gap-3 group">
                        <ShieldCheck className="w-10 h-10 text-blue-400" />
                        <span className="text-3xl font-black text-white tracking-tighter uppercase">SWASTHYA AI</span>
                    </Link>
                </div>

                <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-3xl shadow-3xl rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 pb-6 text-center">
                        <CardTitle className="text-3xl font-black text-white tracking-tight uppercase mb-2">Security Check</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                            Enter the 6-digit code sent to {email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <form onSubmit={handleVerify} className="space-y-8">
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, idx) => (
                                    <Input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className="w-12 h-16 text-center text-3xl font-black bg-white/5 border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-blue-500/50 transition-all"
                                    />
                                ))}
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
                                disabled={loading || otp.join('').length < 6}
                                className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] group flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                            </Button>
                        </form>

                        <div className="mt-10 text-center flex flex-col gap-4">
                            <button
                                onClick={resendOtp}
                                disabled={resending}
                                className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                            >
                                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Resend Code
                            </button>
                            <Link href="/auth/login" className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                                Back to Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-medical-surface flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
