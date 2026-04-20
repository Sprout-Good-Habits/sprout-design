#!/usr/bin/env node
/**
 * Export a Sprout product-explorer prototype as a standalone HTML file.
 * Strips the doc shell (sidebar, nav, breadcrumb) and inlines all CSS.
 *
 * Usage:
 *   node scripts/export-prototype.mjs <path-to-html> [--out <dir>]
 *
 * Examples:
 *   node scripts/export-prototype.mjs public/product-explorer/parent-chat-3.html --out ./export
 *   node scripts/export-prototype.mjs public/product-explorer/task/microphone.html --out ./export
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../public');

// --- Parse args ---
const args = process.argv.slice(2);
if (!args.length || args[0] === '--help') {
  console.log('Usage: node scripts/export-prototype.mjs <path-to-html> [--out <dir>]');
  console.log('Example: node scripts/export-prototype.mjs public/product-explorer/task/microphone.html --out ./export');
  process.exit(0);
}

const inputPath = resolve(args[0]);
const outIdx = args.indexOf('--out');
const outDir = outIdx !== -1 ? resolve(args[outIdx + 1]) : resolve('export');

if (!existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const slug = basename(inputPath, '.html');
mkdirSync(outDir, { recursive: true });

// --- Read the source HTML ---
let html = readFileSync(inputPath, 'utf-8');

// --- Resolve a href/src path to a local file path ---
function resolveAssetPath(href) {
  // Paths like /kid-design-system/components/avatar.css or /product-explorer/tokens.css
  if (href.startsWith('/')) return join(ROOT, href);
  // Relative paths
  return resolve(dirname(inputPath), href);
}

// --- Inline all local CSS <link> tags ---
const cssLinkRe = /<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g;
const inlinedCss = [];
const assetsToSkip = ['/product-explorer/styles.css']; // Shell styles - not needed standalone

html = html.replace(cssLinkRe, (match, href) => {
  // Skip external URLs
  if (href.startsWith('http://') || href.startsWith('https://')) return match;
  // Skip shell styles
  if (assetsToSkip.includes(href)) return '';

  const filePath = resolveAssetPath(href);
  if (existsSync(filePath)) {
    const css = readFileSync(filePath, 'utf-8');
    inlinedCss.push(`/* --- ${href} --- */\n${css}`);
    return ''; // Remove the link tag
  }
  console.warn(`Warning: CSS file not found: ${href} (${filePath})`);
  return match;
});

// --- Inline local JS <script src="..."> that are shell/nav ---
const shellScripts = ['/product-explorer/shell.js', '/product-explorer/nav.js', '/shell.js', '/nav.js'];
const scriptSrcRe = /<script\s+src="([^"]+)"[^>]*><\/script>/g;
const jsToInline = [];

html = html.replace(scriptSrcRe, (match, src) => {
  // Remove shell/nav scripts entirely
  if (shellScripts.some(s => src === s || src.endsWith(s))) return '';
  // Keep external CDN scripts as-is
  if (src.startsWith('http://') || src.startsWith('https://')) return match;
  // Inline local JS helpers (like planning-tree.js, chat-composer.js)
  const filePath = resolveAssetPath(src);
  if (existsSync(filePath)) {
    const js = readFileSync(filePath, 'utf-8');
    jsToInline.push({ src, content: js });
    return `<script>/* ${src} */\n${js}</script>`;
  }
  return match;
});

// --- Strip shell wrapper markup ---
// Remove: <div class="sidebar" id="sidebar"></div>
html = html.replace(/<div\s+class="sidebar"[^>]*><\/div>\s*/g, '');

// Remove the doc shell wrapper structure but keep the device content
// Pattern: <div class="main"><div class="content-area"><div class="page-content"><div class="breadcrumb"...>...</div><div class="two-col"><div class="col-left">
html = html.replace(/<div\s+class="breadcrumb"[^>]*><\/div>\s*/g, '');

// Unwrap: remove .main > .content-area > .page-content > .two-col > .col-left wrappers
// and .col-right > closing divs
// We do this by replacing the opening wrapper divs and their closing counterparts

// Simple approach: replace the known wrapper opening tags with nothing,
// and remove the corresponding closing </div> tags at the end
const shellOpenTags = [
  /<div\s+class="main">\s*/,
  /\s*<div\s+class="content-area">\s*/,
  /\s*<div\s+class="page-content">\s*/,
  /\s*<div\s+class="two-col">\s*/,
  /\s*<div\s+class="col-left">\s*/,
];

for (const re of shellOpenTags) {
  html = html.replace(re, '');
}

// Remove col-right and its contents (metadata panel for the doc site)
html = html.replace(/\s*<div\s+class="col-right">[\s\S]*?<\/div>\s*<!--\s*\/col-right\s*-->/g, '');

// Remove trailing shell closing divs (before </body>)
// These close: col-left, two-col, page-content, content-area, main
html = html.replace(/\s*<\/div>\s*<!--\s*\/col-left\s*-->/g, '');
html = html.replace(/\s*<\/div>\s*<!--\s*\/two-col\s*-->/g, '');

// Remove DS_META script (doc-site metadata)
html = html.replace(/<script>window\.DS_META\s*=\s*\{[\s\S]*?\};\s*<\/script>\s*/g, '');

// Remove Figma capture script
html = html.replace(/<script\s+src="https:\/\/mcp\.figma\.com[^"]*"[^>]*><\/script>\s*/g, '');

// --- Inject inlined CSS into <head> ---
if (inlinedCss.length) {
  const styleBlock = `<style>\n${inlinedCss.join('\n\n')}\n</style>`;
  // Insert before </head>
  html = html.replace('</head>', `${styleBlock}\n</head>`);
}

// --- Add minimal standalone layout styles ---
const standaloneStyles = `<style>
/* Standalone layout (replaces doc shell) */
body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f9fafb; font-family: 'Inter', -apple-system, sans-serif; }
</style>`;
html = html.replace('</head>', `${standaloneStyles}\n</head>`);

// --- Rewrite asset paths to be relative ---
// Rive files: /kid-design-system/sprot2.97_.riv -> sprot2.97_.riv (copy to output)
const riveRe = /['"]\/kid-design-system\/([\w.-]+\.riv)['"]/g;
const rivesToCopy = new Set();
html = html.replace(riveRe, (match, filename) => {
  rivesToCopy.add(filename);
  return `'${filename}'`;
});

// Audio files: /product-explorer/assets/foo.wav -> foo.wav (copy to output)
const audioRe = /['"]\/product-explorer\/assets\/([\w.-]+\.(wav|mp3|ogg))['"]/g;
const audioToCopy = new Set();
html = html.replace(audioRe, (match, filename) => {
  audioToCopy.add(filename);
  return `'${filename}'`;
});

// --- Write output ---
writeFileSync(join(outDir, `${slug}.html`), html);
console.log(`HTML:  ${join(outDir, `${slug}.html`)}`);

// Copy Rive assets
for (const riveFile of rivesToCopy) {
  const src = join(ROOT, 'kid-design-system', riveFile);
  if (existsSync(src)) {
    copyFileSync(src, join(outDir, riveFile));
    console.log(`Rive:  ${join(outDir, riveFile)}`);
  }
}

// Copy audio assets
for (const audioFile of audioToCopy) {
  const src = join(ROOT, 'product-explorer/assets', audioFile);
  if (existsSync(src)) {
    copyFileSync(src, join(outDir, audioFile));
    console.log(`Audio: ${join(outDir, audioFile)}`);
  }
}

// --- Clean up orphan closing divs ---
// After stripping wrappers, there may be extra </div> at the end before </body>
// Count opening vs closing divs and trim excess
const outputPath = join(outDir, `${slug}.html`);
let finalHtml = readFileSync(outputPath, 'utf-8');

// Remove sequences of empty </div> right before </body> that were shell wrappers
// Count divs in the body to find excess
const bodyMatch = finalHtml.match(/<body>([\s\S]*)<\/body>/);
if (bodyMatch) {
  let body = bodyMatch[1];
  const opens = (body.match(/<div[\s>]/g) || []).length;
  const closes = (body.match(/<\/div>/g) || []).length;
  const excess = closes - opens;
  if (excess > 0) {
    // Remove 'excess' number of </div> from the end of body
    for (let i = 0; i < excess; i++) {
      body = body.replace(/\s*<\/div>\s*(?=(<script|<\/body|$))/, '');
    }
    finalHtml = finalHtml.replace(/<body>[\s\S]*<\/body>/, `<body>${body}</body>`);
  }
}

writeFileSync(outputPath, finalHtml);
console.log(`\nDone! Standalone prototype ready in ${outDir}`);
