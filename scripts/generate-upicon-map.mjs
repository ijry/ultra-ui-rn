import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const defaultSource = resolve(
  process.cwd(),
  '..',
  'uview-plus',
  'src',
  'uni_modules',
  'uview-plus',
  'components',
  'u-icon',
  'icons.js',
);
const sourcePath = process.env.UP_ICON_SOURCE ?? defaultSource;
const outputPath = resolve(process.cwd(), 'src', 'icons', 'upicon-map.ts');
const source = await readFile(sourcePath, 'utf8');
const entries = [
  ...source.matchAll(/'uicon-([^']+)':\s*'(\\u[0-9a-f]{4})'/gi),
].map(([, name, glyph]) => [name, JSON.parse(`"${glyph}"`)]);

if (entries.length < 100) {
  throw new Error(
    `Expected at least 100 upstream icon glyphs, received ${entries.length}.`,
  );
}

const map = Object.fromEntries(entries);
const output = `export const upiconGlyphs = Object.freeze(${JSON.stringify(
  map,
  null,
  2,
)} as const);\n\nexport type UPIconName = keyof typeof upiconGlyphs;\n`;

await writeFile(outputPath, output);
