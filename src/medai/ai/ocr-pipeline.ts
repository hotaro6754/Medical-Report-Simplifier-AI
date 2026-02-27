/**
 * Swasthya AI — Multi-Format OCR Pipeline
 * 
 * Supports: JPEG, PNG, PDF (text + scanned), TXT
 * 
 * Flow:
 *   JPEG/PNG  → Tesseract.js OCR → raw text
 *   PDF (text)→ pdf-parse → raw text  
 *   PDF (scan)→ pdf-parse → if empty → passed to Gemini Vision as base64
 *   TXT       → direct UTF-8 decode
 */

import Tesseract from 'tesseract.js';

export interface OcrResult {
    rawText: string;
    confidence: number;    // 0.0 – 1.0
    pageCount: number;
    method: 'tesseract' | 'pdf-parse' | 'direct-text' | 'gemini-vision';
    originalBuffer: Buffer;
    originalMimeType: string;
}

/**
 * Main entry point. Accepts any file buffer + mimeType.
 * Returns normalized OcrResult for downstream AI agents.
 */
export async function runOcrPipeline(
    buffer: Buffer,
    mimeType: string,
    filename?: string
): Promise<OcrResult> {

    const ext = filename?.split('.').pop()?.toLowerCase();

    // ── TXT files ─────────────────────────────────────────────────────────
    if (mimeType === 'text/plain' || ext === 'txt') {
        const rawText = buffer.toString('utf-8');
        if (rawText.trim().length < 10) {
            throw new Error('OCR_FAILED: Text file appears to be empty or too short.');
        }
        return {
            rawText,
            confidence: 1.0,
            pageCount: 1,
            method: 'direct-text',
            originalBuffer: buffer,
            originalMimeType: mimeType,
        };
    }

    // ── PDF files ──────────────────────────────────────────────────────────
    if (mimeType === 'application/pdf' || ext === 'pdf') {
        return await extractPdf(buffer);
    }

    // ── Image files (JPEG, PNG, WebP, TIFF) ───────────────────────────────
    if (
        mimeType.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(ext ?? '')
    ) {
        return await extractImage(buffer, mimeType);
    }

    throw new Error(`OCR_FAILED: Unsupported file type "${mimeType}". Please upload JPG, PNG, PDF, or TXT.`);
}

/**
 * Extract text from image using Tesseract.js OCR.
 * For images, we also keep the original buffer so Gemini Vision can be used.
 */
async function extractImage(buffer: Buffer, mimeType: string): Promise<OcrResult> {
    try {
        const { data } = await Tesseract.recognize(buffer, 'eng', {
            logger: () => { }, // silent
        });

        const rawText = data.text?.trim() ?? '';
        const confidence = (data.confidence ?? 0) / 100; // Tesseract returns 0-100

        // Even if Tesseract confidence is low, we return the result and let
        // the extraction agent use Gemini Vision (original buffer) as fallback
        return {
            rawText,
            confidence,
            pageCount: 1,
            method: 'tesseract',
            originalBuffer: buffer,
            originalMimeType: mimeType,
        };
    } catch (err: any) {
        throw new Error(`OCR_FAILED: Tesseract could not process image. ${err.message}`);
    }
}

/**
 * Extract text from PDF using pdf-parse.
 * If PDF has no embedded text (scanned), falls back to flagging for Gemini Vision.
 */
async function extractPdf(buffer: Buffer): Promise<OcrResult> {
    try {
        // Dynamic import to avoid ESM issues with pdf-parse
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);

        const rawText = data.text?.trim() ?? '';
        const pageCount = data.numpages ?? 1;

        if (rawText.length < 50) {
            // Scanned PDF — no embedded text layer found
            // Return buffer as image for Gemini Vision to handle
            console.log('[OCR] PDF has no text layer — flagging for Gemini Vision.');
            return {
                rawText: '',
                confidence: 0,
                pageCount,
                method: 'gemini-vision',
                originalBuffer: buffer,
                originalMimeType: 'application/pdf',
            };
        }

        // Clean up whitespace artifacts common in PDF extraction
        const cleanedText = rawText
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim();

        return {
            rawText: cleanedText,
            confidence: 0.9,
            pageCount,
            method: 'pdf-parse',
            originalBuffer: buffer,
            originalMimeType: 'application/pdf',
        };
    } catch (err: any) {
        throw new Error(`OCR_FAILED: Could not parse PDF file. ${err.message}`);
    }
}
