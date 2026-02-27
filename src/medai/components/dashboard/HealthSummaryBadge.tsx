'use client';

import { motion } from 'framer-motion';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Severity } from '../../types/medical';

interface HealthSummaryBadgeProps {
    status: Severity;
}

export function HealthSummaryBadge({ status }: HealthSummaryBadgeProps) {
    const config = {
        critical: {
            icon: ShieldAlert,
            label: 'Action Required',
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            pulse: 'bg-red-500',
        },
        attention: {
            icon: AlertTriangle,
            label: 'Review Needed',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            pulse: 'bg-yellow-500',
        },
        normal: {
            icon: CheckCircle2,
            label: 'Healthy Status',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            pulse: 'bg-emerald-500',
        }
    };

    const { icon: Icon, label, color, bg, border, pulse } = config[status];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl ${bg} ${border} border backdrop-blur-xl shadow-lg`}
        >
            <div className="relative">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${pulse} animate-ping opacity-75`} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none mb-1">Condition</span>
                <span className={`text-sm font-black uppercase tracking-widest ${color} leading-none`}>{label}</span>
            </div>
        </motion.div>
    );
}
