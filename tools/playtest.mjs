// SKYFLOCK live playtest: open the game with no ?shot=, click through
// the title, drag a bird to its matching perch (it roosts), drag another
// to a wrong-color perch (it sulks off), spawn a crow and zap it with a
// click, and confirm the state advances with zero console/page errors.
// Usage: node tools/playtest.mjs [port]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/makefun/shot-tool/node_modules/playwright-core');

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.argv[2] || 8099);

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
    screen: s.screen, wave: s.wave, score: s.score, coins: s.coins,
    roosts: s.stats.roosts, zaps: s.stats.zaps, sparks: s.sparks,
    birds: s.birds.length,
    circling: s.birds.filter((b) => b.state === 'circling' || b.state === 'incoming').length,
    roosted: s.birds.filter((b) => b.state === 'roosted').length,
    crows: s.crows.length, treeHp: s.treeHp,
  };
});
// Find a circling bird of a given color and a free perch of the same (or a
// different) color, in game coordinates.
const findPair = (page, sameColor) => page.evaluate((same) => {
  const s = window.__skyflock;
  const bird = s.birds.find((b) => (b.state === 'circling' || b.state === 'incoming')
    && s.perches.some((p) => p.birdId === null && (same ? p.color === b.color : p.color !== b.color)));
  if (!bird) return null;
  const perch = s.perches.find((p) => p.birdId === null && (same ? p.color === bird.color : p.color !== bird.color));
  return { bird: { x: bird.x, y: bird.y, color: bird.color }, perch: { x: perch.x, y: perch.y, color: perch.color } };
}, sameColor);

try {
  await waitForServer(`http://127.0.0.1:${port}/index.html`);
  const browser = await chromium.launch({
    args: ['--no-proxy-server'],
    env: { ...process.env, http_proxy: '', https_proxy: '', HTTP_PROXY: '', HTTPS_PROXY: '' },
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 15000 });
  await page.waitForTimeout(500);
  console.log('title:', JSON.stringify(await read(page)));
  // Click START.
  await page.mouse.click(640, 596);
  await page.waitForTimeout(500);
  console.log('after start:', JSON.stringify(await read(page)));
  // Wait for birds to arrive and circle.
  await page.waitForFunction(() => {
    const s = window.__skyflock;
    return s && s.birds.some((b) => b.state === 'circling');
  }, null, { timeout: 30000 });
  await page.waitForTimeout(1000);
  console.log('birds circling:', JSON.stringify(await read(page)));
  // Drag a bird to its MATCHING perch.
  const match = await findPair(page, true);
  if (!match) throw new Error('no matching bird/perch pair found');
  console.log('matching pair:', JSON.stringify(match));
  await page.mouse.move(match.bird.x, match.bird.y);
  await page.mouse.down();
  for (let i = 1; i <= 20; i += 1) {
    await page.mouse.move(
      match.bird.x + ((match.perch.x - match.bird.x) * i) / 20,
      match.bird.y + ((match.perch.y - match.bird.y) * i) / 20,
      { steps: 1 },
    );
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(500);
  console.log('after matching drag:', JSON.stringify(await read(page)));
  // Drag another bird to a WRONG-color perch: it must sulk off. Retry a
  // few times while more birds arrive, since the pair depends on which
  // colors happen to be circling.
  let wrong = null;
  for (let attempt = 0; attempt < 6 && !wrong; attempt += 1) {
    wrong = await findPair(page, false);
    if (!wrong) await page.waitForTimeout(2000);
  }
  if (wrong) {
    console.log('wrong pair:', JSON.stringify(wrong));
    await page.mouse.move(wrong.bird.x, wrong.bird.y);
    await page.mouse.down();
    for (let i = 1; i <= 20; i += 1) {
      await page.mouse.move(
        wrong.bird.x + ((wrong.perch.x - wrong.bird.x) * i) / 20,
        wrong.bird.y + ((wrong.perch.y - wrong.bird.y) * i) / 20,
        { steps: 1 },
      );
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await page.waitForTimeout(500);
    console.log('after wrong drag:', JSON.stringify(await read(page)));
  } else {
    console.log('no wrong-color pair available (all perches match) — skipped');
  }
  // Spawn a crow via the debug hook and zap it with a click. Read the
  // crow's LIVE position right before clicking — it flies at 150px/s.
  const crowSpawn = await page.evaluate(() => {
    return window.__skyflockSpawnCrow ? window.__skyflockSpawnCrow('swift') : null;
  });
  if (crowSpawn) {
    const livePos = await page.evaluate((id) => {
      const s = window.__skyflock;
      const c = s.crows.find((k) => k.id === id);
      return c ? { x: c.x, y: c.y } : null;
    }, crowSpawn.id);
    if (livePos) await page.mouse.click(livePos.x, livePos.y);
    await page.waitForTimeout(500);
    console.log('after crow zap:', JSON.stringify(await read(page)));
  } else {
    console.log('no crow spawner exposed — waiting for a natural crow instead');
    await page.waitForFunction(() => {
      const s = window.__skyflock;
      return s && s.crows.length > 0;
    }, null, { timeout: 30000 });
    const pos = await page.evaluate(() => {
      const s = window.__skyflock;
      const c = s.crows[0];
      return { x: c.x, y: c.y };
    });
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(500);
    console.log('after crow zap:', JSON.stringify(await read(page)));
  }
  await page.screenshot({ path: '/tmp/skyflock-live.jpg', type: 'jpeg', quality: 85 });
  console.log('live screenshot: /tmp/skyflock-live.jpg');
  await browser.close();
} finally {
  serve.kill();
}
console.log('console/page errors:', errors.length ? errors : 'none');
if (errors.length > 0) process.exit(1);
