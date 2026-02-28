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
    document_classification: z.enum([
        'LAB_REPORT',
        'RADIOLOGY_REPORT_XRAY',
        'RADIOLOGY_REPORT_MRI',
        'RADIOLOGY_REPORT_CT',
        'CARDIOLOGY_ECG',
        'CLINICAL_PRESCRIPTION',
        'DISCHARGE_SUMMARY',
        'UNKNOWN_OR_INVALID'
    ]).describe('Classify the medical document type based on visual layout and terminology.'),
    confidence_score: z.number().min(0).max(1).describe('Extraction confidence (0.0–1.0).'),
    patient_demographics: z.object({
        age: z.string().nullable(),
        gender: z.string().nullable()
    }).describe('Basic patient info if available.'),
    overall_severity: z.enum(['normal', 'attention', 'critical']).describe('Initial assessment of report urgency.'),
    clinical_summary: z.string().min(20).describe('A 2-3 sentence clinical summary of findings or treatment plan.'),
    extracted_data: z.array(z.object({
        item_name: z.string().min(1).describe('Name of parameter / anatomical region / medication'),
        value_or_dosage: z.string().min(1).describe('Measured value OR prescribed dosage'),
        reference_range_or_frequency: z.string().describe('Standard range OR prescription instructions'),
        status: z.enum(['normal', 'specific_abnormality', 'actionable_medication']).describe('Status of the item.'),
        boundingBox: z.object({
            ymin: z.number().min(0).max(1000),
            xmin: z.number().min(0).max(1000),
            ymax: z.number().min(0).max(1000),
            xmax: z.number().min(0).max(1000),
        }).optional().describe('Bounding box coordinates (0-1000 scale). Only for image inputs.'),
    })).min(1, 'A valid medical document must have at least one extracted item.'),
    associated_diseases_or_indications: z.array(z.string()).describe('List of suspected conditions or medical diagnosis targeted.')
});

const EXTRACTION_TASK = `
═══════════════════════════════════════════════════════════
 EXTRACTION AGENT — TASK
═══════════════════════════════════════════════════════════
MISSION: You are Swasthya AI's Clinical Intake & Triage Vision Agent.
Analyze the uploaded medical file and extract data into a structured format.

STEP 1: DOCUMENT CLASSIFICATION
Classify the document as LAB_REPORT, RADIOLOGY_REPORT_XRAY, RADIOLOGY_REPORT_MRI, RADIOLOGY_REPORT_CT, CARDIOLOGY_ECG, CLINICAL_PRESCRIPTION, DISCHARGE_SUMMARY, or UNKNOWN_OR_INVALID.

STEP 2: CATEGORY-SPECIFIC EXTRACTION
- For LAB_REPORTS/RADIOLOGY/CARDIOLOGY: Extract parameters, values, units, and reference ranges.
- For CLINICAL_PRESCRIPTIONS: Extract medications, dosage, route, frequency, and generic names.

STEP 3: MAPPING TO SCHEMA
- item_name: Parameter name or Medication name.
- value_or_dosage: Measured value (e.g., "11.2 g/dL") or dosage (e.g., "500mg Oral").
- reference_range_or_frequency: Reference range (e.g., "12.0 - 16.0") or instructions (e.g., "twice a day").
- status: "normal", "specific_abnormality" (for abnormal values), or "actionable_medication" (for prescriptions).

RULES:
- If document is UNKNOWN_OR_INVALID, return that classification.
- NEVER fabricate values. If uncertain -> "UNREADABLE".
`;

export async function runExtractionAgent(
    imageBuffer: Buffer | null,
    mimeType: string,
    nerContext: string = '',
    rawText?: string,
): Promise<any> {
    const ai = await createAI();

    const nerSection = nerContext
        ? \`\nPRE-ANALYSIS CONTEXT FROM BIOMEDICAL NER:\n\${nerContext}\nUse this context to improve parameter identification accuracy.\n\`
        : '';

    if (imageBuffer && mimeType.startsWith('image/')) {
        const response = await ai.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt: [
                {
                    text: \`\${SWASTHYA_SYSTEM_PROMPT}\n\${EXTRACTION_TASK}\n\${nerSection}\nAnalyze the medical report image below:\`,
                },
                {
                    media: {
                        url: \`data:\${mimeType};base64,\${imageBuffer.toString('base64')}\`,
                        contentType: mimeType,
                    },
                },
            ],
            output: { schema: ExtractionSchema },
        });
        return response.output;
    }

    const response = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: \`\${SWASTHYA_SYSTEM_PROMPT}\n\${EXTRACTION_TASK}\n\${nerSection}\n\nMEDICAL DOCUMENT TEXT:\n\`\`\`\n\${rawText ?? ''}\n\`\`\`\n\nExtract all data from this text.\`,
        output: { schema: ExtractionSchema },
    });
    return response.output;
}
