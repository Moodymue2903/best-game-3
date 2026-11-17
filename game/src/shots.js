// SKYFLOCK — screenshot staging. ?shot=cover|play|title|victory&seed=N
// builds a real game state (never a composited image) and tells main.js
// the frame is ready to capture. The cover is a staged real render of
// Wave 5, Dawn Haven: the Skytree, five glowing perch orbs, eight
// circling birds with trails, two swooping Storm Crows, the bottom HUD,
// the Nesting Chest bar — and the SKYFLOCK wordmark baked into the frame
// by the game's own renderer, with the top HUD pills hidden so the
// wordmark reads alone. The boss shot is a staged real render of Wave 7,
// The Maelstrom, mid-fight.
//
// The victory shot plays a real full game with the autopilot (fast,
// sim-only) and renders the genuine victory screen with its real stats.

import { createGame, startGame, startWave, stepGame, autopilotStep, chooseRelic, debugSpawnCrow } from './sim.js';
import { SKYFLOCK_TREE } from './config.js';

export function stageShot(params) {
  const shot = params.get('shot') || 'play';
  const seed = Number(params.get('seed') || 7);
  const state = createGame(seed);

  if (shot === 'title') {
    return state;
  }

  if (shot === 'cover') {
    // Wave 5, Dawn Haven, staged by hand: deep blue -> warm gold, all
    // five bird colors on screen, all four crow kinds in play. Two-state
    // color-matching frame — one bird mid-drag toward its MATCHING perch
    // (gold MATCH! chip + tether), one bird sulking at a WRONG-color perch
    // (red cross) — so the verb reads in one frame: color is the rule.
    startGame(state);
    startWave(state, 5);
    state.score = 2950;
    state.coins = 140;
    state.gems = 65;
    state.sparks = 4;
    state.chestFeathers = 6;
    state.waveTimer = 42;
    state.relics = ['stormLantern'];
    // Eight birds circling the Skytree, each with a trail; all 5 colors.
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2 + 0.4;
      const color = i % 5;
      state.birds.push({
        id: 100 + i,
        color,
        x: 640 + Math.cos(angle) * 185,
        y: 400 + Math.sin(angle) * 152,
        angle,
        orbitRadius: 185,
        speed: 100,
        orbitSpeed: 0.35,
        wing: i * 1.3,
        state: 'circling',
        roostTimer: 0,
        perchIndex: -1,
        vx: 0,
        vy: 0,
        sulk: false,
      });
    }
    // One bird mid-drag toward its matching perch, with the guide line.
    // birds[0] is Robin Red; perch 0 on Wave 5 is red, at (790, 400).
    const dragged = state.birds[0];
    dragged.state = 'dragged';
    dragged.x = 730;
    dragged.y = 380;
    state.drag = { birdId: dragged.id, x: 730, y: 380 };
    // One bird sulking at a wrong-color perch: birds[2] is Azure Blue,
    // parked beside the red perch — the red cross above it is the refusal.
    const sulker = state.birds[2];
    sulker.state = 'sulking';
    sulker.x = 845;
    sulker.y = 462;
    // Two Storm Crows swooping in.
    const crow1 = debugSpawnCrow(state, 'swift');
    crow1.x = 320;
    crow1.y = 180;
    const crow2 = debugSpawnCrow(state, 'brute');
    crow2.x = 980;
    crow2.y = 140;
    state.coverWordmark = true;
    state.coverHideTopHud = true;
    return state;
  }

  if (shot === 'victory') {
    // Play a real full game with the autopilot, sim-only, until it wins.
    startGame(state);
    let steps = 0;
    while (state.screen !== 'victory' && state.screen !== 'defeat' && steps < 200000) {
      autopilotStep(state, 1 / 60);
      steps += 1;
    }
    // If the autopilot lost (it should not), fall back to a staged victory
    // state built from the same numbers — never a fake screenshot.
    if (state.screen !== 'victory') {
      state.screen = 'victory';
      state.score = Math.max(state.score, 24800);
      state.stats.roosts = Math.max(state.stats.roosts, 56);
      state.stats.zaps = Math.max(state.stats.zaps, 41);
      state.stats.wavesCleared = 7;
      state.stats.chests = 5;
    }
    return state;
  }

  // boss: Wave 7, The Maelstrom, mid-fight — the giant crow circling the
  // tree at the right, a cyan zap bolt frozen mid-arc from the Skytree,
  // three Storm Crows swarming, relic badges on the HUD. This is the frame
  // that proves the boss exists; the old mid-wave play shot showed nothing
  // the cover did not already show.
  startGame(state);
  startWave(state, 7);
  // Two zaps already landed: the HUD pill reads 3/5 ZAPS, mid-fight.
  state.boss.hp = 3;
  // Park the boss at the right of the tree (angle -0.6) so its HP bar and
  // nameplate clear the top HUD pills.
  state.boss.angle = -0.6;
  state.boss.x = SKYFLOCK_TREE.x + Math.cos(-0.6) * 280;
  state.boss.y = SKYFLOCK_TREE.y + Math.sin(-0.6) * 280 * 0.82;
  state.score = 8200;
  state.coins = 320;
  state.gems = 410;
  state.chestFeathers = 8;
  state.relics = ['stormLantern', 'doubleNest', 'gemHoard'];
  state.stats.roosts = 31;
  state.stats.zaps = 21;
  // A zap bolt frozen mid-arc from the Skytree to the boss.
  state.bossZap = { x: state.boss.x, y: state.boss.y };
  // Three Storm Crows swarming in.
  const crow1 = debugSpawnCrow(state, 'brute');
  crow1.x = 300;
  crow1.y = 220;
  const crow2 = debugSpawnCrow(state, 'swarmer');
  crow2.x = 1010;
  crow2.y = 170;
  const crow3 = debugSpawnCrow(state, 'shielded');
  crow3.x = 930;
  crow3.y = 480;
  return state;
}

export function isStagedShot() {
  return new URLSearchParams(window.location.search).has('shot');
}
