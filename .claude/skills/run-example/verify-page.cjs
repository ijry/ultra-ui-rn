#!/usr/bin/env node
/**
 * Open one demo page by its index row title and report health.
 *
 * Usage: node verify-page.cjs "<row title>" <outName>
 *
 * Deliberately dumb and self-contained: rewind the index to the top, scan
 * downward until the row is visible, tap it, then count text nodes / JS errors and
 * grab a screenshot. Used to check individual pages when the batch sweeper's
 * position tracking is not trustworthy.
 *
 * Note the interaction that made this necessary: the index now *preserves* its
 * scroll offset across navigation, so a script that assumes it starts at the top
 * silently searches downward from wherever the previous page left it. Always
 * rewind explicitly.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = process.env.SHOT_DIR || path.join(process.cwd(), 'shots');
fs.mkdirSync(OUT, { recursive: true });
const adb = (args) => execFileSync('adb', args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
const adbText = (args) => adb(args).toString('utf8');
const wait = (ms) => execFileSync(process.execPath, ['-e', `setTimeout(()=>{},${ms})`]);


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
    if (text) out.push({ area: (x2 - x1) * (y2 - y1), text, x1, x2, y1, y2 });
  }
  return out;
}

function readScreen(tries = 4) {
  for (let i = 0; i < tries; i++) {
    const seen = nodes();
    if (seen.length > 0) return seen;
    wait(700);
  }
  return [];
}

function tap(n) {
  adb(['shell', 'input', 'tap', String(Math.round((n.x1 + n.x2) / 2)), String(Math.round((n.y1 + n.y2) / 2))]);
}

/** Leave a demo page if we are on one; the index is whatever has UPCell rows. */
function backOutIfOnDemoPage() {
  const seen = readScreen();
  // Demo pages have a centred title and a back arrow; the index has neither, but
  // it always has at least one row whose text ends in a Chinese label. Cheapest
  // reliable signal: the index's own nav title, or any known first-group row.
  if (seen.some((n) => n.text === 'ultra-ui-rn' || n.text === 'Color 色彩')) return;
  adb(['shell', 'input', 'tap', '60', '195']);
  wait(1200);
}

/**
 * Find `want` by scanning in one direction, then the other.
 *
 * No "scroll to the top first" step, deliberately. The index preserves its scroll
 * offset across navigation now, so any script that assumes it starts at the top
 * searches downward from wherever the last page left it — which is how six pages
 * in a row reported NOT FOUND while rendering perfectly. Rewinding first is also
 * unreliable: from the bottom of a 115-row list it takes ~30 swipes, and the
 * settle race makes a fixed swipe budget guess wrong. Searching both ways removes
 * the assumption instead of trying to satisfy it.
 */
function findAndTap(want) {
  for (const dir of ['down', 'up']) {
    const [y1, y2] = dir === 'down' ? [1800, 700] : [700, 1800];
    let last = '';
    let stable = 0;
    for (let i = 0; i < 45; i++) {
      const seen = readScreen();
      const hit = seen.filter((n) => n.text === want && n.area > 0).sort((a, b) => a.area - b.area)[0];
      if (hit) { tap(hit); wait(2600); return true; }
      const sig = seen.map((n) => n.text).join('|');
      if (sig === last) { if (++stable >= 3) break; } else { stable = 0; last = sig; }
      adb(['shell', 'input', 'swipe', '540', String(y1), '540', String(y2), '150']);
      wait(900);
    }
  }
  return false;
}

const want = process.argv[2];
const outName = process.argv[3] || want;
if (!want) { console.error('usage: verify-page.cjs "<row title>" <outName>'); process.exit(2); }

backOutIfOnDemoPage();
adb(['logcat', '-c']);

if (!findAndTap(want)) { console.log(`${outName}: NOT FOUND`); process.exit(1); }

let seen = nodes();
for (let i = 0; i < 2 && seen.length === 0; i++) { wait(1200); seen = nodes(); }
const errors = adbText(['logcat', '-d'])
  .split('\n')
  .filter((l) => /ReactNativeJS/.test(l) && /Error|Exception/.test(l));
fs.writeFileSync(path.join(OUT, `${outName}.png`), adb(['exec-out', 'screencap', '-p']));
console.log(`${outName}: nodes=${seen.length} errors=${errors.length}${seen.length === 0 ? ' (hierarchy never idle — check screenshot)' : ''}`);
for (const e of errors.slice(0, 2)) console.log(`    ${e.replace(/^.*ReactNativeJS:\s*/, '').slice(0, 140)}`);
