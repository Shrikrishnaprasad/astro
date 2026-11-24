import { KP_PLANET_REMEDIES, KP_TOPIC_TIPS, type KpPlanetRemedy } from "../data/kpRemedies";
import { computeVimshottariDasa, type DasaPeriod } from "./dasa";
import type { KpEventPromise, KpPlanetSignificatorRow, KpSystemResult } from "./kp";
import type { Planet } from "./types";
import type { EphemerisSettings } from "./ephemerisSettings";
import { DEFAULT_EPHEMERIS_SETTINGS } from "./ephemerisSettings";
import { matchKpTopicDetailed } from "./kpHorary";
import { findKpTransitTriggers, type KpTransitTrigger, type TransitLongitudeCache } from "./kpTransit";

export type KpMode = "natal" | "horary249";
export type KpStrength = "strong" | "moderate";

export interface KpTimingWindow {
  start: Date;
  end: Date;
  dasaLord: Planet;
  bhuktiLord: Planet;
  /** Antara (pratyantar) sub-windows where the antara lord also qualifies. */
  antaras: {
    lord: Planet;
    start: Date;
    end: Date;
    /** Sookshma (4th level) sub-periods whose lord also qualifies/connects. */
    sookshmas: { lord: Planet; start: Date; end: Date }[];
  }[];
  strength: KpStrength;
  /** Window lords linked to the cusp sub-lord chain (sub, its star, or planets in their stars). */
  chainConnected: Planet[];
  /** Window lords that are also current Ruling Planets (confirmation). */
  rpConfirmed: Planet[];
  isCurrent: boolean;
}

export interface KpRemedyItem {
  planet: Planet;
  reasonEn: string;
  reasonTa: string;
  remedy: KpPlanetRemedy;
  /** "strengthen" supports a favorable planet; "pacify" calms a negating one. */
  kind: "strengthen" | "pacify";
}

export interface KpTopicPrediction {
  id: string;
  topic: string;
  topicTa: string;
  verdict: KpEventPromise["verdict"];
  verdictTa: string;
  /** Simple horary-style answer. */
  answer: "Yes" | "Yes, with delay" | "No / Not now";
  answerTa: string;
  predictionEn: string;
  predictionTa: string;
  eventPlanets: Planet[];
  windows: KpTimingWindow[];
  /** Transit dates (Sun/Jupiter/Saturn on event stars) inside the strongest windows. */
  triggers: { window: KpTimingWindow; dates: KpTransitTrigger[] }[];
  remedies: KpRemedyItem[];
  tipEn: string;
  tipTa: string;
  promise: KpEventPromise;
}

export interface KpPredictionReport {
  mode: KpMode;
  generatedAt: Date;
  currentDasa: { dasa: Planet; bhukti: Planet; antara: Planet | null } | null;
  currentSummaryEn: string;
  currentSummaryTa: string;
  currentRemedies: KpRemedyItem[];
  topics: KpTopicPrediction[];
  /** Topic matched from the horary question, if any. */
  questionTopicId: string | null;
}

const TOPIC_TA: Record<string, string> = {
  marriage: "திருமணம் & கூட்டாண்மை",
  career: "தொழில் & பதவி உயர்வு",
  finance: "செல்வம் & நிதி",
  childbirth: "குழந்தைப் பேறு",
  property: "சொத்து, வீடு & வாகனம்",
  education: "கல்வி",
  foreign: "வெளிநாடு பயணம் / குடியேற்றம்",
  litigation: "வழக்கு, போட்டி & கடன் வசூல்",
  health: "ஆரோக்கியம்",
};

const VERDICT_TA: Record<KpEventPromise["verdict"], string> = {
  "Promised (Strong)": "வலுவாக உறுதி",
  "Promised with Delay / Mixed": "தாமதம் / கலப்புடன் உறுதி",
  "Denied / Unfavorable": "மறுப்பு / சாதகமில்லை",
};

export function matchKpTopicFromQuestion(question: string): string | null {
  return matchKpTopicDetailed(question).topicId;
}

/** Planets that carry a topic: connect to favorable houses and outweigh negating ones. */
function topicEventPlanets(
  promise: KpEventPromise,
  rows: Record<Planet, KpPlanetSignificatorRow>,
): Planet[] {
  const result: Planet[] = [];
  for (const row of Object.values(rows)) {
    const houses = new Set(row.allHouses);
    const fav = promise.favorableHouses.filter((h) => houses.has(h)).length;
    const neg = promise.negatingHouses.filter((h) => houses.has(h)).length;
    const isCuspSub = row.planet === promise.cuspSubLord;
    if ((fav >= 2 && fav > neg) || (isCuspSub && fav >= 1)) result.push(row.planet);
  }
  return result;
}

/** Planets linked to the cusp sub-lord chain: the sub-lord, its star lord, and planets in their stars. */
function chainConnectedPlanets(
  promise: KpEventPromise,
  planets: KpSystemResult["planets"],
): Set<Planet> {
  const sub = promise.cuspSubLord as Planet;
  const star = promise.cuspSubLordStarLord as Planet;
  const set = new Set<Planet>([sub, star]);
  for (const [name, info] of Object.entries(planets) as [Planet, KpSystemResult["planets"][Planet]][]) {
    if (info.nakshatraLord === sub || info.nakshatraLord === star) set.add(name);
  }
  return set;
}

function pickRemedyItems(
  promise: KpEventPromise,
  rows: Record<Planet, KpPlanetSignificatorRow>,
): KpRemedyItem[] {
  const items: KpRemedyItem[] = [];
  const used = new Set<Planet>();
  const add = (planet: Planet, kind: KpRemedyItem["kind"], en: string, ta: string) => {
    if (used.has(planet)) return;
    used.add(planet);
    items.push({ planet, kind, reasonEn: en, reasonTa: ta, remedy: KP_PLANET_REMEDIES[planet] });
  };

  const sub = promise.cuspSubLord;
  add(
    sub,
    "strengthen",
    `${sub} is the Cusp ${promise.primaryCusp} Sub-Lord — it decides this matter. Strengthen it.`,
    `${sub} — ${promise.primaryCusp}-ஆம் பாவ உப-அதிபதி; இந்த விஷயத்தை நிர்ணயிக்கிறது. இதை வலுப்படுத்தவும்.`,
  );

  if (promise.verdict !== "Promised (Strong)") {
    const negRank = Object.values(rows)
      .filter((r) => r.planet !== sub)
      .map((r) => ({
        planet: r.planet,
        hits: promise.negatingHouses.filter((h) => r.allHouses.includes(h)).length,
        fav: promise.favorableHouses.filter((h) => r.allHouses.includes(h)).length,
      }))
      .filter((r) => r.hits >= 2 && r.hits > r.fav)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 2);
    for (const n of negRank) {
      add(
        n.planet,
        "pacify",
        `${n.planet} signifies obstructing houses (${promise.negatingHouses.filter((h) => rows[n.planet].allHouses.includes(h)).join(", ")}). Pacify it to reduce delay.`,
        `${n.planet} தடை பாவங்களை (${promise.negatingHouses.filter((h) => rows[n.planet].allHouses.includes(h)).join(", ")}) குறிக்கிறது. தாமதம் குறைய சாந்தி செய்யவும்.`,
      );
    }
    if (negRank.length === 0 && promise.matchedNegating.length > 0) {
      const star = promise.cuspSubLordStarLord as Planet;
      add(
        star,
        "pacify",
        `${star} is the Star Lord of the Sub-Lord and carries its results; keep it calm.`,
        `${star} உப-அதிபதியின் நட்சத்திர அதிபதி; பலனை வழங்குவதால் சாந்தி செய்யவும்.`,
      );
    }
  }
  return items;
}

function buildPredictionText(
  p: KpEventPromise,
  planet: KpSystemResult["planets"][Planet],
): { en: string; ta: string } {
  const fav = p.matchedFavorable.join(", ");
  const neg = p.matchedNegating.join(", ");
  const notes: string[] = [];
  const notesTa: string[] = [];
  if (planet.isRetrograde) {
    notes.push("The Sub-Lord is retrograde: expect revisions, repeats or a late start before fulfilment.");
    notesTa.push("உப-அதிபதி வக்ரம்: மாற்றம், மறுமுயற்சி அல்லது தாமத தொடக்கம் இருக்கலாம்.");
  }
  if (planet.isUntenanted) {
    notes.push("It is untenanted (no planet in its star), so it acts independently and strongly.");
    notesTa.push("இது நட்சத்திரத்தில் எந்த கிரகமும் இல்லாத நிலை; தனித்துவமாக வலுவாகச் செயல்படும்.");
  }

  let en: string;
  let ta: string;
  if (p.verdict === "Promised (Strong)") {
    en = `${p.topic}: the Cusp ${p.primaryCusp} Sub-Lord ${p.cuspSubLord} links to favorable houses (${fav}) with no negating houses. The event is clearly promised and should manifest in a supporting dasa–bhukti.`;
    ta = `${TOPIC_TA[p.id]}: ${p.primaryCusp}-ஆம் பாவ உப-அதிபதி ${p.cuspSubLord} சாதக பாவங்களுடன் (${fav}) தொடர்பு; தடை பாவங்கள் இல்லை. பலன் தெளிவாக உறுதி; உரிய தசா–புக்தியில் நிகழும்.`;
  } else if (p.verdict === "Promised with Delay / Mixed") {
    en = `${p.topic}: ${p.cuspSubLord} supports the matter through houses (${fav || "-"}) but also touches obstructing houses (${neg || "none"}). Result is possible with effort, delay or conditions; remedies and correct timing help.`;
    ta = `${TOPIC_TA[p.id]}: ${p.cuspSubLord} சாதக பாவங்கள் (${fav || "-"}) வழியாக ஆதரிக்கிறது; ஆனால் தடை பாவங்களையும் (${neg || "இல்லை"}) தொடுகிறது. முயற்சி, தாமதம் அல்லது நிபந்தனையுடன் பலன் சாத்தியம்; பரிகாரமும் சரியான காலமும் உதவும்.`;
  } else {
    en = `${p.topic}: ${p.cuspSubLord} lacks a firm link to the needed houses (${p.favorableHouses.join(", ")})${neg ? ` and touches (${neg})` : ""}. Fulfilment looks unlikely as asked now; revisit after a major dasa change and apply the remedies.`;
    ta = `${TOPIC_TA[p.id]}: ${p.cuspSubLord} தேவையான பாவங்களுடன் (${p.favorableHouses.join(", ")}) உறுதியான தொடர்பு இல்லை${neg ? `; (${neg}) பாவங்களைத் தொடுகிறது` : ""}. தற்போது கேட்டபடி பலன் குறைவு; தசா மாற்றத்துக்குப் பின் மீண்டும் பார்க்கவும்; பரிகாரம் செய்யவும்.`;
  }
  return {
    en: [en, ...notes].join(" "),
    ta: [ta, ...notesTa].join(" "),
  };
}

function findWindows(
  dasas: DasaPeriod[],
  qualifies: Set<Planet>,
  connected: Set<Planet>,
  rpSet: Set<Planet>,
  now: Date,
  horizonYears: number,
  limit: number,
): KpTimingWindow[] {
  const horizon = new Date(now.getTime() + horizonYears * 365.25 * 86400000);
  const out: KpTimingWindow[] = [];
  const useful = (p: Planet) => qualifies.has(p) || connected.has(p);
  for (const md of dasas) {
    if (md.end <= now || md.start >= horizon) continue;
    const mdQ = qualifies.has(md.lord as Planet);
    for (const bh of md.bhuktis) {
      if (bh.end <= now || bh.start >= horizon) continue;
      const bhQ = qualifies.has(bh.lord as Planet);
      if (!mdQ && !bhQ) continue;
      const lords = [md.lord as Planet, bh.lord as Planet];
      const rpConfirmed = lords.filter((p) => rpSet.has(p));
      const chainConnected = lords.filter((p) => connected.has(p));
      let strength: KpStrength | null = null;
      // Strong: both lords carry the matter AND at least one links to the sub-lord chain.
      if (mdQ && bhQ && chainConnected.length > 0) strength = "strong";
      else if ((mdQ && bhQ) || rpConfirmed.length > 0) strength = "moderate";
      if (!strength) continue;
      const antaras = bh.bhuktis
        .filter((a) => a.end > now && useful(a.lord as Planet))
        .map((a) => ({
          lord: a.lord as Planet,
          start: a.start < now ? now : a.start,
          end: a.end,
          sookshmas:
            strength === "strong"
              ? a.bhuktis
                  .filter((k) => k.end > now && useful(k.lord as Planet))
                  .map((k) => ({
                    lord: k.lord as Planet,
                    start: k.start < now ? now : k.start,
                    end: k.end,
                  }))
              : [],
        }));
      out.push({
        start: bh.start < now ? now : bh.start,
        end: bh.end,
        dasaLord: md.lord as Planet,
        bhuktiLord: bh.lord as Planet,
        antaras,
        strength,
        chainConnected: Array.from(new Set(chainConnected)),
        rpConfirmed: Array.from(new Set(rpConfirmed)),
        isCurrent: bh.start <= now && now < bh.end,
      });
    }
  }
  out.sort((a, b) => {
    if (a.strength !== b.strength) return a.strength === "strong" ? -1 : 1;
    return a.start.getTime() - b.start.getTime();
  });
  return out.slice(0, limit).sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function buildKpPredictionReport(
  kp: KpSystemResult,
  birthDate: Date,
  now: Date = new Date(),
  mode: KpMode = "natal",
  question = "",
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): KpPredictionReport {
  const transitCache: TransitLongitudeCache = new Map();
  const rows = Object.fromEntries(kp.planetSignificators.map((r) => [r.planet, r])) as Record<
    Planet,
    KpPlanetSignificatorRow
  >;
  const rpSet = new Set<Planet>(kp.rulingPlanets.rankedUnique.map((r) => r.planet));

  // Dasa timing is only meaningful for a natal chart (horary uses ruling planets instead).
  const dasas =
    mode === "natal" ? computeVimshottariDasa(kp.planets.Moon.longitude, birthDate, 1, 3) : null;

  let currentDasa: KpPredictionReport["currentDasa"] = null;
  if (dasas) {
    const md = dasas.find((d) => d.start <= now && now < d.end);
    const bh = md?.bhuktis.find((b) => b.start <= now && now < b.end);
    const an = bh?.bhuktis.find((a) => a.start <= now && now < a.end);
    if (md && bh) {
      currentDasa = {
        dasa: md.lord as Planet,
        bhukti: bh.lord as Planet,
        antara: (an?.lord as Planet) ?? null,
      };
    }
  }

  const topics: KpTopicPrediction[] = kp.eventPromises.map((promise) => {
    const eventPlanets = topicEventPlanets(promise, rows);
    const qualifies = new Set<Planet>(eventPlanets);
    const connected = chainConnectedPlanets(promise, kp.planets);
    const windows =
      dasas && promise.verdict !== "Denied / Unfavorable"
        ? findWindows(dasas, qualifies, connected, rpSet, now, 15, 5)
        : [];
    // Transit triggers only inside the first two strong windows (keeps scanning cheap).
    const triggerPlanets = new Set<Planet>([...qualifies, ...connected]);
    const triggers = windows
      .filter((w) => w.strength === "strong")
      .slice(0, 2)
      .map((w) => ({
        window: w,
        dates: findKpTransitTriggers(w.start, w.end, qualifies, triggerPlanets, settings, transitCache),
      }))
      .filter((t) => t.dates.length > 0);
    const text = buildPredictionText(promise, kp.planets[promise.cuspSubLord as Planet]);
    const tip = KP_TOPIC_TIPS[promise.id];
    const answer: KpTopicPrediction["answer"] =
      promise.verdict === "Promised (Strong)"
        ? "Yes"
        : promise.verdict === "Promised with Delay / Mixed"
          ? "Yes, with delay"
          : "No / Not now";
    const answerTa =
      answer === "Yes" ? "ஆம்" : answer === "Yes, with delay" ? "ஆம், தாமதத்துடன்" : "இல்லை / இப்போது இல்லை";
    return {
      id: promise.id,
      topic: promise.topic,
      topicTa: TOPIC_TA[promise.id] ?? promise.topic,
      verdict: promise.verdict,
      verdictTa: VERDICT_TA[promise.verdict],
      answer,
      answerTa,
      predictionEn: text.en,
      predictionTa: text.ta,
      eventPlanets,
      windows,
      triggers,
      remedies: pickRemedyItems(promise, rows),
      tipEn: tip?.en ?? "",
      tipTa: tip?.ta ?? "",
      promise,
    };
  });

  // Current period summary + remedies when the running lords signify 6/8/12 heavily.
  const currentRemedies: KpRemedyItem[] = [];
  let currentSummaryEn: string;
  let currentSummaryTa: string;
  if (currentDasa) {
    const lords = Array.from(new Set([currentDasa.dasa, currentDasa.bhukti]));
    const parts: string[] = [];
    const partsTa: string[] = [];
    for (const lord of lords) {
      const houses = rows[lord].allHouses;
      const hard = houses.filter((h) => [6, 8, 12].includes(h));
      const good = houses.filter((h) => [2, 6, 10, 11, 1, 5, 9].includes(h) && ![6, 8, 12].includes(h));
      parts.push(`${lord} signifies [${houses.join(", ")}]`);
      partsTa.push(`${lord} குறிக்கும் பாவங்கள் [${houses.join(", ")}]`);
      if (hard.length >= 2 && hard.length >= good.length) {
        currentRemedies.push({
          planet: lord,
          kind: "pacify",
          reasonEn: `Running ${lord} period signifies difficult houses (${hard.join(", ")}). Pacify to ease this phase.`,
          reasonTa: `நடப்பு ${lord} காலம் கடின பாவங்களை (${hard.join(", ")}) குறிக்கிறது. இந்த காலம் இலகுவாக சாந்தி செய்யவும்.`,
          remedy: KP_PLANET_REMEDIES[lord],
        });
      }
    }
    const rpOverlap = lords.filter((l) => rpSet.has(l));
    currentSummaryEn = `Running Dasa ${currentDasa.dasa} · Bhukti ${currentDasa.bhukti}${currentDasa.antara ? ` · Antara ${currentDasa.antara}` : ""}. ${parts.join("; ")}. ${rpOverlap.length ? `Ruling-planet confirmation: ${rpOverlap.join(", ")}.` : "No direct ruling-planet confirmation right now."}`;
    currentSummaryTa = `நடப்பு தசை ${currentDasa.dasa} · புக்தி ${currentDasa.bhukti}${currentDasa.antara ? ` · அந்தரம் ${currentDasa.antara}` : ""}. ${partsTa.join("; ")}. ${rpOverlap.length ? `ஆளும் கிரக உறுதி: ${rpOverlap.join(", ")}.` : "தற்போது ஆளும் கிரக உறுதி இல்லை."}`;
  } else if (mode === "horary249") {
    const top = kp.rulingPlanets.rankedUnique.slice(0, 3).map((r) => r.planet);
    currentSummaryEn = `Horary chart: judge the question by the Cusp Sub-Lord verdict; Ruling Planets now (${top.join(", ")}) confirm and time the event — periods of these planets are the likely timing.`;
    currentSummaryTa = `பிரசன்ன ஜாதகம்: கேள்வியை பாவ உப-அதிபதி தீர்ப்பால் காணவும்; இப்போதைய ஆளும் கிரகங்கள் (${top.join(", ")}) நிகழ்வை உறுதிசெய்து காலத்தைக் குறிக்கும்.`;
  } else {
    currentSummaryEn = "Current dasa could not be determined for this date.";
    currentSummaryTa = "இந்த தேதிக்கு நடப்பு தசை கணிக்க இயலவில்லை.";
  }

  return {
    mode,
    generatedAt: now,
    currentDasa,
    currentSummaryEn,
    currentSummaryTa,
    currentRemedies,
    topics,
    questionTopicId: mode === "horary249" ? matchKpTopicFromQuestion(question) : null,
  };
}
