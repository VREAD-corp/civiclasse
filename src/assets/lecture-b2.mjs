// Civiclasse « Lecture B2 »: printable rendering of one reading set (text with numbered paragraphs, vocabulary,
// 10 questions, answer grid, trainer key). Pure functions, used by the site build (free sample page) and by the
// trainer area in the browser (paid sets served by the `access` action). No network, nothing stored.
export const LETTERS = ['A', 'B', 'C', 'D'];
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SKILL_HELP = {
  'compréhension littérale': 'repérer une information',
  'inférence': 'déduire ce qui n’est pas dit mot pour mot',
  'vocabulaire en contexte': 'comprendre un mot dans sa phrase',
  'intention de l’auteur': 'saisir le but ou le point de vue',
  'structure': 'voir comment le texte est construit',
};

export function sourceLine(set) {
  const s = set.source || {};
  const links = [];
  if (s.url) links.push(`<a href="${esc(s.url)}" rel="noopener">${esc(s.url.includes('wikisource') ? 'transcription Wikisource (CC BY-SA 4.0)' : s.url.includes('service-public') ? 'service-public.gouv.fr' : s.url.includes('conseil-constitutionnel') ? 'Conseil constitutionnel' : 'source')}</a>`);
  if (s.url2) links.push(`<a href="${esc(s.url2)}" rel="noopener">transcription Wikisource (CC BY-SA 4.0)</a>`);
  if (s.legifrance) links.push(`<a href="${esc(s.legifrance)}" rel="noopener">Légifrance (texte en vigueur)</a>`);
  if (s.permalink) links.push(`<a href="${esc(s.permalink)}" rel="noopener">version citée</a>`);
  return links.join(' · ');
}

function textBlock(set) {
  return set.paragraphs.map((p) => {
    if (p.kind === 'heading') return `<h4 class="b2-h">${esc(p.text)}</h4>`;
    if (p.kind === 'subheading') return `<p class="b2-sub">${esc(p.text)}</p>`;
    return `<p class="b2-p${p.kind === 'item' ? ' b2-item' : ''}"><span class="b2-n" aria-label="paragraphe ${p.n}">${p.n}</span>${p.kind === 'item' ? '– ' : ''}${esc(p.text)}</p>`;
  }).join('\n');
}

/** Learner sheet: header, context, text, vocabulary, questions, answer grid. */
export function learnerSheet(set, { group = '', date = '' } = {}) {
  return `<div class="sheet sheet-b2">
<p class="small muted">Civiclasse · Lecture B2 · série ${set.order} · compréhension écrite · version bêta</p>
<h2>${esc(set.title)}</h2>
<p><strong>${esc(set.author)}</strong>${set.authorDates ? ` (${esc(set.authorDates)})` : ''} · ${esc(set.genre)} · ${esc(set.year)} · ${esc(set.words)} mots</p>
${group || date ? `<p class="small">${group ? 'Groupe : ' + esc(group) : ''}${group && date ? ' · ' : ''}${date ? esc(date) : ''}</p>` : ''}
<p>Nom : ______________________ &nbsp; Prénom : ______________________</p>
<div class="b2-context"><p>${esc(set.context)}</p></div>
<p class="small">Lisez le texte, puis répondez aux 10 questions : une seule bonne réponse par question. Durée conseillée : 30 minutes. Les numéros en marge repèrent les paragraphes.</p>
<div class="b2-text">
${textBlock(set)}
</div>
<p class="small muted">${esc(set.omissions)}</p>
<div class="b2-vocab"><h3>Vocabulaire</h3><dl>${set.vocabulary.map((v) => `<dt>${esc(v.term)}</dt><dd>${esc(v.def)}</dd>`).join('')}</dl></div>
<h3>Questions</h3>
<ol class="b2-q">
${set.questions.map((q) => `<li><p>${esc(q.q)}</p><ul>${q.options.map((o, k) => `<li>${LETTERS[k]}. ${esc(o)}</li>`).join('')}</ul></li>`).join('\n')}
</ol>
<p class="b2-grid">${set.questions.map((q) => `<span>${String(q.n).padStart(2, '0')}  A  B  C  D</span>`).join('')}</p>
<p class="small muted">Texte : ${esc(set.status)}</p>
</div>`;
}

/** Trainer key: letter, skill, paragraph and the passage that justifies the answer. */
export function keySheet(set) {
  return `<div class="sheet sheet-b2key">
<p class="small muted">Civiclasse · Lecture B2 · série ${set.order} · corrigé réservé au formateur</p>
<h2>Corrigé de la série « ${esc(set.title)} »</h2>
<p class="b2-grid">${set.questions.map((q) => `<span>${String(q.n).padStart(2, '0')} : ${LETTERS[q.answer]}</span>`).join('')}</p>
<div class="table-wrap"><table><thead><tr><th>N°</th><th>Réponse</th><th>Compétence</th><th>Passage qui justifie la réponse</th></tr></thead><tbody>
${set.questions.map((q) => `<tr><td>${q.n}</td><td>${LETTERS[q.answer]}. ${esc(q.options[q.answer])}</td><td>${esc(q.skill)}<br><span class="small muted">${esc(SKILL_HELP[q.skill] || '')}</span></td><td>${q.p ? `§ ${q.p} : ` : ''}« ${esc(q.quote)} »</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small">Barème indicatif : 1 point par bonne réponse. Ces séries entraînent à la compréhension écrite ; elles ne mesurent pas un niveau du CECRL et ne remplacent pas un test ou un diplôme reconnu.</p>
<p class="small muted">Source du texte : ${sourceLine(set)}. ${esc(set.status)}</p>
</div>`;
}
