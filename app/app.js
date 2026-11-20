// Leonida Legend — GTA VI trophy guide and tracker.
// Offline and self-contained: all state lives in this browser (localStorage),
// progress can be exported and imported as a small JSON file, and the whole
// guide is driven by data/trophies.json, whose every step carries citations
// into the numbered source list rendered on the right.

const PROGRESS_KEY = "leonida-legend-v3-progress";
const COUNTS_KEY = "leonida-legend-v3-counts";
const POINTS = { bronze: 15, silver: 30, gold: 90, platinum: 300 };
const RISK_ORDER = ["missable", "possibly-missable", "watch", "at-risk", "disputed", "unconfirmed", "none"];
const RISK_LABEL = {
  "missable": "Missable",
  "possibly-missable": "Possibly missable",
  "watch": "Watch — timing",
  "at-risk": "At risk",
  "disputed": "Disputed",
  "unconfirmed": "Unconfirmed",
  "none": "No known risk",
};
const STAGES = [
  { n: 1, title: "Story first, saves ready", blurb: "Play the campaign, keep a manual save at the start and end of every chapter, and bank the Chapter 1 balcony meditation on the way past." },
  { n: 2, title: "Finale, chains and strands", blurb: "Finish the story, close the five character chains, and follow the stranger strands that actually count." },
  { n: 3, title: "Activities and one-off moments", blurb: "Sample every activity type, win the races, and take the set-piece trophies while the map is still fresh." },
  { n: 4, title: "The long counters", blurb: "Stunts, scans, vaults and dollars: the counted grinds, tracked one tap at a time on the counters in each guide." },
  { n: 5, title: "100 percent and the platinum", blurb: "Close the completion checklist, clear the fog from the map, and collect the platinum at the end of the road." },
];

const $ = (id) => document.getElementById(id);
const state = {
  trophies: [],
  sources: [],
  disputes: [],
  research: null,
  earned: new Set(),
  counts: {},
  openId: null,
  shield: true,
  search: "",
  kind: "all",
  grade: "all",
  sort: "roadmap",
};

/* ---------- persistence ---------- */
function loadLocal() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) state.earned = new Set(JSON.parse(raw));
    const rawCounts = localStorage.getItem(COUNTS_KEY);
    if (rawCounts) state.counts = JSON.parse(rawCounts);
  } catch (e) { /* a corrupted store should never break the guide */ }
}
function saveLocal() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...state.earned]));
  localStorage.setItem(COUNTS_KEY, JSON.stringify(state.counts));
}

/* ---------- query seeding (used for shareable views and screenshots) ---------- */
function applyQuery() {
  const q = new URLSearchParams(location.search);
  if (q.get("spoilers") === "1") state.shield = false;
  if (q.get("kind")) { state.kind = q.get("kind"); $("kind-filter").value = state.kind; }
  if (q.get("grade")) { state.grade = q.get("grade"); $("grade-filter").value = state.grade; }
  if (q.get("earned")) {
    state.earned = new Set(q.get("earned").split(",").map(Number).filter(Boolean));
  }
  if (q.get("counts")) {
    for (const pair of q.get("counts").split(",")) {
      const [id, n] = pair.split(":");
      if (id && n) state.counts[Number(id)] = Number(n);
    }
  }
  if (q.get("open")) state.openId = Number(q.get("open"));
  return q;
}

/* ---------- helpers ---------- */
const byId = (id) => state.trophies.find((t) => t.id === id);
const isMasked = (t) => state.shield && t.kind === "story" && !state.earned.has(t.id);
function citedBy(n) {
  return state.trophies.filter((t) => t.citations.includes(n)).length;
}
function countStep(target) {
  if (target >= 10000) return 5000;
  if (target >= 100) return 10;
  return 1;
}
function badges(t, withSrc) {
  let h = `<span class="badge grade-${t.grade}">${t.grade}</span>`;
  h += `<span class="badge">${t.kind}</span>`;
  h += `<span class="badge">Stage ${t.stage}</span>`;
  if (t.risk !== "none") h += `<span class="badge risk-${t.risk}">${RISK_LABEL[t.risk]}</span>`;
  if (t.missable) h += `<span class="badge risk-missable">Missable</span>`;
  if (t.hidden) h += `<span class="badge hidden-badge">PSN-Hidden</span>`;
  if (withSrc) h += `<span class="badge src-badge">${t.citations.length} sources</span>`;
  return h;
}

/* ---------- header + audit ---------- */
function renderHeader() {
  const total = state.trophies.length;
  const n = state.earned.size;
  $("earned-count").textContent = `${n}/${total}`;
  $("earned-pct").textContent = `${Math.round((n / total) * 100)}%`;
  let points = 0;
  const per = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of state.trophies) {
    per[t.grade][1]++;
    if (state.earned.has(t.id)) { points += POINTS[t.grade]; per[t.grade][0]++; }
  }
  $("earned-points").textContent = points.toLocaleString("en-US");
  $("grade-counts").textContent =
    `P ${per.platinum[0]}/${per.platinum[1]} · G ${per.gold[0]}/${per.gold[1]} · S ${per.silver[0]}/${per.silver[1]} · B ${per.bronze[0]}/${per.bronze[1]}`;
  $("spoiler-toggle").textContent = `Spoiler shield: ${state.shield ? "on" : "off"}`;
}
function renderAudit() {
  const ts = state.trophies;
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let steps = 0, cited = 0, twoPlus = 0;
  for (const t of ts) {
    grades[t.grade]++;
    for (const s of t.steps) {
      steps++;
      if (s.c.length >= 1) cited++;
      if (s.c.length >= 2) twoPlus++;
    }
  }
  const hidden = ts.filter((t) => t.hidden).length;
  const guidesCiting = ts.filter((t) => t.citations.length > 0).length;
  const missable = ts.filter((t) => t.missable).length;
  const possibly = ts.filter((t) => t.risk === "possibly-missable").length;
  const watchAtRisk = ts.filter((t) => t.risk === "watch" || t.risk === "at-risk").length;
  const r = state.research;
  $("audit-bar").textContent =
    `${ts.length}/${ts.length} official · ${grades.platinum}P ${grades.gold}G ${grades.silver}S ${grades.bronze}B · ` +
    `${hidden} PSN-hidden · ${cited}/${steps} steps cited · ${guidesCiting}/${ts.length} guides cite sources · ` +
    `${twoPlus} backed by 2+ sources · ${r.pages} pages · ${r.sites} sites read ${r.date} · ` +
    `${missable} missable · ${possibly} possibly missable · ${watchAtRisk} watch/at risk · ${state.disputes.length} disputes shown both ways`;
}

/* ---------- checklist (left) ---------- */
function visible(t) {
  if (state.kind !== "all" && t.kind !== state.kind) return false;
  if (state.grade !== "all" && t.grade !== state.grade) return false;
  if (state.search) {
    const hay = `${t.name} ${t.description} ${t.kind} ${t.risk}`.toLowerCase();
    if (!hay.includes(state.search)) return false;
  }
  return true;
}
function sorted(list) {
  const arr = [...list];
  if (state.sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
  else if (state.sort === "grade") {
    const rank = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
    arr.sort((a, b) => rank[a.grade] - rank[b.grade] || a.stage - b.stage || a.id - b.id);
  } else arr.sort((a, b) => a.stage - b.stage || a.id - b.id);
  return arr;
}
function cardHtml(t) {
  const masked = isMasked(t);
  const earned = state.earned.has(t.id);
  const name = masked ? "Hidden story trophy" : t.name;
  const desc = masked ? "Story trophy — turn the spoiler shield off or earn it to reveal." : t.description;
  return `<button type="button" class="card${earned ? " earned" : ""}${state.openId === t.id ? " selected" : ""}" data-open="${t.id}">
    <span class="card-top">
      <input type="checkbox" data-earn="${t.id}" ${earned ? "checked" : ""} aria-label="Mark ${t.name} as earned">
      <span><span class="card-name">${name}</span>
      <span class="badges">${badges(t, true)}</span>
      <span class="card-desc${masked ? " masked" : ""}">${desc}</span></span>
    </span></button>`;
}
function renderChecklist() {
  const list = sorted(state.trophies.filter(visible));
  let h = "";
  if (state.sort === "roadmap" && state.kind === "all" && state.grade === "all" && !state.search) {
    for (const st of STAGES) {
      const items = list.filter((t) => t.stage === st.n);
      if (!items.length) continue;
      const done = items.filter((t) => state.earned.has(t.id)).length;
      h += `<div class="stage-head">Stage ${st.n} — ${st.title} · ${done}/${items.length}</div>`;
      h += items.map(cardHtml).join("");
    }
  } else {
    h = list.map(cardHtml).join("");
  }
  $("checklist").innerHTML = h || `<p class="guide-empty">No trophies match those filters.</p>`;
}

/* ---------- guide (centre) ---------- */
function renderGuide() {
  const t = byId(state.openId);
  if (!t) { $("guide").hidden = true; $("guide-empty").hidden = false; return; }
  $("guide-empty").hidden = true;
  $("guide").hidden = false;
  if (isMasked(t)) {
    $("g-name").textContent = "Hidden story trophy";
    $("g-badges").innerHTML = badges(t, false);
    $("g-desc").textContent = "Shielded to protect the story.";
    $("g-risk").hidden = true;
    $("g-guide").textContent = "This is a story trophy and the spoiler shield is on. Earn it in game, or turn the shield off in the header, to read its guide.";
    $("g-steps").innerHTML = "";
    $("g-counter").hidden = true;
    $("g-tip").textContent = "Story trophies unlock on their own as the campaign advances.";
    $("g-sources").innerHTML = "";
    $("g-earned").hidden = true;
    return;
  }
  $("g-earned").hidden = false;
  $("g-name").textContent = t.name;
  $("g-badges").innerHTML = badges(t, false);
  $("g-desc").textContent = `“${t.description}”`;
  if (t.risk !== "none") {
    $("g-risk").hidden = false;
    $("g-risk-label").textContent = `${RISK_LABEL[t.risk]} — why`;
    $("g-risk-reason").textContent = t.riskReason;
  } else $("g-risk").hidden = true;
  $("g-guide").textContent = t.guide;
  $("g-steps").innerHTML = t.steps.map((s) =>
    `<li>${s.t}<sup class="cite">${s.c.map((n) => `[${n}]`).join(" ")}</sup></li>`).join("");
  if (t.count) {
    $("g-counter").hidden = false;
    renderCounter(t);
  } else $("g-counter").hidden = true;
  $("g-tip").textContent = t.tip;
  const earned = state.earned.has(t.id);
  $("g-earned").textContent = earned ? "Earned ✓ — tap to undo" : "Mark as earned";
  $("g-earned").classList.toggle("is-earned", earned);
  $("g-sources").innerHTML = t.citations.map((n) => {
    const s = state.sources.find((x) => x.n === n);
    const short = s.name.split(" — ")[0];
    return `<li>[${n}] ${short} — <span class="cited-by">cited by ${citedBy(n)} of 55 guides</span></li>`;
  }).join("");
}
function renderCounter(t) {
  const cur = Math.min(state.counts[t.id] || 0, t.count);
  $("count-value").textContent = `${cur.toLocaleString("en-US")}/${t.count.toLocaleString("en-US")}`;
  $("count-fill").style.width = `${(cur / t.count) * 100}%`;
}
function bumpCount(delta) {
  const t = byId(state.openId);
  if (!t || !t.count) return;
  const step = countStep(t.count);
  let v = (state.counts[t.id] || 0) + delta * step;
  v = Math.max(0, Math.min(t.count, v));
  state.counts[t.id] = v;
  if (v >= t.count) state.earned.add(t.id);
  saveLocal();
  renderAll();
}

/* ---------- right panel ---------- */
function renderNextUp() {
  const next = state.trophies
    .filter((t) => !state.earned.has(t.id))
    .sort((a, b) => a.stage - b.stage || a.id - b.id)
    .slice(0, 3);
  if (!next.length) {
    $("next-up").innerHTML = `<p class="next-done">All 55 earned — you are a Leonida Legend.</p>`;
    return;
  }
  $("next-up").innerHTML = next.map((t) => {
    const masked = isMasked(t);
    const why = t.risk !== "none" ? RISK_LABEL[t.risk] : t.count ? `Counter: ${(state.counts[t.id] || 0).toLocaleString("en-US")}/${t.count.toLocaleString("en-US")}` : `Stage ${t.stage} · ${t.kind}`;
    return `<button type="button" class="next-item" data-open="${t.id}">
      <span class="card-name">${masked ? "Hidden story trophy" : t.name}</span>
      <span class="badges">${badges(t, false)}</span>
      <span class="why">${why}</span></button>`;
  }).join("");
}
function renderSources() {
  const r = state.research;
  $("research-note").textContent = `Researched for this guide: ${r.pages} pages across ${r.sites} sites, read ${r.date}. Every step in every guide cites these by number.`;
  $("source-list").innerHTML = state.sources.map((s) =>
    `<li>${s.name} — <span class="cited-by">cited by ${citedBy(s.n)} of 55 guides</span></li>`).join("");
}

/* ---------- roadmap band ---------- */
function renderBand() {
  $("roadmap").innerHTML = STAGES.map((st) => {
    const items = state.trophies.filter((t) => t.stage === st.n);
    const done = items.filter((t) => state.earned.has(t.id)).length;
    return `<div class="stage-row"><span class="stage-title">Stage ${st.n} — ${st.title}</span>
      <span class="stage-meta">${done}/${items.length} earned</span><p>${st.blurb}</p></div>`;
  }).join("");
  const risky = state.trophies
    .filter((t) => t.risk !== "none")
    .sort((a, b) => RISK_ORDER.indexOf(a.risk) - RISK_ORDER.indexOf(b.risk) || a.id - b.id);
  $("risk-watch").innerHTML = risky.map((t) =>
    `<div class="risk-item"><span class="rname">${t.name}</span> <span class="badge risk-${t.risk}">${RISK_LABEL[t.risk]}</span>
     <p>${t.riskReason}</p></div>`).join("");
  $("disputes").innerHTML = state.disputes.map((d) =>
    `<div class="dispute"><span class="d-topic">${d.topic}</span>
     <p><strong>Version A:</strong> ${d.a}</p>
     <p><strong>Version B:</strong> ${d.b}</p>
     <p class="d-call"><strong>Our call:</strong> ${d.call}</p></div>`).join("");
}

/* ---------- wiring ---------- */
function renderAll() {
  renderHeader();
  renderChecklist();
  renderGuide();
  renderNextUp();
  renderBand();
}
function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveLocal();
  renderAll();
}
document.addEventListener("click", (ev) => {
  const earnBox = ev.target.closest("[data-earn]");
  if (earnBox) { ev.stopPropagation(); toggleEarned(Number(earnBox.dataset.earn)); return; }
  const opener = ev.target.closest("[data-open]");
  if (opener) { state.openId = Number(opener.dataset.open); renderAll(); }
});
$("count-minus").addEventListener("click", () => bumpCount(-1));
$("count-plus").addEventListener("click", () => bumpCount(1));
$("g-earned").addEventListener("click", () => { if (state.openId) toggleEarned(state.openId); });
$("spoiler-toggle").addEventListener("click", () => { state.shield = !state.shield; renderAll(); });
$("search").addEventListener("input", (e) => { state.search = e.target.value.trim().toLowerCase(); renderChecklist(); });
$("kind-filter").addEventListener("change", (e) => { state.kind = e.target.value; renderChecklist(); });
$("grade-filter").addEventListener("change", (e) => { state.grade = e.target.value; renderChecklist(); });
$("sort-select").addEventListener("change", (e) => { state.sort = e.target.value; renderChecklist(); });
$("export-btn").addEventListener("click", () => {
  const payload = JSON.stringify({ earned: [...state.earned], counts: state.counts }, null, 2);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  a.download = "leonida-legend-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
$("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  file.text().then((text) => {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data.earned)) state.earned = new Set(data.earned.map(Number));
      if (data.counts && typeof data.counts === "object") state.counts = data.counts;
      saveLocal();
      renderAll();
    } catch (err) { /* ignore a file that is not a progress export */ }
  });
});
$("reset-btn").addEventListener("click", () => {
  state.earned = new Set();
  state.counts = {};
  saveLocal();
  renderAll();
});

/* ---------- boot ---------- */
async function boot() {
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  state.trophies = data.trophies;
  state.sources = data.sourcesList;
  state.disputes = data.disputes;
  state.research = data.research;
  loadLocal();
  const q = applyQuery();
  saveLocal();
  renderAudit();
  renderSources();
  renderAll();
  if (q.get("view") === "roadmap") {
    requestAnimationFrame(() => $("roadmap-band").scrollIntoView({ block: "start" }));
  }
}
boot();
