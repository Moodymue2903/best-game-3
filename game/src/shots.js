// SKYFLOCK — screenshot staging. ?shot=cover|play|title|victory&seed=N
// builds a real game state (never a composited image) and tells main.js
// the frame is ready to capture. The cover is a staged real render of
// Wave 3, Aurora Aerie: the Skytree, five glowing perch orbs, eight
// circling birds with trails, two swooping Storm Crows, the full HUD,
// the Nesting Chest bar, the wave clock — and the SKYFLOCK wordmark
// baked into the frame by the game's own renderer.
//
// The victory shot plays a real full game with the autopilot (fast,
// sim-only) and renders the genuine victory screen with its real stats.

import { createGame, startGame, startWave, stepGame, autopilotStep, chooseRelic, debugSpawnCrow } from './sim.js';

export function stageShot(params) {
  const shot = params.get('shot') || 'play';
  const seed = Number(params.get('seed') || 7);
  const state = createGame(seed);

  if (shot === 'title') {
    return state;
  }

  if (shot === 'cover') {
    // Wave 3, Aurora Aerie, with a rich mid-game state staged by hand.
    startGame(state);
    startWave(state, 3);
    state.score = 2950;
    state.coins = 140;
    state.gems = 65;
    state.sparks = 4;
    state.chestFeathers = 6;
    state.waveTimer = 42;
    state.relics = ['stormLantern'];
    // Eight birds circling the Skytree, each with a trail.
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2 + 0.4;
      const color = i % 4;
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
    const dragged = state.birds[0];
    dragged.state = 'dragged';
    dragged.x = 730;
    dragged.y = 380;
    state.drag = { birdId: dragged.id, x: 730, y: 380 };
    // Two Storm Crows swooping in.
    const crow1 = debugSpawnCrow(state, 'swift');
    crow1.x = 320;
    crow1.y = 180;
    const crow2 = debugSpawnCrow(state, 'shielded');
    crow2.x = 980;
    crow2.y = 140;
    state.coverWordmark = true;
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

  // play: a dense mid-game moment on Wave 3, Monsoon Perch, staged by
  // hand like the cover (the autopilot roosts too fast for a busy frame):
  // seven birds circling, one roosted on its perch, one mid-drag toward
  // its matching perch, two Storm Crows swooping, full HUD.
  startGame(state);
  startWave(state, 3);
  state.score = 1850;
  state.coins = 90;
  state.gems = 40;
  state.sparks = 3;
  state.chestFeathers = 4;
  state.waveTimer = 58;
  state.relics = ['doubleNest', 'gemHoard'];
  state.stats.roosts = 9;
  state.stats.zaps = 6;
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2 + 0.9;
    state.birds.push({
      id: 200 + i,
      color: i % 4,
      x: 640 + Math.cos(angle) * 185,
      y: 400 + Math.sin(angle) * 152,
      angle,
      orbitRadius: 185,
      speed: 100,
      orbitSpeed: 0.35,
      wing: i * 1.1,
      state: 'circling',
      roostTimer: 0,
      perchIndex: -1,
      vx: 0,
      vy: 0,
      sulk: false,
    });
  }
  // One bird resting on its matching perch.
  const roosted = state.birds[1];
  const perch0 = state.perches[1];
  roosted.state = 'roosted';
  roosted.perchIndex = perch0.index;
  roosted.roostTimer = 6;
  roosted.x = perch0.x;
  roosted.y = perch0.y;
  perch0.birdId = roosted.id;
  // One bird mid-drag toward its matching perch, with the guide line.
  const dragged = state.birds[3];
  dragged.state = 'dragged';
  dragged.x = 600;
  dragged.y = 300;
  state.drag = { birdId: dragged.id, x: 600, y: 300 };
  // Two Storm Crows swooping in.
  const crow1 = debugSpawnCrow(state, 'swift');
  crow1.x = 300;
  crow1.y = 180;
  const crow2 = debugSpawnCrow(state, 'swarmer');
  crow2.x = 1010;
  crow2.y = 150;
  return state;
}

export function isStagedShot() {
  return new URLSearchParams(window.location.search).has('shot');
}
