/* Civiclasse: counts the 'sample' goal of cro.js (aggregated, once per tab, nothing typed is read) when a free sample
 * is opened or printed: links and buttons marked data-sample. Secondary metric of the pooled test POOLED-READING-01. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-sample]');
    if (t && window.octaveCro && window.octaveCro.goal) window.octaveCro.goal('sample');
  });
})();
