# AUDIT SYNTHESIS — best-game-01 round 3: SKYFLOCK
Audits received 2026-11-17 ~16:38–16:41 IST. Bar: top-10 939,373; top-5 942,180. Deadline 2026-11-18T18:00:00Z.

## Verdicts — UNANIMOUS (b) SUBMIT WITH FIXES
| Auditor | As-is | With fixes | Top-10 | Top-5 |
|---|---|---|---|---|
| Gemini | 924,000–933,000 | 932,000–940,500 | ~25–35% | ~5–10% |
| DeepSeek | — | 936,000–944,000 (central ~940,200) | ~60% | ~25% |
| GLM (repo + OCR/pixel, most evidence-grounded) | 905,000–930,000 (median ~918,000) | 925,000–948,000 (median ~939,000) | ~40–50% | ~10–16% |

Consensus: with fixes this is a coin-flip top-10 entry (median predictions 939,000–940,200 — right at the bar); without fixes it is below the bar. Top-5 is a stretch (5–25%) — the verb is a lighter casual loop than the top-5 physics/tactical systems, and the hero image takes 1.5–2s to parse vs 0.5s for Lanternkeep/LOOM. Clone risk: NOT a clone of anything (HEFT adjacency is the only live read, and it is manageable — see fix 4). Incomplete: none (determinism, win/loss paths, zero errors, caps, license, owner.json all verified).

## Settled disagreement — the MATCH! label
Gemini says KILL the MATCH! label (reads as a 2010s mobile color-sort toy). GLM says KEEP it (OCR catches it cleanly, it is a strong readable cue for the verb). DeepSeek says keep it but make it large, gold-bordered, integrated into the HUD language. SETTLED 2-to-1: KEEP it, rendered large and gold-bordered. Gemini's underlying concern (the mobile-toy read) is addressed by the gold treatment plus the two-state cover contrast in fix 1.

## Consensus fix list (ordered by impact — the fix round)
1. **Re-stage the cover on Wave 5 Dawn Haven + make it a two-state color-matching frame (GLM fix 1 + DeepSeek fix 1, highest impact, ~15 min).** The current cover is Wave 3 Monsoon — pixel analysis: dominant color #3d6fb4 flat mid-blue, "overcast web game", second-least-saturated island. Dawn Haven is deep blue #3a2a8e → warm gold #ffb347 with all 5 bird colors and all 4 crow types. In the same frame: one bird mid-drag toward its MATCHING perch (large gold-bordered MATCH! cue + guide line) AND one bird visibly sulking/refusing at a WRONG-color perch (small ✕/frown). That contrast is the entire verb in one frame and is the HEFT mitigation. Keep the wordmark banner; keep the bottom HUD (hearts, chest, relics).
2. **Swap 2-play for a Wave-7 boss / relic-draft frame (Gemini fix 1; GLM agrees the cover must out-density play).** Capture Wave 7: The Maelstrom mid-zap (cyan lightning arc), storm crows swarming, active relic badges on the HUD — or the 1-of-3 relic draft on the Aurora palette. This also fixes GLM's density inversion (2-play currently denser than the cover) and makes the boss visible on the contact sheet at all.
3. **Hide the top HUD pills on the cover only (GLM fix 2, ~15 min).** state.coverHideTopHud flag set alongside coverWordmark in shots.js; drawHUD() early-returns for the top bar (lines 693–725) when set. The wordmark reads alone; the bottom HUD stays.
4. **Victory stat panel: bigger text + outline + a visible game object (GLM fix 3 + DeepSeek fix 2, ~30 min).** drawEndScreen() (render.js lines 1015–1027): value text 17px → 22px, outlineWidth=2 on labels and values, widen panel to goldPanel(ctx, 390, 250, 500, 240, 18). Ensure at least one recognizable game object (bird, Skytree, perch orb) is visible on the victory frame so it does not read as a generic stats template.
5. **Outline fixes (Gemini fix 2 + DeepSeek fix 3).** Verify the named tables (SKYFLOCK_ISLANDS, SKYFLOCK_BIRD_TYPES, SKYFLOCK_CROW_TYPES, SKYFLOCK_RELICS, etc.) sit prominently at module tops. Add ONE sentence early naming the HEFT distinction: "Unlike ground-based herding games, SKYFLOCK's verb is color-matching: you drag birds to perches of their own color; wrong colors refuse. The challenge is triage under crow pressure, not spatial flocking." One line per island on what changes. Describe the Maelstrom boss as a pattern (moves between perches, forcing re-routing), not "click 5 times".
6. **Check the title-screen apostrophe glitch (GLM note, 5 min).** OCR reads "A SKYWARDEN(:S*#MIGRATION" — the apostrophe in "SKYWARDEN'S" collides with the chunkyText outline. Check the live render; if real, drop the apostrophe or swap the glyph. Also verify WIN/LOSE labels are chunky gold-bordered chips (DeepSeek fix 4).

Total fix time ~50–60 min. After fixes: re-verify everything (autopilot invariant, full-game win + loss, live playtest, screenshots <256 KiB, dossier byte-identical twice with a new md5), commit + push, then bundle + check + submit on the user's go-ahead.
