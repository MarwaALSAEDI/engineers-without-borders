/* ============================================================
   i18n.js — bilingual (AR / EN) controller

   Both languages ship in the markup as sibling [lang] elements;
   CSS decides which one is visible. This module only has to flip
   <html lang>/<html dir>, localise attributes that CSS cannot
   reach (alt, placeholder, aria-label), swap the document meta,
   and remember the choice.
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'ewb-lang';
  var DEFAULT_LANG = 'ar';

  /* attribute suffix -> real attribute name */
  var ATTRS = {
    alt: 'alt',
    placeholder: 'placeholder',
    label: 'aria-label',
    title: 'title'
  };

  /* direction and locale are fixed; the title and description are
     per-page and come from the #page-meta block the build writes */
  var DIR = { ar: 'rtl', en: 'ltr' };
  var LOCALE = { ar: 'ar_IQ', en: 'en_US' };

  var PAGE = readPageMeta();

  function readPageMeta() {
    var el = document.getElementById('page-meta');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }

  var root = document.documentElement;
  var current = DEFAULT_LANG;

  /* ---------- storage helpers (private mode safe) ---------- */
  function read() {
    try { return window.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { window.localStorage.setItem(STORE_KEY, v); } catch (e) { /* ignore */ }
  }

  /* ---------- one-time capture of the Arabic attribute values ---------- */
  function captureAttributes() {
    Object.keys(ATTRS).forEach(function (key) {
      var real = ATTRS[key];
      var nodes = document.querySelectorAll('[data-en-' + key + ']');
      Array.prototype.forEach.call(nodes, function (el) {
        if (!el.hasAttribute('data-ar-' + key)) {
          el.setAttribute('data-ar-' + key, el.getAttribute(real) || '');
        }
      });
    });
  }

  function applyAttributes(lang) {
    Object.keys(ATTRS).forEach(function (key) {
      var real = ATTRS[key];
      var nodes = document.querySelectorAll('[data-' + lang + '-' + key + ']');
      Array.prototype.forEach.call(nodes, function (el) {
        var value = el.getAttribute('data-' + lang + '-' + key);
        if (value) el.setAttribute(real, value);
      });
    });
  }

  function applyMeta(lang) {
    setMeta('property', 'og:locale', LOCALE[lang]);
    if (!PAGE || !PAGE[lang]) return;
    document.title = PAGE[lang].title;
    setMeta('name', 'description', PAGE[lang].desc);
    setMeta('property', 'og:title', PAGE[lang].title);
    setMeta('property', 'og:description', PAGE[lang].desc);
  }

  function setMeta(attr, name, content) {
    var el = document.head.querySelector('meta[' + attr + '="' + name + '"]');
    if (el) el.setAttribute('content', content);
  }

  function syncSwitches(lang) {
    var btns = document.querySelectorAll('.langswitch__btn');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });
  }

  /* ---------- keep the reader roughly where they were ---------- */
  function anchorBefore() {
    var sections = document.querySelectorAll('main > section, footer');
    var probe = 140;
    var chosen = null;
    for (var i = 0; i < sections.length; i++) {
      var box = sections[i].getBoundingClientRect();
      if (box.bottom > probe) { chosen = sections[i]; break; }
    }
    if (!chosen) return null;
    return { el: chosen, offset: chosen.getBoundingClientRect().top };
  }

  function anchorAfter(anchor) {
    if (!anchor) return;
    var delta = anchor.el.getBoundingClientRect().top - anchor.offset;
    if (Math.abs(delta) > 1) window.scrollBy(0, delta);
  }

  /* ---------- main ---------- */
  function set(lang, opts) {
    if (lang !== 'ar' && lang !== 'en') lang = DEFAULT_LANG;
    var keepPlace = !opts || opts.keepPlace !== false;
    var anchor = keepPlace ? anchorBefore() : null;

    current = lang;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', DIR[lang]);

    applyAttributes(lang);
    applyMeta(lang);
    syncSwitches(lang);
    write(lang);

    if (anchor) anchorAfter(anchor);

    document.dispatchEvent(new CustomEvent('ewb:langchange', { detail: { lang: lang, dir: DIR[lang] } }));
  }

  function get() { return current; }

  function init() {
    captureAttributes();

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('lang') || read() || DEFAULT_LANG;
    set(initial, { keepPlace: false });

    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.langswitch__btn') : null;
      if (!btn) return;
      e.preventDefault();
      if (btn.dataset.lang !== current) set(btn.dataset.lang);
    });
  }

  window.EWB = window.EWB || {};
  window.EWB.i18n = { get: get, set: set };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
