'use client';

import React, { useState } from 'react';
import { MedicalParameter } from '../types/medical';
import { useLanguage } from './LanguageContext';

interface AnnotatedReportViewerProps {
    imageUrl: string;
    parameters: MedicalParameter[];
}

export function AnnotatedReportViewer({ imageUrl, parameters }: AnnotatedReportViewerProps) {
    const { t } = useLanguage();
    const [hoveredParam, setHoveredParam] = useState<string | null>(null);

    return (
        <div className="relative w-full overflow-hidden rounded-lg border bg-slate-100">
            <div className="relative inline-block w-full">
                <img
                    src={imageUrl}
                    alt="Medical Report"
                    className="w-full h-auto block"
                />

                {/* Overlays */}
                {parameters.map((param, idx) => {
                    if (!param.boundingBox) return null;

                    const { ymin, xmin, ymax, xmax } = param.boundingBox;

                    // Normalized coordinates (0-1000) converted to percentages
                    const top = `${ymin / 10}%`;
                    const left = `${xmin / 10}%`;
                    const width = `${(xmax - xmin) / 10}%`;
                    const height = `${(ymax - ymin) / 10}%`;

                    const isHovered = hoveredParam === param.name;

                    return (
                        <div
                            key={idx}
                            className={`absolute border-2 transition-all cursor-pointer ${isHovered ? 'bg-blue-400/20 border-blue-500 z-10' : 'bg-transparent border-transparent'
                                }`}
                            style={{ top, left, width, height }}
                            onMouseEnter={() => setHoveredParam(param.name)}
                            onMouseLeave={() => setHoveredParam(null)}
                        >
                            {isHovered && (
                                <div className="absolute -top-10 left-0 bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                    {param.name}: {param.value} {param.unit}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-white p-3 border-t">
                <p className="text-xs text-slate-400 italic">
                    {t('hoverTip')}
                </p>
            </div>
        </div>
    );
}
