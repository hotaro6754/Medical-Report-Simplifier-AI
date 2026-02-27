/**
 * Swasthya AI — HuggingFace Biomedical NER Agent
 * 
 * Model: d4data/biomedical-ner-all
 * Recognizes 107 entity types including:
 *   - Diseases (DISEASE)
 *   - Drugs (CHEMICAL)
 *   - Lab tests (LAB_VALUE)
 *   - Body parts (BODY_PART)
 *   - Medical procedures (PROCEDURE)
 * 
 * Used as PRE-ANALYSIS enrichment — identifies entities BEFORE Gemini analysis
 * so the analysis prompt is richer and more accurate.
 */

const HF_API_URL = 'https://api-inference.huggingface.co/models/d4data/biomedical-ner-all';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;

export interface NerEntity {
    entity_group: string;   // e.g. "DISEASE", "CHEMICAL", "LAB_VALUE"
    word: string;           // e.g. "Hemoglobin", "Iron deficiency"
    score: number;          // 0.0–1.0 confidence
    start: number;
    end: number;
}

export interface NerResult {
    entities: NerEntity[];
    diseases: string[];
    chemicals: string[];
    labValues: string[];
    procedures: string[];
    isMedicalDocument: boolean;
    medicalScore: number;   // proportion of medical entities found
}

/**
 * Run NER on extracted text. Returns enriched entity data.
 * Retries once on HuggingFace cold-start (503 loading response).
 */
export async function runHuggingFaceNer(text: string): Promise<NerResult> {
    if (!text || text.trim().length < 10) {
        return emptyNerResult();
    }

    // HuggingFace has 512 token limit per request — chunk if needed
    const chunks = chunkText(text, 400); // ~400 words per chunk
    const allEntities: NerEntity[] = [];

    for (const chunk of chunks) {
        const result = await callHfApi(chunk);
        allEntities.push(...result);
    }

    // Deduplicate by word (case-insensitive)
    const seen = new Set<string>();
    const uniqueEntities = allEntities.filter(e => {
        const key = e.word.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Categorize
    const diseases = uniqueEntities
        .filter(e => ['DISEASE', 'Disease_disorder', 'PROBLEM'].includes(e.entity_group))
        .map(e => e.word);

    const chemicals = uniqueEntities
        .filter(e => ['CHEMICAL', 'DRUG', 'Chemical'].includes(e.entity_group))
        .map(e => e.word);

    const labValues = uniqueEntities
        .filter(e => ['LAB_VALUE', 'TEST', 'FINDING'].includes(e.entity_group))
        .map(e => e.word);

    const procedures = uniqueEntities
        .filter(e => ['PROCEDURE', 'Treatment_procedure'].includes(e.entity_group))
        .map(e => e.word);

    const medicalEntityCount = diseases.length + labValues.length + procedures.length;
    const medicalScore = Math.min(1.0, medicalEntityCount / Math.max(1, uniqueEntities.length));
    const isMedicalDocument = medicalEntityCount >= 2 || uniqueEntities.length >= 3;

    return {
        entities: uniqueEntities,
        diseases,
        chemicals,
        labValues,
        procedures,
        isMedicalDocument,
        medicalScore,
    };
}

async function callHfApi(text: string, retries = 2): Promise<NerEntity[]> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(HF_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: text,
                    parameters: {
                        aggregation_strategy: 'simple',
                    },
                }),
            });

            if (response.status === 503) {
                // HF model still loading — wait and retry
                console.log('[HF NER] Model loading, waiting 10s...');
                await sleep(10000);
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[HF NER] API error:', errorText);
                return []; // Non-critical — gracefully degrade
            }

            const data = await response.json();
            if (!Array.isArray(data)) return [];
            return data.filter((e: any) => e.score > 0.6); // Only high-confidence entities

        } catch (err: any) {
            console.error('[HF NER] Fetch error:', err.message);
            return []; // Fail gracefully — NER is enrichment, not critical path
        }
    }
    return [];
}

function chunkText(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function emptyNerResult(): NerResult {
    return {
        entities: [],
        diseases: [],
        chemicals: [],
        labValues: [],
        procedures: [],
        isMedicalDocument: false,
        medicalScore: 0,
    };
}
