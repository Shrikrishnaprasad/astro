# Graph Report - Astro  (2026-10-21)

## Corpus Check
- Corpus is ~29,402 words - fits in a single context window. You may not need a graph.

## Summary
- 380 nodes · 950 edges · 25 communities (15 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Chart Pages & UI
- Panchangam Engine
- npm Dependencies
- Places & Live Transit
- Vimshottari Dasa
- Pushkara & Special Points
- Birth Form & Geo Data
- Porutham Rules
- Ayanamsa & Ascendant
- App Shell & PWA UI
- TypeScript Config
- India Places Generator
- South Indian Chart Layout
- PWA Icon Scripts
- PWA Assets & Meta
- README App Overview
- Vite Client Bootstrap
- Engine Test Docs
- Dasa Menu Doc
- Arudha Menu Doc
- Panchangam Menu Doc
- Porutham Menu Doc

## God Nodes (most connected - your core abstractions)
1. `normalizeDegrees()` - 28 edges
2. `BirthChartPage()` - 22 edges
3. `getSiderealLongitudes()` - 20 edges
4. `computePanchangam()` - 19 edges
5. `PanchangamPage()` - 19 edges
6. `ArudhaLagnaPage()` - 18 edges
7. `react` - 17 edges
8. `vitest` - 15 edges
9. `getSiderealAscendant()` - 15 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Apple touch icon PNG` --conceptually_related_to--> `PWA offline after install`  [INFERRED]
  public/apple-touch-icon.png → README.md
- `PWA icon 192x192` --conceptually_related_to--> `PWA offline after install`  [INFERRED]
  public/pwa-192x192.png → README.md
- `PWA icon 512x512` --conceptually_related_to--> `PWA offline after install`  [INFERRED]
  public/pwa-512x512.png → README.md
- `PWA and mobile web app meta tags` --references--> `SVG favicon branding`  [INFERRED]
  index.html → public/favicon.svg
- `App()` --calls--> `ArudhaLagnaPage()`  [EXTRACTED]
  src/App.tsx → src/pages/ArudhaLagnaPage.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Six main app menus** — readme_live_transit, readme_birth_rasi_chart, readme_jamakkol_arudam, readme_dasa_bhukti, readme_panchangam, readme_porutham [EXTRACTED 1.00]

## Communities (25 total, 10 thin omitted)

### Community 0 - "Chart Pages & UI"
Cohesion: 0.14
Nodes (34): react, DateTimePlaceForm(), PlanetTable(), ChartMarker, SouthIndianChart(), PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME, SURYA_VEEDHI_RASI (+26 more)

### Community 1 - "Panchangam Engine"
Cohesion: 0.11
Nodes (36): JAMAGRAHAM_PERIOD_HOURS, JAMAGRAHAM_SEQUENCE, WEEKDAY_LORD, ayanaForRasi(), GULIKA_KALAM_SLOT, GULIKA_NIGHT_SLOT, RAHU_KALAM_SLOT, Ritu (+28 more)

### Community 2 - "npm Dependencies"
Cohesion: 0.06
Nodes (32): dependencies, astronomy-engine, @fontsource/noto-sans-tamil, react, react-dom, react-router-dom, devDependencies, @types/react (+24 more)

### Community 3 - "Places & Live Transit"
Cohesion: 0.13
Nodes (27): PlaceSelector(), CHOGHADIYA_CYCLE, CHOGHADIYA_DAY_OPENER, CHOGHADIYA_NATURE, ChoghadiyaName, DISHA_SHOOL, defaultPlace(), addDays() (+19 more)

### Community 4 - "Vimshottari Dasa"
Cohesion: 0.12
Nodes (22): dasaIndexForLord(), DasaLordDuration, VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_TOTAL_YEARS, Nakshatra, NAKSHATRA_SPAN_DEGREES, NAKSHATRAS, NAMES (+14 more)

### Community 5 - "Pushkara & Special Points"
Cohesion: 0.13
Nodes (17): vitest, NAVAMSA_SPAN_DEGREES, PUSHKARA_BHAGA_DEGREE, PUSHKARA_NAVAMSA_PADAS, Rasi, RASIS, calculateKavippu(), KavippuInput (+9 more)

### Community 6 - "Birth Form & Geo Data"
Cohesion: 0.14
Nodes (19): birthFormToInput(), BirthFormValue, DEFAULT_VALUE, GeoStatus, resolve(), SearchableSelect(), ALL_PLACES, COUNTRIES (+11 more)

### Community 7 - "Porutham Rules"
Cohesion: 0.13
Nodes (18): GANA, NADI, RAJJU, VASYA_GROUP, YONI, YONI_COMPATIBLE_PAIRS, rasiLord(), computeAllArudhaPadas() (+10 more)

### Community 8 - "Ayanamsa & Ascendant"
Cohesion: 0.20
Nodes (16): getLagnaRasiIndex(), getTropicalAscendant(), horizonAzimuthForEclipticLongitude(), getLahiriAyanamsa(), AYANAMSA_MODE, AyanamsaMode, LAHIRI, julianCenturiesSinceJ2000() (+8 more)

### Community 9 - "App Shell & PWA UI"
Cohesion: 0.18
Nodes (11): @fontsource/noto-sans-tamil, react-dom, react-router-dom, App(), NavMenu(), PwaStatus(), DasaPage(), DasaRow() (+3 more)

### Community 10 - "TypeScript Config"
Cohesion: 0.12
Nodes (16): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 11 - "India Places Generator"
Cohesion: 0.13
Nodes (9): byState, cityCount, districtsJson, lines, outPath, root, stateNames, statesJson (+1 more)

### Community 12 - "South Indian Chart Layout"
Cohesion: 0.19
Nodes (12): cellPosition(), ChartCellMetrics, ChartMarkerKind, DESKTOP_METRICS, Edge, GRID, KIND_CLASS, outerTagOffset() (+4 more)

### Community 14 - "PWA Assets & Meta"
Cohesion: 0.33
Nodes (6): PWA and mobile web app meta tags, Apple touch icon PNG, SVG favicon branding, PWA icon 192x192, PWA icon 512x512, PWA offline after install

### Community 15 - "README App Overview"
Cohesion: 0.67
Nodes (3): Birth Rasi Chart menu, Live Transit Gochara menu, Astro Vedic Tamil Astrology Web App

## Knowledge Gaps
- **17 isolated node(s):** `@types/react`, `@types/react-dom`, `typescript`, `LAHIRI`, `Vitest automated engine tests` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 128 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Chart Pages & UI` to `npm Dependencies`, `Places & Live Transit`, `Vimshottari Dasa`, `Birth Form & Geo Data`, `App Shell & PWA UI`, `South Indian Chart Layout`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `computePanchangam()` (e.g. with `karanaNumberAt()` and `nakshatraIndexAt()`) actually correct?**
  _`computePanchangam()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/react`, `@types/react-dom`, `typescript` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chart Pages & UI` be split into smaller, more focused modules?**
  _Cohesion score 0.14122448979591837 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Pushkara & Special Points` to `Chart Pages & UI`, `Panchangam Engine`, `npm Dependencies`, `Places & Live Transit`, `Vimshottari Dasa`, `Porutham Rules`, `Ayanamsa & Ascendant`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `Panchangam Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.11033681765389082 - nodes in this community are weakly interconnected._
- **Should `npm Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.062388591800356503 - nodes in this community are weakly interconnected._