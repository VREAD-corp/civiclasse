/* Civiclasse: free 10-question practice test. Runs entirely in the browser; nothing is sent. */
(function () {
  'use strict';
  var box = document.getElementById('quiz');
  var data = JSON.parse(document.getElementById('demo-data').textContent);
  var items = data.items;
  var L = ['A', 'B', 'C', 'D'];
  var i = 0, good = 0, started = Date.now();
  var THEME = { principes: 'Principes et valeurs de la République', institutions: 'Système institutionnel et politique', droits: 'Droits et devoirs', histoire: 'Histoire, géographie et culture', societe: 'Vivre dans la société française' };

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function evidence(q) {
    var p = el('div', { class: 'evidence' });
    p.appendChild(document.createTextNode('Source officielle : '));
    var qq = el('q', {}, q.evidence.quote);
    p.appendChild(qq);
    p.appendChild(document.createTextNode(' '));
    var a = el('a', { href: q.evidence.url, rel: 'noopener' }, q.evidence.label);
    p.appendChild(a);
    return p;
  }
  function show() {
    box.textContent = '';
    if (i >= items.length) return end();
    var q = items[i];
    box.appendChild(el('p', { class: 'progress-line' }, 'Question ' + (i + 1) + ' sur ' + items.length + ' · ' + THEME[q.theme]));
    var tag = el('span', { class: 'kind-tag' }, q.kind === 'situation' ? 'Mise en situation' : (q.official ? 'Question de la liste officielle' : 'Question de connaissance'));
    box.appendChild(tag);
    var h = el('p', { class: 'quiz-q', id: 'q-text' }, q.prompt);
    box.appendChild(h);
    var ul = el('ul', { class: 'opts', 'aria-labelledby': 'q-text' });
    q.options.forEach(function (o, k) {
      var li = el('li');
      var b = el('button', { type: 'button', 'data-k': String(k) }, L[k] + '. ' + o);
      b.addEventListener('click', function () { answer(k, ul, q); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    var first = ul.querySelector('button');
    if (i > 0 && first) first.focus();
  }
  function answer(k, ul, q) {
    var buttons = ul.querySelectorAll('button');
    Array.prototype.forEach.call(buttons, function (b, n) {
      b.disabled = true;
      if (n === q.answer) b.classList.add('good');
      if (n === k && k !== q.answer) b.classList.add('bad');
    });
    var ok = k === q.answer;
    if (ok) good++;
    var fb = el('p', { class: 'status ' + (ok ? 'ok' : 'err'), role: 'status' }, ok ? 'Bonne réponse.' : 'Ce n’est pas la bonne réponse : la bonne réponse est ' + L[q.answer] + '.');
    box.appendChild(fb);
    box.appendChild(el('p', {}, q.explanation));
    box.appendChild(evidence(q));
    var next = el('button', { type: 'button', class: 'btn' }, i + 1 < items.length ? 'Question suivante' : 'Voir mon résultat');
    next.addEventListener('click', function () { i++; show(); });
    var row = el('div', { class: 'btn-row' });
    row.appendChild(next);
    box.appendChild(row);
    next.focus();
  }
  function end() {
    var min = Math.max(1, Math.round((Date.now() - started) / 60000));
    box.appendChild(el('h2', { style: 'margin-top:0' }, 'Résultat : ' + good + ' sur ' + items.length));
    box.appendChild(el('p', {}, (good >= 8 ? 'Au niveau du seuil officiel de 80 %.' : 'Sous le seuil officiel de 80 % (32 sur 40 à l’examen).') + ' Durée : environ ' + min + ' min. À l’examen, 40 questions en 45 minutes au plus, soit un peu plus d’une minute par question.'));
    box.appendChild(el('p', {}, 'Pour continuer gratuitement : les fiches et les listes officielles du ministère, liens ci-dessous. Pour préparer un groupe avec des examens blancs complets : la licence formateur.'));
    var row = el('div', { class: 'btn-row' });
    var again = el('button', { type: 'button', class: 'btn secondary' }, 'Recommencer');
    again.addEventListener('click', function () { i = 0; good = 0; started = Date.now(); show(); });
    var lic = el('a', { class: 'btn', href: box.getAttribute('data-licence') }, 'Voir la licence formateur');
    row.appendChild(again);
    row.appendChild(lic);
    box.appendChild(row);
    if (window.octaveCro && window.octaveCro.add) window.octaveCro.add('form', 'test-gratuit', 'submit');
  }
  show();
})();
