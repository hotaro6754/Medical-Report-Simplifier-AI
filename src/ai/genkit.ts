// Create the GenKit AI client dynamically to avoid importing
// Node-only dependencies at module-evaluation time. This prevents
// bundling server-only packages into client/action browser bundles.
export async function createAI() {
  const { genkit } = await import('genkit');
  const { googleAI } = await import('@genkit-ai/google-genai');

  return genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  });
}
