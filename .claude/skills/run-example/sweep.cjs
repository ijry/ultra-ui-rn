#!/usr/bin/env node
/**
 * Native sweep: walk every registered demo page on a connected device and record
 * a health signal for each, so the failures can be triaged instead of eyeballing
 * ~94 screenshots.
 *
 * Per page: visible text-node count, whether the page's own title rendered, and
 * any ReactNativeJS error logged while it was open.
 *
 * Usage: node sweep.cjs [categoryFilter]
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ADB = process.env.ADB || 'adb';
const OUT = process.env.SHOT_DIR || path.join(process.cwd(), 'sweep');
const REGISTRY = process.env.REGISTRY ||
  'D:/Repos/xyito/ultra-ui/ultra-ui-rn/example/pages/registry.ts';
fs.mkdirSync(OUT, { recursive: true });

const adb = (args) => execFileSync(ADB, args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
const adbText = (args) => adb(args).toString('utf8');
const wait = (ms) => execFileSync(process.execPath, ['-e', `setTimeout(()=>{},${ms})`]);

function registry() {
  const src = fs.readFileSync(REGISTRY, 'utf8');
  const cats = [];
  for (const m of src.matchAll(/id:\s*'([a-z]+)'[^}]*?title:\s*'([^']+)'[^}]*?icon:/g)) {
    cats.push({ id: m[1], title: m[2] });
  }
  const comps = [];
  for (const m of src.matchAll(/\{\s*id:\s*'(\w+)',\s*title:\s*'([^']+)',\s*category:\s*'([a-z]+)'/g)) {
    comps.push({ id: m[1], title: m[2], category: m[3], cn: m[2].split(' ')[1] || m[2] });
  }
  return { cats, comps };
}

function nodes() {
  const xml = adbText(['exec-out', 'uiautomator', 'dump', '/dev/tty']);
  const out = [];
  for (const m of xml.matchAll(/<node\b([^>]*)\/?>/g)) {
    const attrs = m[1];
    const get = (n) => (new RegExp(`${n}="([^"]*)"`).exec(attrs) || [, ''])[1];
    const b = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/.exec(get('bounds'));
    if (!b) continue;
    const [, x1, y1, x2, y2] = b.map(Number);
    const text = get('text') || get('content-desc');
    if (text) out.push({ text, x1, y1, x2, y2, area: (x2 - x1) * (y2 - y1) });
  }
  return out;
}

function tapText(needle, { scrolls = 6 } = {}) {
  for (let i = 0; i <= scrolls; i++) {
    const hit = nodes().filter((n) => n.text === needle && n.area > 0).sort((a, b) => a.area - b.area)[0];
    if (hit) {
      adb(['shell', 'input', 'tap', String(Math.round((hit.x1 + hit.x2) / 2)), String(Math.round((hit.y1 + hit.y2) / 2))]);
      wait(900);
      return true;
    }
    if (i === scrolls) return false;
    adb(['shell', 'input', 'swipe', '540', '1800', '540', '700', '350']);
    wait(500);
  }
  return false;
}

const back = () => { adb(['shell', 'input', 'tap', '60', '195']); wait(900); };
const home = () => { back(); back(); wait(400); };

const { cats, comps } = registry();
const only = process.argv[2];
const results = [];

for (const cat of cats) {
  if (only && cat.id !== only) continue;
  const pages = comps.filter((c) => c.category === cat.id);
  home();
  if (!tapText(cat.title)) {
    results.push({ page: cat.title, status: 'CATEGORY NOT FOUND' });
    continue;
  }
  for (const page of pages) {
    adb(['logcat', '-c']);
    const opened = tapText(page.id) || tapText(page.cn);
    if (!opened) {
      results.push({ page: `${cat.id}/${page.id}`, status: 'LINK NOT FOUND' });
      home();
      tapText(cat.title);
      continue;
    }
    wait(2200);
    // uiautomator only dumps once the window is idle; a page that animates
    // continuously (e.g. a millisecond countdown) yields an empty dump even
    // though it renders fine, so retry before believing it.
    let seen = nodes();
    for (let i = 0; i < 2 && seen.length === 0; i++) { wait(1200); seen = nodes(); }
    const texts = new Set(seen.map((n) => n.text));
    const log = adbText(['logcat', '-d']);
    const errors = log
      .split('\n')
      .filter((l) => /ReactNativeJS/.test(l) && /Error|Exception|Warning:/.test(l))
      .map((l) => l.replace(/^.*ReactNativeJS:\s*/, '').slice(0, 160));
    const png = adb(['exec-out', 'screencap', '-p']);
    fs.writeFileSync(path.join(OUT, `${cat.id}-${page.id}.png`), png);
    results.push({
      page: `${cat.id}/${page.id}`,
      nodes: seen.length,
      inconclusive: seen.length === 0 ? 'hierarchy never idle (animating page?) — check the screenshot' : undefined,
      titleShown: texts.has(page.title) || [...texts].some((t) => t.includes(page.cn)),
      errors: [...new Set(errors)].slice(0, 3),
    });
    back();
    wait(600);
  }
}

const suspicious = results.filter(
  (r) => r.status || (r.errors && r.errors.length) || r.inconclusive || (r.nodes > 0 && r.nodes < 6),
);
console.log(`swept ${results.length} pages; ${suspicious.length} need a look\n`);
for (const r of suspicious) {
  console.log(`${r.page}: ${r.status || r.inconclusive || `nodes=${r.nodes} title=${r.titleShown}`}`);
  for (const e of r.errors || []) console.log(`    ${e}`);
}
fs.writeFileSync(path.join(OUT, 'sweep.json'), JSON.stringify(results, null, 2));
console.log(`\nfull results: ${path.join(OUT, 'sweep.json')}`);
