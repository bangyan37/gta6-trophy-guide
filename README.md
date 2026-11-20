# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bangyan37/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bangyan37/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that guides and tracks all **55 official Grand Theft Auto VI trophies** (PlayStation 5): 1 platinum, 2 gold, 6 silver, 46 bronze. Open it in any desktop browser — no build step, no server, no network.

**165 of 165 guide steps carry numbered citations, and every step is backed by 2+ sources**, drawn from a numbered source list researched on 2026-11-20 (10 pages across 9 sites, including PowerPyx, GTABase, Exophase, eGamers, KeenGamer, GTA-Zone, Beebom, OutputLag and GameMapa, on top of the official PlayStation trophy list).

## What is inside

- **Checklist-first layout, three panels.** Left: the checklist grouped by roadmap stage, each card tagged with grade, kind, stage, risk and PSN-hidden status, plus how many sources its guide cites. Centre: the open guide. Right: Next Up and the global source list with a live "cited by N of 55 guides" count per source.
- **A guide per trophy, cited per step.** The official description quoted verbatim, a written guide in our own words, three numbered steps with citations like [2] [11] on every step, a strategy tip, and a "Sources for this guide" list.
- **Your Count counters.** Every counted trophy (250 stunts, 100 scans, $250,000 laundered, and the rest) has a −/+ counter with an adaptive step; reaching the target marks the trophy earned automatically.
- **A layered risk taxonomy, not a single missable flag.** One missable (Actions Speak Louder), one possibly missable (Positive Mental Attitude, whose Chapter 1 balcony meditation vanishes with the chapter), timing watches, at-risk character chains, unconfirmed triggers, and disputed figures — each with a one-sentence, evidence-based reason on its card and in its guide.
- **Sources differ — both versions shown.** Six live disputes (15 vs 18 meditations, whether the balcony meditation is required, quest-chain windows, 12 vs 2 shooting ranges, which stranger strands count, and trophy vs checklist targets) are printed from both sides with an "Our call" verdict and its reasoning.
- **A quantitative audit bar.** 55/55 official · 1P 2G 6S 46B · 6 PSN-hidden · 165/165 steps cited · 55/55 guides cite sources · 165 backed by 2+ sources · 10 pages · 9 sites read 2026-11-20 · 1 missable · 1 possibly missable · 8 watch/at risk · 6 disputes shown both ways — every number computed from the data file at runtime, never typed in.
- **Progress that stays yours.** Earned trophies and counters are saved in the browser (localStorage), with Export / Import as JSON and a Reset. The header shows earned count, percentage and PSN points (bronze 15, silver 30, gold 90, platinum 300; 1,350 total).
- **Spoiler shield.** Story trophies stay masked until earned or until you switch the shield off. Filters for kind and grade, text search, three sort orders, and URL seeding (`?kind=`, `?grade=`, `?spoilers=1`, `?open=`, `?earned=`, `?counts=`, `?view=roadmap`) round it out.

## Run it locally

```sh
node serve.ts            # serves app/ on http://localhost:8080
# or: node serve.ts --port 8093
```

Then open the printed address in a desktop browser. To produce the judge's hand-in bundle instead:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide app (static, offline).
- `app/data/trophies.json` — the 55 trophies with guides, steps, citations, risk fields, the numbered source list, the research record and the disputes.
- `main.ts` — the hand-in entrypoint (copies `app/` and `screenshots/`, writes `dossier.json` via the vendored library).
- `serve.ts` — a tiny local static server for development.
- `vendor/makefun-frontend.ts` — the kit's library, shipped unchanged.
- `screenshots/` — four real renders of this app, described by `shots.json`.

## Sources and honesty notes

Trophy names, descriptions and grades are the official PlayStation ones. All guide text is written for this tracker from the sources in its numbered list; where sources disagree, the disagreement is shown rather than hidden, and where a trigger is still unconfirmed, the guide says so instead of inventing steps. Five trophies were still unconfirmed in the sources read: In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There and Ten Pin.

## License

MIT — see `LICENSE`.
