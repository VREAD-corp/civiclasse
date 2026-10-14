// End-to-end checks of the built site (local: dist/ through scripts/serve.mjs; live: BASE_URL=…). The Apps Script
// `access` action is mocked with a NON-SENSITIVE fixture (masked prompts): the paid bank never sits in this repo.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const FIXTURE = readFileSync(new URL('./fixtures/access.json', import.meta.url), 'utf8');
const NOTRACK = '?octave_notrack=1';

test('home: free official preparation stated, beta label, links to service-public and formation-civique', async ({ page }) => {
  await page.goto(NOTRACK);
  await expect(page.locator('h1')).toContainText('Examen civique');
  await expect(page.locator('#gratuit')).toContainText('totalement gratuite');
  await expect(page.locator('.beta-pill').first()).toHaveText('version bêta — relecture experte en cours');
  expect(await page.locator('a[href*="formation-civique.interieur.gouv.fr"]').count()).toBeGreaterThan(2);
  expect(await page.locator('a[href*="service-public.gouv.fr"]').count()).toBeGreaterThan(1);
  await expect(page.locator('.notice')).toContainText('sans lien avec le ministère');
});

test('free 10-question test: answer all, see corrections with official sources and a score', async ({ page }) => {
  await page.goto('entrainement/' + NOTRACK);
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.progress-line')).toContainText(`Question ${i + 1} sur 10`);
    await page.locator('.opts button').first().click();
    await expect(page.locator('.evidence a')).toHaveAttribute('href', /^https:\/\/(formation-civique\.interieur\.gouv\.fr|www\.conseil-constitutionnel\.fr|www\.immigration\.interieur\.gouv\.fr|www\.service-public\.gouv\.fr)\//);
    await page.locator('#quiz .btn').click();
  }
  await expect(page.locator('#quiz h2')).toContainText(/Résultat : \d+ sur 10/);
});

test('trainer area: wrong code refused, fixture code opens it; exam of 40 questions, key, quick marking, interview', async ({ page }) => {
  await page.route(/script\.google\.com\/macros\/s\/.*\/exec/, async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    if (body.action !== 'access') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    if (body.code !== 'CIVI-TEST-TEST-TEST-TEST') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'invalid_code', message: 'Code d’accès inconnu ou désactivé.' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE });
  });
  await page.goto('espace-formateur/' + NOTRACK);
  await page.fill('input[name=code]', 'CIVI-AAAA-AAAA-AAAA-AAAA');
  await page.click('#code-button');
  await expect(page.locator('#code-error')).toContainText('inconnu');
  await page.fill('input[name=code]', 'CIVI-TEST-TEST-TEST-TEST');
  await page.click('#code-button');
  await expect(page.locator('#licence-line')).toContainText('École FLE Test');
  await page.fill('input[name=seed]', '42');
  await page.fill('input[name=group]', 'Groupe A');
  await page.click('#exam-form button[type=submit]');
  await expect(page.locator('.sheet-exam ol.exam > li')).toHaveCount(40);
  await expect(page.locator('.sheet-exam .kind-tag')).toHaveCount(12);
  await expect(page.locator('.sheet-key tbody tr')).toHaveCount(40);
  await page.click('#t-corr');
  await page.fill('input[name=learner]', 'A. B.');
  await page.fill('input[name=answers]', 'A'.repeat(40));
  await page.click('#corr-form button');
  await expect(page.locator('#corr-result')).toContainText('A. B. :');
  await expect(page.locator('#progress tbody tr').first()).toContainText('/40');
  await page.click('#t-int');
  await page.click('#int-draw');
  await expect(page.locator('#int-card .card-q')).not.toBeEmpty();
  await page.click('#t-bank');
  await expect(page.locator('#bank-count')).toContainText('40 question(s) sur 40');
  await page.click('#t-b2');
  await expect(page.locator('#b2-set option')).toHaveCount(2);
  await expect(page.locator('#b2-out .sheet-b2 ol.b2-q > li')).toHaveCount(10);
  await expect(page.locator('#b2-out .sheet-b2key tbody tr')).toHaveCount(10);
  await page.selectOption('#b2-set', '1');
  await expect(page.locator('#b2-out h2').first()).toContainText('Série 2');
});

test('trainer area, Lecture B2 only: civic tabs hidden, B2 tab open', async ({ page }) => {
  const fx = JSON.parse(FIXTURE);
  fx.licence.modules = ['lecture-b2'];
  fx.licence.name = 'Module Lecture B2 seul';
  fx.content = { version: 'none', bank: [], interview: { cards: [] } };
  await page.route(/script\.google\.com\/macros\/s\/.*\/exec/, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fx) }));
  await page.goto('espace-formateur/' + NOTRACK);
  await page.fill('input[name=code]', 'CIVI-TEST-TEST-TEST-TEST');
  await page.click('#code-button');
  await expect(page.locator('#licence-line')).toContainText('Lecture B2 : 2 séries sur 12');
  await expect(page.locator('#t-exam')).toBeHidden();
  await expect(page.locator('#t-b2')).toBeVisible();
  await expect(page.locator('#p-b2')).toBeVisible();
  await expect(page.locator('#b2-out .sheet-b2 ol.b2-q > li')).toHaveCount(10);
});

test('trainer area, civic licence without the module: no B2 tab', async ({ page }) => {
  const fx = JSON.parse(FIXTURE);
  fx.licence.modules = ['civique'];
  fx.b2 = null;
  await page.route(/script\.google\.com\/macros\/s\/.*\/exec/, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fx) }));
  await page.goto('espace-formateur/' + NOTRACK);
  await page.fill('input[name=code]', 'CIVI-TEST-TEST-TEST-TEST');
  await page.click('#code-button');
  await expect(page.locator('#licence-line')).toContainText('École FLE Test');
  await expect(page.locator('#t-b2')).toBeHidden();
  await expect(page.locator('#t-exam')).toBeVisible();
});

test('order page: radios, SIREN check, terms link, beta notice (no payment made)', async ({ page }) => {
  await page.goto('commander/' + NOTRACK);
  await expect(page.locator('input[name=product]')).toHaveCount(5);
  await expect(page.locator('#regle-b2')).toContainText('Seul un diplôme ou une attestation officiels prouvent ce niveau');
  await expect(page.locator('#terms-link')).toHaveAttribute('href', /cgv-pro\/$/);
  await expect(page.locator('.callout-warn')).toContainText('version bêta');
  await page.fill('input[name=siren]', '123456789');
  expect(await page.locator('input[name=siren]').evaluate((e) => e.validationMessage)).toContain('SIREN invalide');
});

test('A/B: ?prix=p129 shows 129 € on the offer and selects the 129 € product on the order page', async ({ page }) => {
  await page.goto('licence/?prix=p129&octave_notrack=1');
  await expect(page.locator('[data-prix-pilote]').first()).toHaveText('129 €');
  await page.goto('commander/?prix=p129&octave_notrack=1');
  await expect(page.locator('input[name=product]').first()).toHaveAttribute('value', 'civiclasse-pilote-129');
  await expect(page.locator('[data-price-for="civiclasse-pilote-129"]')).toHaveText('129 € net');
});

test('A/B Lecture B2: ?b2=b99 gives +99 € and the -b2-99 products; ?module preselects; both arms combine', async ({ page }) => {
  await page.goto('lecture-b2/?b2=b99&octave_notrack=1');
  await expect(page.locator('[data-prix-b2]').first()).toHaveText('+99 €');
  await page.goto('commander/?prix=p129&b2=b99&module=lecture-b2&octave_notrack=1');
  const values = await page.locator('input[name=product]').evaluateAll((l) => l.map((e) => e.value));
  expect(values).toEqual(['civiclasse-pilote-129', 'civiclasse-pilote-129-b2-99', 'civiclasse-annuelle-329', 'civiclasse-annuelle-329-b2-99', 'civiclasse-lecture-b2-249']);
  await expect(page.locator('input[name=product]:checked')).toHaveAttribute('value', 'civiclasse-pilote-129-b2-99');
  await expect(page.locator('[data-price-for="civiclasse-pilote-129-b2-99"]')).toHaveText('228 € net');
  await expect(page.locator('#product-price')).toContainText('228,00 €');
  await page.goto('commander/?b2=a69&module=lecture-b2-seul&octave_notrack=1');
  await expect(page.locator('input[name=product]:checked')).toHaveAttribute('value', 'civiclasse-lecture-b2-249');
  await expect(page.locator('[data-price-for="civiclasse-pilote-99-b2-69"]')).toHaveText('168 € net');
});

test('Lecture B2 pages: module page and free sample, 375 px without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const p of ['lecture-b2/', 'lecture-b2/exemple/', 'commander/', 'licence/']) {
    await page.goto(p + NOTRACK);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), p).toBeLessThanOrEqual(375);
  }
  await page.goto('lecture-b2/exemple/' + NOTRACK);
  await expect(page.locator('.sheet-b2 ol.b2-q > li')).toHaveCount(10);
  await expect(page.locator('#regle-b2')).toContainText('1er janvier 2026');
});
