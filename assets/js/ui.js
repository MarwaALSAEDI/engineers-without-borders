/* ============================================================
   ui.js — interactive components
     · full-screen mobile menu
     · values selector
     · products list + media panel
     · production-process horizontal track (RTL aware)
     · contact form
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isRTL = function () { return document.documentElement.getAttribute('dir') === 'rtl'; };
  var lang = function () { return document.documentElement.getAttribute('lang') || 'ar'; };

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  function initMenu() {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('menu');
    if (!burger || !menu) return;

    menu.removeAttribute('hidden');
    setClosedState(true);

    var links = menu.querySelectorAll('.menu__link');
    Array.prototype.forEach.call(links, function (link, i) {
      link.style.setProperty('--md', (60 + i * 45) + 'ms');
    });

    function setClosedState(closed) {
      menu.setAttribute('aria-hidden', closed ? 'true' : 'false');
      if ('inert' in menu) menu.inert = closed;
    }

    function open() {
      document.body.classList.add('menu-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', lang() === 'ar' ? 'إغلاق القائمة' : 'Close menu');
      setClosedState(false);
    }

    function close() {
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', lang() === 'ar' ? 'فتح القائمة' : 'Open menu');
      setClosedState(true);
    }

    burger.addEventListener('click', function () {
      document.body.classList.contains('menu-open') ? close() : open();
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('.menu__link')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        close();
        burger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1100 && document.body.classList.contains('menu-open')) close();
    });
  }

  /* ============================================================
     VALUES
     ============================================================ */
  function initValues() {
    var list = document.getElementById('valuesList');
    var panel = document.getElementById('valuesPanel');
    if (!list || !panel) return;

    var elN = document.getElementById('valuePanelN');
    var elT = document.getElementById('valuePanelT');
    var elD = document.getElementById('valuePanelD');
    var buttons = Array.prototype.slice.call(list.querySelectorAll('.value'));
    var activeIndex = 0;
    var swapTimer = null;

    function render(btn, index, animate) {
      var l = lang();
      var write = function () {
        elN.textContent = String(index + 1).padStart(2, '0');
        elT.textContent = btn.dataset['t' + (l === 'ar' ? 'Ar' : 'En')] || '';
        elD.textContent = btn.dataset['d' + (l === 'ar' ? 'Ar' : 'En')] || '';
        /* the panel copy is swapped in as plain text, so tag its language */
        elT.setAttribute('lang', l);
        elD.setAttribute('lang', l);
        panel.style.setProperty('--vx', (index % 3) * 34 + 'px');
        panel.style.setProperty('--vy', Math.floor(index / 3) * 46 + 'px');
      };

      if (!animate || reduced.matches) { write(); return; }

      panel.classList.add('is-swapping');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(function () {
        write();
        panel.classList.remove('is-swapping');
      }, 200);
    }

    function select(index, animate) {
      if (index < 0 || index >= buttons.length) return;
      activeIndex = index;
      buttons.forEach(function (b, i) {
        var on = i === index;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      render(buttons[index], index, animate);
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { select(i, true); });
      btn.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover)').matches) select(i, true);
      });
      btn.addEventListener('focus', function () { select(i, true); });
    });

    list.addEventListener('keydown', function (e) {
      var step = 0;
      if (e.key === 'ArrowDown') step = 1;
      else if (e.key === 'ArrowUp') step = -1;
      else if (e.key === 'ArrowRight') step = isRTL() ? -1 : 1;
      else if (e.key === 'ArrowLeft') step = isRTL() ? 1 : -1;
      else return;
      e.preventDefault();
      var next = (activeIndex + step + buttons.length) % buttons.length;
      buttons[next].focus();
    });

    select(0, false);
    document.addEventListener('ewb:langchange', function () { render(buttons[activeIndex], activeIndex, false); });
  }

  /* ============================================================
     PRODUCTS
     ============================================================ */
  function initProducts() {
    var list = document.getElementById('plist');
    var media = document.getElementById('pmedia');
    if (!list || !media) return;

    var items = Array.prototype.slice.call(list.querySelectorAll('.pitem'));
    var slides = Array.prototype.slice.call(media.querySelectorAll('.pmedia__slide'));

    function select(index) {
      items.forEach(function (it, i) { it.classList.toggle('is-active', i === index); });
      var key = items[index].dataset.media;
      slides.forEach(function (s) { s.classList.toggle('is-on', s.dataset.key === key); });
    }

    items.forEach(function (item, i) {
      item.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover)').matches) select(i);
      });
      item.addEventListener('focus', function () { select(i); });
      item.addEventListener('click', function () { select(i); });
    });

    select(0);
  }

  /* ============================================================
     PROCESS TRACK — native horizontal scrolling, no scroll-jacking
     ============================================================ */
  function initTrack() {
    var track = document.getElementById('track');
    var prev = document.getElementById('trackPrev');
    var next = document.getElementById('trackNext');
    var bar = document.getElementById('trackBar');
    if (!track) return;

    /* Browsers report scrollLeft differently under RTL; normalise to
       0 .. max where 0 always means "at the first card". */
    function progress() {
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return { value: 0, max: 0 };
      return { value: Math.min(max, Math.abs(track.scrollLeft)), max: max };
    }

    function step() {
      var card = track.querySelector('.step');
      var gap = parseFloat(getComputedStyle(track).columnGap || '16') || 16;
      return (card ? card.getBoundingClientRect().width : 280) + gap;
    }

    function move(direction) {
      var delta = step() * direction * (isRTL() ? -1 : 1);
      track.scrollBy({ left: delta, behavior: reduced.matches ? 'auto' : 'smooth' });
    }

    function sync() {
      var p = progress();
      if (bar) {
        var ratio = p.max ? p.value / p.max : 0;
        var visible = p.max ? track.clientWidth / track.scrollWidth : 1;
        bar.style.inlineSize = Math.max(10, visible * 100).toFixed(1) + '%';
        bar.style.transform = 'translateX(' + (isRTL() ? '-' : '') +
          (ratio * (100 / Math.max(visible, 0.0001) - 100)).toFixed(2) + '%)';
      }
      if (prev) prev.disabled = p.value <= 2;
      if (next) next.disabled = p.value >= p.max - 2;
    }

    if (prev) prev.addEventListener('click', function () { move(-1); });
    if (next) next.addEventListener('click', function () { move(1); });

    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(sync);
    }, { passive: true });

    window.addEventListener('resize', sync, { passive: true });
    document.addEventListener('ewb:langchange', function () {
      track.scrollTo({ left: 0, behavior: 'auto' });
      window.requestAnimationFrame(sync);
    });

    sync();
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  function initForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var status = document.getElementById('formStatus');
    var EMAIL = 'engineersw.b@yahoo.com';

    function fieldOf(input) { return input.closest('.field'); }

    function validate(input) {
      var ok = true;
      if (input.hasAttribute('required') && !input.value.trim()) ok = false;
      if (ok && input.type === 'email' && input.value.trim()) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      }
      var wrap = fieldOf(input);
      if (wrap) wrap.classList.toggle('is-invalid', !ok);
      return ok;
    }

    Array.prototype.forEach.call(form.querySelectorAll('input, textarea'), function (input) {
      input.addEventListener('blur', function () {
        if (input.value.trim() || input.hasAttribute('required')) validate(input);
      });
      input.addEventListener('input', function () {
        var wrap = fieldOf(input);
        if (wrap && wrap.classList.contains('is-invalid')) validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));
      var valid = required.map(validate).every(Boolean);

      if (!valid) {
        status.textContent = lang() === 'ar'
          ? 'الرجاء إكمال الحقول المطلوبة.'
          : 'Please complete the required fields.';
        var firstBad = form.querySelector('.field.is-invalid input, .field.is-invalid textarea');
        if (firstBad) firstBad.focus();
        return;
      }

      var data = new FormData(form);
      var ar = lang() === 'ar';

      var subject = ar
        ? 'طلب عرض سعر — ' + (data.get('name') || '')
        : 'Enquiry — ' + (data.get('name') || '');

      var lines = ar
        ? ['الاسم: ' + (data.get('name') || ''),
           'البريد الإلكتروني: ' + (data.get('email') || ''),
           'الهاتف: ' + (data.get('phone') || '—'),
           'الجهة / الشركة: ' + (data.get('company') || '—'),
           '',
           'الرسالة:',
           data.get('message') || '']
        : ['Name: ' + (data.get('name') || ''),
           'Email: ' + (data.get('email') || ''),
           'Phone: ' + (data.get('phone') || '—'),
           'Company: ' + (data.get('company') || '—'),
           '',
           'Message:',
           data.get('message') || ''];

      var href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = href;

      status.textContent = ar
        ? 'تم فتح برنامج البريد لديك. إن لم يفتح، راسلنا مباشرة على ' + EMAIL
        : 'Your email client should now be open. If it did not, write to us directly at ' + EMAIL;
    });
  }

  /* ============================================================
     boot
     ============================================================ */
  function init() {
    initMenu();
    initValues();
    initProducts();
    initTrack();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
