import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, relative } from 'path';

const srcRoot = 'src/app/(docs)';
const entries = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry === 'page.mdx' || entry === 'page.tsx') {
      const rel = relative(srcRoot, dirname(full));
      const href = rel ? `/${rel}` : '/';
      const content = readFileSync(full, 'utf-8');
      extractEntries(content, href);
    }
  }
}

function extractEntries(content, href) {
  const lines = content.split('\n');
  let pageTitle = '';

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      pageTitle = h1[1].trim();
      entries.push({ title: pageTitle, href, section: '' });
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      const text = h2[1].trim();
      const id = slugify(text);
      entries.push({ title: text, href: `${href}#${id}`, section: pageTitle });
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const text = h3[1].trim();
      const id = slugify(text);
      entries.push({ title: text, href: `${href}#${id}`, section: pageTitle });
      continue;
    }

    const jsxH1 = line.match(/className="MdH1"[^>]*>([^<]+)/);
    if (jsxH1) {
      pageTitle = jsxH1[1].trim();
      entries.push({ title: pageTitle, href, section: '' });
    }

    const jsxH2 = line.match(/id="([^"]+)"[^>]*>([^<]+)/);
    if (jsxH2 && line.includes('MdH2')) {
      entries.push({ title: jsxH2[2].trim(), href: `${href}#${jsxH2[1]}`, section: pageTitle });
    }
  }
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

walk(srcRoot);

mkdirSync('public', { recursive: true });
writeFileSync('public/search-index.json', JSON.stringify(entries, null, 2));
console.log(`Search index: ${entries.length} entries`);
