'use server';

export async function generateSarvamVoice(text: string, language: string = 'hi-IN') {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
        console.warn('SARVAM_API_KEY not found. Using mock voice generation.');
        return { success: false, error: 'API key missing' };
    }

    try {
        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': apiKey,
            },
            body: JSON.stringify({
                inputs: [text],
                target_language_code: language,
                speaker: 'meera',
                pitch: 0,
                pace: 1,
                loudness: 1.5,
                model: 'bulbul:v3',
            }),
        });

        if (!response.ok) {
            throw new Error(`Sarvam AI Error: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, audio_content: data.audios[0] };
    } catch (error: any) {
        console.error('Sarvam AI Action Error:', error);
        return { success: false, error: error.message };
    }
}
