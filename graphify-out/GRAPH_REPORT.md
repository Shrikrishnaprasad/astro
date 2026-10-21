# Graph Report - Astro  (2026-10-21)

## Corpus Check
- Corpus is ~18,568 words - fits in a single context window. You may not need a graph.

## Summary
- 331 nodes · 877 edges · 20 communities (13 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.82)
- Token cost: 2,500 input · 1,200 output

## Community Hubs (Navigation)
- Charts and UI
- Panchanga Engine
- App Shell Routing
- Dasa and Nakshatra
- Package and Tooling
- Muhurta Panchangam UI
- Ephemeris and Ascendant
- Tests and Pushkara
- Place Selection
- TypeScript Config
- Arudha and Houses
- Web App Shell Docs
- Ayanamsa Documentation
- Engine Layer Docs
- Birth Chart Docs
- Dasa Docs
- Arudha Docs
- Panchangam Docs
- Porutham Docs

## God Nodes (most connected - your core abstractions)
1. `normalizeDegrees()` - 26 edges
2. `BirthChartPage()` - 21 edges
3. `getSiderealLongitudes()` - 20 edges
4. `computePanchangam()` - 19 edges
5. `PanchangamPage()` - 19 edges
6. `ArudhaLagnaPage()` - 18 edges
7. `react` - 15 edges
8. `getSiderealAscendant()` - 15 edges
9. `compilerOptions` - 15 edges
10. `vitest` - 14 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `BirthChartPage()`  [EXTRACTED]
  src/App.tsx → src/pages/BirthChartPage.tsx
- `App()` --calls--> `DasaPage()`  [EXTRACTED]
  src/App.tsx → src/pages/DasaPage.tsx
- `App()` --calls--> `LiveTransitPage()`  [EXTRACTED]
  src/App.tsx → src/pages/LiveTransitPage.tsx
- `App()` --calls--> `PanchangamPage()`  [EXTRACTED]
  src/App.tsx → src/pages/PanchangamPage.tsx
- `BirthFormValue` --references--> `ResolvedPlace`  [EXTRACTED]
  src/components/DateTimePlaceForm.tsx → src/data/places.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Six main app menus** — readme_live_transit, readme_birth_rasi_chart, readme_jamakkol_arudam, readme_dasa_bhukti, readme_panchangam, readme_porutham [EXTRACTED 1.00]

## Communities (20 total, 7 thin omitted)

### Community 0 - "Charts and UI"
Cohesion: 0.12
Nodes (36): react, PlanetTable(), cellPosition(), ChartMarker, ChartMarkerKind, Edge, GRID, KIND_CLASS (+28 more)

### Community 1 - "Panchanga Engine"
Cohesion: 0.11
Nodes (36): JAMAGRAHAM_PERIOD_HOURS, JAMAGRAHAM_SEQUENCE, WEEKDAY_LORD, ayanaForRasi(), GULIKA_KALAM_SLOT, GULIKA_NIGHT_SLOT, RAHU_KALAM_SLOT, Ritu (+28 more)

### Community 2 - "App Shell Routing"
Cohesion: 0.10
Nodes (22): @fontsource/noto-sans-tamil, react-dom, react-router-dom, App(), NavMenu(), GANA, NADI, RAJJU (+14 more)

### Community 3 - "Dasa and Nakshatra"
Cohesion: 0.11
Nodes (25): birthFormToInput(), DateTimePlaceForm(), dasaIndexForLord(), DasaLordDuration, VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_TOTAL_YEARS, Nakshatra, NAKSHATRA_SPAN_DEGREES (+17 more)

### Community 4 - "Package and Tooling"
Cohesion: 0.07
Nodes (28): dependencies, astronomy-engine, @fontsource/noto-sans-tamil, react, react-dom, react-router-dom, devDependencies, @types/react (+20 more)

### Community 5 - "Muhurta Panchangam UI"
Cohesion: 0.15
Nodes (24): CHOGHADIYA_CYCLE, CHOGHADIYA_DAY_OPENER, CHOGHADIYA_NATURE, ChoghadiyaName, DISHA_SHOOL, addDays(), buildChoghadiyaSlots(), ChoghadiyaSlot (+16 more)

### Community 6 - "Ephemeris and Ascendant"
Cohesion: 0.20
Nodes (17): getLagnaRasiIndex(), getSiderealAscendant(), getTropicalAscendant(), horizonAzimuthForEclipticLongitude(), getLahiriAyanamsa(), AYANAMSA_MODE, AyanamsaMode, LAHIRI (+9 more)

### Community 7 - "Tests and Pushkara"
Cohesion: 0.15
Nodes (16): vitest, NAVAMSA_SPAN_DEGREES, PUSHKARA_BHAGA_DEGREE, PUSHKARA_NAVAMSA_PADAS, Rasi, RASIS, calculateKavippu(), KavippuInput (+8 more)

### Community 8 - "Place Selection"
Cohesion: 0.19
Nodes (17): BirthFormValue, DEFAULT_VALUE, GeoStatus, PlaceSelector(), resolve(), ALL_PLACES, COUNTRIES, DEFAULT_CITY_NAME (+9 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.12
Nodes (16): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 10 - "Arudha and Houses"
Cohesion: 0.30
Nodes (8): rasiLord(), computeAllArudhaPadas(), computeArudhaPada(), mod12(), houseRasiIndex(), planetHouses(), rasiToHouseNumber(), Planet

### Community 11 - "Web App Shell Docs"
Cohesion: 0.50
Nodes (3): Mobile viewport meta tag, Vite React entry main.tsx, Vedic Tamil Astrology Web App

### Community 13 - "Engine Layer Docs"
Cohesion: 0.67
Nodes (3): src/engine pure calculation layer, Live Transit Gochara, Vitest automated engine tests

## Knowledge Gaps
- **15 isolated node(s):** `@types/react`, `@types/react-dom`, `typescript`, `LAHIRI`, `Live Transit Gochara` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 99 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Charts and UI` to `App Shell Routing`, `Dasa and Nakshatra`, `Package and Tooling`, `Muhurta Panchangam UI`, `Place Selection`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `computePanchangam()` (e.g. with `karanaNumberAt()` and `nakshatraIndexAt()`) actually correct?**
  _`computePanchangam()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/react`, `@types/react-dom`, `typescript` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Charts and UI` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Tests and Pushkara` to `Charts and UI`, `Panchanga Engine`, `App Shell Routing`, `Dasa and Nakshatra`, `Package and Tooling`, `Muhurta Panchangam UI`, `Ephemeris and Ascendant`, `Arudha and Houses`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `Panchanga Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.10685249709639953 - nodes in this community are weakly interconnected._
- **Why does `normalizeDegrees()` connect `Panchanga Engine` to `Charts and UI`, `Dasa and Nakshatra`, `Ephemeris and Ascendant`, `Tests and Pushkara`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._