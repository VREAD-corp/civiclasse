/* Order page: applies the 'civi-prix' variant to the Pilot radio BEFORE pay.js reads the products (cro.js has
 * already set window.octaveCro; its own text swap only runs at DOMContentLoaded, after pay.js). */
(function () {
  'use strict';
  var v = window.octaveCro && window.octaveCro.v ? window.octaveCro.v('civi-prix') : 'p99';
  if (v !== 'p129') return;
  var r = document.querySelector('input[name="product"][value="civiclasse-pilote-99"]');
  if (!r) return;
  r.value = 'civiclasse-pilote-129';
  var lbl = document.querySelector('[data-price-for="civiclasse-pilote-99"]');
  if (lbl) { lbl.setAttribute('data-price-for', 'civiclasse-pilote-129'); lbl.textContent = '129 € net'; }
  var pp = document.getElementById('product-price');
  if (pp && r.checked) pp.textContent = '129,00 € net (TVA non applicable, art. 293 B du CGI)';
  Array.prototype.forEach.call(document.querySelectorAll('[data-prix-pilote]'), function (e) { e.textContent = '129 €'; });
})();
