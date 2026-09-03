#!/usr/bin/env node
/**
 * Minimal CDP driver — stands in for `chromium-cli`, which isn't available here.
 * Reads a newline-separated command script on stdin and drives a headless
 * Chrome over the DevTools Protocol.
 *
 * Commands:
 *   nav <url>                 navigate and wait for load
 *   wait-for <text>           poll until visible text appears (10s budget)
 *   click-text <text>         real mouse click at the centre of the deepest node
 *                             whose trimmed text equals <text>
 *   click-testid <id>         same, matched on data-testid
 *   scroll-x <text> <dx>      horizontal wheel over the element holding <text>
 *   screenshot <name>         full-viewport png into the session dir
 *   eval <js>                 evaluate and print the result
 *   console-errors            print console errors collected so far
 *   sleep <ms>
 */
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.CDP_PORT || 9222;
const OUT = process.env.SHOT_DIR || path.join(process.cwd(), 'shots');
fs.mkdirSync(OUT, { recursive: true });

const get = (p) =>
  new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port: PORT, path: p }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve(JSON.parse(body)));
      })
      .on('error', reject);
  });

const FIND_FN = `(function(needle, byTestId){
  const nodes = Array.from(document.querySelectorAll('*'));
  let best = null;
  for (const el of nodes) {
    const hit = byTestId
      ? el.getAttribute('data-testid') === needle
      : (el.textContent || '').trim() === needle;
    if (!hit) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // deepest match wins: later elements in document order are more nested
    if (!best || el.contains(best.el) === false) best = { el, r };
  }
  if (!best) return null;
  return { x: best.r.left + best.r.width / 2, y: best.r.top + best.r.height / 2,
           w: best.r.width, h: best.r.height };
})`;

async function main() {
  const script = fs.readFileSync(0, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
  const targets = await get('/json/list');
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  const consoleErrors = [];

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      return;
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.text + ' ' +
        (msg.params.exceptionDetails.exception?.description || ''));
    }
  });

  await new Promise((r) => ws.once('open', r));
  await send('Page.enable');
  await send('Runtime.enable');

  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  const locate = async (needle, byTestId) =>
    evaluate(`${FIND_FN}(${JSON.stringify(needle)}, ${Boolean(byTestId)})`);

  const clickAt = async (x, y) => {
    for (const type of ['mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    }
  };

  for (const line of script) {
    const [cmd, ...rest] = line.split(' ');
    const arg = rest.join(' ');
    try {
      if (cmd === 'nav') {
        await send('Page.navigate', { url: arg });
        await new Promise((r) => setTimeout(r, 1500));
        console.log(`nav ${arg}`);
      } else if (cmd === 'wait-for') {
        const deadline = Date.now() + 10000;
        let found = false;
        while (Date.now() < deadline) {
          found = await evaluate(`document.body && document.body.innerText.includes(${JSON.stringify(arg)})`);
          if (found) break;
          await new Promise((r) => setTimeout(r, 250));
        }
        console.log(`wait-for ${JSON.stringify(arg)} -> ${found ? 'OK' : 'TIMEOUT'}`);
        if (!found) process.exitCode = 1;
      } else if (cmd === 'click-text' || cmd === 'click-testid') {
        const byTestId = cmd === 'click-testid';
        // Scroll the match into view first: CDP dispatches at viewport
        // coordinates, so an off-screen element would get a stray click.
        await evaluate(`(function(){
          const m = ${FIND_FN}(${JSON.stringify(arg)}, ${byTestId});
          if (!m) return false;
          const nodes = Array.from(document.querySelectorAll('*'));
          for (const el of nodes) {
            const hit = ${byTestId}
              ? el.getAttribute('data-testid') === ${JSON.stringify(arg)}
              : (el.textContent || '').trim() === ${JSON.stringify(arg)};
            if (hit) { el.scrollIntoView({block:'center'}); return true; }
          }
          return false;
        })()`);
        await new Promise((r) => setTimeout(r, 400));
        const box = await locate(arg, byTestId);
        if (!box) {
          console.log(`${cmd} ${JSON.stringify(arg)} -> NOT FOUND`);
          process.exitCode = 1;
        } else {
          await clickAt(box.x, box.y);
          await new Promise((r) => setTimeout(r, 600));
          console.log(`${cmd} ${JSON.stringify(arg)} -> clicked at ${Math.round(box.x)},${Math.round(box.y)}`);
        }
      } else if (cmd === 'scroll-x') {
        const parts = arg.split(' ');
        const dx = Number(parts.pop());
        const box = await locate(parts.join(' '), false);
        if (!box) {
          console.log(`scroll-x -> NOT FOUND`);
          process.exitCode = 1;
        } else {
          await send('Input.dispatchMouseEvent', {
            type: 'mouseWheel', x: box.x, y: box.y, deltaX: dx, deltaY: 0,
          });
          await new Promise((r) => setTimeout(r, 500));
          console.log(`scroll-x ${dx} over ${JSON.stringify(parts.join(' '))}`);
        }
      } else if (cmd === 'screenshot') {
        const { data } = await send('Page.captureScreenshot', { format: 'png' });
        const file = path.join(OUT, `${arg || 'shot'}.png`);
        fs.writeFileSync(file, Buffer.from(data, 'base64'));
        console.log(`screenshot ${file}`);
      } else if (cmd === 'eval') {
        console.log(`eval -> ${JSON.stringify(await evaluate(arg))}`);
      } else if (cmd === 'console-errors') {
        console.log(consoleErrors.length ? `ERRORS:\n${consoleErrors.join('\n')}` : 'no console errors');
      } else if (cmd === 'sleep') {
        await new Promise((r) => setTimeout(r, Number(arg)));
      } else {
        console.log(`unknown command: ${line}`);
      }
    } catch (err) {
      console.log(`${cmd} FAILED: ${err.message}`);
      process.exitCode = 1;
    }
  }
  ws.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
