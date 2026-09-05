/* ============================================================
   motion.js — scroll reveals, number counters, hero transition,
   sticky navigation state and active-section tracking.

   Built on IntersectionObserver + a single rAF scroll loop, so
   there is no animation library to download and nothing expensive
   running between frames.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ============================================================
     1. REVEAL ON ENTER
     ============================================================ */
  function initReveals() {
    var targets = document.querySelectorAll('[data-reveal], [data-reveal-lines], [data-reveal-mask]');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window) || reduced.matches) {
      Array.prototype.forEach.call(targets, function (el) {
        el.classList.add('is-in');
        runCounters(el);
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        runCounters(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ============================================================
     2. NUMBER COUNTERS
     ============================================================ */
  function runCounters(scope) {
    var nodes = scope.querySelectorAll ? scope.querySelectorAll('[data-count]') : [];
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      countTo(el, parseFloat(el.dataset.count), el.dataset.sep === '1');
    });
  }

  function countTo(el, target, separated) {
    if (!isFinite(target)) return;
    if (reduced.matches) { el.textContent = format(target, separated); return; }

    var duration = 1500;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(Math.round(target * eased), separated);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function format(n, separated) {
    return separated ? n.toLocaleString('en-US') : String(n);
  }

  /* ============================================================
     3. NAVIGATION
     The active link is marked server-side with aria-current="page",
     so nothing needs to be tracked while scrolling.
     ============================================================ */
  function initNav() {
    return document.getElementById('nav');
  }

  /* ============================================================
     4. HERO SCROLL TRANSITION + sticky nav (single rAF loop)
     ============================================================ */
  function initScrollLoop(nav) {
    var hero = document.querySelector('.hero');
    var inner = hero ? hero.querySelector('.hero__inner') : null;
    var overlay = hero ? hero.querySelector('.hero__overlay') : null;
    var ticking = false;
    var lastStuck = null;

    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;

      /* sticky navigation */
      if (nav) {
        var stuck = y > 40;
        if (stuck !== lastStuck) {
          nav.classList.toggle('is-stuck', stuck);
          lastStuck = stuck;
        }
      }

      /* cinematic hero hand-off */
      if (hero && !reduced.matches) {
        var h = hero.offsetHeight || 1;
        var p = Math.min(1, Math.max(0, y / h));
        hero.style.setProperty('--hero-scale', (1.06 + p * 0.1).toFixed(4));
        hero.style.setProperty('--hero-y', (p * 60).toFixed(2) + 'px');
        if (inner) inner.style.setProperty('--hero-ty', (p * -70).toFixed(2) + 'px');
        if (overlay) overlay.style.opacity = (1 + p * 0.25).toFixed(3);
        if (inner) inner.style.opacity = (1 - p * 0.85).toFixed(3);
      }
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ============================================================
     boot
     ============================================================ */
  function init() {
    initReveals();
    var nav = initNav();
    initScrollLoop(nav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
