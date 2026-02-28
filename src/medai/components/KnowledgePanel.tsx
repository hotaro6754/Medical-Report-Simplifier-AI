'use client';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { BookOpen, ExternalLink, Pill, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MedicalReport } from '../types/medical';

export function KnowledgePanel({ report }: { report: MedicalReport }) {
    return (
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
    );
}
