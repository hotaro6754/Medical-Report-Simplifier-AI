'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle, ExternalLink, BookOpen, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { processMedicalReport } from '../ai/actions';
import { MedicalReport } from '../types/medical';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AnnotatedReportViewer } from './AnnotatedReportViewer';
import { ScanningBeam } from './ScanningBeam';
import { SarvamVoicePlayer } from './SarvamVoicePlayer';
import { CareLocator } from './CareLocator';
import { useLanguage } from './LanguageContext';
import { RiskMeter } from './dashboard/RiskMeter';
import { HealthSummaryBadge } from './dashboard/HealthSummaryBadge';
import { ParameterCard } from './dashboard/ParameterCard';
import { DietaryAdviceCard } from './dashboard/DietaryAdviceCard';
import { VoiceControls } from './VoiceControls';
import { AuthModal } from './AuthModal';
import { useAuth } from './AuthContext';
import { ChatFlow } from './ChatFlow';

export function ReportProcessor() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [report, setReport] = useState<MedicalReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voicePrompt, setVoicePrompt] = useState<string>('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSimpleMode, setIsSimpleMode] = useState(false);
    const pendingFormDataRef = useRef<FormData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const runAnalysis = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        setReport(null);
        try {
            const result = await processMedicalReport(formData);
            setReport(result);
        } catch (err: any) {
            setError(err.message || 'Failed to process report');
        } finally {
            setLoading(false);
            setPreviewUrl(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));

        // Reset file input so same file can be re-uploaded
        if (fileInputRef.current) fileInputRef.current.value = '';

        const formData = new FormData();
        formData.append('file', file);
        if (voicePrompt) formData.append('symptoms', voicePrompt);

        await runAnalysis(formData);
    };

    if (loading) {
        return (
            <Card className="w-full h-[500px] flex flex-col items-center justify-center space-y-4 glass-effect relative overflow-hidden bg-slate-900/50 border-white/5 shadow-2xl rounded-[3rem]">
                {previewUrl && (
                    <img src={previewUrl} alt="Scanning Preview" className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm transition-all duration-1000 scale-105" />
                )}
                <ScanningBeam />
                <div className="relative z-20 flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-2xl font-black text-white tracking-tighter uppercase">{t('processingTitle')}</p>
                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase opacity-60">{t('processingDesc')}</p>
                </div>
            </Card>
        );
    }

    const containerVariants: any = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };
    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (report) {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-12 pb-20"
            >
                {/* Simple Mode Toggle */}
                <motion.div variants={itemVariants} className="flex justify-end pr-4">
                    <button
                        onClick={() => setIsSimpleMode(!isSimpleMode)}
                        className={`px-6 py-2 min-h-[48px] min-w-[48px] rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${isSimpleMode ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'}`}
                    >
                        {isSimpleMode ? 'Simple Mode ON' : 'Simple Mode OFF'}
                    </button>
                </motion.div>

                {/* Dashboard Header */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Metadata & Summary */}
                    <Card className="lg:col-span-2 bg-slate-950/40 backdrop-blur-3xl border border-white/10 shadow-3xl overflow-hidden glass-effect rounded-[3rem]">
                        <CardHeader className="p-10 pb-4">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 mb-4">
                                        <HealthSummaryBadge status={report.severity} />
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest">{report.type}</Badge>
                                    </div>
                                    <CardTitle className="text-4xl font-black text-white tracking-tighter uppercase leading-tight">{t('analysisTitle')}</CardTitle>
                                    <CardDescription className="text-slate-500 font-black text-xs uppercase tracking-[0.2em]">{t('processedOn')} {new Date(report.uploadedAt).toLocaleDateString()}</CardDescription>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Confidence Index</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${report.confidence * 100}%` }}
                                                className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                                            />
                                        </div>
                                        <span className="text-xs font-black text-white">{(report.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 pt-6 space-y-10">
                            <div className="p-8 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                    <Activity className="w-16 h-16" />
                                </div>
                                <h3 className="font-black text-blue-400 mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.3em]">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                    {t('aiSummary')}
                                </h3>
                                <p className="text-lg text-slate-200 leading-relaxed font-bold tracking-tight">
                                    {report.summary}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <SarvamVoicePlayer text={report.hindiExplanation || ''} />
                                <div className="text-slate-300 leading-relaxed bg-white/5 p-8 rounded-[2rem] border border-white/5 italic font-bold text-lg tracking-tight">
                                    {report.hindiExplanation}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Risk Meter */}
                    <Card className="bg-slate-950/60 backdrop-blur-3xl border border-white/10 shadow-3xl flex flex-col items-center justify-center p-10 rounded-[3rem] glass-effect">
                        <RiskMeter score={report.healthScore} assessment={report.riskAssessment} />
                        <div className="mt-10 space-y-4 w-full">
                            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] text-center mb-6">Patient Next Steps</h4>
                            {(report.nextSteps || []).map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.5 + (0.1 * i) }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                                >
                                    <span className="text-xl font-black text-blue-500">0{i + 1}</span>
                                    <span className="text-xs font-bold text-slate-300">{step}</span>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* Report Visualization Section */}
                {!isSimpleMode && report.imageBase64 && (
                    <motion.div variants={itemVariants} className="rounded-[4rem] overflow-hidden border border-white/10 shadow-4xl bg-slate-950/50 p-4 group transition-all hover:scale-[1.01]">
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                            <Badge className="bg-blue-600/90 backdrop-blur-md text-white border-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">Interactive Laboratory Scan</Badge>
                        </div>
                        <AnnotatedReportViewer
                            imageUrl={`data:${report.imageMimeType};base64,${report.imageBase64}`}
                            parameters={report.parameters}
                        />
                    </motion.div>
                )}

                {/* Parameters & Diet Section */}
                <div className={`grid grid-cols-1 ${!isSimpleMode ? 'lg:grid-cols-2' : ''} gap-8`}>
                    {!isSimpleMode && (
                        <motion.div variants={itemVariants} className="space-y-8">
                            <div className="flex items-center justify-between px-4">
                                <h3 className="font-black text-white text-sm uppercase tracking-[0.4em]">{t('measuredParameters')}</h3>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {report.parameters.map((p, idx) => (
                                    <ParameterCard key={idx} parameter={p} index={idx} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <motion.div variants={itemVariants} className="space-y-8">
                        <div className="px-4">
                            <h3 className="font-black text-white text-sm uppercase tracking-[0.4em]">Health Optimization</h3>
                        </div>
                        <DietaryAdviceCard advice={report.dietaryAdvice} />

                        {/* Care Locator Integration */}
                        <div className="p-2 rounded-[3.5rem] bg-blue-500/5 border border-blue-500/10">
                            <CareLocator />
                        </div>
                    </motion.div>
                </div>

                {/* Scientific References */}
                {report.citations && report.citations.length > 0 && (
                    <motion.div variants={itemVariants} className="pt-10 border-t border-white/5">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full py-8 border-white/10 bg-slate-900/50 hover:bg-slate-800/80 rounded-[2rem] gap-4 transition-all">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                    <span className="font-black text-white uppercase tracking-[0.4em] text-xs">Knowledge Base & Citations</span>
                                    <span className="text-xs text-slate-400 font-bold ml-auto bg-slate-950 px-3 py-1 border border-white/5 rounded-full">{report.citations.length} References</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-slate-950/95 border-l border-white/10 backdrop-blur-3xl w-[90vw] sm:max-w-md overflow-y-auto z-[200]">
                                <SheetHeader className="mb-8 mt-6">
                                    <SheetTitle className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-blue-500" />
                                        Medical Literature
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="space-y-4 pb-20">
                                    {report.citations.map((cite, idx) => (
                                        <a
                                            key={idx}
                                            href={cite.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-5 border border-white/10 rounded-[1.5rem] hover:bg-white/5 hover:border-blue-500/50 transition-all group bg-slate-900/50 shadow-xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div className="font-black text-blue-400 group-hover:text-blue-300 mb-2 text-xs leading-relaxed uppercase tracking-widest pr-6">
                                                {cite.title}
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed font-bold tracking-wide">{cite.description}</p>
                                        </a>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </motion.div>
                )}

                {/* AI Copilot Chat */}
                <motion.div variants={itemVariants} className="pt-10 border-t border-white/5">
                    <ChatFlow report={report} />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Button
                        onClick={() => setReport(null)}
                        variant="ghost"
                        className="w-full py-12 text-slate-500 hover:text-white hover:bg-white/5 rounded-[3rem] font-black uppercase tracking-[0.4em] text-xs border border-white/5 transition-all group active:scale-[0.98]"
                    >
                        <span className="group-hover:tracking-[0.6em] transition-all">{t('clearResults')}</span>
                    </Button>
                </motion.div>
            </motion.div>
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
                    <div className="w-28 h-28 bg-white/5 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 border border-white/10 shadow-2xl relative">
                        <Upload className="w-12 h-12 text-blue-400 group-hover:animate-bounce" />
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping opacity-0 group-hover:opacity-100" />
                    </div>
                    <CardTitle className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">{t('dropTitle')}</CardTitle>
                    <CardDescription className="text-lg text-slate-400 mb-10 max-w-sm text-center font-bold leading-relaxed uppercase tracking-wide opacity-80">
                        {t('dropDesc')}
                    </CardDescription>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-8 rounded-[2rem] shadow-2xl shadow-blue-500/40 transition-all active:scale-95 uppercase tracking-widest text-sm relative z-30">
                        {t('selectFileBtn')}
                    </Button>

                    <div className="mt-8 z-30 flex flex-col items-center">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-4">Or describe your symptoms</p>
                        <VoiceControls
                            languageCode="hi-IN"
                            onTranscript={(text) => {
                                setVoicePrompt(text);
                            }}
                        />
                        {voicePrompt && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 max-w-sm text-center backdrop-blur-md"
                            >
                                <p className="text-sm font-bold text-blue-300 italic">"{voicePrompt}"</p>
                                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">Now upload your report</p>
                            </motion.div>
                        )}
                    </div>

                    <div className="mt-12 flex flex-col gap-6 items-center z-30">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black shadow-2xl overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
                            {t('trustedBy')}
                        </p>
                    </div>

                    {error && (
                        <div className="mt-10 p-5 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 flex items-center gap-4 animate-shake">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <p className="text-sm font-bold uppercase tracking-wide">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

