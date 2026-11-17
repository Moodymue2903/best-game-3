# SKYFLOCK — A Skywarden's Migration

**best-game-01 round 3.** You are a Skywarden tending a floating sanctuary. Each wave, a migration of bright cartoon birds flies in from the edges and circles the Skytree, looking for a perch. Drag a bird to a perch of its **own color** to roost it — 8 roosts clear a wave. Storm Crows dive in to scatter unroosted birds; click one to zap it with a Spark. Clear Wave 7 by zapping The Maelstrom 5 times while it circles.

- **WIN:** Clear Wave 7 — zap The Maelstrom 5 times.
- **LOSE:** 5 unroosted birds crowd the tree for 5s · 10 birds scattered in a wave · Skytree HP hits 0.
- **Controls:** drag birds to matching perches · click crows to zap · Space zaps the nearest crow · R restart · M mute.
- **Progression:** 7 sky islands (Sunset, Aurora, Monsoon, Eclipse, Dawn, Storm, Maelstrom), 5 bird types, 4 Storm Crow types, 8 Sky Relics drafted one per cleared wave, Nesting Chest rewards.
- **Tech:** HTML5 canvas + vanilla JS, WebAudio synth only, no network requests, no libraries. `game/index.html` opens in desktop Chrome and plays offline.

## Verify

```sh
node tests/autopilot.mjs   # determinism + full win (seed 1) + full loss (seed 7)
node tools/playtest.mjs    # real mouse in headless Chromium: drag, roost, zap
node tools/shots.mjs       # 4 real-render screenshots into screenshots/
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # dossier build
```

## Results

See [RESULTS_round3.md](RESULTS_round3.md).
