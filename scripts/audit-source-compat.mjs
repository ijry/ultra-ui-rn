#!/usr/bin/env node
/**
 * uview-plus ↔ ultra-ui-rn source compatibility audit.
 *
 * Compares the uview-plus@3.8.86 source contract against the local React
 * Native implementation on three dimensions:
 *
 *   props    — prop names declared in each source component's props.js
 *              vs the local `UP<Name>Props` type (including `X & {` bases)
 *   events   — `emit('...')` calls in the source .vue vs the local
 *              `onXxx` callback surface (source names retained verbatim)
 *   defaults — default values in props.js vs `sourceDefaults.props.<name>`
 *              in src/config/defaults.ts
 *
 * Usage (from the repo root):
 *   node scripts/audit-source-compat.mjs \
 *     --source /path/to/uview-plus/package \
 *     [--local src/components] \
 *     [--dimensions props,events,defaults] \
 *     [--fail]                # exit 1 when gaps exist
 *
 * Exit code is 0 when no gaps are reported (or --fail is not set).
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function flag(name) {
  return process.argv.includes(`--${name}`);
}

const SOURCE_ROOT = arg('source', null);
const LOCAL_DIR = arg('local', join(ROOT, 'src/components'));
const DIMS = (arg('dimensions', 'props,events,defaults') || '').split(',').filter(Boolean);
const FAIL = flag('fail');
const VERBOSE = flag('verbose');
const DUMP = arg('dump', null);

if (!SOURCE_ROOT) {
  console.error('usage: node scripts/audit-source-compat.mjs --source <uview-plus package dir> [--local src/components] [--dimensions props,events,defaults,refs] [--dump <fixture.json>] [--fail]');
  process.exit(2);
}

const dirs = sourceComponentDirs();

if (DUMP) {
  // Snapshot the full source contract (props with defaults, events, refs) as
  // JSON so tests can lock the local surface against uview-plus@3.8.86.
  const contract = {};
  for (const name of dirs) {
    const props = sourceProps(name);
    const events = sourceEmits(name);
    const refs = sourceRefMethods(name);
    if (!props && !events && !refs) continue;
    const entry = {};
    if (props && props.size) {
      const defaults = {};
      const propNames = [];
      for (const [key, s] of props) {
        propNames.push(key);
        if (s.hasDefault) {
          const sv = sourceDefaultValue(name, s);
          if (sv !== undefined) defaults[key] = sv;
        }
      }
      entry.props = propNames.sort();
      if (Object.keys(defaults).length) entry.defaults = defaults;
    }
    if (events && events.size) entry.events = [...events].sort();
    if (refs && refs.size) entry.refs = [...refs].sort();
    if (Object.keys(entry).length) contract[name] = entry;
  }
  writeFileSync(DUMP, JSON.stringify({ version: 'uview-plus@3.8.86', contract }, null, 2));
  console.log(`wrote source contract fixture to ${DUMP}`);
  process.exit(0);
}

/* ----------------------------- source side ------------------------------ */

function sourceComponentDirs() {
  const root = join(SOURCE_ROOT, 'components');
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('u-'))
    .map((d) => d.name.slice(2))
    .sort();
}

// Public ref methods from the shipped per-component .d.ts `_XxxRef` interfaces.
function sourceRefMethods(name) {
  const camelName = camel(name);
  const file = join(SOURCE_ROOT, 'types', 'comps', `${camelName}.d.ts`);
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const re = /interface _\w+Ref \{\n([\s\S]*?)\n\}/;
  const m = text.match(re);
  if (!m) return null;
  const methods = new Set();
  for (const line of m[1].split('\n')) {
    const lm = line.match(/^\s{2}(\w+)\s*[:(]/);
    if (lm) methods.add(lm[1]);
  }
  return methods;
}

// Resolve a `defProps.<comp>.<key>` factory default to its literal value.
// The defaults live in the sibling module imported by props.js (e.g. `./card`),
// exported as `export default { <comp>: { <key>: value } }`. Cross-component
// references (e.g. picker → `defProps.input.inputBorder`) resolve via the
// target component's own defaults module.
function resolveDefProps(name, compKey, propKey) {
  const propsFile = join(SOURCE_ROOT, 'components', `u-${name}`, 'props.js');
  if (!existsSync(propsFile)) return undefined;
  const text = readFileSync(propsFile, 'utf8');
  const im = text.match(/import\s+\w+\s+from\s+['"]\.\/([\w-]+)['"]/);
  let defFile = im ? join(SOURCE_ROOT, 'components', `u-${name}`, `${im[1]}.js`) : null;
  // Cross-component reference: try the target component's defaults module.
  if (!defFile || !existsSync(defFile)) {
    const cross = join(SOURCE_ROOT, 'components', `u-${compKey}`, `${compKey}.js`);
    if (existsSync(cross)) defFile = cross;
  }
  if (!defFile || !existsSync(defFile)) return undefined;
  const defText = readFileSync(defFile, 'utf8');
  const re = new RegExp(`\\b${compKey}\\s*:\\s*\\{`);
  const start = defText.search(re);
  if (start < 0) return undefined;
  const block = braceBody(defText, start);
  if (!block) return undefined;
  const vr = new RegExp(`\\b${propKey}\\s*:\\s*([^,}]+)`);
  const vm = block.body.match(vr);
  if (!vm) return undefined;
  return normalizeValue(vm[1].trim());
}

function sourceProps(name) {
  const file = join(SOURCE_ROOT, 'components', `u-${name}`, 'props.js');
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const props = new Map();
  // Locate the `props: { ... }` block.
  const propsStart = text.search(/\bprops\s*:\s*\{/);
  if (propsStart < 0) return props;
  let depth = 0;
  let i = text.indexOf('{', propsStart);
  const blockStart = i;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  const block = text.slice(blockStart + 1, i);
  // Split top-level entries: `name: { type, default },` (strings may contain braces).
  const entries = splitTopLevel(block);
  for (const entry of entries) {
    const m = entry.match(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:/);
    if (!m) continue;
    const body = entry.slice(entry.indexOf(':') + 1).trim();
    let hasDefault = false;
    let defaultRaw = undefined;
    const dm = body.match(/\bdefault\s*:\s*([^,}]+)/);
    if (dm) {
      hasDefault = true;
      defaultRaw = dm[1].trim();
    }
    props.set(m[1], { hasDefault, defaultRaw });
  }
  return props;
}

function splitTopLevel(text) {
  const out = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '{' || ch === '[' || ch === '(') depth++;
    else if (ch === '}' || ch === ']' || ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      out.push(text.slice(start, i));
      start = i + 1;
    }
  }
  out.push(text.slice(start));
  return out.filter((s) => s.trim());
}

function sourceMethods(name) {
  const file = join(SOURCE_ROOT, 'components', `u-${name}`, `u-${name}.vue`);
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const methods = new Set();
  // Options-API `methods: { a() {}, b() {} }`
  const mStart = text.search(/\bmethods\s*:\s*\{/);
  if (mStart >= 0) {
    const found = braceBody(text, mStart);
    if (found) {
      for (const seg of splitTopLevel(found.body)) {
        const m = seg.match(/^\s*([A-Za-z_$][\w$]*)\s*[:(]/);
        if (m) methods.add(m[1]);
      }
    }
  }
  // defineExpose({ ... })
  const dStart = text.search(/defineExpose\s*\(\s*\{/);
  if (dStart >= 0) {
    const found = braceBody(text, dStart);
    if (found) {
      for (const seg of splitTopLevel(found.body)) {
        const m = seg.match(/^\s*([A-Za-z_$][\w$]*)\s*:/);
        if (m) methods.add(m[1]);
      }
    }
  }
  return methods;
}

function localRefMethods(name, dirName = name) {
  const files = localFiles(dirName);
  if (!files) return null;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const re = /useImperativeHandle\s*\(\s*ref\s*,\s*\(?\)?\s*=>\s*\(\s*\{/;
    const start = text.search(re);
    if (start < 0) continue;
    const found = braceBody(text, start);
    if (!found) continue;
    const methods = new Set();
    for (const seg of splitTopLevel(found.body)) {
      const m = seg.match(/^\s*([A-Za-z_$][\w$]*)\s*:/);
      if (m) methods.add(m[1]);
      else {
        const sm = seg.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/);
        if (sm) methods.add(sm[1]);
        else {
          // object shorthand `{ pause, reset, start }`
          for (const o of seg.matchAll(/\b([A-Za-z_$][\w$]*)\s*(?:,|$)/g)) methods.add(o[1]);
        }
      }
    }
    return methods;
  }
  return null;
}

function sourceEmits(name) {
  const file = join(SOURCE_ROOT, 'components', `u-${name}`, `u-${name}.vue`);
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const emits = new Set();
  const re = /(?:emit|\$emit)\(\s*['"]([\w-]+)['"]/g;
  for (const m of text.matchAll(re)) emits.add(m[1]);
  const re2 = /emits\s*:\s*\[([^\]]*)\]/g;
  for (const m of text.matchAll(re2)) {
    for (const e of m[1].matchAll(/['"]([\w-]+)['"]/g)) emits.add(e[1]);
  }
  return emits;
}

/* ----------------------------- local side ------------------------------ */

function cap(name) {
  return name.split('-').map((s) => (s[0] ? s[0].toUpperCase() + s.slice(1) : s)).join('');
}

function braceBody(text, start) {
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
  return { body: text.slice(open + 1, i), prefix: text.slice(start, open) };
}

function keysFromBody(body) {
  const clean = body.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const keys = new Set();
  for (const seg of clean.split(';')) {
    const k = seg.trim().match(/^([A-Za-z][A-Za-z0-9]*)\??:/);
    if (k) keys.add(k[1]);
  }
  return keys;
}

function localFiles(dirName) {
  const dir = join(LOCAL_DIR, dirName);
  if (!existsSync(dir)) return null;
  return readdirSync(dir)
    .filter((f) => f === 'types.ts' || f === 'index.ts' || /^UP.*\.tsx?$/.test(f))
    .map((f) => join(dir, f));
}

function localPropsKeys(name, dirName = name) {
  const files = localFiles(dirName);
  if (!files) return null;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const re = new RegExp(`export type UP${cap(name)}Props[^{]*\{`);
    const start = text.search(re);
    if (start < 0) continue;
    const found = braceBody(text, start);
    if (!found) continue;
    const keys = keysFromBody(found.body);
    const seen = new Set([`UP${cap(name)}Props`]);
    const baseRe = /([A-Za-z][A-Za-z0-9]*)\s*&/g;
    let m;
    while ((m = baseRe.exec(found.prefix))) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      const baseRe2 = new RegExp(`export type ${m[1]}[^{]*\{`);
      const baseStart = text.search(baseRe2);
      if (baseStart < 0) continue;
      const base = braceBody(text, baseStart);
      if (base) for (const k of keysFromBody(base.body)) keys.add(k);
    }
    return keys;
  }
  return null;
}

// Defaults-key aliases where the local config key diverges from camelCase.
const DEFAULTS_KEY_ALIAS = {
  'back-top': 'backtop',
};

function camel(name) {
  return name.split('-').map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1))).join('');
}

function defaultsKey(name) {
  return DEFAULTS_KEY_ALIAS[name] ?? camel(name);
}

function localDefaults(name) {
  // Parse `sourceDefaults.props: Object.freeze({ <camelName>: Object.freeze({...}) })`
  // from defaults.ts.
  const file = join(ROOT, 'src/config/defaults.ts');
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const propsStart = text.search(/props\s*:\s*Object\.freeze\(\{/);
  if (propsStart < 0) return null;
  const propsOpen = text.indexOf('{', propsStart);
  const re = new RegExp(`\\b${defaultsKey(name)}\\s*:\\s*Object\\.freeze\\(\\{`);
  const localStart = text.slice(propsOpen).search(re);
  if (localStart < 0) return null;
  const found = braceBody(text, propsOpen + localStart);
  if (!found) return null;
  const values = new Map();
  for (const seg of splitTopLevel(found.body)) {
    const m = seg.match(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*/);
    if (!m) continue;
    values.set(m[1], normalizeValue(seg.slice(seg.indexOf(':') + 1).trim()));
  }
  return values;
}

function normalizeValue(raw) {
  if (raw === undefined) return undefined;
  if (raw.startsWith("'") || raw.startsWith('"')) return raw.slice(1, -1);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  if (raw === 'undefined') return undefined;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  if (raw.startsWith('Object.freeze(') || raw.startsWith('[') || raw.startsWith('{')) return '__array_or_object__';
  return raw;
}

function sourceDefaultValue(name, s) {
  // Literal default → normalized value. `defProps.X.Y` references (with or
  // without an `() =>` factory wrapper) → resolved from the sibling defaults
  // module. i18n `t('...')` and function-valued defaults are not comparable
  // (the local translation / behavior is the faithful equivalent).
  const raw = s.defaultRaw;
  if (!raw) return undefined;
  const ref = raw.replace(/^\(\)\s*=>\s*/, '').trim();
  if (/^defProps\./.test(ref)) {
    const rm = ref.match(/^defProps\.([A-Za-z0-9]+)\.([A-Za-z0-9]+)$/);
    if (!rm) return undefined;
    const resolved = resolveDefProps(name, rm[1], rm[2]);
    // i18n value inside the defaults module — local translation is the equivalent.
    return typeof resolved === 'string' && /^t\s*\(/.test(resolved) ? undefined : resolved;
  }
  if (/^t\s*\(/.test(ref)) return undefined; // i18n string — not comparable
  if (ref !== raw) return undefined; // other factory functions — not comparable
  return normalizeValue(raw);
}

/* ------------------------------ reporting ------------------------------- */

// Sub-components that live inside a parent component's directory.
const SUBCOMPONENT_MAP = {
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

function resolveLocalDir(name) {
  if (existsSync(join(LOCAL_DIR, name))) return name;
  return SUBCOMPONENT_MAP[name] ?? null;
}

// Events the source component delegates to its parent (`this.parent.$emit`)
// and that the local parent component already exposes.
const DELEGATED_EVENTS = {
  'tabbar-item': ['change'],
};

const problems = [];
const warnings = [];

function report(name, dim, message) {
  problems.push(`${name} [${dim}]: ${message}`);
}

if (DIMS.includes('props')) {
  for (const name of dirs) {
    const src = sourceProps(name);
    if (!src || src.size === 0) continue;
    const dirName = resolveLocalDir(name);
    if (!dirName) {
      warnings.push(`${name} [props]: no local component dir found`);
      continue;
    }
    const local = localPropsKeys(name, dirName);
    if (!local) {
      warnings.push(`${name} [props]: no local Props type found (dir ${dirName})`);
      continue;
    }
    const missing = [...src.keys()].filter((k) => !local.has(k));
    const extra = [...local].filter((k) => !src.has(k));
    for (const k of missing) report(name, 'props', `missing source prop \`${k}\``);
    if (VERBOSE) for (const k of extra) warnings.push(`${name} [props]: local-only prop \`${k}\``);
  }
}

if (DIMS.includes('events')) {
  for (const name of dirs) {
    const src = sourceEmits(name);
    if (!src || src.size === 0) continue;
    const dirName = resolveLocalDir(name);
    if (!dirName) {
      warnings.push(`${name} [events]: no local component dir found (source emits ${[...src].join(', ')})`);
      continue;
    }
    const local = localPropsKeys(name, dirName);
    if (!local) {
      warnings.push(`${name} [events]: no local Props type found (dir ${dirName}, source emits ${[...src].join(', ')})`);
      continue;
    }
    for (const e of src) {
      if (DELEGATED_EVENTS[name]?.includes(e)) continue;
      const cb = e.startsWith('update:')
        ? `onUpdate${e.slice('update:'.length)[0].toUpperCase()}${e.slice('update:'.length + 1)}`
        : `on${e.split('-').map((s) => (s[0] ? s[0].toUpperCase() + s.slice(1) : s)).join('')}`;
      if (!local.has(cb)) report(name, 'events', `missing source event \`${e}\` (expected \`${cb}\`)`);
    }
  }
}

// Vue Options-API methods that are internal event handlers / lifecycle helpers
// rather than public ref API. Public methods come from uview-plus docs.
const INTERNAL_METHODS = new Set([
  'bootstrap', 'cancelAnimationFrame', 'changeEvent', 'checkKeepRunning', 'clearActiveTooltip',
  'cloneNodes', 'destroyed', 'easingFn', 'finishRefresh', 'formatNumber', 'getUPCanvasContext',
  'handleRefresh', 'handleScroll', 'hideKeyboard', 'init', 'initTree', 'isLastPage', 'macroTick',
  'microTick', 'onClose', 'onOpen', 'onPrimaryAction', 'onShowByClickInput', 'onSkip',
  'onSwiperChange', 'readRemembered', 'requestAnimationFrame', 'resolveStrokeColor',
  'selectClick', 'setDefault', 'testArray', 'touchEnd', 'touchMove', 'touchStart', 'urlClick',
  'writeRemembered', 'onClick', 'onKeypress', 'onTouchEnd', 'onTouchMove', 'onTouchStart',
  '_clearCode', '_saveCode', '_result', '_empty',
]);

if (DIMS.includes('methods')) {
  for (const name of dirs) {
    const src = sourceMethods(name);
    if (!src || src.size === 0) continue;
    const dirName = resolveLocalDir(name);
    if (!dirName) continue;
    const local = localRefMethods(name, dirName);
    if (!local) {
      warnings.push(`${name} [methods]: source exposes ${[...src].join(', ')} but no local ref found`);
      continue;
    }
    for (const m of src) {
      if (INTERNAL_METHODS.has(m) || m.startsWith('_')) continue;
      if (!local.has(m)) report(name, 'methods', `missing ref method \`${m}\``);
    }
  }
}

if (DIMS.includes('refs')) {
  for (const name of dirs) {
    const src = sourceRefMethods(name);
    if (!src || src.size === 0) continue;
    const dirName = resolveLocalDir(name);
    if (!dirName) continue;
    const local = localRefMethods(name, dirName);
    if (!local) {
      warnings.push(`${name} [refs]: source documents ${[...src].join(', ')} but no local ref found`);
      continue;
    }
    for (const m of src) {
      if (!local.has(m)) report(name, 'refs', `missing ref method \`${m}\``);
    }
  }
}

if (DIMS.includes('defaults')) {
  let skippedDefaults = 0;
  const skippedNames = [];
  for (const name of dirs) {
    const src = sourceProps(name);
    if (!src) continue;
    const local = localDefaults(name);
    if (!local) {
      skippedDefaults++;
      if (skippedNames.length < 40) skippedNames.push(name);
      continue; // defaults not centralized for this component
    }
    for (const [key, s] of src) {
      if (!s.hasDefault) continue;
      const sv = sourceDefaultValue(name, s);
      if (!local.has(key)) {
        if (sv !== undefined) {
          report(name, 'defaults', `source default for \`${key}\` missing locally (source: ${JSON.stringify(sv)})`);
        }
        continue;
      }
      const lv = local.get(key);
      if (lv === '__array_or_object__') continue; // structural comparison not meaningful
      if (sv !== undefined && sv !== lv) {
        report(name, 'defaults', `default mismatch \`${key}\`: source ${JSON.stringify(sv)} vs local ${JSON.stringify(lv)}`);
      }
    }
  }
  if (skippedDefaults > 0) {
    warnings.push(`defaults: ${skippedDefaults} components have no centralized defaults entry (${skippedNames.join(', ')}${skippedDefaults > 40 ? ', …' : ''})`);
  }
}

/* -------------------------------- output -------------------------------- */

console.log(`\nuview-plus source-compatibility audit (${dirs.length} source components)`);
console.log(`dimensions: ${DIMS.join(', ')}  local: ${LOCAL_DIR}\n`);

if (problems.length) {
  console.log(`GAPS (${problems.length}):`);
  for (const p of problems) console.log(`  ✗ ${p}`);
} else {
  console.log('GAPS: none 🎉');
}
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length}):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}
console.log(`\n${dirs.length} components audited — ${problems.length} gaps, ${warnings.length} warnings`);

process.exit(FAIL && problems.length ? 1 : 0);
