/**
 * Swasthya AI — Sarvam AI Speech-to-Text (STT)
 * 
 * Model: saarika:v2
 * Supports: 22 Indian languages + English
 * Use cases:
 *   - Voice input for upload instructions
 *   - Voice follow-up questions about report
 *   - Hands-free accessibility for rural users
 */

const SARVAM_API_KEY = process.env.SARVAM_API_KEY!;
const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

export interface SttResult {
    transcript: string;
    languageCode: string;
    confidence?: number;
}

/**
 * Transcribe audio blob using Sarvam saarika:v2.
 * Accepts WAV/MP3/WebM audio from MediaRecorder.
 */
export async function speechToText(
    audioBlob: Blob,
    languageCode: string = 'hi-IN'
): Promise<SttResult> {
    if (!audioBlob || audioBlob.size === 0) {
        throw new Error('STT_FAILED: Empty audio recording.');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'saarika:v2');
    formData.append('language_code', languageCode);
    formData.append('with_timestamps', 'false');
    formData.append('with_diarization', 'false');

    const response = await fetch(SARVAM_STT_URL, {
        method: 'POST',
        headers: {
            'api-subscription-key': SARVAM_API_KEY,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`STT_FAILED: Sarvam API error — ${error}`);
    }

    const data = await response.json();
    const transcript = data.transcript?.trim();

    if (!transcript) {
        throw new Error('STT_FAILED: No speech detected in the recording.');
    }

    return {
        transcript,
        languageCode: data.language_code ?? languageCode,
        confidence: data.confidence,
    };
}

/**
 * Client-side: Record microphone audio and return as Blob.
 * Uses the browser MediaRecorder API.
 */
export async function recordAudio(seconds: number = 10): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            reject(new Error('MIC_FAILED: Microphone permission denied.'));
            return;
        }

        const chunks: BlobPart[] = [];
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg',
        });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            stream.getTracks().forEach(t => t.stop());
            resolve(blob);
        };

        mediaRecorder.onerror = (e) => {
            stream.getTracks().forEach(t => t.stop());
            reject(new Error('MIC_FAILED: Recording error.'));
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), seconds * 1000);
    });
}
