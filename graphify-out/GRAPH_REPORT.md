# Graph Report - Astro  (2026-10-22)

## Corpus Check
- Corpus is ~37,324 words - fits in a single context window. You may not need a graph.

## Summary
- 496 nodes · 1395 edges · 22 communities (14 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Shell & Routes
- Chart UI & Arudha
- Ephemeris & Ayanamsa
- Dasa & Advanced Jyotish
- Porutham & Yogas
- Panchangam Engine
- Build Tooling
- Muhurta & Panchang UI
- Places & Location
- Pushkara & Kavippu
- TypeScript Config
- India Places Script
- Shadbala Scoring
- PWA Icon Script
- Verification Docs
- PWA Branding
- README Overview
- HTML Entry
- Apple Touch Icon
- PWA 192 Icon
- PWA 512 Icon

## God Nodes (most connected - your core abstractions)
1. `normalizeDegrees()` - 33 edges
2. `BirthChartPage()` - 26 edges
3. `computePanchangam()` - 23 edges
4. `getSiderealLongitudes()` - 21 edges
5. `react` - 20 edges
6. `PanchangamPage()` - 20 edges
7. `ArudhaLagnaPage()` - 19 edges
8. `vitest` - 18 edges
9. `EphemerisAccuracyNotice()` - 18 edges
10. `getSiderealAscendant()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `PWA and mobile web app meta tags` --references--> `SVG favicon branding`  [INFERRED]
  index.html → public/favicon.svg
- `PlanetDignityScore` --references--> `Planet`  [EXTRACTED]
  src/engine/shadbala.ts → src/engine/types.ts
- `App()` --calls--> `EphemerisSettingsProvider()`  [EXTRACTED]
  src/App.tsx → src/context/EphemerisSettingsContext.tsx
- `App()` --calls--> `ArudhaLagnaPage()`  [EXTRACTED]
  src/App.tsx → src/pages/ArudhaLagnaPage.tsx
- `App()` --calls--> `BirthChartPage()`  [EXTRACTED]
  src/App.tsx → src/pages/BirthChartPage.tsx

## Import Cycles
- None detected.

## Communities (22 total, 8 thin omitted)

### Community 0 - "App Shell & Routes"
Cohesion: 0.08
Nodes (48): @fontsource/noto-sans-tamil, react, react-dom, react-router-dom, App(), birthFormToInput(), DateTimePlaceForm(), DEFAULT_VALUE (+40 more)

### Community 1 - "Chart UI & Arudha"
Cohesion: 0.09
Nodes (45): PlanetTable(), PushkaraAtBirthTable(), cellPosition(), ChartCellMetrics, ChartMarker, ChartMarkerKind, DESKTOP_METRICS, Edge (+37 more)

### Community 2 - "Ephemeris & Ayanamsa"
Cohesion: 0.11
Nodes (38): EphemerisSettingsContext, EphemerisSettingsContextValue, EphemerisSettingsProvider(), loadSettings(), useEphemerisSettings(), getLagnaRasiIndex(), getTropicalAscendant(), horizonAzimuthForEclipticLongitude() (+30 more)

### Community 3 - "Dasa & Advanced Jyotish"
Cohesion: 0.08
Nodes (38): vitest, dasaIndexForLord(), DasaLordDuration, VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_TOTAL_YEARS, Nakshatra, NAKSHATRA_SPAN_DEGREES, NAKSHATRAS (+30 more)

### Community 4 - "Porutham & Yogas"
Cohesion: 0.07
Nodes (39): ASHTAKAVARGA_BINDU_HOUSES, ASHTAKAVARGA_CONTRIBUTORS, AshtakavargaContributor, GANA, NADI, RAJJU, VASYA_GROUP, YONI (+31 more)

### Community 5 - "Panchangam Engine"
Cohesion: 0.11
Nodes (36): JAMAGRAHAM_PERIOD_HOURS, JAMAGRAHAM_SEQUENCE, WEEKDAY_LORD, ayanaForRasi(), GULIKA_KALAM_SLOT, GULIKA_NIGHT_SLOT, RAHU_KALAM_SLOT, Ritu (+28 more)

### Community 6 - "Build Tooling"
Cohesion: 0.06
Nodes (32): dependencies, astronomy-engine, @fontsource/noto-sans-tamil, react, react-dom, react-router-dom, devDependencies, @types/react (+24 more)

### Community 7 - "Muhurta & Panchang UI"
Cohesion: 0.15
Nodes (23): CHOGHADIYA_CYCLE, CHOGHADIYA_DAY_OPENER, CHOGHADIYA_NATURE, ChoghadiyaName, DISHA_SHOOL, addDays(), buildChoghadiyaSlots(), ChoghadiyaSlot (+15 more)

### Community 8 - "Places & Location"
Cohesion: 0.15
Nodes (19): BirthFormValue, GeoStatus, PlaceSelector(), resolve(), SearchableSelect(), ALL_PLACES, COUNTRIES, DEFAULT_CITY_NAME (+11 more)

### Community 9 - "Pushkara & Kavippu"
Cohesion: 0.13
Nodes (17): NAVAMSA_SPAN_DEGREES, PUSHKARA_BHAGA_DEGREE, PUSHKARA_NAVAMSA_PADAS, Rasi, calculateKavippu(), KavippuInput, KavippuResult, normalizeRasiIndex() (+9 more)

### Community 10 - "TypeScript Config"
Cohesion: 0.12
Nodes (16): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 11 - "India Places Script"
Cohesion: 0.13
Nodes (9): byState, cityCount, districtsJson, lines, outPath, root, stateNames, statesJson (+1 more)

### Community 12 - "Shadbala Scoring"
Cohesion: 0.29
Nodes (7): computePartialShadbala(), DEBILITATION, dignityScore(), EXALTATION, FRIENDS, OWN_SIGNS, PlanetDignityScore

### Community 14 - "Verification Docs"
Cohesion: 0.50
Nodes (3): Chennai 2000 spot-check pipeline, Ephemeris accuracy limits, Vitest engine test suite

## Knowledge Gaps
- **14 isolated node(s):** `@types/react`, `@types/react-dom`, `typescript`, `LAHIRI`, `PWA and mobile web app meta tags` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 149 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App Shell & Routes` to `Chart UI & Arudha`, `Ephemeris & Ayanamsa`, `Build Tooling`, `Muhurta & Panchang UI`, `Places & Location`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `computePanchangam()` (e.g. with `karanaNumberAt()` and `nakshatraIndexAt()`) actually correct?**
  _`computePanchangam()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/react`, `@types/react-dom`, `typescript` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.07505827505827506 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Dasa & Advanced Jyotish` to `Chart UI & Arudha`, `Ephemeris & Ayanamsa`, `Porutham & Yogas`, `Panchangam Engine`, `Build Tooling`, `Muhurta & Panchang UI`, `Pushkara & Kavippu`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Chart UI & Arudha` be split into smaller, more focused modules?**
  _Cohesion score 0.09275793650793651 - nodes in this community are weakly interconnected._
- **Why does `normalizeDegrees()` connect `Panchangam Engine` to `Chart UI & Arudha`, `Ephemeris & Ayanamsa`, `Dasa & Advanced Jyotish`, `Pushkara & Kavippu`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._