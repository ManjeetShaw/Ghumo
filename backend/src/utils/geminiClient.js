const config = require('../config');

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGeminiWithFallback(body, { retries = 4 } = {}) {
  if (!config.geminiApiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and add it to .env'
    );
  }

  const candidateModels = [...new Set([config.textModel || 'gemini-2.5-flash', 'gemini-2.5-flash'])];

  let lastError;

  for (const model of candidateModels) {
    const url = `${BASE_URL}/${model}:generateContent?key=${config.geminiApiKey}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[Gemini] Requesting model: ${model} (attempt ${attempt + 1}/${retries + 1})`);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errText = await res.text();
          if (res.status === 429 && (errText.includes('RESOURCE_EXHAUSTED') || errText.includes('Quota exceeded') || errText.includes('quota'))) {
            throw new Error(`Gemini API Quota Exceeded (429 ${model}): ${errText}`);
          }
          if ((res.status === 429 || res.status === 503 || res.status === 500) && attempt < retries) {
            const waitMs = 1500 * Math.pow(2, attempt);
            console.warn(`  Gemini ${res.status} on ${model}, retrying in ${waitMs}ms...`);
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
          throw new Error(`Gemini API error (${res.status} ${model}): ${errText}`);
        }

        const data = await res.json();
        const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOut) {
          console.log(`[Gemini] Success using model: ${model}`);
          return textOut;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini] Model ${model} failed: ${err.message}`);
        if (err.message.includes('404') || err.message.includes('400') || err.message.includes('Quota Exceeded') || err.message.includes('RESOURCE_EXHAUSTED')) {
          break;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini API model fallbacks failed due to high demand. Please try again in a few moments.');
}

async function generateText({ prompt, responseSchema, temperature = 0.9 }) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      ...(responseSchema && {
        responseMimeType: 'application/json',
        responseSchema,
      }),
    },
  };

  return await callGeminiWithFallback(body);
}

module.exports = { generateText };