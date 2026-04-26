import { readdirSync, copyFileSync, mkdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';

const srcRoot = 'src/app/(docs)';
const outRoot = 'public';

function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, results);
    } else if (entry === 'page.mdx') {
      results.push(full);
    }
  }
  return results;
}

for (const file of walk(srcRoot)) {
  const rel = relative(srcRoot, dirname(file));
  const dest = join(outRoot, `${rel}.md`);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(file, dest);
  console.log(`${file} → ${dest}`);
}
