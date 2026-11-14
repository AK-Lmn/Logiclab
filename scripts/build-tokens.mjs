import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const definitions = new Map();
function collect(node, prefix = '') {
  if (node && typeof node === 'object') {
    if ('$value' in node) definitions.set(prefix, node.$value);
    else for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith('$')) collect(value, prefix ? `${prefix}.${key}` : key);
    }
  }
}
for (const file of readdirSync(path.join(root, 'tokens')).filter(file => file.endsWith('.json')).sort()) {
  collect(JSON.parse(readFileSync(path.join(root, 'tokens', file), 'utf8')));
}
function resolve(value, visited = new Set()) {
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    const reference = value.slice(1, -1);
    if (visited.has(reference) || !definitions.has(reference)) throw new Error(`Invalid token alias: ${reference}`);
    return resolve(definitions.get(reference), new Set([...visited, reference]));
  }
  if (Array.isArray(value)) return `cubic-bezier(${value.join(', ')})`;
  if (value && typeof value === 'object' && 'unit' in value) return `${value.value}${value.unit}`;
  return String(value);
}
function name(key) {
  return '--' + key.replace(/^semantic\./, 'color.').replace(/^primitive\./, 'p.').replaceAll('.', '-');
}
const css = ':root {\n' +
  [...definitions].map(([key, value]) => `  ${name(key)}: ${resolve(value)};`).join('\n') + '\n}\n';
const output = path.join(root, 'src/app/tokens.css');
const mark = JSON.parse(readFileSync(path.join(root, 'brand/mark.json'), 'utf8'));
const color = key => resolve(definitions.get(key));
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.viewBox}" role="img" aria-labelledby="title"><title id="title">LogicLab</title><rect width="256" height="256" rx="32" fill="${color('semantic.action.primary')}"/><path d="${mark.small}" fill="${color('primitive.accent-ink')}"/></svg>\n`;
const iconOutput = path.join(root, 'src/app/icon.svg');
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== css) throw new Error('Token CSS is stale. Run npm run tokens.');
  if (readFileSync(iconOutput, 'utf8') !== icon) throw new Error('App icon is stale. Run npm run tokens.');
  console.log('Token CSS and app icon match their JSON sources.');
} else {
  writeFileSync(output, css);
  writeFileSync(iconOutput, icon);
  console.log(`Generated ${definitions.size} design tokens.`);
}
