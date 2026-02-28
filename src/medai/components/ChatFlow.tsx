'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { MedicalReport } from '../types/medical';
import { askFollowUpQuestion } from '../ai/chat-agent';
import { VoiceControls } from './VoiceControls';
import { useLanguage } from './LanguageContext';

interface ChatFlowProps {
    report: MedicalReport;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

export function ChatFlow({ report }: ChatFlowProps) {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'assistant',
            content: `Hello! I've analyzed your ${report.type}. Do you have any specific questions about your results or the dietary plan?`
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        // Add a temporary loading message
        const loadingId = Date.now().toString() + '-loading';
        setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: '', isStreaming: true }]);

        try {
            const answer = await askFollowUpQuestion(report, text);
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId ? { ...msg, content: answer, isStreaming: false } : msg
            ));
        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId ? { ...msg, content: "Sorry, I couldn't process that right now. Please try again.", isStreaming: false } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleTranscript = (text: string) => {
        setInputValue(text);
        if (text.trim()) {
            handleSend(text);
        }
    };

    return (
        <div className="w-full rounded-[3rem] border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] overflow-hidden bg-white/10 dark:bg-black/20 backdrop-blur-[40px] flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-white/10 dark:border-white/5 bg-black/5 dark:bg-black/30 backdrop-blur-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_2px_15px_rgba(59,130,246,0.3)]">
                    <Bot className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Swasthya Copilot</h3>
                    <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold tracking-[0.3em] uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online & Ready
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/40 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-white/40 dark:border-white/5 backdrop-blur-md'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-[1.5rem] relative ${msg.role === 'user'
                                    ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/50 shadow-xl backdrop-blur-md'
                                    : 'bg-white/40 dark:bg-black/40 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-white/40 dark:border-white/10 backdrop-blur-xl shadow-sm'
                                    }`}>
                                    {msg.isStreaming && !msg.content ? (
                                        <div className="flex gap-1 py-1 px-2">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <p className="text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">
                                                {msg.content}
                                            </p>
                                            {msg.role === 'assistant' && (
                                                <div className="mt-1 flex justify-start">
                                                    <VoiceControls text={msg.content} compact />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 dark:border-white/5 bg-black/5 dark:bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend(inputValue);
                            }}
                            placeholder="Ask about your diet, next steps, or parameters..."
                            className="w-full bg-white/50 dark:bg-slate-950/50 border border-white/40 dark:border-white/10 shadow-inner rounded-2xl py-4 pl-4 pr-16 text-slate-800 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-medium backdrop-blur-md"
                            disabled={isLoading}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <VoiceControls compact languageCode="hi-IN" onTranscript={handleTranscript} />
                        </div>
                    </div>
                    <button
                        onClick={() => handleSend(inputValue)}
                        disabled={isLoading || !inputValue.trim()}
                        className="w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 border border-blue-400/20"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
