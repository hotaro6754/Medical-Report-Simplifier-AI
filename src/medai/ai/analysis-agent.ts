import { z } from 'zod';
import { createAI } from '@/ai/genkit';
import { SWASTHYA_SYSTEM_PROMPT } from './guardrails';

export const AnalysisSchema = z.object({
    healthScore: z.number().min(0).max(100)
        .describe('Overall health score (0–100). 85–100=excellent, 70–84=good, 50–69=fair, below 50=concerning.'),
    riskAssessment: z.enum(['low', 'moderate', 'high'])
        .describe('Overall risk: low=no urgent concern, moderate=needs attention soon, high=seek care immediately.'),
    summary: z.string().min(20)
        .describe('A factual, plain-language (8th grade) summary of the overall findings. Min 20 characters.'),
    parametersWithStatus: z.array(z.object({
        name: z.string().min(1),
        status: z.enum(['normal', 'attention', 'critical']),
        explanation: z.string().min(15)
            .describe('What this parameter measures and what the result means for this patient. Simple language.'),
        actionableAdvice: z.string().min(15)
            .describe('One specific, practical thing the patient can do. Avoid drug names or specific dosages.'),
    })).min(1, 'Must return an assessment for every extracted parameter.'),
    dietaryAdvice: z.array(z.string().min(5)).min(1)
        .describe('Min 3 specific dietary recommendations using Indian foods accessible in rural areas.'),
    nextSteps: z.array(z.string().min(10)).min(2)
        .describe('2–4 clear, numbered next steps for the patient. Example: "Visit your nearest PHC within 7 days."'),
    recommendation: z.string().min(10)
        .describe('Overall urgency recommendation. e.g., "Schedule a PHC visit within 2 weeks" or "Seek emergency care today".'),
});

export async function runAnalysisAgent(extractionData: any, nerContext: string = '', ragContext: string = '', symptoms?: string) {
    const ai = await createAI();

    const nerSection = nerContext
        ? `\nPRE-IDENTIFIED BIOMEDICAL ENTITIES (via HuggingFace NER):\n${nerContext}\nCross-reference these entities with the parameters below for higher accuracy.\n`
        : '';

    const historySection = ragContext
        ? `\nPATIENT HISTORY (from similar past reports):\n${ragContext}\nAnalyze trends comparing the new data against this historical data where relevant.\n`
        : '';

    const symptomsSection = symptoms
        ? `\nPATIENT REPORTED SYMPTOMS:\n${symptoms}\nFactor these symptoms into your final assessment, correlation, and recommendations.\n`
        : '';

    const response = await ai.generate({
        model: 'googleai/gemini-3.0-flash',
        prompt: `${SWASTHYA_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════
 ANALYSIS AGENT — TASK
═══════════════════════════════════════════════════════════
Analyze the following extracted medical parameters and generate a structured health assessment.

DATA: ${JSON.stringify(extractionData)}
${nerSection}
${historySection}
${symptomsSection}

ANALYSIS REQUIREMENTS:

1. HEALTH SCORE (0–100):
   - Base it on how many parameters fall outside normal ranges and by how much.
   - 100 = all values perfectly normal. Deduct points for deviations.

2. RISK ASSESSMENT (low / moderate / high):
   - high: Any critical value requiring immediate care (e.g., very low hemoglobin, dangerously high glucose).
   - moderate: Values out of range but not immediately dangerous.
   - low: All values within normal or borderline normal range.

3. PARAMETER EXPLANATIONS:
   - For EACH parameter, write a simple explanation (what it is + what this value means).
   - Write as if explaining to a patient with no medical background.
   - Provide ONE actionable piece of advice per parameter (lifestyle, diet, or "see a doctor").
   - CRITICAL: Do NOT prescribe specific drug names or dosages.

4. DIETARY ADVICE (Indian-specific):
   - Suggest 3–5 foods available in Indian markets or rural areas.
   - Examples: "Eat amla (Indian gooseberry) daily for Vitamin C", "Include moringa leaves in dal for iron."

5. NEXT STEPS:
   - Provide 2–4 clear, numbered action steps.
   - Be specific about timing: "within 48 hours", "within 2 weeks", etc.
   - Always include: "Consult a qualified medical professional before making any health decisions."

GUARDRAILS:
- Do NOT diagnose. Use "may indicate" or "is associated with".
- Do NOT fabricate reference ranges or values not present in the data.
- Every field is required. "Insufficient data" is acceptable for fields that cannot be determined.`,
        output: {
            schema: AnalysisSchema,
        },
    });

    return response.output;
}
