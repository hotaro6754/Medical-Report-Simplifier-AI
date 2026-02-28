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

/**
 * Swasthya AI — Full Agent Orchestrator
 *
 * Pipeline:
 * 1. OCR Engine        → Extract raw text from JPG/PNG/PDF/TXT
 * 2. HuggingFace NER   → Biomedical entity recognition (107 types)
 * 3. Extraction Agent  → Gemini Vision OR text-based parameter extraction
 * 4. Input Guardrail   → Validate medical document, strip PII
 * 5. Analysis Agent    → NER-enriched Gemini structured health assessment
 * 6. Output Guardrail  → Reject fallbacks, validate completeness
 * 7. Parallel Agents   → Explanation (Hindi/English) + Citations (WHO/PubMed)
 * 8. Final Assembly    → MedicalReport with session audit ID
 */
export class AgentOrchestrator {
    async processReport(imageBuffer: Buffer, mimeType: string, filename?: string, symptoms?: string, language: string = 'Hindi'): Promise<MedicalReport> {
        const sessionId = generateSessionId();
        console.log(`[${sessionId}] ═══ Swasthya AI Pipeline Start ═══`);
        console.log(`[${sessionId}] File: ${filename ?? 'unknown'} | MIME: ${mimeType}`);

        // ─── STEP 1: OCR ENGINE ─────────────────────────────────────────────
        console.log(`[${sessionId}] Step 1: OCR Pipeline`);
        let ocrResult: OcrResult;
        try {
            ocrResult = await runOcrPipeline(imageBuffer, mimeType, filename);
            console.log(`[${sessionId}] OCR: method=${ocrResult.method}, confidence=${ocrResult.confidence.toFixed(2)}, chars=${ocrResult.rawText.length}`);
        } catch (ocrErr: any) {
            throw new Error(`[${sessionId}] ${ocrErr.message}`);
        }

        // ─── STEP 2: HUGGINGFACE NER ENRICHMENT ────────────────────────────
        console.log(`[${sessionId}] Step 2: HuggingFace biomedical NER`);
        let nerContext = '';
        try {
            if (ocrResult.rawText.length > 20) {
                const nerResult = await runHuggingFaceNer(ocrResult.rawText);
                console.log(`[${sessionId}] NER: entities=${nerResult.entities.length}, medical=${nerResult.isMedicalDocument}, score=${nerResult.medicalScore.toFixed(2)}`);

                if (nerResult.entities.length > 0) {
                    const parts: string[] = [];
                    if (nerResult.diseases.length) parts.push(`Identified conditions: ${nerResult.diseases.join(', ')}`);
                    if (nerResult.labValues.length) parts.push(`Lab markers: ${nerResult.labValues.join(', ')}`);
                    if (nerResult.chemicals.length) parts.push(`Substances detected: ${nerResult.chemicals.join(', ')}`);
                    if (nerResult.procedures.length) parts.push(`Procedures: ${nerResult.procedures.join(', ')}`);
                    nerContext = `\n\nBIOMEDICAL NER PRE-ANALYSIS:\n${parts.join('\n')}`;
                }
            }
        } catch (nerErr: any) {
            // NER is enrichment only — pipeline continues even if it fails
            console.warn(`[${sessionId}] NER skipped (non-critical): ${nerErr.message}`);
        }

        // ─── STEP 3: EXTRACTION AGENT ───────────────────────────────────────
        console.log(`[${sessionId}] Step 3: Extraction Agent`);
        let rawExtraction: any;

        if (ocrResult.method === 'gemini-vision' || ocrResult.rawText.length < 50) {
            // Use Gemini Vision for images and scanned PDFs
            rawExtraction = await runExtractionAgent(ocrResult.originalBuffer, ocrResult.originalMimeType, nerContext);
        } else {
            // Use Gemini text mode with OCR output + NER enrichment
            rawExtraction = await runExtractionAgent(null, 'text/plain', nerContext, ocrResult.rawText);
        }

        // ─── STEP 4: INPUT GUARDRAIL ────────────────────────────────────────
        console.log(`[${sessionId}] Step 4: Input Guardrail`);
        validateMedicalInput(rawExtraction);
        const extractionData = sanitizePII(rawExtraction as Record<string, any>);
        console.log(`[${sessionId}] Sanitized. Parameters: ${extractionData.parameters?.length ?? 0}`);

        // ─── STEP 4.5: RAG HISTORICAL CONTEXT ───────────────────────────────
        let ragContext = '';
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const { createServerClient } = await import('@supabase/ssr');
            const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } });

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log(`[${sessionId}] Step 4.5: Fetching RAG context for user`);
                // Use the stringified extraction data to find similar past reports
                const stringifiedParams = JSON.stringify(extractionData.parameters || extractionData);
                const similarReports = await fetchSimilarReports(user.id, stringifiedParams);

                if (similarReports.length > 0) {
                    console.log(`[${sessionId}] RAG: Found ${similarReports.length} similar past reports`);
                    ragContext = similarReports.map(r =>
                        `Report from ${new Date(r.uploaded_at).toLocaleDateString('en-IN')}:\n${r.summary}`
                    ).join('\n\n');
                }
            }
        } catch (ragErr: any) {
            console.warn(`[${sessionId}] RAG skipped (non-critical): ${ragErr.message}`);
        }

        // ─── STEP 5: ANALYSIS AGENT ─────────────────────────────────────────
        console.log(`[${sessionId}] Step 5: Analysis Agent (NER-enriched + RAG-history + Symptoms)`);
        const analysisData = await runAnalysisAgent(extractionData, nerContext, ragContext, symptoms);

        // ─── STEP 6: OUTPUT GUARDRAIL ───────────────────────────────────────
        console.log(`[${sessionId}] Step 6: Output Guardrail`);
        validateOutputCompleteness(analysisData);

        // ─── STEP 7: PARALLEL AGENTS ─────────────────────────────────────────
        console.log(`[${sessionId}] Step 7: Explanation + Citations in parallel`);
        const [explanationData, citationsData] = await Promise.all([
            runExplanationAgent(analysisData, language),
            runCitationsAgent(analysisData),
        ]);

        if (!explanationData) {
            throw new Error(`[${sessionId}] GUARDRAIL_FAILED: Explanation agent returned no output.`);
        }

        // ─── STEP 8: FINAL ASSEMBLY ───────────────────────────────────────────
        console.log(`[${sessionId}] Step 8: Assembling MedicalReport`);

        const reportSeverity: Severity =
            analysisData!.riskAssessment === 'high' ? 'critical' :
                analysisData!.riskAssessment === 'moderate' ? 'attention' : 'normal';

        const DISCLAIMER_HI = `⚕️ यह विश्लेषण केवल सूचना के लिए है। कृपया योग्य चिकित्सक से परामर्श करें।`;

        const report: MedicalReport = {
            id: sessionId,
            userId: 'anonymous',
            type: extractionData.type,
            uploadedAt: new Date(),
            severity: reportSeverity,
            healthScore: analysisData!.healthScore,
            riskAssessment: analysisData!.riskAssessment,
            dietaryAdvice: analysisData!.dietaryAdvice,
            nextSteps: [
                ...analysisData!.nextSteps,
                'Consult a qualified medical professional before making any health decisions.',
            ],
            confidence: extractionData.confidence,
            parameters: (extractionData.parameters ?? []).map((p: any) => {
                const statusData = (analysisData!.parametersWithStatus ?? [])
                    .find((ps: any) => ps.name.toLowerCase() === p.name.toLowerCase());

                if (!statusData) {
                    console.warn(`[${sessionId}] No analysis match for: ${p.name}`);
                }

                return {
                    name: p.name,
                    value: p.value,
                    unit: p.unit,
                    normalRange: p.normalRange,
                    status: (statusData?.status ?? 'normal') as Severity,
                    explanation: statusData?.explanation ?? 'Insufficient data to evaluate this parameter.',
                    actionableAdvice: statusData?.actionableAdvice ?? 'Please discuss this value with your doctor.',
                    boundingBox: p.boundingBox,
                };
            }),
            summary: analysisData!.summary,
            regionalExplanation: `${explanationData.regionalExplanation}\n\n${DISCLAIMER_HI}`,
            imageBase64: ocrResult.originalBuffer.toString('base64'),
            imageMimeType: ocrResult.originalMimeType,
            citations: citationsData?.citations ?? [],
        };

        console.log(`[${sessionId}] ═══ Pipeline Complete — Severity: ${report.severity}, Score: ${report.healthScore} ═══`);
        return report;
    }
}
