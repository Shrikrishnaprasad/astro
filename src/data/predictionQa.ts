import { SPECIAL_KARAKAS } from "./karakas/specialKarakas";
import type { Planet } from "../engine/types";

/** Snapshot questions from this app's graha karakas — not a reprint of any book. */
export const PLANET_QUESTIONS: Record<Planet, string[]> = {
  Sun: [
    "Will I get recognition, promotion, or favour from government / a boss?",
    "How is father's health or a pending matter with father?",
    "Will an official, judge, or authority support me?",
    "Is my vitality, heart, or eyesight under strain?",
    "Should I take a leadership or public-facing role now?",
    "Will a government job, licence, or official paper move?",
  ],
  Moon: [
    "How is mother's health or peace of mind at home?",
    "Will travel, a public outing, or a change of place happen?",
    "Is my mind, sleep, or emotional state stable?",
    "Will the public / clients respond well to me?",
    "Is a matter about water, milk, food, or liquids indicated?",
    "Will I get rest, comfort, or a helpful woman in this period?",
  ],
  Mars: [
    "Will a property, land, or house matter move?",
    "Is there risk of accident, surgery, anger, or a fight?",
    "How are younger siblings or a courage-related decision?",
    "Will I win a dispute, sports matter, or technical task?",
    "Is a vehicle, engine, or blood-related health issue indicated?",
    "Should I start a new venture or construction now?",
  ],
  Mercury: [
    "Will a document, exam, speech, or contract go well?",
    "Is a trade, account, or business deal indicated?",
    "How is education, writing, or a student matter?",
    "Will friends, maternal uncle, or a messenger help?",
    "Is travel for work, a short trip, or a device issue shown?",
    "Should I sign, speak, or publish now?",
  ],
  Jupiter: [
    "Will children, a student, or a teaching matter go well?",
    "Is wealth, blessing, or a guru / advisor supporting me?",
    "Will marriage (for a woman) or a dharmic opportunity come?",
    "Is higher education, law, or a temple / charity matter indicated?",
    "Will a court case, visa for study, or counselling help?",
    "Is liver, weight, or sugar health a concern?",
  ],
  Venus: [
    "Will marriage, love, or a spouse matter move?",
    "Is luxury, vehicle, or a house comfort indicated?",
    "Will an arts, beauty, or hospitality opportunity come?",
    "How is reproductive / kidney health or marital harmony?",
    "Will I gain through women, fashion, or a luxury trade?",
    "Should I buy a vehicle or jewellery now?",
  ],
  Saturn: [
    "Will a job, labour, or long-pending work complete?",
    "Is delay, extra duty, or a servant / staff issue shown?",
    "How is longevity, bone, or chronic health?",
    "Will I get a factory, oil, iron, or service-sector opening?",
    "Is an elder, a debt, or a government process slow but sure?",
    "Should I accept a hard, long-term responsibility now?",
  ],
  Rahu: [
    "Will a foreign, visa, or sudden-opportunity matter move?",
    "Is technology, online work, or a large organisation indicated?",
    "Is there risk of confusion, scandal, or a sudden rise-and-fall?",
    "Will paternal-grandfather / in-law or a foreign person figure?",
    "Is research, aviation, or an unusual remedy shown?",
    "Should I take a speculative or unconventional path now?",
  ],
  Ketu: [
    "Is a spiritual, research, or detachment phase indicated?",
    "Will a past-life / ancestral or moksha-related question arise?",
    "Is surgery, infection, or a hidden health issue shown?",
    "Will I leave a job, place, or attachment suddenly?",
    "Is astrology, occult, or a maternal-grandfather matter indicated?",
    "Should I withdraw and do research rather than expand?",
  ],
};

export const PLANET_ANSWER_SEED: Record<Planet, string> = {
  Sun: "Soul, Father, King, Authority, Vitality, Bones, Right Eye, Heart",
  Moon: "Mind, Mother, Emotions, Blood, Water, Travel, Public, Left Eye",
  Mars: "Siblings, Courage, Land, Real Estate, Blood, Bone Marrow, Surgery, Defense",
  Mercury: "Intelligence, Education, Speech, Trade, Maternal Uncle, Nerves, Skin, Astrology",
  Jupiter: "Children, Wisdom, Wealth, Dharma, Guru, Husband (Female Chart), Liver, Fat",
  Venus: "Spouse, Wife, Marriage, Love, Luxury, Vehicles, House, Arts",
  Saturn: "Longevity, Karma, Profession, Hard Work, Delay, Discipline, Servants",
  Rahu: "Foreigners, Technology, Illusion, Sudden Rise, Research, Poison",
  Ketu: "Moksha, Spiritual Wisdom, Detachment, Astrology, Surgery, Roots",
};

const YUTI_ORDER: Planet[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
];

const YUTI_PAIR_RE =
  /^(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)\s*\+\s*(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu):\s*(.+)$/;

function yutiKey(a: Planet, b: Planet): string {
  const [left, right] =
    YUTI_ORDER.indexOf(a) <= YUTI_ORDER.indexOf(b) ? [a, b] : [b, a];
  return `${left}+${right}`;
}

function buildYutiMap(): Record<string, string> {
  const entry = SPECIAL_KARAKAS.find((e) => e.id === "special-graha-yuti");
  const map: Record<string, string> = {};
  if (!entry) return map;
  for (const group of entry.categories) {
    for (const item of group.items) {
      const match = item.match(YUTI_PAIR_RE);
      if (!match) continue;
      const a = match[1] as Planet;
      const b = match[2] as Planet;
      map[yutiKey(a, b)] = match[3].trim();
    }
  }
  return map;
}

const YUTI_MAP = buildYutiMap();

export function yutiAnswer(a: Planet, b: Planet): string | null {
  if (a === b) return null;
  return YUTI_MAP[yutiKey(a, b)] ?? null;
}

export function questionsForPlanets(planets: Planet[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const planet of planets) {
    for (const question of PLANET_QUESTIONS[planet]) {
      if (seen.has(question)) continue;
      seen.add(question);
      out.push(question);
    }
  }
  return out;
}
