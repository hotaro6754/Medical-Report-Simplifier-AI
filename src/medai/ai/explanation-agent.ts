import { z } from 'zod';
import { createAI } from '@/ai/genkit';
import { SWASTHYA_SYSTEM_PROMPT } from './guardrails';

export const ExplanationSchema = z.object({
    englishExplanation: z.string().min(50)
        .describe('A warm, clear English explanation of the overall findings. 3–5 sentences. Simple language, no jargon.'),
    hindiExplanation: z.string().min(50)
        .describe('The same explanation translated into conversational Hindi (Devanagari script). Culturally sensitive.'),
    culturalContext: z.string().min(20)
        .describe('Specific lifestyle or dietary advice tailored to Indian rural context. Reference local foods or traditions.'),
});

export async function runExplanationAgent(analysisData: any, language: string = 'hi') {
    const ai = await createAI();

    const response = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `${SWASTHYA_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════
 EXPLANATION AGENT — TASK
═══════════════════════════════════════════════════════════
Based on the structured medical analysis below, generate a patient-friendly explanation.
Target audience: Rural Indian patient, potentially low health literacy, first time seeing a lab report.

ANALYSIS DATA: ${JSON.stringify(analysisData)}

EXPLANATION REQUIREMENTS:

1. ENGLISH EXPLANATION:
   - Write 3–5 sentences in simple English.
   - Start with what the report shows overall (good news first if applicable).
   - Explain any concerning findings without causing panic.
   - End with reassurance and the importance of seeing a doctor.
   - Do NOT use unexplained medical acronyms. Spell out: CBC = Complete Blood Count.

2. HINDI EXPLANATION (Devanagari):
   - Translate the English explanation into conversational Hindi.
   - Use everyday Hindi — avoid overly formal or clinical language.
   - Make it sound like a knowledgeable friend explaining, not a textbook.

3. CULTURAL CONTEXT:
   - Suggest 1–2 lifestyle or dietary adjustments relevant to Indian culture.
   - Reference foods like: दाल, पालक, आंवला, मोरिंगा, गुड़, हल्दी दूध.
   - If relevant, mention simple practices like morning walks, yoga, or rest.

GUARDRAILS:
- Do NOT mention specific drug names.
- Do NOT give a final diagnosis.
- Always include a reminder to consult a qualified doctor.`,
        output: {
            schema: ExplanationSchema,
        },
    });

    return response.output;
}
