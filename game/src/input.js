// SKYFLOCK — pointer and keyboard input. Mouse drags guide birds; a
// click on a crow zaps it; buttons on the title, relic and end screens
// are the same rectangles the renderer draws (SKYFLOCK_LAYOUT), so a click
// lands on exactly the button the player sees.

import { SKYFLOCK_LAYOUT } from './render.js';
import {
  startDrag,
  moveDrag,
  endDrag,
  zapAt,
  zapNearestCrow,
  chooseRelic,
  startGame,
} from './sim.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function attachInput(canvas, state, audio) {
  function toGame(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1280,
      y: ((e.clientY - rect.top) / rect.height) * 720,
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    audio.ensure();
    const p = toGame(e);
    if (state.screen === 'title') {
      if (inside(p.x, p.y, SKYFLOCK_LAYOUT.startButton)) startGame(state);
      return;
    }
    if (state.screen === 'relic') {
      for (let i = 0; i < state.relicChoices.length; i += 1) {
        if (inside(p.x, p.y, SKYFLOCK_LAYOUT.relicCards[i])) {
          chooseRelic(state, i);
          audio.play({ type: 'relic' });
          return;
        }
      }
      return;
    }
    if (state.screen === 'victory' || state.screen === 'defeat') {
      if (inside(p.x, p.y, SKYFLOCK_LAYOUT.restartButton)) startGame(state);
      return;
    }
    if (state.screen !== 'playing') return;
    // A pointer down on a bird starts a drag; on a crow it zaps.
    const bird = startDrag(state, p.x, p.y);
    if (!bird) zapAt(state, p.x, p.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (state.screen !== 'playing') return;
    const p = toGame(e);
    moveDrag(state, p.x, p.y);
  });

  canvas.addEventListener('pointerup', (e) => {
    if (state.screen !== 'playing') return;
    const p = toGame(e);
    endDrag(state, p.x, p.y);
  });

  canvas.addEventListener('pointerleave', () => {
    if (state.screen === 'playing' && state.drag) endDrag(state, state.drag.x, state.drag.y);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      audio.muted = !audio.muted;
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      if (state.screen === 'victory' || state.screen === 'defeat' || state.screen === 'title') {
        startGame(state);
      }
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      if (state.screen === 'playing') zapNearestCrow(state);
      return;
    }
    if (state.screen === 'relic' && ['1', '2', '3'].includes(e.key)) {
      chooseRelic(state, Number(e.key) - 1);
    }
  });
}
