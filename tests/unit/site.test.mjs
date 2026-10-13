// Unit tests: exam logic (format of the arrêté du 10 octobre 2025) and the built pages (compliance with the ministry's
// warning on paid preparation, beta label, official links, prices = catalog, vendored scripts, no paid bank shipped).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildExam, parseAnswers, score, PLAN, rng } from '../../src/assets/examen.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const DIST = join(ROOT, 'dist-test');
execFileSync(process.execPath, [join(ROOT, 'scripts/build.mjs')], { env: { ...process.env, OUT: 'dist-test' } });
const page = (p) => readFileSync(join(DIST, p, 'index.html'), 'utf8');
const all = (dir = DIST) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? all(join(dir, f)) : [join(dir, f)]));

// Synthetic bank (the real one is private): enough items per theme / kind / mention.
const bank = [];
for (const p of PLAN) for (const kind of ['connaissance', 'situation']) for (let i = 0; i < 20; i++) bank.push({ id: `${p.theme}-${kind}-${i}`, theme: p.theme, kind, official: kind === 'connaissance', mentions: i % 2 ? ['csp', 'cr'] : ['nat', 'csp'], prompt: `Q ${p.theme} ${i}`, options: ['w', 'x', 'y', 'z'], answer: i % 4, explanation: 'e', evidence: { url: 'https://formation-civique.interieur.gouv.fr/', label: 'l', quote: 'q' } });

test('mock exam: 40 questions, 28 knowledge + 12 situations, theme split 11/6/11/8/4, deterministic per series', () => {
  const e = buildExam(bank, { mention: 'csp', seed: 7 });
  assert.equal(e.questions.length, 40);
  assert.equal(e.questions.filter((q) => q.kind === 'situation').length, 12);
  const by = Object.fromEntries(PLAN.map((p) => [p.theme, e.questions.filter((q) => q.theme === p.theme).length]));
  assert.deepEqual(by, { principes: 11, institutions: 6, droits: 11, histoire: 8, societe: 4 });
  assert.equal(new Set(e.questions.map((q) => q.id)).size, 40);
  assert.deepEqual(buildExam(bank, { mention: 'csp', seed: 7 }), e);
  assert.notDeepEqual(buildExam(bank, { mention: 'csp', seed: 8 }).questions.map((q) => q.id), e.questions.map((q) => q.id));
  // knowledge questions come from the list of the mention; shuffled options keep the right answer
  for (const q of e.questions) {
    const src = bank.find((b) => b.id === q.id);
    if (q.kind === 'connaissance') assert.ok(src.mentions.includes('csp'));
    assert.equal(q.options[q.answer], src.options[src.answer]);
  }
  const n = buildExam(bank, { mention: 'nat', seed: 7 });
  for (const q of n.questions.filter((x) => x.kind === 'connaissance')) assert.ok(bank.find((b) => b.id === q.id).mentions.includes('nat'));
});

test('mock exam: falls back to another official list and says so; refuses when a theme is empty', () => {
  const thin = bank.filter((q) => !(q.theme === 'societe' && q.kind === 'connaissance' && q.mentions.includes('cr'))).concat([]);
  const e = buildExam(thin, { mention: 'cr', seed: 1 });
  assert.equal(e.questions.length, 40);
  assert.match(e.warnings.join(' '), /Vivre dans la société française/);
  assert.throws(() => buildExam(bank.filter((q) => q.theme !== 'histoire'), { mention: 'csp', seed: 1 }), /Histoire/);
});

test('marking: 32/40 passes, 31 fails, blank counts as wrong; answer parsing', () => {
  const e = buildExam(bank, { mention: 'cr', seed: 3 });
  const right = e.questions.map((q) => q.answer);
  const wrongAt = (k) => right.map((a, i) => (i < k ? (a + 1) % 4 : a));
  assert.equal(score(e, wrongAt(8)).pass, true);
  assert.equal(score(e, wrongAt(9)).pass, false);
  assert.equal(score(e, right.map(() => -1)).ok, 0);
  assert.deepEqual(parseAnswers('ab cd'.repeat(8) + '-ABCDABC', 40).ok, true);
  assert.equal(parseAnswers('ABC', 40).ok, false);
  assert.equal(score(e, right).byTheme.principes.total, 11);
  const r = rng(1); assert.ok(r() >= 0 && r() < 1);
});

test('every page: private-service notice, free official preparation link, beta label in the footer, cookieless tracking', () => {
  for (const f of all().filter((f) => f.endsWith('.html'))) {
    const h = readFileSync(f, 'utf8');
    assert.match(h, /sans lien avec le ministère de l’Intérieur/, f);
    assert.match(h, /formation-civique\.interieur\.gouv\.fr/, f);
    assert.match(h, /service-public\.gouv\.fr/, f);
    assert.match(h, /version bêta — relecture experte en cours/i, f);
    assert.match(h, /src="\/civiclasse\/mesure\.js" defer/, f);
    assert.match(h, /src="\/civiclasse\/cro\.js" data-site="civiclasse"/, f);
    assert.ok(h.indexOf('assets/xp.js') < h.indexOf('/cro.js'), 'xp.js before cro.js');
    assert.doesNotMatch(h, /\bofficiel(le)? Civiclasse|site officiel de/i, f);
  }
});

test('home, offer, order pages: the official exam and preparation are free; what the paid offer adds; beta + delivery date', () => {
  for (const p of ['', 'licence/']) {
    const h = page(p);
    assert.match(h, /La préparation à l’examen civique peut se faire de manière totalement gratuite/);
    assert.match(h, /id="ajoute"/);
    assert.match(h, /au plus tard le 15 janvier 2027/);
    assert.match(h, /remboursement intégral/);
  }
  assert.match(page('commander/'), /préparation officielle sont gratuits pour les candidats/);
  assert.match(page('entrainement/'), /totalement gratuite/);
});

test('prices on the pages and in checkout-config equal sales.config.json (Config.js is checked by octave-checkout)', () => {
  const sc = JSON.parse(readFileSync(join(ROOT, 'sales.config.json'), 'utf8'));
  const cfg = readFileSync(join(DIST, 'assets/checkout/checkout-config.js'), 'utf8');
  const o = JSON.parse(cfg.slice(cfg.indexOf('{'), cfg.lastIndexOf('}') + 1));
  assert.deepEqual(Object.fromEntries(Object.entries(o.offers).map(([k, v]) => [k, v.amount])), sc.products);
  assert.equal(o.termsVersion, 'cgv-pro-civiclasse-2026-10-13');
  assert.match(page('licence/'), /<span data-prix-pilote>99 €<\/span> <s>149 €<\/s>/);
  assert.match(page('licence/'), /329 € <s>490 €<\/s>/);
  assert.match(page('commander/'), /value="civiclasse-pilote-99" checked/);
  assert.match(page('commander/'), /value="civiclasse-annuelle-329"/);
  assert.match(page('cgv-pro/'), /cgv-pro-civiclasse-2026-10-13/);
});

test('structured data: no rating or review; Service with AggregateOffer in pre-order', () => {
  for (const f of all().filter((f) => f.endsWith('.html'))) assert.doesNotMatch(readFileSync(f, 'utf8'), /aggregateRating|"Review"|ratingValue/);
  const ld = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(page('licence/'))[1]);
  assert.equal(ld['@type'], 'Service');
  assert.equal(ld.offers.availability, 'https://schema.org/PreOrder');
  assert.equal(ld.offers.lowPrice, '99.00');
});

test('the public build ships only the 10 demo questions with answers (the paid bank stays in Apps Script)', () => {
  const demo = JSON.parse(readFileSync(join(ROOT, 'data/demo.json'), 'utf8'));
  assert.equal(demo.items.length, 10);
  assert.equal(demo.items.filter((q) => q.kind === 'situation').length, 2);
  const js = all().filter((f) => /\.(js|mjs|json|html)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.equal((js.match(/"answer":/g) || []).length, 10);
});

test('vendored scripts are verbatim copies of the octave-checkout master (when it is checked out next to this repo)', (t) => {
  const master = process.env.OCTAVE_CHECKOUT_WEB || join(ROOT, '..', 'octave-checkout', 'gas', 'web'); // a checkout of origin/main
  if (!existsSync(master)) return t.skip('octave-checkout not checked out');
  for (const f of ['pay.js', 'order.js', 'mesure.js', 'cro.js']) assert.equal(readFileSync(join(ROOT, 'src/vendor', f), 'utf8'), readFileSync(join(master, f), 'utf8'), f);
  assert.match(readFileSync(join(ROOT, 'src/vendor/mesure.js'), 'utf8'), /civiclasse/);
});
