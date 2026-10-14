// Civiclasse trainer area: access code -> licence + content (Apps Script action `access`), then mock exams, answer
// keys, quick marking, progress sheets, scripted interview cards and the question bank. Learner names and marks stay in
// this browser (localStorage); the code stays in this tab (sessionStorage).
import { learnerSheet, keySheet } from './lecture-b2.mjs';
import { buildExam, parseAnswers, score, PLAN, THEME_LABEL, MENTIONS, LETTERS, EXAM_SIZE, PASS_MARK, DURATION_MIN } from './examen.mjs';

const CFG = window.CIVI_CFG || {};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const store = {
  get: (s, k) => { try { return window[s].getItem(k); } catch { return null; } },
  set: (s, k, v) => { try { window[s].setItem(k, v); } catch { /* private mode */ } },
  del: (s, k) => { try { window[s].removeItem(k); } catch { /* ignore */ } },
};
let content = null;
let b2 = null;
let licence = null;
let lastExam = null;
let lastGroup = '';

/* ------------------------------------------------------------------ access */

async function open(code) {
  const btn = $('code-button');
  const err = $('code-error');
  err.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Vérification…';
  try {
    const r = await fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'access', code }), redirect: 'follow', credentials: 'omit' });
    const j = await r.json();
    if (!j.ok) throw new Error(j.message || 'Code refusé.');
    content = j.content;
    licence = j.licence;
    b2 = j.b2 && Array.isArray(j.b2.sets) && j.b2.sets.length ? j.b2 : null;
    store.set('sessionStorage', 'civiclasse:code', code);
    start();
  } catch (e) {
    store.del('sessionStorage', 'civiclasse:code');
    err.textContent = e.message && !/fetch|network/i.test(e.message) ? e.message : 'Service momentanément injoignable. Réessayez dans un instant.';
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ouvrir l’espace';
  }
}

function start() {
  $('login').hidden = true;
  $('space').hidden = false;
  // Modules of the licence (server: ['civique'], ['civique','lecture-b2'] or ['lecture-b2']; older answers: none = civic).
  const mods = Array.isArray(licence.modules) && licence.modules.length ? licence.modules : ['civique'];
  const civic = mods.includes('civique') && content && Array.isArray(content.bank) && content.bank.length > 0;
  const d = String(licence.deliveryDate || '').split('-').reverse().join('/');
  const what = [];
  if (civic) what.push(`${content.bank.length} questions vérifiées, ${content.interview.cards.length} cartes d’entretien`);
  if (b2) what.push(`Lecture B2 : ${b2.sets.length} séries sur ${b2.setsPlanned || 12}`);
  $('licence-line').innerHTML = `<strong>${esc(licence.company)}</strong> · ${esc(licence.name)} · version bêta (${esc(what.join(' ; ') || 'aucun contenu')}) · version relue au plus tard le ${esc(d)}. <button type="button" class="btn secondary" id="logout">Fermer</button>`;
  $('logout').addEventListener('click', () => { store.del('sessionStorage', 'civiclasse:code'); location.reload(); });
  if (civic) {
    $('exam-form').elements.seed.value = String(1 + Math.floor(Math.random() * 99999));
    renderProgress();
    renderInterview();
    renderBank('');
  } else {
    for (const id of ['exam', 'corr', 'int', 'bank']) { $('t-' + id).hidden = true; $('p-' + id).hidden = true; }
  }
  if (b2) {
    $('t-b2').hidden = false;
    renderB2();
    if (!civic) selectTab('t-b2');
  }
  if (window.octaveCro && window.octaveCro.goal) window.octaveCro.goal('signup');
}

/* ------------------------------------------------------------------ Lecture B2 */

function renderB2() {
  const sel = $('b2-set');
  sel.innerHTML = b2.sets.map((x, i) => `<option value="${i}">${x.order}. ${esc(x.title)} – ${esc(x.author)}</option>`).join('');
  const draw = () => {
    const set = b2.sets[Number(sel.value) || 0];
    const group = $('b2-form').elements.group.value.trim();
    $('b2-out').innerHTML = learnerSheet(set, { group }) + keySheet(set);
    $('b2-meta').textContent = `Série ${set.order} : ${set.words} mots, ${set.questions.length} questions. Version ${b2.version}. ${b2.sets.length} séries disponibles sur ${b2.setsPlanned || 12} prévues (version relue au plus tard le ${String(b2.deliveryDate || licence.deliveryDate).split('-').reverse().join('/')}).`;
  };
  sel.addEventListener('change', draw);
  $('b2-form').elements.group.addEventListener('input', draw);
  $('b2-form').addEventListener('submit', (e) => e.preventDefault());
  draw();
}

function selectTab(id) {
  document.querySelectorAll('[role=tab]').forEach((x) => { x.setAttribute('aria-selected', String(x.id === id)); $(x.getAttribute('aria-controls')).hidden = x.id !== id; });
}

/* ------------------------------------------------------------------ tabs + print */

function tabs() {
  const list = document.querySelectorAll('[role=tab]');
  list.forEach((t) => t.addEventListener('click', () => selectTab(t.id)));
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-print]');
    if (!b) return;
    const what = b.getAttribute('data-print');
    document.body.classList.add('print-mode', 'print-only-' + what);
    const done = () => { document.body.classList.remove('print-mode', 'print-only-' + what); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  });
}

/* ------------------------------------------------------------------ mock exams */

function examHeader(exam, group, date, title) {
  return `<h2>${esc(title)}</h2>
<p><strong>Mention : ${esc(MENTIONS[exam.mention])}</strong> · série n° ${exam.seed}${group ? ' · groupe : ' + esc(group) : ''}${date ? ' · ' + esc(date.split('-').reverse().join('/')) : ''}</p>`;
}

function renderExam(exam, group, date) {
  const qs = exam.questions;
  const sujet = `<div class="sheet sheet-exam">
${examHeader(exam, group, date, 'Examen blanc – examen civique')}
<p>Nom : ______________________ &nbsp; Prénom : ______________________</p>
<p class="small">${EXAM_SIZE} questions, une seule bonne réponse par question. Durée : ${DURATION_MIN} minutes au plus. Il faut ${PASS_MARK} bonnes réponses pour réussir. Entourez la lettre choisie sur la grille. Examen blanc Civiclasse (version bêta), sans valeur officielle.</p>
<ol class="exam">
${qs.map((q) => `<li><p>${q.kind === 'situation' ? '<span class="kind-tag">Mise en situation</span>' : ''}${esc(q.prompt)}</p><ul>${q.options.map((o, k) => `<li>${LETTERS[k]}. ${esc(o)}</li>`).join('')}</ul></li>`).join('\n')}
</ol>
<div class="print-break"></div>
${examHeader(exam, group, date, 'Grille de réponses')}
<p>Nom : ______________________ &nbsp; Note : ____ / ${EXAM_SIZE}</p>
<div class="grid-answers">${qs.map((q) => `<span>${String(q.n).padStart(2, '0')}  A  B  C  D</span>`).join('')}</div>
</div>`;
  const key = `<div class="sheet sheet-key">
${examHeader(exam, group, date, 'Corrigé (réservé au formateur)')}
<p class="grid-answers">${qs.map((q) => `<span>${String(q.n).padStart(2, '0')} : ${LETTERS[q.answer]}</span>`).join('')}</p>
<div class="table-wrap"><table><thead><tr><th>N°</th><th>Réponse</th><th>Thème</th><th>Explication et source officielle</th></tr></thead><tbody>
${qs.map((q) => `<tr><td>${q.n}</td><td>${LETTERS[q.answer]}</td><td>${esc(THEME_LABEL[q.theme])}${q.kind === 'situation' ? ' (mise en situation)' : ''}</td><td>${esc(q.explanation)}<br><span class="small">« ${esc(q.evidence.quote)} » <a href="${esc(q.evidence.url)}" rel="noopener">${esc(q.evidence.label)}</a></span> <a class="small no-print" href="${reportLink(q)}">Signaler</a></td></tr>`).join('\n')}
</tbody></table></div>
<p class="small">Répartition (arrêté du 10 octobre 2025, art. 3) : ${PLAN.map((p) => `${esc(p.label)} ${p.connaissance + p.situation}`).join(' · ')}. Questions de connaissance tirées de la liste officielle de la mention ; mises en situation rédigées par Civiclasse. Version bêta, ${esc(content.version)}.</p>
</div>`;
  $('exam-out').innerHTML = sujet + key;
}

function reportLink(q) {
  const body = `Question ${q.id} : ${q.prompt}\n\nCe qui me semble faux :\n`;
  return `mailto:${CFG.contact}?subject=${encodeURIComponent('Civiclasse – signalement ' + q.id)}&body=${encodeURIComponent(body)}`;
}

function onExam(e) {
  e.preventDefault();
  const f = e.target.elements;
  const seed = Math.max(1, Math.min(999999, parseInt(f.seed.value, 10) || 1));
  const exam = buildExam(content.bank, { mention: f.mention.value, seed });
  lastExam = exam;
  lastGroup = f.group.value.trim();
  store.set('sessionStorage', 'civiclasse:last', JSON.stringify({ mention: exam.mention, seed, group: lastGroup }));
  renderExam(exam, lastGroup, f.date.value);
  $('exam-print').hidden = false;
  const w = $('exam-warn');
  w.hidden = !exam.warnings.length;
  w.textContent = exam.warnings.join(' ');
  renderProgress();
}

/* ------------------------------------------------------------------ marking + progress */

const progKey = () => 'civiclasse:progress:' + (lastGroup || 'groupe');
const loadProg = () => { try { return JSON.parse(store.get('localStorage', progKey()) || '[]'); } catch { return []; } };

function onCorr(e) {
  e.preventDefault();
  const out = $('corr-result');
  if (!lastExam) {
    const saved = JSON.parse(store.get('sessionStorage', 'civiclasse:last') || 'null');
    if (saved) { lastExam = buildExam(content.bank, saved); lastGroup = saved.group || ''; }
  }
  if (!lastExam) { out.className = 'status err'; out.textContent = 'Générez d’abord le sujet (onglet « Examens blancs ») avec le même numéro de série.'; return; }
  const f = e.target.elements;
  const p = parseAnswers(f.answers.value, lastExam.questions.length);
  if (!p.ok) { out.className = 'status err'; out.textContent = `Il faut exactement ${lastExam.questions.length} lettres (A, B, C, D ou « - ») : ${p.count} saisies.`; return; }
  const s = score(lastExam, p.answers);
  const rec = { learner: f.learner.value.trim().slice(0, 40), date: new Date().toISOString().slice(0, 10), seed: lastExam.seed, mention: lastExam.mention, ok: s.ok, total: s.total, pass: s.pass, themes: Object.fromEntries(Object.entries(s.byTheme).map(([k, v]) => [k, `${v.ok}/${v.total}`])) };
  const list = loadProg();
  list.push(rec);
  store.set('localStorage', progKey(), JSON.stringify(list));
  out.className = 'status ' + (s.pass ? 'ok' : 'err');
  out.textContent = `${rec.learner} : ${s.ok}/${s.total} (${s.pass ? 'au-dessus' : 'en dessous'} du seuil de ${s.passMark}). Questions manquées : ${s.wrong.join(', ') || 'aucune'}.`;
  f.answers.value = '';
  renderProgress();
}

function renderProgress() {
  const list = loadProg();
  const blank = Math.max(list.length ? 5 : 20, 0);
  const th = PLAN.map((p) => `<th>${esc(p.label.split(' ')[0])}</th>`).join('');
  const rows = list.map((r) => `<tr><td>${esc(r.learner)}</td><td>${esc(r.date.split('-').reverse().join('/'))}</td><td>${esc(r.mention.toUpperCase())} ${r.seed}</td><td><strong>${r.ok}/${r.total}</strong></td><td>${r.pass ? 'oui' : 'non'}</td>${PLAN.map((p) => `<td>${esc(r.themes[p.theme] || '')}</td>`).join('')}</tr>`).join('');
  const empty = Array.from({ length: blank }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td>${PLAN.map(() => '<td></td>').join('')}</tr>`).join('');
  $('progress').innerHTML = `<h2>Fiche de progression${lastGroup ? ' – ' + esc(lastGroup) : ''}</h2>
<p class="small">Seuil officiel : ${PASS_MARK}/${EXAM_SIZE}. Colonnes par thème : bonnes réponses / questions du thème.</p>
<div class="table-wrap"><table><thead><tr><th>Apprenant</th><th>Date</th><th>Série</th><th>Note</th><th>≥ ${PASS_MARK}</th>${th}</tr></thead><tbody>${rows}${empty}</tbody></table></div>`;
}

/* ------------------------------------------------------------------ scripted interview */

let timer = null;
const session = { seen: [], points: 0, total: 0 };

function renderInterview() {
  const I = content.interview;
  const box = $('interview');
  box.innerHTML = `<div class="card controls"><p>${esc(I.intro)}</p>
${I.purpose.map((p) => `<p class="small">« ${esc(p.text)} » <a href="${esc(p.url)}" rel="noopener">${esc(p.source)}</a></p>`).join('')}
<p class="small">Déroulé conseillé : le formateur joue l’agent de préfecture, pose la question, lance le chronomètre (2 minutes), utilise la relance si la réponse est courte, puis coche les points abordés et lit l’extrait de la Charte avec le candidat.</p>
<div class="btn-row"><button class="btn" type="button" id="int-draw">Tirer une question</button><button class="btn secondary" type="button" data-print="cards">Imprimer les ${I.cards.length} cartes</button></div></div>
<div id="int-card"></div><div id="int-summary" class="small muted"></div>
<div class="sheet sheet-cards" hidden id="int-print"></div>`;
  $('int-draw').addEventListener('click', draw);
  $('int-print').hidden = false;
  $('int-print').innerHTML = `<h2>Cartes d’entretien – Civiclasse (questions d’entraînement, pas une liste officielle)</h2>` + I.cards.map((c, i) => `<div class="card" style="break-inside:avoid"><p class="small">${i + 1}. ${esc(c.theme)}</p><p class="card-q">${esc(c.question)}</p><p>Relance : ${esc(c.relance)}</p><p class="small"><strong>Points à vérifier :</strong> ${c.points.map(esc).join(' ; ')}.</p><p class="charte small">${esc(c.charte)}</p></div>`).join('') + `<p class="small">${esc(I.charteSource.label)}.</p>`;
  $('int-print').classList.add('screen-hidden');
}

function draw() {
  const cards = content.interview.cards;
  const pool = cards.filter((c) => !session.seen.includes(c.id));
  const c = (pool.length ? pool : cards)[Math.floor(Math.random() * (pool.length || cards.length))];
  if (!pool.length) session.seen = [];
  session.seen.push(c.id);
  clearInterval(timer);
  let left = 120;
  $('int-card').innerHTML = `<div class="card"><p class="small muted">${esc(c.theme)} · question d’entraînement</p><p class="card-q">${esc(c.question)}</p>
<p><span class="timer" id="int-timer" aria-live="off">2:00</span> <button type="button" class="btn secondary" id="int-go">Démarrer</button> <button type="button" class="btn secondary" id="int-relance">Relance</button></p>
<p id="int-rel" hidden>${esc(c.relance)}</p>
<fieldset class="field-group"><legend>Points abordés par le candidat</legend><ul class="points">${c.points.map((p, i) => `<li><label class="check"><input type="checkbox" data-pt="${i}"> <span>${esc(p)}</span></label></li>`).join('')}</ul></fieldset>
<details><summary>Texte de la Charte des droits et devoirs du citoyen français</summary><p class="charte">${esc(c.charte)}</p></details>
<div class="btn-row"><button type="button" class="btn" id="int-done">Valider et passer à la suivante</button></div></div>`;
  $('int-go').addEventListener('click', () => {
    clearInterval(timer);
    timer = setInterval(() => { left--; $('int-timer').textContent = `${Math.floor(Math.max(left, 0) / 60)}:${String(Math.max(left, 0) % 60).padStart(2, '0')}`; if (left <= 0) clearInterval(timer); }, 1000);
  });
  $('int-relance').addEventListener('click', () => { $('int-rel').hidden = false; });
  $('int-done').addEventListener('click', () => {
    const boxes = document.querySelectorAll('#int-card [data-pt]');
    session.total += boxes.length;
    session.points += Array.prototype.filter.call(boxes, (b) => b.checked).length;
    $('int-summary').textContent = `Séance : ${session.seen.length} question(s), ${session.points} point(s) abordé(s) sur ${session.total}.`;
    draw();
  });
}

/* ------------------------------------------------------------------ bank */

function renderBank(q) {
  const needle = q.trim().toLowerCase();
  const items = content.bank.filter((x) => !needle || (x.prompt + ' ' + x.options.join(' ')).toLowerCase().includes(needle));
  $('bank-count').textContent = `${items.length} question(s) sur ${content.bank.length}.`;
  $('bank-out').innerHTML = PLAN.map((p) => {
    const list = items.filter((x) => x.theme === p.theme);
    if (!list.length) return '';
    return `<h2>${esc(p.label)} (${list.length})</h2>` + list.slice(0, 200).map((x) => `<div class="card"><p class="small muted">${esc(x.id)} · ${x.kind === 'situation' ? 'mise en situation (rédigée par Civiclasse)' : 'connaissance' + (x.official ? ', liste officielle ' + x.mentions.map((m) => m.toUpperCase()).join(', ') : '')}</p><p><strong>${esc(x.prompt)}</strong></p><ul>${x.options.map((o, k) => `<li>${k === x.answer ? '<strong>' + LETTERS[k] + '. ' + esc(o) + ' ✓</strong>' : LETTERS[k] + '. ' + esc(o)}</li>`).join('')}</ul><p class="small">${esc(x.explanation)}</p><p class="evidence">« ${esc(x.evidence.quote)} » <a href="${esc(x.evidence.url)}" rel="noopener">${esc(x.evidence.label)}</a></p><p class="small"><a href="${reportLink(x)}">Signaler une erreur</a></p></div>`).join('');
  }).join('');
}

/* ------------------------------------------------------------------ boot */

tabs();
$('code-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = e.target.elements.code.value.trim();
  if (!code) return;
  open(code);
});
$('exam-form').addEventListener('submit', onExam);
$('corr-form').addEventListener('submit', onCorr);
$('progress-clear').addEventListener('click', () => { if (confirm('Effacer la fiche de progression de ce groupe sur cet ordinateur ?')) { store.del('localStorage', progKey()); renderProgress(); } });
let st = null;
$('bank-q').addEventListener('input', (e) => { clearTimeout(st); st = setTimeout(() => renderBank(e.target.value), 200); });
const saved = store.get('sessionStorage', 'civiclasse:code');
const fromUrl = new URLSearchParams(location.hash.slice(1)).get('code');
if (fromUrl) history.replaceState(null, '', location.pathname);
if (fromUrl || saved) { $('code-form').elements.code.value = fromUrl || saved; open(fromUrl || saved); }
