/* ============================================================
   build.js — static site generator for مهندسون بلا حدود
   ============================================================

   The shared shell (head, navigation, full-screen menu, call to
   action, footer) lives once in src/partials/. Each page's own
   content lives in src/pages/<slug>.head.html + <slug>.body.html.
   This script stitches them together and writes plain static
   HTML files to the site root.

   Run:  node build.js

   The generated .html files need no server and no runtime — deploy
   them as they are. Edit src/, never the generated files.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const P = (...a) => path.join(SRC, ...a);
const read = f => fs.readFileSync(f, 'utf8');

/* ============================================================
   PAGES — order defines the previous / next chain
   ============================================================ */
const PAGES = [
  {
    slug: 'index',
    nav: 'index',
    crumbAr: 'الرئيسية', crumbEn: 'Home',
    titleAr: 'مهندسون بلا حدود | معمل الأبواب والشبابيك المصبوبة من الألمنيوم — بغداد',
    titleEn: 'Engineers Without Borders | Cast-Aluminium Doors, Gates & Windows — Baghdad',
    descAr: 'مهندسون بلا حدود — معمل عراقي في بغداد / جرف النداف متخصص بصناعة الأبواب والبوابات والشبابيك المصبوبة من الألمنيوم: صهر وصبّ وتشكيل CNC وطلاء داخل المعمل، بطاقة إنتاجية 250 طناً سنوياً.',
    descEn: 'Engineers Without Borders is an Iraqi plant in Jurf Al-Naddaf, Baghdad, specialised in cast-aluminium doors, gates and windows — melting, casting, CNC machining and coating in-house, at 250 tonnes per year.',
    og: 'assets/img/gate-ornamental.jpg',
    custom: true
  },
  {
    slug: 'about', nav: 'about', idx: '01',
    crumbAr: 'من نحن', crumbEn: 'About',
    titleAr: 'من نحن | مهندسون بلا حدود',
    titleEn: 'About | Engineers Without Borders',
    descAr: 'معملٌ عراقي متخصص في إنتاج المنتجات المعدنية الهندسية، وفي مقدمتها الأبواب والبوابات والشبابيك المصنوعة من الألمنيوم المصبوب — بغداد / جرف النداف.',
    descEn: 'An Iraqi manufacturing plant specialised in engineered metal products — principally cast-aluminium doors, gates and windows, in Jurf Al-Naddaf, Baghdad.',
    sectionClass: 'section grid-tex',
    media: {
      src: 'plant-halls', w: 1200, h: 829,
      srcset: 'assets/img/plant-halls-sm.jpg 800w, assets/img/plant-halls.jpg 1200w',
      altAr: 'جملونات الإنتاج والخزن في معمل مهندسون بلا حدود بمنطقة جرف النداف',
      altEn: 'Production and storage halls at the Engineers Without Borders plant in Jurf Al-Naddaf'
    },
    /* this page carries its own editorial opener instead of a .sec-head */
    headAr: 'لا نُجمّع الألمنيوم…<br>نصهره ونصبّه داخل المعمل.',
    headEn: 'We do not assemble aluminium —<br>we melt and cast it in-house.',
    leadAr: '«مهندسون بلا حدود» معملٌ عراقي متخصص في إنتاج المنتجات المعدنية الهندسية، وفي مقدمتها الأبواب والبوابات والشبابيك المصنوعة من مادة الألمنيوم المصبوب.',
    leadEn: 'Engineers Without Borders is an Iraqi manufacturing plant specialised in engineered metal products — principally cast-aluminium doors, gates and windows.',
    idxAr: 'من نحن', idxEn: 'Company Overview'
  },
  {
    slug: 'vision', nav: 'vision', idx: '02',
    crumbAr: 'الرؤية والرسالة', crumbEn: 'Vision & Mission',
    titleAr: 'الرؤية والرسالة | مهندسون بلا حدود',
    titleEn: 'Vision & Mission | Engineers Without Borders',
    descAr: 'أن نكون المرجع الأول في العراق لصناعة الأبواب والشبابيك المصبوبة من الألمنيوم — الرؤية والرسالة والأهداف.',
    descEn: 'To be Iraq’s foremost reference in cast-aluminium doors and windows — our vision, mission and objectives.',
    sectionClass: 'section on-dark grid-tex'
  },
  {
    slug: 'values', nav: 'values', idx: '03',
    crumbAr: 'القيم', crumbEn: 'Values',
    titleAr: 'القيم | مهندسون بلا حدود',
    titleEn: 'Values | Engineers Without Borders',
    descAr: 'ستّ قيم تحكم كل قطعة تخرج من المعمل: الجودة، الدقة، المرونة، الالتزام، المسؤولية، الوطنية.',
    descEn: 'Six values govern every piece that leaves the plant: quality, precision, flexibility, commitment, responsibility and national commitment.',
    sectionClass: 'section'
  },
  {
    slug: 'products', nav: 'products', idx: '04',
    crumbAr: 'منتجاتنا', crumbEn: 'Products',
    titleAr: 'منتجاتنا | بوابات وأبواب وشبابيك ألمنيوم مصبوب',
    titleEn: 'Products | Cast-Aluminium Gates, Doors & Windows',
    descAr: 'بوابات خارجية بمصراعين، أبواب مداخل، شبابيك وحمايات، ألواح وحواجز زخرفية، أعمدة وأثاث معدني مصبوب — تُنفَّذ بتصاميم خاصة حسب الطلب.',
    descEn: 'Two-leaf external gates, entrance doors, cast windows and guards, decorative panels and screens, ornamental columns and cast metal furniture — all made to order.',
    sectionClass: 'section on-dark',
    media: {
      src: 'gate-ornamental', w: 1200, h: 1098,
      srcset: 'assets/img/gate-ornamental-sm.jpg 800w, assets/img/gate-ornamental.jpg 1200w',
      altAr: 'بوابة خارجية مصبوبة بمصراعين من الألمنيوم بزخارف بارزة',
      altEn: 'A two-leaf cast-aluminium gate with raised ornamental relief'
    }
  },
  {
    slug: 'process', nav: 'process', idx: '05',
    crumbAr: 'العملية الإنتاجية', crumbEn: 'Process',
    titleAr: 'مسار العملية الإنتاجية | مهندسون بلا حدود',
    titleEn: 'Production Process | Engineers Without Borders',
    descAr: 'أربع عشرة مرحلة من الخردة إلى منتَج مطليّ جاهز للتسليم: صهر، صبّ، تشكيل CNC، تجميع، طلاء.',
    descEn: 'Fourteen stages from scrap to a coated product ready for delivery: melting, casting, CNC machining, assembly and coating.',
    sectionClass: 'section',
    media: {
      src: 'production-hall', w: 624, h: 832,
      altAr: 'قاعة الإنتاج وخط توزيع القوالب داخل المعمل',
      altEn: 'The production hall and mould distribution line inside the plant'
    }
  },
  {
    slug: 'machinery', nav: 'machinery', idx: '06',
    crumbAr: 'المكائن والمعدات', crumbEn: 'Machinery',
    titleAr: 'المكائن والمعدات | مهندسون بلا حدود',
    titleEn: 'Machinery & Equipment | Engineers Without Borders',
    descAr: 'منظومة مكائن إنتاجية متكاملة: فرن صهر الألمنيوم، ماكنة CNC لحفر القوالب، خط توزيع القوالب، وخطوط CNC مستهدفة في خطة التطوير.',
    descEn: 'An integrated machinery system: aluminium melting furnace, CNC mould-carving machine, mould distribution line, and the CNC lines planned under the development plan.',
    sectionClass: 'section on-dark grid-tex'
  },
  {
    slug: 'facility', nav: 'facility', idx: '07',
    crumbAr: 'المنشأة', crumbEn: 'Facility',
    titleAr: 'المنشأة والبنى التحتية | مهندسون بلا حدود',
    titleEn: 'Facility & Infrastructure | Engineers Without Borders',
    descAr: 'سبعة دونمات في منطقة صناعية مخدومة بجرف النداف، و1,350 م² جملونات إنتاج وخزن قائمة ببنى تحتية كاملة.',
    descEn: 'Seven dunams in a serviced industrial zone in Jurf Al-Naddaf, with 1,350 m² of operating production and storage halls and full utilities.',
    sectionClass: 'section',
    media: {
      src: 'plant-halls', w: 1200, h: 829,
      srcset: 'assets/img/plant-halls-sm.jpg 800w, assets/img/plant-halls.jpg 1200w',
      altAr: 'جملونات المعمل من الخارج — هياكل حديدية Truss',
      altEn: 'The plant halls seen from outside — steel truss structures'
    }
  },
  {
    slug: 'markets', nav: 'markets', idx: '08',
    crumbAr: 'الأسواق والعملاء', crumbEn: 'Markets & Clients',
    titleAr: 'الأسواق والعملاء | مهندسون بلا حدود',
    titleEn: 'Markets & Clients | Engineers Without Borders',
    descAr: 'السوق المحلي في بغداد وباقي المحافظات: طلب كبير ومنتظم على مدار السنة، منافسة متوسطة، وسعر أقل بكثير من المستورد.',
    descEn: 'The local market in Baghdad and the other governorates: large, year-round demand, moderate competition, and pricing significantly below imports.',
    sectionClass: 'section on-dark'
  },
  {
    slug: 'quality', nav: 'quality', idx: '09',
    crumbAr: 'الجودة والسلامة والبيئة', crumbEn: 'Quality, Safety & Environment',
    titleAr: 'الجودة والسلامة والبيئة | مهندسون بلا حدود',
    titleEn: 'Quality, Safety & Environment | Engineers Without Borders',
    descAr: 'ضبط الجودة على السبيكة والتشطيب، إجراءات السلامة المهنية، ودورة إنتاج شبه مغلقة تُعيد مخلفات الألمنيوم إلى الفرن.',
    descEn: 'Alloy and finish quality control, occupational safety measures, and a near-closed production loop returning aluminium waste to the furnace.',
    sectionClass: 'section'
  },
  {
    slug: 'development', nav: 'development', idx: '10',
    crumbAr: 'خطة التطوير', crumbEn: 'Development Plan',
    titleAr: 'خطة التطوير | مهندسون بلا حدود',
    titleEn: 'Development Plan | Engineers Without Borders',
    descAr: 'مضاعفة الطاقة الإنتاجية من 250 إلى 500 طن سنوياً، و1,350 م² جملونات جديدة، على مدى 15 شهراً، لتبدأ الطاقة الكاملة من 2027.',
    descEn: 'Doubling capacity from 250 to 500 tonnes per year and adding 1,350 m² of new halls over 15 months, reaching full capacity from 2027.',
    sectionClass: 'section on-dark grid-tex'
  },
  {
    slug: 'leadership', nav: 'leadership', idx: '11',
    crumbAr: 'الإدارة', crumbEn: 'Leadership',
    titleAr: 'صاحب المشروع والإدارة | مهندسون بلا حدود',
    titleEn: 'Ownership & Leadership | Engineers Without Borders',
    descAr: 'يُدار المعمل من قِبل صاحبه ومؤسسه، مهندس التصنيع المؤتمت حسين فتيخان منسي، بهيكل وظيفي متكامل يضم 32 موظفاً وعاملاً.',
    descEn: 'The plant is run by its owner and founder, automated-manufacturing engineer Hussein Futaikhan Mansi, with an integrated structure of 32 staff and workers.',
    sectionClass: 'section'
  },
  {
    slug: 'contact', nav: 'contact', idx: '12',
    crumbAr: 'تواصل معنا', crumbEn: 'Contact',
    titleAr: 'تواصل معنا | مهندسون بلا حدود',
    titleEn: 'Contact | Engineers Without Borders',
    descAr: 'بغداد — شارع فلسطين (الإدارة)، جرف النداف / قضاء المدائن (المعمل). هاتف 0771 477 0178 — engineersw.b@yahoo.com',
    descEn: 'Baghdad — Palestine Street (office), Jurf Al-Naddaf / Al-Mada’in (plant). Phone 0771 477 0178 — engineersw.b@yahoo.com',
    sectionClass: 'section on-dark',
    noCta: true,
    media: {
      src: 'gate-columns', w: 641, h: 854,
      altAr: 'باب مدخل مصبوب مع أعمدة زخرفية من إنتاج المعمل',
      altEn: 'Cast entrance door with ornamental columns produced by the plant'
    }
  }
];

/* ============================================================
   HELPERS
   ============================================================ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bi = (ar, en) => `<span lang="ar">${ar}</span><span lang="en">${en}</span>`;

/* pull one balanced element out of a fragment */
function sliceTag(str, startIdx, tag) {
  const openRe = new RegExp('<' + tag + '\\b', 'g');
  const closeRe = new RegExp('</' + tag + '>', 'g');
  let depth = 0, i = startIdx;
  while (i < str.length) {
    openRe.lastIndex = i; closeRe.lastIndex = i;
    const o = openRe.exec(str), c = closeRe.exec(str);
    if (!c) break;
    if (o && o.index < c.index) { depth++; i = o.index + 1; }
    else { depth--; i = c.index + 1; if (depth === 0) return { html: str.slice(startIdx, c.index + tag.length + 3), end: c.index + tag.length + 3 }; }
  }
  return null;
}

function inner(fragment, openTagRe, tag) {
  const m = openTagRe.exec(fragment);
  if (!m) return null;
  const s = sliceTag(fragment, m.index, tag);
  if (!s) return null;
  return { text: s.html.slice(m[0].length, -(tag.length + 3)).trim(), whole: s.html };
}

/* ============================================================
   PAGE HEADER — built from the old .sec-head, or from config
   ============================================================ */
function buildHeader(page, headHtml) {
  let idxInner, titleInner, leadInner, extra = '';

  if (headHtml && headHtml.trim()) {
    const idxEl = inner(headHtml, /<span class="sec-index"[^>]*>/, 'span');
    const h2El = inner(headHtml, /<h2[^>]*>/, 'h2');
    const leadEl = inner(headHtml, /<p class="lead"[^>]*>/, 'p');
    idxInner = idxEl ? idxEl.text : '';
    titleInner = h2El ? h2El.text : '';
    leadInner = leadEl ? leadEl.text : '';

    /* the process page keeps its track controls next to the track itself */
    const ctl = inner(headHtml, /<div class="track-ctl"[^>]*>/, 'div');
    if (ctl) extra = ctl.whole;
  } else {
    idxInner = `${page.idx} / ` + bi(page.idxAr, page.idxEn);
    titleInner = bi(page.headAr, page.headEn);
    leadInner = bi(page.leadAr, page.leadEn);
  }

  const m = page.media;
  const media = m ? `
  <div class="phead__media">
    <img src="assets/img/${m.src}.jpg"${m.srcset ? `
         srcset="${m.srcset}" sizes="100vw"` : ''}
         width="${m.w}" height="${m.h}" fetchpriority="high" decoding="async"
         alt="${esc(m.altAr)}" data-en-alt="${esc(m.altEn)}">
  </div>` : '';

  return {
    html: `<header class="phead${m ? ' phead--media' : ''}${page.sectionClass && page.sectionClass.includes('on-dark') && !m ? ' on-dark' : ''}">${media}
  <div class="wrap">
    <nav class="crumbs" aria-label="مسار التصفح" data-en-label="Breadcrumb">
      <a href="index.html">${bi('الرئيسية', 'Home')}</a>
      <span class="crumbs__sep" aria-hidden="true">/</span>
      <span class="crumbs__here">${bi(page.crumbAr, page.crumbEn)}</span>
    </nav>
    <span class="phead__idx" data-reveal>${idxInner}</span>
    <h1 class="phead__title" data-reveal style="--rd:70ms">${titleInner}</h1>
    <p class="phead__lead" data-reveal style="--rd:140ms">${leadInner}</p>
  </div>
</header>`,
    extra
  };
}

/* ============================================================
   PREVIOUS / NEXT
   ============================================================ */
function buildPageNav(i) {
  const prev = i > 0 ? PAGES[i - 1] : null;
  const next = i < PAGES.length - 1 ? PAGES[i + 1] : null;
  const cell = (p, dir) => p ? `
    <a class="pagenav__link pagenav__link--${dir}" href="${p.slug}.html" rel="${dir === 'prev' ? 'prev' : 'next'}">
      <span class="pagenav__dir">${dir === 'prev' ? bi('السابق', 'Previous') : bi('التالي', 'Next')}</span>
      <span class="pagenav__t">${bi(p.crumbAr, p.crumbEn)}</span>
      <svg class="pagenav__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>` : '<span class="pagenav__link pagenav__link--empty" aria-hidden="true"></span>';

  return `<nav class="pagenav" aria-label="تصفح الصفحات" data-en-label="Page navigation">
  <div class="wrap pagenav__inner">${cell(prev, 'prev')}${cell(next, 'next')}
  </div>
</nav>`;
}

/* ============================================================
   ASSEMBLE
   ============================================================ */
const partials = {
  nav: read(P('partials', 'nav.html')),
  menu: read(P('partials', 'menu.html')),
  footer: read(P('partials', 'footer.html')),
  cta: read(P('partials', 'cta.html'))
};

function head(page) {
  const canonical = page.slug === 'index' ? './' : page.slug + '.html';
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0A0D11">

<!-- Apply the reader's stored language before first paint, so moving
     between pages never flashes the other language. -->
<script>
(function(){try{var q=new URLSearchParams(location.search).get('lang'),
s=q||localStorage.getItem('ewb-lang');if(s==='en'){var d=document.documentElement;
d.lang='en';d.dir='ltr';}}catch(e){}})();
</script>

<title>${esc(page.titleAr)}</title>
<meta name="description" content="${esc(page.descAr)}">

<script type="application/json" id="page-meta">
{"ar":{"title":${JSON.stringify(page.titleAr)},"desc":${JSON.stringify(page.descAr)}},
 "en":{"title":${JSON.stringify(page.titleEn)},"desc":${JSON.stringify(page.descEn)}}}
</script>

<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}${page.slug === 'index' ? '' : ''}?lang=en">
<link rel="alternate" hreflang="x-default" href="${canonical}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="مهندسون بلا حدود — Engineers Without Borders">
<meta property="og:locale" content="ar_IQ">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:title" content="${esc(page.titleAr)}">
<meta property="og:description" content="${esc(page.descAr)}">
<meta property="og:image" content="${page.og || (page.media ? 'assets/img/' + page.media.src + '.jpg' : 'assets/img/gate-ornamental.jpg')}">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="assets/img/logo-256.png" type="image/png">
<link rel="apple-touch-icon" href="assets/img/logo-256.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${page.media || page.slug === 'index' ? `
<link rel="preload" as="image" href="assets/img/${page.slug === 'index' ? 'gate-ornamental' : page.media.src}.jpg"${(page.slug === 'index' || page.media.srcset) ? `
      imagesrcset="${page.slug === 'index' ? 'assets/img/gate-ornamental-sm.jpg 800w, assets/img/gate-ornamental.jpg 1200w' : page.media.srcset}"
      imagesizes="100vw"` : ''} fetchpriority="high">` : ''}
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/layout.css">
<link rel="stylesheet" href="assets/css/sections.css">
${read(P('partials', 'schema.html')).trim()}
</head>

<body class="page page--${page.slug}">

<a class="skip" href="#main">${bi('تخطَّ إلى المحتوى', 'Skip to content')}</a>
`;
}

function markActive(navHtml, slug) {
  return navHtml.replace(
    new RegExp('(<a class="nav__link"[^>]*href=")' + slug + '\\.html(")', 'g'),
    '$1' + slug + '.html$2 aria-current="page"'
  ).replace(
    new RegExp('(<a class="menu__link" href=")' + slug + '\\.html(")', 'g'),
    '$1' + slug + '.html$2 aria-current="page"'
  ).replace(
    /(<a class="btn nav__cta" href="contact\.html")/,
    slug === 'contact' ? '$1 aria-current="page"' : '$1'
  );
}

function buildPage(page, i) {
  let body;

  if (page.custom) {
    body = read(P('pages', page.slug + '.body.html'))
      .replace('{{HERO}}', read(P('partials', 'hero.html')).trim())
      .replace('{{FACTS}}', read(P('partials', 'facts.html')).trim())
      .replace('{{CTA}}', partials.cta.trim());
  } else {
    const headFrag = read(P('pages', page.slug + '.head.html'));
    const bodyFrag = read(P('pages', page.slug + '.body.html'));
    const hdr = buildHeader(page, headFrag);

    let content = bodyFrag;
    if (hdr.extra) {
      /* re-insert the track controls just above the track */
      content = content.replace(
        /(<div class="track" id="track")/,
        `<div class="wrap"><div class="track-ctl-row">${hdr.extra}</div></div>\n\n  $1`
      );
    }

    body = `${hdr.html}

<section class="${page.sectionClass}">
  ${content.trim()}
</section>

${buildPageNav(i)}
${page.noCta ? '' : '\n' + partials.cta.trim() + '\n'}`;
  }

  const out = head(page) +
    markActive(partials.nav, page.slug).trim() + '\n\n' +
    markActive(partials.menu, page.slug).trim() + '\n\n' +
    '<main id="main">\n\n' + body.trim() + '\n\n</main>\n\n' +
    partials.footer.trim() + '\n\n' +
    `<script src="assets/js/i18n.js" defer></script>
<script src="assets/js/motion.js" defer></script>
<script src="assets/js/ui.js" defer></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, page.slug + '.html'), out);
  return page.slug + '.html  ' + Math.round(out.length / 1024) + 'KB';
}

/* ============================================================
   RUN
   ============================================================ */
const results = PAGES.map(buildPage);

/* sitemap for the whole set */
fs.writeFileSync(path.join(ROOT, 'sitemap.txt'),
  PAGES.map(p => (p.slug === 'index' ? 'index.html' : p.slug + '.html')).join('\n') + '\n');

console.log('built ' + results.length + ' pages:\n  ' + results.join('\n  '));
