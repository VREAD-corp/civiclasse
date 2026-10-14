// Builds the static site into dist/ (GitHub Pages, served at https://outils.vread.fr/civiclasse/).
// Env: SITE_BASE (default /civiclasse/), SITE_ORIGIN (default https://outils.vread.fr), SALES_CONFIG / SALES_ALLOW_TEST
// (test builds with a sandbox key and a local endpoint, see scripts/checkout-pages.mjs), OUT (default dist).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSalesConfig, orderFormHtml, orderPageBody, checkoutCsp, orderCsp } from './checkout-pages.mjs';
import * as C from '../src/content.mjs';
import { learnerSheet, keySheet, sourceLine } from '../src/assets/lecture-b2.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, process.env.OUT || 'dist');
const BASE = process.env.SITE_BASE || '/civiclasse/';
const ORIGIN = process.env.SITE_ORIGIN || 'https://outils.vread.fr';
const SALES = loadSalesConfig(ROOT);
const CONTACT = 'octave@vread.fr';
const REPO = 'https://github.com/VREAD-corp/civiclasse';
const P = SALES.products;
const B2_IDS = ['civiclasse-pilote-99-b2-69', 'civiclasse-pilote-99-b2-99', 'civiclasse-pilote-129-b2-69', 'civiclasse-pilote-129-b2-99', 'civiclasse-annuelle-329-b2-69', 'civiclasse-annuelle-329-b2-99', 'civiclasse-lecture-b2-249'];
for (const id of ['civiclasse-pilote-99', 'civiclasse-pilote-129', 'civiclasse-annuelle-329', ...B2_IDS]) if (!Number.isInteger(P?.[id])) throw new Error(`sales.config.json: products.${id} missing`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(SALES.deliveryDate || '')) throw new Error('sales.config.json: deliveryDate YYYY-MM-DD');
const euro = (c) => `${c % 100 ? (c / 100).toFixed(2).replace('.', ',') : c / 100} €`;
const DELIVERY = C.frLongDate(SALES.deliveryDate);
const STATS = JSON.parse(readFileSync(join(ROOT, 'data/bank-stats.json'), 'utf8'));
Object.assign(C.STATS, STATS);
const DEMO = JSON.parse(readFileSync(join(ROOT, 'data/demo.json'), 'utf8'));
const SAMPLE = JSON.parse(readFileSync(join(ROOT, 'data/entretien-extrait.json'), 'utf8'));
const TERMS_VERSION = SALES.termsVersion;
// « Lecture B2 » (V4-56): add-on price = combined product - licence (arm a69 / b99), standalone module, free sample.
const B2A = P['civiclasse-pilote-99-b2-69'] - P['civiclasse-pilote-99'];
const B2B = P['civiclasse-pilote-99-b2-99'] - P['civiclasse-pilote-99'];
for (const [base, d] of [['civiclasse-pilote-99', 0], ['civiclasse-pilote-129', 0], ['civiclasse-annuelle-329', 0]]) {
  if (P[`${base}-b2-69`] - P[base] !== B2A || P[`${base}-b2-99`] - P[base] !== B2B) throw new Error(`sales.config.json: ${base}-b2-* must equal ${base} + the add-on (${B2A} / ${B2B})`);
}
const B2_SAMPLE = JSON.parse(readFileSync(join(ROOT, 'data/lecture-b2-exemple.json'), 'utf8'));
const B2_CAT = JSON.parse(readFileSync(join(ROOT, 'data/lecture-b2-catalogue.json'), 'utf8'));

const u = (p = '') => BASE + p.replace(/^\//, '');
const abs = (p = '') => ORIGIN + u(p);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ctx = { u, b2a: euro(B2A), b2b: euro(B2B), b2solo: euro(P['civiclasse-lecture-b2-249']), b2cat: B2_CAT, pilot: euro(P['civiclasse-pilote-99']), annual: euro(P['civiclasse-annuelle-329']), pilot99: euro(P['civiclasse-pilote-99']), pilot129: euro(P['civiclasse-pilote-129']), delivery: DELIVERY, termsVersion: TERMS_VERSION, contact: CONTACT, sample: SAMPLE };
for (const s of B2_CAT.sets) C.B2_SOURCES.push({ title: esc(s.title), year: s.year, author: esc(s.author) + (s.authorDates ? ` (${esc(s.authorDates)})` : ''), status: esc(s.status), links: sourceLine(s) });

const NAV = [
  ['', 'Accueil'],
  ['examen-civique/', 'L’examen civique'],
  ['entrainement/', 'Test gratuit'],
  ['entretien/', 'Entretien'],
  ['lecture-b2/', 'Lecture B2'],
  ['licence/', 'Licence formateur'],
  ['espace-formateur/', 'Espace formateur'],
];
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="#0f6e6a"/><path d="M9 11h14M9 16h14M9 21h9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="23" cy="21" r="2.4" fill="#f0b429"/></svg>`;
const EP_ORIGIN = new URL(SALES.endpoint).origin === 'https://script.google.com' ? '' : ' ' + new URL(SALES.endpoint).origin; // test builds only
const BASE_CSP = `default-src 'self'; script-src 'self'; connect-src 'self' https://script.google.com https://script.googleusercontent.com${EP_ORIGIN}; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`;
const ORG = { '@type': 'Organization', '@id': 'https://outils.vread.fr/#org', name: 'READ FRANCE SAS', url: 'https://outils.vread.fr/' };

function layout(pg) {
  const canonical = abs(pg.path);
  const nav = NAV.map(([p, t]) => `<li><a href="${u(p)}"${p === pg.path ? ' aria-current="page"' : ''}>${t}</a></li>`).join('');
  const ld = pg.ld ? `<script type="application/ld+json">${JSON.stringify(pg.ld)}</script>\n` : '';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${pg.csp || BASE_CSP}">
<title>${esc(pg.title)}</title>
<meta name="description" content="${esc(pg.description)}">
${pg.noindex ? '<meta name="robots" content="noindex">\n' : `<link rel="canonical" href="${canonical}">\n`}<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Civiclasse">
<meta property="og:title" content="${esc(pg.title)}">
<meta property="og:description" content="${esc(pg.description)}">
<meta property="og:url" content="${canonical}">
<link rel="icon" href="${u('assets/favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${u('assets/style.css')}">
<script src="${u('assets/xp.js')}"></script>
<script src="${u('cro.js')}" data-site="civiclasse" data-api="${SALES.endpoint}" data-hosts="outils.vread.fr" data-cta="a.btn, [data-cta], a[href*='commander']"></script>
<script src="${u('mesure.js')}" defer></script>
${ld}</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<div class="notice"><div class="wrap">Service privé, sans lien avec le ministère de l’Intérieur. L’examen civique et sa <a href="${C.OFFICIAL.info}" rel="noopener">préparation officielle</a> sont gratuits.</div></div>
<header class="site"><div class="wrap"><a class="brand" href="${u('')}">${LOGO}Civiclasse</a><nav class="main" aria-label="Navigation principale"><ul>${nav}</ul></nav></div></header>
<main id="contenu"><div class="wrap">
${pg.body}
</div></main>
<footer class="site"><div class="wrap">
<p>Civiclasse, un service de READ FRANCE SAS (Paris). Version bêta — relecture experte en cours. Contact : <a href="mailto:${CONTACT}">${CONTACT}</a>.</p>
<p>Sources officielles et gratuites : <a href="${C.OFFICIAL.home}" rel="noopener">formation-civique.interieur.gouv.fr</a> · <a href="${C.OFFICIAL.sp_titre}" rel="noopener">service-public.gouv.fr</a></p>
<ul><li><a href="${u('sources/')}">Sources et méthode</a></li><li><a href="${u('mentions-legales/')}">Mentions légales</a></li><li><a href="${u('confidentialite/')}">Confidentialité</a></li><li><a href="${u('cgv-pro/')}">CGV</a></li></ul>
</div></footer>
${pg.scripts || ''}
</body>
</html>
`;
}

// Order form radios (pay.js: one Payment Element, amount follows the checked product). Licence alone or with the
// Lecture B2 add-on, or the module alone. assets/commander-xp.js rewrites the values for the two A/B tests
// ('civi-prix' p99/p129 on the Pilot, 'civi-b2-prix' a69/b99 on the add-on) BEFORE pay.js reads them.
const productRadios = `  <fieldset class="field-group product-choice"><legend>Formule</legend>
    <p class="small"><strong>Licence Pilote</strong> : 3 mois de licence après la livraison de la version relue, jusqu’à 60 apprenants.</p>
    <label><input type="radio" name="product" value="civiclasse-pilote-99" data-licence="pilote" checked> <span>Pilote seule : <span data-price-for="civiclasse-pilote-99">${ctx.pilot99} net</span></span></label>
    <label class="addon"><input type="radio" name="product" value="civiclasse-pilote-99-b2-69" data-licence="pilote" data-b2="1"> <span>Pilote + option Lecture B2 (<span data-prix-b2>+${ctx.b2a}</span>) : <span data-price-for="civiclasse-pilote-99-b2-69">${euro(P['civiclasse-pilote-99-b2-69'])} net</span></span></label>
    <p class="small"><strong>Licence Annuelle</strong> : 12 mois de licence après la livraison de la version relue, jusqu’à 300 apprenants.</p>
    <label><input type="radio" name="product" value="civiclasse-annuelle-329" data-licence="annuelle"> <span>Annuelle seule : <span data-price-for="civiclasse-annuelle-329">${ctx.annual} net</span></span></label>
    <label class="addon"><input type="radio" name="product" value="civiclasse-annuelle-329-b2-69" data-licence="annuelle" data-b2="1"> <span>Annuelle + option Lecture B2 (<span data-prix-b2>+${ctx.b2a}</span>) : <span data-price-for="civiclasse-annuelle-329-b2-69">${euro(P['civiclasse-annuelle-329-b2-69'])} net</span></span></label>
    <p class="small"><strong>Module Lecture B2 seul</strong>, sans examens blancs : 12 mois après la livraison des séries relues, jusqu’à 300 apprenants.</p>
    <label><input type="radio" name="product" value="civiclasse-lecture-b2-249" data-licence="b2" data-b2="1"> <span>Lecture B2 seul : <span data-price-for="civiclasse-lecture-b2-249">${ctx.b2solo} net</span></span></label>
    <p class="small muted">Accès à la version bêta dès le paiement. Remboursement sur demande si la version relue (licence) ou les 12 séries relues (option Lecture B2) ne sont pas livrées le ${DELIVERY} : article 6 des <a href="${u('cgv-pro/')}">CGV</a>.</p>
  </fieldset>
`;
const PAY_LABEL = 'Payer {prix} et recevoir mon code d’accès';
const orderBody = `<h1>Pré-commander une licence fondateur ou le module Lecture B2</h1>
${C.betaBlock(DELIVERY)}
<p>Avant de payer : l’examen civique et sa préparation officielle sont gratuits pour les candidats (<a href="${C.OFFICIAL.info}" rel="noopener">ministère de l’Intérieur</a>). La licence sert à préparer des groupes : <a href="${u('licence/')}">ce qu’elle contient</a>.</p>
${C.b2RuleBlock()}
${orderFormHtml({
  config: SALES,
  productName: 'Licence fondateur Civiclasse',
  cgvUrl: u('cgv-pro/'),
  intro: 'Vente réservée aux organismes immatriculés en France (SIREN obligatoire). Le code d’accès et la facture acquittée sont envoyés par e-mail dès le paiement confirmé.',
  emailLabel: 'E-mail professionnel (réception du code d’accès et de la facture)',
  extraFieldsHtml: productRadios,
  payLabel: PAY_LABEL,
}).replace('<section class="checkout"', '<section class="checkout" data-section="commande"').replace('(version du 12 octobre 2026)', '(version du 14 octobre 2026)').replace('pour le compte de l’entreprise ci-dessus', 'pour le compte de l’organisme ci-dessus')}`;

const checkoutConfig = `// Generated by the site build from sales.config.json. Public by design.\nwindow.OCTAVE_PAY = ${JSON.stringify({
  endpoint: SALES.endpoint,
  publishableKey: SALES.publishableKey,
  product: 'civiclasse-pilote-99',
  currency: 'eur',
  termsVersion: TERMS_VERSION,
  termsUrl: u('cgv-pro/'),
  orderPage: u('commande/'),
  payLabel: PAY_LABEL,
  laterText: 'Si vous fermez cette page, le code d’accès et la facture vous seront tout de même envoyés par e-mail dans les 10 minutes.',
  offers: Object.fromEntries(Object.entries(P).map(([id, amount]) => [id, { amount, termsVersion: TERMS_VERSION }])),
  quotesEnabled: false,
})};\n`;
const spaceConfig = `// Generated by the site build. Public by design.\nwindow.CIVI_CFG = ${JSON.stringify({ endpoint: SALES.endpoint, contact: CONTACT, deliveryDate: SALES.deliveryDate })};\n`;

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Licence fondateur Civiclasse (préparation à l’examen civique pour formateurs)',
  serviceType: 'Supports de préparation à l’examen civique pour organismes de formation',
  description: `Examens blancs imprimables de 40 questions au format de l’examen civique, corrigés avec extraits officiels, fiches de progression et cartes d’entraînement à l’entretien de naturalisation. Version bêta en pré-commande, version relue livrée au plus tard le ${DELIVERY}.`,
  provider: ORG,
  areaServed: { '@type': 'Country', name: 'France' },
  audience: { '@type': 'BusinessAudience', audienceType: 'Centres d’examen agréés, écoles de FLE, associations, organismes de formation' },
  url: abs('licence/'),
  offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: (Math.min(...Object.values(P)) / 100).toFixed(2), highPrice: (Math.max(...Object.values(P)) / 100).toFixed(2), offerCount: 5, availability: 'https://schema.org/PreOrder', url: abs('commander/'), eligibleCustomerType: 'https://schema.org/Business' },
};
const b2Ld = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Civiclasse, module Lecture B2 (compréhension écrite pour la naturalisation)',
  serviceType: 'Séries imprimables de compréhension écrite de niveau B2 pour formateurs',
  description: `Séries de lecture (texte du domaine public ou texte officiel, 10 questions, vocabulaire, corrigé cité) pour les organismes qui préparent des candidats à la naturalisation. Version bêta en pré-commande, 12 séries relues au plus tard le ${DELIVERY}. N’atteste aucun niveau de langue.`,
  provider: ORG,
  areaServed: { '@type': 'Country', name: 'France' },
  audience: { '@type': 'BusinessAudience', audienceType: 'Écoles de FLE, organismes de formation, associations, centres agréés' },
  url: abs('lecture-b2/'),
  offers: [
    { '@type': 'Offer', name: 'Option Lecture B2 avec la licence Pilote', price: (P['civiclasse-pilote-99-b2-69'] / 100).toFixed(2), priceCurrency: 'EUR', availability: 'https://schema.org/PreOrder', url: abs('commander/?module=lecture-b2'), eligibleCustomerType: 'https://schema.org/Business', seller: ORG },
    { '@type': 'Offer', name: 'Module Lecture B2 seul, 12 mois', price: (P['civiclasse-lecture-b2-249'] / 100).toFixed(2), priceCurrency: 'EUR', availability: 'https://schema.org/PreOrder', url: abs('commander/?module=lecture-b2-seul'), eligibleCustomerType: 'https://schema.org/Business', seller: ORG },
  ],
};

const PAGES = [
  { path: '', title: 'Civiclasse – examens blancs d’examen civique pour formateurs', description: 'Examens blancs de 40 questions au format officiel, corrigés sourcés, fiches de progression et entretien en jeu de rôle, pour les organismes qui préparent à l’examen civique. Version bêta.', body: C.homeBody(ctx), ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Civiclasse', url: abs(''), inLanguage: 'fr', publisher: ORG } },
  { path: 'examen-civique/', title: 'Examen civique 2026 : format, seuil, thèmes (sources officielles)', description: '40 questions, 28 de connaissance et 12 mises en situation, 32 bonnes réponses, 45 minutes : le résumé des pages officielles sur l’examen civique, avec les liens.', body: C.examBody(ctx) },
  { path: 'entrainement/', title: 'Test gratuit d’examen civique : 10 questions corrigées', description: '10 questions d’examen civique avec correction et extrait officiel pour chaque réponse. Gratuit, sans inscription.', body: C.demoBody(ctx).replace('<div id="quiz" class="card"', `<div id="quiz" class="card" data-licence="${u('licence/')}"`) + `\n<script type="application/json" id="demo-data">${JSON.stringify(DEMO).replace(/</g, '\\u003c')}</script>`, scripts: `<script src="${u('assets/demo.js')}"></script>` },
  { path: 'entretien/', title: 'Entretien de naturalisation : s’entraîner avec la Charte', description: 'Ce que disent les textes sur l’entretien d’assimilation et trois cartes d’entraînement tirées de la Charte des droits et devoirs du citoyen français.', body: C.interviewBody(ctx) },
  { path: 'lecture-b2/', title: 'Lecture B2 : compréhension écrite pour la naturalisation – Civiclasse', description: 'Séries imprimables de lecture de niveau B2 (Renan, Hugo, Jaurès, Ferry, textes officiels), 10 questions et corrigé cité. Pour les formateurs. Le niveau B2 se prouve uniquement par un diplôme ou un test officiel.', body: C.lectureB2Body(ctx), ld: b2Ld },
  { path: 'lecture-b2/exemple/', title: 'Série gratuite de lecture B2 : « Qu’est-ce qu’une nation ? » de Renan – Civiclasse', description: 'Une série complète et gratuite à imprimer : extrait de Renan (domaine public), vocabulaire, 10 questions de compréhension, grille et corrigé avec le passage cité.', body: C.b2ExempleBody({ u, set: B2_SAMPLE, sheet: learnerSheet(B2_SAMPLE), key: keySheet(B2_SAMPLE) }), scripts: `<script src="${u('assets/b2-print.js')}"></script>` },
  { path: 'licence/', title: 'Licence fondateur Civiclasse : prix et contenu', description: `Licence par organisme pour préparer des groupes à l’examen civique. Pré-commande en version bêta, version relue au plus tard le ${DELIVERY}.`, body: C.licenceBody(ctx), ld: serviceLd },
  { path: 'commander/', title: 'Pré-commander une licence Civiclasse ou le module Lecture B2', description: 'Commande en ligne réservée aux organismes immatriculés (SIREN), paiement par carte.', body: orderBody, csp: checkoutCsp(SALES), noindex: true, scripts: `<script src="${u('assets/checkout/checkout-config.js')}"></script>\n<script src="${u('assets/commander-xp.js')}"></script>\n<script src="https://js.stripe.com/v3/"></script>\n<script src="${u('assets/checkout/pay.js')}"></script>` },
  { path: 'commande/', title: 'Votre commande Civiclasse', description: 'Confirmation de commande.', body: orderPageBody(), csp: orderCsp(SALES), noindex: true, scripts: `<script src="${u('assets/checkout/checkout-config.js')}"></script>\n<script src="${u('assets/checkout/order.js')}"></script>` },
  { path: 'espace-formateur/', title: 'Espace formateur Civiclasse', description: 'Accès aux examens blancs, corrigés, fiches de progression et cartes d’entretien avec le code reçu par e-mail.', body: C.spaceBody(ctx), noindex: true, scripts: `<script src="${u('assets/space-config.js')}"></script>\n<script type="module" src="${u('assets/espace.mjs')}"></script>` },
  { path: 'sources/', title: 'Sources et méthode – Civiclasse', description: 'Textes officiels utilisés, licences et méthode de vérification des questions.', body: C.sourcesBody(ctx) },
  { path: 'mentions-legales/', title: 'Mentions légales – Civiclasse', description: 'Éditeur, hébergement et indépendance de Civiclasse.', body: C.legalBody(ctx) },
  { path: 'confidentialite/', title: 'Confidentialité – Civiclasse', description: 'Mesure d’audience anonyme sans cookie, données des clients.', body: C.privacyBody(ctx) },
  { path: 'cgv-pro/', title: 'Conditions générales de vente – Civiclasse', description: 'CGV des licences fondateur Civiclasse (professionnels).', body: C.cgvBody(ctx) },
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets/checkout'), { recursive: true });
for (const pg of PAGES) {
  const dir = join(OUT, pg.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), layout(pg));
}
writeFileSync(join(OUT, '404.html'), layout({ path: '404', title: 'Page introuvable – Civiclasse', description: 'Page introuvable.', noindex: true, body: `<h1>Page introuvable</h1><p><a href="${u('')}">Retour à l’accueil</a> · <a href="${u('entrainement/')}">Test gratuit</a></p>` }));
for (const f of ['style.css', 'demo.js', 'examen.mjs', 'espace.mjs', 'xp.js', 'commander-xp.js', 'lecture-b2.mjs', 'b2-print.js']) cpSync(join(ROOT, 'src/assets', f), join(OUT, 'assets', f));
writeFileSync(join(OUT, 'assets/favicon.svg'), LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
cpSync(join(ROOT, 'src/vendor/mesure.js'), join(OUT, 'mesure.js'));
cpSync(join(ROOT, 'src/vendor/cro.js'), join(OUT, 'cro.js'));
cpSync(join(ROOT, 'src/vendor/pay.js'), join(OUT, 'assets/checkout/pay.js'));
cpSync(join(ROOT, 'src/vendor/order.js'), join(OUT, 'assets/checkout/order.js'));
writeFileSync(join(OUT, 'assets/checkout/checkout-config.js'), checkoutConfig);
writeFileSync(join(OUT, 'assets/space-config.js'), spaceConfig);
const indexable = PAGES.filter((p) => !p.noindex);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `<url><loc>${abs(p.path)}</loc><lastmod>${p.lastmod || '2026-10-14'}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${abs('sitemap.xml')}\n`);
console.log(`built ${PAGES.length + 1} pages into ${OUT} (base ${BASE}, sales ${SALES.SALES_OPEN ? 'open' : 'closed'}, delivery ${SALES.deliveryDate}${SALES.deliveryDateIsPlaceholder ? ' PLACEHOLDER' : ''})`);
