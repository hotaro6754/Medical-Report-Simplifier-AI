/**
 * Swasthya AI — Extraction Agent (Multi-Format)
 * 
 * Supports two modes:
 *   1. Vision mode  → Gemini Vision API with image buffer (JPG/PNG/scanned PDF)
 *   2. Text mode    → Gemini text API with OCR-extracted raw text (PDF/TXT)
 * 
 * Both modes use the same SWASTHYA_SYSTEM_PROMPT and output schema.
 */

import { z } from 'zod';
import { createAI } from '@/ai/genkit';
import { SWASTHYA_SYSTEM_PROMPT } from './guardrails';

export const ExtractionSchema = z.object({
    type: z.string().min(1).describe('Type of medical report (e.g., CBC, Lipid Panel, Blood Test, Radiology Report)'),
    parameters: z.array(z.object({
        name: z.string().min(1).describe('Exact clinical parameter name as written (e.g., Hemoglobin, Serum Creatinine)'),
        value: z.string().min(1).describe('Measured value as appears in report. Use "UNREADABLE" if not clear.'),
        unit: z.string().describe('Standard SI unit (e.g., g/dL, mg/dL). Empty string if not applicable.'),
        normalRange: z.string().optional().describe('Reference range as printed. Omit if not visible.'),
        boundingBox: z.object({
            ymin: z.number().min(0).max(1000),
            xmin: z.number().min(0).max(1000),
            ymax: z.number().min(0).max(1000),
            xmax: z.number().min(0).max(1000),
        }).optional().describe('Bounding box coordinates (0-1000 scale). Only for image inputs.'),
    })).min(1, 'A valid lab report must have at least one parameter.'),
    confidence: z.number().min(0).max(1).describe('Extraction confidence (0.0–1.0). Below 0.3 = poor legibility.'),
});

const EXTRACTION_TASK = `
═══════════════════════════════════════════════════════════
 EXTRACTION AGENT — TASK
═══════════════════════════════════════════════════════════
Extract ALL measured parameters from the medical document below.

RULES:
- name: exact clinical parameter name as written
- value: measured numeric value exactly as printed. If unreadable: "UNREADABLE"
- unit: standard SI unit shown (e.g., g/dL, mg/dL)
- normalRange: reference range exactly as appears. Omit if not shown.
- confidence: 0.9+ (clear), 0.5–0.9 (moderate), <0.5 (poor)
- If input is NOT a medical document: return error: {"error": "NOT_MEDICAL_DOCUMENT"}
- NEVER fabricate values. NEVER guess. If uncertain → "UNREADABLE"
`;

export async function runExtractionAgent(
    imageBuffer: Buffer | null,
    mimeType: string,
    nerContext: string = '',
    rawText?: string,
): Promise<any> {
    const ai = await createAI();

    const nerSection = nerContext
        ? `\nPRE-ANALYSIS CONTEXT FROM BIOMEDICAL NER:\n${nerContext}\nUse this context to improve parameter identification accuracy.\n`
        : '';

    if (imageBuffer && mimeType.startsWith('image/')) {
        // ── VISION MODE (images + scanned PDFs) ──────────────────────────
        const response = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: [
                {
                    text: `${SWASTHYA_SYSTEM_PROMPT}\n${EXTRACTION_TASK}\n${nerSection}\nAnalyze the medical report image below:`,
                },
                {
                    media: {
                        url: `data:${mimeType};base64,${imageBuffer.toString('base64')}`,
                        contentType: mimeType,
                    },
                },
            ],
            output: { schema: ExtractionSchema },
        });
        return response.output;
    }

    // ── TEXT MODE (PDF text layer + TXT files) ────────────────────────────
    const response = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `${SWASTHYA_SYSTEM_PROMPT}\n${EXTRACTION_TASK}\n${nerSection}\n\nMEDICAL DOCUMENT TEXT:\n\`\`\`\n${rawText ?? ''}\n\`\`\`\n\nExtract all lab parameters from this text.`,
        output: { schema: ExtractionSchema },
    });
    return response.output;
}
