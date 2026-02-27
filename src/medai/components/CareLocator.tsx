'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Star, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { findNearbyCare, CareFacility } from '../ai/geo-actions';
import { useLanguage } from './LanguageContext';

export function CareLocator() {
    const { t } = useLanguage();
    const [facilities, setFacilities] = useState<CareFacility[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCare() {
            try {
                // In production, we'd use navigator.geolocation
                const results = await findNearbyCare(17.3850, 78.4867);
                setFacilities(results);
            } catch (error) {
                console.error('Care Locator Error:', error);
            } finally {
                setLoading(false);
            }
        }
        loadCare();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/10">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('findingCare')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-medical-accent" /> {t('recomCare')}
                </h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hyd, Telangana</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map((fac) => (
                    <Card key={fac.id} className="bg-slate-900/50 border-white/5 hover:border-medical-accent/30 transition-all cursor-pointer group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-widest ${fac.cost_tier === 'free' ? 'bg-medical-accent text-white' : 'bg-blue-500 text-white'
                            }`}>
                            {fac.cost_tier}
                        </div>
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                    <span className="font-bold text-white group-hover:text-medical-accent transition-colors">
                                        {fac.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                        {fac.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="text-xs font-black">{fac.rating}</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <MapPin className="w-3 h-3" /> {fac.address}
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fac.travel_time_min} MIN</span>
                                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {fac.distance_km} KM</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    <Phone className="w-3 h-3 mr-2" /> {t('callBtn')}
                                </Button>
                                <Button variant="ghost" size="sm" className="flex-1 bg-medical-accent/10 hover:bg-medical-accent/20 text-medical-accent rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    <ExternalLink className="w-3 h-3 mr-2" /> {t('directionsBtn')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <p className="text-[10px] text-slate-600 font-medium text-center italic">
                {t('careDisclaimer')}
            </p>
        </div>
    );
}
