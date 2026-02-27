import { googleAI, textEmbedding004 } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});

export interface RagContext {
    id: string;
    summary: string;
    uploaded_at: string;
    similarity: number;
}

/**
 * Returns a vector embedding for a given text string using Gemini embeddings.
 */
export async function createEmbedding(text: string): Promise<number[]> {
    try {
        const response = await ai.embed({
            embedder: textEmbedding004,
            content: text,
        });
        return response[0].embedding;
    } catch (error) {

        console.error('[RAG] Error creating embedding:', error);
        return [];
    }
}

/**
 * Queries Supabase for the top 3 similar past reports for the given user and text.
 */
export async function fetchSimilarReports(userId: string, currentReportSummary: string): Promise<RagContext[]> {
    try {
        const queryEmbedding = await createEmbedding(currentReportSummary);
        if (queryEmbedding.length === 0) return [];

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

        // Call the match_reports RPC function created in Supabase
        const { data, error } = await supabase.rpc('match_reports', {
            query_embedding: queryEmbedding,
            match_user_id: userId,
            match_count: 3,
        });

        if (error) {
            console.error('[RAG] Supabase RPC Error:', error);
            return [];
        }

        return data as RagContext[];
    } catch (error) {
        console.error('[RAG] Search Error:', error);
        return [];
    }
}
