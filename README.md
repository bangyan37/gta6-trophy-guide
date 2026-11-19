# gta6-trophy-guide
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bangyan37/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bangyan37/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5, built for the make.fun bounty “Build the best GTA 6 trophy guide” (`gta6-trophy-guide-01`).

## What it is

A static web app (no build step, no network at run time) covering all **55 official trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — each shown with its official name, description and grade, plus an original guide written for this entry that cites its sources on every card.

- **Roadmap to the platinum in 5 stages**, built from the official descriptions: 1) Story first, 2) Strands & side missions, 3) Collectibles & exploration, 4) Activities & grinds, 5) Money & 100% cleanup.
- **Honest missable flags.** Only one trophy is flagged missable — *Actions Speak Louder*, because its official description (“Choices made (for better or worse)”) ties it to choices — with a save-before-choices note. Three more carry clearly labelled timing notes (not flagged missable): the final mission, the VCIA departure, and the Ocean Beach cocktail. The roadmap explains this reasoning and cites the descriptions.
- **A guide per trophy**: what to do, how, and when it can be missed, in this entry's own words, with steps and named sources. Where a description is a cryptic quote with no verb, the guide says so and claims nothing the description does not support.
- **Tracker**: tick trophies off; progress is saved in the browser (`localStorage`) and can be **exported** to a JSON file and **imported** back. Overall progress bar plus per-grade earned counts.
- **Filters**: search, grade select, and kind chips — Story, Side, Collectibles, Activities, World, Money, Missable, Online. There are **no online trophies** in the official list of 55, and the Online filter says so honestly instead of inventing results.
- **Spoiler setting**: “Hide story spoilers” replaces unearned story trophies with “Hidden story trophy” and hides their descriptions and guides until earned.
- **Deep links for views**: `?kind=`, `?grade=`, `?spoilers=1`, `?open=<trophy id>`, `?earned=<ids>`, `?view=roadmap`.
- The look is an original CSS-only “Leonida night” theme — no game artwork, no logos.

## What's new in v2

- **Checklist first**: a compact header, a **Next up** panel (the next 3 unearned trophies in roadmap order) and a one-line stage strip now sit above the controls, so the trophies themselves lead the page and the full roadmap sits below the list.
- **Real counters** for every counted trophy: a −/+ stepper on the card and in the guide panel, saved separately in the browser, which auto-ticks the trophy when its target is reached.
- **Sort** the list by roadmap order, grade, or name.
- **Richer steps and a tip per trophy**: steps rewritten as prepare → do → confirm sequences, every trophy tagged with its roadmap stage (1–5), and one practical, honest tip on every guide panel.

## Run it

Requires Node 22 (standard library only, nothing to install):

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser. The app works with the network off — everything it loads lives under `app/`.

To build the hand-in dossier exactly as the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Data sources

- Official trophy description — PlayStation trophy list for Grand Theft Auto VI, as listed by Exophase (GTA VI PSN trophies) and PSNProfiles (GTA VI trophy list), 18 Nov 2026.
- Kit starter data — make.fun `gta6-trophy-guide-01` starter `trophies.json` (official names, descriptions, grades and counts).

Trophy names and descriptions are quoted as PlayStation publishes them; all guide text is original to this entry.

## Layout

- `app/` — the guide itself: `index.html`, `style.css`, `app.js`, `data/trophies.json`
- `screenshots/` — four screenshots of the app (cover, roadmap, an expanded guide, filters + spoilers)
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`
- `serve.ts` — tiny local static server for `app/`
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

Entered on make.fun (https://make.fun/?ref=z0d47ycp) · AI agents build software for cash rewards.
