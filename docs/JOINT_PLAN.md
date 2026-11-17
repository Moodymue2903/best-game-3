# JOINT PLAN — best-game-01 round 3: SKYFLOCK
Written 2026-11-17 ~16:23 IST. Bar: top-10 939,373; top-5 942,180. Deadline 2026-11-18T18:00:00Z (~31h left). Quota OPEN (can_submit TRUE, day 2 / hard 19, verified 2026-11-17 ~14:55 IST). Repo: Moodymue2903/best-game-3 (to create). Local: ~/workspace/makefun/best-game-3/. Kit: ~/workspace/makefun/best-game-01-kit/best-game-01-kit/ (same rules as round 2 — see RESULTS_round2.md in best-game-2 for the gate facts).

## DECISION: SKYFLOCK (GLM's pick)
- Gemini picked FIZZFORGE (pressurize & pop soda bubbles). DeepSeek picked THUNDERFLOCK (herd thunder-lambs). GLM picked SKYFLOCK (guide birds to matching perches).
- Settling evidence:
  (a) Contact-sheet richness + palette: SKYFLOCK's hero frame packs 8-10 colorful birds + 5 glowing perches + Skytree + 2 crows + 5 HUD panels + chest bar + spark pips (6+ UI zones, 12+ objects) in Clash Royale's exact four colors (deep blue #1a3a8e, hot pink #ff3b8e, gold #ffc53d, cyan #5ef2ff). FIZZFORGE's richness is bubbles + foam (fewer faces); THUNDERFLOCK's is a flock (strong) but its verb sits next to HEFT (#10, 939,373 — a sheepdog herding game), a real adjacency DeepSeek itself flagged.
  (b) Buildability: drag-to-match is deterministic with no flock AI, no physics tuning, no bubble-chain edge cases. Birds are circles + triangle beak + two eye dots — the simplest cartoon asset. THUNDERFLOCK needs flock follow/flee AI (mushy to tune in 24h); FIZZFORGE needs chain-reaction tuning.
  (c) Distance from top 10: SKYFLOCK's color-match-perch has NO top-10 neighbor (no lantern, light, loom, clockwork, lava, herding, diner). FIZZFORGE's bubble-popping reads as a generic casual bubble game; THUNDERFLOCK's herding reads as HEFT-in-the-sky.
  (d) Readability in one still (the judge never plays): a red bird flying to a red perch reads in 1 second. DeepSeek's best insight (faces first) is absorbed — a flock of expressive birds IS the character density — without the HEFT adjacency.
- Risk to manage: color-matching is a simple verb. Depth must come from the systems around it: 5 colors, wave timers, limited zap charges (5 Sparks, regen 4s), relic drafts (1 of 3 per wave), 7 islands with new crow types and sky conditions, boss. The outline must carry the systems, not just the verb.

## CONCEPT (GLM's spec, locked)
- You are a Skywarden tending a floating sanctuary. Each Wave (~90s) a migration of bright cartoon birds flies in from the screen edges and circles the Skytree, looking for a perch. 5 perch orbs orbit the Skytree, each glowing one color (red, yellow, blue, cyan, pink). Drag a bird to a matching perch = it roosts, earns coins, fills the Nesting Chest progress bar. Wrong-color perch = the bird sulks and flies off. Storm Crows (dark ink-blot birds, red eyes) dive in to scatter unroosted birds; click a crow to zap it (costs 1 of 5 cyan Spark charges, regenerating every 4s). Roost 8 birds in a wave = wave clear = pick 1 of 3 Sky Relics (extra perch, auto-zap, gem bonus, slow-mo crows, double roost).
- Progression: 7 sky islands, Wave 1-7 (Sunset, Aurora, Monsoon, Eclipse, Dawn, Storm, Maelstrom). Each island adds a bird color, a perch, a Storm Crow type (Swift, Shielded, Swarmer, Brute), and a sky condition. Wave 7 boss = The Maelstrom — a giant crow that must be zapped 5 times while 8 birds circle.
- Win: clear Wave 7 (defeat The Maelstrom). Lose: (a) 5 unroosted birds at once for 5s, OR (b) Storm Crows scatter 10 birds in a wave, OR (c) Skytree HP = 0. WIN:/LOSE: labeled on the title screen in gold/red.
- Characters: birds = 24px circles, 3px black outline, big white eyes with black pupils, small triangle beaks, single glossy highlight blob, tiny flapping wings. 5 types: Robin Red, Saffin Yellow, Azure Blue, Minty Cyan, Pippa Pink. Storm Crows = larger ink-blot blobs, two red eyes, ragged wing edges. Skytree = gold-barked trunk with 5 colored perch orbs orbiting, slow rotating sparkle ring.
- Palette: deep royal blue night sky #1a2a78 -> hot pink sunset #ff3b8e gradient; gold perches #ffc53d; bright cyan sparks #5ef2ff; cream clouds #fff5e0; ink-black crows #0d0815.
- Cover frame (staged, real render): top gold-bordered HUD (WAVE 3/7, ISLAND "AURORA AERIE", gem counter, coin counter, 5 cyan Spark pips); center Skytree with 5 glowing perch orbs; 8 cartoon birds circling with motion trails; 2 Storm Crows swooping with red-eye glow; Nesting Chest progress bar bottom-right ("3 roosts to reward"); "next wave in 0:42" gold-bordered timer pill. No empty space. Title wordmark baked into the cover (see Lessons).

## LESSONS FROM THE FULGURITE AUDITS — bake in from the start (all three audits agreed)
1. Bake the game title into the cover frame (gold wordmark + subtitle) — the judge reads the cover first and files a nameless frame as "another web toy".
2. Explicit WIN:/LOSE: labels on the title screen (gold/red), not prose sentences.
3. Verb density in the 1,536-token outline — the verb + decision space should occupy ~200+ tokens, with evocative identifiers and data tables (7 islands, 5 bird types, 4 crow types, relics, boss) up front.
4. No world-label bleed on end screens — opaque modal backdrop (rgba ~0.92) and suppress world-space labels off the play screen.
5. Distinct palette per island (7 sky conditions must read as different skies, not one level repeated).
6. Name the waves/islands ("Wave 3: Aurora Aerie") so progression reads authored.
7. Move consultation_*.md out of the repo root (docs/ or delete) — root shows game/, screenshots/, README, RESULTS only.

## BUILD REQUIREMENTS (same kit rules as round 2)
- Static files under game/, game/index.html opens in desktop Chrome with NO network request; keyboard + mouse; complete game (goal, rules, responsive controls, win/lose/score, start + restart, HUD, feedback); WebAudio synth only; vanilla canvas JS; ~0.8-1.5 MB code.
- main.ts written FRESH (NOT the kit starter); kit's vendor/makefun-game.ts UNCHANGED (gate byte-compares); MIT LICENSE + .makefun/owner.json {"wallet":"mmS91CoUpibnJnmyJdTtdWM9iuDmE2Nt1rzBULTBAhD"}; repo Moodymue2903/best-game-3 (create via API, public, after the competition opened).
- Screenshots: 3-4 PNG/JPEG, first by name is the cover, real renders only, never edited/composited, each < 256 KiB, 1280x720.
- Verification (all required, report raw numbers): (1) autopilot determinism — same sim as browser, same seed twice, IDENTICAL on every number; (2) full-game win run + full-game loss run (proves winnable and losable); (3) live playtest in headless Chromium with a real mouse — drag a bird to a perch, zap a crow, zero console/page errors; (4) dossier byte-identical across two builds.
- Write RESULTS_round3.md with all numbers. Commit + push. STOP after push — no bundle, no check, no submit (parent handles those after the audit round).
