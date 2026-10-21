/**
 * Builds src/data/placesIndia.ts from bundled Open Admin Data JSON
 * (scripts/in-states.json, scripts/in-districts.json).
 *
 * Regenerate: node scripts/generate-india-places.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const statesJson = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/in-states.json"), "utf8"),
);
const districtsJson = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/in-districts.json"), "utf8"),
);
const supplement = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/india-district-supplement.json"), "utf8"),
);

const IST = 5.5;

/** @type {Map<string, { name: string, lat: number, lon: number }[]>} */
const byState = new Map();

for (const d of districtsJson.entities) {
  const stateName = d.parent_name_en;
  if (!byState.has(stateName)) byState.set(stateName, []);
  byState.get(stateName).push({
    name: d.name_en,
    lat: round4(d.lat),
    lon: round4(d.lon),
  });
}

for (const d of supplement) {
  if (!byState.has(d.state)) byState.set(d.state, []);
  byState.get(d.state).push({
    name: d.name,
    lat: round4(d.lat),
    lon: round4(d.lon),
  });
}

for (const s of statesJson.entities) {
  if (!byState.has(s.name_en)) {
    byState.set(s.name_en, [
      { name: s.name_en, lat: round4(s.lat), lon: round4(s.lon) },
    ]);
  }
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

function dedupeAndSort(cities) {
  const seen = new Set();
  const out = [];
  for (const c of cities) {
    const key = c.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

const stateNames = [...byState.keys()].sort((a, b) => a.localeCompare(b));

const lines = [];
lines.push(`import type { PlaceState } from "./places";`);
lines.push("");
lines.push("/** All Indian states/UTs and district HQs (635 districts). Source: scripts/in-*.json */");
lines.push("export const INDIA_STATES: PlaceState[] = [");

for (const stateName of stateNames) {
  const cities = dedupeAndSort(byState.get(stateName));
  lines.push("  {");
  lines.push(`    name: ${JSON.stringify(stateName)},`);
  lines.push("    cities: [");
  for (const c of cities) {
    lines.push(
      `      { name: ${JSON.stringify(c.name)}, lat: ${c.lat}, lon: ${c.lon}, tzOffsetHours: ${IST} },`,
    );
  }
  lines.push("    ],");
  lines.push("  },");
}

lines.push("];");
lines.push("");

const outPath = path.join(root, "src/data/placesIndia.ts");
fs.writeFileSync(outPath, lines.join("\n"), "utf8");

const cityCount = stateNames.reduce((n, s) => n + byState.get(s).length, 0);
console.log(`Wrote ${outPath}`);
console.log(`${stateNames.length} states/UTs, ${cityCount} cities (before dedupe per state)`);
