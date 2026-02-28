import { runExtractionAgent } from './extraction-agent';
import { runAnalysisAgent } from './analysis-agent';
import { runExplanationAgent } from './explanation-agent';
import { runCitationsAgent } from './citations-agent';
import { runOcrPipeline, type OcrResult } from './ocr-pipeline';
import { runHuggingFaceNer } from './hf-ner-agent';
import { fetchSimilarReports } from './rag-agent';
import {
    sanitizePII,
    validateMedicalInput,
    validateOutputCompleteness,
    generateSessionId,
} from './guardrails';
import { MedicalReport, Severity } from '../types/medical';

export class AgentOrchestrator {
    async processReport(imageBuffer: Buffer, mimeType: string, filename?: string, symptoms?: string): Promise<MedicalReport> {
        const sessionId = generateSessionId();
        console.log(`[${sessionId}] ═══ Swasthya AI Pipeline Start ═══`);

        // ─── STEP 1: OCR ENGINE ─────────────────────────────────────────────
        const ocrResult = await runOcrPipeline(imageBuffer, mimeType, filename);

        // ─── STEP 2: NER ENRICHMENT ────────────────────────────────────────
        let nerContext = '';
        try {
            if (ocrResult.rawText.length > 20) {
                const nerResult = await runHuggingFaceNer(ocrResult.rawText);
                if (nerResult.entities.length > 0) {
                    const parts: string[] = [];
                    if (nerResult.diseases.length) parts.push(`Identified conditions: ${nerResult.diseases.join(', ')}`);
                    if (nerResult.labValues.length) parts.push(`Lab markers: ${nerResult.labValues.join(', ')}`);
                    nerContext = `\n\nBIOMEDICAL NER PRE-ANALYSIS:\n${parts.join('\n')}`;
                }
            }
        } catch (e) {}

        // ─── STEP 3: EXTRACTION AGENT (Intake & Triage) ────────────────────
        let rawExtraction: any;
        if (ocrResult.method === 'gemini-vision' || ocrResult.rawText.length < 50) {
            rawExtraction = await runExtractionAgent(ocrResult.originalBuffer, ocrResult.originalMimeType, nerContext);
        } else {
            rawExtraction = await runExtractionAgent(null, 'text/plain', nerContext, ocrResult.rawText);
        }

        // ─── STEP 4: GUARDRAILS & RAG ──────────────────────────────────────
        validateMedicalInput(rawExtraction);
        const extractionData = sanitizePII(rawExtraction);

        let ragContext = '';
        // (Historical context fetching omitted for logic flow)

        // ─── STEP 5: ANALYSIS AGENT (Advanced Diagnostics) ────────────────
        const analysisData = await runAnalysisAgent(extractionData, nerContext, ragContext, symptoms);

        // ─── STEP 6 & 7: PARALLEL AGENTS ───────────────────────────────────
        const [explanationData, citationsData] = await Promise.all([
            runExplanationAgent(analysisData),
            runCitationsAgent(analysisData),
        ]);

        // ─── STEP 8: FINAL ASSEMBLY ───────────────────────────────────────────
        const reportSeverity: Severity =
            analysisData!.riskAssessment === 'high' ? 'critical' :
                analysisData!.riskAssessment === 'moderate' ? 'attention' : 'normal';

        const report: MedicalReport = {
            id: sessionId,
            userId: 'anonymous',
            type: extractionData.document_classification || 'Medical Report',
            classification: extractionData.document_classification,
            patientDemographics: extractionData.patient_demographics,
            uploadedAt: new Date(),
            severity: reportSeverity,
            healthScore: analysisData!.healthScore,
            riskAssessment: analysisData!.riskAssessment,
            dietaryAdvice: analysisData!.dietaryAdvice,
            nextSteps: analysisData!.nextSteps,
            confidence: extractionData.confidence_score,

            parameters: (extractionData.extracted_data ?? []).map((p: any) => {
                const statusData = (analysisData!.parametersWithStatus ?? [])
                    .find((ps: any) => ps.name.toLowerCase() === p.item_name.toLowerCase());

                return {
                    name: p.item_name,
                    value: p.value_or_dosage,
                    unit: '',
                    normalRange: p.reference_range_or_frequency,
                    status: (statusData?.status ?? 'normal') as Severity,
                    explanation: statusData?.explanation ?? 'Analysis provided in summary.',
                    actionableAdvice: statusData?.actionableAdvice,
                    boundingBox: p.boundingBox,
                };
            }),

            summary: analysisData!.summary,
            simpleSummary: analysisData!.simpleSummary,
            hindiExplanation: explanationData?.hindiExplanation,
            imageBase64: ocrResult.originalBuffer.toString('base64'),
            imageMimeType: ocrResult.originalMimeType,
            citations: citationsData?.citations ?? [],

            targetCondition: analysisData!.targetCondition,
            icd10Code: analysisData!.icd10Code,
            clinicalDefinition: analysisData!.clinicalDefinition,
            correlatedBiomarkers: analysisData!.correlatedBiomarkers,
            pharmacologicalMapping: analysisData!.pharmacologicalMapping,
            recentClinicalResearch: analysisData!.recentClinicalResearch,
            comorbidities: analysisData!.comorbidities,
        };

        return report;
    }
}
