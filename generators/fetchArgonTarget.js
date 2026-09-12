import { writeFileSync } from 'node:fs';

// Reuse the website's published mainnet snapshot without its RPC dependencies.
const source = 'https://argon.network/data/argonBasics.mainnet.json';

try {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const { usdTargetForArgon, lastUpdatedAt } = await response.json();
  if (!Number.isFinite(usdTargetForArgon) || usdTargetForArgon <= 0 ||
      typeof lastUpdatedAt !== 'string' || !Number.isFinite(Date.parse(lastUpdatedAt))) {
    throw new Error('Invalid Argon target snapshot');
  }
  writeFileSync(new URL('../src/data/argonTarget.json', import.meta.url),
    JSON.stringify({ usdTargetForArgon, lastUpdatedAt }, null, 2) + '\n');
  console.log(`Argon target: $${usdTargetForArgon} (mainnet snapshot ${lastUpdatedAt})`);
} catch (error) {
  console.error('Unable to update Argon target:', error.message);
  process.exitCode = 1;
}
