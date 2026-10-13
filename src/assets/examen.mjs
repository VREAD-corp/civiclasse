// Civiclasse: pure logic of the mock exams, the answer grids and the scoring (no DOM; unit-tested in Node).
// Format of the official exam (arrêté du 10 octobre 2025, art. 3; formation-civique.interieur.gouv.fr):
// 40 questions, 28 knowledge + 12 situations (6 in theme 1, 6 in theme 3), 4 options, 1 correct, 32/40 to pass, 45 min.

export const PASS_MARK = 32;
export const EXAM_SIZE = 40;
export const DURATION_MIN = 45;
export const LETTERS = ['A', 'B', 'C', 'D'];

export const PLAN = [
  { theme: 'principes', label: 'Principes et valeurs de la République', connaissance: 5, situation: 6 },
  { theme: 'institutions', label: 'Système institutionnel et politique', connaissance: 6, situation: 0 },
  { theme: 'droits', label: 'Droits et devoirs', connaissance: 5, situation: 6 },
  { theme: 'histoire', label: 'Histoire, géographie et culture', connaissance: 8, situation: 0 },
  { theme: 'societe', label: 'Vivre dans la société française', connaissance: 4, situation: 0 },
];
export const THEME_LABEL = Object.fromEntries(PLAN.map((p) => [p.theme, p.label]));
export const MENTIONS = { csp: 'Carte de séjour pluriannuelle (CSP)', cr: 'Carte de résident (CR)', nat: 'Naturalisation' };

/** Deterministic PRNG (mulberry32): the same series number always gives the same exam. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds one mock exam. `bank`: verified items; `mention`: csp | cr | nat; `seed`: series number (1..999999).
 * `exclude`: ids already used (a later series avoids repeating them while enough items remain).
 * Knowledge questions come from the official list of the mention; when a theme lacks items for that mention,
 * the exam is completed with knowledge questions of the same theme from the other lists, and `warnings` says so.
 * Options are shuffled with the same seed; `answer` follows the shuffle.
 */
export function buildExam(bank, { mention = 'csp', seed = 1, exclude = [] } = {}) {
  if (!MENTIONS[mention]) throw new Error('mention inconnue');
  const rand = rng(seed * 7919 + Object.keys(MENTIONS).indexOf(mention));
  const ex = new Set(exclude);
  const warnings = [];
  const questions = [];
  for (const p of PLAN) {
    for (const kind of ['connaissance', 'situation']) {
      const need = p[kind];
      if (!need) continue;
      const pool = bank.filter((q) => q.theme === p.theme && q.kind === kind);
      const primary = pool.filter((q) => kind === 'situation' || q.mentions.includes(mention));
      const fallback = pool.filter((q) => !primary.includes(q));
      let picked = pickFresh(primary, need, ex, rand);
      if (picked.length < need) {
        const more = pickFresh(fallback, need - picked.length, ex, rand);
        if (more.length) warnings.push(`${p.label} : ${more.length} question(s) de connaissance d’une autre liste officielle que celle de la mention.`);
        picked = picked.concat(more);
      }
      if (picked.length < need) throw new Error(`Pas assez de questions vérifiées pour « ${p.label} » (${kind}).`);
      questions.push(...picked);
    }
  }
  const out = questions.map((q, i) => {
    const order = shuffle([0, 1, 2, 3], rand);
    return { n: i + 1, id: q.id, theme: q.theme, kind: q.kind, official: q.official, prompt: q.prompt, options: order.map((k) => q.options[k]), answer: order.indexOf(q.answer), explanation: q.explanation, evidence: q.evidence };
  });
  return { seed, mention, questions: out, warnings };
}

/** Prefers items not in `ex`; reuses excluded ones only when the fresh pool is too small. */
function pickFresh(pool, need, ex, rand) {
  const fresh = shuffle(pool.filter((q) => !ex.has(q.id)), rand);
  const used = shuffle(pool.filter((q) => ex.has(q.id)), rand);
  return fresh.concat(used).slice(0, need);
}

/** Parses a learner's answers typed as letters (« ABDC… », spaces, commas, lower case and « - » for blank allowed). */
export function parseAnswers(text, size = EXAM_SIZE) {
  const letters = String(text || '').toUpperCase().replace(/[^ABCD\-_.?]/g, '').split('');
  if (letters.length !== size) return { ok: false, count: letters.length };
  return { ok: true, answers: letters.map((l) => LETTERS.indexOf(l)) };
}

/** Score of a learner on an exam: total, pass (≥ 32/40), per theme and per kind. Blank or wrong = 0, as in the exam. */
export function score(exam, answers) {
  const byTheme = Object.fromEntries(PLAN.map((p) => [p.theme, { ok: 0, total: 0 }]));
  const byKind = { connaissance: { ok: 0, total: 0 }, situation: { ok: 0, total: 0 } };
  let ok = 0;
  const wrong = [];
  exam.questions.forEach((q, i) => {
    const good = answers[i] === q.answer;
    if (good) ok++;
    else wrong.push(q.n);
    byTheme[q.theme].total++;
    byKind[q.kind].total++;
    if (good) {
      byTheme[q.theme].ok++;
      byKind[q.kind].ok++;
    }
  });
  const passMark = Math.ceil((PASS_MARK / EXAM_SIZE) * exam.questions.length);
  return { ok, total: exam.questions.length, pass: ok >= passMark, passMark, byTheme, byKind, wrong };
}

/** Answer key as a compact string, e.g. « 1 B · 2 D · … », used on the printed answer key and in tests. */
export const keyString = (exam) => exam.questions.map((q) => `${q.n} ${LETTERS[q.answer]}`).join(' · ');
