#!/usr/bin/env node
/**
 * Native sweep: walk every registered demo page on a connected device and record
 * a health signal for each, so the failures can be triaged instead of eyeballing
 * ~115 screenshots.
 *
 * Per page: visible text-node count, whether the page's own title rendered, and
 * any ReactNativeJS error logged while it was open.
 *
 * The index is a single flat page (it mirrors upstream's components.nvue), so
 * navigation is one level: tap an entry's upstream title, then one back. Entries
 * are visited in the order SOURCE_GROUPS lists them, which is the order they
 * appear on screen — that matters because tapText only ever scrolls downward.
 *
 * Usage: node sweep.cjs [groupNameFilter]
 *        ONLY_IDS=Copy,Overlay node sweep.cjs   # just those component ids
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

/**
 * Read the index exactly as the app renders it: SOURCE_GROUPS drives the screen,
 * and `category` only says which folder the demo file lives in.
 */
function registry() {
  const src = fs.readFileSync(REGISTRY, 'utf8');
  const category = new Map();
  for (const m of src.matchAll(/\{\s*id:\s*'(\w+)',\s*title:\s*'([^']+)',\s*category:\s*'([a-z]+)'/g)) {
    category.set(m[1], m[3]);
  }
  const groupsBlock = src.slice(src.indexOf('SOURCE_GROUPS'));
  const groups = [];
  for (const chunk of groupsBlock.split(/groupName:\s*'/).slice(1)) {
    const groupName = chunk.slice(0, chunk.indexOf("'"));
    const items = [];
    for (const m of chunk.matchAll(/\{\s*icon:\s*'[^']*',\s*id:\s*(?:'(\w+)'|null),\s*title:\s*'([^']+)'/g)) {
      if (!m[1]) continue; // upstream entry with no local demo page
      items.push({ cn: m[2].split(' ')[1] || m[2], id: m[1], title: m[2] });
    }
    groups.push({ groupName, items });
  }
  return { category, groups };
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

// One level of navigation now: a demo page is one back away from the index.
const back = () => { adb(['shell', 'input', 'tap', '60', '195']); wait(900); };
/** Scroll the index back to the top so the next entry is reachable downward. */
const toTop = () => {
  for (let i = 0; i < 12; i++) {
    adb(['shell', 'input', 'swipe', '540', '600', '540', '2000', '250']);
  }
  wait(600);
};

const { category, groups } = registry();
const only = process.argv[2];
// Re-verifying a handful of pages should not cost a 10-minute full sweep.
const onlyIds = process.env.ONLY_IDS ? new Set(process.env.ONLY_IDS.split(',').map((s) => s.trim())) : null;
const results = [];

for (const group of groups) {
  if (only && group.groupName !== only) continue;
  const pages = group.items.filter((c) => !onlyIds || onlyIds.has(c.id));
  if (!pages.length) continue;
  for (const page of pages) {
    adb(['logcat', '-c']);
    // The index is one long page and tapText only swipes downward, so start each
    // entry from the top rather than wherever the previous one left the list.
    toTop();
    const opened = tapText(page.title) || tapText(page.id);
    if (!opened) {
      results.push({ page: `${group.groupName}/${page.id}`, status: 'LINK NOT FOUND' });
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
    fs.writeFileSync(path.join(OUT, `${category.get(page.id) ?? 'unknown'}-${page.id}.png`), png);
    results.push({
      page: `${group.groupName}/${page.id}`,
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
