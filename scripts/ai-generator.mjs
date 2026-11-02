import fs from 'fs';
import path from 'path';

/**
 * Alibaba Cloud Qwen AI Code & File Generator
 * Configured for qwen3.8-max using QwenCloud Token Plan
 */
export async function generateCodeWithAlibaba({
  prompt,
  targetFilePath,
  apiKey = process.env.ALIBABA_API_KEY,
  model = process.env.ALIBABA_AI_MODEL || 'qwen3.8-max',
  baseUrl = process.env.ALIBABA_BASE_URL || 'https://token-plan.maas.qwencloudapi.com/compatible-mode/v1'
}) {
  if (!apiKey) {
    throw new Error('ALIBABA_API_KEY is not defined in environment variables or GitHub Secrets.');
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const systemPrompt = `You are the lead clinical software engineer for ALO DOCTOR (v2.4 Saudi Edition).
Generate production-ready, clean TypeScript / React code adhering to:
- Native Cairo font Arabic RTL and English LTR
- 11 persona profile switcher compatibility
- Zero artificial gates, clean accessible state
- Pinterest-teal color palette (#007B6E, #00C6AE, #E6FAF7, #25D366)
Return ONLY raw code without markdown backticks unless specifically asked.`;

  console.log(`[Qwen AI ap-southeast-1] Invoking model: ${model} for target: ${targetFilePath}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Alibaba API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const generatedCode = data.choices[0]?.message?.content || '';

  const cleanCode = generatedCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '');

  if (targetFilePath) {
    const dir = path.dirname(targetFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetFilePath, cleanCode, 'utf8');
    console.log(`[Qwen AI] Successfully created/updated file: ${targetFilePath}`);
  }

  return cleanCode;
}

if (process.argv[1]?.endsWith('ai-generator.mjs')) {
  const [,, targetPath, ...promptParts] = process.argv;
  const prompt = promptParts.join(' ');
  if (!targetPath || !prompt) {
    console.log('Usage: node scripts/ai-generator.mjs <targetFilePath> <prompt>');
    process.exit(1);
  }
  generateCodeWithAlibaba({ targetFilePath: targetPath, prompt })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
