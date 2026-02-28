'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { generateSarvamVoice } from '../ai/sarvam-actions';

interface SarvamVoicePlayerProps {
    text: string;
    languageCode?: string;
    languageName?: string;
}

export function SarvamVoicePlayer({ text, languageCode = 'hi-IN', languageName = 'Hindi' }: SarvamVoicePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const togglePlayback = async () => {
        if (isPlaying) {
            audio?.pause();
            setIsPlaying(false);
            return;
        }

        if (audio) {
            audio.play();
            setIsPlaying(true);
            return;
        }

        setLoading(true);
        try {
            const result = await generateSarvamVoice(text, languageCode);

            if (result.success && result.audio_content) {
                const audioSrc = `data:audio/wav;base64,${result.audio_content}`;
                const newAudio = new Audio(audioSrc);

                newAudio.onended = () => setIsPlaying(false);
                setAudio(newAudio);
                newAudio.play();
                setIsPlaying(true);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Sarvam AI Error:', error);
            // Fallback: Notify user or show error state
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl group hover:bg-white/10 transition-all">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-medical-accent/20 text-medical-accent shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-medical-primary/20 text-medical-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                }`}>
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> :
                    isPlaying ? <Pause className="w-6 h-6 fill-current" /> :
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />}
            </div>

            <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                    Regional Voice Narration
                </p>
                <p className="text-sm font-bold text-white tracking-tight">
                    Listen to explanation in <span className="text-medical-accent">{languageName}</span>
                </p>
            </div>

            <Button
                onClick={togglePlayback}
                disabled={loading}
                size="sm"
                className={`rounded-xl px-6 font-black uppercase tracking-widest text-[10px] h-10 ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-medical-primary text-white hover:bg-medical-primary/80'
                    }`}
            >
                {isPlaying ? 'Stop' : 'Play Audio'}
            </Button>

            <div className="flex items-center gap-1 opacity-30 group-hover:opacity-60 transition-opacity">
                <Volume2 className="w-4 h-4 text-slate-400" />
            </div>
        </div>
    );
}
