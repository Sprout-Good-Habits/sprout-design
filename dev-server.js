const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC = path.join(__dirname, 'public');

// Rewrites from vercel.json
const rewrites = [
  ['/tokens.css', '/design-system/tokens.css'],
  ['/styles.css', '/design-system/styles.css'],
  ['/shell.js', '/design-system/shell.js'],
  ['/spec-renderer.js', '/design-system/spec-renderer.js'],
  ['/nav.js', '/design-system/nav.js'],
  ['/component-specs.json', '/design-system/component-specs.json'],
  ['/tokens.json', '/design-system/tokens.json'],
  ['/sprout-character.riv', '/design-system/sprout-character.riv'],
  ['/character2.4.riv', '/design-system/character2.4.riv'],
];

const prefixRewrites = [
  '/brand/', '/foundations/', '/components/', '/patterns/', '/resources/'
];

const pageRewrites = [
  '/foundations.html', '/components.html', '/patterns.html', '/resources.html',
  '/getting-started.html', '/principles.html', '/accessibility.html', '/figma-workflow.html'
];

const mimeTypes = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.otf': 'font/otf',
  '.ttf': 'font/ttf', '.riv': 'application/octet-stream',
};

function resolve(urlPath) {
  // Exact rewrites
  for (const [from, to] of rewrites) {
    if (urlPath === from) return path.join(PUBLIC, to);
  }
  // Prefix rewrites → design-system
  for (const prefix of prefixRewrites) {
    if (urlPath.startsWith(prefix)) {
      let filePath = path.join(PUBLIC, 'design-system', urlPath);
      if (!fs.existsSync(filePath) && !path.extname(filePath)) {
        filePath += '.html';
      }
      return filePath;
    }
  }
  // Page rewrites
  for (const page of pageRewrites) {
    if (urlPath === page) return path.join(PUBLIC, 'design-system', page);
  }
  // Default: serve from public
  let filePath = path.join(PUBLIC, urlPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  // Clean URLs: try .html extension
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    filePath += '.html';
  }
  return filePath;
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = resolve(urlPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not found: ' + urlPath);
    return;
  }

  const ext = path.extname(filePath);
  const mime = mimeTypes[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, {'Content-Type': mime});
  res.end(content);
}).listen(PORT, () => {
  console.log(`Sprout Design running at http://localhost:${PORT}/`);
});
