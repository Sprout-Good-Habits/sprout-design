#!/usr/bin/env node
/**
 * Pre-build export bundles for all components in the manifest.
 * Writes to /public/kid-design-system/export/ so Vercel can serve them.
 *
 * Usage:
 *   node scripts/export-all.mjs
 */

import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../public/kid-design-system');
const EXPORT_DIR = join(ROOT, 'export');
const SCRIPT = resolve(__dirname, 'export-component.mjs');

// Clean previous output
try { rmSync(EXPORT_DIR, { recursive: true }); } catch {}

// Load manifest
const manifest = JSON.parse(readFileSync(join(ROOT, 'component-manifest.json'), 'utf-8'));
const slugs = Object.keys(manifest);

console.log(`Building ${slugs.length} component bundles...\n`);

let ok = 0;
let fail = 0;

for (const slug of slugs) {
  const out = join(EXPORT_DIR, slug);
  try {
    execFileSync(process.execPath, [SCRIPT, slug, '--out', out], { stdio: 'pipe' });
    ok++;
    console.log(`  OK  ${slug}`);
  } catch (err) {
    fail++;
    console.error(`  FAIL ${slug}: ${err.message}`);
  }
}

console.log(`\nDone: ${ok} succeeded, ${fail} failed.`);
console.log(`Output: ${EXPORT_DIR}`);
