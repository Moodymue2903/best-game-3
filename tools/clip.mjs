// SKYFLOCK motion clip: record ~14s of LIVE gameplay at 1280x720 with
// Playwright's video recorder (webm), then convert to mp4 with ffmpeg.
// The clip shows the title, a real drag-to-roost, and a real crow zap —
// the motion (parallax, depth bands, shadows, squash, shake) that stills
// cannot show. Usage: node tools/clip.mjs [port]
// Output: clips/skyflock-motion.mp4 (and the intermediate .webm).
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync, renameSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/makefun/shot-tool/node_modules/playwright-core');

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.argv[2] || 8100);
const clipDir = join(repo, 'clips');
mkdirSync(clipDir, { recursive: true });

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
const read = (page) => page.evaluate(() => {
  const s = window.__skyflock;
  if (!s) return null;
  return {
    screen: s.screen, score: s.score, roosts: s.stats.roosts, zaps: s.stats.zaps,
    sparks: s.sparks, birds: s.birds.length,
    circling: s.birds.filter((b) => b.state === 'circling' || b.state === 'incoming').length,
    roosted: s.birds.filter((b) => b.state === 'roosted').length,
    crows: s.crows.length,
  };
});
const findPair = (page, sameColor) => page.evaluate((same) => {
  const s = window.__skyflock;
  const bird = s.birds.find((b) => (b.state === 'circling' || b.state === 'incoming')
    && s.perches.some((p) => p.birdId === null && (same ? p.color === b.color : p.color !== b.color)));
  if (!bird) return null;
  const perch = s.perches.find((p) => p.birdId === null && (same ? p.color === bird.color : p.color !== bird.color));
  return { bird: { x: bird.x, y: bird.y }, perch: { x: perch.x, y: perch.y } };
}, sameColor);

async function dragTo(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 20; i += 1) {
    await page.mouse.move(
      from.x + ((to.x - from.x) * i) / 20,
      from.y + ((to.y - from.y) * i) / 20,
      { steps: 1 },
    );
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
}

try {
  await waitForServer(`http://127.0.0.1:${port}/index.html`);
  const browser = await chromium.launch({
    args: ['--no-proxy-server'],
    env: { ...process.env, http_proxy: '', https_proxy: '', HTTP_PROXY: '', HTTPS_PROXY: '' },
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: clipDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 15000 });
  console.log('title:', JSON.stringify(await read(page)), `${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await page.waitForTimeout(1200);
  // Start the game.
  await page.mouse.click(640, 596);
  await page.waitForTimeout(500);
  // Wait for birds to circle, then drag one to its matching perch on camera.
  await page.waitForFunction(() => {
    const s = window.__skyflock;
    return s && s.birds.some((b) => b.state === 'circling');
  }, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const match = await findPair(page, true);
  if (match) {
    console.log('roost drag:', JSON.stringify(match));
    await dragTo(page, match.bird, match.perch);
    await page.waitForTimeout(800);
    console.log('after roost:', JSON.stringify(await read(page)));
  } else {
    console.log('no matching pair found for the clip — continuing');
  }
  // Spawn a crow and zap it on camera (flash + shake + burst).
  const crowSpawn = await page.evaluate(() => window.__skyflockSpawnCrow('swift'));
  if (crowSpawn) {
    await page.waitForTimeout(700);
    const livePos = await page.evaluate((id) => {
      const s = window.__skyflock;
      const c = s.crows.find((k) => k.id === id);
      return c ? { x: c.x, y: c.y } : null;
    }, crowSpawn.id);
    if (livePos) {
      await page.mouse.click(livePos.x, livePos.y);
      await page.waitForTimeout(600);
      console.log('after zap:', JSON.stringify(await read(page)));
    }
  }
  // Let the migration play out on camera for a few more seconds.
  await page.waitForTimeout(5000);
  console.log('final:', JSON.stringify(await read(page)), `total ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  const video = page.video();
  await context.close();
  await browser.close();
  const webmPath = await video.path();
  const webmOut = join(clipDir, 'skyflock-motion.webm');
  if (webmPath !== webmOut) renameSync(webmPath, webmOut);
  console.log('webm:', webmOut);
  // Convert to mp4 with ffmpeg.
  const mp4Out = join(clipDir, 'skyflock-motion.mp4');
  execSync(`ffmpeg -y -v error -i "${webmOut}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${mp4Out}"`);
  console.log('mp4:', mp4Out);
} finally {
  serve.kill();
}
console.log('console/page errors:', errors.length ? errors : 'none');
if (errors.length > 0) process.exit(1);
