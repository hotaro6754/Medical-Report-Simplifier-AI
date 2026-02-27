import { NextRequest, NextResponse } from 'next/server';
import { speechToText } from '@/medai/ai/sarvam-stt';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File | null;
        const languageCode = (formData.get('languageCode') as string) ?? 'hi-IN';

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        const audioBuffer = await audioFile.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

        const result = await speechToText(audioBlob, languageCode);
        return NextResponse.json({ transcript: result.transcript, languageCode: result.languageCode });
    } catch (err: any) {
        console.error('[STT API]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
