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
