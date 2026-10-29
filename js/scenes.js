/*
 * හඳ මාමා කතන්දර — scenes
 * Each story page names a scene (see stories/stories.config.json).
 * A scene = one 400 × 300 illustration built from the drawing kit in art.js,
 * plus optional "tap" moments the child can play with.
 */
(function () {
  'use strict';
  const A = window.HM_ART;
  const { at, anim, sky, sun, cloud, stars, moon, hills, ground, grassTufts, flowers, tree, bigTree, palm, bush, rock,
    river, birds, butterfly, zzz, sparkle, heart, sweat, mouse, lion, hare, tortoise, fox, crow, pot, pebblePile, monkey,
    bear, elephant, horse, king, andare, child, palaceInside, throne, palaceOutside, mouseHouse, homeInside, lamp, kavum, net, box, vine } = A;

  const tap = (name, inner, extra) => `<g data-tap="${name}" class="tappable"${extra || ''}>${inner}</g>`;

  /* ---------- reusable settings ---------- */
  const day = (seed) => sky('day') + sun(330, 58, 22) + cloud(90, 60, 1, -3) + cloud(240, 40, 0.7, -14) + hills('day') + ground('day') + grassTufts(seed || 1, 14, 236);
  const meadow = (seed) => day(seed) + flowers(seed || 2, 10, 240);
  const forest = (seed) => day(seed) + tree(40, 232, 0.9, { d: -1 }) + tree(372, 228, 0.8, { d: -2.4 }) + bush(320, 240, 1) + bush(70, 244, 0.9);
  const evening = (seed) => sky('evening') + sun(320, 160, 26) + cloud(110, 70, 0.9, -5) + hills('evening') + ground('evening') + grassTufts(seed || 3, 10, 236, 'evening');
  const hot = () => sky('hot') + sun(330, 58, 26, true) + hills('hot') + ground('hot') +
    anim('a-heat', `<path d="M60 150q10-8 20 0t20 0M210 130q10-8 20 0t20 0M140 170q10-8 20 0t20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>`);
  const night = (seed) => sky('night') + stars(seed || 11, 46, 190) + moon(320, 70, 1, false) + hills('night') + ground('night') + grassTufts(seed || 4, 10, 236, 'night');

  /* ---------- Thirsty crow ---------- */
  const CROW_POT = { x: 268, y: 254, s: 1.55 };
  const crowPot = (level, pebbles) =>
    `<g data-pot-at="${CROW_POT.x},${CROW_POT.y},${CROW_POT.s}" data-level="${level}">${at(CROW_POT.x, CROW_POT.y, CROW_POT.s, pot(level, pebbles))}</g>`;

  const scenes = {
    'cr-drought': () => hot() + tree(80, 232, 0.9, { bare: true }) +
      `<ellipse cx="250" cy="262" rx="70" ry="12" fill="#C69A55"/><path d="M200 262l20-4 14 6M250 256l8 8 20-2M290 262l-14 4" stroke="#A9814A" stroke-width="1.6" fill="none"/>` +
      at(196, 252, 1.7, crow({ mood: 'thirsty' })) + sweat(218, 168) + sweat(232, 176, -0.7),
    'cr-pot': () => hot() + tree(46, 232, 0.8, { bare: true }) + at(150, 254, 1.6, crow({ mood: 'thirsty' })) + crowPot(0.12, 0) +
      sparkle(268, 120, 0.8, '#8CC6EC') ,
    'cr-idea': () => hot() + at(150, 254, 1.6, crow({ mood: 'idea' })) + crowPot(0.12, 0) + pebblePile(70, 262, 12),
    'cr-pebbles': () => hot() + `<g class="crow-thirsty">${at(140, 254, 1.6, crow({ pebble: true }))}</g>` +
      `<g class="crow-drinking" opacity="0">${at(212, 214, 1.6, crow({ pose: 'drink', mood: 'happy' }))}</g>` +
      crowPot(0.12, 0) + pebblePile(62, 266, 14, 'pebble'),
    'cr-fly': () => sky('day') + sun(330, 58, 22) + cloud(90, 60, 1, -3) + hills('day') + ground('day') + flowers(5, 8, 244) +
      birds(4, 3, [40, 160, 40, 100]) + anim('a-fly-big', at(220, 150, 1.8, crow({ pose: 'fly', mood: 'happy' }))) +
      at(90, 256, 1.0, pot(0.95, 10)),

    /* ---------- Fox and the grapes ---------- */
    'fx-hungry': () => forest(21) + at(196, 254, 1.7, fox({ mood: 'hungry' })) +
      anim('a-rumble', `<path d="M196 196q4-4 8 0t8 0M190 186q4-4 8 0t8 0" stroke="#C4572E" stroke-width="2" fill="none" stroke-linecap="round"/>`),
    'fx-grapes': () => day(22) + vine(true) + sparkle(160, 120, 1) + sparkle(222, 126, 0.8, null, -0.5) + sparkle(282, 118, 0.9, null, -1) +
      at(190, 256, 1.6, fox({ mood: 'happy' })),
    'fx-jump': () => day(23) + vine(true) +
      tap('fox-jump', `<g class="jumper">${at(200, 256, 1.6, fox({ pose: 'jump', mood: 'hungry' }))}</g>`),
    'fx-tired': () => day(24) + vine(true) + at(196, 256, 1.6, fox({ pose: 'sit', mood: 'tired' })) + sweat(236, 150) + sweat(250, 160, -0.5),
    'fx-sour': () => day(25) + vine(true) + at(290, 256, 1.6, fox({ mood: 'angry' }), true) +
      `<text x="96" y="150" font-size="34" font-weight="800" fill="#C4572E" font-family="Gemunu Libre, sans-serif" class="a-shake">!</text>`,
    'fx-monkey': () => day(26) + vine(true) + at(214, 70, 1.3, monkey()) + at(352, 256, 0.85, fox({ mood: 'hungry' }), true),
    'fx-leave': () => evening(27) + tree(60, 230, 0.8) + at(250, 256, 1.5, fox({ mood: 'hungry' }), true) +
      `<g opacity=".95"><circle cx="150" cy="150" r="5" fill="#fff"/><circle cx="134" cy="132" r="8" fill="#fff"/><ellipse cx="110" cy="96" rx="40" ry="28" fill="#fff"/>
       <g transform="translate(110 84)">${[[0, 0], [-6, 6], [6, 6], [0, 12], [-3, 18], [3, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${A.C.gold}"/>`).join('')}</g></g>`,

    /* ---------- Lion and the mouse ---------- */
    'lm-king': () => meadow(31) + tree(360, 228, 0.8) + at(200, 262, 1.3, rock(0, 0, 1)) + at(196, 196, 1.05, lion({ mood: 'proud' })) +
      at(60, 256, 0.8, hare({ mood: 'happy' })) + birds(31, 3),
    'lm-sleep': () => forest(32) + bigTree(110, 238, 0.9) +
      tap('snore', at(212, 256, 1.35, lion({ sleep: true })) + `<g class="snore">${zzz(270, 150, 1.1)}</g>`) +
      anim('a-hop', at(186, 214, 0.85, mouse({ happy: true }))),
    'lm-catch': () => forest(33) + at(170, 256, 1.35, lion({ mood: 'roar' })) +
      anim('a-shake', at(262, 168, 0.95, mouse({}))) +
      `<g stroke="#5A4630" stroke-width="2.4" stroke-linecap="round" opacity=".6"><path d="M240 120l-8-10M260 112v-12M282 120l8-10"/></g>`,
    'lm-release': () => meadow(34) + at(150, 256, 1.35, lion({ mood: 'laugh' })) +
      anim('a-run', at(320, 258, 0.95, mouse({ happy: true }))) +
      `<g stroke="#8A7A6A" stroke-width="2" stroke-linecap="round" opacity=".5"><path d="M270 236h-18M274 246h-24M270 256h-16"/></g>`,
    'lm-net': () => forest(35) + tree(120, 230, 0.7) +
      at(200, 256, 1.3, lion({ mood: 'worried' })) + at(200, 256, 1.3, net('n', 7)) +
      `<path d="M120 150q30 30 40 20" stroke="#8C6A3F" stroke-width="3" fill="none"/>`,
    'lm-rescue': () => forest(36) +
      `<g class="lion-worried">${at(200, 256, 1.3, lion({ mood: 'worried' }))}</g><g class="lion-happy" opacity="0">${at(200, 256, 1.3, lion({ mood: 'smile' }))}</g>` +
      tap('net', at(200, 256, 1.3, net('n', 7)) + `<rect x="80" y="60" width="240" height="200" fill="transparent"/>`) +
      anim('a-nibble', at(232, 98, 0.9, mouse({}))),
    'lm-thanks': () => meadow(37) + at(150, 256, 1.35, lion({ lying: true, mood: 'smile' })) + at(300, 258, 0.95, mouse({ happy: true }), true) +
      heart(260, 170, 0.9) + heart(286, 150, 0.7, -1.2),
    'lm-friends': () => evening(38) + tree(60, 230, 0.8) + at(200, 256, 1.35, lion({ lying: true, mood: 'smile' })) +
      at(226, 152, 0.75, mouse({ happy: true })) + heart(262, 118, 0.8) + birds(38, 2, [80, 300, 40, 90]),

    /* ---------- Tortoise and the hare ---------- */
    'th-friends': () => meadow(41) + tree(50, 232, 0.8) + at(140, 258, 1.5, hare({ mood: 'happy' })) + at(262, 258, 1.4, tortoise({ mood: 'happy' })) +
      butterfly(200, 140, 1, '#F7B733') + butterfly(300, 110, 0.8, '#F28CB1', -2),
    'th-mock': () => meadow(42) + at(140, 258, 1.5, hare({ mood: 'smug' })) + at(266, 258, 1.4, tortoise({ mood: 'calm' })) +
      `<text x="198" y="128" font-size="30" font-weight="800" fill="#B8322E" font-family="Gemunu Libre, sans-serif" class="a-shake">හා හා!</text>`,
    'th-challenge': () => sky('day') + sun(70, 58, 20) + cloud(250, 50, 0.8, -6) + hills('day') + ground('day', 214) + river(196) +
      bigTree(330, 200, 0.42) + flowers(43, 6, 250) + at(130, 262, 1.4, hare({ mood: 'happy' })) + at(250, 264, 1.35, tortoise({ mood: 'calm' })),
    'th-start': () => meadow(44) + `<path d="M60 270L340 250" stroke="#fff" stroke-width="5" stroke-dasharray="12 8"/>` +
      `<g><rect x="56" y="150" width="5" height="122" fill="#7A5235"/>${anim('a-flag', `<path d="M61 152h44l-10 14 10 14h-44z" fill="#C9302C"/>`)}</g>` +
      at(150, 262, 1.4, hare({ run: true, mood: 'smug' })) + at(270, 256, 1.3, tortoise({ walk: true })) + birds(44, 3),
    'th-nap': () => meadow(45) + bigTree(130, 240, 0.9) +
      tap('snore', at(150, 258, 1.3, hare({ sleep: true })) + `<g class="snore">${zzz(186, 168, 1)}</g>`) +
      anim('a-creep', at(330, 258, 0.75, tortoise({ walk: true }))),
    'th-walk': () => hot() + bigTree(372, 220, 0.38) +
      `<path d="M40 268Q200 250 360 228" stroke="#C9A35C" stroke-width="10" fill="none" stroke-dasharray="2 14" stroke-linecap="round"/>` +
      tap('step', `<g class="stepper">${at(110, 262, 1.5, tortoise({ walk: true, mood: 'tired' }))}${sweat(178, 210)}</g>`),
    'th-finish': () => meadow(47) + bigTree(320, 240, 0.8) +
      `<path d="M262 160q30 10 60-4" stroke="#C9302C" stroke-width="4" fill="none"/>` +
      at(250, 258, 1.4, tortoise({ mood: 'happy' })) + anim('a-run', at(70, 262, 0.85, hare({ run: true, mood: 'sad' }))) +
      sparkle(300, 150, 1) + sparkle(220, 170, 0.8, null, -0.6),
    'th-cheer': () => meadow(48) + tree(60, 232, 0.8) + tree(350, 232, 0.8, { d: -2 }) +
      tap('wiggle', at(200, 258, 1.5, tortoise({ mood: 'happy' }))) + at(90, 256, 0.9, monkey()) + at(320, 254, 0.9, mouse({ happy: true }), true) +
      birds(48, 4, [60, 340, 40, 110]) + sparkle(150, 140, 1, '#F28CB1') + sparkle(250, 120, 1.1, '#FFD45C', -0.4) + sparkle(200, 90, 0.9, '#8CC6EC', -0.9) +
      butterfly(130, 100, 0.8, '#B79CF2', -1),
    'th-sorry': () => meadow(49) + at(150, 260, 1.5, hare({ mood: 'sad' })) + at(270, 258, 1.4, tortoise({ mood: 'calm' })),
    'th-smile': () => meadow(50) + at(150, 260, 1.5, hare({ mood: 'happy' })) + at(270, 258, 1.4, tortoise({ mood: 'happy' })) + heart(210, 150, 1) + heart(236, 130, 0.7, -1),
    'th-together': () => evening(51) + tree(340, 230, 0.8) + palm(60, 232, 0.8) +
      `<path d="M0 270Q200 250 400 262" stroke="#C9A35C" stroke-width="16" fill="none" opacity=".5"/>` +
      at(160, 262, 1.3, hare({ mood: 'happy' })) + at(250, 262, 1.2, tortoise({ walk: true, mood: 'happy' })) + birds(51, 3, [60, 300, 40, 110]),

    /* ---------- Andare and the king ---------- */
    'an-court': () => palaceInside() + throne(262, 240) + at(262, 244, 1.1, king({ hand: 'open', mood: 'smile' })) + at(116, 244, 1.1, andare({ mood: 'smile', bow: true })) + lamp(200, 236, 1),
    'an-ask': () => palaceInside() + throne(262, 240) + at(262, 244, 1.1, king({ hand: 'up', mood: 'smile' })) + at(116, 244, 1.1, andare({ mood: 'talk' })) +
      `<text x="304" y="96" font-size="40" font-weight="800" fill="#B8322E" font-family="Gemunu Libre, sans-serif" class="a-bob">?</text>`,
    'an-smile': () => palaceInside() + throne(262, 240) + at(262, 244, 1.1, king({ mood: 'smile' })) + at(116, 244, 1.1, andare({ mood: 'laugh' })),
    'an-box': () => palaceInside() + throne(262, 240) + at(262, 244, 1.1, king({ mood: 'think', hand: 'chin' })) + at(120, 244, 1.1, andare({ box: true })) + at(121, 226, 1.15, box(false)),
    'an-open': () => palaceInside() + throne(262, 240) + at(262, 244, 1.1, king({ mood: 'smile', hand: 'open' })) + at(120, 244, 1.1, andare({ box: true, mood: 'laugh' })) +
      at(121, 228, 1.3, box(false, 'box')),
    'an-think': () => palaceInside() + throne(262, 240) + at(262, 244, 1.1, king({ hand: 'chin', mood: 'think' })) + at(116, 244, 1.1, andare({ mood: 'smile' })) + lamp(200, 236, 1),
    'an-ask2': () => palaceInside() + throne(262, 240) + at(262, 244, 1.1, king({ mood: 'think', hand: 'chin' })) + at(116, 244, 1.1, andare({ mood: 'talk' })),
    'an-army': () => day(61) + palaceOutside(320, 214, 0.75) + at(130, 258, 1.05, elephant()) + at(290, 262, 0.85, horse()),
    'an-kind': () => palaceInside() + throne(262, 240) + at(262, 244, 1.1, king({ mood: 'happy', hand: 'open' })) + at(116, 244, 1.1, andare({ mood: 'talk' })) +
      heart(180, 150, 1) + heart(210, 120, 0.8, -1) + heart(160, 110, 0.6, -2),
    'an-kingdom': () => meadow(63) + palaceOutside(300, 214, 0.7) + palm(40, 232, 0.8) +
      anim('a-kite', `<g transform="translate(150 70)"><path d="M0-16l12 16-12 16-12-16z" fill="#F28CB1"/><path d="M0-16v32M-12 0h24" stroke="#B8322E" stroke-width="1.5"/><path d="M0 16q-6 20 4 40q-8 20 0 40" stroke="#7A5235" stroke-width="1.2" fill="none"/></g>`) +
      at(110, 262, 0.95, child('#F2A93B', '#2B1E16', 0)) + at(150, 262, 0.95, child('#5BA4D9', '#3A2A20', -0.3)) + at(190, 262, 0.95, child('#9CC36A', '#2B1E16', -0.6)) +
      at(306, 266, 0.85, king({ mood: 'happy', hand: 'up' })),

    /* ---------- Mee Puncha ---------- */
    'mp-home': () => homeInside('day') + lamp(40, 232, 1) +
      `<rect x="168" y="206" width="76" height="10" rx="4" fill="#9C7048"/><rect x="176" y="216" width="8" height="24" fill="#9C7048"/><rect x="228" y="216" width="8" height="24" fill="#9C7048"/>` +
      kavum(206, 204, 1) + at(108, 250, 2.0, mouse({ grandma: true, happy: true })) + anim('a-hop', at(310, 254, 1.5, mouse({ happy: true }), true), -0.4),
    'mp-ask': () => homeInside('day') + lamp(40, 232, 1) + at(112, 250, 2.0, mouse({ grandma: true })) + anim('a-hop', at(300, 254, 1.6, mouse({ happy: true }), true)) +
      sparkle(300, 170, 1) + sparkle(326, 190, 0.7, null, -0.6),
    'mp-forest': () => sky('day') + sun(70, 70, 22) + cloud(260, 50, 0.9, -8) + hills('day') + ground('day') + grassTufts(71, 16, 236) + flowers(71, 14, 240) +
      tree(330, 230, 0.9, { d: -1.5 }) + tree(40, 230, 0.7) + bush(260, 244, 0.8) +
      `<path d="M0 276Q200 252 400 268" stroke="#C9A35C" stroke-width="18" fill="none" opacity=".45"/>` +
      anim('a-walk', at(190, 266, 1.6, mouse({ happy: true }))) + butterfly(130, 140, 0.9, '#F7B733') + butterfly(250, 120, 0.7, '#F28CB1', -1.5) + birds(72, 3),
    'mp-sea': () => twoView('sea', false),
    'mp-sea-real': () => twoView('sea', true),
    'mp-mountain': () => twoView('mountain', false),
    'mp-mountain-real': () => twoView('mountain', true),
    'mp-bears': () => twoView('bears', false),
    'mp-evening': () => evening(81) + mouseHouse(300, 236, 0.9, true) + flowers(81, 6, 244, ['#F28CB1', '#FFD45C']) +
      anim('a-walk', at(160, 262, 1.5, mouse({ happy: true }))),
    'mp-proud': () => homeInside('evening') + lamp(40, 232, 1) + at(112, 250, 2.0, mouse({ grandma: true })) +
      tap('wiggle', at(300, 254, 1.7, mouse({ happy: true }), true)) + sparkle(300, 160, 1.2) + sparkle(262, 176, 0.8, '#F28CB1', -0.5) + sparkle(340, 186, 0.7, null, -1),
    'mp-hug': () => homeInside('night') + lamp(70, 232, 1.1) + at(140, 250, 2.1, mouse({ grandma: true, happy: true })) + at(262, 252, 1.5, mouse({ happy: true }), true) +
      heart(210, 120, 1) + heart(240, 100, 0.7, -1) + butterfly(330, 200, 0.6, '#F4F1EC', -1) + butterfly(360, 180, 0.6, '#A07A55', -2),
    'mp-dream': () => homeInside('night') + lamp(52, 232, 1) +
      `<path d="M120 246q80-30 170 0z" fill="#5E9E4A"/><ellipse cx="205" cy="244" rx="90" ry="12" fill="#6FB257"/>` +
      at(196, 240, 1.5, mouse({ sleep: true })) + zzz(236, 186, 0.9) +
      `<g opacity=".95"><circle cx="160" cy="180" r="5" fill="#fff"/><circle cx="148" cy="160" r="8" fill="#fff"/><ellipse cx="110" cy="100" rx="70" ry="48" fill="#fff"/></g>` +
      `<g transform="translate(110 104)"><path d="M-54 14q10-14 20 0t20 0t20 0t20 0t20 0" stroke="${A.C.water}" stroke-width="5" fill="none"/>
        <path d="M-10 6L14-30L36 6z" fill="#86B556"/>${at(-30, -2, 0.6, mouse({ happy: true }))}${sparkle(30, -36, 0.6)}</g>`,

    /* ---------- special pages ---------- */
    'lesson': () => sky('night') + stars(91, 40, 300) + anim('a-bob', moon(200, 150, 2, true)) +
      sparkle(110, 90, 1.6) + sparkle(300, 100, 1.3, null, -0.8) + sparkle(270, 230, 1, '#F28CB1', -1.6) + sparkle(130, 220, 1.1, '#8CC6EC', -2.2),
    'night-sky': () => night(99),
  };

  // goodnight pages: the story's main character asleep under Handa Mama
  const sleepers = {
    'pipasitha-kaputa': () => at(200, 250, 1.6, crow({ mood: 'thirsty' })),
    'nariya-saha-midi': () => at(200, 252, 1.4, fox({ pose: 'sit', mood: 'sleep' })),
    'sinha-saha-meeya': () => at(196, 254, 1.2, lion({ sleep: true })) + at(232, 212, 0.75, mouse({ sleep: true })),
    'ibba-saha-haawa': () => at(160, 254, 1.3, hare({ sleep: true })) + at(256, 254, 1.2, tortoise({ mood: 'tired' })),
    'andare-saha-rajathuma': () => at(200, 254, 1.4, andare({ mood: 'smile' })),
    'mee-puncha': () => at(170, 252, 1.9, mouse({ grandma: true, sleep: true })) + at(236, 252, 1.4, mouse({ sleep: true }), true),
  };
  scenes.goodnight = (bookId) => sky('night') + stars(101, 50, 200) + moon(310, 76, 1.2, false) + hills('night') + ground('night') + tree(56, 232, 0.8, { night: true }) +
    (sleepers[bookId] ? sleepers[bookId]() : '') + zzz(250, 170, 1);

  /* ---------- Mee Puncha's two views: how big it looked vs. what it really was ---------- */
  function twoView(kind, startReal) {
    let imagined = '', real = '';
    if (kind === 'sea') {
      imagined = sky('day') + sun(330, 58, 22) + cloud(80, 50, 1, -4) +
        `<rect y="120" width="400" height="180" fill="#3F8CC8"/>` +
        anim('a-wave', `<path d="M-20 150q30-30 60 0t60 0t60 0t60 0t60 0t60 0t60 0V300H-20z" fill="#5BA4D9"/>`) +
        anim('a-wave2', `<path d="M-20 200q35-34 70 0t70 0t70 0t70 0t70 0t70 0V300H-20z" fill="#8CC6EC"/>`) +
        anim('a-surf', at(200, 186, 1.5, mouse({ happy: true }))) + birds(12, 3, [60, 300, 40, 100]);
      real = sky('day') + sun(330, 58, 22) + hills('day') + ground('day') + grassTufts(13, 10, 236) +
        `<path d="M150 262q-8-20 20-26q34-6 66 2q26 8 14 24q-20 12-60 10q-36-2-40-10z" fill="#7FB8E0"/><path d="M170 252q30-8 60 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>` +
        at(190, 246, 0.9, mouse({ happy: true }));
    } else if (kind === 'mountain') {
      imagined = sky('day') + cloud(120, 70, 1.2, -2) + cloud(300, 54, 1, -10) +
        `<path d="M-20 300L200 80L420 300z" fill="#86B556"/><path d="M200 80L240 120L200 112L160 124z" fill="#fff" opacity=".8"/>` +
        [[120, 210], [160, 160], [250, 170], [290, 220], [200, 130]].map(([x, y], i) => tree(x, y, 0.45, { d: -i })).join('') +
        anim('a-hop', at(214, 102, 0.9, mouse({ happy: true })));
      real = sky('day') + sun(330, 58, 22) + hills('day') + ground('day') + grassTufts(14, 8, 236) +
        `<ellipse cx="290" cy="262" rx="50" ry="10" fill="#8C6A3F" opacity=".6"/>` +
        anim('a-sway-sm', `<g stroke="${A.C.leaf3}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M170 256q-10-30-30-44M180 256q-4-36 0-58M190 256q4-34 20-50M200 256q12-28 34-36M176 256q-24-14-40-16"/></g>`) +
        at(186, 206, 0.8, mouse({ happy: true }));
    } else {
      imagined = forest(15) +
        anim('a-sway-sm', at(120, 262, 1, bear('white'))) + anim('a-sway-sm', at(290, 262, 1, bear('brown', true)), -1.2) +
        at(206, 262, 1, mouse({ happy: true })) +
        `<text x="196" y="190" font-size="30" font-weight="800" fill="#B8322E" font-family="Gemunu Libre, sans-serif" class="a-shake">!</text>`;
      real = forest(16) + butterfly(160, 150, 1.3, '#F4F1EC') + butterfly(250, 130, 1.3, '#A07A55', -1.3) +
        at(206, 262, 1, mouse({ happy: true }));
    }
    return `<g class="two-view${startReal ? ' is-real' : ''}" data-tap="view">
      <g class="view-imagined">${imagined}</g><g class="view-real">${real}</g>
      </g>`;
  }

  /* ---------- tap moments ---------- */
  const NUMBERS = ['එක', 'දෙක', 'තුන', 'හතර', 'පහ', 'හය', 'හත', 'අට', 'නවය', 'දහය'];
  const SVGNS = 'http://www.w3.org/2000/svg';
  const snd = (name) => { if (window.HM_SOUND && window.HM_SOUND[name]) window.HM_SOUND[name](); };

  function countPop(svg, x, y, n) {
    const t = document.createElementNS(SVGNS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('class', 'count-pop');
    t.setAttribute('text-anchor', 'middle');
    t.textContent = NUMBERS[(n - 1) % NUMBERS.length];
    svg.appendChild(t);
    setTimeout(() => t.remove(), 1400);
  }

  function bump(el) {
    el.classList.remove('bump'); void el.getBBox(); el.classList.add('bump');
  }

  const taps = {
    view(el) {
      el.classList.toggle('is-real');
      snd('chime');
    },
    wiggle(el) { bump(el); snd('pop'); },
    snore(el) {
      const z = el.querySelector('.snore');
      if (z) { z.classList.remove('burst'); void z.getBBox(); z.classList.add('burst'); }
      snd('pop');
    },
    'fox-jump'(el, svg) {
      const j = el.querySelector('.jumper');
      const n = (+el.dataset.count || 0) + 1;
      el.dataset.count = n;
      j.classList.remove('jumping'); void j.getBBox(); j.classList.add('jumping');
      countPop(svg, 120, 120, n);
      snd('pop');
    },
    step(el, svg) {
      const n = Math.min((+el.dataset.count || 0) + 1, 9);
      el.dataset.count = n;
      el.querySelector('.stepper').style.transform = `translate(${n * 22}px, ${-n * 3.4}px)`;
      countPop(svg, 110 + n * 22, 150 - n * 3, n);
      snd('pop');
    },
    net(el) {
      const strands = [...el.querySelectorAll('.net-strand')].filter((s) => s.getAttribute('opacity') !== '0');
      const scene = el.closest('svg');
      if (!strands.length) return;
      strands[strands.length - 1].setAttribute('opacity', '0');
      snd('pop');
      if (strands.length === 1) {
        scene.querySelector('.lion-worried').setAttribute('opacity', '0');
        scene.querySelector('.lion-happy').setAttribute('opacity', '1');
        snd('chime');
      }
    },
    box(el) {
      const lid = el.querySelector('.box-lid');
      const inside = el.querySelector('.box-inside');
      const open = el.classList.toggle('is-open');
      lid.style.transform = `rotate(${open ? -70 : 0}deg)`;
      inside.setAttribute('opacity', open ? '1' : '0');
      snd(open ? 'chime' : 'pop');
    },
    pebble(el, svg) {
      const holder = svg.querySelector('[data-pot-at]');
      if (!holder) return;
      let level = +holder.dataset.level;
      if (level >= 1) return;
      const [px, py, ps] = holder.dataset.potAt.split(',').map(Number);
      const n = (+holder.dataset.count || 0) + 1;
      holder.dataset.count = n;
      // a pebble flies from the pile into the pot
      const fly = document.createElementNS(SVGNS, 'ellipse');
      fly.setAttribute('rx', 7); fly.setAttribute('ry', 5.4); fly.setAttribute('fill', '#A39C93');
      svg.appendChild(fly);
      const from = { x: 70, y: 250 }, to = { x: px, y: py - 72 * ps };
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min((t - t0) / 520, 1);
        const x = from.x + (to.x - from.x) * k;
        const y = from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 90;
        fly.setAttribute('cx', x.toFixed(1)); fly.setAttribute('cy', y.toFixed(1));
        if (k < 1) requestAnimationFrame(step);
        else {
          fly.remove();
          level = Math.min(1, level + 0.115);
          holder.dataset.level = level;
          const w = holder.querySelector('.pot-water');
          const wv = holder.querySelector('.pot-wave');
          const y = (-6 - level * 60).toFixed(1);
          w.setAttribute('y', y);
          wv.setAttribute('d', `M-40 ${y}q10-3 20 0t20 0t20 0t20 0`);
          const stones = holder.querySelector('.pot-stones');
          const row = Math.floor((n - 1) / 5), col = (n - 1) % 5;
          const e = document.createElementNS(SVGNS, 'ellipse');
          e.setAttribute('cx', -22 + col * 11 + (row % 2) * 5); e.setAttribute('cy', -6 - row * 7);
          e.setAttribute('rx', 5.5); e.setAttribute('ry', 4.2); e.setAttribute('fill', ['#B9B2A8', '#A39C93', '#CFC8BD'][n % 3]);
          stones.appendChild(e);
          countPop(svg, px, py - 120, n);
          snd('plop');
          if (level >= 1) {
            svg.querySelector('.crow-thirsty').setAttribute('opacity', '0');
            svg.querySelector('.crow-drinking').setAttribute('opacity', '1');
            el.classList.remove('tappable');
            snd('chime');
          }
        }
      };
      requestAnimationFrame(step);
    },
  };

  // the drawn version of a scene (also the fallback when a painted picture can't load)
  function drawn(name, arg) {
    const fn = scenes[name] || scenes['night-sky'];
    let inner;
    try { inner = fn(arg); } catch (e) { console.error('scene failed', name, e); inner = scenes['night-sky'](); }
    return `<svg class="scene" data-scene="${name}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  /* ---------- painted pictures (made in Canva, served by the Cloudinary CDN) ---------- */
  const CDN = 'https://res.cloudinary.com/dkj22lm1g/image/upload';
  const PHOTOS = new Set([
    'cr-drought', 'cr-pot', 'cr-idea', 'cr-pebbles', 'cr-fly',
    'fx-hungry', 'fx-grapes', 'fx-jump', 'fx-tired', 'fx-sour', 'fx-monkey', 'fx-leave',
    'lm-king', 'lm-sleep', 'lm-catch', 'lm-release', 'lm-net', 'lm-rescue', 'lm-thanks', 'lm-friends',
    'th-friends', 'th-mock', 'th-challenge', 'th-start', 'th-nap', 'th-walk', 'th-finish', 'th-cheer', 'th-sorry', 'th-smile', 'th-together',
    'an-court', 'an-ask', 'an-smile', 'an-box', 'an-open', 'an-think', 'an-ask2', 'an-army', 'an-kind', 'an-kingdom',
    'mp-home', 'mp-ask', 'mp-forest', 'mp-sea', 'mp-sea-real', 'mp-mountain', 'mp-mountain-real', 'mp-bears', 'mp-evening', 'mp-proud', 'mp-hug', 'mp-dream',
    'lesson', 'night-sky',
    'goodnight-pipasitha-kaputa', 'goodnight-nariya-saha-midi', 'goodnight-sinha-saha-meeya',
    'goodnight-ibba-saha-haawa', 'goodnight-andare-saha-rajathuma', 'goodnight-mee-puncha',
  ]);
  const WIDTHS = [480, 800, 1200, 1600];
  const SIZES = '(min-width: 900px) 46vw, 100vw';
  const photoId = (name, arg) => (name === 'goodnight' ? `goodnight-${arg}` : name);
  const url = (id, w) => `${CDN}/f_auto,q_auto,c_fill,w_${w}/handa-mama/scenes/${id}`;
  const srcset = (id) => WIDTHS.map((w) => `${url(id, w)} ${w}w`).join(', ');

  function render(name, arg) {
    const id = photoId(name, arg);
    if (!PHOTOS.has(id)) return drawn(name, arg);
    return `<img class="scene scene-photo" data-scene="${name}" data-arg="${arg || ''}" src="${url(id, 800)}" srcset="${srcset(id)}" sizes="${SIZES}" alt="" decoding="async" draggable="false" onerror="HM_SCENES.fallback(this)">`;
  }

  // no signal and not saved yet: swap in the drawn picture
  function fallback(img) {
    img.outerHTML = drawn(img.dataset.scene, img.dataset.arg || undefined);
  }

  // fetch a book's pictures up front so pages turn instantly and stay readable offline
  function preload(list) {
    list.forEach(([name, arg]) => {
      const id = photoId(name, arg);
      if (!PHOTOS.has(id)) return;
      const img = new Image();
      img.decoding = 'async';
      img.sizes = SIZES;
      img.srcset = srcset(id);
      img.src = url(id, 800);
    });
  }

  window.HM_SCENES = { render, drawn, fallback, preload, taps, names: Object.keys(scenes) };
})();
