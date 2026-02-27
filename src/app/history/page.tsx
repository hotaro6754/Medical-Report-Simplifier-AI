'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/medai/components/AuthContext';
import { useRouter } from 'next/navigation';
import { Activity, ShieldCheck, TrendingUp, TrendingDown, Minus, ChevronRight, FileText, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';

interface ReportRow {
    id: string;
    type: string;
    severity: string;
    health_score: number;
    risk_assessment: string;
    summary: string;
    uploaded_at: string;
}

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
    normal: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Normal' },
    attention: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Attention' },
    critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Critical' },
};

function ScoreRing({ score }: { score: number }) {
    const r = 28, c = 2 * Math.PI * r;
    const fill = c - (score / 100) * c;
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
                    strokeDasharray={c} strokeDashoffset={fill} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">{score}</span>
        </div>
    );
}

export default function HistoryPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;
        supabase
            .from('medical_reports')
            .select('id, type, severity, health_score, risk_assessment, summary, uploaded_at')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false })
            .then(({ data, error }) => {
                if (!error && data) setReports(data);
                setFetching(false);
            });
    }, [user]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-medical-surface flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-medical-surface text-medical-text pt-28 pb-16 px-4 relative">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3">Your Health Records</p>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">Report History</h1>
                    <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest">
                        {reports.length} {reports.length === 1 ? 'report' : 'reports'} analyzed
                    </p>
                </motion.div>

                {fetching ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                ) : reports.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 gap-6 text-center"
                    >
                        <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20">
                            <FileText className="w-10 h-10 text-blue-400/50" />
                        </div>
                        <div>
                            <p className="text-white font-black text-xl uppercase tracking-tight mb-2">No reports yet</p>
                            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Upload your first lab report to get started</p>
                        </div>
                        <Link
                            href="/"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-2xl shadow-blue-500/30 flex items-center gap-2"
                        >
                            Analyze Report <ChevronRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {reports.map((report, i) => {
                                const cfg = severityConfig[report.severity] ?? severityConfig.normal;
                                const date = new Date(report.uploaded_at);
                                return (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex items-center gap-6 p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] hover:border-blue-500/20 hover:bg-slate-800/50 transition-all duration-500 cursor-pointer"
                                        onClick={() => router.push('/')}
                                    >
                                        {/* Score Ring */}
                                        <ScoreRing score={report.health_score} />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-white font-black text-base uppercase tracking-tight truncate">
                                                    {report.type}
                                                </span>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-[11px] font-bold leading-relaxed line-clamp-2 mb-2">
                                                {report.summary}
                                            </p>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                    {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Risk badge */}
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Risk</span>
                                            <span className={`text-xs font-black uppercase ${cfg.color}`}>{report.risk_assessment}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="pt-4 text-center"
                        >
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
                            >
                                <Activity className="w-4 h-4" />
                                Analyze New Report
                            </Link>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
