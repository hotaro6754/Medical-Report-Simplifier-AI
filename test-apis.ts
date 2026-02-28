import { readFileSync } from 'fs';
import { parse } from 'dotenv';

// Load env vars
const envConfig = parse(readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function testSupabase() {
    console.log("Testing Supabase...");
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data, error } = await supabase.from('medical_reports').select('id').limit(1);
    if (error) console.error("Supabase Error:", error.message);
    else console.log("Supabase Success! Connected.");
}

async function testGemini() {
    console.log("Testing Gemini...");
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Say hi',
        });
        console.log("Gemini Success! Response:", response.text);
    } catch (e: any) {
        console.error("Gemini Error:", e.message);
    }
}

async function testHF() {
    console.log("Testing HuggingFace...");
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/d4data/biomedical-ner-all", {
            headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
            method: "POST",
            body: JSON.stringify({ inputs: "Patient has high blood pressure." }),
        });
        if (response.ok) {
            console.log("HuggingFace Success! Connected.");
        } else {
            console.error("HuggingFace Error:", response.status, await response.text());
        }
    } catch (e: any) {
        console.error("HuggingFace Fetch Error:", e.message);
    }
}

async function runTests() {
    await testSupabase();
    await testGemini();
    await testHF();
}

runTests();
