# Astro — Vedic / Tamil Astrology Web App

A client-side (no backend) Vedic/Tamil astrology app with six menus:

- **Live Transit** — current planetary positions (Gochara), sidereal.
- **Birth / Rasi Chart** — lagna, planet positions, whole-sign houses.
- **Jamakkol Arudam** — Jaimini Arudha Pada for all 12 houses.
- **Dasa - Bhukti** — Vimshottari Mahadasa/Bhukti timeline.
- **Panchangam** — tithi, nakshatra, yoga, karana, vara for any date.
- **Porutham** — simplified 10-point (Dasakoota) nakshatra compatibility.

## Defaults / design choices

- Sidereal zodiac, **Lahiri ayanamsa** (mean-value approximation, see `src/engine/ayanamsa.ts`).
- Planetary positions via the pure-JS `astronomy-engine` library (no native build step).
- Rahu/Ketu via the standard mean lunar node formula (the library has no node function).
- **Whole-sign houses**.
- Location input: a small bundled city list (`src/data/cities.ts`) or manual lat/long/UTC-offset.

These are approximations suitable for sign/nakshatra-level astrology, not
arcsecond-precision ephemeris work. See `VERIFICATION.md` for accuracy notes.

## Getting started

```bash
npm install
npm run dev     # start the dev server
npm test        # run the engine unit tests (Vitest)
npm run build   # production build
npm run preview # serve production build locally (HTTPS not required for localhost)
```

## PWA (offline / Add to Home Screen)

This app is a **Progressive Web App**: after one online visit, the service worker caches the UI, fonts, and calculation code so charts and panchangam work **offline**.

1. Deploy the `dist/` folder to any host with **HTTPS** (GitHub Pages, Cloudflare Pages, Netlify, etc.).
2. Open the site once while online so assets cache.
3. **Install:** browser menu → *Install app* / *Add to Home Screen* (wording varies on Android vs iOS).

Development (`npm run dev`) does not register the service worker; use `npm run build && npm run preview` to test offline (DevTools → Network → Offline).

Regenerate PNG icons after branding changes: `npm run generate:icons` (requires Python + Pillow).

## Project layout

- `src/engine/` — pure calculation logic (ayanamsa, planetary positions, ascendant,
  houses, Arudha Pada, Vimshottari Dasa, Panchangam, Porutham). No React/DOM
  dependency, fully unit-tested.
- `src/data/` — static reference tables (rasis, nakshatras, dasa sequence,
  porutham rules, cities).
- `src/pages/` — one page per menu.
- `src/components/`, `src/hooks/` — shared UI and React glue.
