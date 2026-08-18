/**
 * Source-contract regression lock.
 *
 * Compares the local React Native surface (props / events / refs / defaults)
 * against the uview-plus@3.8.86 contract snapshot in
 * `tests/fixtures/source-contract.json`.
 *
 * Regenerate the fixture after upgrading the source:
 *   node scripts/audit-source-compat.mjs --source <uview-plus pkg> --dump tests/fixtures/source-contract.json
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import fixture from './fixtures/source-contract.json';

const LOCAL = join(process.cwd(), 'src/components');
const CONTRACT = (fixture as { contract: Record<string, SourceEntry> }).contract;

type SourceEntry = {
  props?: string[];
  events?: string[];
  refs?: string[];
  defaults?: Record<string, unknown>;
};

function cap(name: string): string {
  return name.split('-').map((s) => (s[0] ? s[0].toUpperCase() + s.slice(1) : s)).join('');
}

function braceBody(text: string, start: number): { body: string } | null {
  const open = text.indexOf('{', start);
  if (open < 0) return null;
  let depth = 0;
  let i = open;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return { body: text.slice(open + 1, i) };
}

function localFiles(dirName: string): string[] {
  const dir = join(LOCAL, dirName);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f: string) => f === 'types.ts' || f === 'index.ts' || /^UP.*\.tsx?$/.test(f))
    .map((f: string) => join(dir, f));
}

function keysFromBody(body: string): Set<string> {
  const clean = body.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const keys = new Set<string>();
  for (const seg of clean.split(';')) {
    const m = seg.trim().match(/^([A-Za-z][A-Za-z0-9]*)\??:/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

function localPropsKeys(name: string, dirName: string): Set<string> | null {
  for (const file of localFiles(dirName)) {
    const text = readFileSync(file, 'utf8');
    const re = new RegExp(`export type UP${cap(name)}Props[^{]*\\{`);
    const start = text.search(re);
    if (start < 0) continue;
    const found = braceBody(text, start);
    if (!found) continue;
    const keys = keysFromBody(found.body);
    const baseRe = /([A-Za-z][A-Za-z0-9]*)\s*&/g;
    const prefix = text.slice(start, text.indexOf('{', start));
    let m: RegExpExecArray | null;
    while ((m = baseRe.exec(prefix))) {
      const baseRe2 = new RegExp(`export type ${m[1]}[^{]*\\{`);
      const baseStart = text.search(baseRe2);
      if (baseStart >= 0) {
        const base = braceBody(text, baseStart);
        if (base) for (const k of keysFromBody(base.body)) keys.add(k);
      }
    }
    return keys;
  }
  return null;
}

function localRefMethods(dirName: string): Set<string> | null {
  for (const file of localFiles(dirName)) {
    const text = readFileSync(file, 'utf8');
    const re = /useImperativeHandle\s*\(\s*ref\s*,\s*\(?\s*\)?\s*=>\s*\(\s*\{/;
    const start = text.search(re);
    if (start < 0) continue;
    const found = braceBody(text, start);
    if (!found) continue;
    const methods = new Set<string>();
    for (const seg of found.body.split(',')) {
      const t = seg.trim();
      const m = t.match(/^(\w+)\s*:/);
      if (m) methods.add(m[1]);
      else {
        const sm = t.match(/^(\w+)\s*\(/);
        if (sm) methods.add(sm[1]);
        else {
          const o = t.match(/^(\w+)$/);
          if (o) methods.add(o[1]);
        }
      }
    }
    return methods;
  }
  return null;
}

// sub-components hosted inside a parent directory
const SUBCOMPONENT: Record<string, string> = {
  'cell-group': 'cell',
  'checkbox-group': 'checkbox',
  'collapse-item': 'collapse',
  'dropdown-item': 'dropdown',
  'form-item': 'form',
  'grid-item': 'grid',
  'index-anchor': 'index-list',
  'index-item': 'index-list',
  'list-item': 'list',
  'picker-column': 'picker',
  'picker-data': 'picker',
  'radio-group': 'radio',
  'steps-item': 'steps',
  'swipe-action-item': 'swipe-action',
  'swiper-indicator': 'swiper',
  'tabbar-item': 'tabbar',
  'tabs-item': 'tabs',
  'tabs-pro': 'tabs',
  td: 'table',
  th: 'table',
  tr: 'table',
};

// events the source component delegates to its parent
const DELEGATED: Record<string, string[]> = { 'tabbar-item': ['change'] };

function resolveDir(name: string): string | null {
  if (existsSync(join(LOCAL, name))) return name;
  return SUBCOMPONENT[name] ?? null;
}

test('local surface matches the uview-plus@3.8.86 source contract', () => {
  expect(Object.keys(CONTRACT).length).toBeGreaterThan(100);
  for (const [name, entry] of Object.entries(CONTRACT)) {
    const dirName = resolveDir(name);
    if (!dirName) {
      console.warn(`source-contract: no local dir for ${name}`);
      continue;
    }

    if (entry.props) {
      const local = localPropsKeys(name, dirName);
      if (!local) {
        throw new Error(`[${name}] no local UP${cap(name)}Props type found`);
      }
      for (const prop of entry.props) {
        expect(local.has(prop)).toBe(true);
      }
    }

    if (entry.events) {
      const local = localPropsKeys(name, dirName);
      if (!local) continue;
      for (const event of entry.events) {
        if (DELEGATED[name]?.includes(event)) continue;
        const cb = event.startsWith('update:')
          ? `onUpdate${event.slice(7)[0].toUpperCase()}${event.slice(8)}`
          : `on${event.split('-').map((s) => (s[0] ? s[0].toUpperCase() + s.slice(1) : s)).join('')}`;
        expect(local.has(cb)).toBe(true);
      }
    }

    if (entry.refs) {
      const local = localRefMethods(dirName);
      if (!local) continue;
      for (const method of entry.refs) {
        expect(local.has(method)).toBe(true);
      }
    }
  }
});
