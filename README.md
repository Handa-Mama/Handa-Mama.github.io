# හඳ මාමා කතන්දර · Handa Mama Stories

**හඳ මාමා කියන නිදි කතා** — Sinhala bedtime stories for children, read like a real picture book.

- A wooden bookshelf of illustrated books, filtered by age (3–6, 5–8)
- Books open from a hard cover, and pages turn like paper: drag a corner, swipe, tap, or use the arrow buttons or keys
- Two-page spread on tablets and computers, one big page on phones
- Rich painted illustrations on every page (made in Canva, served from the Cloudinary CDN), with a slow gentle drift when moving pictures are on
- A lesson page and a goodnight page at the end of every story
- Night mode (switches on automatically after 7 pm), soft page-turn sounds, remembers the last page
- Parents' corner (press and hold the gear for 3 seconds): text size, night mode, sounds, still pictures
- Works offline after the first visit (PWA); no ads, no accounts, no tracking
- Plain static files, no build step needed to run, ready for GitHub Pages

## Run it on your computer

Any static server works. For example:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` by double-clicking also works, but browsers block the fonts and offline mode on `file://`.)

## Publish on GitHub Pages

This repository is the `handa-mama.github.io` site, so it is served from the domain root.

1. In the repository: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.
2. The site appears at **https://handa-mama.github.io/**.

The `.nojekyll` file is already included so GitHub serves every file as is.

## Add or edit a story

Stories are plain text files in `stories/`, written exactly like the original samples:

```
Title – optional subtitle
First paragraph (starts with එකමත් එක කාලෙක…)
…more paragraphs…
මෙම කතාවෙන් අපට ඉගෙන ගන්න පුළුවන් දේ තමයි – …   ← lesson page
සුබ රාත්‍රියක්, පුංචි දරුවනි …                       ← goodnight page
```

1. Save the story as `stories/07_my_story.txt` (UTF-8).
2. Add an entry to `stories/stories.config.json`: an `id`, the `ages`, a cover `color`, the `cover` picture, and one picture name per paragraph in `scenes`.
3. Run `node tools/build-stories.js`. It splits paragraphs into book pages (about 42 words each), checks for missing hidden joiners (ZWJ) in words like රාත්‍රියක්, and writes `data/stories.js`.
4. Change `VERSION` in `sw.js` (for example `handa-mama-v2`) so phones pick up the new book.

### Pictures

Each scene name (for example `cr-pot`) is a painted picture made in Canva and uploaded to Cloudinary as
`handa-mama/scenes/<scene name>` (goodnight pages use `goodnight-<book id>`). The site asks Cloudinary for the right size
for each screen (`f_auto,q_auto,w_…`), and the service worker keeps every picture it has shown so books still read offline.

To add a picture for a new scene: export it from Canva as a 4:3 JPG (1600×1200), upload it to Cloudinary with the
public ID `handa-mama/scenes/<scene name>`, and add the name to `PHOTOS` in `js/scenes.js`.

If a picture can't load (no signal and not saved yet), the page shows the drawn version of the scene instead.
Those drawn versions live in `js/art.js` and `js/scenes.js`; open `tools/gallery.html` through the local server to see them.

## Project layout

```
index.html                 the app (bookshelf + reader + parents' corner)
css/app.css                all styles, including the picture animations
js/app.js                  shelf, book reader, settings, offline
js/art.js                  drawing kit: animals, people, skies, trees
js/scenes.js               picture for each page (Cloudinary), drawn fallbacks
js/sound.js                page-turn and tap sounds (generated, no audio files)
js/vendor/page-flip.*      StPageFlip 2.0.7 (MIT) — the page-turn engine
data/stories.js            generated book data (do not edit by hand)
stories/*.txt              the stories
stories/stories.config.json  ages, colours and pictures per story
fonts/                     Noto Serif Sinhala (story text), Gemunu Libre (titles) — SIL Open Font License
icons/                     logo, app icons
sw.js, manifest.webmanifest  offline support and "Add to Home screen"
tools/                     story builder, scene gallery, logo/icon renderer
```

## Logo and icons

`icons/logo-mark.svg` is the master logo (Handa Mama, the sleepy crescent moon, resting on an open book).
`icons/logo-dark.png` and `icons/logo-light.png` are the full lockups with the wordmark.
To re-render PNGs after changing the SVG: `npm i -D playwright && node tools/render-icons.js`.

## Credits

- Page turning: [StPageFlip](https://github.com/Nodlik/StPageFlip) by Nodlik, MIT licence
- Fonts: Noto Serif Sinhala (Google), Gemunu Libre (Mooniak), SIL Open Font License 1.1
- Stories: traditional tales retold in Sinhala; illustrations and code original to this project
