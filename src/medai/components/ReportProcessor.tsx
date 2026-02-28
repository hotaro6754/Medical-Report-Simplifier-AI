'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    BookOpen,
    Microscope,
    Pill,
    Activity,
    Info,
    ChevronRight,
    Search,
    HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AgentOrchestrator } from '../ai/orchestrator';
import { MedicalReport, Severity } from '../types/medical';
import { AnnotatedReportViewer } from './AnnotatedReportViewer';
import { HealthSummaryBadge } from './dashboard/HealthSummaryBadge';
import { VoiceControls } from './VoiceControls';
import { useLanguage } from './LanguageContext';
import { AuthModal } from './AuthModal';
import { CareLocator } from './CareLocator';
import { ScanningBeam } from './ScanningBeam';

export function ReportProcessor() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [report, setReport] = useState<MedicalReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [voicePrompt, setVoicePrompt] = useState<string>('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [simpleMode, setSimpleMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t, language, sarvamCode } = useLanguage();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const orchestrator = new AgentOrchestrator();
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const result = await orchestrator.processReport(
                buffer,
                file.type,
                file.name,
                voicePrompt
            );

            setReport(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Analysis failed. Please try a clearer image.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return (
            <Card className="w-full bg-slate-900/50 border-white/10 backdrop-blur-2xl p-12 flex flex-col items-center justify-center min-h-[450px] rounded-[3rem] relative overflow-hidden">
                <ScanningBeam />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                >
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{t('processingTitle')}</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Simulating RxNorm & PubMed Retrieval...</p>
                <div className="w-64 mt-8">
                    <Progress value={66} className="h-1 bg-white/5" />
                </div>
            </Card>
        );
    }

    if (report) {
        return (
            <div className="w-full space-y-10 pb-20">
                {/* Header & Mode Toggle */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <HealthSummaryBadge status={report.severity} />
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400 rounded-full px-4 py-1 font-black uppercase text-[10px] tracking-widest">
                                {report.classification?.replace('_', ' ') || 'MEDICAL REPORT'}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
                            Processed on {report.uploadedAt.toLocaleDateString()} • Confidence: {(report.confidence * 100).toFixed(0)}%
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                        <div className="flex flex-col items-end">
                            <Label htmlFor="simple-mode" className="text-[10px] font-black uppercase tracking-widest text-white cursor-pointer">Simple Mode</Label>
                            <span className="text-[9px] text-slate-500 font-bold">Remove Jargon</span>
                        </div>
                        <Switch
                            id="simple-mode"
                            checked={simpleMode}
                            onCheckedChange={setSimpleMode}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>
                </div>

                {/* AI Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect p-1 rounded-[3.5rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/20"
                >
                    <div className="bg-slate-950/80 backdrop-blur-3xl rounded-[3.4rem] p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Search className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.5em] mb-6 flex items-center gap-2">
                                <Microscope className="w-4 h-4" /> {t('aiSummary')}
                            </h3>
                            <p className="text-2xl md:text-3xl font-black text-white leading-tight mb-8">
                                {simpleMode ? (report.simpleSummary || report.summary) : report.summary}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <VoiceControls
                                    text={report.hindiExplanation || report.summary}
                                    languageCode={sarvamCode as any}
                                />

                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6">
                                            <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                                            Knowledge Panel
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="bg-slate-950 border-white/10 text-white w-full sm:max-w-md p-0 overflow-y-auto">
                                        <div className="p-8 space-y-8">
                                            <SheetHeader>
                                                <SheetTitle className="text-white font-black uppercase tracking-widest text-xl">Scientific Insights</SheetTitle>
                                                <SheetDescription className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                                    Verified literature & standard protocols
                                                </SheetDescription>
                                            </SheetHeader>

                                            <div className="space-y-10 mt-10">
                                                <section>
                                                    <h4 className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Pathology Overview</h4>
                                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase">Target Condition</p>
                                                            <p className="text-lg font-black text-white">{report.targetCondition || 'N/A'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase">ICD-10</p>
                                                            <code className="text-sm bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-mono">{report.icd10Code || 'N/A'}</code>
                                                        </div>
                                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                                            {report.clinicalDefinition}
                                                        </p>
                                                    </div>
                                                </section>

                                                <section>
                                                    <h4 className="text-purple-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Pharmacology Mapping</h4>
                                                    <div className="space-y-4">
                                                        {report.pharmacologicalMapping?.map((drug, i) => (
                                                            <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Pill className="w-4 h-4 text-purple-400" />
                                                                    <p className="font-black text-white uppercase text-xs tracking-widest">{drug.drugClassName}</p>
                                                                </div>
                                                                <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                                                                    {drug.mechanismOfAction}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>

                                                <section>
                                                    <h4 className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Literature Citations</h4>
                                                    <div className="space-y-4">
                                                        {report.citations?.map((cite, i) => (
                                                            <a
                                                                key={i}
                                                                href={cite.url}
                                                                target="_blank"
                                                                className="block p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group"
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-blue-400 line-clamp-2">{cite.title}</p>
                                                                    <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 font-bold line-clamp-2">{cite.description}</p>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </section>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Report Visualization Section */}
                {report.imageBase64 && (
                    <div className="relative rounded-[4rem] overflow-hidden border border-white/10 shadow-4xl bg-slate-950/50 p-4 group transition-all hover:scale-[1.01]">
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                            <Badge className="bg-blue-600/90 backdrop-blur-md text-white border-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">Interactive Scan Viewer</Badge>
                        </div>
                        <AnnotatedReportViewer
                            imageUrl={`data:${report.imageMimeType};base64,${report.imageBase64}`}
                            parameters={report.parameters}
                        />
                    </div>
                )}

                {/* Parameters & Diet Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="font-black text-white text-sm uppercase tracking-[0.4em]">{t('measuredParameters')}</h3>
                            <div className="flex gap-2">
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-emerald-500" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="w-2 h-2 rounded-full bg-yellow-500" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} className="w-2 h-2 rounded-full bg-red-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {report.parameters.map((p, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <ParameterCard parameter={p} simple={simpleMode} />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="px-4">
                            <h3 className="font-black text-white text-sm uppercase tracking-[0.4em]">Life & Diet</h3>
                        </div>
                        <DietaryAdviceCard advice={report.dietaryAdvice} simple={simpleMode} />

                        {/* Care Locator Integration */}
                        <div className="p-2 rounded-[3.5rem] bg-blue-500/5 border border-blue-500/10 transition-all hover:bg-blue-500/10">
                            <CareLocator />
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setReport(null)}
                    variant="ghost"
                    className="w-full py-16 text-slate-500 hover:text-white hover:bg-white/5 rounded-[3rem] font-black uppercase tracking-[0.4em] text-xs border border-white/5 transition-all group active:scale-[0.98] h-auto"
                >
                    <span className="group-hover:tracking-[0.6em] transition-all">{t('clearResults')}</span>
                </Button>
            </div>
        );
    }

    return (
        <>
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => setShowAuthModal(false)}
                message="Sign in to save your report and track health history"
            />
            <Card className="w-full border-dashed border-2 border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer relative shadow-3xl group overflow-hidden min-h-[450px] flex flex-col items-center justify-center rounded-[3rem]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="flex flex-col items-center justify-center p-12 relative z-10 w-full">
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        onChange={handleFileUpload}
                        accept="image/*,application/pdf,text/plain,.txt"
                        suppressHydrationWarning
                    />
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 border border-white/10 shadow-2xl relative">
                        <Upload className="w-14 h-14 text-blue-400 group-hover:animate-bounce" />
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping opacity-0 group-hover:opacity-100" />
                    </div>
                    <CardTitle className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase text-center">{t('dropTitle')}</CardTitle>
                    <CardDescription className="text-lg text-slate-400 mb-10 max-w-sm text-center font-bold leading-relaxed uppercase tracking-wide opacity-80">
                        {t('dropDesc')}
                    </CardDescription>

                    <div className="flex flex-col sm:flex-row gap-4 items-center mb-12 relative z-30">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/40 transition-all active:scale-95 uppercase tracking-widest text-sm min-w-[240px]">
                            {t('selectFileBtn')}
                        </Button>
                    </div>

                    <div className="mt-8 z-30 flex flex-col items-center bg-white/5 p-8 rounded-[3rem] border border-white/10 w-full max-w-md">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-6">Or explain symptoms via voice</p>
                        <VoiceControls
                            languageCode={sarvamCode as any}
                            onTranscript={(text) => {
                                setVoicePrompt(text);
                            }}
                        />
                        {voicePrompt && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-6 rounded-3xl bg-slate-900/80 border border-white/10 w-full text-center backdrop-blur-md"
                            >
                                <p className="text-sm font-bold text-blue-300 italic leading-relaxed">"{voicePrompt}"</p>
                                <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-[0.4em] font-black animate-pulse">Now upload your report</p>
                            </motion.div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-10 p-6 bg-red-500/10 text-red-400 rounded-[2rem] border border-red-500/20 flex items-center gap-4 animate-shake max-w-md">
                            <AlertCircle className="w-8 h-8 flex-shrink-0" />
                            <p className="text-sm font-bold uppercase tracking-wide">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

function ParameterCard({ parameter: p, simple }: { parameter: any, simple?: boolean }) {
    const statusColors = {
        critical: 'text-red-500 border-red-500/30 bg-red-500/5',
        attention: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5',
        normal: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
    };

    return (
        <div className={`p-8 border border-white/10 rounded-[3rem] bg-slate-950/50 shadow-2xl relative overflow-hidden group transition-all hover:bg-white/5 hover:border-white/20`}>
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Parameter</p>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{p.name}</h4>
                </div>
                <div className={`px-4 py-2 rounded-2xl border font-black uppercase text-[10px] tracking-widest ${statusColors[p.status as Severity]}`}>
                    {p.status}
                </div>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
                <span className="text-4xl font-black text-white">{p.value}</span>
                <span className="text-sm font-bold text-slate-500">{p.unit}</span>
            </div>

            <div className="space-y-6">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">What it means</span>
                    </div>
                    <p className="text-xs font-bold text-slate-300 leading-relaxed">
                        {simple ? "This is a basic measurement for your report." : p.explanation}
                    </p>
                </div>

                <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Actionable Advice</span>
                    </div>
                    <p className="text-xs font-black text-blue-300 leading-relaxed uppercase tracking-tight">
                        {p.actionableAdvice}
                    </p>
                </div>
            </div>
        </div>
    );
}

function DietaryAdviceCard({ advice, simple }: { advice: string[], simple?: boolean }) {
    return (
        <Card className="bg-emerald-500/5 border-emerald-500/10 rounded-[3.5rem] p-10 shadow-3xl">
            <h4 className="text-emerald-400 font-black text-sm uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                <HeartPulse className="w-6 h-6" /> Nutrition Protocol
            </h4>
            <div className="space-y-6">
                {advice.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-xs md:text-sm font-bold text-slate-300 leading-relaxed py-2">
                            {simple ? "Eat healthy foods recommended by your doctor." : item}
                        </p>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
}
