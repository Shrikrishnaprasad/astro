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
```

## Project layout

- `src/engine/` — pure calculation logic (ayanamsa, planetary positions, ascendant,
  houses, Arudha Pada, Vimshottari Dasa, Panchangam, Porutham). No React/DOM
  dependency, fully unit-tested.
- `src/data/` — static reference tables (rasis, nakshatras, dasa sequence,
  porutham rules, cities).
- `src/pages/` — one page per menu.
- `src/components/`, `src/hooks/` — shared UI and React glue.
