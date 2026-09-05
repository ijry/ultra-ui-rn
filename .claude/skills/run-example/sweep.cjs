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

const adb = (args) => {
  try {
    return execFileSync(ADB, args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    // uiautomator dump exits 143 when the window is still animating/settling;
    // treat that as "no output yet" rather than a hard failure, so the caller
    // can retry after another wait.
    if (err.status === 143) return Buffer.alloc(0);
    throw err;
  }
};
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

/** Read the screen, retrying while uiautomator refuses (window still animating). */
function readScreen({ settleTries = 4 } = {}) {
  for (let s = 0; s < settleTries; s++) {
    const seen = nodes();
    if (seen.length > 0) return seen;
    wait(700);
  }
  return [];
}

/**
 * Tap the smallest node whose text equals `needle`, scanning downward for it.
 *
 * Two things this has to get right, both learned the hard way:
 *
 * - An empty dump means "could not read the screen" (uiautomator refuses while the
 *   window animates), NOT "the text is not here". Treating them the same made this
 *   scroll away from a target sitting at the top, then report it missing.
 * - The index is one 115-row page, so a fixed scroll budget silently caps how deep
 *   the sweep can reach — with 8 swipes everything past ~row 30 was unreachable and
 *   reported LINK NOT FOUND. Instead, scroll until the visible text stops changing:
 *   that reaches the last row and still stops early at the bottom.
 */
/**
 * Walk the index in display order, opening each target as it scrolls past.
 *
 * Why not "search for each row from the top": that is what the previous four
 * versions did, and it never became reliable. On a 115-row page each lookup needs
 * up to ~35 scroll+dump cycles, `uiautomator dump` takes 1-2 s and refuses outright
 * while the window animates, and settle time varies — so which rows were found
 * changed from run to run (LoadingIcon found in one run, missing the next; Table2
 * the reverse). Half the list passed each time, a different half.
 *
 * The host now preserves the index scroll offset across navigation, so this makes
 * a single top-to-bottom pass: read the screen, open any wanted row that is
 * visible, come back to the same offset, scroll on. Every row is looked at exactly
 * once and nothing is searched for twice.
 */
function sweepInOrder(wanted, onPage) {
  const remaining = new Map(wanted.map((p) => [p.title, p]));
  let lastSignature = '';
  let stableCount = 0;

  while (remaining.size > 0) {
    const seen = readScreen();
    if (seen.length === 0) break;

    // Open every wanted row currently on screen, topmost first.
    // `nodes()` reports both a row's `content-desc` and its inner Text, so the same
    // title shows up more than once per row — dedupe by text (keeping the smallest
    // box, as tapText does) or the second copy resolves to an already-consumed
    // entry and crashes on `undefined.id`.
    const bestByText = new Map();
    for (const n of seen) {
      if (!remaining.has(n.text) || n.area <= 0) continue;
      const prev = bestByText.get(n.text);
      if (!prev || n.area < prev.area) bestByText.set(n.text, n);
    }
    const hits = [...bestByText.values()].sort((a, b) => a.y1 - b.y1);
    for (const hit of hits) {
      const page = remaining.get(hit.text);
      if (!page) continue;
      remaining.delete(hit.text);
      adb(['shell', 'input', 'tap', String(Math.round((hit.x1 + hit.x2) / 2)), String(Math.round((hit.y1 + hit.y2) / 2))]);
      wait(900);
      onPage(page);
      back();
    }
    if (remaining.size === 0) break;

    const signature = readScreen().map((n) => n.text).join('|');
    if (signature === lastSignature) {
      if (++stableCount >= 2) break; // bottom of the list
    } else {
      stableCount = 0;
      lastSignature = signature;
    }
    adb(['shell', 'input', 'swipe', '540', '1800', '540', '700', '150']);
    wait(1000);
  }
  return [...remaining.values()];
}

function tapText(needle, { maxScrolls = 60 } = {}) {
  let lastSignature = '';
  let stableCount = 0;
  for (let i = 0; i <= maxScrolls; i++) {
    const seen = readScreen();
    if (seen.length === 0) return false; // screen never became readable
    const hit = seen.filter((n) => n.text === needle && n.area > 0).sort((a, b) => a.area - b.area)[0];
    if (hit) {
      adb(['shell', 'input', 'tap', String(Math.round((hit.x1 + hit.x2) / 2)), String(Math.round((hit.y1 + hit.y2) / 2))]);
      wait(900);
      return true;
    }
    const signature = seen.map((n) => n.text).join('|');
    // One identical read is not the bottom: a dump taken before the previous
    // swipe finished rendering returns the pre-scroll screen, which looks exactly
    // like "nothing moved". Two in a row is the real end of the list.
    if (signature === lastSignature) {
      if (++stableCount >= 2) return false;
    } else {
      stableCount = 0;
      lastSignature = signature;
    }
    adb(['shell', 'input', 'swipe', '540', '1800', '540', '700', '150']);
    wait(1000);
  }
  return false;
}

// One level of navigation: a demo page is one back away from the index.
const back = () => { adb(['shell', 'input', 'tap', '60', '195']); wait(1200); };

/** Scroll the index up until its first group header is visible again. */
function scrollToTop({ maxScrolls = 60 } = {}) {
  let lastSignature = '';
  let stableCount = 0;
  for (let i = 0; i <= maxScrolls; i++) {
    const seen = readScreen();
    if (seen.some((n) => n.text === FIRST_GROUP)) return true;
    const signature = seen.map((n) => n.text).join('|');
    if (signature === lastSignature) {
      if (++stableCount >= 2) return false;
    } else {
      stableCount = 0;
      lastSignature = signature;
    }
    adb(['shell', 'input', 'swipe', '540', '700', '540', '1800', '150']);
    wait(900);
  }
  return false;
}

/** Only the index shows this; used to tell "on the index" from "on a demo page". */
const FIRST_GROUP = '基础组件';

/**
 * Get back to the index and to the top of it, whatever is on screen.
 *
 * Three failure modes made this necessary, each of which cascaded:
 *   - The script assumed it started on the index; a leftover demo page failed entry #1.
 *   - The not-found branch used to `continue` without backing out, so one stuck page
 *     failed every entry after it.
 *   - Even when on the index, a failed search left the list scrolled deep, so the
 *     next entry began its downward scan below its own target. Backing out does not
 *     help there — the list has to be scrolled back up, which is why this both
 *     backs out AND rewinds.
 */
function ensureIndex({ tries = 3 } = {}) {
  for (let i = 0; i < tries; i++) {
    const seen = readScreen();
    if (seen.some((n) => n.text === FIRST_GROUP)) return true;
    // On the index but scrolled past the first header? Rewind rather than back out.
    if (scrollToTop()) return true;
    back();
  }
  return false;
}

const { category, groups } = registry();
const only = process.argv[2];
// Re-verifying a handful of pages should not cost a 10-minute full sweep.
const onlyIds = process.env.ONLY_IDS ? new Set(process.env.ONLY_IDS.split(',').map((s) => s.trim())) : null;
const results = [];

const allPages = groups.flatMap(g => g.items.map(p => ({ group: g.groupName, ...p })));
const toSweep = allPages.filter(p => !only || p.group === only).filter(p => !onlyIds || onlyIds.has(p.id));
console.log(`will sweep ${toSweep.length} pages from ${groups.length} groups`);
console.log('');

if (!ensureIndex()) {
  console.error('Failed to reach the index after 3 back attempts — is the app running?');
  process.exit(1);
}

/** Inspect the demo page that is currently open and record its health. */
function inspectPage(page) {
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
  const titleShown = texts.has(page.title) || [...texts].some((t) => t.includes(page.cn));
  console.log(`  ${page.group}/${page.id}: nodes=${seen.length} title=${titleShown} errors=${errors.length}`);
  results.push({
    page: `${page.group}/${page.id}`,
    nodes: seen.length,
    inconclusive: seen.length === 0 ? 'hierarchy never idle (animating page?) — check the screenshot' : undefined,
    titleShown,
    errors: [...new Set(errors)].slice(0, 3),
  });
}

const missed = sweepInOrder(toSweep, (page) => {
  adb(['logcat', '-c']);
  inspectPage(page);
});

for (const page of missed) {
  console.log(`  ${page.group}/${page.id}: LINK NOT FOUND`);
  results.push({ page: `${page.group}/${page.id}`, status: 'LINK NOT FOUND' });
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
