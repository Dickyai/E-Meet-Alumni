(function () {
  'use strict';
  var CFG = window.EMEET_CONFIG || {};
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return rmq.matches; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var COLORS = ['#F6C945', '#EE6C57', '#FFB84D', '#9DB59A', '#A9C8E8'];

  var scenes = $$('.scene');
  var modal = $('#rsvpModal');
  var lightbox = $('#lightbox');
  var cur = 0, ready = false;

  /* ---------- Dekorasi: bunting ---------- */
  (function bunting() {
    var host = $('#bunting');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 60');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = '<path d="M0 4 Q200 44 400 4" fill="none" stroke="#8B6F47" stroke-width="1.6" vector-effect="non-scaling-stroke"/>';
    host.appendChild(svg);
    var n = window.innerWidth > 820 ? 16 : 10, cols = ['#EE6C57', '#F6C945', '#9DB59A', '#A9C8E8'];
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n;
      var y = Math.pow(1 - t, 2) * 4 + 2 * (1 - t) * t * 44 + t * t * 4;
      var f = document.createElement('span');
      f.className = 'flag';
      f.style.left = (t * 100) + '%';
      f.style.top = (y * 70 / 60 - 1) + 'px';
      f.style.background = cols[i % cols.length];
      f.style.setProperty('--dl', (-i * 0.37) + 's');
      host.appendChild(f);
    }
  })();

  /* ---------- Dekorasi: sebar ikon per scene ---------- */
  var DECO_COLORS = { sparkle: ['#F6C945', '#EE6C57', '#FFFDF7'], flower: ['#EE6C57', '#A9C8E8', '#F6C945'], leaf: ['#9DB59A', '#4F6B4D'], flame: ['#EE6C57', '#F6A23A'] };
  scenes.forEach(function (sc, si) {
    var spec = sc.dataset.deco, bg = $('.bg', sc);
    if (!spec || !bg) return;
    var r = rng(97 + si * 31);
    spec.split(',').forEach(function (p) {
      var kv = p.split(':'), type = kv[0], n = +kv[1], pal = DECO_COLORS[type] || ['#F6C945'];
      for (var k = 0; k < n; k++) {
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'deco ' + type);
        svg.setAttribute('aria-hidden', 'true');
        var use = document.createElementNS(NS, 'use');
        use.setAttribute('href', '#i-' + type);
        svg.appendChild(use);
        var edge = r() < .75, size = 12 + r() * 22;
        var x = edge ? (r() < .5 ? 1 + r() * 12 : 86 + r() * 12) : 18 + r() * 64;
        svg.style.left = x + '%';
        svg.style.top = (9 + r() * 76) + '%';
        svg.style.width = svg.style.height = size + 'px';
        svg.style.color = pal[Math.floor(r() * pal.length)];
        svg.style.setProperty('--dl', (-r() * 5).toFixed(2) + 's');
        svg.style.setProperty('--du', (3 + r() * 4).toFixed(2) + 's');
        bg.appendChild(svg);
      }
    });
  });

  /* ---------- Teks: judul per huruf, narasi per kata, urutan animasi ---------- */
  (function splitTitle() {
    var h = $('#mainTitle'), text = h.textContent.trim(), c = 0;
    h.textContent = '';
    text.split(' ').forEach(function (word, wi) {
      var w = document.createElement('span');
      w.className = 'word'; w.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'ch'; s.style.setProperty('--c', c++); s.textContent = ch;
        w.appendChild(s);
      });
      h.appendChild(w);
      if (wi < text.split(' ').length - 1) h.appendChild(document.createTextNode(' '));
    });
  })();
  $$('.narr').forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w'; s.style.setProperty('--w', i); s.textContent = w;
      p.appendChild(s);
      if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
    });
  });
  // narasi kedua mulai setelah narasi pertama
  scenes.forEach(function (sc) {
    var off = 0;
    $$('.narr', sc).forEach(function (p) {
      $$('.w', p).forEach(function (w) { w.style.setProperty('--w', (+w.style.getPropertyValue('--w')) + off); });
      off += $$('.w', p).length + 4;
    });
    $$('[data-a],[data-p]', sc).forEach(function (el, i) { el.style.setProperty('--i', i); });
  });

  /* ---------- Placeholder foto ---------- */
  function toPlaceholder(img) {
    if (img.dataset.done) return;
    img.dataset.done = '1';
    var ph = document.createElement('div');
    ph.className = 'placeholder';
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', 'Placeholder: ' + (img.dataset.label || 'foto arsip') + ' (aset belum tersedia)');
    ph.innerHTML = '<span>Foto arsip belum tersedia</span><small></small>';
    ph.querySelector('small').textContent = (img.getAttribute('src') || '').split('/').pop();
    img.replaceWith(ph);
  }
  $$('img[data-label]').forEach(function (img) {
    img.addEventListener('error', function () { toPlaceholder(img); });
    if (img.complete && img.naturalWidth === 0) toPlaceholder(img);
  });

  /* ---------- Efek partikel (bara, bintang, kembang api, konfeti) ---------- */
  var cv = $('#fx'), ctx = cv.getContext('2d');
  var W = 0, H = 0, parts = [], lastT = 0, raf = 0, running = false, fwT = 1200, embers = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function pick() { return COLORS[(Math.random() * COLORS.length) | 0]; }
  function spawnEmber(initial) {
    embers++;
    parts.push({ k: 'e', x: rand(0, W), y: initial ? rand(0, H) : H + 10, vx: rand(-.15, .15), vy: -rand(.25, .8), r: rand(1.2, 3.2), life: 0, max: rand(280, 560), c: COLORS[(Math.random() * 3) | 0], ph: rand(0, 6.28) });
  }
  function burst(x, y, kind, n) {
    if (reduced() || !running || parts.length > 380) return;
    var i, a, s;
    if (kind === 'confetti') {
      for (i = 0; i < n; i++) {
        a = rand(-Math.PI * .95, -Math.PI * .05); s = rand(5, 12);
        parts.push({ k: 'f', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, w: rand(5, 9), h: rand(8, 14), rot: rand(0, 6.28), vr: rand(-.25, .25), life: 0, max: rand(110, 170), c: pick() });
      }
    } else {
      for (i = 0; i < n; i++) {
        a = rand(0, 6.28); s = rand(.8, 3.4);
        parts.push({ k: 's', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(1.4, 3), life: 0, max: rand(26, 50), c: pick() });
      }
    }
  }
  function firework() {
    var cx = rand(W * .15, W * .85), cy = rand(H * .12, H * .42), c1 = pick(), c2 = pick(), n = 30;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 6.283, s = rand(1.6, 2.7);
      parts.push({ k: 'w', x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 2.2, life: 0, max: rand(60, 90), c: i % 2 ? c1 : c2 });
    }
  }
  function loop(now) {
    if (!running) return;
    var ms = Math.min(50, now - lastT), dt = ms / 16.67;
    lastT = now;
    ctx.clearRect(0, 0, W, H);

    var target = W < 600 ? 18 : 34;
    if (embers < target && Math.random() < .15) spawnEmber(false);

    fwT -= ms;
    if (fwT <= 0) {
      if (cur === scenes.length - 1 && modal.hidden && lightbox.hidden) firework();
      fwT = rand(1600, 3000);
    }

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i], a;
      p.life += dt;
      if (p.k === 'e') {
        p.x += (p.vx + Math.sin(p.life * .03 + p.ph) * .3) * dt; p.y += p.vy * dt;
        a = Math.sin(Math.PI * Math.min(1, p.life / p.max)) * .75;
        if (p.life > p.max || p.y < -10) { parts.splice(i, 1); embers--; continue; }
        ctx.globalAlpha = a * .18; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 6.283); ctx.fill();
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      } else if (p.k === 'f') {
        p.vy += .22 * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.life > p.max) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, (p.max - p.life) / 30); ctx.fillStyle = p.c;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      } else {
        var g = p.k === 'w' ? .035 : .06;
        p.vy += g * dt; p.vx *= .985; p.vy *= .99; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life > p.max) { parts.splice(i, 1); continue; }
        a = 1 - p.life / p.max;
        ctx.globalAlpha = a * .25; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.6, 0, 6.283); ctx.fill();
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.k === 'w' ? 1 : a + .3), 0, 6.283); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(loop);
  }
  function startFx() {
    if (reduced() || running || document.hidden) return;
    resize(); running = true;
    for (var i = 0; i < (W < 600 ? 10 : 18); i++) spawnEmber(true);
    lastT = performance.now(); raf = requestAnimationFrame(loop);
  }
  function stopFx() {
    running = false; cancelAnimationFrame(raf); parts = []; embers = 0; fwT = 1200;
    ctx.clearRect(0, 0, W, H);
  }
  window.addEventListener('resize', function () { if (running) resize(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopFx(); else startFx(); });
  (rmq.addEventListener ? rmq.addEventListener.bind(rmq, 'change') : rmq.addListener.bind(rmq))(function () {
    if (reduced()) stopFx(); else startFx();
    if (reduced()) { var s = $$('svg.arc'); s.forEach(function (a) { try { a.pauseAnimations(); } catch (e) {} }); }
  });
  startFx();
  if (reduced()) $$('svg.arc').forEach(function (a) { try { a.pauseAnimations(); } catch (e) {} });

  // percikan saat menyentuh area scene
  $('#stage').addEventListener('pointerdown', function (e) {
    if (e.target.closest('button, a, input')) return;
    burst(e.clientX, e.clientY, 'spark', 8);
  });
  // polaroid bereaksi saat disentuh
  $$('.polaroid').forEach(function (el) {
    el.addEventListener('click', function () {
      el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
      setTimeout(function () { el.classList.remove('pop'); }, 650);
      var r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 'spark', 12);
    });
  });

  /* ---------- Navigasi + transisi lingkaran ---------- */
  var nodesEl = $('#nodes'), track = $('#track'), trackLabel = $('#trackLabel');
  var prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn'), sr = $('#srStatus');
  var nodeBtns = [], curAnim = null, leavingEl = null, navEl = $('.nav');

  scenes.forEach(function (sc, i) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Ke scene ' + (i + 1) + ': ' + sc.dataset.title);
    b.addEventListener('click', function (e) { go(i, ptFrom(e)); });
    li.appendChild(b); nodesEl.appendChild(li); nodeBtns.push(b);
  });

  function ptFrom(e) {
    if (e && e.clientX !== undefined && (e.clientX || e.clientY)) return { x: e.clientX, y: e.clientY };
    var t = e && (e.currentTarget || e.target);
    if (t && t.getBoundingClientRect) { var r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    return { x: window.innerWidth / 2, y: window.innerHeight - 50 };
  }
  function finishTransition() {
    if (curAnim) { curAnim.onfinish = curAnim.oncancel = null; try { curAnim.cancel(); } catch (e) {} curAnim = null; }
    if (leavingEl) { leavingEl.classList.remove('leaving'); leavingEl = null; }
  }
  function setInert(sc, on) {
    if (on) { sc.setAttribute('inert', ''); sc.setAttribute('aria-hidden', 'true'); }
    else { sc.removeAttribute('inert'); sc.removeAttribute('aria-hidden'); }
  }
  function go(n, pt) {
    n = Math.max(0, Math.min(scenes.length - 1, n));
    if (ready && n === cur) return;
    finishTransition();
    var prev = cur; cur = n;
    var inc = scenes[n], out = scenes[prev];

    scenes.forEach(function (sc, i) { if (i !== n && i !== prev) { sc.classList.remove('active', 'leaving'); setInert(sc, true); } });
    if (ready && prev !== n) { out.classList.remove('active'); setInert(out, true); }
    inc.classList.add('active'); setInert(inc, false); inc.scrollTop = 0;
    var body = $('.invite-body', inc); if (body) body.scrollTop = 0;

    if (ready && prev !== n && !reduced() && inc.animate) {
      out.classList.add('leaving'); leavingEl = out;
      pt = pt || { x: window.innerWidth / 2, y: window.innerHeight - 50 };
      var rad = Math.hypot(Math.max(pt.x, window.innerWidth - pt.x), Math.max(pt.y, window.innerHeight - pt.y)) + 20;
      curAnim = inc.animate(
        [{ clipPath: 'circle(0px at ' + pt.x + 'px ' + pt.y + 'px)' }, { clipPath: 'circle(' + rad + 'px at ' + pt.x + 'px ' + pt.y + 'px)' }],
        { duration: 800, easing: 'cubic-bezier(.65,.05,.25,1)' }
      );
      curAnim.onfinish = curAnim.oncancel = finishTransition;
      burst(pt.x, pt.y, 'spark', 16);
    } else if (out !== inc) { out.classList.remove('leaving'); }

    nodeBtns.forEach(function (b, i) {
      b.classList.toggle('done', i < n);
      if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    track.style.setProperty('--p', n / (scenes.length - 1));
    trackLabel.textContent = (n + 1) + '/' + scenes.length + ' · ' + inc.dataset.title;
    prevBtn.disabled = n === 0;
    nextBtn.disabled = n === scenes.length - 1;
    // Scene 1 tanpa navigasi: maju hanya lewat tombol "Mulai perjalanan"
    document.body.classList.toggle('on-intro', n === 0);
    if (n === 0) navEl.setAttribute('inert', ''); else navEl.removeAttribute('inert');
    sr.textContent = 'Scene ' + (n + 1) + ' dari ' + scenes.length + ': ' + inc.dataset.title;
    if (n === scenes.length - 1) updateCountdown(true);
  }
  prevBtn.addEventListener('click', function (e) { go(cur - 1, ptFrom(e)); });
  nextBtn.addEventListener('click', function (e) { go(cur + 1, ptFrom(e)); });

  document.addEventListener('keydown', function (e) {
    if (!modal.hidden || !lightbox.hidden || cur === 0) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === 'ArrowRight') go(cur + 1, { x: window.innerWidth * .8, y: window.innerHeight - 50 });
    if (e.key === 'ArrowLeft') go(cur - 1, { x: window.innerWidth * .2, y: window.innerHeight - 50 });
  });
  var tx = null, ty = null;
  $('#stage').addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  $('#stage').addEventListener('touchend', function (e) {
    if (tx === null || cur === 0) { tx = ty = null; return; }
    var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(cur + (dx < 0 ? 1 : -1), { x: t.clientX, y: t.clientY });
    tx = ty = null;
  }, { passive: true });

  /* ---------- Musik ---------- */
  var audio = $('#bgm'), musicBtn = $('#musicBtn'), musicLabel = $('.music-label', musicBtn), audioBroken = false;
  function setMusicUI(playing) {
    musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
    musicLabel.textContent = playing ? 'Memutar' : 'Musik';
  }
  function markBroken() {
    audioBroken = true; setMusicUI(false); musicBtn.disabled = true;
    musicBtn.setAttribute('aria-label', 'Musik tidak tersedia');
    musicLabel.textContent = 'Tanpa musik';
  }
  function tryPlay() {
    if (audioBroken) return Promise.resolve(false);
    try {
      var p = audio.play();
      if (p && typeof p.then === 'function') return p.then(function () { return true; }).catch(function () { setMusicUI(false); return false; });
      return Promise.resolve(!audio.paused);
    } catch (e) { setMusicUI(false); return Promise.resolve(false); }
  }
  audio.addEventListener('playing', function () { setMusicUI(true); });
  audio.addEventListener('pause', function () { setMusicUI(false); });
  audio.addEventListener('error', markBroken);
  musicBtn.addEventListener('click', function () { if (audio.paused) tryPlay(); else audio.pause(); });
  setMusicUI(false);
  audio.preload = 'auto';
  tryPlay(); // autoplay bila diizinkan browser

  $('#startBtn').addEventListener('click', function (e) {
    if (audio.paused) tryPlay();
    var pt = ptFrom(e);
    burst(pt.x, pt.y, 'spark', 26);
    go(1, pt);
  });

  /* ---------- Toast & share ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); return ok;
  }
  function copyFallback(url) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { toast('Tautan undangan disalin'); })
        .catch(function () { toast(legacyCopy(url) ? 'Tautan undangan disalin' : 'Salin manual: ' + url); });
    } else toast(legacyCopy(url) ? 'Tautan undangan disalin' : 'Salin manual: ' + url);
  }
  $('#shareBtn').addEventListener('click', function () {
    var url = location.href.split('#')[0];
    var data = { title: CFG.SHARE.title, text: CFG.SHARE.text, url: url };
    if (navigator.share) {
      navigator.share(data).catch(function (err) { if (!err || err.name !== 'AbortError') copyFallback(url); });
    } else copyFallback(url);
  });

  /* ---------- Hitung mundur ---------- */
  function now() { return CFG.NOW_OVERRIDE ? new Date(CFG.NOW_OVERRIDE) : new Date(); }
  var cdEls = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') }, cdBox = $('#countdown'), cdDone = $('#cdDone');
  function setCd(el, v, force) {
    var t = (v < 10 ? '0' : '') + v;
    if (el.textContent !== t) {
      el.textContent = t;
      if (!force && !reduced()) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
    }
  }
  function updateCountdown(force) {
    if (!CFG.EVENT_START_ISO) { cdBox.hidden = true; return; }
    var diff = new Date(CFG.EVENT_START_ISO) - now();
    if (diff <= 0) { cdBox.hidden = true; cdDone.hidden = false; return; }
    cdBox.hidden = false; cdDone.hidden = true;
    var s = Math.floor(diff / 1000);
    setCd(cdEls.d, Math.floor(s / 86400), force);
    setCd(cdEls.h, Math.floor(s % 86400 / 3600), force);
    setCd(cdEls.m, Math.floor(s % 3600 / 60), force);
    setCd(cdEls.s, s % 60, force);
  }
  setInterval(function () { if (!document.hidden && cur === scenes.length - 1) updateCountdown(false); }, 1000);
  updateCountdown(true);

  /* ---------- Lightbox poster ---------- */
  var lastFocusLb = null;
  $('#posterBtn').addEventListener('click', function () {
    var img = $('#posterBtn img');
    if (!img) { toast('Poster resmi belum tersedia'); return; }
    lastFocusLb = document.activeElement;
    $('#lbImg').src = img.src; lightbox.hidden = false; $('#lbClose').focus();
  });
  function closeLb() { lightbox.hidden = true; if (lastFocusLb) lastFocusLb.focus(); }
  $('#lbClose').addEventListener('click', closeLb);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });

  /* ---------- RSVP ---------- */
  var form = $('#rsvpForm');
  var states = ['Form', 'Loading', 'Success', 'Error', 'Closed', 'Offline'];
  var lastFocus = null, sending = false, pending = null;

  function isClosed() { return now() > new Date(CFG.DEADLINE_ISO); }
  function show(name) { states.forEach(function (s) { $('#state' + s).hidden = (s !== name); }); }
  function openModal() {
    lastFocus = document.activeElement; modal.hidden = false;
    if (isClosed()) show('Closed'); else if (!CFG.APPS_SCRIPT_URL) show('Offline'); else show('Form');
    setTimeout(function () { (!$('#stateForm').hidden ? $('#nama') : $('.modal-close', modal)).focus(); }, 40);
  }
  function closeModal() {
    if (sending) return;
    modal.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  $('#rsvpBtn').addEventListener('click', function (e) { var pt = ptFrom(e); burst(pt.x, pt.y, 'spark', 22); openModal(); });
  $$('[data-close]', modal).forEach(function (el) { el.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!lightbox.hidden) closeLb(); else if (!modal.hidden) closeModal(); }
    if (e.key === 'Tab' && !modal.hidden) {
      var f = $$('button, input, a[href]', $('.modal-card', modal)).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function setErr(id, msg, input) {
    $('#err-' + id).textContent = msg || '';
    if (input) input.classList.toggle('invalid', !!msg);
  }
  function validate() {
    var el = form.elements;
    var nama = el.nama_lengkap.value.trim().replace(/\s+/g, ' ');
    var tahunRaw = el.tahun_terakhir_bertugas.value.trim();
    var statusEl = form.querySelector('input[name="status_kehadiran"]:checked');
    var ok = true, firstBad = null;

    if (nama.length < 2) { setErr('nama', 'Nama lengkap wajib diisi.', el.nama_lengkap); ok = false; firstBad = firstBad || el.nama_lengkap; }
    else if (nama.length > 100) { setErr('nama', 'Nama terlalu panjang (maks. 100 karakter).', el.nama_lengkap); ok = false; firstBad = firstBad || el.nama_lengkap; }
    else setErr('nama', '', el.nama_lengkap);

    var tahun = Number(tahunRaw);
    if (!tahunRaw) { setErr('tahun', 'Tahun terakhir bertugas wajib diisi.', el.tahun_terakhir_bertugas); ok = false; firstBad = firstBad || el.tahun_terakhir_bertugas; }
    else if (!/^\d{4}$/.test(tahunRaw) || tahun < CFG.YEAR_MIN || tahun > CFG.YEAR_MAX) {
      setErr('tahun', 'Masukkan tahun yang valid, ' + CFG.YEAR_MIN + '–' + CFG.YEAR_MAX + '.', el.tahun_terakhir_bertugas); ok = false; firstBad = firstBad || el.tahun_terakhir_bertugas;
    } else setErr('tahun', '', el.tahun_terakhir_bertugas);

    if (!statusEl) { setErr('status', 'Pilih salah satu status kehadiran.'); ok = false; firstBad = firstBad || form.querySelector('input[name="status_kehadiran"]'); }
    else setErr('status', '');

    if (!ok) { firstBad.focus(); return null; }
    return { nama_lengkap: nama, tahun_terakhir_bertugas: tahun, status_kehadiran: statusEl.value };
  }
  function failWith(msg) {
    if (/ditutup/i.test(msg)) { show('Closed'); return; }
    $('#errorMsg').textContent = msg; show('Error');
  }
  function send(payload) {
    if (isClosed()) { show('Closed'); return; }
    if (!CFG.APPS_SCRIPT_URL) { show('Offline'); return; }
    sending = true; pending = payload; show('Loading');
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, CFG.REQUEST_TIMEOUT_MS || 15000);
    fetch(CFG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari preflight CORS
      body: JSON.stringify(payload), signal: ctrl.signal
    })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (json) {
        if (json && json.ok === true) { // sukses HANYA bila backend mengonfirmasi
          var hadir = payload.status_kehadiran === 'HADIR';
          $('#successMsg').textContent = hadir
            ? 'Kehadiranmu sudah tercatat. Sampai jumpa di Bakar-Bakar X Alumni Meet!'
            : 'Konfirmasimu sudah tercatat. Terima kasih sudah mengabari.';
          show('Success'); form.reset(); pending = null;
          burst(window.innerWidth / 2, window.innerHeight * .5, hadir ? 'confetti' : 'spark', hadir ? 110 : 30);
        } else failWith((json && json.message) || 'Server menolak data.');
      })
      .catch(function (err) {
        failWith(err && err.name === 'AbortError' ? 'Koneksi terlalu lama. Periksa sinyal lalu coba lagi.' : 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.');
      })
      .then(function () { clearTimeout(t); sending = false; });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var d = validate(); if (d) send(d); });
  $('#retryBtn').addEventListener('click', function () { if (pending) send(pending); else show('Form'); });

  /* ---------- Mulai ---------- */
  go(0);
  ready = true;
})();
