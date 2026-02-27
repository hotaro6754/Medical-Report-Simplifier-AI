/**
 * Swasthya AI — Sarvam AI Text-to-Speech (TTS)
 * 
 * Model: bulbul:v3
 * Voices: 30+ Indian voices across 11 languages
 * Use cases:
 *   - Auto-narrate analysis summary after report processing
 *   - "Listen" button on each parameter card
 *   - Full Hindi narration on results page
 */

const SARVAM_API_KEY = process.env.SARVAM_API_KEY!;
const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';

export type SarvamLanguageCode =
    | 'hi-IN'   // Hindi
    | 'te-IN'   // Telugu
    | 'ta-IN'   // Tamil
    | 'kn-IN'   // Kannada
    | 'ml-IN'   // Malayalam
    | 'mr-IN'   // Marathi
    | 'gu-IN'   // Gujarati
    | 'pa-IN'   // Punjabi
    | 'bn-IN'   // Bengali
    | 'or-IN'   // Odia
    | 'en-IN';  // Indian English

// Available Sarvam bulbul:v3 voices per language
export const SARVAM_VOICES: Record<SarvamLanguageCode, { id: string; name: string; gender: 'M' | 'F' }[]> = {
    'hi-IN': [
        { id: 'meera', name: 'Meera', gender: 'F' },
        { id: 'pavithra', name: 'Pavithra', gender: 'F' },
        { id: 'maitreyi', name: 'Maitreyi', gender: 'F' },
        { id: 'arvind', name: 'Arvind', gender: 'M' },
        { id: 'amol', name: 'Amol', gender: 'M' },
    ],
    'te-IN': [
        { id: 'hema', name: 'Hema', gender: 'F' },
        { id: 'lekha', name: 'Lekha', gender: 'F' },
    ],
    'ta-IN': [
        { id: 'nila', name: 'Nila', gender: 'F' },
        { id: 'vian', name: 'Vian', gender: 'M' },
    ],
    'kn-IN': [
        { id: 'maya', name: 'Maya', gender: 'F' },
        { id: 'kiran', name: 'Kiran', gender: 'M' },
    ],
    'ml-IN': [
        { id: 'lekha', name: 'Lekha', gender: 'F' },
    ],
    'mr-IN': [
        { id: 'maitreyi', name: 'Maitreyi', gender: 'F' },
        { id: 'amol', name: 'Amol', gender: 'M' },
    ],
    'gu-IN': [
        { id: 'diya', name: 'Diya', gender: 'F' },
    ],
    'pa-IN': [
        { id: 'pavithra', name: 'Pavithra', gender: 'F' },
    ],
    'bn-IN': [
        { id: 'diya', name: 'Diya', gender: 'F' },
    ],
    'or-IN': [
        { id: 'nila', name: 'Nila', gender: 'F' },
    ],
    'en-IN': [
        { id: 'meera', name: 'Meera', gender: 'F' },
        { id: 'arvind', name: 'Arvind', gender: 'M' },
    ],
};

export interface TtsOptions {
    text: string;
    languageCode?: SarvamLanguageCode;
    speaker?: string;
    pace?: number;       // 0.5–2.0 (default 1.0)
    loudness?: number;   // 0.5–2.0 (default 1.0)
}

export interface TtsResult {
    audioBase64: string;  // WAV audio as base64
    languageCode: string;
}

/**
 * Convert text to speech using Sarvam bulbul:v3.
 * Returns base64 WAV audio that can be played in the browser.
 */
export async function textToSpeech(options: TtsOptions): Promise<TtsResult> {
    const {
        text,
        languageCode = 'hi-IN',
        speaker,
        pace = 1.0,
        loudness = 1.5,
    } = options;

    if (!text || text.trim().length === 0) {
        throw new Error('TTS_FAILED: No text provided for speech synthesis.');
    }

    // Sarvam TTS max ~500 chars per request — truncate intelligently
    const sentences = text.replace(/\n/g, ' ').split('. ');
    let truncatedText = '';
    for (const sentence of sentences) {
        if ((truncatedText + sentence).length > 490) break;
        truncatedText += sentence + '. ';
    }
    const inputText = truncatedText.trim() || text.slice(0, 490);

    // Get first available voice for the language if not specified
    const availableVoices = SARVAM_VOICES[languageCode] ?? SARVAM_VOICES['hi-IN'];
    const selectedSpeaker = speaker ?? availableVoices[0].id;

    const response = await fetch(SARVAM_TTS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': SARVAM_API_KEY,
        },
        body: JSON.stringify({
            inputs: [inputText],
            target_language_code: languageCode,
            speaker: selectedSpeaker,
            model: 'bulbul:v3',
            pace,
            loudness,
            enable_preprocessing: true,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`TTS_FAILED: Sarvam API error — ${error}`);
    }

    const data = await response.json();
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
        throw new Error('TTS_FAILED: Sarvam returned no audio data.');
    }

    return { audioBase64, languageCode };
}

/**
 * Client-side helper: play a base64 WAV audio string in the browser.
 * Call this from a React component after receiving TtsResult.
 */
export function playBase64Audio(base64: string): HTMLAudioElement {
    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    audio.play();
    return audio;
}
