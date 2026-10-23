# Graph Report - Astro  (2026-10-23)

## Corpus Check
- 146 files · ~113,132 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .bat 1, .css 1)

## Summary
- 791 nodes · 2352 edges · 36 communities (28 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Birth Input App Shell
- KP and Ephemeris
- Porutham Yoga Dosha
- Tamil Karaka Catalog
- Panchanga Sun Times
- Package Build Tooling
- Muhurta Day Scoring
- Advanced Jyotish Points
- Nakshatra Karaka Data
- Shodashavarga Charts
- South Indian Chart UI
- Extra Karaka Seeds
- Classical Muhurta Rules
- Karakam Popup UI
- Vimshottari Dasa Engine
- Choghadiya Muhurta Windows
- Pushkara and Navamsa
- Panchangam Page Display
- Retrograde Planet Names
- Karaka Type Definitions
- Arudha Houses Prasna
- TypeScript Compiler Config
- Ashtakavarga Bindus
- India Places Generator
- Jyotish Scope Features
- Muhurta Activity Rules
- Shadbala Dignity Scores
- PWA Icon Generator
- Verification and Accuracy
- Favicon and App Meta
- PWA App Overview
- Vite React Entry
- Apple Touch Icon
- PWA Icon 192
- PWA Icon 512

## God Nodes (most connected - your core abstractions)
1. `normalizeDegrees()` - 45 edges
2. `useEphemerisSettings()` - 32 edges
3. `BirthChartPage()` - 30 edges
4. `react` - 29 edges
5. `Planet` - 28 edges
6. `getSiderealLongitudes()` - 27 edges
7. `EphemerisAccuracyNotice()` - 26 edges
8. `PanchangamPage()` - 26 edges
9. `DateTimePlaceForm()` - 25 edges
10. `rasiLord()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `PWA and mobile web app meta tags` --references--> `SVG favicon branding`  [INFERRED]
  index.html → public/favicon.svg
- `EphemerisSnapshot` --references--> `LongitudeMap`  [EXTRACTED]
  src/engine/ephemerisSnapshot.ts → src/engine/types.ts
- `PlanetDignityScore` --references--> `Planet`  [EXTRACTED]
  src/engine/shadbala.ts → src/engine/types.ts
- `VimshopakaPlanetRow` --references--> `Planet`  [EXTRACTED]
  src/engine/vargas.ts → src/engine/types.ts
- `App()` --calls--> `KarakamPopup()`  [EXTRACTED]
  src/App.tsx → src/components/KarakamPopup.tsx

## Import Cycles
- None detected.

## Communities (36 total, 8 thin omitted)

### Community 0 - "Birth Input App Shell"
Cohesion: 0.06
Nodes (74): @fontsource/noto-sans-tamil, react, react-dom, react-router-dom, App(), birthFormToInput(), BirthFormValue, DateTimePlaceForm() (+66 more)

### Community 1 - "KP and Ephemeris"
Cohesion: 0.08
Nodes (65): EphemerisSettingsContext, EphemerisSettingsContextValue, EphemerisSettingsProvider(), loadSettings(), getLagnaRasiIndex(), getSiderealAscendant(), getTropicalAscendant(), horizonAzimuthForEclipticLongitude() (+57 more)

### Community 2 - "Porutham Yoga Dosha"
Cohesion: 0.07
Nodes (35): GANA, NADI, RAJJU, VASYA_GROUP, YONI, YONI_COMPATIBLE_PAIRS, calculateKavippu(), KavippuInput (+27 more)

### Community 3 - "Tamil Karaka Catalog"
Cohesion: 0.07
Nodes (30): GRAHA_KARAKAS, CLASSICAL_TA, MODERN_LIST_TA, specialEntries(), withExtras(), withTamilItems(), applyTamil(), MODERN_CATEGORY_TITLE (+22 more)

### Community 4 - "Panchanga Sun Times"
Cohesion: 0.11
Nodes (32): JAMAGRAHAM_PERIOD_HOURS, JAMAGRAHAM_SEQUENCE, WEEKDAY_LORD, ayanaForRasi(), GULIKA_KALAM_SLOT, GULIKA_NIGHT_SLOT, RAHU_KALAM_SLOT, Ritu (+24 more)

### Community 5 - "Package Build Tooling"
Cohesion: 0.06
Nodes (32): dependencies, astronomy-engine, @fontsource/noto-sans-tamil, react, react-dom, react-router-dom, devDependencies, @types/react (+24 more)

### Community 6 - "Muhurta Day Scoring"
Cohesion: 0.11
Nodes (29): DayYogaAnalysis, evaluateMuhurtaKundali(), MahadoshaAnalysis, allInauspiciousWindows(), BENEFIC_HORA_PLANETS, CHALDEAN_ORDER, chandrabalaHouse(), choghadiyaOk() (+21 more)

### Community 7 - "Advanced Jyotish Points"
Cohesion: 0.14
Nodes (24): AshtakavargaPanel(), PushkaraAtBirthTable(), NAKSHATRAS, TITHI_SHUNYA_NAKSHATRA_INDICES, computeAshtakavarga(), evaluateKakshyaPlacements(), AvayogiResult, computeAvayogi() (+16 more)

### Community 8 - "Nakshatra Karaka Data"
Cohesion: 0.10
Nodes (28): BIRDS, formatDms(), Gana, gotra(), GOTRA_RISHIS, Nadi, NAKSHATRA_KARAKAS, NakshatraKarakaSeed (+20 more)

### Community 9 - "Shodashavarga Charts"
Cohesion: 0.11
Nodes (25): buildVargaCells(), KEY_6_VARGAS, ShodashavargaPanel(), VargaViewMode, shouldShowRetrograde(), computeAllShodashavarga(), computeVargaPlacement(), computeVimshopakaBala() (+17 more)

### Community 10 - "South Indian Chart UI"
Cohesion: 0.15
Nodes (22): KpSystemPanel(), ROMAN, PlanetTable(), cellPosition(), ChartCellMetrics, ChartMarker, ChartMarkerKind, DESKTOP_METRICS (+14 more)

### Community 11 - "Extra Karaka Seeds"
Cohesion: 0.10
Nodes (23): BHAVA_CLASSICAL, BHAVA_MODERN_EXTRA, BhavaClassicalSeed, buildBhavaClassical(), buildGrahaClassical(), buildGrahaModern(), buildRasiClassical(), DAY_STRONG (+15 more)

### Community 12 - "Classical Muhurta Rules"
Cohesion: 0.16
Nodes (21): AMRITA_SIDDHI_BY_VARA, AMRITA_START_GHATI, ANANDADI_START_NAK, ANANDADI_YOGAS, DAGDHA_TITHI_BY_VARA, DAY_DURMUHURTAM_SLOTS, GOWRI_DAY_TABLE, GOWRI_NATURE (+13 more)

### Community 13 - "Karakam Popup UI"
Cohesion: 0.18
Nodes (19): Highlight(), KarakaCard(), KarakamPopup(), LANGUAGE_OPTIONS, OPEN_KARAKAM_EVENT, readStoredLanguage(), sectionLabel(), KARAKA_SECTIONS (+11 more)

### Community 14 - "Vimshottari Dasa Engine"
Cohesion: 0.17
Nodes (17): dasaIndexForLord(), DasaLordDuration, VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_TOTAL_YEARS, Nakshatra, NAKSHATRA_SPAN_DEGREES, NAMES, PADA_SPAN_DEGREES (+9 more)

### Community 15 - "Choghadiya Muhurta Windows"
Cohesion: 0.17
Nodes (17): vitest, CHOGHADIYA_CYCLE, CHOGHADIYA_DAY_OPENER, CHOGHADIYA_NATURE, ChoghadiyaName, DISHA_SHOOL, addDays(), buildChoghadiyaSlots() (+9 more)

### Community 16 - "Pushkara and Navamsa"
Cohesion: 0.19
Nodes (13): NAVAMSA_SPAN_DEGREES, PUSHKARA_BHAGA_DEGREE, PUSHKARA_NAVAMSA_PADAS, Rasi, longitudeToNavamsa(), NavamsaPosition, navamsaStartRasiIndex(), computePushkara() (+5 more)

### Community 17 - "Panchangam Page Display"
Cohesion: 0.23
Nodes (15): computeDurmuhurtam(), computeGowriPanchangam(), computeMahadoshas(), computeSpecialDayYogas(), computeVarjyamAndAmrita(), addCalendarDays(), parseDateAtNoonUtc(), searchMuhurtaDays() (+7 more)

### Community 18 - "Retrograde Planet Names"
Cohesion: 0.27
Nodes (9): SOUTH_GRID, PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME, getRetrogradeStatus(), RetrogradeMap, signedDiff(), ChartResult, LongitudeMap (+1 more)

### Community 19 - "Karaka Type Definitions"
Cohesion: 0.18
Nodes (9): BHAVA_KARAKAS, KarakaSection, MODERN_SITUATIONS_MORE, Pair, SPECIAL_EXTRA_KARAKAS, KarakaAttribute, KarakaCategoryGroup, KarakaEntry (+1 more)

### Community 20 - "Arudha Houses Prasna"
Cohesion: 0.24
Nodes (11): rasiLord(), RASIS, computeAllArudhaPadas(), computeArudhaPada(), mod12(), houseRasiIndex(), planetHouses(), rasiToHouseNumber() (+3 more)

### Community 21 - "TypeScript Compiler Config"
Cohesion: 0.12
Nodes (16): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 22 - "Ashtakavarga Bindus"
Cohesion: 0.23
Nodes (14): ASHTAKAVARGA_BINDU_HOUSES, ASHTAKAVARGA_CONTRIBUTORS, ASHTAKAVARGA_PLANETS, AshtakavargaContributor, AshtakavargaPlanet, GRAHA_GUNAKARA, KAKSHYA_LORDS, RASI_GUNAKARA (+6 more)

### Community 23 - "India Places Generator"
Cohesion: 0.13
Nodes (9): byState, cityCount, districtsJson, lines, outPath, root, stateNames, statesJson (+1 more)

### Community 24 - "Jyotish Scope Features"
Cohesion: 0.22
Nodes (12): FeatureRow(), JyotishScopePanel(), STATUS_CLASS, STATUS_LABEL, featuresByStatus(), featuresForPage(), JYOTISH_FEATURES, JyotishFeature (+4 more)

### Community 25 - "Muhurta Activity Rules"
Cohesion: 0.13
Nodes (14): AVOID_AMAVASYA_CHATURDASHI, FIERCE_SHARP_NAK, FIXED_LAGNAS, MOVABLE_DUAL_LAGNAS, MUHURTA_ACTIVITIES, MUHURTA_CATEGORIES, MuhurtaActivityCategory, MuhurtaActivityDef (+6 more)

### Community 26 - "Shadbala Dignity Scores"
Cohesion: 0.29
Nodes (7): computePartialShadbala(), DEBILITATION, dignityScore(), EXALTATION, FRIENDS, OWN_SIGNS, PlanetDignityScore

### Community 28 - "Verification and Accuracy"
Cohesion: 0.50
Nodes (3): Chennai 2000 spot-check pipeline, Ephemeris accuracy limits, Vitest engine test suite

## Knowledge Gaps
- **14 isolated node(s):** `@types/react`, `@types/react-dom`, `typescript`, `LAHIRI`, `Astro Vedic Tamil Web App` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 233 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Birth Input App Shell` to `KP and Ephemeris`, `Package Build Tooling`, `Advanced Jyotish Points`, `Shodashavarga Charts`, `South Indian Chart UI`, `Karakam Popup UI`, `Panchangam Page Display`, `Retrograde Planet Names`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `@types/react`, `@types/react-dom`, `typescript` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Birth Input App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.05881254667662435 - nodes in this community are weakly interconnected._
- **Why does `RASIS` connect `Arudha Houses Prasna` to `Birth Input App Shell`, `KP and Ephemeris`, `Porutham Yoga Dosha`, `Muhurta Day Scoring`, `Advanced Jyotish Points`, `Nakshatra Karaka Data`, `Shodashavarga Charts`, `South Indian Chart UI`, `Pushkara and Navamsa`, `Panchangam Page Display`, `Retrograde Planet Names`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `KP and Ephemeris` be split into smaller, more focused modules?**
  _Cohesion score 0.07685185185185185 - nodes in this community are weakly interconnected._
- **Why does `normalizeDegrees()` connect `KP and Ephemeris` to `Panchanga Sun Times`, `Muhurta Day Scoring`, `Advanced Jyotish Points`, `Shodashavarga Charts`, `South Indian Chart UI`, `Classical Muhurta Rules`, `Vimshottari Dasa Engine`, `Pushkara and Navamsa`, `Panchangam Page Display`, `Arudha Houses Prasna`, `Ashtakavarga Bindus`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Porutham Yoga Dosha` be split into smaller, more focused modules?**
  _Cohesion score 0.0743321718931475 - nodes in this community are weakly interconnected._