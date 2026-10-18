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
const BUILD_LOG = execFileSync(process.execPath, [join(ROOT, 'scripts/build.mjs')], { env: { ...process.env, OUT: 'dist-test' } }).toString();
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
    assert.match(h, /version bêta, pas encore relue par un expert/i, f);
    assert.doesNotMatch(h, /relecture experte en cours/i, f);
    assert.match(h, /href="https:\/\/outils\.vread\.fr\/a-propos\/">Qui fait ce site, et comment/, f);
    assert.match(h, /src="\/civiclasse\/assets\/goals\.js" defer/, f);
    assert.doesNotMatch(h, /jalonel/i, f);
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
  assert.equal(o.termsVersion, 'cgv-pro-civiclasse-2026-10-14');
  assert.match(page('licence/'), /<span data-prix-pilote>99 €<\/span><\/p><p class="small muted">Prix prévu après la relecture : 149 €/);
  assert.match(page('licence/'), /Prix prévu après la relecture : 490 €/);
  for (const p of ['', 'licence/']) assert.doesNotMatch(page(p), /<s>/, 'no struck-through price');
  assert.match(page('commander/'), /value="civiclasse-pilote-99" data-licence="pilote" checked/);
  assert.match(page('commander/'), /value="civiclasse-annuelle-329"/);
  assert.match(page('cgv-pro/'), /cgv-pro-civiclasse-2026-10-14/);
  // add-on = combined product - licence, the same for every licence; standalone module shown
  for (const base of ['civiclasse-pilote-99', 'civiclasse-pilote-129', 'civiclasse-annuelle-329']) {
    assert.equal(sc.products[`${base}-b2-69`] - sc.products[base], 6900);
    assert.equal(sc.products[`${base}-b2-99`] - sc.products[base], 9900);
  }
  assert.equal(sc.products['civiclasse-lecture-b2-249'], 24900);
  const order = page('commander/');
  for (const v of ['civiclasse-pilote-99-b2-69', 'civiclasse-annuelle-329-b2-69', 'civiclasse-lecture-b2-249']) assert.match(order, new RegExp(`value="${v}"`));
  assert.match(order, /<span data-price-for="civiclasse-pilote-99-b2-69">168 € net<\/span>/);
  assert.match(order, /version du 14 octobre 2026/);
  assert.match(page('lecture-b2/'), /<span data-prix-b2>\+69 €<\/span>/);
  assert.match(page('lecture-b2/'), /249 €/);
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
  // Lecture B2: only the free Renan set is public (its text, questions and key); no other set text ships
  const cat = JSON.parse(readFileSync(join(ROOT, 'data/lecture-b2-catalogue.json'), 'utf8'));
  const paid = cat.sets.filter((x) => !x.free);
  assert.ok(paid.length >= 5);
  const sample = JSON.parse(readFileSync(join(ROOT, 'data/lecture-b2-exemple.json'), 'utf8'));
  assert.equal(sample.free, true);
  assert.equal(sample.questions.length, 10);
  const html = all().filter((f) => /\.(js|mjs|json|html)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.doesNotMatch(html, /Le courage, c’est de ne pas livrer sa volonté/); // Jaurès set text (paid)
  assert.doesNotMatch(html, /Je vote l’abolition pure, simple et définitive/); // Hugo set text (paid)
});

test('vendored scripts are verbatim copies of the octave-checkout master (when it is checked out next to this repo)', (t) => {
  const master = process.env.OCTAVE_CHECKOUT_WEB || join(ROOT, '..', 'octave-checkout', 'gas', 'web'); // a checkout of origin/main
  if (!existsSync(master)) return t.skip('octave-checkout not checked out');
  for (const f of ['pay.js', 'order.js', 'mesure.js', 'cro.js']) assert.equal(readFileSync(join(ROOT, 'src/vendor', f), 'utf8'), readFileSync(join(master, f), 'utf8'), f);
  assert.match(readFileSync(join(ROOT, 'src/vendor/mesure.js'), 'utf8'), /civiclasse/);
});

test('Lecture B2: the 2026 B2 rule and its only proofs are stated on the module page, the sample and the order page', () => {
  for (const p of ['lecture-b2/', 'lecture-b2/exemple/', 'commander/']) {
    const h = page(p);
    assert.match(h, /exigé depuis le 1er janvier 2026/, p);
    assert.match(h, /à l’oral et à l’écrit au moins égale au niveau B2/, p);
    assert.match(h, /Seul un diplôme ou une attestation officiels prouvent ce niveau/, p);
    assert.match(h, /TCF \(France Éducation International\)/, p);
    assert.match(h, /Civiclasse ne prouve aucun niveau/, p);
    assert.match(h, /service-public\.gouv\.fr\/particuliers\/vosdroits\/F11926/, p);
    assert.match(h, /JORFTEXT000051900519/, p);
  }
  assert.match(page('lecture-b2/'), /Compréhension écrite seulement/);
});

test('Lecture B2 sample: full text with numbered paragraphs, 10 questions with 4 options, key with cited passages', () => {
  const h = page('lecture-b2/exemple/');
  assert.equal((h.match(/class="b2-n"/g) || []).length, 4);
  assert.equal((h.match(/<ol class="b2-q">[\s\S]*?<\/ol>/)[0].match(/<li><p>/g) || []).length, 10);
  assert.equal((h.match(/<tr><td>\d+<\/td><td>[ABCD]\. /g) || []).length, 10);
  assert.match(h, /Une nation est une âme, un principe spirituel/);
  assert.match(h, /fr\.wikisource\.org/);
  assert.match(h, /data-print-b2="sheet"/);
  const ld = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(page('lecture-b2/'))[1]);
  assert.equal(ld['@type'], 'Service');
  assert.ok(ld.offers.every((o) => o.availability === 'https://schema.org/PreOrder' && o.eligibleCustomerType === 'https://schema.org/Business'));
});

test('A/B config: civi-prix by day, civi-b2-prix by tab (never two day-mode tests that would always coincide)', () => {
  const src = readFileSync(join(ROOT, 'src/assets/xp.js'), 'utf8');
  const w = {};
  new Function('window', src)(w);
  assert.deepEqual(w.OCTAVE_XP.map((x) => [x.id, x.mode, x.variants.join('/')]), [['civi-prix', 'day', 'p99/p129'], ['civi-b2-prix', 'tab', 'a69/b99'], ['rd-hero', 'tab', 'a/b']]);
  const rd = w.OCTAVE_XP[2];
  assert.equal(rd.param, 'hero');
  assert.ok(new RegExp(rd.pages).test('/civiclasse/') && !new RegExp(rd.pages).test('/civiclasse/licence/'), 'rd-hero on the home page only');
});

test('POOLED-READING-01: the home hero carries a real excerpt of the printed exam, hidden unless variant b', () => {
  const h = page('');
  const fig = /<figure class="hero-excerpt" data-hero-excerpt>[\s\S]*?<\/figure>/.exec(h)[0];
  assert.match(fig, /Qui nomme le Premier ministre \?/);
  assert.match(fig, /travail dissimulé/);
  assert.match(fig, /href="\/civiclasse\/exemple-examen\/" data-cta data-sample/);
  const css = readFileSync(join(DIST, 'assets/style.css'), 'utf8');
  assert.match(css, /\.hero-excerpt \{ display: none;/);
  assert.match(css, /html\[data-xp-rd-hero="b"\] \.hero-excerpt \{ display: block; \}/);
  // the excerpt is verbatim from the free sample page
  const sample = page('exemple-examen/');
  assert.match(sample, /Qui nomme le Premier ministre \?/);
  assert.equal((sample.match(/<ol class="exam">[\s\S]*?<\/ol>\n<div class="print-break">/)[0].match(/<li><p>/g) || []).length, 10);
});

test('SEO: unique titles and descriptions, breadcrumbs, structured data, sitemap lastmod from the manifest', () => {
  const htmls = all().filter((f) => f.endsWith('index.html'));
  const idx = htmls.filter((f) => !/name="robots" content="noindex"/.test(readFileSync(f, 'utf8')));
  const titles = idx.map((f) => /<title>(.*?)<\/title>/.exec(readFileSync(f, 'utf8'))[1]);
  const descs = idx.map((f) => /<meta name="description" content="(.*?)">/.exec(readFileSync(f, 'utf8'))[1]);
  assert.equal(new Set(titles).size, titles.length);
  assert.equal(new Set(descs).size, descs.length);
  for (const f of idx) {
    const h = readFileSync(f, 'utf8');
    assert.equal((h.match(/<h1[ >]/g) || []).length, 1, f);
    const lds = [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
    if (!f.endsWith('dist-test/index.html')) {
      assert.match(h, /<nav class="crumbs wrap" aria-label="Fil d’Ariane">/, f);
      const bc = lds.find((x) => x['@type'] === 'BreadcrumbList');
      assert.equal(bc.itemListElement[0].item, 'https://outils.vread.fr/', f);
    }
  }
  const ldOf = (p, type) => [...page(p).matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1])).find((x) => x['@type'] === type);
  assert.equal(ldOf('', 'FAQPage').mainEntity.length, (page('').match(/<details id="faq-/g) || []).length);
  assert.equal(ldOf('lecture-b2/', 'FAQPage').mainEntity.length, (page('lecture-b2/').match(/<details id="faq-b2-/g) || []).length);
  assert.equal(ldOf('examen-civique/', 'Article').author.url, 'https://outils.vread.fr/a-propos/');
  for (const p of ['entrainement/', 'exemple-examen/', 'lecture-b2/exemple/']) {
    const r = ldOf(p, 'LearningResource');
    assert.equal(r.isAccessibleForFree, true, p);
    assert.match(r.dateModified, /^\d{4}-\d{2}-\d{2}$/);
  }
  const sm = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  assert.equal((sm.match(/<url>/g) || []).length, idx.length);
  assert.match(sm, /exemple-examen\/<\/loc><lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.doesNotMatch(sm, /commander\/|espace-formateur\/|commande\//);
  assert.match(BUILD_LOG, /lastmod stale: 0\b/, 'data/lastmod.json is stale: run npm run lastmod');
});

test('licence, refund and invoice answers sit next to the buy buttons', () => {
  const order = page('commander/');
  assert.match(order, /<p class="guarantee small">Remboursement intégral sur simple e-mail si la version relue n’est pas livrée le 15 janvier 2027/);
  assert.ok(order.indexOf('class="guarantee small"') < order.indexOf('id="pay-button"'));
  for (const id of ['faq-licence', 'faq-maj', 'faq-facture']) assert.match(order, new RegExp(`<details id="${id}">`));
  for (const p of ['', 'licence/', 'commander/']) assert.match(page(p), /Un organisme, un code/, p);
  assert.match(page(''), /n’est pas encore confirmé/);
  assert.match(page('lecture-b2/'), /38 sur 60/);
});
