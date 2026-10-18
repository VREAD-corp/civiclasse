/* Civiclasse free printable sample: print the exam sheet (with its answer grid) or the key only. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-print-exam]');
    if (!b) return;
    var cls = b.getAttribute('data-print-exam') === 'key' ? 'print-only-key' : 'print-only-exam';
    document.body.classList.add('print-mode', cls);
    var done = function () { document.body.classList.remove('print-mode', cls); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  });
})();
