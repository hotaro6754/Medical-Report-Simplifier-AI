'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Square } from 'lucide-react';
import { SARVAM_VOICES, type SarvamLanguageCode } from '@/medai/ai/sarvam-tts';

interface VoiceControlsProps {
    text?: string;
    languageCode?: SarvamLanguageCode;
    onTranscript?: (transcript: string) => void;
    compact?: boolean;
}

type TtsState = 'idle' | 'loading' | 'playing';
type SttState = 'idle' | 'recording' | 'processing';

export function VoiceControls({
    text,
    languageCode = 'hi-IN',
    onTranscript,
    compact = false,
}: VoiceControlsProps) {
    const [ttsState, setTtsState] = useState<TtsState>('idle');
    const [sttState, setSttState] = useState<SttState>('idle');
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    // ── TTS: Text-to-Speech ────────────────────────────────────────────────
    const handleSpeak = async () => {
        if (!text) return;

        if (ttsState === 'playing') {
            audioRef.current?.pause();
            setTtsState('idle');
            return;
        }

        setTtsState('loading');
        setError(null);

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, languageCode }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || `TTS failed (${response.status})`);
            }
            const { audioBase64 } = await response.json();

            const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
            audioRef.current = audio;
            audio.onended = () => setTtsState('idle');
            audio.onerror = () => { setTtsState('idle'); setError('Audio playback failed'); };
            audio.play();
            setTtsState('playing');
        } catch (err: any) {
            setTtsState('idle');
            const msg = err.message || '';
            if (msg.includes('rate limit') || msg.includes('429') || msg.includes('quota')) {
                setError('API rate limit reached — try again shortly');
            } else {
                setError(`Voice error: ${msg.slice(0, 60)}`);
            }
        }
    };

    // ── STT: Speech-to-Text ────────────────────────────────────────────────
    const handleMic = async () => {
        if (sttState === 'recording') {
            // Stop recording
            mediaRecorderRef.current?.stop();
            return;
        }

        if (sttState === 'processing') return;

        setError(null);
        setSttState('recording');
        chunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                setSttState('processing');
                stream.getTracks().forEach(t => t.stop());

                try {
                    const audioBlob = new Blob(chunksRef.current, { type: mimeType });
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');
                    formData.append('languageCode', languageCode);

                    const response = await fetch('/api/stt', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const body = await response.json().catch(() => ({}));
                        throw new Error(body.error || `STT failed (${response.status})`);
                    }
                    const { transcript } = await response.json();
                    if (transcript) {
                        onTranscript?.(transcript);
                    } else {
                        setError('No speech detected. Please try speaking again.');
                    }
                } catch (err: any) {
                    const msg = err.message || '';
                    if (msg.includes('rate limit') || msg.includes('429') || msg.includes('quota')) {
                        setError('API rate limit reached — try again shortly');
                    } else {
                        setError(`Voice recognition error: ${msg.slice(0, 60)}`);
                    }
                } finally {
                    setSttState('idle');
                }
            };

            mediaRecorder.start();

            // Auto-stop after 15 seconds
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') mediaRecorder.stop();
            }, 15000);

        } catch {
            setSttState('idle');
            setError('Microphone access denied.');
        }
    };

    const voices = SARVAM_VOICES[languageCode] ?? SARVAM_VOICES['hi-IN'];

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {text && (
                    <button
                        onClick={handleSpeak}
                        className={`p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border transition-all ${ttsState === 'playing'
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-blue-400 hover:border-blue-500/30'
                            }`}
                        title={ttsState === 'playing' ? 'Stop' : `Listen in ${languageCode.split('-')[0].toUpperCase()}`}
                    >
                        {ttsState === 'loading' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : ttsState === 'playing' ? (
                            <VolumeX className="w-4 h-4" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </button>
                )}
                {onTranscript && (
                    <button
                        onClick={handleMic}
                        className={`p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border transition-all relative ${sttState === 'recording'
                            ? 'bg-red-500/20 border-red-500/50 text-red-400'
                            : sttState === 'processing'
                                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-blue-400 hover:border-blue-500/30'
                            }`}
                        title={sttState === 'recording' ? 'Tap to stop' : 'Voice input'}
                    >
                        {sttState === 'recording' && (
                            <span className="absolute inset-0 rounded-xl animate-ping bg-red-500/20" />
                        )}
                        {sttState === 'processing' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : sttState === 'recording' ? (
                            <Square className="w-4 h-4" />
                        ) : (
                            <Mic className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                {/* TTS Button */}
                {text && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSpeak}
                        className={`flex items-center gap-2 px-4 py-3 min-h-[48px] min-w-[48px] rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${ttsState === 'playing'
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5'
                            }`}
                    >
                        {ttsState === 'loading' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : ttsState === 'playing' ? (
                            <VolumeX className="w-4 h-4" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                        <span>
                            {ttsState === 'loading' ? 'Generating...' : ttsState === 'playing' ? 'Stop' : `Listen (${voices[0]?.name})`}
                        </span>
                    </motion.button>
                )}

                {/* STT Button */}
                {onTranscript && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMic}
                        className={`flex items-center gap-2 px-4 py-3 min-h-[48px] min-w-[48px] rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all relative overflow-hidden ${sttState === 'recording'
                            ? 'bg-red-500/20 border-red-500/40 text-red-400'
                            : sttState === 'processing'
                                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5'
                            }`}
                    >
                        {sttState === 'recording' && (
                            <AnimatePresence>
                                <motion.div
                                    className="absolute inset-0 bg-red-500/10 rounded-2xl"
                                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            </AnimatePresence>
                        )}
                        {sttState === 'processing' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : sttState === 'recording' ? (
                            <MicOff className="w-4 h-4" />
                        ) : (
                            <Mic className="w-4 h-4" />
                        )}
                        <span className="relative z-10">
                            {sttState === 'recording' ? 'Recording... tap to stop' : sttState === 'processing' ? 'Processing...' : 'Speak in Hindi / English'}
                        </span>
                    </motion.button>
                )}
            </div>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] font-bold text-red-400 uppercase tracking-widest pl-1"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
