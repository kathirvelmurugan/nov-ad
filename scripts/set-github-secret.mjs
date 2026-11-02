import sodium from 'libsodium-wrappers';

/**
 * Automatically sets a repository secret on GitHub Actions via REST API
 * Uses GITHUB_TOKEN or GH_TOKEN from environment variables
 */
export async function setGitHubSecret(secretName, secretValue) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required to set secrets.');
  }

  const owner = process.env.GITHUB_OWNER || 'kathirvelmurugan';
  const repo = process.env.GITHUB_REPO || 'nov-ad';

  await sodium.ready;

  // 1. Fetch Repository Public Key
  const keyResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'nov-ad-secrets'
    }
  });

  if (!keyResp.ok) {
    throw new Error(`Failed to get public key: ${keyResp.status} ${await keyResp.text()}`);
  }

  const { key_id, key } = await keyResp.json();

  // 2. Encrypt Secret with Libsodium Box Seal
  const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
  const binsec = sodium.from_string(secretValue);
  const encBytes = sodium.crypto_box_seal(binsec, binkey);
  const encrypted_value = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

  // 3. PUT Secret into GitHub Actions Repository Secrets
  const putResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/${secretName}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'nov-ad-secrets'
    },
    body: JSON.stringify({
      encrypted_value,
      key_id
    })
  });

  if (!putResp.ok && putResp.status !== 201 && putResp.status !== 204) {
    throw new Error(`Failed to set secret ${secretName}: ${putResp.status} ${await putResp.text()}`);
  }

  console.log(`[GitHub Secrets] Successfully configured secret: ${secretName} on ${owner}/${repo}`);
  return true;
}

if (process.argv[1]?.endsWith('set-github-secret.mjs')) {
  const [,, name, val] = process.argv;
  if (!name || !val) {
    console.log('Usage: GITHUB_TOKEN=<token> node scripts/set-github-secret.mjs <SECRET_NAME> <SECRET_VALUE>');
    process.exit(1);
  }
  setGitHubSecret(name, val)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
