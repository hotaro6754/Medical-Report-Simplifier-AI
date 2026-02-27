'use server';

import { AgentOrchestrator } from './orchestrator';
import { MedicalReport } from '../types/medical';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { createEmbedding } from './rag-agent';

const ACCEPTED_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png',
    'image/webp', 'image/tiff',
    'application/pdf', 'text/plain',
];

export async function processMedicalReport(formData: FormData): Promise<MedicalReport> {
    const file = formData.get('file') as File;
    const symptoms = (formData.get('symptoms') as string) || undefined;
    if (!file) throw new Error('No file provided. Please upload a lab report.');

    const mimeType = file.type || 'application/octet-stream';
    if (!ACCEPTED_TYPES.includes(mimeType)) {
        throw new Error(`Unsupported file type: "${mimeType}". Please upload JPG, PNG, PDF, or TXT.`);
    }

    if (file.size > 20 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 20MB.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const orchestrator = new AgentOrchestrator();
    const report = await orchestrator.processReport(buffer, mimeType, file.name, symptoms);

    // ── Save to Supabase (fire & forget — don't block the response) ────────
    // We execute this concurrently but don't await to block the UI
    (async () => {
        try {
            const cookieStore = await cookies();
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll: () => cookieStore.getAll(),
                        setAll: () => { },
                    },
                }
            );

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Generate vector embeddings for the summary text
                const embedding = await createEmbedding(report.summary);

                await supabase.from('medical_reports').upsert({
                    id: report.id,
                    user_id: user.id,
                    type: report.type,
                    severity: report.severity,
                    health_score: report.healthScore,
                    risk_assessment: report.riskAssessment,
                    summary: report.summary,
                    parameters: report.parameters,
                    dietary_advice: report.dietaryAdvice,
                    next_steps: report.nextSteps,
                    uploaded_at: report.uploadedAt,
                    embedding: embedding.length > 0 ? embedding : null
                });
                console.log(`[${report.id}] Report saved to Supabase for user ${user.id}`);
            }
        } catch (dbErr: any) {
            // Non-critical — log but don't fail the response
            console.error('[DB Save]', dbErr.message);
        }
    })();

    return report;
}
