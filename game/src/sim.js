// SKYFLOCK — the simulation. Pure logic: no canvas, no DOM, no Date, no
// Math.random. Every roll comes from the seeded RNG, so the same seed and
// the same inputs always produce the same game — the browser and the Node
// autopilot run this exact file.
//
// The loop: birds migrate in from the edges and circle the Skytree. The
// Skywarden drags a bird to a perch of its own color to roost it. Storm
// Crows dive in to scatter unroosted birds; click one to zap it with a
// Spark. Roost 8 birds and the wave clears; clear wave 7's boss and the
// sanctuary is saved.

import { makeRng } from './random.js';
import {
  SKYFLOCK_BIRD_TYPES,
  SKYFLOCK_CROW_TYPES,
  SKYFLOCK_ISLANDS,
  SKYFLOCK_RELICS,
  SKYFLOCK_RULES,
  SKYFLOCK_TREE,
  SKYFLOCK_ORBIT_RADIUS,
  SKYFLOCK_PERCH_RADIUS,
} from './config.js';

const TAU = Math.PI * 2;
const R = SKYFLOCK_RULES;

function crowDef(key) {
  return SKYFLOCK_CROW_TYPES.find((c) => c.key === key);
}

export function createGame(seed) {
  return {
    seed,
    rng: makeRng(seed),
    screen: 'title', // title | playing | relic | victory | defeat
    time: 0,
    wave: 1,
    score: 0,
    coins: 0,
    gems: 0,
    treeHp: R.treeHpStart,
    treeMaxHp: R.treeHpStart,
    sparks: R.sparksMax,
    sparkTimer: 0,
    lanternTimer: 0,
    roostsInWave: 0,
    scatteredInWave: 0,
    crowdTimer: 0,
    chestFeathers: 0,
    waveTimer: 0,
    spawnTimer: 0,
    crowTimer: 0,
    birdsSpawned: 0,
    birds: [],
    crows: [],
    perches: [],
    boss: null,
    relics: [],
    relicChoices: [],
    drag: null, // { birdId, x, y }
    defeatReason: '',
    stats: { roosts: 0, zaps: 0, scattered: 0, wavesCleared: 0, chests: 0 },
    events: [], // drained by the renderer/audio each frame
    nextBirdId: 1,
    nextCrowId: 1,
    coverWordmark: false, // staging only: bake the title into the cover frame
  };
}

function island(state) {
  return SKYFLOCK_ISLANDS[state.wave - 1];
}

function hasRelic(state, id) {
  return state.relics.includes(id);
}

function perchColors(state) {
  const colors = island(state).colors.slice();
  if (hasRelic(state, 'sixthPerch')) colors.push(colors[0]);
  return colors;
}

export function startGame(state) {
  state.screen = 'playing';
  state.wave = 1;
  state.score = 0;
  state.coins = 0;
  state.gems = 0;
  state.treeHp = R.treeHpStart;
  state.treeMaxHp = R.treeHpStart;
  state.sparks = R.sparksMax;
  state.relics = [];
  state.stats = { roosts: 0, zaps: 0, scattered: 0, wavesCleared: 0, chests: 0 };
  startWave(state, 1);
}

export function layoutPerches(state) {
  const orbitAngle = state.time * 0.06;
  for (const p of state.perches) {
    const a = p.angle + orbitAngle;
    p.x = SKYFLOCK_TREE.x + Math.cos(a) * SKYFLOCK_PERCH_RADIUS;
    p.y = SKYFLOCK_TREE.y + Math.sin(a) * SKYFLOCK_PERCH_RADIUS * 0.82;
  }
}

export function startWave(state, wave) {
  const isl = SKYFLOCK_ISLANDS[wave - 1];
  state.wave = wave;
  state.screen = 'playing';
  state.waveTimer = isl.duration;
  state.spawnTimer = 0.5;
  state.crowTimer = isl.crowEvery * 0.6;
  state.roostsInWave = 0;
  state.scatteredInWave = 0;
  state.crowdTimer = 0;
  state.birdsSpawned = 0;
  state.birds = [];
  state.crows = [];
  state.drag = null;
  state.boss = null;
  const colors = perchColors(state);
  state.perches = colors.map((color, i) => ({
    index: i,
    color,
    birdId: null,
    angle: (i / colors.length) * TAU,
  }));
  layoutPerches(state);
  if (wave === 7) {
    // The Skywarden gathers stormlight before the boss: full Sparks.
    state.sparks = R.sparksMax;
    state.boss = {
      id: 'maelstrom',
      hp: R.bossHp,
      maxHp: R.bossHp,
      angle: -Math.PI / 2,
      x: SKYFLOCK_TREE.x,
      y: SKYFLOCK_TREE.y - 280,
      state: 'circle', // circle | dive | return
      diveTimer: 7,
      targetBirdId: null,
      wing: 0,
    };
    // The boss wave opens with 8 birds already circling the tree.
    for (let i = 0; i < 8; i += 1) spawnBird(state, true);
  }
}

function spawnBird(state, onOrbit) {
  const isl = island(state);
  const color = state.rng.pick(isl.colors);
  const edge = state.rng.int(0, 3);
  let x;
  let y;
  if (edge === 0) { x = state.rng.range(60, 1220); y = -30; }
  else if (edge === 1) { x = state.rng.range(60, 1220); y = 750; }
  else if (edge === 2) { x = -30; y = state.rng.range(80, 640); }
  else { x = 1310; y = state.rng.range(80, 640); }
  const angle = state.rng.range(0, TAU);
  const bird = {
    id: state.nextBirdId,
    color,
    x,
    y,
    angle,
    orbitRadius: SKYFLOCK_ORBIT_RADIUS + state.rng.range(-14, 14),
    speed: state.rng.range(85, 115),
    orbitSpeed: state.rng.range(0.28, 0.42) * (state.rng.chance(0.5) ? 1 : -1),
    wing: state.rng.range(0, TAU),
    state: onOrbit ? 'circling' : 'incoming',
    roostTimer: 0,
    perchIndex: -1,
    vx: 0,
    vy: 0,
    sulk: false,
  };
  state.nextBirdId += 1;
  state.birdsSpawned += 1;
  if (onOrbit) {
    bird.x = SKYFLOCK_TREE.x + Math.cos(angle) * bird.orbitRadius;
    bird.y = SKYFLOCK_TREE.y + Math.sin(angle) * bird.orbitRadius * 0.82;
  }
  state.birds.push(bird);
  return bird;
}

function spawnCrow(state, kind) {
  const def = crowDef(kind);
  const x = state.rng.range(120, 1160);
  const crow = {
    id: state.nextCrowId,
    kind,
    hp: def.hp,
    maxHp: def.hp,
    speed: def.speed * (hasRelic(state, 'slowGale') ? 0.6 : 1),
    radius: def.radius,
    scatter: def.scatter,
    x,
    y: -30,
    state: 'approach',
    targetBirdId: null,
    wing: state.rng.range(0, TAU),
  };
  state.nextCrowId += 1;
  state.crows.push(crow);
  return crow;
}

// Debug/shot hook: the playtest and the screenshot stager call this to put
// a crow on screen without waiting for the spawn timer.
export function debugSpawnCrow(state, kind) {
  return spawnCrow(state, kind || 'swift');
}

function nearestBird(state, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const b of state.birds) {
    if (b.state !== 'incoming' && b.state !== 'circling') continue;
    const d = (b.x - x) ** 2 + (b.y - y) ** 2;
    if (d < bestD) { bestD = d; best = b; }
  }
  return best;
}

function scatterBird(state, bird) {
  bird.state = 'scattered';
  const dx = bird.x - SKYFLOCK_TREE.x;
  const dy = bird.y - SKYFLOCK_TREE.y;
  const len = Math.hypot(dx, dy) || 1;
  bird.vx = (dx / len) * 420;
  bird.vy = (dy / len) * 420 - 120;
  state.scatteredInWave += 1;
  state.stats.scattered += 1;
  state.events.push({ type: 'scatter', x: bird.x, y: bird.y, color: bird.color });
  if (state.scatteredInWave >= R.scatterLimit) endGame(state, 'defeat', 'scattered');
}

function roostBird(state, bird, perch) {
  bird.state = 'roosted';
  bird.perchIndex = perch.index;
  bird.roostTimer = R.roostSeconds;
  perch.birdId = bird.id;
  const count = hasRelic(state, 'doubleNest') ? 2 : 1;
  state.roostsInWave += count;
  state.stats.roosts += 1;
  state.score += R.roostScore + (hasRelic(state, 'goldenBeak') ? 50 : 0);
  state.coins += R.roostCoins * (hasRelic(state, 'goldenBeak') ? 2 : 1);
  if (hasRelic(state, 'gemHoard')) state.gems += 15;
  state.chestFeathers += 1;
  state.events.push({ type: 'roost', x: bird.x, y: bird.y, color: bird.color });
  if (state.chestFeathers >= R.chestFeathers) {
    state.chestFeathers = 0;
    state.gems += 50;
    state.score += R.chestScore;
    state.stats.chests += 1;
    state.events.push({ type: 'chest', x: SKYFLOCK_TREE.x, y: SKYFLOCK_TREE.y });
  }
  if (state.wave < 7 && state.roostsInWave >= R.roostsToClear) clearWave(state);
}

function clearWave(state) {
  state.stats.wavesCleared += 1;
  state.score += R.waveClearScore;
  state.events.push({ type: 'waveClear', wave: state.wave });
  // Unroosted birds fly on; the next island's migration arrives fresh.
  for (const b of state.birds) {
    if (b.state === 'incoming' || b.state === 'circling') {
      b.state = 'leaving';
      b.vx = (b.x - SKYFLOCK_TREE.x) * 0.6;
      b.vy = -160;
    }
  }
  state.crows = [];
  state.boss = null;
  state.drag = null;
  // Draft 3 relics from the pool the Skywarden does not own yet.
  const pool = SKYFLOCK_RELICS.filter((r) => !hasRelic(state, r.id));
  state.relicChoices = [];
  while (state.relicChoices.length < 3 && pool.length > 0) {
    const i = state.rng.int(0, pool.length - 1);
    state.relicChoices.push(pool.splice(i, 1)[0]);
  }
  state.screen = 'relic';
}

export function chooseRelic(state, index) {
  if (state.screen !== 'relic') return;
  const relic = state.relicChoices[index];
  if (!relic) return;
  state.relics.push(relic.id);
  if (relic.id === 'featherShield') {
    state.treeMaxHp += 3;
    state.treeHp = Math.min(state.treeMaxHp, state.treeHp + 3);
  }
  state.events.push({ type: 'relic', name: relic.name });
  startWave(state, state.wave + 1);
}

function endGame(state, screen, reason) {
  if (state.screen === 'victory' || state.screen === 'defeat') return;
  state.screen = screen;
  state.defeatReason = reason || '';
  state.drag = null;
  if (screen === 'victory') {
    state.score += R.victoryScore;
    state.events.push({ type: 'victory' });
  } else {
    state.events.push({ type: 'defeat', reason: state.defeatReason });
  }
}

function failWave(state) {
  state.treeHp -= 2;
  state.events.push({ type: 'waveFail', wave: state.wave });
  for (const b of state.birds) {
    if (b.state === 'incoming' || b.state === 'circling') {
      b.state = 'leaving';
      b.vx = (b.x - SKYFLOCK_TREE.x) * 0.6;
      b.vy = -160;
    }
  }
  state.crows = [];
  state.drag = null;
  if (state.treeHp <= 0) {
    endGame(state, 'defeat', 'tree');
    return;
  }
  if (state.wave >= 7) return;
  startWave(state, state.wave + 1);
}

// --- Pointer actions: the input layer calls these, the autopilot too. ----

export function startDrag(state, x, y) {
  if (state.screen !== 'playing') return null;
  let best = null;
  let bestD = 34 * 34;
  for (const b of state.birds) {
    if (b.state !== 'incoming' && b.state !== 'circling') continue;
    const d = (b.x - x) ** 2 + (b.y - y) ** 2;
    if (d < bestD) { bestD = d; best = b; }
  }
  if (!best) return null;
  best.state = 'dragged';
  state.drag = { birdId: best.id, x, y };
  return best;
}

export function moveDrag(state, x, y) {
  if (!state.drag) return;
  state.drag.x = x;
  state.drag.y = y;
  const bird = state.birds.find((b) => b.id === state.drag.birdId);
  if (bird && bird.state === 'dragged') {
    bird.x = x;
    bird.y = y;
  }
}

export function endDrag(state, x, y) {
  if (!state.drag) return;
  const bird = state.birds.find((b) => b.id === state.drag.birdId);
  state.drag = null;
  if (!bird || bird.state !== 'dragged') return;
  // Find the perch orb under the release point.
  let perch = null;
  let bestD = 62 * 62;
  for (const p of state.perches) {
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestD) { bestD = d; perch = p; }
  }
  if (perch && perch.birdId === null && perch.color === bird.color) {
    bird.x = perch.x;
    bird.y = perch.y;
    roostBird(state, bird, perch);
    return;
  }
  if (perch) {
    // Wrong color or taken perch: the bird sulks and flies off.
    bird.state = 'sulking';
    const dx = bird.x - SKYFLOCK_TREE.x;
    const dy = bird.y - SKYFLOCK_TREE.y;
    const len = Math.hypot(dx, dy) || 1;
    bird.vx = (dx / len) * 380;
    bird.vy = (dy / len) * 380 - 100;
    state.events.push({ type: 'sulk', x: bird.x, y: bird.y });
    return;
  }
  // Dropped on open sky: the bird goes back to circling.
  bird.state = 'circling';
}

export function zapAt(state, x, y) {
  if (state.screen !== 'playing' || state.sparks <= 0) return false;
  // The Maelstrom is a big target and worth the most — but only while it
  // circles. Mid-dive it is too fast to hit; wait for it to come around.
  if (state.boss && state.boss.state === 'circle') {
    const d = Math.hypot(state.boss.x - x, state.boss.y - y);
    if (d < 95) {
      state.sparks -= 1;
      state.boss.hp -= 1;
      state.score += R.bossZapScore;
      state.stats.zaps += 1;
      state.events.push({ type: 'bossHit', x: state.boss.x, y: state.boss.y, hp: state.boss.hp });
      if (state.boss.hp <= 0) endGame(state, 'victory', '');
      return true;
    }
  }
  for (const crow of state.crows) {
    const d = Math.hypot(crow.x - x, crow.y - y);
    if (d < crow.radius + 24) {
      state.sparks -= 1;
      crow.hp -= 1;
      state.stats.zaps += 1;
      state.events.push({ type: 'zap', x: crow.x, y: crow.y });
      if (crow.hp <= 0) {
        crow.state = 'dead';
        state.score += R.zapScore;
        state.events.push({ type: 'crowDown', x: crow.x, y: crow.y });
      }
      return true;
    }
  }
  return false;
}

export function zapNearestCrow(state) {
  if (state.screen !== 'playing' || state.sparks <= 0) return false;
  if (state.boss && state.boss.state === 'circle') return zapAt(state, state.boss.x, state.boss.y);
  let best = null;
  let bestD = Infinity;
  for (const crow of state.crows) {
    if (crow.state === 'dead') continue;
    const d = (crow.x - SKYFLOCK_TREE.x) ** 2 + (crow.y - SKYFLOCK_TREE.y) ** 2;
    if (d < bestD) { bestD = d; best = crow; }
  }
  if (!best) return false;
  return zapAt(state, best.x, best.y);
}

// --- The tick. ------------------------------------------------------------

export function stepGame(state, dt) {
  state.time += dt;
  if (state.screen !== 'playing') return;

  const isl = island(state);

  // Perch orbs drift slowly around the Skytree.
  layoutPerches(state);

  // Spark charges return on a timer.
  const regen = hasRelic(state, 'quickSparks') ? 2 : R.sparkRegenSeconds;
  state.sparkTimer += dt;
  if (state.sparkTimer >= regen) {
    state.sparkTimer = 0;
    if (state.sparks < R.sparksMax) state.sparks += 1;
  }

  // Storm Lantern auto-zaps the nearest crow, free, every 6s.
  if (hasRelic(state, 'stormLantern')) {
    state.lanternTimer += dt;
    if (state.lanternTimer >= R.lanternSeconds) {
      state.lanternTimer = 0;
      let best = null;
      let bestD = Infinity;
      for (const crow of state.crows) {
        if (crow.state === 'dead') continue;
        const d = (crow.x - SKYFLOCK_TREE.x) ** 2 + (crow.y - SKYFLOCK_TREE.y) ** 2;
        if (d < bestD) { bestD = d; best = crow; }
      }
      if (best) {
        best.hp -= 1;
        state.stats.zaps += 1;
        state.events.push({ type: 'zap', x: best.x, y: best.y });
        if (best.hp <= 0) {
          best.state = 'dead';
          state.score += R.zapScore;
          state.events.push({ type: 'crowDown', x: best.x, y: best.y });
        }
      }
    }
  }

  // Wave clock (waves 1-6). The Maelstrom wave has no clock: the boss is
  // the clock.
  if (state.wave < 7) {
    state.waveTimer -= dt;
    if (state.waveTimer <= 0) {
      failWave(state);
      return;
    }
  }

  // Bird migration: one bird every spawnEvery seconds, up to the wave's count.
  if (state.birdsSpawned < isl.birds) {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      state.spawnTimer = isl.spawnEvery;
      spawnBird(state, false);
    }
  }

  // Storm Crows arrive on their own timer.
  state.crowTimer -= dt;
  if (state.crowTimer <= 0) {
    state.crowTimer = isl.crowEvery;
    const kind = state.rng.pick(isl.crowKinds);
    if (kind === 'swarmer') {
      spawnCrow(state, 'swarmer');
      spawnCrow(state, 'swarmer');
      spawnCrow(state, 'swarmer');
    } else {
      spawnCrow(state, kind);
    }
  }

  // Birds: fly in, circle, rest on a perch, sulk or scatter away.
  for (const b of state.birds) {
    b.wing += dt * 14;
    if (b.state === 'incoming') {
      const tx = SKYFLOCK_TREE.x + Math.cos(b.angle) * b.orbitRadius;
      const ty = SKYFLOCK_TREE.y + Math.sin(b.angle) * b.orbitRadius * 0.82;
      const dx = tx - b.x;
      const dy = ty - b.y;
      const len = Math.hypot(dx, dy) || 1;
      b.x += (dx / len) * b.speed * dt;
      b.y += (dy / len) * b.speed * dt;
      if (len < 24) b.state = 'circling';
    } else if (b.state === 'circling') {
      b.angle += b.orbitSpeed * dt;
      b.x = SKYFLOCK_TREE.x + Math.cos(b.angle) * b.orbitRadius;
      b.y = SKYFLOCK_TREE.y + Math.sin(b.angle) * b.orbitRadius * 0.82
        + Math.sin(state.time * 2 + b.id) * 5;
    } else if (b.state === 'roosted') {
      b.roostTimer -= dt;
      const p = state.perches[b.perchIndex];
      if (p) { b.x = p.x; b.y = p.y; }
      if (b.roostTimer <= 0) {
        // A rested bird flies on happily and frees its perch.
        if (p) p.birdId = null;
        b.state = 'leaving';
        b.vx = 120;
        b.vy = -220;
        state.events.push({ type: 'depart', x: b.x, y: b.y, color: b.color });
      }
    } else if (b.state === 'sulking' || b.state === 'scattered' || b.state === 'leaving') {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy += 60 * dt;
    }
  }
  state.birds = state.birds.filter((b) => b.x > -80 && b.x < 1360 && b.y > -80 && b.y < 800);

  // The crowd rule: 5 unroosted birds circling at once for 5s ends the
  // game. It does NOT apply on the boss wave: 8 birds circling is the
  // Maelstrom fight by design, and the boss is the threat there.
  if (state.wave < 7) {
    const unroosted = state.birds.filter((b) => b.state === 'incoming' || b.state === 'circling').length;
    if (unroosted >= R.crowdLimit) {
      state.crowdTimer += dt;
      if (state.crowdTimer >= R.crowdSeconds) {
        endGame(state, 'defeat', 'crowd');
        return;
      }
    } else {
      state.crowdTimer = Math.max(0, state.crowdTimer - dt * 2);
    }
  }

  // Storm Crows: approach a bird (or the tree), strike, retreat.
  for (const crow of state.crows) {
    crow.wing += dt * 16;
    if (crow.state === 'dead') continue;
    if (crow.state === 'approach') {
      let tx = SKYFLOCK_TREE.x;
      let ty = SKYFLOCK_TREE.y;
      let target = null;
      if (crow.targetBirdId != null) {
        target = state.birds.find((b) => b.id === crow.targetBirdId);
        if (!target || (target.state !== 'incoming' && target.state !== 'circling')) {
          target = null;
          crow.targetBirdId = null;
        }
      }
      if (!target) {
        target = nearestBird(state, crow.x, crow.y);
        if (target) crow.targetBirdId = target.id;
      }
      if (target) { tx = target.x; ty = target.y; }
      const dx = tx - crow.x;
      const dy = ty - crow.y;
      const len = Math.hypot(dx, dy) || 1;
      crow.x += (dx / len) * crow.speed * dt;
      crow.y += (dy / len) * crow.speed * dt;
      if (target && len < 46) {
        scatterBird(state, target);
        crow.state = 'retreat';
        if (crow.scatter >= 2) {
          const second = nearestBird(state, crow.x, crow.y);
          if (second) scatterBird(state, second);
        }
      } else if (!target && len < 100) {
        // No birds left to scatter: the crow pecks the Skytree itself.
        state.treeHp -= 1;
        state.events.push({ type: 'peck', x: SKYFLOCK_TREE.x, y: SKYFLOCK_TREE.y });
        crow.state = 'retreat';
        if (state.treeHp <= 0) {
          endGame(state, 'defeat', 'tree');
          return;
        }
      }
    } else if (crow.state === 'retreat') {
      crow.y -= crow.speed * 1.6 * dt;
      crow.x += (crow.x < SKYFLOCK_TREE.x ? -1 : 1) * crow.speed * 0.5 * dt;
    }
  }
  state.crows = state.crows.filter((c) => c.state !== 'dead' && c.y > -90 && c.x > -90 && c.x < 1370);

  // The Maelstrom: circles the tree, then dives at a bird.
  const boss = state.boss;
  if (boss) {
    boss.wing += dt * 10;
    if (boss.state === 'circle') {
      boss.angle += dt * 0.45;
      boss.x = SKYFLOCK_TREE.x + Math.cos(boss.angle) * 280;
      boss.y = SKYFLOCK_TREE.y + Math.sin(boss.angle) * 280 * 0.82;
      boss.diveTimer -= dt;
      if (boss.diveTimer <= 0) {
        const target = nearestBird(state, boss.x, boss.y);
        if (target) {
          boss.state = 'dive';
          boss.targetBirdId = target.id;
        } else {
          boss.diveTimer = 4;
        }
      }
    } else if (boss.state === 'dive') {
      const target = state.birds.find((b) => b.id === boss.targetBirdId);
      if (!target || (target.state !== 'incoming' && target.state !== 'circling')) {
        boss.state = 'return';
      } else {
        const dx = target.x - boss.x;
        const dy = target.y - boss.y;
        const len = Math.hypot(dx, dy) || 1;
        boss.x += (dx / len) * 340 * dt;
        boss.y += (dy / len) * 340 * dt;
        if (len < 60) {
          scatterBird(state, target);
          boss.state = 'return';
        }
      }
    } else if (boss.state === 'return') {
      const tx = SKYFLOCK_TREE.x + Math.cos(boss.angle) * 280;
      const ty = SKYFLOCK_TREE.y + Math.sin(boss.angle) * 280 * 0.82;
      const dx = tx - boss.x;
      const dy = ty - boss.y;
      const len = Math.hypot(dx, dy) || 1;
      boss.x += (dx / len) * 260 * dt;
      boss.y += (dy / len) * 260 * dt;
      if (len < 20) {
        boss.state = 'circle';
        boss.diveTimer = 7;
      }
    }
  }
}

// --- Autopilot: the perfect Skywarden, used by the Node tests and by the
// screenshot stager to play real games fast. -------------------------------

export function autopilotStep(state, dt) {
  if (state.screen === 'title') {
    startGame(state);
    return;
  }
  if (state.screen === 'relic') {
    chooseRelic(state, 0);
    return;
  }
  if (state.screen !== 'playing') return;
  stepGame(state, dt);
  if (state.screen !== 'playing') return;
  // Zap the boss first (while it circles), then the nearest crow.
  if (state.boss && state.boss.state === 'circle' && state.sparks > 0) zapAt(state, state.boss.x, state.boss.y);
  else if (state.sparks > 0) zapNearestCrow(state);
  // Roost every circling bird of a matching color onto a free perch.
  for (const perch of state.perches) {
    if (perch.birdId !== null) continue;
    const bird = state.birds.find(
      (b) => (b.state === 'circling' || b.state === 'incoming') && b.color === perch.color,
    );
    if (bird) {
      bird.x = perch.x;
      bird.y = perch.y;
      roostBird(state, bird, perch);
      if (state.screen !== 'playing') return;
    }
  }
}

// A lazy Skywarden: never zaps, roosts at most one bird every 8 seconds.
// Proves the game can be lost.
export function lazyAutopilotStep(state, dt, memory) {
  if (state.screen === 'title') {
    startGame(state);
    return;
  }
  if (state.screen === 'relic') {
    chooseRelic(state, 0);
    return;
  }
  if (state.screen !== 'playing') return;
  stepGame(state, dt);
  if (state.screen !== 'playing') return;
  memory.timer -= dt;
  if (memory.timer > 0) return;
  memory.timer = 8;
  for (const perch of state.perches) {
    if (perch.birdId !== null) continue;
    const bird = state.birds.find(
      (b) => (b.state === 'circling' || b.state === 'incoming') && b.color === perch.color,
    );
    if (bird) {
      bird.x = perch.x;
      bird.y = perch.y;
      roostBird(state, bird, perch);
      return;
    }
  }
}

// A small, stable snapshot for the determinism check: rounded numbers only.
export function snapshot(state) {
  const round = (n) => Math.round(n * 1000) / 1000;
  return {
    screen: state.screen,
    wave: state.wave,
    score: state.score,
    coins: state.coins,
    gems: state.gems,
    treeHp: state.treeHp,
    sparks: state.sparks,
    roostsInWave: state.roostsInWave,
    scatteredInWave: state.scatteredInWave,
    birdsSpawned: state.birdsSpawned,
    stats: { ...state.stats },
    birds: state.birds.map((b) => ({
      id: b.id, color: b.color, state: b.state, x: round(b.x), y: round(b.y),
    })),
    crows: state.crows.map((c) => ({
      id: c.id, kind: c.kind, hp: c.hp, state: c.state, x: round(c.x), y: round(c.y),
    })),
    boss: state.boss ? { hp: state.boss.hp, state: state.boss.state, x: round(state.boss.x), y: round(state.boss.y) } : null,
    time: round(state.time),
  };
}
