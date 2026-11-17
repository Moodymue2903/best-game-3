// SKYFLOCK autopilot — Node tests on the same sim the browser runs.
// Run: node tests/autopilot.mjs
// 1. Determinism: the same seed, played twice by the autopilot, must be
//    IDENTICAL on every reported number.
// 2. Winnability: the perfect Skywarden wins the whole game (seed 1).
// 3. Losability: the lazy Skywarden (never zaps, roosts one bird per 8s)
//    loses the game (seed 7).
import { createGame, autopilotStep, lazyAutopilotStep, snapshot } from '../game/src/sim.js';

const DT = 1 / 60;

function playFull(seed, stepFn, maxSteps = 300000) {
  const state = createGame(seed);
  const memory = { timer: 0 };
  let steps = 0;
  while (state.screen !== 'victory' && state.screen !== 'defeat' && steps < maxSteps) {
    stepFn(state, DT, memory);
    steps += 1;
  }
  return { state, steps };
}

function summarize(label, result) {
  const s = result.state;
  console.log(
    `${label}: screen=${s.screen} wave=${s.wave} score=${s.score} coins=${s.coins} ` +
    `gems=${s.gems} treeHp=${s.treeHp}/${s.treeMaxHp} roosts=${s.stats.roosts} ` +
    `zaps=${s.stats.zaps} scattered=${s.stats.scattered} wavesCleared=${s.stats.wavesCleared} ` +
    `chests=${s.stats.chests} relics=${s.relics.join(',')} steps=${result.steps} ` +
    `time=${Math.round(s.time)}s defeat=${s.defeatReason || '-'}`,
  );
  return s;
}

// --- 1. Determinism: wave-1 invariant, seed 1, run twice. ---------------
function determinismCheck() {
  const run = () => {
    const state = createGame(1);
    let steps = 0;
    while (state.screen === 'title' || (state.screen === 'playing' && state.wave === 1)) {
      autopilotStep(state, DT);
      steps += 1;
      if (steps > 60000) break;
    }
    return snapshot(state);
  };
  const a = run();
  const b = run();
  const same = JSON.stringify(a) === JSON.stringify(b);
  console.log('determinism: identical =', same);
  if (!same) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
        console.log('  diff', k, JSON.stringify(a[k]), 'vs', JSON.stringify(b[k]));
      }
    }
    process.exit(1);
  }
  console.log('  wave-1 snapshot:', JSON.stringify({
    screen: a.screen, wave: a.wave, score: a.score, roosts: a.stats.roosts,
    zaps: a.stats.zaps, birds: a.birds.length, steps: a.time,
  }));
}

determinismCheck();

// --- 2. Full-game win, seed 1. --------------------------------------------
const win = playFull(1, (s, dt) => autopilotStep(s, dt));
summarize('WIN seed 1', win);
if (win.state.screen !== 'victory') {
  console.error('FAIL: perfect autopilot did not win seed 1');
  process.exit(1);
}

// --- 3. Full-game loss, seed 7 (lazy Skywarden). --------------------------
const loss = playFull(7, (s, dt, m) => lazyAutopilotStep(s, dt, m));
summarize('LOSS seed 7', loss);
if (loss.state.screen !== 'defeat') {
  console.error('FAIL: lazy autopilot did not lose seed 7');
  process.exit(1);
}

console.log('autopilot: all checks passed');
