// Leonida Legend — GTA VI trophy guide and tracker.
// Loads only data/trophies.json (a relative file inside app/), keeps earned
// progress in localStorage, and renders the checklist, filters, spoiler
// setting, roadmap deep links and per-trophy cited guides. No network use
// beyond that one local file, so the guide works fully offline.

const STORAGE_KEY = 'leonida-legend-progress-v1';
const ONLINE_EMPTY_TEXT = 'No online trophies in the official 55 — every trophy is earned in single player per the official descriptions.';

const KIND_LABELS = {
  story: 'Story',
  side: 'Side',
  collectibles: 'Collectibles',
  activities: 'Activities',
  world: 'World',
  money: 'Money',
};

const params = new URLSearchParams(window.location.search);

const listEl = document.getElementById('trophy-list');
const summaryEl = document.getElementById('list-summary');
const progressTextEl = document.getElementById('progress-text');
const progressFillEl = document.getElementById('progress-fill');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const onlyUnearnedEl = document.getElementById('only-unearned');
const statusEl = document.getElementById('status');
const chipsEl = document.getElementById('kind-chips');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const validIds = new Set(trophies.map((t) => t.id));
const gradeTotals = {};
for (const t of trophies) gradeTotals[t.grade] = (gradeTotals[t.grade] ?? 0) + 1;

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((id) => validIds.has(id));
  } catch {
    return null;
  }
}

// Earned state: localStorage wins; the ?earned= list only pre-marks the
// display when nothing has been saved yet (used for screenshots/sharing).
let earned = new Set(loadStored() ?? []);
if (localStorage.getItem(STORAGE_KEY) === null && params.has('earned')) {
  earned = new Set(
    params.get('earned').split(',').map((s) => Number(s.trim())).filter((id) => validIds.has(id)),
  );
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

// Filter state, seeded from the URL so screenshot views are reproducible:
// ?kind=, ?grade=, ?spoilers=1, ?open=<trophy id>, ?view=roadmap.
let activeKind = 'all';
const kindParam = params.get('kind');
if (kindParam && [...chipsEl.querySelectorAll('.chip')].some((c) => c.dataset.kind === kindParam)) {
  activeKind = kindParam;
}
for (const chip of chipsEl.querySelectorAll('.chip')) {
  chip.classList.toggle('is-active', chip.dataset.kind === activeKind);
}
const gradeParam = params.get('grade');
if (gradeParam && [...gradeEl.options].some((o) => o.value === gradeParam)) gradeEl.value = gradeParam;
if (params.get('spoilers') === '1') spoilersEl.checked = true;

const openParam = Number(params.get('open'));
const expanded = new Set(validIds.has(openParam) ? [openParam] : []);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatCount(t) {
  const n = t.count.toLocaleString('en-US');
  return t.kind === 'money' ? `Target: $${n} in total — tick the card when reached.` : `Target count: ${n} — tick the card when complete.`;
}

function matchesFilters(t) {
  if (activeKind === 'online') return false;
  if (activeKind === 'missable' && !t.missable) return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && t.kind !== activeKind) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (onlyUnearnedEl.checked && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false;
  return true;
}

function renderProgress() {
  progressTextEl.textContent = `${earned.size} of ${trophies.length} earned`;
  progressFillEl.style.width = `${(earned.size / trophies.length) * 100}%`;
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const done = trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    document.getElementById(`count-${grade}`).textContent = `${done} / ${gradeTotals[grade]}`;
  }
}

function buildCard(t) {
  const isEarned = earned.has(t.id);
  const spoilerHidden = spoilersEl.checked && t.kind === 'story' && !isEarned;
  const card = el('article', 'card' + (isEarned ? ' is-earned' : ''));
  card.id = `trophy-${t.id}`;

  const head = el('div', 'card-head');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    render();
  });
  head.append(box, el('h3', '', spoilerHidden ? 'Hidden story trophy' : t.name));
  card.append(head);

  const badges = el('div', 'badges');
  badges.append(el('span', `badge grade-${t.grade}`, t.grade));
  badges.append(el('span', 'badge kind-badge', KIND_LABELS[t.kind] ?? t.kind));
  if (t.missable) badges.append(el('span', 'badge missable-badge', 'Missable'));
  if (t.hidden) badges.append(el('span', 'badge hidden-badge', 'Hidden'));
  card.append(badges);

  if (spoilerHidden) {
    card.append(el('p', 'spoiler-note', 'Story spoiler hidden. Earn this trophy, or turn off “Hide story spoilers”, to reveal its name, description and guide.'));
    return card;
  }

  card.append(el('p', 'desc', `“${t.description}”`));
  if (t.count !== null && t.count !== undefined) card.append(el('p', 'count-hint', formatCount(t)));

  const toggle = el('button', 'guide-toggle', expanded.has(t.id) ? 'Hide guide' : 'Guide & sources');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', String(expanded.has(t.id)));
  toggle.addEventListener('click', () => {
    if (expanded.has(t.id)) expanded.delete(t.id);
    else expanded.add(t.id);
    render();
  });
  card.append(toggle);

  if (expanded.has(t.id)) {
    const panel = el('div', 'guide-panel');
    panel.append(el('p', '', t.guide));
    if (t.missableNote) panel.append(el('p', 'note', t.missableNote));
    const steps = el('ol');
    for (const step of t.steps ?? []) steps.append(el('li', '', step));
    if (steps.childElementCount) panel.append(steps);
    const sources = el('p', 'sources');
    const label = el('strong', '', 'Sources: ');
    sources.append(label, document.createTextNode((t.sources ?? []).join(' · ')));
    panel.append(sources);
    card.append(panel);
  }
  return card;
}

function render() {
  renderProgress();
  listEl.replaceChildren();
  if (activeKind === 'online') {
    listEl.append(el('div', 'empty-state', ONLINE_EMPTY_TEXT));
    summaryEl.textContent = 'Online filter: the official list of 55 contains no online trophies.';
    return;
  }
  const visible = trophies.filter(matchesFilters);
  for (const t of visible) listEl.append(buildCard(t));
  if (visible.length === 0) {
    listEl.append(el('div', 'empty-state', 'No trophies match the current filters. Clear the search or pick another filter.'));
  }
  summaryEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies · ${earned.size} earned overall.`;
}

chipsEl.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  activeKind = chip.dataset.kind;
  for (const c of chipsEl.querySelectorAll('.chip')) c.classList.toggle('is-active', c === chip);
  render();
});
searchEl.addEventListener('input', render);
gradeEl.addEventListener('change', render);
spoilersEl.addEventListener('change', render);
onlyUnearnedEl.addEventListener('change', render);

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  statusEl.textContent = `Exported ${earned.size} earned trophies.`;
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('expected a JSON array of trophy ids');
    const clean = ids.map((id) => Number(id)).filter((id) => validIds.has(id));
    earned = new Set(clean);
    save();
    render();
    statusEl.textContent = `Imported ${clean.length} earned trophies.`;
  } catch (err) {
    statusEl.textContent = `Import failed: ${err.message}. Nothing was changed.`;
  }
  event.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (!window.confirm('Reset all trophy progress? This clears every tick in this browser.')) return;
  earned = new Set();
  save();
  render();
  statusEl.textContent = 'Progress reset.';
});

render();

if (validIds.has(openParam)) {
  document.getElementById(`trophy-${openParam}`)?.scrollIntoView({ block: 'center' });
} else if (params.get('view') === 'roadmap') {
  document.getElementById('roadmap')?.scrollIntoView();
} else if (kindParam || gradeParam) {
  // A shared filtered link should land on the filtered list, not the top.
  document.querySelector('.controls')?.scrollIntoView();
}
