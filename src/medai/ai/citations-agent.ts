import { z } from 'zod';
import { createAI } from '@/ai/genkit';
import { SWASTHYA_SYSTEM_PROMPT, APPROVED_CITATION_DOMAINS } from './guardrails';

const CitationsSchema = z.object({
    citations: z.array(z.object({
        title: z.string().min(5).describe('Full title of the medical study, guideline, or article.'),
        url: z.string().url().describe('Direct URL to the source. Must be from an approved medical domain.'),
        description: z.string().min(20).describe('1–2 sentence explanation of why this source is relevant to these specific findings.'),
    })).min(2).max(4).describe('2–4 credible, relevant citations. Must come from approved medical sources.'),
});

export async function runCitationsAgent(analysisData: any) {
    const ai = await createAI();

    const approvedDomainsList = APPROVED_CITATION_DOMAINS.join(', ');

    const response = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `${SWASTHYA_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════
 CITATIONS AGENT — TASK
═══════════════════════════════════════════════════════════
Based on the medical analysis below, provide 2–4 supporting scientific citations.

ANALYSIS DATA: ${JSON.stringify(analysisData)}

CITATION REQUIREMENTS:
1. Only cite sources from the following approved domains:
   ${approvedDomainsList}

2. Citations must be directly relevant to the specific parameters or conditions found in this report.
   - If the report shows low hemoglobin, cite an iron deficiency guideline from WHO or ICMR.
   - If cholesterol is elevated, cite a cardiovascular risk guideline from a recognized authority.

3. Each citation needs:
   - title: The exact, real title of the article or guideline.
   - url: A real, valid URL from one of the approved domains.
   - description: Why this specific citation is relevant to THIS patient's findings.

4. ANTI-HALLUCINATION RULE:
   - If you are not certain a specific URL is real, use the root domain URL (e.g., https://www.who.int/health-topics/anaemia)
     rather than fabricating a deep article path.
   - NEVER cite a non-existent paper. Real citations only.`,
        output: {
            schema: CitationsSchema,
        },
    });

    return response.output;
}
