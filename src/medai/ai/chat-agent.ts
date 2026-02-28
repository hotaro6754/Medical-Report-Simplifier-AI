'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { MedicalReport } from '../types/medical';
import { SWASTHYA_SYSTEM_PROMPT } from './guardrails';

const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});

export async function askFollowUpQuestion(report: MedicalReport, question: string) {
    try {
        const response = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: `${SWASTHYA_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════
 CHAT AGENT — TASK
═══════════════════════════════════════════════════════════
The patient is asking a follow-up question about their medical report.
Answer the question accurately based ONLY on the provided report data.
Keep your answer clear, empathetic, and concise (under 100 words).
Do NOT prescribe new medications.
Do NOT make up information. If the answer is not in the report, say so politely.

DATA: ${JSON.stringify({
                type: report.type,
                severity: report.severity,
                summary: report.summary,
                parameters: report.parameters,
                dietaryAdvice: report.dietaryAdvice,
                nextSteps: report.nextSteps,
            })}

PATIENT QUESTION: ${question}

ANSWER:`,
        });

        return response.text;
    } catch (err: any) {
        console.error('[Chat Agent] Error:', err.message);
        const msg = err.message?.toLowerCase() || '';
        if (msg.includes('429') || msg.includes('quota') || msg.includes('timeout') || msg.includes('rate limit')) {
            throw new Error('API Key rate limit exceeded or timeout reached. Please wait and try again or check your Gemini API usage.');
        }
        throw new Error('Failed to generate response. Please try again.');
    }
}
