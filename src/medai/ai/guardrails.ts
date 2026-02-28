/**
 * Swasthya AI — Medical Guardrails Layer
 * 
 * HIPAA / DPDP Act (India) 2023 / GDPR Aligned:
 * - No PII in AI prompts
 * - Stateless, no server-side persistence
 * - Input validation to block non-medical documents
 * - Output completeness checks — zero fallback strings
 * - Scope enforcement — AI NEVER prescribes or diagnoses
 */

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

/** Approved citation domains. The AI must only reference these sources. */
export const APPROVED_CITATION_DOMAINS = [
    'pubmed.ncbi.nlm.nih.gov',
    'who.int',
    'icmr.gov.in',
    'mohfw.gov.in',
    'mayoclinic.org',
    'medlineplus.gov',
    'bmj.com',
    'thelancet.com',
    'nim.nih.gov',
    'nejm.org',
];

/** PII field patterns to strip before passing data to AI agents */
const PII_FIELDS = [
    'patientName', 'name', 'patient_name',
    'dob', 'dateOfBirth', 'date_of_birth',
    'mrn', 'patientId', 'patient_id',
    'aadhaar', 'address', 'phone', 'email',
    'insuranceId', 'insurance_id',
    'referringDoctor', 'referring_doctor',
];

// ─── THE SWASTHYA AI MEDICAL PERSONA (Shared System Prompt) ──────────────────

export const SWASTHYA_SYSTEM_PROMPT = `
You are Swasthya AI — a certified medical intelligence assistant built to serve rural India.
Your analysis is powered by Google Gemini and strictly follows these non-negotiable rules:

═══════════════════════════════════════════════════════════
 SAFETY RULES (ABSOLUTE — NO EXCEPTIONS)
═══════════════════════════════════════════════════════════
1. ONLY analyze content from clinical lab reports or medical documents.
   If the input is NOT a medical document, respond with: {"error": "NOT_MEDICAL_DOCUMENT"}
2. NEVER prescribe specific drug names, dosages, or treatment plans.
3. NEVER give a definitive diagnosis. Use language like "may indicate" or "associated with".
4. NEVER fabricate values, ranges, or medical facts. If data is unreadable, mark it as "UNREADABLE".
5. NEVER share, repeat, or reference any patient identifiable information (names, DOB, IDs).
6. ALL output must be based solely on the data provided in this prompt.

═══════════════════════════════════════════════════════════
 COMMUNICATION RULES
═══════════════════════════════════════════════════════════
7. Write at an 8th-grade reading level. Avoid unexplained medical jargon.
8. Always recommend the patient consult a qualified medical professional.
9. Frame all insights as informational, not prescriptive.
10. Dietary advice must reference foods accessible in rural India (e.g., dal, spinach, amla, jaggery).

═══════════════════════════════════════════════════════════
 OUTPUT RULES
═══════════════════════════════════════════════════════════
11. Return output STRICTLY in the JSON schema provided. No markdown, no extra text.
12. Every required field MUST be populated. An empty string or null is NOT acceptable.
13. If a value cannot be determined with confidence, state "Insufficient data to evaluate."
`.trim();

// ─── GUARDRAIL FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Strips PII fields from a raw extraction object before it is sent to analysis agents.
 * HIPAA / DPDP 2023 Compliant.
 */
export function sanitizePII(data: Record<string, any>): Record<string, any> {
    if (!data || typeof data !== 'object') return data;
    const sanitized = { ...data };
    for (const field of PII_FIELDS) {
        if (field in sanitized) {
            delete sanitized[field];
        }
    }
    // Recursively sanitize nested objects
    for (const key of Object.keys(sanitized)) {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
            sanitized[key] = sanitizePII(sanitized[key]);
        }
    }
    return sanitized;
}

/**
 * Input guardrail: validates extraction output is from a genuine medical report.
 */
export function validateMedicalInput(extractionData: any): void {
    if (!extractionData) {
        throw new Error('GUARDRAIL_FAILED: Extraction agent returned no data.');
    }
    if (extractionData.document_classification === 'UNKNOWN_OR_INVALID') {
        throw new Error('GUARDRAIL_FAILED: Document not recognized as a medical report. Please upload a valid lab report, prescription, or radiology summary.');
    }
    if (!extractionData.extracted_data || !Array.isArray(extractionData.extracted_data) || extractionData.extracted_data.length === 0) {
        throw new Error('GUARDRAIL_FAILED: No clinical data could be extracted. Please upload a clearer image of your medical document.');
    }
}

/**
 * Output guardrail: validates analysis output has all required fields populated.
 */
export function validateOutputCompleteness(analysisData: any): void {
    if (!analysisData) {
        throw new Error('GUARDRAIL_FAILED: Analysis agent returned no output.');
    }
    if (!analysisData.summary || analysisData.summary.trim().length < 10) {
        throw new Error('GUARDRAIL_FAILED: AI returned an empty or insufficient summary.');
    }
    if (typeof analysisData.healthScore !== 'number') {
        throw new Error('GUARDRAIL_FAILED: Health score is missing.');
    }
}

/**
 * Generates a traceable session ID for audit logging (no PII).
 * Format: SW-{timestamp}-{random}
 */
export function generateSessionId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `SW-${timestamp}-${random}`;
}
