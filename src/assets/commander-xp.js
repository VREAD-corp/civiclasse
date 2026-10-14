/* Order page: applies the two A/B variants to the product radios BEFORE pay.js reads them (cro.js has already set
 * window.octaveCro; its own text swap only runs at DOMContentLoaded, after pay.js).
 *   'civi-prix'    p99 | p129 : price of the Pilot licence (alone or with the add-on)
 *   'civi-b2-prix' a69 | b99  : price of the Lecture B2 add-on (+69 € / +99 €)
 * ?module=lecture-b2 preselects « Pilote + option Lecture B2 », ?module=lecture-b2-seul the module alone.
 * Choosing a radio with the add-on counts the 'addon' goal (aggregated, nothing typed is read). */
(function () {
  'use strict';
  var cro = window.octaveCro;
  var vp = cro && cro.v ? cro.v('civi-prix') : 'p99';
  var vb = cro && cro.v ? cro.v('civi-b2-prix') : 'a69';
  var pilot = vp === 'p129' ? 129 : 99;
  var addon = vb === 'b99' ? 99 : 69;
  var euro = function (n) { return n + ' €'; };
  var full = function (n) { return n + ',00 € net (TVA non applicable, art. 293 B du CGI)'; };
  var PRICES = { pilote: pilot, annuelle: 329 };
  Array.prototype.forEach.call(document.querySelectorAll('input[name="product"]'), function (r) {
    var lic = r.getAttribute('data-licence');
    if (lic === 'b2') return;
    var b2 = r.getAttribute('data-b2') === '1';
    var base = lic === 'pilote' ? 'civiclasse-pilote-' + pilot : 'civiclasse-annuelle-329';
    var id = b2 ? base + '-b2-' + addon : base;
    var lbl = document.querySelector('[data-price-for="' + r.value + '"]');
    r.value = id;
    if (lbl) { lbl.setAttribute('data-price-for', id); lbl.textContent = euro(PRICES[lic] + (b2 ? addon : 0)) + ' net'; }
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-prix-b2]'), function (e) { e.textContent = '+' + euro(addon); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-prix-pilote]'), function (e) { e.textContent = euro(pilot); });
  var m = /[?&]module=(lecture-b2(?:-seul)?)(?:&|$)/.exec(window.location.search);
  var want = m ? (m[1] === 'lecture-b2-seul' ? 'civiclasse-lecture-b2-249' : 'civiclasse-pilote-' + pilot + '-b2-' + addon) : null;
  var checked = null;
  Array.prototype.forEach.call(document.querySelectorAll('input[name="product"]'), function (r) {
    if (want) r.checked = r.value === want;
    if (r.checked) checked = r;
    r.addEventListener('change', function () { if (r.checked && r.getAttribute('data-b2') === '1' && window.octaveCro && window.octaveCro.goal) window.octaveCro.goal('addon'); });
  });
  var pp = document.getElementById('product-price');
  if (pp && checked) {
    var lic = checked.getAttribute('data-licence');
    var n = lic === 'b2' ? 249 : PRICES[lic] + (checked.getAttribute('data-b2') === '1' ? addon : 0);
    pp.textContent = full(n);
  }
})();
