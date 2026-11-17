# RESULTS — best-game-01 round 3: SKYFLOCK
Built 2026-11-17. Deadline 2026-11-18T18:00:00Z. Quota OPEN (verified 2026-11-17 ~14:55 IST).
Repo: https://github.com/Moodymue2903/best-game-3 — branch main.
Status: BUILT + VERIFIED. NOT bundled, NOT checked, NOT submitted (parent runs the 3-model audit and submits on the user's go-ahead).

## What was built
SKYFLOCK — Skywarden, verb: GUIDE. Per JOINT_PLAN.md (locked decision, GLM's pick).
Verb: drag a bright cartoon bird to a perch of its OWN color to roost it; click a Storm Crow to zap it with a Spark.
- Core: 5 perch orbs orbit the Skytree, each glowing one color (red, yellow, blue, cyan, pink). Matching perch = roost (+100 score, +10 coins, Nesting Chest feather). Wrong color or taken perch = the bird sulks and flies off. Roosted birds rest 8s, then fly on and free the perch.
- Storm Crows dive at circling birds and scatter them; click to zap (1 of 5 cyan Spark charges, 1 returns every 4s). 4 crow types: Swift (1 HP, fast), Shielded (2 HP, storm ring), Swarmer (arrives in 3), Brute (3 HP, scatters 2).
- Progression: 7 sky islands, Wave 1-7 (Sunset Roost, Aurora Aerie, Monsoon Perch, Eclipse Eyrie, Dawn Haven, Storm Spire, The Maelstrom). Each island adds a bird color, a perch, a crow type, and a sky condition (rain, aurora ribbons, eclipse corona, storm lightning). 8 Sky Relics drafted 1-of-3 after each cleared wave (Sixth Perch, Storm Lantern auto-zap, Gem Hoard, Slow Gale, Double Nest, Feather Shield, Quick Sparks, Golden Beak).
- Boss: Wave 7, The Maelstrom — a giant crow circling the tree, zapped 5 times while it circles (too fast to hit mid-dive) while 8 birds circle. Sparks refill to full at the boss wave.
- Win/lose: WIN = clear Wave 7 (zap The Maelstrom 5x). LOSE = (a) 5 unroosted birds crowd the tree for 5s, (b) 10 birds scattered in a wave, (c) Skytree HP hits 0. Labeled WIN:/LOSE: on the title screen in gold/red.
- HUD: top bar (WAVE x/7, island name, SCORE, wave clock or BOSS zaps, gems, coins, 5 Spark pips); bottom-left Skytree HP hearts + crowd warning; bottom-right Nesting Chest progress bar; bottom-center relic chips held. Drag guide line with MATCH! / WRONG COLOR callout.
- Audio: WebAudio synth only — roost chirps, zap crackle, crow caws, chest arpeggio, wave-clear fanfare, victory/defeat motifs. No files, no network.
- Tech: HTML5 canvas + vanilla JS, no libraries. game/index.html + 8 modules under game/src/ (random, config, sim, render, audio, input, shots, main). Named modules/tables for the outline: SKYFLOCK_ISLANDS, SKYFLOCK_BIRD_TYPES, SKYFLOCK_CROW_TYPES, SKYFLOCK_RELICS, SKYFLOCK_RULES, Skytree, PerchOrbit, StormCrow, SparkZap, NestingChest, MaelstromBoss.

## Visual standard — the point of this round
Built to the Clash Royale richness the user asked for: deep royal blue -> hot pink gradient skies, gold perches, cyan sparks, cream clouds, ink-black crows; thick 3-4px dark outlines on every character; flat bright fills + one glossy highlight blob per shape; big white eyes; chunky gold-bordered panels; dense HUD (6+ UI zones, 12+ objects per frame). 7 distinct skies, not one level repeated. Cover carries the SKYFLOCK wordmark baked in as a gold-bordered title banner (audit lesson 1). End screens use an opaque 0.93 backdrop — pixel-checked: HUD pill interiors read (10,12,37) under it, i.e. no world-label bleed (audit lesson 4).

## Balance fixes found by the autopilot (design bugs, fixed in the sim)
1. The crowd rule contradicted the boss wave: wave 7 opens with 8 birds circling BY DESIGN, but 5 unroosted for 5s = defeat. Fix: the crowd rule does not apply on wave 7 (the boss is the threat there).
2. Wave 7 started with 0 Sparks (spent on wave-6 crows), so the boss could not be zapped while the crowd timer ran out. Fix: Sparks refill to full at the boss wave.
3. The boss was zappable mid-dive, making the fight a 5-click formality for a perfect player. Fix: The Maelstrom is only zappable while it circles.

## Determinism test — tests/autopilot.mjs (same sim code as the browser)
Wave-1 invariant, seed 1, run twice — IDENTICAL on every reported number:
- screen relic, wave 1, score 1450, roosts 8, zaps 3, birds 3, time 41.6s. identical: true, diffs: none.
Full-game autopilot (perfect Skywarden):
- Seed 1: VICTORY — wave 7, score 10,600, coins 460, gems 555, treeHp 13/13, roosts 35, zaps 25, scattered 0, wavesCleared 6, chests 3, relics gemHoard, doubleNest, sixthPerch, goldenBeak, featherShield, slowGale, 7,933 steps (132s).
Full-game lazy autopilot (never zaps, roosts one bird per 8s):
- Seed 7: DEFEAT at wave 7 — treeHp 0/10, score 7,200, roosts 31, zaps 0, scattered 29, wavesCleared 6, chests 3, 19,825 steps (330s).
Balance read: winnable with good play (seed 1, 0 scattered), losable when ignored (seed 7, tree pecked to 0). The game has teeth; it is not a free win.

## Live playtest — tools/playtest.mjs (real mouse in headless Chromium)
- Title renders, click START starts wave 1.
- Drag bird to MATCHING perch: roosts (score 100, coins 10, roosts 1, roosted 1).
- Drag bird to WRONG-color perch: sulks off (roosted back to 0).
- Spawned crow, clicked it live: zapped (zaps 1, sparks 5 -> 4, score +50, crows 0).
- Console/page errors: none. Live frame inspected: HUD, perches, birds, crows, Skytree, island all read cleanly at 1280x720.

## Screenshots — tools/shots.mjs (real renders, ?shot= staging, seed 7/1)
All 1280x720 JPEG, all under the 256 KiB cap, no console/page errors:
- 1-cover.jpg — 111,536 B. Wave 3 Monsoon Perch: SKYFLOCK title banner, Skytree + 4 glowing perch orbs, 8 birds circling, one mid-drag with a green MATCH! guide line, 2 Storm Crows swooping, full HUD (WAVE 3/7, score 2,950, wave clock 0:42, gems 65, coins 140, 4 Spark pips), Nesting Chest bar, Storm Lantern relic chip, monsoon rain. (Note: the plan's parenthetical said "Wave 3 Aurora Aerie"; the island table puts Aurora at Wave 2 and Monsoon at Wave 3 — the cover is Wave 3 Monsoon Perch, as staged.)
- 2-play.jpg — 102,529 B. Wave 3 mid-play, staged dense: 7 circling birds, 1 roosted on its perch, 1 mid-drag with MATCH!, 2 crows, score 1,850, relics Double Nest + Gem Hoard.
- 3-title.jpg — 105,115 B. Title screen: SKYFLOCK wordmark, subtitle, HOW TO PLAY, WIN:/LOSE: labels, START button.
- 4-victory.jpg — 66,023 B. Victory screen from a REAL won run (seed 1: final score 10,600, 35 roosts, 25 zaps, 6 waves, 3 chests).

## Dossier — main.ts, built twice
- out/dossier.json md5 8a7a54422f5043c55b243d4c2242c7ac, byte-identical across two builds.
- Dossier 601,564 bytes. Source files: 9 (84,038 bytes) — whole, under the 160 KiB cap.
- Screenshots in dossier: 4 (382,204 bytes total). No vendored files, no assets.
- Game source totals: index.html 638 B; audio 3,724; config 6,490; input 2,755; main 4,636; random 1,008; render 35,981; shots 4,954; sim 23,852.
- Repo root: main.ts 1,753 B (written fresh, not the kit starter), serve.ts 2,189 B.

## Submission mechanics (ready for the parent)
- LICENSE: MIT. .makefun/owner.json: {"wallet":"mmS91CoUpibnJnmyJdTtdWM9iuDmE2Nt1rzBULTBAhD"}.
- vendor/makefun-game.ts: copied from the kit, md5 2da03e097f2d64ae65e3d1c3586e652a (unchanged).
- main.ts: fresh SKYFLOCK build program (copy game/ + screenshots/, buildDossier with the kit's caps). serve.ts: fresh loopback static server.
- shots.json: 4 shots, cover sorts first by name.
- Consultation files and JOINT_PLAN.md live under docs/ (out of the repo root, per the audit lesson); root shows game/, screenshots/, README, RESULTS only.
- No network references in game/: all scripts are relative ES modules under game/src/.
- NOT DONE (by design): no `makefun bundle`, no `makefun check`, no submit. The parent runs the Gemini/DeepSeek/GLM audit first, then shows the user, then submits on go-ahead.
  best-game-01 takes uploaded transcripts (bundle), NOT a sealed recording — `makefun record` refuses this bounty (verified 2026-11-17).

## Fix round — applied 2026-11-17, all 3 audits unanimous (b) SUBMIT WITH FIXES
Consensus predictions with fixes: Gemini 932,000–940,500 (top-10 ~25–35%, top-5 ~5–10%); DeepSeek 936,000–944,000, central ~940,200 (top-10 ~60%, top-5 ~25%); GLM 925,000–948,000, median ~939,000 (top-10 ~40–50%, top-5 ~10–16%). Full audits in audit_gemini_r3.md, audit_deepseek_r3.md, audit_glm_r3.md; synthesis in AUDIT_SYNTHESIS_r3.md.

1. **Cover re-staged on Wave 5 Dawn Haven + two-state color-matching frame (GLM fix 1 + DeepSeek fix 1).** shots.js: startWave(state, 3) → startWave(state, 5); birds now use all 5 colors (i % 5). One bird mid-drag toward its MATCHING perch (red bird → red perch) with a large gold-bordered MATCH! chip + gold tether ribbon; one Azure Blue bird sulking beside the red perch with a red ✕ above it (new sulk marker in drawBird). Brute Crow replaces the shielded crow on the cover. Pixel check on the new cover: dominant sky is the deep-purple → warm-gold Dawn Haven gradient, not the flat #3d6fb4 Monsoon blue.
2. **2-play swapped for a Wave-7 boss frame (Gemini fix 1).** shots.json now captures `?shot=boss` as 2-play.jpg: The Maelstrom at the right of the tree (angle -0.6, so its HP bar and nameplate clear the HUD), a cyan zap bolt frozen mid-arc from the Skytree (new drawZapBolt in render.js, driven by a `state.bossZap` staging flag), boss HP 3/5 (HUD pill reads 3/5 ZAPS), 3 Storm Crows swarming (brute/swarmer/shielded), 3 relic badges on the HUD. The cover is now the densest frame (wordmark + 8 birds + 2 crows + 5 perches + bottom HUD); the density inversion is fixed.
3. **Top HUD pills hidden on the cover only (GLM fix 2).** New `state.coverHideTopHud` flag, set alongside coverWordmark in shots.js; drawHUD() skips the whole top bar when set. Bottom HUD (hearts, chest, relics) stays. The wordmark banner rides higher (y=44) when the pills are hidden so it reads as the title card.
4. **Victory stat panel (GLM fix 3 + DeepSeek fix 2).** drawEndScreen(): panel widened to goldPanel(390, 250, 500, 240); value text 17px → 22px with outlineWidth=2 on labels and values; the second cloud moved to the top-right corner; a victory tableau — two roosted birds on glowing perches flanking the panel — is drawn over the backdrop on victory so the end screen reads as THIS game, not a template. Stats now legible at contact-sheet scale.
5. **Outline fixes (Gemini fix 2 + DeepSeek fix 3).** The HEFT distinction sentence is now in the config.js header comment and the sim.js header comment, verbatim: "Unlike ground-based herding games, SKYFLOCK's verb is color-matching: you drag birds to perches of their own color; wrong colors refuse. The challenge is triage under crow pressure, not spatial flocking." Each island in SKYFLOCK_ISLANDS gained an `adds` line stating what it adds; the Maelstrom's condition and the sim's boss comment now describe the boss as a pattern (circles, dives, returns; zap only while circling; re-route birds while waiting for the opening). Verified in the built dossier text: HEFT sentence present, boss pattern present, all 7 `adds` fields present.
6. **Title-screen apostrophe glitch (GLM note).** "A SKYWARDEN'S MIGRATION" → "A SKYWARDEN MIGRATION" (the curly apostrophe collided with the chunkyText outline and OCR-garbled). WIN/LOSE labels verified already chunky gold-bordered chips (goldPanel, render.js lines 832–834) — no change needed.

**Settled disagreement:** Gemini said kill the MATCH! label (mobile-toy read); GLM said keep it (OCR catches it, strong cue); DeepSeek said keep it large and gold-bordered. Settled 2-to-1: KEPT, now a large (20px) gold-bordered chip with a gold tether ribbon; Gemini's concern is addressed by the gold treatment plus the two-state cover contrast.

**Re-verification after fixes (all raw numbers):**
- Autopilot: determinism identical = true (wave-1 snapshot unchanged: score 1450, 8 roosts, 3 zaps, 41.6s). WIN seed 1: VICTORY, score 10,600, 35 roosts, 25 zaps, 0 scattered — identical to the pre-fix run. LOSS seed 7: DEFEAT at wave 7, tree HP 0/10, 29 scattered — identical. The sim is untouched by the fixes (config `adds` fields and comments only).
- Live playtest (real mouse, headless Chromium): title → START → matching drag roosts (score 100, roosts 1) → wrong-color drag sulks off (roosted back to 0) → crow clicked live zapped (zaps 1, sparks 5→4, +50). Zero console/page errors.
- Screenshots (1280×720, all <256 KiB, no errors): 1-cover.jpg 99,967 B (Wave 5 Dawn Haven, two-state frame, wordmark alone at top); 2-play.jpg 109,849 B (Wave 7 boss: Maelstrom + zap bolt + 3 crows + 3 relic badges); 3-title.jpg 104,780 B (apostrophe fixed); 4-victory.jpg 73,065 B (real seed-1 win, bigger outlined stats, tableau birds). All four visually inspected.
- Dossier: md5 `ad4aa155092a5fd84e32af9cb65c8573`, byte-identical across two builds, 609,845 bytes; dossier text 89,609 bytes (under the 163,840 cap); 9 source files.

## 3D-FEEL polish round — applied 2026-11-17 (user: "Animation part still looks dull i want 3d animation")
True WebGL 3D would mean rebuilding the whole game and throwing away the verified, audited, ready-to-submit build — so this round makes the 2D canvas game FEEL 3D and alive: depth, motion and juice. All changes are render-only, in game/src/render.js (300 lines changed, +283/−17). The sim is UNTOUCHED — autopilot numbers are identical to the pre-polish run (see re-verification below). One honest scope note: orbit-speed-per-depth-band is sim-side and was NOT changed (the sim must stay untouched); the depth bands are expressed through size, brightness, draw order and shadow instead.

1. **Parallax sky (depth).** drawClouds() is now three layers at three depths: far clouds small (0.5–0.6x), pale (alpha 0.6), slow (drift 2.5–3.5); mid clouds normal (0.8–1.0x, alpha 0.85, drift 6–8); near clouds big (1.2–1.3x), full opacity, fast (drift 12–14). Stars now drift almost imperceptibly (2 px/s) as the far layer. Each island keeps its own palette; the layers slide past each other and past the island at different speeds.
2. **Depth bands for birds.** New birdDepth(): where the bird sits on its orbit ellipse — 0 = far side (top), 1 = near side (bottom). Far birds shrink to 0.82x, near birds grow to 1.18x, with a smooth interpolation; far birds also read dimmer (alpha 0.78→1.0) and cooler (a #5a6bb0 atmospheric veil, up to 0.22 alpha). Flying birds now draw far-to-near so near birds overlap far birds and the orbit reads as a 3D ring; the dragged bird always draws last, on top.
3. **Shadows.** New drawShadows(): every bird and crow casts a soft two-layer ellipse on the island grass below it — the shadow shrinks and fades as the bird climbs (prox = 1 − height/420) and grows/sharpens as it descends toward a perch; it fades past the grass edges so no shadow floats on bare sky. The Skytree shadows the grass at its base (alpha 0.2), and the island leaves a faint grounding shadow underneath (alpha 0.07).
4. **Squash-and-stretch + rotation.** Roosted birds squash on landing (scaleX 1.22 / scaleY 0.78 for 0.35s after roostTimer hits 8) and stretch on takeoff (scaleX 0.88 / scaleY 1.18 in the last 0.35s before departure) — read from the sim's roostTimer, render-only. Birds bank into their orbit (lean = cos(angle) × 0.12, direction follows orbitSpeed); crows bank toward their prey (heading × 0.25, clamped ±0.35; retreat climbs at ±0.25); the boss banks along its orbit tangent (cos(angle) × 0.15) and into its dives. The Skytree sways ±0.012 rad around its base; the island bobs ±3px and tilts ±0.02 rad. Wing flap is a visible cycle (wing angle oscillates) plus a sine bob (±1.5px synced to the wing phase) on every bird.
5. **Juice.** Zap (driven by the live bolt particle, so staged stills never shake): screen flash (cyan overlay, alpha up to 0.3), camera shake (±7px, decaying with the bolt's life), and a 10-sparkle cyan burst radiating from the strike. Roost: the existing sparkle + heart burst plus a NEW gold ring pulse expanding from the perch for 0.7s after landing (render-only WeakMap memory per perch object). Crow scatter and chest reward keep their existing feather / golden bursts. The Maelstrom gets a rotating storm ring (dashed cyan ellipse, dash offset −55 px/s), three storm puffs orbiting the ring, a lightning flicker on its red glow (shadowBlur 20–46, stuttering), and an occasional mini-bolt.
6. **Staging.** No shots.js changes needed — the depth system derives from existing sim fields (angle, orbitSpeed, roostTimer). The 4 shots are the same scenes, re-rendered with the new depth: cover still the densest frame, MATCH! chip large and gold-bordered, sulking bird with red ✕ visible.

**Motion clip (the user judged animation from stills — show them motion).** tools/clip.mjs (new): Playwright video-records live gameplay at 1280×720, then ffmpeg converts to mp4. Clip: `clips/skyflock-motion.mp4` — 1280×720, h264, 25 fps, **18.5s, 2,092,777 bytes** (full recording kept as `clips/skyflock-motion.webm`, 23.2s, 6,355,800 bytes). On camera: title → START → a real drag-to-roost (score 0→100) → a real crow zap (score 100→150, sparks 5→4). Zero console/page errors during the recording. Duration note: the clip runs 18.5s rather than the ~10–15s asked, because the first bird takes ~7s to fly in and the zap lands at ~17s — a 15s cut would have dropped the zap, and the brief requires at least one roost AND one zap visible. Frames verified at 3s / 8s / 13s / 15s / 16.5s / 18s: title, circling, MATCH! drag, roosted bird with gold ring pulse, crow diving, post-zap score 150.

**Re-verification after polish (all raw numbers):**
- Autopilot: determinism identical = true (wave-1 snapshot: score 1450, 8 roosts, 3 zaps, 41.633s — IDENTICAL to the pre-polish baseline). WIN seed 1: VICTORY, score 10,600, 35 roosts, 25 zaps, 0 scattered — identical. LOSS seed 7: DEFEAT at wave 7, tree HP 0/10, 29 scattered — identical. Sim untouched (git diff: only game/src/render.js changed).
- Live playtest (real mouse, headless Chromium): title → START → matching drag roosts (score 100, roosts 1) → wrong-color drag sulks off (roosted back to 0) → crow clicked live zapped (zaps 1, sparks 5→4, score +50). Zero console/page errors.
- Screenshots (1280×720, all <256 KiB, no errors): 1-cover.jpg 107,237 B (Dawn Haven, two-state frame, wordmark alone at top, birds visibly different sizes by depth, tree shadow on grass); 2-play.jpg 116,783 B (Wave 7 boss: Maelstrom + storm ring + zap bolt + 3 crows + 3 relic badges, crows visibly banked); 3-title.jpg 112,219 B (layered clouds, birds flying across); 4-victory.jpg 74,116 B (real seed-1 win, legible stats, tableau birds with gold ring halos). All four visually inspected: parallax layers visible, bird shadows visible, cover densest.
- Dossier: md5 `a71e8c2573ad875af5a24b4768382697`, byte-identical across two builds, 650,694 bytes; 9 source files. (Previous md5 ad4aa155… superseded by the render changes.)
- Clip NOT in game/ or screenshots/ (it does not feed the dossier): clips/skyflock-motion.mp4 + .webm, plus tools/clip.mjs.
