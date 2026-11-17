// SKYFLOCK — a best-game-01 entry (Node 22, standard library only).
// The game is the static game/ folder beside this file: index.html and
// its ES modules, no library, no network request, playable offline in
// desktop Chrome. This program hands it in: it copies game/ and
// screenshots/ into /output and writes /output/dossier.json, the summary
// the judge reads, with the vendored make.fun library
// (vendor/makefun-game.ts, unchanged from the kit). Serve it locally with
// `node serve.ts`, then open http://localhost:8080. Outside the grader's
// container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name) {
  const src = join(here, name);
  if (!existsSync(src)) return;
  cpSync(src, join(out, name), { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree('game');
copyTree('screenshots');

// The scorer's caps, from the kit: the dossier text is capped at 160 KiB,
// screenshots at 4 files of 256 KiB, game/ at 993 files and 48 MiB in all,
// every game path at most 1000 bytes. An entry over any of them is refused,
// so the build fails loudly here instead of silently at the gate.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
