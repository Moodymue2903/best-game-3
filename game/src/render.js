// SKYFLOCK — the renderer. Every frame is drawn to look like a dense,
// glossy, commercial cartoon title: thick dark outlines, flat bright
// fills, one glossy highlight per shape, gold-bordered panels, big white
// eyes. No image files, no fonts from the network — everything is canvas
// vector art, so the game opens with zero network requests.
//
// Layout constants live here and are shared with input.js, so a click
// lands on exactly the button the player sees.

import {
  SKYFLOCK_BIRD_TYPES,
  SKYFLOCK_CROW_TYPES,
  SKYFLOCK_ISLANDS,
  SKYFLOCK_RELICS,
  SKYFLOCK_RULES,
  SKYFLOCK_TREE,
} from './config.js';

export const SKYFLOCK_LAYOUT = {
  startButton: { x: 480, y: 556, w: 320, h: 80 },
  restartButton: { x: 480, y: 556, w: 320, h: 80 },
  relicCards: [
    { x: 130, y: 300, w: 300, h: 280 },
    { x: 490, y: 300, w: 300, h: 280 },
    { x: 850, y: 300, w: 300, h: 280 },
  ],
};

const OUTLINE = '#1a1030';
const GOLD = '#ffc53d';
const GOLD_DARK = '#c98a00';
const PANEL = '#1d2a6e';
const CREAM = '#fff5e0';
const CYAN = '#5ef2ff';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function goldPanel(ctx, x, y, w, h, r = 14) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = PANEL;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = GOLD;
  ctx.stroke();
  rr(ctx, x + 4, y + 4, w - 8, h - 8, r - 4);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.stroke();
}

function chunkyText(ctx, text, x, y, size, fill, align = 'center', outlineWidth = 0) {
  ctx.font = `900 ${size}px "Arial Black", "Trebuchet MS", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  if (outlineWidth > 0) {
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = OUTLINE;
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function goldText(ctx, text, x, y, size, align = 'center') {
  const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
  g.addColorStop(0, '#fff3c4');
  g.addColorStop(0.45, GOLD);
  g.addColorStop(1, '#ff9f1c');
  chunkyText(ctx, text, x, y, size, g, align, Math.max(4, size / 10));
  // Glossy highlight stripe across the top of the letters.
  ctx.save();
  ctx.font = `900 ${size}px "Arial Black", "Trebuchet MS", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y - size * 0.14);
  ctx.restore();
}

function island(state) {
  return SKYFLOCK_ISLANDS[state.wave - 1];
}

function birdDef(bird) {
  return SKYFLOCK_BIRD_TYPES[bird.color];
}

// --- Sky -----------------------------------------------------------------

function drawSky(ctx, isl, time) {
  const g = ctx.createLinearGradient(0, 0, 0, 720);
  g.addColorStop(0, isl.skyTop);
  g.addColorStop(0.55, isl.skyBottom);
  g.addColorStop(1, isl.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 720);

  // Stars, twinkling.
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < isl.stars; i += 1) {
    const sx = (i * 173 + 41) % 1280;
    const sy = (i * 97 + 23) % 300;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * 1.3 + i));
    ctx.globalAlpha = tw;
    ctx.beginPath();
    ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Sun or moon disc, top-right, with a gold halo.
  const sunX = 1140;
  const sunY = 96;
  ctx.save();
  ctx.shadowColor = isl.accent;
  ctx.shadowBlur = 42;
  ctx.fillStyle = isl.key === 'eclipse' ? '#0d0815' : isl.accent;
  ctx.beginPath();
  ctx.arc(sunX, sunY, isl.key === 'eclipse' ? 52 : 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (isl.key === 'eclipse') {
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffd9ec';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Aurora ribbons on the Aurora island.
  if (isl.key === 'aurora') {
    for (let band = 0; band < 3; band += 1) {
      ctx.save();
      ctx.globalAlpha = 0.4 - band * 0.1;
      ctx.strokeStyle = band === 0 ? '#5ef2ff' : band === 1 ? '#7dff9e' : '#ff6fb5';
      ctx.lineWidth = 22 - band * 5;
      ctx.beginPath();
      for (let x = 0; x <= 1280; x += 32) {
        const y = 90 + band * 46 + Math.sin(x / 180 + time * 0.7 + band * 2) * 26;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // Monsoon rain.
  if (isl.key === 'monsoon') {
    ctx.save();
    ctx.strokeStyle = 'rgba(207,232,255,0.55)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 90; i += 1) {
      const rx = (i * 137 + time * 420) % 1320 - 20;
      const ry = (i * 211 + time * 640) % 760 - 20;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 22);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Storm lightning flashes on the Storm island.
  if (isl.key === 'storm' && Math.sin(time * 0.9) > 0.985) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.restore();
  }
}

function drawCloud(ctx, x, y, scale, color, time, drift) {
  const cx = ((x + time * drift) % 1440) - 80;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  const puffs = [
    [0, 0, 46], [-38, 10, 32], [40, 10, 34], [-16, -18, 30], [20, -16, 28],
  ];
  for (const [dx, dy, r] of puffs) {
    ctx.beginPath();
    ctx.arc(cx + dx * scale, y + dy * scale, r * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Glossy top highlight.
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx - 6 * scale, y - 18 * scale, 34 * scale, 10 * scale, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawClouds(ctx, isl, time) {
  drawCloud(ctx, 120, 120, 1.0, isl.cloud, time, 6);
  drawCloud(ctx, 520, 70, 0.8, isl.cloud, time, 9);
  drawCloud(ctx, 900, 150, 1.1, isl.cloud, time, 5);
  drawCloud(ctx, 220, 640, 0.9, isl.cloud, time, 7);
  drawCloud(ctx, 1050, 620, 0.8, isl.cloud, time, 8);
  drawCloud(ctx, 640, 250, 0.6, isl.cloud, time, 11);
}

// --- The floating sanctuary island + the Skytree ---------------------------

function drawFloatingIsland(ctx, time) {
  const bob = Math.sin(time * 0.8) * 3;
  const cx = 640;
  const top = 596 + bob;
  // Rock: a chunky upside-down cone with a gold trim.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 300, top);
  ctx.quadraticCurveTo(cx - 260, top + 90, cx, top + 118);
  ctx.quadraticCurveTo(cx + 260, top + 90, cx + 300, top);
  ctx.closePath();
  ctx.fillStyle = '#5b3a6e';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Rock facets.
  ctx.fillStyle = '#7a4d8f';
  ctx.beginPath();
  ctx.moveTo(cx - 180, top + 18);
  ctx.lineTo(cx - 60, top + 18);
  ctx.lineTo(cx - 120, top + 78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#4a2c5c';
  ctx.beginPath();
  ctx.moveTo(cx + 90, top + 22);
  ctx.lineTo(cx + 200, top + 22);
  ctx.lineTo(cx + 140, top + 82);
  ctx.closePath();
  ctx.fill();
  // Grass cap with gold trim.
  ctx.beginPath();
  ctx.ellipse(cx, top, 302, 26, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#37d67a';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, top - 4, 302, 20, 0, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#7dff9e';
  ctx.fill();
  // Flowers and grass tufts on the cap.
  for (let i = 0; i < 9; i += 1) {
    const fx = cx - 260 + i * 62;
    const fy = top - 12 - (i % 3) * 4;
    ctx.fillStyle = i % 2 === 0 ? '#ff6fb5' : '#ffc53d';
    ctx.beginPath();
    ctx.arc(fx, fy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Two small floating rocks with grass.
  for (const [rx, ry, rs] of [[180, 520, 0.5], [1100, 500, 0.42]]) {
    const by = ry + Math.sin(time + rx) * 4;
    ctx.beginPath();
    ctx.moveTo(rx - 60 * rs * 2, by);
    ctx.quadraticCurveTo(rx, by + 52 * rs * 2, rx + 60 * rs * 2, by);
    ctx.closePath();
    ctx.fillStyle = '#5b3a6e';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(rx, by, 60 * rs * 2, 12 * rs * 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#37d67a';
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawSkytree(ctx, state, time) {
  const { x, y } = SKYFLOCK_TREE;
  const bob = Math.sin(time * 0.8) * 3;
  ctx.save();
  ctx.translate(0, bob);
  // Canopy: three big glossy leaf blobs.
  const canopy = [
    [x - 78, y - 148, 78, '#2fbf71'],
    [x + 82, y - 150, 76, '#37d67a'],
    [x, y - 196, 88, '#1d9e5f'],
  ];
  for (const [cx, cy, r, fill] of canopy) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.3, cy - r * 0.42, r * 0.34, r * 0.18, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Trunk: gold-barked, thick, with a highlight stripe.
  ctx.beginPath();
  ctx.moveTo(x - 30, y + 196);
  ctx.quadraticCurveTo(x - 38, y + 40, x - 22, y - 120);
  ctx.lineTo(x + 22, y - 120);
  ctx.quadraticCurveTo(x + 38, y + 40, x + 30, y + 196);
  ctx.closePath();
  ctx.fillStyle = '#e8a33d';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x - 18, y - 100, 9, 280);
  // Bark rings.
  ctx.strokeStyle = '#8a5a12';
  ctx.lineWidth = 3;
  for (const by of [y - 60, y + 10, y + 80]) {
    ctx.beginPath();
    ctx.moveTo(x - 24, by);
    ctx.quadraticCurveTo(x, by + 8, x + 24, by);
    ctx.stroke();
  }
  // Sparkle ring rotating around the canopy.
  for (let i = 0; i < 8; i += 1) {
    const a = time * 0.25 + (i / 8) * Math.PI * 2;
    const sx = x + Math.cos(a) * 150;
    const sy = y - 150 + Math.sin(a) * 60;
    const s = 3 + 2 * Math.sin(time * 3 + i * 2);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.moveTo(sx, sy - s);
    ctx.lineTo(sx + s * 0.35, sy - s * 0.35);
    ctx.lineTo(sx + s, sy);
    ctx.lineTo(sx + s * 0.35, sy + s * 0.35);
    ctx.lineTo(sx, sy + s);
    ctx.lineTo(sx - s * 0.35, sy + s * 0.35);
    ctx.lineTo(sx - s, sy);
    ctx.lineTo(sx - s * 0.35, sy - s * 0.35);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// --- Perches, birds, crows, boss -------------------------------------------

function drawPerch(ctx, perch, time) {
  const def = SKYFLOCK_BIRD_TYPES[perch.color];
  const pulse = 1 + 0.08 * Math.sin(time * 3 + perch.index * 1.7);
  const r = 28 * pulse;
  ctx.save();
  // Glow.
  ctx.shadowColor = def.color;
  ctx.shadowBlur = 38;
  ctx.beginPath();
  ctx.arc(perch.x, perch.y, r, 0, Math.PI * 2);
  ctx.fillStyle = def.color;
  ctx.fill();
  ctx.restore();
  // Outer halo ring so the orb reads against a bright sky.
  ctx.beginPath();
  ctx.arc(perch.x, perch.y, r + 9, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.stroke();
  // Gold ring + dark outline.
  ctx.beginPath();
  ctx.arc(perch.x, perch.y, r, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = GOLD;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(perch.x, perch.y, r + 5, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Inner swirl + highlight.
  ctx.beginPath();
  ctx.arc(perch.x, perch.y, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fill();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(perch.x - r * 0.3, perch.y - r * 0.38, r * 0.26, r * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Occupied: a tiny nest ring under the resting bird.
  if (perch.birdId !== null) {
    ctx.beginPath();
    ctx.arc(perch.x, perch.y + 8, r * 0.7, 0, Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#8a5a12';
    ctx.stroke();
  }
}

function drawBird(ctx, bird, time, dragged) {
  const def = birdDef(bird);
  const r = 14;
  const flap = Math.sin(bird.wing);
  ctx.save();
  ctx.translate(bird.x, bird.y);
  // Motion trail for flying birds: three fading dots behind.
  if (bird.state === 'incoming' || bird.state === 'circling') {
    const dir = bird.orbitSpeed >= 0 ? -1 : 1;
    for (let i = 1; i <= 3; i += 1) {
      ctx.globalAlpha = 0.28 - i * 0.07;
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(dir * i * 16, i * 3, r - i * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (dragged) {
    ctx.shadowColor = def.color;
    ctx.shadowBlur = 24;
  }
  // Wings: two flapping ellipses.
  ctx.fillStyle = def.dark;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(-r * 0.9, -2 + flap * 5, 11, 6, -0.5 - flap * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(r * 0.9, -2 - flap * 5, 11, 6, 0.5 + flap * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Tail feathers.
  ctx.fillStyle = def.dark;
  ctx.beginPath();
  ctx.moveTo(-6, r * 0.7);
  ctx.lineTo(-16, r * 1.15);
  ctx.lineTo(-2, r * 1.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Body: flat bright fill, thick outline, glossy highlight.
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = def.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Belly.
  ctx.beginPath();
  ctx.ellipse(0, r * 0.42, r * 0.62, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = def.belly;
  ctx.fill();
  // Glossy highlight blob.
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-r * 0.34, -r * 0.42, r * 0.3, r * 0.17, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Big white eyes with black pupils.
  for (const ex of [-5, 5]) {
    ctx.beginPath();
    ctx.arc(ex, -3, 4.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex + 1.2, -3, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1030';
    ctx.fill();
  }
  // Triangle beak.
  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.lineTo(9, 4);
  ctx.lineTo(0, 7);
  ctx.closePath();
  ctx.fillStyle = def.beak;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Sulking: a wrong-color drop leaves the bird visibly refusing — a red
  // cross above it, so the refusal reads in a still frame (the two-state
  // cover shows match and sulk side by side).
  if (bird.state === 'sulking') {
    ctx.strokeStyle = '#ff2e4d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-7, -32);
    ctx.lineTo(7, -20);
    ctx.moveTo(7, -32);
    ctx.lineTo(-7, -20);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCrow(ctx, crow, time) {
  const def = SKYFLOCK_CROW_TYPES.find((c) => c.key === crow.kind);
  const r = crow.radius;
  const flap = Math.sin(crow.wing);
  ctx.save();
  ctx.translate(crow.x, crow.y);
  ctx.shadowColor = '#ff2e4d';
  ctx.shadowBlur = 14;
  // Ragged wings: jagged ink polygons.
  ctx.fillStyle = '#0d0815';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * r * 0.6, 0);
    ctx.lineTo(side * r * 1.9, -r * 0.7 + flap * 6);
    ctx.lineTo(side * r * 1.5, 0);
    ctx.lineTo(side * r * 2.1, r * 0.3 + flap * 4);
    ctx.lineTo(side * r * 0.8, r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // Ink-blot body.
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#0d0815';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#5b3a6e';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.4, r * 0.34, r * 0.18, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Two red glowing eyes.
  for (const ex of [-r * 0.38, r * 0.38]) {
    ctx.beginPath();
    ctx.arc(ex, -r * 0.25, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2e4d';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex, -r * 0.25, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1030';
    ctx.fill();
  }
  // Beak.
  ctx.beginPath();
  ctx.moveTo(0, r * 0.1);
  ctx.lineTo(r * 0.75, r * 0.3);
  ctx.lineTo(0, r * 0.55);
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Shielded crows wear a storm ring; brutes wear a crown of spikes.
  if (crow.kind === 'shielded') {
    ctx.beginPath();
    ctx.arc(0, 0, r + 7, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = CYAN;
    ctx.stroke();
  }
  if (crow.kind === 'brute') {
    ctx.fillStyle = GOLD;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 12 - 6, -r + 2);
      ctx.lineTo(i * 12, -r - 12);
      ctx.lineTo(i * 12 + 6, -r + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
  // HP pips for multi-hit crows.
  if (def.hp > 1) {
    for (let i = 0; i < def.hp; i += 1) {
      ctx.beginPath();
      ctx.arc(-10 + i * 10, -r - 12, 4, 0, Math.PI * 2);
      ctx.fillStyle = i < crow.hp ? '#ff2e4d' : 'rgba(255,255,255,0.25)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBoss(ctx, boss, time) {
  const r = 58;
  const flap = Math.sin(boss.wing);
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.shadowColor = '#ff2e4d';
  ctx.shadowBlur = 34;
  // Huge ragged wings.
  ctx.fillStyle = '#0d0815';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * r * 0.6, 0);
    ctx.lineTo(side * r * 2.1, -r * 0.8 + flap * 10);
    ctx.lineTo(side * r * 1.6, 0);
    ctx.lineTo(side * r * 2.3, r * 0.4 + flap * 8);
    ctx.lineTo(side * r * 0.9, r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // Body.
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#1a0b26';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
  // Storm-cloud crown.
  ctx.fillStyle = '#5b3a6e';
  for (const [dx, dy, cr] of [[-30, -r + 6, 20], [0, -r - 4, 24], [30, -r + 6, 20]]) {
    ctx.beginPath();
    ctx.arc(dx, dy, cr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Red eyes, bigger and angrier.
  for (const ex of [-22, 22]) {
    ctx.beginPath();
    ctx.arc(ex, -14, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2e4d';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + 2, -14, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1030';
    ctx.fill();
  }
  // Beak.
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(34, 16);
  ctx.lineTo(0, 28);
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Boss HP bar above.
  const bw = 150;
  ctx.fillStyle = 'rgba(13,8,21,0.85)';
  rr(ctx, -bw / 2, -r - 58, bw, 18, 9);
  ctx.fill();
  ctx.fillStyle = '#ff2e4d';
  rr(ctx, -bw / 2 + 3, -r - 55, (bw - 6) * (boss.hp / boss.maxHp), 12, 6);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = GOLD;
  rr(ctx, -bw / 2, -r - 58, bw, 18, 9);
  ctx.stroke();
  chunkyText(ctx, 'THE MAELSTROM', 0, -r - 78, 18, '#ffffff', 'center', 4);
  ctx.restore();
}

function drawZapBolt(ctx, zap, time) {
  // A cyan lightning bolt frozen mid-arc (staging only): the game's zap
  // effect, held still so the boss frame shows the fight, not just the
  // boss. The bolt runs from above the Skytree canopy to the struck crow.
  const x0 = 640;
  const y0 = 310;
  const x1 = zap.x;
  const y1 = zap.y;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const jogs = [0, -26, 18, -14, 10, 0];
  const pts = jogs.map((j, i) => {
    const t = i / (jogs.length - 1);
    return [x0 + dx * t + px * j, y0 + dy * t + py * j];
  });
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const [color, width, alpha] of [['#5ef2ff', 12, 0.45], ['#ffffff', 4, 1]]) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Ring around the struck boss.
  ctx.beginPath();
  ctx.arc(x1, y1, 52, 0, Math.PI * 2);
  ctx.strokeStyle = '#5ef2ff';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
  void time;
}

// --- HUD -------------------------------------------------------------------

function drawPill(ctx, x, y, w, h, label, value, valueColor) {
  goldPanel(ctx, x, y, w, h, 12);
  chunkyText(ctx, label, x + 14, y + h / 2, 13, '#9fb4ff', 'left', 0);
  chunkyText(ctx, value, x + w - 14, y + h / 2, 18, valueColor, 'right', 0);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `0:${String(s).padStart(2, '0')}`;
}

function drawHUD(ctx, state, time) {
  const isl = island(state);
  // Top bar (hidden on the cover frame, where the wordmark banner carries
  // the title alone and the pills would compete with it).
  if (!state.coverHideTopHud) {
  // Top bar, left: wave + island.
  drawPill(ctx, 16, 14, 150, 46, 'WAVE', `${state.wave}/7`, '#ffffff');
  chunkyText(ctx, isl.name.toUpperCase(), 176, 37, 20, GOLD, 'left', 4);
  // Top bar, center: score + wave clock.
  drawPill(ctx, 470, 14, 170, 46, 'SCORE', String(state.score), '#ffffff');
  if (state.wave < 7) {
    const urgent = state.waveTimer < 15;
    goldPanel(ctx, 656, 14, 190, 46, 12);
    chunkyText(ctx, 'WAVE ENDS', 670, 37, 13, '#9fb4ff', 'left', 0);
    chunkyText(ctx, formatTime(state.waveTimer), 832, 37, 18, urgent ? '#ff5b6e' : '#ffffff', 'right', 0);
  } else {
    goldPanel(ctx, 656, 14, 190, 46, 12);
    chunkyText(ctx, 'BOSS', 670, 37, 13, '#9fb4ff', 'left', 0);
    chunkyText(ctx, `${state.boss ? state.boss.hp : 0}/5 ZAPS`, 832, 37, 18, '#ff5b6e', 'right', 0);
  }
  // Top bar, right: gems, coins, Spark pips.
  drawPill(ctx, 872, 14, 120, 46, '◆', String(state.gems), CYAN);
  drawPill(ctx, 1004, 14, 120, 46, '●', String(state.coins), GOLD);
  goldPanel(ctx, 1136, 14, 128, 46, 12);
  for (let i = 0; i < SKYFLOCK_RULES.sparksMax; i += 1) {
    const px = 1152 + i * 23;
    const py = 37;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI / 4);
    const on = i < state.sparks;
    ctx.fillStyle = on ? CYAN : 'rgba(255,255,255,0.22)';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.fillRect(-6, -6, 12, 12);
    ctx.strokeRect(-6, -6, 12, 12);
    ctx.restore();
  }
  }

  // Bottom-left: Skytree HP hearts + crowd warning.
  goldPanel(ctx, 16, 640, 250, 64, 14);
  chunkyText(ctx, 'SKYTREE', 30, 664, 13, '#9fb4ff', 'left', 0);
  for (let i = 0; i < state.treeMaxHp; i += 1) {
    const hx = 34 + i * 20;
    const hy = 688;
    ctx.fillStyle = i < state.treeHp ? '#ff4d6e' : 'rgba(255,255,255,0.18)';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 5);
    ctx.bezierCurveTo(hx - 8, hy - 4, hx - 3, hy - 10, hx, hy - 4);
    ctx.bezierCurveTo(hx + 3, hy - 10, hx + 8, hy - 4, hx, hy + 5);
    ctx.fill();
    ctx.stroke();
  }
  if (state.crowdTimer > 0) {
    const w = 250 * (state.crowdTimer / SKYFLOCK_RULES.crowdSeconds);
    goldPanel(ctx, 16, 576, 250, 52, 14);
    chunkyText(ctx, 'TOO MANY BIRDS!', 141, 594, 15, '#ff5b6e', 'center', 3);
    ctx.fillStyle = '#ff2e4d';
    rr(ctx, 30, 606, 222 * (state.crowdTimer / SKYFLOCK_RULES.crowdSeconds), 10, 5);
    ctx.fill();
    void w;
  }

  // Bottom-right: Nesting Chest progress.
  goldPanel(ctx, 1014, 640, 250, 64, 14);
  chunkyText(ctx, 'NESTING CHEST', 1028, 664, 13, '#9fb4ff', 'left', 0);
  chunkyText(ctx, `${SKYFLOCK_RULES.chestFeathers - state.chestFeathers} TO REWARD`, 1250, 664, 12, GOLD, 'right', 0);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  rr(ctx, 1028, 678, 222, 14, 7);
  ctx.fill();
  ctx.fillStyle = GOLD;
  rr(ctx, 1028, 678, 222 * (state.chestFeathers / SKYFLOCK_RULES.chestFeathers), 14, 7);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  rr(ctx, 1028, 678, 222, 14, 7);
  ctx.stroke();

  // Bottom-center: relic chips held.
  if (state.relics.length > 0) {
    const names = state.relics.map((id) => SKYFLOCK_RELICS.find((r) => r.id === id).name);
    const label = names.join('  ·  ');
    ctx.font = '900 14px "Arial Black", sans-serif';
    const w = ctx.measureText(label).width + 32;
    goldPanel(ctx, 640 - w / 2, 668, w, 36, 12);
    chunkyText(ctx, label, 640, 687, 14, CREAM, 'center', 0);
  }

  // Drag guide: dotted line from the dragged bird to the nearest perch.
  if (state.drag) {
    const bird = state.birds.find((b) => b.id === state.drag.birdId);
    if (bird) {
      let best = null;
      let bestD = Infinity;
      for (const p of state.perches) {
        const d = (p.x - bird.x) ** 2 + (p.y - bird.y) ** 2;
        if (d < bestD) { bestD = d; best = p; }
      }
      if (best) {
        const match = bird.color === best.color;
        // Golden tether ribbon: a gold underlay beneath the colored dash,
        // so the guide reads as a wind-current, not a debug line.
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 7;
        ctx.strokeStyle = GOLD;
        ctx.beginPath();
        ctx.moveTo(bird.x, bird.y);
        ctx.lineTo(best.x, best.y);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = match ? '#7dff9e' : '#ff5b6e';
        ctx.beginPath();
        ctx.moveTo(bird.x, bird.y);
        ctx.lineTo(best.x, best.y);
        ctx.stroke();
        ctx.restore();
        // The match cue is a chunky gold-bordered chip in the HUD's own
        // language, never a bare floating label.
        const cue = match ? 'MATCH!' : 'WRONG COLOR';
        ctx.font = '900 20px "Arial Black", sans-serif';
        const cueW = ctx.measureText(cue).width + 28;
        goldPanel(ctx, best.x - cueW / 2, best.y - 74, cueW, 36, 10);
        chunkyText(ctx, cue, best.x, best.y - 50, 20, match ? '#7dff9e' : '#ff5b6e', 'center', 4);
      }
    }
  }
}

// --- Screens ----------------------------------------------------------------

function drawTitle(ctx, state, time) {
  const isl = SKYFLOCK_ISLANDS[0];
  drawSky(ctx, isl, time);
  drawClouds(ctx, isl, time);
  drawFloatingIsland(ctx, time);
  drawSkytree(ctx, state, time);
  // Decorative birds flying across the title.
  for (let i = 0; i < 8; i += 1) {
    const bx = ((time * (50 + i * 12) + i * 170) % 1500) - 110;
    const by = 110 + (i % 4) * 58 + Math.sin(time * 2 + i) * 12;
    drawBird(ctx, {
      color: i % 5, wing: time * 14 + i, state: 'circling', orbitSpeed: 1, id: i,
      x: bx, y: by,
    }, time, false);
  }
  // Wordmark.
  goldText(ctx, 'SKYFLOCK', 640, 128, 92);
  chunkyText(ctx, 'A  SKYWARDEN MIGRATION', 640, 196, 22, CREAM, 'center', 5);
  // How to play panel.
  goldPanel(ctx, 290, 236, 700, 118, 16);
  chunkyText(ctx, 'HOW TO PLAY', 640, 262, 18, GOLD, 'center', 0);
  chunkyText(ctx, 'Drag a bird to a perch of its OWN color to roost it — 8 roosts clear a wave.', 640, 292, 16, '#ffffff', 'center', 0);
  chunkyText(ctx, 'Click a Storm Crow to zap it with a Spark. Wrong perch? The bird sulks off!', 640, 320, 16, '#ffffff', 'center', 0);
  // Win / Lose panel — labeled, gold and red.
  goldPanel(ctx, 290, 366, 700, 74, 16);
  chunkyText(ctx, 'WIN:  Clear Wave 7 — zap The Maelstrom 5 times.', 640, 390, 17, '#7dff9e', 'center', 0);
  chunkyText(ctx, 'LOSE:  5 unroosted birds crowd the tree for 5s  ·  10 birds scattered  ·  Skytree HP hits 0', 640, 420, 14, '#ff5b6e', 'center', 0);
  // Start button.
  const b = SKYFLOCK_LAYOUT.startButton;
  const pulse = 1 + 0.03 * Math.sin(time * 4);
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
  rr(ctx, b.x, b.y, b.w, b.h, 18);
  const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  g.addColorStop(0, '#ffe27a');
  g.addColorStop(0.5, GOLD);
  g.addColorStop(1, '#ff9f1c');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.restore();
  chunkyText(ctx, '▶  START THE MIGRATION', 640, b.y + b.h / 2 + 2, 24, '#5b2d00', 'center', 0);
  chunkyText(ctx, 'R restart  ·  M mute  ·  Space zaps the nearest crow', 640, 676, 14, CREAM, 'center', 4);
}

function drawRelicIcon(ctx, icon, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  if (icon === 'perch') {
    ctx.shadowColor = '#ff4d5e';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4d5e';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s + 8, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = GOLD;
    ctx.stroke();
  } else if (icon === 'lantern') {
    ctx.fillStyle = GOLD;
    rr(ctx, -s * 0.7, -s, s * 1.4, s * 2, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = CYAN;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'gem') {
    ctx.fillStyle = CYAN;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (icon === 'gale') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s, -s + i * s);
      ctx.quadraticCurveTo(0, -s + i * s - 10, s, -s + i * s);
      ctx.stroke();
    }
  } else if (icon === 'nest') {
    ctx.strokeStyle = '#8a5a12';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 4, s * 0.8, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#ff6fb5';
    ctx.beginPath();
    ctx.arc(-s * 0.3, -s * 0.3, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (icon === 'shield') {
    ctx.fillStyle = '#4d8dff';
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, -s * 0.5);
    ctx.lineTo(s * 0.7, s * 0.6);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.7, s * 0.6);
    ctx.lineTo(-s, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (icon === 'spark') {
    ctx.fillStyle = CYAN;
    ctx.beginPath();
    ctx.moveTo(6, -s);
    ctx.lineTo(-s * 0.6, 6);
    ctx.lineTo(0, 6);
    ctx.lineTo(-6, s);
    ctx.lineTo(s * 0.6, -6);
    ctx.lineTo(0, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // goldenBeak
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(s, -s * 0.4);
    ctx.lineTo(s, s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawRelicScreen(ctx, state, time) {
  // The world stays visible behind a dim veil; the cards do the talking.
  ctx.save();
  ctx.fillStyle = 'rgba(10,12,44,0.62)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.restore();
  goldText(ctx, `WAVE ${state.wave} CLEAR!`, 640, 120, 56);
  chunkyText(ctx, `The ${SKYFLOCK_ISLANDS[state.wave - 1].name} migration rests. Choose a Sky Relic:`, 640, 190, 20, CREAM, 'center', 4);
  chunkyText(ctx, `Score ${state.score}   ·   ${state.stats.roosts} roosts   ·   ${state.stats.zaps} crows zapped`, 640, 232, 16, GOLD, 'center', 0);
  state.relicChoices.forEach((relic, i) => {
    const card = SKYFLOCK_LAYOUT.relicCards[i];
    const hover = 1 + 0.02 * Math.sin(time * 3 + i);
    ctx.save();
    ctx.translate(card.x + card.w / 2, card.y + card.h / 2);
    ctx.scale(hover, hover);
    ctx.translate(-(card.x + card.w / 2), -(card.y + card.h / 2));
    goldPanel(ctx, card.x, card.y, card.w, card.h, 18);
    drawRelicIcon(ctx, relic.icon, card.x + card.w / 2, card.y + 78, 34);
    chunkyText(ctx, relic.name.toUpperCase(), card.x + card.w / 2, card.y + 158, 20, GOLD, 'center', 0);
    ctx.font = '16px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    const words = relic.blurb.split(' ');
    let line = '';
    let ly = card.y + 196;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > card.w - 48 && line) {
        ctx.fillText(line, card.x + card.w / 2, ly);
        line = word;
        ly += 24;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, card.x + card.w / 2, ly);
    chunkyText(ctx, `PRESS ${i + 1}`, card.x + card.w / 2, card.y + card.h - 28, 14, '#9fb4ff', 'center', 0);
    ctx.restore();
  });
}

function drawEndScreen(ctx, state, time) {
  // Opaque backdrop: no world-space label ever bleeds through an end screen.
  ctx.save();
  ctx.fillStyle = 'rgba(8,10,30,0.93)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.restore();
  const won = state.screen === 'victory';
  const isl = island(state);
  drawCloud(ctx, 120, 120, 1.0, isl.cloud, time, 6);
  drawCloud(ctx, 1160, 110, 0.8, isl.cloud, time, 8);
  // Victory tableau: two roosted birds on glowing perches, drawn over the
  // backdrop so the end screen still reads as THIS game, not a template.
  if (won) {
    for (const t of [{ x: 200, y: 570, color: 0 }, { x: 1080, y: 570, color: 2 }]) {
      drawPerch(ctx, { x: t.x, y: t.y, color: t.color, index: 0, birdId: 1 }, time);
      drawBird(ctx, { x: t.x, y: t.y, color: t.color, wing: time * 2, state: 'roosted', orbitSpeed: 0 }, time, false);
    }
  }
  if (won) {
    goldText(ctx, 'SANCTUARY SAVED!', 640, 150, 64);
    chunkyText(ctx, 'The Maelstrom is gone. The migration rests in the Skytree.', 640, 222, 20, CREAM, 'center', 4);
  } else {
    chunkyText(ctx, 'THE SKY FALLS SILENT', 640, 150, 56, '#ff5b6e', 'center', 10);
    const reasons = {
      crowd: 'Five unroosted birds crowded the Skytree for too long.',
      scattered: 'The Storm Crows scattered 10 birds in one wave.',
      tree: 'The Skytree lost its last heart to the crows.',
    };
    chunkyText(ctx, reasons[state.defeatReason] || 'The migration is lost.', 640, 222, 20, CREAM, 'center', 4);
  }
  goldPanel(ctx, 390, 250, 500, 240, 18);
  const rows = [
    ['FINAL SCORE', String(state.score)],
    ['ROOSTS', String(state.stats.roosts)],
    ['CROWS ZAPPED', String(state.stats.zaps)],
    ['WAVES CLEARED', String(state.stats.wavesCleared)],
    ['NESTING CHESTS', String(state.stats.chests)],
  ];
  rows.forEach(([label, value], i) => {
    const y = 292 + i * 38;
    chunkyText(ctx, label, 420, y, 15, '#9fb4ff', 'left', 2);
    chunkyText(ctx, value, 860, y, 22, '#ffffff', 'right', 2);
  });
  const b = SKYFLOCK_LAYOUT.restartButton;
  rr(ctx, b.x, b.y, b.w, b.h, 18);
  const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  g.addColorStop(0, '#ffe27a');
  g.addColorStop(0.5, GOLD);
  g.addColorStop(1, '#ff9f1c');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  chunkyText(ctx, won ? '▶  PLAY AGAIN' : '↻  TRY AGAIN  (R)', 640, b.y + b.h / 2 + 2, 24, '#5b2d00', 'center', 0);
}

// --- Particles ---------------------------------------------------------------

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    const life = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = Math.max(0, life);
    if (p.kind === 'sparkle') {
      ctx.fillStyle = p.color;
      const s = p.size * life;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s * 0.35, p.y - s * 0.35);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineTo(p.x + s * 0.35, p.y + s * 0.35);
      ctx.lineTo(p.x, p.y + s);
      ctx.lineTo(p.x - s * 0.35, p.y + s * 0.35);
      ctx.lineTo(p.x - s, p.y);
      ctx.lineTo(p.x - s * 0.35, p.y - s * 0.35);
      ctx.closePath();
      ctx.fill();
    } else if (p.kind === 'feather') {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'heart') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 6);
      ctx.bezierCurveTo(p.x - 10, p.y - 4, p.x - 4, p.y - 12, p.x, p.y - 5);
      ctx.bezierCurveTo(p.x + 4, p.y - 12, p.x + 10, p.y - 4, p.x, p.y + 6);
      ctx.fill();
    } else if (p.kind === 'bolt') {
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 40);
      ctx.lineTo(p.x - 8, p.y - 12);
      ctx.lineTo(p.x + 6, p.y + 4);
      ctx.lineTo(p.x - 4, p.y + 34);
      ctx.stroke();
    } else if (p.kind === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - life) + 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// --- Main entry --------------------------------------------------------------

export function drawGame(ctx, state, particles, time) {
  const isl = island(state);
  if (state.screen === 'title') {
    drawTitle(ctx, state, time);
    return;
  }
  drawSky(ctx, isl, time);
  drawClouds(ctx, isl, time);
  drawFloatingIsland(ctx, time);
  drawSkytree(ctx, state, time);
  for (const perch of state.perches) drawPerch(ctx, perch, time);
  // Roosted birds sit on their perches; the rest fly.
  for (const bird of state.birds) {
    if (bird.state === 'roosted') continue;
    drawBird(ctx, bird, time, state.drag && state.drag.birdId === bird.id);
  }
  for (const bird of state.birds) {
    if (bird.state === 'roosted') drawBird(ctx, bird, time, false);
  }
  for (const crow of state.crows) drawCrow(ctx, crow, time);
  if (state.boss) drawBoss(ctx, state.boss, time);
  if (state.bossZap) drawZapBolt(ctx, state.bossZap, time);
  drawParticles(ctx, particles);
  drawHUD(ctx, state, time);
  // The cover frame carries the baked-in wordmark (staging only): a
  // gold-bordered title banner across the top of the scene, so the name
  // reads as a deliberate title card and never collides with the HUD
  // pills or the Skytree canopy behind it.
  if (state.coverWordmark) {
    // With the top HUD pills hidden, the banner rides higher so it reads
    // as the title card at the top of the frame, not a floating band.
    const wy = state.coverHideTopHud ? 44 : 84;
    goldPanel(ctx, 360, wy, 560, 100, 18);
    goldText(ctx, 'SKYFLOCK', 640, wy + 42, 52);
    chunkyText(ctx, 'GUIDE THE MIGRATION  ·  ZAP THE STORM CROWS', 640, wy + 82, 15, CREAM, 'center', 3);
  }
  if (state.screen === 'relic') drawRelicScreen(ctx, state, time);
  if (state.screen === 'victory' || state.screen === 'defeat') drawEndScreen(ctx, state, time);
}
