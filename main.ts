// Leonida Legend — entry for make.fun bounty gta6-trophy-guide-01, "Build the best GTA 6 trophy guide".
// Authored for this entry: a complete offline guide and tracker for all 55 official PlayStation 5 trophies
// of Grand Theft Auto VI. app/ holds the whole guide — a five-stage roadmap to the platinum built from the
// official descriptions, one honestly flagged missable trophy (Actions Speak Louder, choice-based per its
// description) with timing cautions for three more, and an original, source-cited guide for every trophy in
// app/data/trophies.json. Progress lives in localStorage and exports/imports as JSON; a spoiler setting
// hides unearned story trophies. The handover below is unchanged in behaviour from the starter: it copies
// app/ and screenshots/ to the output directory and writes dossier.json with the vendored library.
//
// v2 (maximisation pass): the checklist now leads the page — a compact header, a "Next up" panel naming
// the next three unearned trophies in roadmap order, and a one-line stage strip sit above the controls, so
// the cover screenshot shows real trophy cards, not just the roadmap. Counted trophies gained real
// counters (a stepper per card, stored separately, auto-ticking a trophy when its count is reached),
// every trophy gained a roadmap stage number and a practical tip, the steps were rewritten as
// prepare → do → confirm sequences, and the list can be sorted by roadmap order, grade or name.
// The four v2 screenshots: 1-cover.jpg (header, Next up, stage strip, controls and the first trophy
// cards), 2-roadmap.jpg (the five stages and cautions below the list), 3-guide.jpg (Cunning Stunts
// expanded, its counter at 137/250, steps, tip and sources), 4-filters.jpg (Story filter, spoilers on).
//
// A working gta6-trophy-guide-01 entry (Node 22, standard library only): the guide is this directory's app/ folder,
// plain static files a browser opens at app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json. The program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Only the plumbing, not a winner: a plain checklist of the 55 trophies with a one-line hint each. Write a real guide
// for every trophy in your own words, a roadmap to the platinum, filters and a spoiler setting in app/, put 3 or 4 PNG
// or JPEG screenshots of it in screenshots/ (the first by name is the cover; shots.json says which views this
// starter's were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open the local address it prints (port 8080 by default).
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
