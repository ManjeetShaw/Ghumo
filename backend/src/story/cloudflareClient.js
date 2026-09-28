const config = require('../config');

/**
 * Cloudflare Workers AI - FLUX.1 [schnell] image generation.
 * Free tier: 10,000 Neurons/day per account, no credit card required.
 * Ported as-is from Junaid's story service.
 */
function endpointUrl() {
  return `https://api.cloudflare.com/client/v4/accounts/${config.cloudflareAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
}

async function callCloudflare(body, { retries = 3 } = {}) {
  if (!config.cloudflareAccountId || !config.cloudflareApiToken) {
    throw new Error(
      'CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN are not set. See README for setup steps and add them to .env'
    );
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(endpointUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.cloudflareApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

const data = await res.json();

console.log("Cloudflare status:", res.status);
console.log("Cloudflare response:", JSON.stringify(data, null, 2));

if (res.ok && data.success && data.result?.image) {
  console.log("Image received from Cloudflare");
  return data.result.image;
}

if (res.status === 429) {
  throw new Error(`Cloudflare AI quota exhausted (429): ${JSON.stringify(data.errors || data)}`);
}

const isRetryable = res.status >= 500;
if (isRetryable && attempt < retries) {
  const waitMs = 1500 * Math.pow(2, attempt);
  console.warn(`  Cloudflare AI error, retrying in ${waitMs}ms (attempt ${attempt + 1}/${retries})...`);
  await new Promise((r) => setTimeout(r, waitMs));
  continue;
}

throw new Error(`Cloudflare Workers AI error (${res.status}): ${JSON.stringify(data.errors || data)}`);
  }
}

/**
 * Generates one image. `steps` defaults to 6 - schnell is a distilled
 * few-step model, going much past ~8 burns Neurons without improving quality.
 */
async function generateImageCloudflare({ prompt, steps = 6 }) {
  const base64 = await callCloudflare({
    prompt: prompt.slice(0, 2048), // model has a hard prompt length cap
    steps,
  });

  return { base64, mimeType: 'image/jpeg' };
}

module.exports = { generateImageCloudflare };
