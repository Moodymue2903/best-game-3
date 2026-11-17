// SKYFLOCK — the game loop. Wires the sim, the renderer, the input and
// the audio together; runs the sim on a fixed 1/60s step so play is
// identical at any frame rate; drains sim events into particles and sound.
//
// window.__skyflock exposes the live state for the playtest and the
// screenshot tools. window.__shotReady tells the screenshot tool the
// staged frame has rendered.

import { createGame, stepGame, autopilotStep, debugSpawnCrow } from './sim.js';
import { drawGame } from './render.js';
import { SkyflockAudio } from './audio.js';
import { attachInput } from './input.js';
import { stageShot, isStagedShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 7);
const staged = isStagedShot();

let state;
let particles = [];
let audio;
let lastTime = 0;
let accumulator = 0;
let renderedOnce = false;

function spawnParticles(event) {
  const colors = ['#ffc53d', '#5ef2ff', '#ff6fb5', '#7dff9e'];
  if (event.type === 'roost') {
    for (let i = 0; i < 10; i += 1) {
      particles.push({
        kind: 'sparkle', x: event.x + (Math.random() - 0.5) * 40,
        y: event.y + (Math.random() - 0.5) * 40,
        color: colors[i % colors.length], size: 5 + Math.random() * 5,
        life: 0.7, maxLife: 0.7, vx: 0, vy: -20, rot: 0,
      });
    }
    particles.push({
      kind: 'heart', x: event.x, y: event.y - 20, color: '#ff6fb5',
      size: 8, life: 0.9, maxLife: 0.9, vx: 0, vy: -30, rot: 0,
    });
  } else if (event.type === 'zap' || event.type === 'bossHit') {
    particles.push({
      kind: 'bolt', x: event.x, y: event.y, color: '#5ef2ff',
      size: 20, life: 0.25, maxLife: 0.25, vx: 0, vy: 0, rot: 0,
    });
    particles.push({
      kind: 'ring', x: event.x, y: event.y, color: '#5ef2ff',
      size: 30, life: 0.4, maxLife: 0.4, vx: 0, vy: 0, rot: 0,
    });
  } else if (event.type === 'crowDown') {
    for (let i = 0; i < 8; i += 1) {
      particles.push({
        kind: 'feather', x: event.x, y: event.y,
        color: '#0d0815', size: 6 + Math.random() * 4,
        life: 0.8, maxLife: 0.8,
        vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 60,
        rot: Math.random() * Math.PI,
      });
    }
  } else if (event.type === 'chest') {
    for (let i = 0; i < 16; i += 1) {
      particles.push({
        kind: 'sparkle', x: event.x + (Math.random() - 0.5) * 120,
        y: event.y + (Math.random() - 0.5) * 80,
        color: '#ffc53d', size: 5 + Math.random() * 6,
        life: 0.9, maxLife: 0.9, vx: 0, vy: -30, rot: 0,
      });
    }
  } else if (event.type === 'scatter' || event.type === 'sulk') {
    for (let i = 0; i < 5; i += 1) {
      particles.push({
        kind: 'feather', x: event.x, y: event.y,
        color: '#ff4d6e', size: 5 + Math.random() * 4,
        life: 0.7, maxLife: 0.7,
        vx: (Math.random() - 0.5) * 100, vy: -30 - Math.random() * 50,
        rot: Math.random() * Math.PI,
      });
    }
  }
}

function drainEvents() {
  for (const event of state.events) {
    spawnParticles(event);
    audio.play(event);
  }
  state.events.length = 0;
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  if (!staged) {
    accumulator += dt;
    while (accumulator >= 1 / 60) {
      stepGame(state, 1 / 60);
      accumulator -= 1 / 60;
    }
  }
  // Particles drift and fade (render-only, never in the sim).
  for (const p of particles) {
    p.x += (p.vx || 0) * dt;
    p.y += (p.vy || 0) * dt;
    p.life -= dt;
  }
  particles = particles.filter((p) => p.life > 0);
  drainEvents();
  drawGame(ctx, state, particles, now / 1000);
  if (!renderedOnce) {
    renderedOnce = true;
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}

function boot() {
  audio = new SkyflockAudio();
  if (staged) {
    state = stageShot(params);
  } else {
    state = createGame(seed);
  }
  attachInput(canvas, state, audio);
  window.__skyflock = state;
  window.__skyflockAudio = audio;
  // Playtest hook: spawn a crow on demand and report where it is.
  window.__skyflockSpawnCrow = (kind) => {
    const crow = debugSpawnCrow(state, kind || 'swift');
    crow.x = 640;
    crow.y = 200;
    return { id: crow.id, x: crow.x, y: crow.y };
  };
  window.__shotReady = false;
  requestAnimationFrame(frame);
}

boot();

// A staged shot never advances the sim (the frame is frozen), but the
// victory staging already played its game before boot; nothing else here
// needs the autopilot.
void autopilotStep;
