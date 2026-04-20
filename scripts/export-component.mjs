#!/usr/bin/env node
/**
 * Export a Sprout Design component as a self-contained bundle.
 *
 * Usage:
 *   node scripts/export-component.mjs <slug> [--out <dir>]
 *
 * Example:
 *   node scripts/export-component.mjs chat-messages --out ./export
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../public/kid-design-system');

// --- Parse args ---
const args = process.argv.slice(2);
if (!args.length || args[0] === '--help') {
  console.log('Usage: node scripts/export-component.mjs <slug> [--out <dir>]');
  process.exit(0);
}

const slug = args[0];
const outIdx = args.indexOf('--out');
const outDir = outIdx !== -1 ? resolve(args[outIdx + 1]) : resolve('export');

// --- Load manifest ---
const manifestPath = join(ROOT, 'component-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

if (!manifest[slug]) {
  console.error(`Unknown component "${slug}". Available: ${Object.keys(manifest).join(', ')}`);
  process.exit(1);
}

// --- Resolve transitive CSS deps ---
function resolveDeps(slug, visited = new Set()) {
  if (visited.has(slug)) return [];
  visited.add(slug);
  const entry = manifest[slug];
  if (!entry) return [];

  const deps = [];
  for (const depFile of entry.cssDeps || []) {
    const depSlug = depFile.replace('.css', '');
    deps.push(...resolveDeps(depSlug, visited));
  }
  for (const cssFile of entry.css) {
    deps.push(cssFile);
  }
  return deps;
}

const cssFiles = resolveDeps(slug);
const entry = manifest[slug];

// Collect Rive/JS assets (including from transitive deps)
function collectAssets(slug, visited = new Set()) {
  if (visited.has(slug)) return { js: new Set(), rive: new Set() };
  visited.add(slug);
  const e = manifest[slug];
  if (!e) return { js: new Set(), rive: new Set() };

  const assets = { js: new Set(e.js || []), rive: new Set(e.rive || []) };
  for (const depFile of e.cssDeps || []) {
    const depSlug = depFile.replace('.css', '');
    const sub = collectAssets(depSlug, visited);
    sub.js.forEach(j => assets.js.add(j));
    sub.rive.forEach(r => assets.rive.add(r));
  }
  return assets;
}

const assets = collectAssets(slug);

// --- Build bundle ---
mkdirSync(outDir, { recursive: true });

// Always start with tokens
let bundle = readFileSync(join(ROOT, 'tokens.css'), 'utf-8') + '\n';

// Append each CSS dep (deduplicated, in order)
const seen = new Set();
for (const file of cssFiles) {
  if (seen.has(file)) continue;
  seen.add(file);
  const filePath = join(ROOT, 'components', file);
  if (!existsSync(filePath)) {
    console.warn(`Warning: ${file} not found, skipping`);
    continue;
  }
  bundle += `\n/* --- ${file} --- */\n`;
  bundle += readFileSync(filePath, 'utf-8') + '\n';
}

const bundlePath = join(outDir, `${slug}.bundle.css`);
writeFileSync(bundlePath, bundle);
console.log(`CSS bundle: ${bundlePath}`);

// --- Copy assets ---
for (const riveFile of assets.rive) {
  const src = join(ROOT, riveFile);
  if (existsSync(src)) {
    copyFileSync(src, join(outDir, riveFile));
    console.log(`Rive asset: ${join(outDir, riveFile)}`);
  }
}

for (const jsFile of assets.js) {
  const src = join(ROOT, jsFile);
  if (existsSync(src)) {
    copyFileSync(src, join(outDir, jsFile));
    console.log(`JS helper:  ${join(outDir, jsFile)}`);
  }
}

// --- Generate README ---
const readme = `# ${slug} - Sprout Design Component Bundle

## Quick start

\`\`\`html
<link rel="stylesheet" href="${slug}.bundle.css">
\`\`\`

## What's included

**CSS bundle** (\`${slug}.bundle.css\`):
- Design tokens (CSS custom properties)
${cssFiles.map(f => `- ${f}`).join('\n')}

${assets.rive.size ? `**Rive assets:**\n${[...assets.rive].map(r => `- ${r}`).join('\n')}\n` : ''}
${assets.js.size ? `**JS helpers:**\n${[...assets.js].map(j => `- ${j}`).join('\n')}\n` : ''}
## Tokens

All CSS custom properties have inline fallback values, so the bundle renders
correctly as-is. To customize, override the variables in your own stylesheet:

\`\`\`css
:root {
  --color-brand-500: #your-brand-color;
  --spacing-md: 12px;
}
\`\`\`

## Rive characters

${assets.rive.size ? `This component uses Rive for character animation. Include the Rive WASM runtime:

\`\`\`html
<script src="https://unpkg.com/@rive-app/canvas@2.27.0"></script>
\`\`\`
` : 'This component does not use Rive assets.'}
`;

writeFileSync(join(outDir, 'README.md'), readme);
console.log(`README:     ${join(outDir, 'README.md')}`);
console.log(`\nDone! ${slug} bundle is ready in ${outDir}`);
