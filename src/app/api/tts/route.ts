import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech, type SarvamLanguageCode } from '@/medai/ai/sarvam-tts';

export async function POST(req: NextRequest) {
    try {
        const { text, languageCode, speaker, pace, loudness } = await req.json();

        if (!text?.trim()) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const result = await textToSpeech({
            text,
            languageCode: (languageCode as SarvamLanguageCode) ?? 'hi-IN',
            speaker,
            pace: pace ?? 1.0,
            loudness: loudness ?? 1.5,
        });

        return NextResponse.json({ audioBase64: result.audioBase64, languageCode: result.languageCode });
    } catch (err: any) {
        console.error('[TTS API]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
