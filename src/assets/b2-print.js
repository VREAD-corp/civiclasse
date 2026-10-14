/* Civiclasse « Lecture B2 », free sample page: print the learner sheet or the key only; counts a 'download' goal
 * (cro.js, aggregated, nothing typed is read). */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-print-b2]');
    if (!b) return;
    var what = b.getAttribute('data-print-b2');
    if (window.octaveCro && window.octaveCro.goal) window.octaveCro.goal('download');
    document.body.classList.add('print-mode', what === 'key' ? 'print-only-b2key' : 'print-only-b2');
    var done = function () { document.body.classList.remove('print-mode', 'print-only-b2key', 'print-only-b2'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  });
})();
