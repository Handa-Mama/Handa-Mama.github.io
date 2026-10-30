/*
 * හඳ මාමා කතන්දර — the app: bookshelf, book reader, settings, offline
 */
(function () {
  'use strict';

  const BOOKS = window.HM_STORIES || [];
  const S = window.HM_SCENES;
  const sound = window.HM_SOUND;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const html = document.documentElement;

  /* ---------- storage (always safe: private mode / blocked storage just means nothing is remembered) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('hm:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('hm:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  const settings = Object.assign({ text: 'm', night: 'auto', sound: true, motion: true, readRate: 'normal' }, store.get('settings', {}));
  const progress = store.get('progress', {});
  let ageFilter = store.get('age', 'all');

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- settings ---------- */
  function isNight() {
    if (settings.night === 'on') return true;
    if (settings.night === 'off') return false;
    const h = new Date().getHours();
    return h >= 19 || h < 6;
  }
  function applySettings() {
    html.classList.toggle('text-s', settings.text === 's');
    html.classList.toggle('text-l', settings.text === 'l');
    html.classList.toggle('night', isNight());
    html.classList.toggle('still', !settings.motion);
    html.classList.toggle('motion-on', !!settings.motion);
    sound.setEnabled(settings.sound);
    document.querySelectorAll('[data-set]').forEach((b) => b.setAttribute('aria-pressed', String(settings[b.dataset.set] === parseVal(b.dataset.val))));
    const s = $('#sound-btn'); if (s) { s.innerHTML = settings.sound ? ICON.soundOn : ICON.soundOff; s.setAttribute('aria-label', settings.sound ? 'ශබ්ද නවත්වන්න / Sound off' : 'ශබ්ද දමන්න / Sound on'); }
    document.querySelectorAll('.night-btn').forEach((b) => { b.innerHTML = isNight() ? ICON.sun : ICON.moon; });
  }
  const parseVal = (v) => (v === 'true' ? true : v === 'false' ? false : v);
  function saveSettings() { store.set('settings', settings); applySettings(); }

  /* ---------- icons ---------- */
  const ICON = {
    moon: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M21 4a12 12 0 1 0 7 17A10 10 0 0 1 21 4z" fill="#FFE29A"/></svg>',
    sun: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6.5" fill="#FFD66B"/><g stroke="#FFD66B" stroke-width="2.6" stroke-linecap="round"><path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.8 6.8l2.1 2.1M23.1 23.1l2.1 2.1M6.8 25.2l2.1-2.1M23.1 8.9l2.1-2.1"/></g></svg>',
    gear: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#C9D2F2" d="M13.6 3h4.8l.7 3.4 2.4 1 2.9-1.9 3.4 3.4-1.9 2.9 1 2.4 3.1.7v4.8l-3.1.7-1 2.4 1.9 2.9-3.4 3.4-2.9-1.9-2.4 1-.7 3.1h-4.8l-.7-3.1-2.4-1-2.9 1.9-3.4-3.4 1.9-2.9-1-2.4L3 18.4v-4.8l3.4-.7 1-2.4-1.9-2.9 3.4-3.4 2.9 1.9 2.4-1zM16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>',
    back: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M19 7l-9 9 9 9" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 6l10 10-10 10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    prev: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M20 6L10 16l10 10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    soundOn: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h5l7-6v20l-7-6H5z" fill="#C9D2F2"/><path d="M21 11a7 7 0 0 1 0 10M24.5 7.5a12 12 0 0 1 0 17" fill="none" stroke="#C9D2F2" stroke-width="2.6" stroke-linecap="round"/></svg>',
    soundOff: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h5l7-6v20l-7-6H5z" fill="#C9D2F2" opacity=".6"/><path d="M21 12l8 8M29 12l-8 8" stroke="#C9D2F2" stroke-width="2.6" stroke-linecap="round"/></svg>',
    read: '<svg class="i-play" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7.5c3.5-1.6 7-1.4 10 .8v17c-3-2.2-6.5-2.4-10-.8z" fill="#C9D2F2"/><path d="M17 8.3c1.2-.9 2.5-1.4 3.8-1.6" fill="none" stroke="#C9D2F2" stroke-width="2.2" stroke-linecap="round"/><path d="M19 13.2l9 5.3-9 5.3z" fill="#FFE29A"/></svg>',
    pause: '<svg class="i-pause" viewBox="0 0 32 32" aria-hidden="true"><rect x="9" y="7" width="5" height="18" rx="1.6" fill="#3A2410"/><rect x="18" y="7" width="5" height="18" rx="1.6" fill="#3A2410"/></svg>',
    hand: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13 16V7.5a2 2 0 0 1 4 0V15l5 1.2a3 3 0 0 1 2.3 3.4L23.4 26H13.6L9 20.5a2 2 0 0 1 2.8-2.8z" fill="#F2A93B" stroke="#7A4A1C" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  };
  // the logo from the page header, reused inside the books (each copy gets its own ids,
  // because the header copy is hidden while reading and hidden gradients don't paint)
  let LOGO_SRC = '';
  let logoN = 0;
  function logo(cls) {
    const n = ++logoN;
    let svg = LOGO_SRC.replace(/hm-(sky|moon|page|crescent|round)/g, `hm$1-l${n}`);
    return cls ? svg.replace('<svg', `<svg class="${cls}"`) : svg;
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* =========================================================
     Bookshelf
     ========================================================= */
  const ageOk = (b) => ageFilter === 'all' || b.ages === ageFilter;

  let shelfY = 0; // where the shelf was scrolled to when a book was opened

  function showBook(id) {
    shelfY = window.scrollY;
    // remember that the book was opened from the shelf: the back button then simply goes back
    history.pushState({ fromShelf: true }, '', '#book-' + id);
    route();
  }

  // the book the child was in the middle of, so bedtime can carry on where it stopped
  function renderContinue() {
    const box = $('#continue');
    const b = BOOKS.find((x) => x.id === store.get('last', ''));
    const p = b ? progress[b.id] : 0;
    if (!b || !(p > 1)) { box.hidden = true; box.innerHTML = ''; return; }
    const n = Math.min(Math.max(p - 1, 1), b.pages.length);
    box.hidden = false;
    box.style.setProperty('--c', b.color);
    box.innerHTML = `<button type="button" class="continue-card" aria-label="දිගටම කියවමු: ${esc(b.title)}, පිටුව ${n} / ${b.pages.length}">
        <span class="thumb">${S.render(b.cover)}</span>
        <span class="words"><small>කියවමින් සිටි කතාව</small><b>${esc(b.title)}</b><span class="bar"><i style="width:${Math.round((n / b.pages.length) * 100)}%"></i></span></span>
        <span class="go">දිගටම<br>කියවමු ➜</span>
      </button>`;
    box.firstElementChild.addEventListener('click', () => { sound.pop(); showBook(b.id); });
  }

  function renderShelf() {
    renderContinue();
    const shelf = $('#books');
    shelf.innerHTML = '';
    BOOKS.filter(ageOk).forEach((b) => {
      const p = progress[b.id];
      const reading = p != null && p > 1;
      const card = document.createElement('button');
      card.className = 'book-card';
      card.style.setProperty('--c', b.color);
      card.setAttribute('aria-label', `${b.title}${b.subtitle ? ' – ' + b.subtitle : ''}, වයස ${b.ages}`);
      card.innerHTML = `<div class="book-3d">
          <div class="cover-art">${S.render(b.cover)}</div>
          <div class="cover-title">${esc(b.title)}</div>
          <span class="age">${b.ages.replace('-', '–')}</span>
          ${reading ? '<span class="ribbon" aria-hidden="true"></span>' : ''}
        </div>
        <div class="book-meta">${reading ? 'කියවමින්…' : `පිටු ${b.pages.length}`}${b.long ? ' · දිගු කතාවක්' : ''}</div>`;
      card.addEventListener('click', () => {
        card.classList.add('opening');
        sound.pop();
        setTimeout(() => showBook(b.id), 380);
      });
      shelf.appendChild(card);
    });
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.age === ageFilter)));
  }

  /* =========================================================
     Book
     ========================================================= */
  let book = null;        // current book data
  let pages = [];         // page descriptors
  let flip = null;        // PageFlip instance
  let layoutKey = '';
  let current = 0;
  let pageNodes = [];     // the page elements of the open book
  const RATIO = 440 / 600; // page width / height

  function buildPages(b, spread) {
    const list = [{ type: 'cover' }, { type: 'title' }];
    b.pages.forEach((p, i) => list.push({ type: 'story', p, n: i + 1 }));
    if (b.moral) list.push({ type: 'lesson' });
    list.push({ type: 'goodnight' });
    if (spread && (list.length + 1) % 2 === 1) list.push({ type: 'blank' }); // on a spread the back cover must land on a left page
    list.push({ type: 'back' });
    return list;
  }

  const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('si', { granularity: 'grapheme' }) : null;
  function firstGrapheme(s) {
    if (segmenter) { const it = segmenter.segment(s)[Symbol.iterator]().next(); return it.value ? it.value.segment : s[0]; }
    return Array.from(s)[0];
  }
  // escape + colour the dialogue in “quotes”
  function storyHTML(text, dropCap) {
    let body = esc(text);
    let cap = '';
    if (dropCap) { cap = firstGrapheme(text); body = esc(text.slice(cap.length)); cap = `<span class="dropcap">${esc(cap)}</span>`; }
    body = body.replace(/“([^”]+)”/g, '<span class="q">“$1”</span>');
    return cap + body;
  }

  function nextBook() {
    const list = BOOKS.filter(ageOk);
    if (list.length < 2) return null;
    const i = list.findIndex((x) => x.id === book.id);
    return list[(i + 1) % list.length];
  }

  function hasTap(svg) { return /data-tap="/.test(svg); }
  const hint = `<span class="tappable-hint" aria-hidden="true">${ICON.hand}</span>`;

  function pageHTML(d, i) {
    const b = book;
    switch (d.type) {
      case 'cover': {
        return `<div class="cover-inner"><div class="cover-art">${S.render(b.cover)}</div><div class="side">
          <h2>${esc(b.title)}</h2>${b.subtitle ? `<h3>${esc(b.subtitle)}</h3>` : ''}
          <div class="by">${logo()}<span>හඳ මාමා කතන්දර</span></div>
          <div class="tap-open">පොත අරින්න ➜</div></div></div>`;
      }
      case 'title':
        return `<div class="page-inner"><div class="art">${S.render('night-sky')}</div><div class="side">
          <h2>${esc(b.title)}</h2>${b.subtitle ? `<h3>${esc(b.subtitle)}</h3>` : ''}
          <div class="orn"></div><div class="small">හඳ මාමා කියන නිදි කතා · වයස ${b.ages.replace('-', '–')}</div></div></div>`;
      case 'story': {
        const svg = S.render(d.p.scene);
        const paras = d.p.paras.map((t, k) => `<p>${storyHTML(t, d.p.dropCap && k === 0)}</p>`).join('');
        return `<div class="page-inner"><div class="art">${svg}${hasTap(svg) ? hint : ''}</div><div class="side"><div class="text">${paras}</div></div></div><span class="num">${d.n}</span>`;
      }
      case 'lesson':
        return `<div class="page-inner"><div class="art">${S.render('lesson')}</div><div class="side"><div class="label">✦ පාඩම ✦</div><div class="text"><p>${storyHTML(b.moral)}</p></div></div></div>`;
      case 'goodnight': {
        const nb = nextBook();
        return `<div class="page-inner"><div class="art">${S.render('goodnight', b.id)}</div><div class="side"><div class="text"><p>${esc(b.goodnight || 'සුබ රාත්‍රියක්!')}</p></div>
          <div class="end-actions">${nb ? `<button class="next" data-act="next" aria-label="ඊළඟ කතාව: ${esc(nb.title)}">ඊළඟ කතාව ➜</button>` : ''}<button class="again" data-act="again">නැවත කියවමු</button><button class="home" data-act="home">පොත් රාක්කයට</button></div></div></div>`;
      }
      case 'blank':
        return `<div class="page-inner">${logo()}</div>`;
      case 'back':
        return `<div class="cover-inner">${logo('mark')}<p>හඳ මාමා කතන්දර</p><small>සුබ රාත්‍රියක්!</small></div>`;
    }
    return '';
  }

  function makePage(d, i) {
    const el = document.createElement('div');
    el.className = 'page ' + ({ cover: 'cover', back: 'back', title: 'title-page', lesson: 'lesson', goodnight: 'goodnight', blank: 'blank', story: 'story' }[d.type]);
    if (d.type === 'cover' || d.type === 'back') el.dataset.density = 'hard';
    el.innerHTML = pageHTML(d, i);
    // a page's picture is drawn only once it is decoded: no empty frame when the page appears or is copied for turning
    el.querySelectorAll('img').forEach((im) => { im.decoding = 'sync'; });
    return el;
  }

  // biggest text that still fits: keep pictures large and never cut a line off
  function fitText(pageEls, pageW, pageH, wide) {
    const probe = document.createElement('div');
    probe.className = 'page story';
    probe.style.cssText = `position:absolute;left:-9999px;top:0;width:${pageW}px;height:${pageH - 2}px;visibility:hidden`; // 2px spare for rounding
    document.body.appendChild(probe);
    const base = parseFloat(getComputedStyle(html).getPropertyValue('--text-size')) || 23;
    const colW = wide ? pageW * 0.5 : pageW;
    // big single pages (tablets) get bigger letters, like a big picture book
    const max = Math.max(15, Math.min(base * Math.max(1, Math.min(1.35, colW / 470)), colW / 17));
    pageEls.forEach((el) => {
      const text = el.querySelector('.text');
      if (!text || el.classList.contains('cover') || el.classList.contains('back')) return;
      probe.className = el.className;
      probe.innerHTML = el.innerHTML.replace(/<img [^>]*>/g, '<i class="scene"></i>'); // measuring only: don't start picture downloads
      const pt = probe.querySelector('.text');
      const art = probe.querySelector('.art');
      const inner = probe.querySelector('.page-inner');
      const side = probe.querySelector('.side');
      // keep the whole picture (always its own 4:3 shape) and the words as big as the page allows:
      // the words get a little smaller first, then the whole picture gets smaller, and only then
      // do the words shrink further (tiny phones), so every line always fits on the page
      const fits = () => inner.scrollHeight <= inner.clientHeight && (!wide || side.scrollHeight <= side.clientHeight);
      let fs = max;
      let artW = 100;
      const set = () => { pt.style.setProperty('--fs', fs + 'px'); inner.style.setProperty('--art-w', artW + '%'); };
      const steps = wide ? [[46, 15], [42, 14], [38, 13], [34, 12]] : [[100, 16], [92, 16], [84, 15], [76, 15], [68, 14], [60, 13], [52, 12]];
      for (const [w, floor] of steps) {
        artW = w;
        fs = max; // a smaller picture leaves room for bigger words again
        set();
        while (fs > floor && !fits()) { fs -= 0.5; set(); }
        if (fits()) break;
      }
      if (art) el.querySelector('.page-inner').style.setProperty('--art-w', artW + '%');
      text.style.setProperty('--fs', fs + 'px');
    });
    probe.remove();
  }

  function stageSize() {
    const st = $('#stage');
    const r = st.getBoundingClientRect();
    const w = r.width - 16, h = r.height - 18;
    // short and wide (a phone on its side): one wide page, picture beside the words
    if (h < 480 && w / h > 1.6) {
      const pageH = Math.floor(h);
      return { spread: false, wide: true, pageW: Math.floor(Math.min(w, pageH * 2.1)), pageH };
    }
    const spread = w / h > 1.05 && w >= 520;
    // pages take the shape of the screen, within book-like limits
    const ratio = Math.max(spread ? 0.62 : 0.54, Math.min(RATIO, (spread ? w / 2 : w) / h));
    let pageW = spread ? Math.min(w / 2, h * ratio) : Math.min(w, h * ratio);
    pageW = Math.floor(pageW);
    return { spread, wide: false, pageW, pageH: Math.floor(pageW / ratio) };
  }

  function layoutBook(startAt) {
    const holder = $('#book-holder');
    const { spread, wide, pageW, pageH } = stageSize();
    layoutKey = `${spread}:${wide}:${pageW}:${pageH}`;
    // the filler page only exists on two-page spreads: keep the reader on the same page when it comes or goes
    const was = pages[startAt];
    pages = buildPages(book, spread);
    if (was) { const k = pages.findIndex((d) => d.type === was.type && d.n === was.n); startAt = k >= 0 ? k : Math.min(startAt, pages.length - 1); }
    html.classList.toggle('wide-book', wide);
    if (flip) { try { flip.destroy(); } catch (e) { /* ignore */ } flip = null; }
    holder.innerHTML = '';
    const el = document.createElement('div');
    holder.appendChild(el);
    holder.style.width = (spread ? pageW * 2 : pageW) + 'px';
    holder.style.height = pageH + 'px';
    // the cover colour lives on the holder: PageFlip rewrites each page's inline style
    holder.style.setProperty('--c', book.color);

    const pageEls = pages.map(makePage);
    pageNodes = pageEls;
    fitText(pageEls, pageW, pageH, wide);
    pageEls.forEach((p) => el.appendChild(p));
    wirePages(pageEls);

    const turning = !!settings.motion;
    flip = new St.PageFlip(el, {
      width: pageW, height: pageH, size: 'stretch',
      minWidth: spread ? 120 : Math.ceil(pageW / 2) + 1, maxWidth: 3000, minHeight: 100, maxHeight: 4000,
      showCover: true, usePortrait: true, autoSize: true,
      drawShadow: true, maxShadowOpacity: 0.55, flippingTime: turning ? 850 : 350,
      mobileScrollSupport: false, swipeDistance: 24, showPageCorners: true, disableFlipByClick: false,
      startPage: Math.max(0, Math.min(startAt || 0, pages.length - 1)),
    });
    flip.loadFromHTML(pageEls);
    predecode(pageEls);
    flip.on('flip', (e) => onFlip(e.data));
    flip.on('changeState', (e) => {
      const turningNow = e.data === 'flipping' || e.data === 'user_fold' || e.data === 'fold_corner';
      holder.classList.toggle('is-turning', turningNow && e.data !== 'fold_corner');
      if (e.data === 'flipping') holder.classList.remove('closed-front', 'closed-back');
      if (e.data === 'flipping') sound.rustle();
    });
    onFlip(flip.getCurrentPageIndex(), true);
  }

  // decode every picture in the book ahead of time, so turning to a page never waits for its picture
  function predecode(pageEls) {
    pageEls.forEach((el) => el.querySelectorAll('img').forEach((im) => {
      const go = () => { if (im.decode) im.decode().catch(() => { /* not loaded yet or offline: drawn when it arrives */ }); };
      if (im.complete && im.naturalWidth) go(); else im.addEventListener('load', go, { once: true });
    }));
  }

  function wirePages(pageEls) {
    pageEls.forEach((el) => {
      // taps on pictures and buttons must not turn the page
      const guard = (e) => { if (e.target.closest('[data-tap], button')) e.stopPropagation(); };
      el.addEventListener('mousedown', guard);
      el.addEventListener('touchstart', guard, { passive: true });
      el.addEventListener('click', (e) => {
        const t = e.target.closest('[data-tap]');
        if (t && S.taps[t.dataset.tap]) {
          S.taps[t.dataset.tap](t, t.closest('svg'));
          const h = el.querySelector('.tappable-hint'); if (h) h.remove();
          return;
        }
        const a = e.target.closest('[data-act]');
        if (a && a.dataset.act === 'again') { sound.pop(); flip.turnToPage(0); onFlip(0); }
        if (a && a.dataset.act === 'home') { sound.pop(); goShelf(); }
        if (a && a.dataset.act === 'next') { sound.pop(); goNextBook(); }
      });
    });
  }

  function onFlip(i, initial) {
    current = i;
    const last = pages.length - 1;
    progress[book.id] = i >= last - 2 ? 0 : i; // finished books start again from the cover
    store.set('progress', progress);
    $('#prev-btn').disabled = i <= 0;
    $('#next-btn').disabled = i >= last;
    const pct = Math.round((i / last) * 100);
    $('#progress-fill').style.width = pct + '%';
    const storyNum = pages[i] && pages[i].type === 'story' ? pages[i].n : null;
    $('#progress-text').textContent = storyNum ? `${storyNum} / ${book.pages.length}` : '';
    const atEnd = pages[i] && (pages[i].type === 'goodnight' || (pages[i + 1] && pages[i + 1].type === 'goodnight' && flip && flip.getOrientation() === 'landscape'));
    $('#reader-view').classList.toggle('sleepy', !!atEnd);
    const holder = $('#book-holder');
    const spread = flip && flip.getOrientation() === 'landscape';
    holder.classList.toggle('closed-front', !!spread && i === 0);
    holder.classList.toggle('closed-back', !!spread && i === last);
    if (auto && !initial) {
      autoRun++; if (hasSpeech) speechSynthesis.cancel(); lightUp(null);
      const run = autoRun;
      wait(450, run, readPage);
    }
    if (!initial && atEnd) sound.chime();
  }

  function openBook(id) {
    const b = BOOKS.find((x) => x.id === id);
    if (!b) { goShelf(); return; }
    book = b;
    pages = buildPages(b);
    store.set('last', b.id);
    $('#shelf-view').hidden = true;
    $('#reader-view').hidden = false;
    $('#reader-title').textContent = b.title;
    S.preload([[b.cover], ['night-sky'], ...b.pages.map((p) => [p.scene]), ['lesson'], ['goodnight', b.id]]);
    document.title = `${b.title} · හඳ මාමා කතන්දර`;
    const start = progress[b.id] || 0;
    // measure the pages only once the story fonts are in, or the words won't fit the way they were measured
    const go = () => { if (book === b) requestAnimationFrame(() => layoutBook(start)); };
    if (document.fonts && document.fonts.load) {
      Promise.all(['400 20px "Noto Serif Sinhala"', '600 20px "Noto Serif Sinhala"', '800 20px "Gemunu Libre"', '700 20px "Gemunu Libre"']
        .map((f) => document.fonts.load(f, 'අආ, .!?“”–1'))).then(go, go); // Sinhala letters and the Latin file's punctuation
    } else go();
  }

  function closeBook() {
    stopAuto();
    if (flip) { try { flip.destroy(); } catch (e) { /* ignore */ } flip = null; }
    $('#book-holder').innerHTML = '';
    $('#reader-view').hidden = true;
    $('#reader-view').classList.remove('sleepy');
    $('#shelf-view').hidden = false;
    document.title = 'හඳ මාමා කතන්දර · Handa Mama Stories';
    book = null;
    html.classList.remove('wide-book');
    renderShelf();
    window.scrollTo(0, shelfY);
  }

  function goShelf() {
    if (history.state && history.state.fromShelf) { history.back(); return; } // the shelf is the page before: no extra history steps
    history.replaceState(null, '', location.pathname + location.search);
    route();
  }

  // straight on to the next story, without piling up history steps
  function goNextBook() {
    const nb = nextBook();
    if (!nb) return;
    progress[nb.id] = 0;
    store.set('progress', progress);
    history.replaceState(history.state, '', '#book-' + nb.id);
    route();
  }

  function route() {
    const m = location.hash.match(/^#book-([\w-]+)/);
    if (m) { if (!book || book.id !== m[1]) openBook(m[1]); }
    else if (book) closeBook();
    else renderShelf();
  }

  /* ---------- "read to me": reads each page aloud and turns the pages by itself ----------
     With a Sinhala voice on the device the story is spoken, a sentence at a time. Without one
     (most iPhones, many Android phones) the pages still turn by themselves at a child's reading
     pace, with the paragraph being read lit up, so a parent can read along. */
  let auto = false;
  let autoRun = 0;        // bumps on every start/stop, so callbacks from an old run do nothing
  let autoTimer = null;
  let siVoice = null;
  const keep = [];        // Chrome forgets the callbacks of utterances that are garbage collected
  const hasSpeech = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  function findVoice() {
    if (!hasSpeech) return;
    const vs = speechSynthesis.getVoices();
    siVoice = vs.find((v) => /^si([-_]|$)/i.test(v.lang) && v.localService) || vs.find((v) => /^si([-_]|$)/i.test(v.lang)) || null;
  }

  // what to read on page k: one part per paragraph, each with the element to light up
  function readingParts(k) {
    const d = pages[k]; const el = pageNodes[k];
    if (!d || !el) return [];
    const part = (sel) => [...el.querySelectorAll(sel)].map((e) => ({ el: e, text: e.textContent.replace(/\s+/g, ' ').trim() })).filter((x) => x.text);
    if (d.type === 'cover') return part('h2, h3');
    if (d.type === 'story' || d.type === 'lesson' || d.type === 'goodnight') return part('.text p');
    return []; // title, blank and back pages: a short pause
  }
  const sentences = (t) => t.match(/[^.!?…]+(?:[.!?…]+[”"']?|$)\s*/g) || [t];
  const words = (t) => t.split(/\s+/).filter(Boolean).length;
  const slow = () => settings.readRate === 'slow';

  function lightUp(el) {
    document.querySelectorAll('#book-holder .reading').forEach((x) => x.classList.remove('reading'));
    if (el) el.classList.add('reading');
  }

  function wait(ms, run, next) { clearTimeout(autoTimer); autoTimer = setTimeout(() => { if (run === autoRun) next(); }, ms); }

  // say one paragraph, a sentence at a time (long utterances get cut off on some phones)
  function say(text, run, done) {
    const list = sentences(text);
    let n = 0;
    const one = () => {
      if (run !== autoRun) return;
      if (n >= list.length) { done(); return; }
      const t = list[n++].trim();
      if (!t) { one(); return; }
      const u = new SpeechSynthesisUtterance(t);
      try { u.voice = siVoice; } catch (e) { /* an unusual voice object: the language below still picks it */ }
      u.lang = siVoice.lang; u.rate = slow() ? 0.72 : 0.88; u.pitch = 1.05;
      let finished = false;
      const next = () => { if (finished) return; finished = true; const k = keep.indexOf(u); if (k >= 0) keep.splice(k, 1); one(); };
      u.onend = next; u.onerror = next;
      keep.push(u);
      // some phones never report the end of a sentence: carry on after a generous guess
      wait(2500 + words(t) * (slow() ? 1100 : 850), run, next);
      speechSynthesis.speak(u);
    };
    one();
  }

  // read the visible page(s), then turn the page; stop after the goodnight page
  function readPage() {
    const run = autoRun;
    if (!auto || !book || !flip) return;
    const spread = flip.getOrientation() === 'landscape';
    const idx = spread && current > 0 ? [current, current + 1] : [current];
    const parts = idx.flatMap(readingParts);
    const atEnd = idx.some((k) => pages[k] && (pages[k].type === 'goodnight' || pages[k].type === 'back' || pages[k].type === 'blank'));
    let n = 0;
    const next = () => {
      if (run !== autoRun) return;
      if (n < parts.length) {
        const p = parts[n++];
        lightUp(p.el);
        if (siVoice) say(p.text, run, () => wait(350, run, next));
        else wait(Math.max(2200, words(p.text) * (slow() ? 900 : 650)), run, next); // a child's reading pace
        return;
      }
      lightUp(null);
      if (atEnd || current >= pages.length - 1) { stopAuto(); return; }
      wait(parts.length ? 700 : 1600, run, () => flip.flipNext('top')); // onFlip carries on reading
    };
    next();
  }

  function startAuto() {
    if (!book) return;
    findVoice();
    auto = true; autoRun++;
    $('#read-btn').classList.add('on');
    $('#read-btn').setAttribute('aria-pressed', 'true');
    if (!siVoice && !store.get('voiceTip')) {
      store.set('voiceTip', 1);
      toast('සිංහල කටහඬක් නැත: පිටු තනියම පෙරළෙනවා');
    }
    // a book that is at its end starts again from the cover
    if (pages[current] && (pages[current].type === 'back' || pages[current].type === 'blank')) { flip.turnToPage(0); onFlip(0); }
    readPage();
  }

  function stopAuto() {
    auto = false; autoRun++;
    clearTimeout(autoTimer);
    if (hasSpeech) speechSynthesis.cancel();
    lightUp(null);
    const b = $('#read-btn'); if (b) { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }
  }

  /* =========================================================
     Parents' corner (press and hold, so little hands don't open it)
     ========================================================= */
  function setupParents() {
    const btn = $('#parents-btn');
    const dlg = $('#parents');
    let timer = null;
    const start = (e) => {
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      if (e.type === 'keydown') { e.preventDefault(); openParents(); return; }
      btn.classList.add('holding');
      timer = setTimeout(() => { btn.classList.remove('holding'); openParents(); }, 2700);
    };
    const cancel = (e) => {
      if (!timer) return;
      clearTimeout(timer); timer = null;
      if (btn.classList.contains('holding')) toast('දෙමාපියන්ට: තත්පර 3ක් ඔබාගෙන සිටින්න');
      btn.classList.remove('holding');
    };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('keydown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, cancel));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    function openParents() {
      timer = null;
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    }
    $('#parents-close').addEventListener('click', () => dlg.close ? dlg.close() : dlg.removeAttribute('open'));
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
      const b = e.target.closest('[data-set]');
      if (b) {
        settings[b.dataset.set] = parseVal(b.dataset.val);
        saveSettings();
        if (book && (b.dataset.set === 'text' || b.dataset.set === 'motion')) layoutBook(current);
      }
    });
    $('#clear-progress').addEventListener('click', () => {
      Object.keys(progress).forEach((k) => delete progress[k]);
      store.set('progress', progress);
      renderShelf();
      toast('Reading progress cleared');
    });
  }

  /* =========================================================
     Start
     ========================================================= */
  function init() {
    // twinkling stars behind the shelf
    const dots = $('.sky-dots');
    for (let i = 0; i < 46; i++) {
      const d = document.createElement('i');
      d.style.left = (Math.random() * 100).toFixed(1) + '%';
      d.style.top = (Math.random() * 100).toFixed(1) + '%';
      d.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's';
      d.style.transform = `scale(${(0.5 + Math.random()).toFixed(2)})`;
      dots.appendChild(d);
    }
    document.body.insertAdjacentHTML('afterbegin', window.HM_ART.DEFS);
    LOGO_SRC = $('.brand svg').outerHTML;

    $('#back-btn').innerHTML = ICON.back + '<span>පොත් රාක්කයට</span>';
    $('#prev-btn').innerHTML = ICON.prev;
    $('#next-btn').innerHTML = ICON.next;
    $('#read-btn').innerHTML = ICON.read + ICON.pause;
    $('#parents-btn').insertAdjacentHTML('afterbegin', ICON.gear);

    $('#back-btn').addEventListener('click', () => { sound.pop(); goShelf(); });
    $('#prev-btn').addEventListener('click', () => flip && flip.flipPrev('top'));
    $('#next-btn').addEventListener('click', () => flip && flip.flipNext('top'));
    $('#read-btn').addEventListener('click', () => { sound.pop(); if (auto) stopAuto(); else startAuto(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && auto) stopAuto(); });
    $('#sound-btn').addEventListener('click', () => { settings.sound = !settings.sound; saveSettings(); if (settings.sound) sound.pop(); toast(settings.sound ? 'ශබ්ද ඇත' : 'ශබ්ද නැත'); });
    document.querySelectorAll('.night-btn').forEach((b) => b.addEventListener('click', () => {
      settings.night = isNight() ? 'off' : 'on';
      saveSettings();
      toast(isNight() ? 'රාත්‍රී පෙනුම' : 'දවල් පෙනුම');
    }));
    document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
      ageFilter = c.dataset.age; store.set('age', ageFilter); sound.pop(); renderShelf();
    }));

    document.addEventListener('keydown', (e) => {
      if (!book || $('#parents').open) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); flip && flip.flipNext('top'); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); flip && flip.flipPrev('top'); }
      if (e.key === 'Escape') goShelf();
    });

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (!book) return;
        const { spread, wide, pageW, pageH } = stageSize();
        if (`${spread}:${wide}:${pageW}:${pageH}` !== layoutKey) layoutBook(flip ? flip.getCurrentPageIndex() : current);
      }, 220);
    });

    if (hasSpeech) { findVoice(); speechSynthesis.addEventListener('voiceschanged', findVoice); }
    setupParents();
    applySettings();
    setInterval(applySettings, 5 * 60 * 1000); // auto night mode switches on at 7 pm
    window.addEventListener('hashchange', route);
    route();

    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      // a new version took over: reload once so this tab runs the new code too
      const hadController = !!navigator.serviceWorker.controller;
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController && !reloaded) { reloaded = true; location.reload(); }
      });
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode simply stays off */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
