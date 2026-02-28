import { z } from 'zod';
import { createAI } from '@/ai/genkit';
import { SWASTHYA_SYSTEM_PROMPT } from './guardrails';

export const AnalysisSchema = z.object({
    healthScore: z.number().min(0).max(100)
        .describe('Overall health score (0–100). 85–100=excellent, 70–84=good, 50–69=fair, below 50=concerning.'),
    riskAssessment: z.enum(['low', 'moderate', 'high'])
        .describe('Overall risk: low=no urgent concern, moderate=needs attention soon, high=seek care immediately.'),

    // Mission: Clinical Pathology Overview
    targetCondition: z.string().describe('Name of the suspected disease/condition based on STT & Lab Data.'),
    icd10Code: z.string().describe('Estimated ICD-10 Code.'),
    clinicalDefinition: z.string().describe('Deeply educational explanation of pathophysiology at cellular, metabolic, or systemic level.'),
    correlatedBiomarkers: z.array(z.string()).describe('Anomalous lab parameters confirming or correlating with this condition.'),

    // Mission: Pharmacological Mapping
    pharmacologicalMapping: z.array(z.object({
        drugClassName: z.string().describe('e.g., ACE Inhibitors, Beta-2 Agonists'),
        commonGenerics: z.array(z.string()),
        mechanismOfAction: z.string().describe('Exact pharmacodynamics. How the active ingredient binds to receptors or alters chemistry.'),
        clinicalIndication: z.string().describe('Why a doctor chooses this specific class for these symptoms.')
    })).max(3).describe('Up to 3 standard drug classes relevant to the condition.'),

    // Mission: Advanced AI & Literature Correlation
    recentClinicalResearch: z.string().describe('Simulated PubMed/Bio_ClinicalBERT Analysis: current research regarding treatments or causes.'),
    comorbidities: z.array(z.string()).describe('Other conditions highly correlated and should be monitored.'),

    summary: z.string().min(20)
        .describe('A factual, professional, and empathetic clinical summary.'),
    simpleSummary: z.string().min(20)
        .describe('A very simple, jargon-free summary for a layman (4th grade level).'),

    parametersWithStatus: z.array(z.object({
        name: z.string().min(1),
        status: z.enum(['normal', 'attention', 'critical']),
        explanation: z.string().min(15).describe('Simple explanation of what this result means for the patient.'),
        actionableAdvice: z.string().min(15).describe('Specific, practical lifestyle or dietary advice.'),
    })),
    dietaryAdvice: z.array(z.string().min(5)).min(1).describe('Nutrition protocol using Indian-specific accessible foods.'),
    nextSteps: z.array(z.string().min(10)).min(2).describe('Clear, numbered steps for the patient.'),
    recommendation: z.string().min(10),
});

export async function runAnalysisAgent(extractionData: any, nerContext: string = '', ragContext: string = '', symptoms?: string) {
    const ai = await createAI();

    const nerSection = nerContext
        ? `\nPRE-IDENTIFIED BIOMEDICAL ENTITIES (via HuggingFace NER):\n${nerContext}\n`
        : '';

    const historySection = ragContext
        ? `\nPATIENT HISTORY (from similar past reports):\n${ragContext}\n`
        : '';

    const symptomsSection = symptoms
        ? `\nPATIENT REPORTED SYMPTOMS (from STT Transcript):\n${symptoms}\n`
        : '';

    const response = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: `${SWASTHYA_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════
 CLINICAL & PHARMACOLOGICAL DIAGNOSTICS COPILOT
═══════════════════════════════════════════════════════════
MISSION: Analyze the patient's transcribed voice input (Speech-to-Text) alongside their medical report data.
Generate a professional, encyclopedic breakdown of suspected diseases and pharmacological treatments.

DATA INPUTS:
- EXTRACTION DATA: ${JSON.stringify(extractionData)}
- ${nerSection}
- ${historySection}
- ${symptomsSection}

INSTRUCTIONS:
1. Simulate data retrieval from professional Healthcare APIs (RxNorm, PubMed, ICD-10).
2. Maintain a strictly professional, deeply informative, and empathetic tone.
3. DO NOT prescribe medicine. EXPLAIN standard medical protocols and chemistry only.
4. TARGET CONDITION: Identify the most likely condition based on anomalies in the lab data and symptoms.
5. CLINICAL DEFINITION: Explain pathophysiology at a cellular level.
6. PHARMACOLOGICAL MAPPING: Detail up to 3 standard-of-care drug classes.
7. AI & LITERATURE CORRELATION: Simulate recent research and comorbidities to monitor.
8. SIMPLE SUMMARY: Provide a extremely simple version of the findings for someone with no education.

Every field in the schema MUST be populated with high-quality, professional clinical content.`,
        output: {
            schema: AnalysisSchema,
        },
    });

    return response.output;
}
