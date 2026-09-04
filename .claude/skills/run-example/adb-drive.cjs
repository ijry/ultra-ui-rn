#!/usr/bin/env node
/**
 * Native counterpart to cdp.cjs: drives the app on a connected Android device
 * via adb. Reads a newline-separated command script on stdin.
 *
 * Commands:
 *   tap-text <text>        dump the view hierarchy, tap the centre of the
 *                          smallest node whose text/content-desc equals <text>
 *   tap-contains <text>    same, but substring match
 *   tap <x> <y>            raw tap
 *   swipe <x1> <y1> <x2> <y2> [ms]
 *   text?  <text>          assert visible text exists (prints OK / MISSING)
 *   dump                   print every distinct text on screen
 *   screenshot <name>      pull a png into SHOT_DIR
 *   logcat-errors          print ReactNativeJS errors / exceptions since start
 *   sleep <ms>
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ADB = process.env.ADB || 'adb';
const OUT = process.env.SHOT_DIR || path.join(process.cwd(), 'shots');
fs.mkdirSync(OUT, { recursive: true });

const adb = (args, opts = {}) =>
  execFileSync(ADB, args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, ...opts });
const adbText = (args) => adb(args).toString('utf8');

// `logcat-errors` used to pass `-t "<MM-DD HH:MM:SS>"`, which adb rejects (it
// wants millisecond precision) and which compared a UTC clock against the
// device's local one. Clearing the buffer up front makes a plain `-d` mean
// "since this driver started" with no format or timezone to get wrong.
adb(['logcat', '-c']);

function hierarchy() {
  // exec-out avoids the /sdcard round trip and the CRLF mangling that comes with it.
  const xml = adbText(['exec-out', 'uiautomator', 'dump', '/dev/tty']);
  const nodes = [];
  const re = /<node\b([^>]*)\/?>/g;
  let m;
  while ((m = re.exec(xml))) {
    const attrs = m[1];
    const get = (name) => {
      const hit = new RegExp(`${name}="([^"]*)"`).exec(attrs);
      return hit ? hit[1] : '';
    };
    const bounds = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/.exec(get('bounds'));
    if (!bounds) continue;
    const [, x1, y1, x2, y2] = bounds.map(Number);
    nodes.push({
      text: get('text'),
      desc: get('content-desc'),
      x1, y1, x2, y2,
      area: (x2 - x1) * (y2 - y1),
    });
  }
  return nodes;
}

function locate(needle, contains) {
  const match = (node) => {
    const hay = [node.text, node.desc];
    return contains
      ? hay.some((v) => v && v.includes(needle))
      : hay.some((v) => v === needle);
  };
  // Smallest matching node is the most specific one.
  return hierarchy()
    .filter((n) => match(n) && n.area > 0)
    .sort((a, b) => a.area - b.area)[0];
}

const tap = (x, y) => adb(['shell', 'input', 'tap', String(Math.round(x)), String(Math.round(y))]);
const wait = (ms) => execFileSync(process.execPath, ['-e', `setTimeout(()=>{},${ms})`]);

const script = fs.readFileSync(0, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);

for (const line of script) {
  const [cmd, ...rest] = line.split(' ');
  const arg = rest.join(' ');
  try {
    if (cmd === 'tap-text' || cmd === 'tap-contains') {
      const node = locate(arg, cmd === 'tap-contains');
      if (!node) {
        console.log(`${cmd} ${JSON.stringify(arg)} -> NOT FOUND`);
        process.exitCode = 1;
      } else {
        tap((node.x1 + node.x2) / 2, (node.y1 + node.y2) / 2);
        wait(900);
        console.log(`${cmd} ${JSON.stringify(arg)} -> tapped ${Math.round((node.x1 + node.x2) / 2)},${Math.round((node.y1 + node.y2) / 2)}`);
      }
    } else if (cmd === 'tap') {
      const [x, y] = rest.map(Number);
      tap(x, y);
      wait(600);
      console.log(`tap ${x},${y}`);
    } else if (cmd === 'swipe') {
      const [x1, y1, x2, y2, ms = 300] = rest.map(Number);
      adb(['shell', 'input', 'swipe', x1, y1, x2, y2, ms].map(String));
      wait(700);
      console.log(`swipe ${x1},${y1} -> ${x2},${y2}`);
    } else if (cmd === 'text?') {
      const found = Boolean(locate(arg, true));
      console.log(`text? ${JSON.stringify(arg)} -> ${found ? 'OK' : 'MISSING'}`);
      if (!found) process.exitCode = 1;
    } else if (cmd === 'dump') {
      const seen = [...new Set(hierarchy().map((n) => n.text || n.desc).filter(Boolean))];
      console.log(`dump (${seen.length}): ${seen.join(' | ')}`);
    } else if (cmd === 'screenshot') {
      const png = adb(['exec-out', 'screencap', '-p']);
      const file = path.join(OUT, `${arg || 'shot'}.png`);
      fs.writeFileSync(file, png);
      console.log(`screenshot ${file}`);
    } else if (cmd === 'logcat-errors') {
      const log = adbText(['logcat', '-d']);
      const errs = log
        .split('\n')
        .filter((l) => /ReactNativeJS|FATAL|AndroidRuntime/.test(l) && /\bE\b|Error|Exception/.test(l));
      console.log(errs.length ? `ERRORS:\n${errs.slice(0, 25).join('\n')}` : 'no JS errors');
    } else if (cmd === 'sleep') {
      wait(Number(arg));
    } else {
      console.log(`unknown command: ${line}`);
    }
  } catch (err) {
    console.log(`${cmd} FAILED: ${err.message}`);
    process.exitCode = 1;
  }
}
