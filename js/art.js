/*
 * හඳ මාමා කතන්දර — drawing kit
 * Small SVG building blocks (skies, trees, animals, people) that the scenes in
 * scenes.js are composed from. Every illustration is 400 × 300 units.
 * Animation is done with CSS classes (see css/app.css, "Living pictures").
 */
(function () {
  'use strict';

  let uidCounter = 0;
  const uid = (p) => `${p}${++uidCounter}`;

  // seeded random, so a scene always draws the same way
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // place a drawing: x, y = where its feet touch the ground
  const at = (x, y, s, inner, flip) =>
    `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${inner}</g>`;
  // wrap in an animation class (CSS); d = delay in seconds (negative = start mid-way)
  const anim = (cls, inner, d) =>
    `<g class="${cls}"${d != null ? ` style="animation-delay:${d}s"` : ''}>${inner}</g>`;

  const C = {
    ink: '#3A2E26',
    grass: '#9CC36A', grass2: '#86B556', grass3: '#7FAE52',
    hill1: '#C3DE97', hill2: '#ADD283',
    leaf1: '#5E9E4A', leaf2: '#6FB257', leaf3: '#4E8A3D',
    trunk: '#7A5235', trunk2: '#694530',
    water: '#5BA4D9', water2: '#8CC6EC',
    cheek: '#F2928A',
    skin: '#C98B5E', skin2: '#B9784C',
    gold: '#E8B83A', gold2: '#C99620',
  };

  /* ---------- skies & grounds ---------- */

  function sky(kind) {
    return `<rect width="400" height="300" fill="url(#hm-sky-${kind})"/>`;
  }

  function sun(x, y, r, hot) {
    const rays = Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      const r1 = r + 6, r2 = r + (hot ? 22 : 14);
      return `<line x1="${(x + Math.cos(a) * r1).toFixed(1)}" y1="${(y + Math.sin(a) * r1).toFixed(1)}" x2="${(x + Math.cos(a) * r2).toFixed(1)}" y2="${(y + Math.sin(a) * r2).toFixed(1)}"/>`;
    }).join('');
    return `${anim('a-spin', `<g stroke="${hot ? '#F5A623' : '#FFD66B'}" stroke-width="${hot ? 4 : 3}" stroke-linecap="round" opacity=".85">${rays}</g>`)}
      <circle cx="${x}" cy="${y}" r="${r + 6}" fill="#FFE9A8" opacity=".5"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#hm-sun)"/>`;
  }

  function cloud(x, y, s, d) {
    return anim('a-drift', at(x, y, s, `<g fill="#fff" opacity=".92">
      <ellipse cx="0" cy="0" rx="30" ry="14"/><circle cx="-14" cy="-6" r="13"/><circle cx="6" cy="-12" r="16"/><circle cx="22" cy="-4" r="11"/></g>`), d);
  }

  function stars(seed, n, maxY) {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = (r() * 400).toFixed(0), y = (r() * (maxY || 180)).toFixed(0);
      const big = r() > 0.82;
      const d = -(r() * 4).toFixed(2);
      out += big
        ? anim('a-twinkle', `<path transform="translate(${x} ${y})" d="M0-6l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#FFF3C9"/>`, d)
        : anim('a-twinkle', `<circle cx="${x}" cy="${y}" r="${(0.8 + r() * 1.4).toFixed(1)}" fill="#FFF8E1"/>`, d);
    }
    return out;
  }

  // Handa Mama himself: a sleepy crescent moon
  function moon(x, y, s, awake) {
    const id = uid('mm');
    return at(x, y, s, `<defs><mask id="${id}"><rect x="-60" y="-60" width="120" height="120" fill="#fff"/><circle cx="18" cy="-14" r="30" fill="#000"/></mask></defs>
      <circle r="44" fill="#FFE9A8" opacity=".18"/>
      <circle r="36" fill="url(#hm-moon)" mask="url(#${id})"/>
      ${awake
        ? `<g class="a-blink"><ellipse cx="-20" cy="0" rx="3" ry="3.6" fill="#7A4A1C"/></g>`
        : `<path d="M-26 0q5 4.5 10 0" fill="none" stroke="#7A4A1C" stroke-width="2.6" stroke-linecap="round"/>`}
      <path d="M-20 13q6 6 13 2" fill="none" stroke="#7A4A1C" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="-27" cy="9" r="4.5" fill="${C.cheek}" opacity=".5"/>`);
  }

  function hills(kind) {
    const night = kind === 'night', eve = kind === 'evening', hot = kind === 'hot';
    const h1 = night ? '#2F4766' : eve ? '#C9B07A' : hot ? '#D9C27E' : C.hill1;
    const h2 = night ? '#26405A' : eve ? '#AFA16C' : hot ? '#CBB06A' : C.hill2;
    return `<path d="M0 190 Q60 150 130 172 T260 165 T400 170 V300 H0Z" fill="${h1}"/>
      <path d="M0 205 Q90 178 180 198 T400 190 V300 H0Z" fill="${h2}"/>`;
  }

  function ground(kind, y) {
    y = y || 228;
    const night = kind === 'night', eve = kind === 'evening', hot = kind === 'hot';
    const g1 = night ? '#2E5440' : eve ? '#8FA75A' : hot ? '#D7B46A' : C.grass;
    const g2 = night ? '#264836' : eve ? '#7C9550' : hot ? '#C9A35C' : C.grass2;
    let out = `<path d="M0 ${y} Q100 ${y - 8} 200 ${y} T400 ${y - 2} V300 H0Z" fill="${g1}"/>
      <path d="M0 ${y + 30} Q120 ${y + 20} 240 ${y + 32} T400 ${y + 26} V300 H0Z" fill="${g2}"/>`;
    if (hot) {
      out += `<g stroke="#A9814A" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7">
        <path d="M40 262l14 6 6 12M54 268l16-4"/><path d="M180 270l10-8 14 4M190 262l-2-10"/><path d="M300 258l12 8 4 14M312 266l14-6"/></g>`;
    }
    return out;
  }

  function grassTufts(seed, n, y0, kind) {
    const r = rng(seed);
    const col = kind === 'night' ? '#3D6A4F' : kind === 'hot' ? '#B89B55' : C.grass3;
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = (r() * 390 + 5).toFixed(0), y = (y0 + r() * 50).toFixed(0);
      out += anim('a-sway-sm', `<path d="M${x} ${y}q-3-10-8-14M${x} ${y}q0-12 1-17M${x} ${y}q4-9 9-12" stroke="${col}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, -(r() * 3).toFixed(2));
    }
    return out;
  }

  function flowers(seed, n, y0, colors) {
    const r = rng(seed);
    colors = colors || ['#F28CB1', '#FFD45C', '#FFFFFF', '#B79CF2'];
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = (r() * 380 + 10).toFixed(0), y = (y0 + r() * 46).toFixed(0);
      const c = colors[Math.floor(r() * colors.length)];
      out += anim('a-sway-sm', `<g transform="translate(${x} ${y})"><path d="M0 0v-9" stroke="#5E9E4A" stroke-width="1.6"/>
        <g fill="${c}"><circle cx="0" cy="-13" r="2.6"/><circle cx="-3.4" cy="-10" r="2.6"/><circle cx="3.4" cy="-10" r="2.6"/><circle cx="-2" cy="-6.6" r="2.4"/><circle cx="2" cy="-6.6" r="2.4"/></g>
        <circle cx="0" cy="-9.5" r="1.8" fill="#F5A623"/></g>`, -(r() * 3).toFixed(2));
    }
    return out;
  }

  /* ---------- trees & plants ---------- */

  function tree(x, y, s, opt) {
    opt = opt || {};
    const night = opt.night;
    const l1 = night ? '#2D5A40' : opt.bare ? 'none' : C.leaf1;
    const l2 = night ? '#356A4A' : C.leaf2;
    const l3 = night ? '#264D37' : C.leaf3;
    const trunk = night ? '#4A3426' : C.trunk;
    const crown = opt.bare
      ? `<g stroke="${trunk}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M0-60q-18-20-34-26M0-70q10-24 28-34M-14-78q-4-14 2-24M16-92l12-6"/></g>`
      : anim('a-sway', `<circle cx="-24" cy="-92" r="30" fill="${l3}"/><circle cx="24" cy="-96" r="32" fill="${l1}"/>
          <circle cx="0" cy="-122" r="34" fill="${l2}"/><circle cx="-6" cy="-88" r="28" fill="${l1}"/>
          <circle cx="12" cy="-130" r="10" fill="#fff" opacity=".12"/>`, opt.d);
    return at(x, y, s, `<path d="M-9 0q4-40 2-74h14q-4 34 2 74z" fill="${trunk}"/>
      <path d="M-14 0q8-4 14-2q6-2 14 2z" fill="${trunk}"/>${crown}`);
  }

  // big shady tree with roots (for napping under)
  function bigTree(x, y, s, opt) {
    opt = opt || {};
    const night = opt.night;
    return at(x, y, s, `<path d="M-22 0q10-50 6-110h32q-6 60 6 110z" fill="${night ? '#4A3426' : C.trunk}"/>
      <path d="M-34 0q14-12 24-8M38 0q-14-12-24-8" stroke="${night ? '#4A3426' : C.trunk}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M-4-40q6 10 2 24" stroke="${night ? '#3A291F' : C.trunk2}" stroke-width="3" fill="none"/>
      ${anim('a-sway', `<ellipse cx="-50" cy="-120" rx="48" ry="36" fill="${night ? '#264D37' : C.leaf3}"/>
        <ellipse cx="52" cy="-124" rx="50" ry="38" fill="${night ? '#2D5A40' : C.leaf1}"/>
        <ellipse cx="0" cy="-158" rx="62" ry="42" fill="${night ? '#356A4A' : C.leaf2}"/>
        <ellipse cx="-4" cy="-118" rx="44" ry="30" fill="${night ? '#2D5A40' : C.leaf1}"/>`, opt.d)}`);
  }

  function palm(x, y, s, d) {
    const frond = (r) => `<path transform="rotate(${r})" d="M0 0q30-16 58 4q-30-6-58 0z" fill="${C.leaf1}"/>`;
    return at(x, y, s, `<path d="M-5 0q-10-60 10-120l8 2q-18 58-6 118z" fill="#9C7650"/>
      <g transform="translate(6 -120)">${anim('a-sway', [-160, -120, -60, -20, 20, 200].map(frond).join('') +
      `<circle cx="-4" cy="6" r="6" fill="#8C6A3A"/><circle cx="5" cy="8" r="6" fill="#7A5A30"/>`, d)}</g>`);
  }

  function bush(x, y, s, col, d) {
    col = col || C.leaf2;
    return at(x, y, s, anim('a-sway-sm', `<circle cx="-16" cy="-12" r="16" fill="${C.leaf3}"/><circle cx="14" cy="-12" r="17" fill="${col}"/><circle cx="0" cy="-22" r="18" fill="${col}"/>`, d));
  }

  function rock(x, y, s) {
    return at(x, y, s, `<path d="M-60 0q-4-40 30-52q30-10 52 6q24 16 22 46z" fill="#A7A0A0"/>
      <path d="M-40-30q20-14 46-12" stroke="#C4BEBE" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  }

  function river(y, kind) {
    const c = kind === 'evening' ? '#7FA9C9' : C.water;
    return `<path d="M0 ${y} Q100 ${y - 10} 200 ${y} T400 ${y} V${y + 22} Q300 ${y + 30} 200 ${y + 22} T0 ${y + 22}Z" fill="${c}"/>
      ${anim('a-wave', `<path d="M30 ${y + 8}q10-4 20 0M140 ${y + 12}q10-4 20 0M260 ${y + 9}q10-4 20 0M350 ${y + 13}q10-4 20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>`)}`;
  }

  function birds(seed, n, region) {
    const r = rng(seed);
    region = region || [40, 360, 30, 110];
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = (region[0] + r() * (region[1] - region[0])).toFixed(0);
      const y = (region[2] + r() * (region[3] - region[2])).toFixed(0);
      out += anim('a-fly', `<g transform="translate(${x} ${y})">${anim('a-flap', `<path d="M-8 0q4-6 8 0q4-6 8 0" stroke="#4A4A5A" stroke-width="2" fill="none" stroke-linecap="round"/>`, -(r() * 1).toFixed(2))}</g>`, -(r() * 8).toFixed(2));
    }
    return out;
  }

  function butterfly(x, y, s, col, d) {
    col = col || '#F7B733';
    return anim('a-float', at(x, y, s, `${anim('a-flutter', `<path d="M0 0q-16-18-20-4q-2 10 20 4z" fill="${col}"/><path d="M0 0q-12 14-16 6q0-8 16-6z" fill="${col}" opacity=".85"/>`)}
      ${anim('a-flutter2', `<path d="M0 0q16-18 20-4q2 10-20 4z" fill="${col}"/><path d="M0 0q12 14 16 6q0-8-16-6z" fill="${col}" opacity=".85"/>`)}
      <rect x="-1.2" y="-8" width="2.4" height="14" rx="1.2" fill="#3A2E26"/>`), d);
  }

  function zzz(x, y, s, d) {
    return at(x, y, s || 1, `${anim('a-zzz', `<text x="0" y="0" font-size="16" font-weight="700" fill="#5A6AA8" font-family="Gemunu Libre, sans-serif">z</text>`, d || 0)}
      ${anim('a-zzz', `<text x="8" y="-10" font-size="20" font-weight="700" fill="#5A6AA8" font-family="Gemunu Libre, sans-serif">z</text>`, (d || 0) - 0.8)}
      ${anim('a-zzz', `<text x="18" y="-22" font-size="24" font-weight="700" fill="#5A6AA8" font-family="Gemunu Libre, sans-serif">Z</text>`, (d || 0) - 1.6)}`);
  }

  function sparkle(x, y, s, col, d) {
    return anim('a-twinkle', `<path transform="translate(${x} ${y}) scale(${s || 1})" d="M0-10l2.6 7.4 7.4 2.6-7.4 2.6-2.6 7.4-2.6-7.4-7.4-2.6 7.4-2.6z" fill="${col || '#FFD45C'}"/>`, d);
  }

  function heart(x, y, s, d) {
    return anim('a-rise', `<path transform="translate(${x} ${y}) scale(${s || 1})" d="M0 6c-8-6-14-10-14-16a7 7 0 0 1 14-3a7 7 0 0 1 14 3c0 6-6 10-14 16z" fill="#F2667A"/>`, d);
  }

  function sweat(x, y, d) {
    return anim('a-drip', `<path transform="translate(${x} ${y})" d="M0 0q-4 6 0 9q4-3 0-9z" fill="#8CC6EC"/>`, d);
  }

  /* ---------- animals ---------- */

  // little mouse; opt: {grandma, sleep, happy, swim, color}
  function mouse(opt) {
    opt = opt || {};
    const c = opt.color || (opt.grandma ? '#9E9088' : '#A68A73');
    const light = opt.grandma ? '#E2DAD2' : '#EAD7C3';
    const eyes = opt.sleep
      ? `<path d="M16.5-30q2.5 2.5 5 0" stroke="#2B1E16" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
      : `<g class="a-blink"><ellipse cx="19" cy="-30" rx="2.3" ry="2.8" fill="#2B1E16"/><circle cx="19.8" cy="-31" r=".8" fill="#fff"/></g>`;
    const grandma = opt.grandma
      ? `<path d="M-17-24q17 14 32 0q2 10-2 16q-14 8-28 0q-4-6-2-16z" fill="#7B5BA6"/>
         <path d="M-15-22q15 10 28 0" stroke="#9D80C6" stroke-width="2" fill="none"/>
         <circle cx="19" cy="-30" r="4.6" fill="none" stroke="#5A4630" stroke-width="1.3"/><path d="M14.6-31h-6" stroke="#5A4630" stroke-width="1.3"/>
         <path d="M8-40q5-5 10-1" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      : '';
    const mouth = opt.happy
      ? `<path d="M22-21q4 4 8 0" stroke="#2B1E16" stroke-width="1.4" fill="#C9505E" stroke-linecap="round"/>`
      : `<path d="M23-21q3 2.5 6 0" stroke="#2B1E16" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
    return `<g>${anim('a-tail', `<path d="M-15-8q-18 2-24-8q-6-10 4-14" stroke="#D9A6A0" stroke-width="2.6" fill="none" stroke-linecap="round"/>`)}
      ${anim('a-breathe', `<ellipse cx="0" cy="-16" rx="18" ry="15" fill="${c}"/><ellipse cx="5" cy="-12" rx="10" ry="9" fill="${light}"/>`)}
      <ellipse cx="-7" cy="-1.5" rx="6" ry="3" fill="${c}"/><ellipse cx="8" cy="-1.5" rx="6" ry="3" fill="${c}"/>
      <circle cx="21" cy="-41" r="7.5" fill="${c}"/><circle cx="21" cy="-41" r="4.6" fill="#F2B3BB"/>
      <circle cx="14" cy="-28" r="12" fill="${c}"/><ellipse cx="25" cy="-25" rx="7.5" ry="6" fill="${c}"/>
      <circle cx="6" cy="-40" r="8" fill="${c}"/><circle cx="6" cy="-40" r="5" fill="#F2B3BB"/>
      <circle cx="31.5" cy="-26.5" r="2.7" fill="#E57C8A"/>
      <circle cx="16" cy="-22" r="3.2" fill="${C.cheek}" opacity=".5"/>
      ${eyes}${mouth}
      <g stroke="#6E5A4A" stroke-width=".8" opacity=".6"><path d="M29-24l9-2M29-23l9 2"/></g>${grandma}</g>`;
  }

  // lion; opt: {sleep, lying, mood:'proud'|'roar'|'laugh'|'worried'|'smile'}
  function lion(opt) {
    opt = opt || {};
    const mood = opt.mood || 'proud';
    const lying = opt.lying || opt.sleep;
    const hy = lying ? 22 : 0;
    const scallops = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return `<circle cx="${(30 + Math.cos(a) * 29).toFixed(1)}" cy="${(-70 + hy + Math.sin(a) * 29).toFixed(1)}" r="11"/>`;
    }).join('');
    let eyes, mouth;
    if (opt.sleep) {
      eyes = `<path d="M23-71q4 3.5 8 0M37-71q4 3.5 8 0" stroke="#4A2A14" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      mouth = `<path d="M30-56q4 3 8 0" stroke="#4A2A14" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    } else {
      eyes = `<g class="a-blink"><ellipse cx="27" cy="-72" rx="2.8" ry="3.4" fill="#2B1E16"/><ellipse cx="41" cy="-72" rx="2.8" ry="3.4" fill="#2B1E16"/></g>`;
      if (mood === 'worried') eyes += `<path d="M22-80l9 2M46-80l-9 2" stroke="#7A4A1C" stroke-width="2" stroke-linecap="round"/>`;
      if (mood === 'proud') eyes += `<path d="M22-79l9-1M46-79l-9-1" stroke="#7A4A1C" stroke-width="2" stroke-linecap="round"/>`;
      mouth = {
        roar: `<path d="M26-58q8 14 16 0z" fill="#7A2E2A"/><path d="M28-58h12" stroke="#fff" stroke-width="2"/>`,
        laugh: `<path d="M27-58q7 10 14 0z" fill="#7A2E2A"/>`,
        worried: `<path d="M29-53q5-4 10 0" stroke="#4A2A14" stroke-width="2" fill="none" stroke-linecap="round"/>`,
        smile: `<path d="M28-57q6 6 12 0" stroke="#4A2A14" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
        proud: `<path d="M29-56q5 3 10 0" stroke="#4A2A14" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      }[mood] || '';
    }
    const legs = lying
      ? `<ellipse cx="44" cy="-6" rx="20" ry="7" fill="#E3A846"/><ellipse cx="22" cy="-5" rx="18" ry="7" fill="#D99B3A"/>`
      : `<g fill="#D99B3A"><rect x="-36" y="-30" width="13" height="30" rx="6"/><rect x="-18" y="-30" width="13" height="30" rx="6"/><rect x="8" y="-34" width="13" height="34" rx="6"/><rect x="24" y="-34" width="13" height="34" rx="6"/></g>
         <g fill="#E3A846"><ellipse cx="-29" cy="-2" rx="9" ry="4"/><ellipse cx="-11" cy="-2" rx="9" ry="4"/><ellipse cx="15" cy="-2" rx="9" ry="4"/><ellipse cx="31" cy="-2" rx="9" ry="4"/></g>`;
    return `<g>${anim('a-tail', `<path d="M-42 ${-40 + hy}q-24 4-26-18" stroke="#D99B3A" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="-68" cy="${-60 + hy}" r="7" fill="#A85A22"/>`)}
      ${anim('a-breathe', `<ellipse cx="-4" cy="${lying ? -18 : -40}" rx="44" ry="${lying ? 19 : 26}" fill="#E3A846"/><ellipse cx="0" cy="${lying ? -12 : -30}" rx="30" ry="10" fill="#F0BE5A" opacity=".6"/>`)}
      ${legs}
      <g transform="translate(0 0)"><g fill="#A85A22">${scallops}</g><circle cx="30" cy="${-70 + hy}" r="30" fill="#B8692A"/>
      <g transform="translate(0 ${hy})"><circle cx="20" cy="-89" r="7" fill="#F0BE5A"/><circle cx="46" cy="-90" r="7" fill="#F0BE5A"/>
      <circle cx="20" cy="-89" r="3.5" fill="#D9894A"/><circle cx="46" cy="-90" r="3.5" fill="#D9894A"/>
      <circle cx="34" cy="-68" r="21" fill="#F0BE5A"/>
      <circle cx="29" cy="-58" r="7" fill="#FBE3A6"/><circle cx="39" cy="-58" r="7" fill="#FBE3A6"/>
      <circle cx="22" cy="-62" r="4" fill="${C.cheek}" opacity=".4"/><circle cx="46" cy="-62" r="4" fill="${C.cheek}" opacity=".4"/>
      ${eyes}<path d="M30-65h8l-4 5z" fill="#6B3A1E"/>${mouth}</g></g></g>`;
  }

  // hare; opt: {sleep, mood:'smug'|'sad'|'happy', run}
  function hare(opt) {
    opt = opt || {};
    const mood = opt.mood || 'happy';
    const sad = mood === 'sad';
    const ears = sad
      ? `<ellipse cx="2" cy="-58" rx="5" ry="16" transform="rotate(-60 2 -58)" fill="#EDE6DC"/><ellipse cx="2" cy="-58" rx="2.5" ry="11" transform="rotate(-60 2 -58)" fill="#F2B3BB"/>`
      : anim('a-ears', `<ellipse cx="10" cy="-76" rx="5.5" ry="18" transform="rotate(-10 10 -76)" fill="#EDE6DC"/><ellipse cx="10" cy="-76" rx="2.8" ry="13" transform="rotate(-10 10 -76)" fill="#F2B3BB"/>
         <ellipse cx="22" cy="-77" rx="5.5" ry="18" transform="rotate(12 22 -77)" fill="#F4EFE8"/><ellipse cx="22" cy="-77" rx="2.8" ry="13" transform="rotate(12 22 -77)" fill="#F2B3BB"/>`);
    let eyes;
    if (opt.sleep) eyes = `<path d="M18-51q3 3 6 0" stroke="#2B1E16" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    else if (mood === 'smug') eyes = `<path d="M17.5-51h6" stroke="#2B1E16" stroke-width="2.4" stroke-linecap="round"/><path d="M16-56l8 1" stroke="#7A6A5A" stroke-width="1.6" stroke-linecap="round"/>`;
    else eyes = `<g class="a-blink"><ellipse cx="21" cy="-51" rx="2.4" ry="3" fill="#2B1E16"/><circle cx="21.8" cy="-52" r=".8" fill="#fff"/></g>${sad ? '<path d="M17-57l7 2" stroke="#7A6A5A" stroke-width="1.6" stroke-linecap="round"/>' : ''}`;
    const mouth = mood === 'smug' ? `<path d="M23-43q5 4 9-1" stroke="#2B1E16" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
      : sad ? `<path d="M24-41q3-3 6 0" stroke="#2B1E16" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
      : `<path d="M24-43q3 3 6 0" stroke="#2B1E16" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    const headY = sad ? 6 : 0;
    const body = opt.run
      ? `<ellipse cx="0" cy="-26" rx="28" ry="16" fill="#F4EFE8"/><ellipse cx="-24" cy="-8" rx="16" ry="5" fill="#EDE6DC" transform="rotate(20 -24 -8)"/><ellipse cx="24" cy="-10" rx="12" ry="4.5" fill="#EDE6DC" transform="rotate(-25 24 -10)"/>`
      : `<ellipse cx="0" cy="-24" rx="22" ry="22" fill="#F4EFE8"/><ellipse cx="4" cy="-18" rx="12" ry="12" fill="#fff"/><ellipse cx="8" cy="-3" rx="15" ry="5" fill="#EDE6DC"/><ellipse cx="-10" cy="-3" rx="12" ry="4.5" fill="#EDE6DC"/>`;
    return `<g><circle cx="-20" cy="-20" r="7.5" fill="#fff"/>${anim(opt.sleep ? 'a-breathe' : 'a-none', body)}
      <g transform="translate(0 ${headY})">${ears}<circle cx="16" cy="-48" r="14" fill="#F4EFE8"/><ellipse cx="25" cy="-45" rx="7" ry="6" fill="#F4EFE8"/>
      <circle cx="29.5" cy="-46.5" r="2.2" fill="#E57C8A"/><circle cx="15" cy="-43" r="3.4" fill="${C.cheek}" opacity=".45"/>${eyes}${mouth}
      <g stroke="#8A7A6A" stroke-width=".8" opacity=".6"><path d="M28-44l9-2M28-43l9 2"/></g></g></g>`;
  }

  // tortoise; opt: {walk, mood:'calm'|'happy'|'tired'}
  function tortoise(opt) {
    opt = opt || {};
    const legs = `<ellipse cx="-20" cy="-4" rx="7" ry="6" fill="#8DB36A"/><ellipse cx="20" cy="-4" rx="7" ry="6" fill="#8DB36A"/>`;
    const legs2 = `<ellipse cx="-8" cy="-3" rx="7" ry="6" fill="#7FA35E"/><ellipse cx="8" cy="-3" rx="7" ry="6" fill="#7FA35E"/>`;
    const hexes = `<g fill="none" stroke="#476E2B" stroke-width="1.6"><path d="M-8-38l8-5 8 5v9l-8 5-8-5z"/><path d="M-24-24l7-4 8 4v8l-8 4-7-4z"/><path d="M9-24l8-4 7 4v8l-7 4-8-4z"/><path d="M-8-16l8-4 8 4"/></g>`;
    const eyes = opt.mood === 'tired'
      ? `<path d="M42-22h5" stroke="#2B1E16" stroke-width="1.8" stroke-linecap="round"/>`
      : `<g class="a-blink"><ellipse cx="44.5" cy="-22" rx="2" ry="2.5" fill="#2B1E16"/></g>`;
    const mouth = opt.mood === 'happy'
      ? `<path d="M42-15q4 4 8 0" stroke="#2B1E16" stroke-width="1.5" fill="#C9505E" stroke-linecap="round"/>`
      : `<path d="M43-15q3 2 6 0" stroke="#2B1E16" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    return `<g>${opt.walk ? anim('a-walk1', legs) + anim('a-walk2', legs2) : legs + legs2}
      <path d="M-36-8l-8 3 8 1z" fill="#7FA35E"/>
      ${anim(opt.walk ? 'a-plod' : 'a-none', `<path d="M-32-8Q-30-48 0-50Q30-48 32-8Z" fill="#5E8C3A"/>${hexes}
      <path d="M-34-11h68v6a3 3 0 0 1-3 3h-62a3 3 0 0 1-3-3z" fill="#8C6A3F"/>
      <path d="M-20-40q14-10 30-6" stroke="#7FAE52" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M28-14q6-8 12-6" stroke="#8DB36A" stroke-width="9" fill="none" stroke-linecap="round"/>
      <circle cx="42" cy="-20" r="10" fill="#8DB36A"/><circle cx="40" cy="-15" r="2.6" fill="${C.cheek}" opacity=".5"/>${eyes}${mouth}`)}</g>`;
  }

  // fox; opt: {pose:'stand'|'jump'|'sit', mood:'hungry'|'happy'|'angry'|'tired'}
  function fox(opt) {
    opt = opt || {};
    const pose = opt.pose || 'stand';
    const mood = opt.mood || 'hungry';
    const sit = pose === 'sit';
    const head = (hx, hy) => {
      let eyes = `<g class="a-blink"><ellipse cx="${hx + 6}" cy="${hy - 2}" rx="2.4" ry="2.9" fill="#2B1E16"/></g>`;
      if (mood === 'angry') eyes += `<path d="M${hx + 1} ${hy - 8}l9 3" stroke="#5A2A10" stroke-width="2" stroke-linecap="round"/>`;
      if (mood === 'tired' || mood === 'sleep') eyes = `<path d="M${hx + 3} ${hy - 2}q3 3 6 0" stroke="#2B1E16" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      const mouth = mood === 'tired'
        ? `<path d="M${hx + 18} ${hy + 6}q2 6 -2 7q-3-1-1-6z" fill="#E57C8A"/>`
        : mood === 'happy' ? `<path d="M${hx + 12} ${hy + 6}q4 3 8 0" stroke="#2B1E16" stroke-width="1.4" fill="none"/>`
        : mood === 'angry' ? `<path d="M${hx + 12} ${hy + 8}q4-3 8 0" stroke="#2B1E16" stroke-width="1.4" fill="none"/>` : '';
      return `<path d="M${hx - 8} ${hy - 8}l2-18 10 12z" fill="#D86A2C"/><path d="M${hx + 2} ${hy - 10}l6-17 7 15z" fill="#E07A3A"/>
        <path d="M${hx - 5} ${hy - 11}l1.5-9 5 6z" fill="#5A2A10"/><path d="M${hx + 5} ${hy - 12}l3.5-8 3.5 7z" fill="#5A2A10"/>
        <circle cx="${hx}" cy="${hy}" r="13" fill="#E07A3A"/>
        <path d="M${hx + 4} ${hy - 4}q12 2 18 6q-8 6-20 6z" fill="#E07A3A"/><path d="M${hx - 4} ${hy + 4}q12 2 26 2q-10 8-22 4z" fill="#FFF4E8"/>
        <circle cx="${hx + 22}" cy="${hy + 1}" r="3" fill="#2B1E16"/>${eyes}${mouth}
        <circle cx="${hx + 2}" cy="${hy + 5}" r="3" fill="${C.cheek}" opacity=".4"/>`;
    };
    if (sit) {
      return `<g>${anim('a-tail', `<path d="M-14-6q-40 6-36-26q14 8 30 6z" fill="#E07A3A"/><path d="M-44-22q-6-8-6-12q8 4 10 8z" fill="#FFF4E8"/>`)}
        <ellipse cx="0" cy="-26" rx="18" ry="26" fill="#E07A3A"/><ellipse cx="6" cy="-28" rx="9" ry="16" fill="#FFF4E8"/>
        <rect x="-2" y="-18" width="7" height="18" rx="3.5" fill="#5A2A10"/><rect x="8" y="-18" width="7" height="18" rx="3.5" fill="#5A2A10"/>
        <ellipse cx="-10" cy="-3" rx="12" ry="5" fill="#D86A2C"/>${head(8, -58)}</g>`;
    }
    const body = `${anim('a-tail', `<path d="M-20-32q-30-4-42-22q20 2 40 10z" fill="#E07A3A"/><path d="M-56-50q-8-4-8-6q8 0 12 4z" fill="#FFF4E8"/>`)}
      <ellipse cx="0" cy="-32" rx="25" ry="15" fill="#E07A3A"/><ellipse cx="14" cy="-28" rx="10" ry="9" fill="#FFF4E8"/>`;
    const legs = pose === 'jump'
      ? `<g fill="#5A2A10"><rect x="-26" y="-26" width="6" height="22" rx="3" transform="rotate(40 -23 -26)"/><rect x="-14" y="-24" width="6" height="22" rx="3" transform="rotate(30 -11 -24)"/>
         <rect x="10" y="-30" width="6" height="22" rx="3" transform="rotate(-40 13 -30)"/><rect x="18" y="-32" width="6" height="22" rx="3" transform="rotate(-50 21 -32)"/></g>`
      : `<g fill="#5A2A10"><rect x="-18" y="-22" width="6" height="22" rx="3"/><rect x="-8" y="-22" width="6" height="22" rx="3"/><rect x="8" y="-22" width="6" height="22" rx="3"/><rect x="17" y="-22" width="6" height="22" rx="3"/></g>`;
    return `<g>${legs}${body}${head(28, -52)}</g>`;
  }

  // crow; opt: {pose:'stand'|'fly'|'drink', pebble, mood:'thirsty'|'happy'|'idea'}
  function crow(opt) {
    opt = opt || {};
    const pose = opt.pose || 'stand';
    const fly = pose === 'fly';
    const drink = pose === 'drink';
    const wing = fly
      ? anim('a-flap-big', `<path d="M-6-28q-10-36 24-40q-6 20 0 36z" fill="#22283A"/>`)
      : `<path d="M-14-28q12-10 26-2q-8 14-28 10z" fill="#22283A"/>`;
    const headRot = drink ? 50 : 0;
    const eye = opt.mood === 'thirsty'
      ? `<path d="M17-39h5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`
      : `<g class="a-blink"><circle cx="19" cy="-38" r="3" fill="#fff"/><circle cx="19.8" cy="-38" r="1.7" fill="#1A1A22"/></g>`;
    const beak = opt.mood === 'thirsty'
      ? `<path d="M24-38l14 2-14 2z" fill="#9A9A9A"/><path d="M24-34l12 3-12-1z" fill="#7A7A7A"/>`
      : `<path d="M24-39l15 4-15 3z" fill="#9A9A9A"/>`;
    return `<g>${fly ? '' : `<g stroke="#5A5A5A" stroke-width="2" stroke-linecap="round"><path d="M-2-12v12M6-12v12M-5 0h6M3 0h6"/></g>`}
      <path d="M-16-26l-20 4 20 6z" fill="#22283A"/>
      ${anim(fly ? 'a-none' : 'a-breathe', `<ellipse cx="0" cy="-24" rx="18" ry="13" fill="#2E3448"/>`)}${wing}
      <g transform="rotate(${headRot} 8 -30)"><circle cx="16" cy="-36" r="10" fill="#2E3448"/><circle cx="12" cy="-40" r="3" fill="#4A5270" opacity=".6"/>${beak}${eye}
      ${opt.pebble ? `<ellipse cx="36" cy="-34" rx="4.5" ry="3.6" fill="#B9B2A8"/>` : ''}</g>
      ${opt.mood === 'idea' ? sparkle(30, -62, 1.2, '#FFD45C') + sparkle(44, -50, 0.7, '#FFD45C', -0.6) : ''}</g>`;
  }

  // clay pot with water you can see (level 0..1, pebbles = count)
  function pot(level, pebbles, opt) {
    opt = opt || {};
    const id = uid('pot');
    const shape = 'M-18-70L18-70L16-62Q36-52 33-28Q30-3 0 0Q-30-3-33-28Q-36-52-16-62Z';
    const wy = (-6 - level * 60).toFixed(1);
    const r = rng(7);
    let stones = '';
    for (let i = 0; i < pebbles; i++) {
      const row = Math.floor(i / 5), col = i % 5;
      stones += `<ellipse cx="${(-22 + col * 11 + (row % 2) * 5 + r() * 2).toFixed(1)}" cy="${(-6 - row * 7).toFixed(1)}" rx="5.5" ry="4.2" fill="${['#B9B2A8', '#A39C93', '#CFC8BD'][i % 3]}"/>`;
    }
    return `<g data-pot><defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs>
      <ellipse cx="0" cy="1" rx="34" ry="5" fill="#000" opacity=".12"/>
      <path d="${shape}" fill="#C9683E"/>
      <g clip-path="url(#${id})"><rect class="pot-water" x="-40" y="${wy}" width="80" height="90" fill="${C.water}" opacity=".88"/>
        ${anim('a-wave', `<path class="pot-wave" d="M-40 ${wy}q10-3 20 0t20 0t20 0t20 0" stroke="#BDE3F7" stroke-width="2" fill="none"/>`)}
        <g class="pot-stones">${stones}</g></g>
      <path d="M-26-48q-4 18 4 36" stroke="#E08B5E" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M-20-70h40v-6h-40z" fill="#A9532F"/><path d="${shape}" fill="none" stroke="#A9532F" stroke-width="2"/>
      <g stroke="#E8A070" stroke-width="2" fill="none" opacity=".7"><path d="M-30-36q30 8 60 0"/></g></g>`;
  }

  function pebblePile(x, y, n, tap) {
    const r = rng(3);
    let out = '';
    for (let i = 0; i < n; i++) {
      out += `<ellipse cx="${(x + (r() - 0.5) * 50).toFixed(1)}" cy="${(y - r() * 10).toFixed(1)}" rx="6" ry="4.5" fill="${['#B9B2A8', '#A39C93', '#CFC8BD'][i % 3]}" stroke="#8C857C" stroke-width=".8"/>`;
    }
    return `<g${tap ? ` data-tap="${tap}" class="tappable"` : ''}>${out}</g>`;
  }

  function monkey(opt) {
    opt = opt || {};
    return `<g>${anim('a-tail', `<path d="M-10-10q-26 6-24 26q2 10 10 8" stroke="#7A5235" stroke-width="5" fill="none" stroke-linecap="round"/>`)}
      <ellipse cx="0" cy="-20" rx="16" ry="20" fill="#8C6239"/><ellipse cx="3" cy="-16" rx="9" ry="12" fill="#D9B48A"/>
      <circle cx="-10" cy="-48" r="7" fill="#8C6239"/><circle cx="18" cy="-48" r="7" fill="#8C6239"/><circle cx="-10" cy="-48" r="3.6" fill="#D9B48A"/><circle cx="18" cy="-48" r="3.6" fill="#D9B48A"/>
      <circle cx="4" cy="-48" r="15" fill="#8C6239"/><ellipse cx="5" cy="-44" rx="10" ry="9" fill="#D9B48A"/>
      <g class="a-blink"><circle cx="0" cy="-49" r="2.2" fill="#2B1E16"/><circle cx="10" cy="-49" r="2.2" fill="#2B1E16"/></g>
      <path d="M1-40q4 3 8 0" stroke="#2B1E16" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      ${anim('a-munch', `<path d="M14-24q10-8 14-2" stroke="#8C6239" stroke-width="6" fill="none" stroke-linecap="round"/><g fill="${C.gold}"><circle cx="28" cy="-28" r="3.4"/><circle cx="32" cy="-24" r="3.4"/><circle cx="26" cy="-22" r="3.4"/></g>`)}</g>`;
  }

  function bear(col, flip) {
    const dark = col === 'white' ? '#D9D4CC' : '#6E4A2E';
    const c = col === 'white' ? '#F4F1EC' : '#8A5E3C';
    return `<g transform="scale(${flip ? -1 : 1} 1)"><ellipse cx="0" cy="-50" rx="30" ry="44" fill="${c}"/><ellipse cx="4" cy="-44" rx="16" ry="26" fill="${dark}" opacity=".5"/>
      <rect x="-20" y="-16" width="14" height="16" rx="6" fill="${c}"/><rect x="6" y="-16" width="14" height="16" rx="6" fill="${c}"/>
      <path d="M18-70q24-10 30-30" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M-18-70q-16-12-8-30" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/>
      <circle cx="-8" cy="-112" r="8" fill="${c}"/><circle cx="20" cy="-112" r="8" fill="${c}"/>
      <circle cx="6" cy="-98" r="20" fill="${c}"/><ellipse cx="16" cy="-92" rx="10" ry="8" fill="${dark}"/>
      <circle cx="23" cy="-94" r="3" fill="#2B1E16"/><g class="a-blink"><circle cx="8" cy="-102" r="2.6" fill="#2B1E16"/></g>
      <path d="M2-108l10 3" stroke="#2B1E16" stroke-width="2" stroke-linecap="round"/></g>`;
  }

  function elephant(opt) {
    opt = opt || {};
    return `<g>${anim('a-tail', `<path d="M-44-50q-10 10-6 22" stroke="#8E8A92" stroke-width="3" fill="none"/>`)}
      <g fill="#8E8A92"><rect x="-38" y="-40" width="16" height="40" rx="7"/><rect x="-14" y="-40" width="16" height="40" rx="7"/><rect x="14" y="-40" width="16" height="40" rx="7"/><rect x="32" y="-40" width="14" height="40" rx="7"/></g>
      <ellipse cx="0" cy="-56" rx="46" ry="30" fill="#9E9AA2"/>
      <path d="M-30-80h56l6 34h-68z" fill="#B8322E"/><path d="M-36-46h68" stroke="${C.gold}" stroke-width="4"/><g fill="${C.gold}"><circle cx="-20" cy="-60" r="3"/><circle cx="0" cy="-60" r="3"/><circle cx="20" cy="-60" r="3"/></g>
      <circle cx="44" cy="-70" r="24" fill="#9E9AA2"/><ellipse cx="34" cy="-70" rx="14" ry="20" fill="#8E8A92"/>
      ${anim('a-trunk', `<path d="M60-62q14 16 8 40q-2 8 6 10" stroke="#9E9AA2" stroke-width="12" fill="none" stroke-linecap="round"/>`)}
      <path d="M58-58q8 4 12 0" stroke="#F4F1EC" stroke-width="4" stroke-linecap="round"/>
      <g class="a-blink"><circle cx="52" cy="-76" r="2.8" fill="#2B1E16"/></g>
      <path d="M40-94q8-8 18-2l-4 10q-8-4-14 0z" fill="#B8322E"/><circle cx="50" cy="-92" r="3" fill="${C.gold}"/></g>`;
  }

  function horse() {
    return `<g><g fill="#7A4E2E"><rect x="-30" y="-36" width="8" height="36" rx="4"/><rect x="-16" y="-36" width="8" height="36" rx="4"/><rect x="12" y="-36" width="8" height="36" rx="4"/><rect x="24" y="-36" width="8" height="36" rx="4"/></g>
      ${anim('a-tail', `<path d="M-34-52q-16 6-12 30" stroke="#3A2A20" stroke-width="7" fill="none" stroke-linecap="round"/>`)}
      <ellipse cx="0" cy="-48" rx="36" ry="17" fill="#9A633A"/><path d="M24-54l14-30 12 4-8 30z" fill="#9A633A"/>
      <ellipse cx="48" cy="-80" rx="15" ry="9" transform="rotate(25 48 -80)" fill="#9A633A"/><path d="M30-82l12-12 4 8z" fill="#3A2A20"/>
      <path d="M26-80q6-18 14-14l-6 24z" fill="#3A2A20"/><circle cx="44" cy="-84" r="2.2" fill="#2B1E16"/></g>`;
  }

  /* ---------- people ---------- */

  // king; opt: {pose:'sit'|'stand', hand:'up'|'chin'|'open', mood:'smile'|'think'|'happy'}
  function king(opt) {
    opt = opt || {};
    const mood = opt.mood || 'smile';
    const arm = {
      up: `<path d="M16-62q14-6 18-24" stroke="#B8322E" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="35" cy="-89" r="6" fill="${C.skin}"/>`,
      chin: `<path d="M16-62q14 2 2-14" stroke="#B8322E" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="12" cy="-76" r="6" fill="${C.skin}"/>`,
      open: `<path d="M16-62q18 6 26-4" stroke="#B8322E" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="44" cy="-68" r="6" fill="${C.skin}"/>`,
    }[opt.hand || 'open'];
    const eyes = mood === 'think'
      ? `<g class="a-blink"><circle cx="-5" cy="-91" r="2.2" fill="#2B1E16"/><circle cx="7" cy="-91" r="2.2" fill="#2B1E16"/></g><path d="M-9-97l7 1M11-97l-7 1" stroke="#2B1E16" stroke-width="1.6" stroke-linecap="round"/>`
      : mood === 'happy'
        ? `<path d="M-8-91q3-3 6 0M4-91q3-3 6 0" stroke="#2B1E16" stroke-width="2" fill="none" stroke-linecap="round"/>`
        : `<g class="a-blink"><circle cx="-5" cy="-91" r="2.2" fill="#2B1E16"/><circle cx="7" cy="-91" r="2.2" fill="#2B1E16"/></g>`;
    const mouth = mood === 'think' ? '' : `<path d="M-3-80q4 3 8 0" stroke="#7A2E2A" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    return `<g><path d="M-28 0L-20-70h40L28 0z" fill="#B8322E"/><path d="M-6-70h12l4 70h-20z" fill="${C.gold}"/>
      <path d="M-28 0h56" stroke="${C.gold}" stroke-width="5"/><g fill="#fff" opacity=".7"><circle cx="0" cy="-50" r="2"/><circle cx="0" cy="-36" r="2"/><circle cx="0" cy="-22" r="2"/></g>
      <path d="M-16-62q-14 10-8 26" stroke="#B8322E" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="-23" cy="-34" r="6" fill="${C.skin}"/>
      ${arm}<path d="M-14-72q14 8 28 0v-6h-28z" fill="${C.gold}"/>
      <circle cx="0" cy="-88" r="16" fill="${C.skin}"/><circle cx="-8" cy="-84" r="3.4" fill="${C.cheek}" opacity=".45"/><circle cx="10" cy="-84" r="3.4" fill="${C.cheek}" opacity=".45"/>
      ${eyes}<path d="M-8-83q4 3 8 0q4 3 8 0" stroke="#3A2A20" stroke-width="2.6" fill="none" stroke-linecap="round"/>${mouth}
      <path d="M-15-100h30l-3-26q-12-16-24 0z" fill="${C.gold}"/><path d="M-15-100h30v-5h-30z" fill="${C.gold2}"/>
      <circle cx="0" cy="-114" r="3.4" fill="#C9302C"/><circle cx="-8" cy="-106" r="2" fill="#2F7F79"/><circle cx="8" cy="-106" r="2" fill="#2F7F79"/>
      <path d="M0-136v-8" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/></g>`;
  }

  // Andare the clever jester; opt: {box:'closed'|'open'|null, mood:'smile'|'laugh'|'talk', bow}
  function andare(opt) {
    opt = opt || {};
    const mood = opt.mood || 'smile';
    const mouth = mood === 'laugh' ? `<path d="M-5-74q6 8 12 0z" fill="#7A2E2A"/>` : mood === 'talk' ? `<ellipse cx="1" cy="-73" rx="3.6" ry="2.6" fill="#7A2E2A"/>` : `<path d="M-5-75q6 6 12 0" stroke="#7A2E2A" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const hands = opt.box
      ? `<path d="M-14-56q4 14 14 16M14-56q-4 14-8 16" stroke="#3C8C6A" stroke-width="10" fill="none" stroke-linecap="round"/>`
      : `<path d="M-14-56q-12 10-10 24" stroke="#3C8C6A" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="-24" cy="-30" r="5.5" fill="${C.skin}"/>
         <path d="M14-56q16 0 22-16" stroke="#3C8C6A" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="37" cy="-74" r="5.5" fill="${C.skin}"/>`;
    return `<g transform="rotate(${opt.bow ? 8 : 0})"><path d="M-18 0l4-40h28l4 40z" fill="#F4EFE6"/><g stroke="#C9302C" stroke-width="2.4" opacity=".7"><path d="M-17-10h34M-16-20h32M-15-30h30"/></g>
      <path d="M-16-40l2-24h28l2 24z" fill="#3C8C6A"/><path d="M0-64v24" stroke="${C.gold}" stroke-width="2" stroke-dasharray="3 3"/>
      ${hands}<circle cx="0" cy="-82" r="15" fill="${C.skin}"/><circle cx="-7" cy="-76" r="3.4" fill="${C.cheek}" opacity=".5"/><circle cx="9" cy="-76" r="3.4" fill="${C.cheek}" opacity=".5"/>
      <g class="a-blink"><circle cx="-5" cy="-84" r="2.2" fill="#2B1E16"/><circle cx="7" cy="-84" r="2.2" fill="#2B1E16"/></g>
      <path d="M-7-79q4-3 7 0q4-3 8 0" stroke="#3A2A20" stroke-width="2.2" fill="none" stroke-linecap="round"/>${mouth}
      ${anim('a-wiggle', `<path d="M-17-90q2-18 17-20q15 2 17 20z" fill="#E8B83A"/><path d="M-17-90q17-6 34 0" stroke="#C9302C" stroke-width="5" fill="none"/>
      <path d="M0-110q10-12 20-6" stroke="#C9302C" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="21" cy="-115" r="4" fill="${C.gold}"/>`)}</g>`;
  }

  function child(col, hairCol, d) {
    return anim('a-hop', `<g><path d="M-10 0l2-16M10 0l-2-16" stroke="${C.skin2}" stroke-width="4" stroke-linecap="round"/>
      <path d="M-12-14l4-24h16l4 24z" fill="${col}"/><circle cx="0" cy="-46" r="10" fill="${C.skin}"/>
      <path d="M-10-48q2-12 10-12q10 0 10 12q-4-6-10-6t-10 6z" fill="${hairCol || '#2B1E16'}"/>
      <path d="M-4-43q4 4 8 0" stroke="#7A2E2A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="-3.5" cy="-48" r="1.5" fill="#2B1E16"/><circle cx="3.5" cy="-48" r="1.5" fill="#2B1E16"/></g>`, d);
  }

  /* ---------- places ---------- */

  function palaceInside() {
    return `<rect width="400" height="300" fill="#F4DFB8"/>
      <path d="M0 0h400v34H0z" fill="#8A3B2A"/><path d="M0 34h400" stroke="${C.gold}" stroke-width="5"/>
      <g fill="${C.gold}" opacity=".9">${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 20 + 10} 37l6 8-6 8-6-8z"/>`).join('')}</g>
      <path d="M0 34q50 60 90 0z" fill="#B8322E"/><path d="M400 34q-50 60-90 0z" fill="#B8322E"/>
      <g><rect x="34" y="40" width="22" height="200" fill="#FBF4E4"/><rect x="30" y="40" width="30" height="12" fill="#E2C690"/><rect x="30" y="228" width="30" height="12" fill="#E2C690"/>
        <rect x="344" y="40" width="22" height="200" fill="#FBF4E4"/><rect x="340" y="40" width="30" height="12" fill="#E2C690"/><rect x="340" y="228" width="30" height="12" fill="#E2C690"/></g>
      <path d="M0 236h400v64H0z" fill="#C99B64"/>
      <g stroke="#B5844F" stroke-width="2">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 50} 236l-30 64"/>`).join('')}<path d="M0 262h400"/></g>
      <path d="M90 236h220l20 64H70z" fill="#B8322E" opacity=".85"/><path d="M90 236h220" stroke="${C.gold}" stroke-width="3"/>`;
  }

  function throne(x, y) {
    return at(x, y, 1, `<path d="M-36 0v-60q0-50 36-60q36 10 36 60v60z" fill="${C.gold}"/><path d="M-26-10v-50q0-36 26-46q26 10 26 46v50z" fill="#C9302C"/>
      <circle cx="0" cy="-104" r="6" fill="#C9302C"/><rect x="-42" y="-14" width="84" height="14" rx="4" fill="${C.gold2}"/>`);
  }

  function palaceOutside(x, y, s) {
    return at(x, y, s, `<rect x="-90" y="-60" width="180" height="60" fill="#FBF4E4"/>
      <g fill="#E2C690">${[-70, -40, -10, 20, 50].map((px) => `<rect x="${px}" y="-56" width="14" height="56"/>`).join('')}</g>
      <path d="M-110-58l30-36h160l30 36z" fill="#8A3B2A"/><path d="M-70-94l18-26h104l18 26z" fill="#9C4430"/>
      <path d="M-110-58q-10 2-14-8M110-58q10 2 14-8M-70-94q-8 0-10-8M70-94q8 0 10-8" stroke="#8A3B2A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M-20 0v-34q20-16 40 0v34z" fill="#6B3A22"/><circle cx="0" cy="-128" r="5" fill="${C.gold}"/>`);
  }

  function mouseHouse(x, y, s, glow) {
    return at(x, y, s, `<path d="M-60 0q4-80 10-150h100q6 70 10 150z" fill="${C.trunk}"/>
      <path d="M-74 0q20-18 34-12M74 0q-20-18-34-12" stroke="${C.trunk}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M-22 0v-30a22 22 0 0 1 44 0v30z" fill="#C9563C"/><circle cx="12" cy="-16" r="2.6" fill="${C.gold}"/>
      <circle cx="28" cy="-70" r="11" fill="${glow ? '#FFD66B' : '#BFE3F2'}"/><path d="M28-81v22M17-70h22" stroke="${C.trunk2}" stroke-width="3"/>
      ${glow ? `<circle cx="28" cy="-70" r="20" fill="#FFD66B" opacity=".25"/>` : ''}
      <path d="M-30-110q8 10 4 24" stroke="${C.trunk2}" stroke-width="3" fill="none"/>`);
  }

  function homeInside(time) {
    const win = time === 'night' ? '#26355F' : time === 'evening' ? '#F7B27A' : '#A8D8F0';
    return `<rect width="400" height="300" fill="#EBC995"/><rect width="400" height="300" fill="#F4DFB8" opacity=".55"/>
      <path d="M0 0h400v18H0z" fill="#B88B5E"/>
      <circle cx="300" cy="96" r="44" fill="${win}"/>${time === 'night' ? `<g fill="#FFF3C9"><circle cx="286" cy="80" r="1.6"/><circle cx="318" cy="104" r="1.4"/><circle cx="296" cy="114" r="1.2"/></g>${moon(312, 84, 0.35, false)}` : time === 'evening' ? sun(300, 120, 14) : cloud(300, 96, 0.5, -2)}
      <circle cx="300" cy="96" r="44" fill="none" stroke="#8A5A3B" stroke-width="7"/><path d="M300 52v88M256 96h88" stroke="#8A5A3B" stroke-width="4"/>
      <path d="M0 232h400v68H0z" fill="#B88B5E"/><path d="M0 232h400" stroke="#9C7048" stroke-width="3"/>
      <ellipse cx="200" cy="262" rx="150" ry="18" fill="#C9563C" opacity=".8"/><ellipse cx="200" cy="262" rx="120" ry="12" fill="none" stroke="#E8B83A" stroke-width="2" stroke-dasharray="6 5"/>`;
  }

  // Sri Lankan brass oil lamp (pahana)
  function lamp(x, y, s) {
    return at(x, y, s, `<path d="M-12 0h24l-4-6h-16z" fill="${C.gold2}"/><path d="M-3-6v-18h6v18z" fill="${C.gold}"/>
      <path d="M-16-24q16 12 32 0z" fill="${C.gold}"/>
      ${anim('a-flame', `<path d="M0-26q-6-8 0-18q6 10 0 18z" fill="#FFB43A"/><path d="M0-27q-3-5 0-10q3 5 0 10z" fill="#FFF0B3"/>`)}
      ${anim('a-glow', `<circle cx="0" cy="-34" r="22" fill="#FFD66B" opacity=".25"/>`)}`);
  }

  function kavum(x, y, s) {
    return at(x, y, s, `<ellipse cx="0" cy="0" rx="26" ry="6" fill="#E9E1D2"/><g fill="#9A5A24"><ellipse cx="-10" cy="-6" rx="9" ry="6"/><ellipse cx="9" cy="-6" rx="9" ry="6"/><ellipse cx="0" cy="-12" rx="9" ry="6"/></g>
      <g fill="#6E3A12"><circle cx="-10" cy="-11" r="2.6"/><circle cx="9" cy="-11" r="2.6"/><circle cx="0" cy="-17" r="2.6"/></g>`);
  }

  function net(id, strands) {
    // strands: how many are still whole (0..6)
    let out = '';
    const lines = [
      'M-70-130q70 30 140 0', 'M-80-96q80 26 160 0', 'M-84-60q84 22 168 0', 'M-84-24q84 18 168 0',
      'M-50-140q-10 70 -30 140', 'M0-146v146', 'M50-140q10 70 30 140',
    ];
    lines.forEach((d, i) => {
      out += `<path class="net-strand" data-i="${i}" d="${d}" stroke="#8C6A3F" stroke-width="3.4" fill="none" stroke-linecap="round" ${i >= strands ? 'opacity="0"' : ''}/>`;
    });
    return `<g data-net="${id}">${out}</g>`;
  }

  function box(open, tap) {
    const inside = `<g class="box-inside" opacity="${open ? 1 : 0}">${anim('a-glow', `<circle cx="0" cy="-22" r="30" fill="#FFE29A" opacity=".55"/>`)}
      <circle cx="0" cy="-22" r="13" fill="#FFD66B"/><circle cx="-4.5" cy="-25" r="1.8" fill="#7A4A1C"/><circle cx="4.5" cy="-25" r="1.8" fill="#7A4A1C"/>
      <path d="M-7-19q7 8 14 0" stroke="#7A4A1C" stroke-width="2" fill="#C9505E" stroke-linecap="round"/><circle cx="-8" cy="-20" r="2.4" fill="${C.cheek}" opacity=".6"/><circle cx="8" cy="-20" r="2.4" fill="${C.cheek}" opacity=".6"/>
      ${sparkle(-22, -42, 0.8)}${sparkle(22, -46, 0.9, null, -0.7)}</g>`;
    return `<g${tap ? ` data-tap="${tap}" class="tappable"` : ''}>${inside}
      <rect x="-18" y="-18" width="36" height="18" rx="2" fill="#9A5A24"/><path d="M-18-12h36" stroke="${C.gold}" stroke-width="2"/>
      <g class="box-lid" style="transform-origin:0% 100%;transform:rotate(${open ? -70 : 0}deg)"><rect x="-20" y="-24" width="40" height="7" rx="2" fill="#B06A2C"/><circle cx="0" cy="-20.5" r="2" fill="${C.gold}"/></g></g>`;
  }

  function vine(withGrapes) {
    const bunch = (x, y) => `<g transform="translate(${x} ${y})" class="grapes">${[[0, 0], [-6, 6], [6, 6], [0, 12], [-6, 18], [6, 18], [0, 24], [-3, 30], [3, 30]].map(([gx, gy]) => `<circle cx="${gx}" cy="${gy}" r="5" fill="${C.gold}"/><circle cx="${gx - 1.5}" cy="${gy - 1.5}" r="1.5" fill="#FFF3C9"/>`).join('')}<path d="M0-2v-8" stroke="${C.leaf3}" stroke-width="2"/></g>`;
    const leaves = Array.from({ length: 11 }, (_, i) => `<ellipse cx="${30 + i * 34}" cy="${40 + (i % 2) * 10}" rx="18" ry="12" fill="${[C.leaf1, C.leaf2, C.leaf3][i % 3]}" transform="rotate(${(i % 3) * 20 - 20} ${30 + i * 34} ${40 + (i % 2) * 10})"/>`).join('');
    return `<path d="M0 34q200-20 400 0" stroke="#7A5235" stroke-width="7" fill="none"/><rect x="40" y="34" width="8" height="200" fill="#7A5235"/><rect x="352" y="34" width="8" height="200" fill="#7A5235"/>
      ${anim('a-sway-sm', leaves + (withGrapes ? bunch(150, 52) + bunch(212, 58) + bunch(270, 50) : ''))}`;
  }

  // shared gradients, injected once into the page
  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="hm-sky-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC0E6"/><stop offset=".75" stop-color="#D6EEF7"/></linearGradient>
    <linearGradient id="hm-sky-evening" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E6BAE"/><stop offset=".45" stop-color="#F29E7A"/><stop offset=".8" stop-color="#F9D9A4"/></linearGradient>
    <linearGradient id="hm-sky-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121936"/><stop offset=".8" stop-color="#2B3A67"/></linearGradient>
    <linearGradient id="hm-sky-hot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6C96B"/><stop offset=".8" stop-color="#FCEFC7"/></linearGradient>
    <radialGradient id="hm-sun"><stop offset="0" stop-color="#FFF4C2"/><stop offset="1" stop-color="#FFC53D"/></radialGradient>
    <linearGradient id="hm-moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset="1" stop-color="#F2A93B"/></linearGradient>
  </defs></svg>`;

  window.HM_ART = {
    DEFS, C, uid, rng, at, anim,
    sky, sun, cloud, stars, moon, hills, ground, grassTufts, flowers,
    tree, bigTree, palm, bush, rock, river, birds, butterfly, zzz, sparkle, heart, sweat,
    mouse, lion, hare, tortoise, fox, crow, pot, pebblePile, monkey, bear, elephant, horse,
    king, andare, child, palaceInside, throne, palaceOutside, mouseHouse, homeInside, lamp, kavum, net, box, vine,
  };
})();
