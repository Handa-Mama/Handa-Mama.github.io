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
  const settings = Object.assign({ text: 'm', night: 'auto', sound: true, motion: true }, store.get('settings', {}));
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
    listen: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 18v-3a9 9 0 0 1 18 0v3" fill="none" stroke="#C9D2F2" stroke-width="2.6"/><rect x="5" y="17" width="6" height="9" rx="2.5" fill="#C9D2F2"/><rect x="21" y="17" width="6" height="9" rx="2.5" fill="#C9D2F2"/></svg>',
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

  function renderShelf() {
    const shelf = $('#shelf');
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
        setTimeout(() => { location.hash = '#book-' + b.id; }, 380);
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
  const RATIO = 440 / 600; // page width / height

  function buildPages(b) {
    const list = [{ type: 'cover' }, { type: 'title' }];
    b.pages.forEach((p, i) => list.push({ type: 'story', p, n: i + 1 }));
    if (b.moral) list.push({ type: 'lesson' });
    list.push({ type: 'goodnight' });
    if ((list.length + 1) % 2 === 1) list.push({ type: 'blank' }); // the back cover must land on a left page
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

  function hasTap(svg) { return /data-tap="/.test(svg); }
  const hint = `<span class="tappable-hint" aria-hidden="true">${ICON.hand}</span>`;

  function pageHTML(d, i) {
    const b = book;
    switch (d.type) {
      case 'cover': {
        return `<div class="cover-inner"><div class="cover-art">${S.render(b.cover)}</div>
          <h2>${esc(b.title)}</h2>${b.subtitle ? `<h3>${esc(b.subtitle)}</h3>` : ''}
          <div class="by">${logo()}<span>හඳ මාමා කතන්දර</span></div>
          <div class="tap-open">පොත අරින්න ➜</div></div>`;
      }
      case 'title':
        return `<div class="page-inner"><div class="art">${S.render('night-sky')}</div>
          <h2>${esc(b.title)}</h2>${b.subtitle ? `<h3>${esc(b.subtitle)}</h3>` : ''}
          <div class="orn"></div><div class="small">හඳ මාමා කියන නිදි කතා · වයස ${b.ages.replace('-', '–')}</div></div>`;
      case 'story': {
        const svg = S.render(d.p.scene);
        const paras = d.p.paras.map((t, k) => `<p>${storyHTML(t, d.p.dropCap && k === 0)}</p>`).join('');
        return `<div class="page-inner"><div class="art">${svg}${hasTap(svg) ? hint : ''}</div><div class="text">${paras}</div></div><span class="num">${d.n}</span>`;
      }
      case 'lesson':
        return `<div class="page-inner"><div class="label">✦ පාඩම ✦</div><div class="art">${S.render('lesson')}</div><div class="text"><p>${storyHTML(b.moral)}</p></div></div>`;
      case 'goodnight':
        return `<div class="page-inner"><div class="art">${S.render('goodnight', b.id)}</div><div class="text"><p>${esc(b.goodnight || 'සුබ රාත්‍රියක්!')}</p></div>
          <div class="end-actions"><button class="again" data-act="again">නැවත කියවමු</button><button class="home" data-act="home">පොත් රාක්කයට</button></div></div>`;
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
    return el;
  }

  // keep pictures big: shrink the text a little on pages with many words
  function fitText(pageEls, pageW, pageH) {
    const probe = document.createElement('div');
    probe.className = 'page story';
    probe.style.cssText = `position:absolute;left:-9999px;top:0;width:${pageW}px;height:${pageH}px;visibility:hidden`;
    document.body.appendChild(probe);
    const base = parseFloat(getComputedStyle(html).getPropertyValue('--text-size')) || 23;
    const max = Math.max(15, Math.min(base, pageW / 17));
    pageEls.forEach((el) => {
      const text = el.querySelector('.text');
      if (!text || el.classList.contains('cover') || el.classList.contains('back')) return;
      probe.className = el.className;
      probe.innerHTML = el.innerHTML;
      const pt = probe.querySelector('.text');
      const art = probe.querySelector('.art');
      const extra = probe.querySelector('.end-actions, .label');
      let fs = max;
      pt.style.setProperty('--fs', fs + 'px');
      const minArt = pageH * (extra ? 0.3 : 0.38);
      while (fs > 14 && art && art.offsetHeight < minArt) { fs -= 1; pt.style.setProperty('--fs', fs + 'px'); }
      text.style.setProperty('--fs', fs + 'px');
    });
    probe.remove();
  }

  function stageSize() {
    const st = $('#stage');
    const r = st.getBoundingClientRect();
    const w = r.width - 16, h = r.height - 18;
    const spread = w / h > 1.05 && w >= 520;
    // pages take the shape of the screen, within book-like limits
    const ratio = Math.max(spread ? 0.62 : 0.54, Math.min(RATIO, (spread ? w / 2 : w) / h));
    let pageW = spread ? Math.min(w / 2, h * ratio) : Math.min(w, h * ratio);
    pageW = Math.floor(pageW);
    return { spread, pageW, pageH: Math.floor(pageW / ratio) };
  }

  function layoutBook(startAt) {
    const holder = $('#book-holder');
    const { spread, pageW, pageH } = stageSize();
    layoutKey = `${spread}:${pageW}:${pageH}`;
    if (flip) { try { flip.destroy(); } catch (e) { /* ignore */ } flip = null; }
    holder.innerHTML = '';
    const el = document.createElement('div');
    holder.appendChild(el);
    holder.style.width = (spread ? pageW * 2 : pageW) + 'px';
    holder.style.height = pageH + 'px';
    // the cover colour lives on the holder: PageFlip rewrites each page's inline style
    holder.style.setProperty('--c', book.color);

    const pageEls = pages.map(makePage);
    fitText(pageEls, pageW, pageH);
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
    flip.on('flip', (e) => onFlip(e.data));
    flip.on('changeState', (e) => {
      const turningNow = e.data === 'flipping' || e.data === 'user_fold' || e.data === 'fold_corner';
      holder.classList.toggle('is-turning', turningNow && e.data !== 'fold_corner');
      if (e.data === 'flipping') holder.classList.remove('closed-front', 'closed-back');
      if (e.data === 'flipping') sound.rustle();
    });
    onFlip(flip.getCurrentPageIndex(), true);
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
      });
    });
  }

  function visibleText(i) {
    const idx = [i];
    if (flip && flip.getOrientation && flip.getOrientation() === 'landscape' && i > 0) idx.push(i + 1);
    return idx.map((k) => pages[k]).filter(Boolean).map((d) => {
      if (d.type === 'story') return d.p.paras.join(' ');
      if (d.type === 'cover' || d.type === 'title') return book.title;
      if (d.type === 'lesson') return book.moral;
      if (d.type === 'goodnight') return book.goodnight;
      return '';
    }).join(' ');
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
    if (speaking) stopSpeaking();
    if (!initial && atEnd) sound.chime();
  }

  function openBook(id) {
    const b = BOOKS.find((x) => x.id === id);
    if (!b) { goShelf(); return; }
    book = b;
    pages = buildPages(b);
    $('#shelf-view').hidden = true;
    $('#reader-view').hidden = false;
    $('#reader-title').textContent = b.title;
    S.preload([[b.cover], ['night-sky'], ...b.pages.map((p) => [p.scene]), ['lesson'], ['goodnight', b.id]]);
    document.title = `${b.title} · හඳ මාමා කතන්දර`;
    const start = progress[b.id] || 0;
    requestAnimationFrame(() => layoutBook(start));
  }

  function closeBook() {
    stopSpeaking();
    if (flip) { try { flip.destroy(); } catch (e) { /* ignore */ } flip = null; }
    $('#book-holder').innerHTML = '';
    $('#reader-view').hidden = true;
    $('#reader-view').classList.remove('sleepy');
    $('#shelf-view').hidden = false;
    document.title = 'හඳ මාමා කතන්දර · Handa Mama Stories';
    book = null;
    renderShelf();
  }

  function goShelf() {
    if (location.hash.startsWith('#book-')) location.hash = '#shelf';
    else closeBook();
  }

  function route() {
    const m = location.hash.match(/^#book-([\w-]+)/);
    if (m) openBook(m[1]);
    else if (book) closeBook();
    else renderShelf();
  }

  /* ---------- reading aloud (only when the device has a Sinhala voice) ---------- */
  let speaking = false;
  let siVoice = null;
  function findVoice() {
    if (!('speechSynthesis' in window)) return;
    siVoice = speechSynthesis.getVoices().find((v) => /^si/i.test(v.lang)) || null;
    $('#listen-btn').hidden = !siVoice;
  }
  function speak() {
    if (!siVoice) return;
    if (speaking) { stopSpeaking(); return; }
    const u = new SpeechSynthesisUtterance(visibleText(current));
    u.voice = siVoice; u.lang = siVoice.lang; u.rate = 0.85;
    u.onend = () => { speaking = false; };
    speaking = true;
    speechSynthesis.speak(u);
  }
  function stopSpeaking() { if ('speechSynthesis' in window) speechSynthesis.cancel(); speaking = false; }

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
    $('#listen-btn').innerHTML = ICON.listen;
    $('#parents-btn').insertAdjacentHTML('afterbegin', ICON.gear);

    $('#back-btn').addEventListener('click', () => { sound.pop(); goShelf(); });
    $('#prev-btn').addEventListener('click', () => flip && flip.flipPrev('top'));
    $('#next-btn').addEventListener('click', () => flip && flip.flipNext('top'));
    $('#listen-btn').addEventListener('click', speak);
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
        const { spread, pageW, pageH } = stageSize();
        if (`${spread}:${pageW}:${pageH}` !== layoutKey) layoutBook(flip ? flip.getCurrentPageIndex() : current);
      }, 220);
    });

    if ('speechSynthesis' in window) { findVoice(); speechSynthesis.onvoiceschanged = findVoice; }
    setupParents();
    applySettings();
    setInterval(applySettings, 5 * 60 * 1000); // auto night mode switches on at 7 pm
    window.addEventListener('hashchange', route);
    route();

    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode simply stays off */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
