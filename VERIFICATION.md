# Verification Notes

The same content is available in the app under **Ephemeris accuracy** (`/accuracy`), driven by
`src/data/ephemerisAccuracy.ts` so UI and this file stay aligned.

**Design target:** mean Lahiri ayanamsa, mean Rahu/Ketu, and the closed-form ascendant are
appropriate for **sign- and nakshatra-level** work, not arcsecond-grade ephemeris.

## Automated tests

`npm test` runs Vitest unit tests covering:
- `src/engine/arudha.test.ts` — Arudha Pada, including the same-sign/7th-sign exception rule.
- `src/engine/dasa.test.ts` — Vimshottari starting lord/balance, 9-lord cycle, Bhukti proportions, 120-year total.
- `src/engine/ayanamsa.test.ts` — Lahiri ayanamsa against the J2000.0 reference value and precession rate.
- `src/engine/panchanga.test.ts` — Panchangam output stays within valid ranges across a month of dates.
- `src/engine/porutham.test.ts` — Dasakoota checks flag known Nadi/Rajju dosha cases.

## Manual spot-check (2000-01-01 12:00 UTC, Chennai)

- Sun: sidereal longitude ≈ 256.28° → 16.28° Dhanu (Sagittarius). Tropical Sun on this
  date is ≈ 280.1° (10.1° Capricorn); subtracting the Lahiri ayanamsa (≈23.85° at
  J2000) gives ≈256.3°, matching the app's output — confirms the ayanamsa pipeline.
- Planetary longitudes were cross-checked against `astronomy-engine`'s own
  `Astronomy.Ecliptic()` output (confirmed in dev console: this function returns
  **true ecliptic-of-date** coordinates directly, so no additional "of-date" rotation
  step was needed — see comments in `src/engine/planetaryPositions.ts`).

## Known precision limits (documented, not blockers for v1)

- **Ayanamsa**: linear mean-precession approximation anchored at J2000.0, no periodic
  (nutation-level) correction terms. Expect agreement with published panchangams to
  within a few arcminutes, not arcseconds.
- **Ascendant formula**: standard RAMC/latitude/obliquity closed-form (Duffett-Smith
  convention). Verified self-consistently (monotonic progression through signs,
  correct quadrant behavior against the J2000-equinox test vector) but not yet
  cross-checked against a third-party ephemeris for an exact degree match — recommended
  follow-up before relying on ascendant degree-level precision (sign-level results are
  more robust against this uncertainty).
- **Panchangam / Porutham**: implemented against the commonly published counting and
  classification rules; recommended as indicative, not authoritative astrological guidance.

## Suggested follow-up verification

Pick 2-3 known birth charts or panchangam entries from a trusted source (e.g. Drik
Panchang) and compare Sun/Moon sidereal longitude, sign, nakshatra, pada, and ascendant
sign for the same date/time/place.
