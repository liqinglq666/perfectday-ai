const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const sourceRoots = ['app', 'data', 'lib', 'types'];

function sourceFiles(dir) {
  const full = path.join(root, dir);
  return fs.readdirSync(full, { withFileTypes: true }).flatMap(entry => {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(relative);
    return /\.(?:ts|tsx|js|cjs)$/.test(entry.name) ? [relative] : [];
  });
}

test('static image and icon references point to existing public files', () => {
  const missing = [];
  for (const file of sourceFiles('app')) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of text.matchAll(/["'`](\/(?:images|icons)\/[^"'`$]+)["'`]/g)) {
      const publicFile = path.join(root, 'public', match[1].slice(1));
      if (!fs.existsSync(publicFile)) missing.push(`${file}: ${match[1]}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('removed legacy visual assets are not referenced by source code', () => {
  const offenders = [];
  for (const dir of sourceRoots) {
    for (const file of sourceFiles(dir)) {
      const text = fs.readFileSync(path.join(root, file), 'utf8');
      if (text.includes('/visuals/') || text.includes('/images/coffee-reading.webp') || text.includes('/images/play-together.webp')) {
        offenders.push(file);
      }
    }
  }
  assert.deepEqual(offenders, []);
});
