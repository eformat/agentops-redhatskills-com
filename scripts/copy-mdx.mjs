import { readdirSync, copyFileSync, mkdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname, relative } from 'path';

const srcRoot = 'src/app/(docs)';
const outRoot = 'public';
const siteUrl = 'https://agentops.redhatskills.com';

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

const mdFiles = [];

for (const file of walk(srcRoot)) {
  const rel = relative(srcRoot, dirname(file));
  const dest = join(outRoot, `${rel}.md`);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(file, dest);
  mdFiles.push(`/${rel}.md`);
  console.log(`${file} → ${dest}`);
}

const agentsMd = `# AGENTS.md

This site provides documentation for connecting agent frameworks to Red Hat OpenShift AI.

## For AI Agents

Use the markdown versions of pages for structured content consumption.
Each documentation page has a corresponding \`.md\` file.

## Available Pages

${mdFiles.map((f) => `- [${siteUrl}${f}](${siteUrl}${f})`).join('\n')}
`;

writeFileSync('AGENTS.md', agentsMd);
copyFileSync('AGENTS.md', join(outRoot, 'AGENTS.md'));
console.log('AGENTS.md generated');
