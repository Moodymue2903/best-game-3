// SKYFLOCK screenshots: serve game/, open each ?shot= scene from
// shots.json in headless Chromium, and save it as a JPEG in screenshots/.
// Usage: node tools/shots.mjs [port]
// Chromium is launched with --no-proxy-server so the VM's egress proxy
// never touches the loopback page (the game makes no network requests).
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/makefun/shot-tool/node_modules/playwright-core');

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.argv[2] || 8098);
const shots = JSON.parse(readFileSync(join(repo, 'shots.json'), 'utf8'));

const serve = spawn(process.execPath, [join(repo, 'serve.ts'), '--port', String(port)], {
  cwd: repo, stdio: ['ignore', 'pipe', 'pipe'],
});
let serveLog = '';
serve.stdout.on('data', (d) => { serveLog += d; });
serve.stderr.on('data', (d) => { serveLog += d; });

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolveOk, reject) => {
    (function probe() {
      fetch(url).then((r) => { if (r.ok) resolveOk(); else retry(); }).catch(retry);
      function retry() {
        if (Date.now() - start > timeoutMs) reject(new Error('server did not start: ' + serveLog));
        else setTimeout(probe, 200);
      }
    })();
  });
}

const errors = [];
const results = [];
try {
  await waitForServer(`http://127.0.0.1:${port}/index.html`);
  const browser = await chromium.launch({
    args: ['--no-proxy-server'],
    env: { ...process.env, http_proxy: '', https_proxy: '', HTTP_PROXY: '', HTTPS_PROXY: '' },
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  for (const shot of shots) {
    const url = `http://127.0.0.1:${port}/index.html${shot.query}`;
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    await page.waitForTimeout(600);
    const info = await page.evaluate(() => {
      const s = window.__skyflock;
      return s ? {
        screen: s.screen, wave: s.wave, score: s.score,
        birds: s.birds.length, crows: s.crows.length,
        roosts: s.stats.roosts, relics: s.relics.length,
      } : null;
    });
    const out = join(repo, 'screenshots', shot.name);
    await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
    const bytes = statSync(out).size;
    results.push({ name: shot.name, bytes, ...info });
    console.log(`${shot.name}: ${bytes} bytes,`, JSON.stringify(info));
  }
  await browser.close();
} finally {
  serve.kill();
}
console.log('console/page errors:', errors.length ? errors : 'none');
const over = results.filter((r) => r.bytes > 262144);
if (over.length > 0) {
  console.error('OVER 256 KiB:', over.map((r) => r.name).join(', '));
  process.exit(1);
}
if (errors.length > 0) process.exit(1);
