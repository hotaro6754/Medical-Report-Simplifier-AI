'use client';

import { motion } from 'framer-motion';
import { Info, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { MedicalParameter, Severity } from '../../types/medical';
import { VoiceControls } from '../VoiceControls';

interface ParameterCardProps {
    parameter: MedicalParameter;
    index: number;
}

export function ParameterCard({ parameter, index }: ParameterCardProps) {
    const statusStyles = {
        critical: 'border-red-500/30 bg-red-500/5 text-red-400',
        attention: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
        normal: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    };

    const StatusIcon = parameter.status === 'critical' ? AlertCircle :
        parameter.status === 'attention' ? HelpCircle : CheckCircle;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`group flex flex-col p-6 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${statusStyles[parameter.status]} backdrop-blur-sm border-white/5 bg-slate-900/40`}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Parameter</span>
                    <h4 className="text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase">{parameter.name}</h4>
                </div>
                <div className="flex items-center gap-3">
                    <VoiceControls
                        text={`${parameter.name} is ${parameter.value} ${parameter.unit}. Status is ${parameter.status}. ${parameter.explanation}`}
                        compact
                    />
                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xl group-hover:rotate-12 transition-transform`}>
                        <StatusIcon className="w-6 h-6" />
                    </div>
                </div>
            </div>


            <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-white tracking-tighter">{parameter.value}</span>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{parameter.unit}</span>
            </div>

            <div className="space-y-4">
                {/* Visual Range Indicator */}
                {parameter.normalRange && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <span>Reference Range</span>
                            <span className="text-white bg-white/10 px-2 py-0.5 rounded-full">{parameter.normalRange}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-full opacity-30 ${parameter.status === 'normal' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            />
                        </div>
                    </div>
                )}

                {/* AI Explanation */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Info className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium mb-3">
                        {parameter.explanation}
                    </p>
                    {parameter.actionableAdvice && (
                        <div className="pt-3 border-t border-white/5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 block mb-1">AI Recommendation</span>
                            <p className="text-[11px] text-white font-bold leading-snug">
                                {parameter.actionableAdvice}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
