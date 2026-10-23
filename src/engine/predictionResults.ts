import {
  PLANET_ANSWER_SEED,
  PLANET_QUESTIONS,
  questionsForPlanets,
  yutiAnswer,
} from "../data/predictionQa";
import type { ChandraNadiResult } from "./chandraNadi";
import type { GkDegreePair, GkNatalAnalysis, GkPointId, GkTransitHit } from "./gkDegree";
import type { Planet } from "./types";
import { PLANETS } from "./types";

export type QaTone = "supportive" | "strained" | "mixed" | "past" | "upcoming";

export interface PredictionQa {
  source: string;
  question: string;
  answer: string;
  tone: QaTone;
}

function isPlanet(id: GkPointId): id is Planet {
  return PLANETS.includes(id as Planet);
}

function polarityLine(tone: QaTone): string {
  switch (tone) {
    case "supportive":
      return "Indication leans favourable — karakas tend to give result.";
    case "strained":
      return "Indication leans difficult — delay, dispute, or loss on these karakas.";
    case "past":
      return "This has already been touched — treat as a recent / ongoing chapter.";
    case "upcoming":
      return "This is next — prepare; the event has not fully landed.";
    default:
      return "Mixed — both the helpful and the hard side of the karaka can show.";
  }
}

function planetAnswer(planet: Planet, tone: QaTone, extra = ""): string {
  const seed = PLANET_ANSWER_SEED[planet];
  return `${polarityLine(tone)} ${planet} karakas: ${seed}.${extra ? ` ${extra}` : ""}`;
}

function pairAnswer(a: Planet, b: Planet, tone: QaTone): string {
  const yuti = yutiAnswer(a, b);
  return `${polarityLine(tone)}${yuti ? ` ${a}+${b}: ${yuti}` : ` Combine ${a} and ${b} karakas.`}`;
}

function toneForNatal(natal: GkNatalAnalysis, planet: Planet): QaTone {
  if (natal.nearRahuKetu.includes(planet)) return "strained";
  if (natal.nearJupiter.includes(planet) || planet === "Jupiter") return "supportive";
  return "mixed";
}

export function buildDegreeSystemPredictions(
  natal: GkNatalAnalysis,
  combinations: GkDegreePair[],
  transitHits: GkTransitHit[],
  dasaLords: string[] = [],
): PredictionQa[] {
  const rows: PredictionQa[] = [];

  if (isPlanet(natal.highest.id)) {
    const planet = natal.highest.id;
    const tone = toneForNatal(natal, planet);
    for (const question of PLANET_QUESTIONS[planet]) {
      rows.push({
        source: `Highest degree — ${planet}`,
        question,
        answer: planetAnswer(
          planet,
          tone,
          "As the highest-degree graha this sets the native's main drive, career bent and preferences.",
        ),
        tone,
      });
    }
  }

  if (isPlanet(natal.lowest.id)) {
    const planet = natal.lowest.id;
    const tone = natal.nearRahuKetu.includes(planet) ? "strained" : "mixed";
    for (const question of PLANET_QUESTIONS[planet]) {
      rows.push({
        source: `Lowest degree — ${planet}`,
        question,
        answer: planetAnswer(
          planet,
          tone,
          "As the lowest-degree graha these matters need more effort and show where support is thin.",
        ),
        tone,
      });
    }
  }

  for (const pair of combinations) {
    if (!isPlanet(pair.a) || !isPlanet(pair.b)) continue;
    const tone =
      natal.nearRahuKetu.includes(pair.a) || natal.nearRahuKetu.includes(pair.b)
        ? "strained"
        : natal.nearJupiter.includes(pair.a) || natal.nearJupiter.includes(pair.b)
          ? "supportive"
          : "mixed";
    const questions = questionsForPlanets([pair.a, pair.b]).slice(0, 8);
    for (const question of questions) {
      rows.push({
        source: `Degree yoga ${pair.a}–${pair.b} (Δ ${pair.degreeDelta.toFixed(2)}°)`,
        question,
        answer: pairAnswer(pair.a, pair.b, tone),
        tone,
      });
    }
  }

  const seenTransit = new Set<string>();
  for (const hit of transitHits) {
    if (!isPlanet(hit.natal) || hit.transit === hit.natal) continue;
    const key = `${hit.transit}-${hit.natal}`;
    if (seenTransit.has(key)) continue;
    seenTransit.add(key);
    const natalPlanet = hit.natal;
    const tone: QaTone =
      hit.status === "passed" ? "past" : hit.status === "approaching" ? "upcoming" : "mixed";
    const extra =
      hit.transit === "Lagna"
        ? "Transit Lagna on this natal degree — the event tends to occur and is hard to stop."
        : hit.transit === "Moon"
          ? "Transit Moon on this natal degree — the situation around the event; it can still be avoided."
          : isPlanet(hit.transit)
            ? (yutiAnswer(natalPlanet, hit.transit) ?? `Transit ${hit.transit} is combining with natal ${natalPlanet}.`)
            : `Transit ${hit.transit} is on natal ${natalPlanet}.`;
    for (const question of PLANET_QUESTIONS[natalPlanet].slice(0, 4)) {
      rows.push({
        source: `Transit ${hit.transit} → natal ${natalPlanet} (${hit.status})`,
        question,
        answer: `${polarityLine(tone)} ${extra}`,
        tone,
      });
    }
  }

  const healthLords = dasaLords.filter((lord): lord is Planet => isPlanet(lord as GkPointId));
  for (const lord of healthLords) {
    if (natal.highest.id !== lord && natal.lowest.id !== lord) continue;
    for (const question of PLANET_QUESTIONS[lord].filter((q) => /health|vitality|sleep|chronic|surgery/i.test(q))) {
      rows.push({
        source: `Dasa/Bhukti ${lord} (highest/lowest degree)`,
        question,
        answer: planetAnswer(lord, "strained", "Running dasa of a highest/lowest degree graha flags health strain."),
        tone: "strained",
      });
    }
  }

  return rows;
}

export function buildChandraNadiPredictions(nadi: ChandraNadiResult): PredictionQa[] {
  const rows: PredictionQa[] = [];
  const unfavourable = new Set(nadi.unfavourable.map((u) => u.planet));

  for (const link of nadi.querySignificators) {
    const tone: QaTone = unfavourable.has(link.planet) ? "strained" : link.planet === "Jupiter" ? "supportive" : "mixed";
    const how =
      link.relation === "conjunction"
        ? "Transit Moon is with this natal graha — this is the present question and the seed of the answer."
        : `Transit Moon is in the ${link.aspectHouse}th from natal ${link.planet} (aspect) — this graha speaks to the query and the answer.`;
    for (const question of PLANET_QUESTIONS[link.planet]) {
      rows.push({
        source: `Present — ${link.planet}`,
        question,
        answer: planetAnswer(link.planet, tone, how),
        tone,
      });
    }
  }

  if (nadi.querySignificators.length >= 2) {
    const planets = nadi.querySignificators.map((l) => l.planet);
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const tone: QaTone =
          unfavourable.has(planets[i]) || unfavourable.has(planets[j]) ? "strained" : "mixed";
        for (const question of questionsForPlanets([planets[i], planets[j]]).slice(0, 6)) {
          rows.push({
            source: `Present blend — ${planets[i]}+${planets[j]}`,
            question,
            answer: pairAnswer(planets[i], planets[j], tone),
            tone,
          });
        }
      }
    }
  }

  for (const item of nadi.justCrossed) {
    for (const question of PLANET_QUESTIONS[item.planet]) {
      rows.push({
        source: `Past — ${item.planet}`,
        question,
        answer: planetAnswer(
          item.planet,
          "past",
          "Transit Moon has just crossed this natal graha.",
        ),
        tone: "past",
      });
    }
  }

  for (const item of nadi.nextTouch) {
    for (const question of PLANET_QUESTIONS[item.planet]) {
      rows.push({
        source: `Upcoming — ${item.planet}`,
        question,
        answer: planetAnswer(
          item.planet,
          "upcoming",
          "Transit Moon will touch this natal graha next.",
        ),
        tone: "upcoming",
      });
    }
  }

  for (const link of nadi.unfavourable) {
    for (const question of PLANET_QUESTIONS[link.planet]) {
      rows.push({
        source: `6/8/12 — ${link.planet}`,
        question,
        answer: planetAnswer(
          link.planet,
          "strained",
          `Transit Moon is in the ${link.houseFromPlanet}th from natal ${link.planet}, so this karaka is under strain.`,
        ),
        tone: "strained",
      });
    }
  }

  return rows;
}
