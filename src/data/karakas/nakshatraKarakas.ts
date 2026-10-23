import { NAKSHATRAS, NAKSHATRA_SPAN_DEGREES } from "../nakshatras";
import { RASIS } from "../rasis";
import { tamilFromParen } from "./language";
import {
  GANA_TA,
  NADI_TA,
  NAKSHATRA_SEEDS_TA,
  NAME_SYLLABLES_TA,
  NATURE_TA,
  PLANET_TA,
  PURUSHARTHA_TA,
  RISHI_TA,
  VARNA_TA,
} from "./ta/nakshatraExtraTa";
import type { KarakaCategoryGroup, KarakaEntry } from "./types";

type NakshatraNature = "Dhruva" | "Chara" | "Ugra" | "Mishra" | "Kshipra" | "Mridu" | "Tikshna";
type Gana = "Deva" | "Manushya" | "Rakshasa";
type Nadi = "Adi (Vata)" | "Madhya (Pitta)" | "Antya (Kapha)";

interface NakshatraKarakaSeed {
  deity: string;
  symbol: string;
  gana: Gana;
  yoni: string;
  nadi: Nadi;
  nature: NakshatraNature;
  vriksha: string;
  bodyPart: string;
  traits: string[];
  professions: string[];
  health: string[];
}

const PURUSHARTHA_CYCLE = ["Dharma", "Artha", "Kama", "Moksha", "Moksha", "Kama", "Artha", "Dharma"];

const NATURE_INFO: Record<NakshatraNature, { label: string; activities: string[] }> = {
  Dhruva: {
    label: "Dhruva / Sthira — Fixed (ஸ்திரம்)",
    activities: [
      "Foundation laying, house construction, griha pravesam",
      "Coronation, taking permanent office, planting trees and gardens",
      "Long-term commitments, marriage, purchase of land",
    ],
  },
  Chara: {
    label: "Chara / Chala — Movable (சரம்)",
    activities: [
      "Travel, journeys, starting a vehicle or buying conveyances",
      "Change of residence, gardening, procession",
      "Activities needing movement, trade and commerce",
    ],
  },
  Ugra: {
    label: "Ugra / Krura — Fierce (உக்கிரம்)",
    activities: [
      "Confronting enemies, litigation, competitive actions",
      "Use of fire, weapons, poison; demolition",
      "Severe or decisive acts; avoid auspicious ceremonies",
    ],
  },
  Mishra: {
    label: "Mishra / Sadharana — Mixed (மிஸ்ரம்)",
    activities: [
      "Routine daily work, fire rituals (homa)",
      "Metal work, mixed activities with both auspicious and harsh elements",
      "Dealing with authority; avoid major new beginnings",
    ],
  },
  Kshipra: {
    label: "Kshipra / Laghu — Swift, Light (க்ஷிப்ரம்)",
    activities: [
      "Starting medical treatment, taking medicines",
      "Trade, sales, learning arts and crafts, short travel",
      "Sports, decoration, wearing ornaments, quick undertakings",
    ],
  },
  Mridu: {
    label: "Mridu / Maitra — Soft, Friendly (மிருது)",
    activities: [
      "Making friendships, romance, marriage",
      "Wearing new clothes and ornaments, music, dance, fine arts",
      "Auspicious celebrations, singing, sensual pleasures",
    ],
  },
  Tikshna: {
    label: "Tikshna / Daruna — Sharp, Dreadful (தீக்ஷ்ணம்)",
    activities: [
      "Exorcism, black magic removal, tantric rites",
      "Separation, punishment, surgery, training animals",
      "Investigation, digging into secrets; avoid auspicious ceremonies",
    ],
  },
};

const SEEDS: NakshatraKarakaSeed[] = [
  {
    deity: "Ashwini Kumaras (அஸ்வினி தேவர்கள்) — divine physicians",
    symbol: "Horse's head (குதிரைத் தலை)",
    gana: "Deva", yoni: "Horse — male (ஆண் குதிரை)", nadi: "Adi (Vata)", nature: "Kshipra",
    vriksha: "Etti / Strychnos (எட்டி)", bodyPart: "Knees, top of feet (முழங்கால்)",
    traits: ["Swift, energetic, pioneering, youthful", "Healing touch, helpful, adventurous", "Impatient, impulsive, starts many things"],
    professions: ["Physicians, emergency medicine, healers, veterinarians", "Horse trainers, transport, vehicles, racing, couriers", "Athletes, military, explorers, pharmaceutical work"],
    health: ["Head injuries, brain fevers, migraine", "Knee injuries, accidents due to haste", "Nervous excitability, smallpox, inflammation"],
  },
  {
    deity: "Yama (எமன்) — lord of death and dharma",
    symbol: "Yoni / womb (யோனி)",
    gana: "Manushya", yoni: "Elephant — male (ஆண் யானை)", nadi: "Madhya (Pitta)", nature: "Ugra",
    vriksha: "Nelli / Amla (நெல்லி)", bodyPart: "Head (தலை)",
    traits: ["Endurance, bearer of burdens, determined", "Strong morality and sense of justice", "Sensual, intense, transformative, extreme"],
    professions: ["Obstetricians, midwives, fertility specialists", "Judges, law enforcement, tax officials", "Film/entertainment, funeral & crematorium services, tobacco/coffee trade"],
    health: ["Reproductive and menstrual disorders", "Head and face ailments, venereal diseases", "Fevers, injuries to forehead"],
  },
  {
    deity: "Agni (அக்னி) — fire god",
    symbol: "Razor, axe, flame (கத்தி / தீ)",
    gana: "Rakshasa", yoni: "Goat / Sheep — female (பெண் ஆடு)", nadi: "Antya (Kapha)", nature: "Mishra",
    vriksha: "Athi / Fig (அத்தி)", bodyPart: "Eyes, waist (கண்)",
    traits: ["Sharp, purifying, critical, fiery", "Protective, nurturing like a foster mother", "Proud, quick-tempered, cutting speech"],
    professions: ["Cooks, bakers, chefs, fire-related work", "Metallurgy, weapons, military, surgeons", "Critics, editors, spiritual teachers, jewelers"],
    health: ["Eye diseases, burns, fevers", "Throat and neck issues (Vrishabha portion)", "Inflammations, malaria, accidents with fire"],
  },
  {
    deity: "Brahma / Prajapati (பிரம்மா) — creator",
    symbol: "Chariot, ox-cart (தேர் / வண்டி)",
    gana: "Manushya", yoni: "Serpent — male (ஆண் நாகம்)", nadi: "Antya (Kapha)", nature: "Dhruva",
    vriksha: "Naaval / Jamun (நாவல்)", bodyPart: "Forehead, legs (நெற்றி)",
    traits: ["Beautiful, charming, creative, artistic", "Fertile, growth-oriented, sensual, fond of luxury", "Materialistic, possessive, stable"],
    professions: ["Agriculture, horticulture, dairy, food industry", "Fashion, beauty, cosmetics, fine arts, music", "Transport, banking, real estate, hospitality"],
    health: ["Throat infections, colds, coughs", "Face, mouth and neck problems", "Reproductive and urinary issues, swellings"],
  },
  {
    deity: "Soma / Chandra (சோமன்) — the Moon nectar",
    symbol: "Deer's head (மான் தலை)",
    gana: "Deva", yoni: "Serpent — female (பெண் நாகம்)", nadi: "Madhya (Pitta)", nature: "Mridu",
    vriksha: "Karungali / Cutch tree (கருங்காலி)", bodyPart: "Eyebrows, eyes (புருவம்)",
    traits: ["Curious, searching, gentle, timid like a deer", "Intelligent, talkative, love of travel", "Restless, suspicious, indecisive"],
    professions: ["Researchers, explorers, travel writers", "Textiles, clothing, musicians, poets", "Real estate, forestry, animal husbandry, sales"],
    health: ["Throat and neck infections, voice problems", "Shoulder and arm complaints (Mithuna portion)", "Allergies, nervous restlessness, genital diseases"],
  },
  {
    deity: "Rudra (ருத்ரன்) — storm form of Shiva",
    symbol: "Teardrop, diamond, human head (கண்ணீர்த் துளி)",
    gana: "Manushya", yoni: "Dog — female (பெண் நாய்)", nadi: "Adi (Vata)", nature: "Tikshna",
    vriksha: "Senkali / Red cutch (செங்காலி)", bodyPart: "Hair, eyes (முடி)",
    traits: ["Intellectual, inquisitive, sharp", "Stormy emotions, destructive-transformative", "Hard-working, sometimes ungrateful or harsh"],
    professions: ["Software, electronics, computers, physics", "Research, pharmaceuticals, chemicals, surgery", "Journalists, translators, butchers, demolition work"],
    health: ["Asthma, dry cough, respiratory disorders", "Ear, throat and nervous disorders", "Mental agitation, headaches, cholera"],
  },
  {
    deity: "Aditi (அதிதி) — mother of the gods",
    symbol: "Bow and quiver (வில் & அம்பறாத்தூணி)",
    gana: "Deva", yoni: "Cat — female (பெண் பூனை)", nadi: "Adi (Vata)", nature: "Chara",
    vriksha: "Moongil / Bamboo (மூங்கில்)", bodyPart: "Nose, fingers (மூக்கு)",
    traits: ["Renewal, return to goodness, optimistic", "Content, generous, simple, forgiving", "Philosophical, loves home and travel"],
    professions: ["Teachers, philosophers, writers, priests", "Architects, builders, hotels, housing", "Travel, transport, shipping, export trade"],
    health: ["Nose, sinus and lung congestion, pneumonia", "Liver, stomach and breast ailments (Kataka portion)", "Ear problems, swelling, headaches"],
  },
  {
    deity: "Brihaspati (பிரகஸ்பதி) — guru of the gods",
    symbol: "Cow's udder, flower, circle (பசுவின் மடி)",
    gana: "Deva", yoni: "Goat / Sheep — male (ஆண் ஆடு)", nadi: "Madhya (Pitta)", nature: "Kshipra",
    vriksha: "Arasu / Peepal (அரசு)", bodyPart: "Face, mouth (முகம்)",
    traits: ["Nourishing, caring, protective, devout", "Learned, disciplined, conservative", "Most auspicious nakshatra; can be dogmatic"],
    professions: ["Priests, teachers, counselors, religious leaders", "Dairy, food, catering, child care, nursing", "Government, politics, charitable and civic work"],
    health: ["Stomach ulcers, gastric and chest complaints", "Cough, tuberculosis, breast diseases", "Jaundice, eczema, gall stones"],
  },
  {
    deity: "Sarpas / Nagas (நாகங்கள்) — serpent deities",
    symbol: "Coiled serpent (சுருண்ட பாம்பு)",
    gana: "Rakshasa", yoni: "Cat — male (ஆண் பூனை)", nadi: "Antya (Kapha)", nature: "Tikshna",
    vriksha: "Punnai / Alexandrian laurel (புன்னை)", bodyPart: "Ears (காது)",
    traits: ["Hypnotic, shrewd, perceptive, intuitive", "Secretive, protective, clinging", "Kundalini energy, cunning when afflicted"],
    professions: ["Astrologers, occultists, psychologists, yoga", "Poisons, pharmaceuticals, petroleum, chemicals", "Politics, espionage, snake charmers, lawyers"],
    health: ["Poisoning, allergies, toxicity", "Indigestion, flatulence, jaundice", "Ear diseases, nervous disorders, joint pain"],
  },
  {
    deity: "Pitrs (பித்ருக்கள்) — ancestors",
    symbol: "Royal throne, palanquin (சிம்மாசனம்)",
    gana: "Rakshasa", yoni: "Rat — male (ஆண் எலி)", nadi: "Antya (Kapha)", nature: "Ugra",
    vriksha: "Aalamaram / Banyan (ஆலமரம்)", bodyPart: "Lips, chin (உதடு)",
    traits: ["Royal, regal, proud, generous", "Respect for ancestors and tradition", "Leader, ambitious, needs recognition"],
    professions: ["Government, administration, executives, kings", "Historians, archaeologists, genealogists", "Ceremonial priests, actors, lawyers, managers"],
    health: ["Heart problems, palpitations", "Spinal and back disorders", "Lip and chin ailments, kidney stones"],
  },
  {
    deity: "Bhaga (பகன்) — god of marital bliss and fortune",
    symbol: "Front legs of cot, hammock (கட்டிலின் முன்கால்)",
    gana: "Manushya", yoni: "Rat — female (பெண் எலி)", nadi: "Madhya (Pitta)", nature: "Ugra",
    vriksha: "Purasu / Flame of forest (புரசு)", bodyPart: "Right hand (வலது கை)",
    traits: ["Pleasure-loving, relaxing, charming", "Creative, generous, affectionate", "Can be lazy, vain or indulgent"],
    professions: ["Entertainment, film, music, arts", "Luxury goods, cosmetics, marriage services", "Hospitality, photography, public relations"],
    health: ["Heart and blood pressure issues", "Spinal and back pain", "Reproductive and sexual disorders"],
  },
  {
    deity: "Aryaman (அர்யமான்) — god of contracts and patronage",
    symbol: "Back legs of cot, bed (கட்டிலின் பின்கால்)",
    gana: "Manushya", yoni: "Cow / Bull — male (எருது)", nadi: "Adi (Vata)", nature: "Dhruva",
    vriksha: "Alari / Oleander (அலரி)", bodyPart: "Left hand (இடது கை)",
    traits: ["Reliable, kind, helpful, socially responsible", "Leadership through patronage", "Honest, values friendship and marriage"],
    professions: ["Social work, administration, HR, management", "Marriage counselors, diplomats, charity", "Media, entertainment, government officers"],
    health: ["Intestinal and bowel disorders", "Liver complaints, hands injuries", "Throat swelling, headaches"],
  },
  {
    deity: "Savitar (சவிதா) — solar deity of creative power",
    symbol: "Hand, palm (கை)",
    gana: "Deva", yoni: "Buffalo — female (பெண் எருமை)", nadi: "Adi (Vata)", nature: "Kshipra",
    vriksha: "Velam / Acacia (வேலம்)", bodyPart: "Fingers (விரல்கள்)",
    traits: ["Dexterous, skilful, clever, humorous", "Practical, hard-working, resourceful", "Healing hands, can be cunning"],
    professions: ["Craftsmen, artisans, sculptors, artists", "Surgeons, masseurs, palmists, magicians", "Writers, comedians, sales, administration"],
    health: ["Hand and finger injuries", "Intestinal disorders, diarrhoea, colic", "Nervous problems, gas trouble"],
  },
  {
    deity: "Tvashtar / Vishwakarma (விஸ்வகர்மா) — celestial architect",
    symbol: "Bright jewel, pearl (ஒளிரும் மணி)",
    gana: "Rakshasa", yoni: "Tiger — female (பெண் புலி)", nadi: "Madhya (Pitta)", nature: "Mridu",
    vriksha: "Vilvam / Bael (வில்வம்)", bodyPart: "Neck, forehead (கழுத்து)",
    traits: ["Artistic, glamorous, attractive", "Design sense, creative, perfectionist", "Proud, desires recognition"],
    professions: ["Architects, engineers, interior designers", "Jewelers, fashion designers, photographers", "Plastic surgeons, beauticians, artists"],
    health: ["Neck and abdomen ailments (Kanni portion)", "Kidney and bladder issues (Tula portion)", "Skin problems, ulcers"],
  },
  {
    deity: "Vayu (வாயு) — wind god",
    symbol: "Young sprout, coral (இளந்தளிர்)",
    gana: "Deva", yoni: "Buffalo — male (ஆண் எருமை)", nadi: "Antya (Kapha)", nature: "Chara",
    vriksha: "Marudhu / Arjuna (மருது)", bodyPart: "Chest (மார்பு)",
    traits: ["Independent, flexible, adaptable", "Business-minded, diplomatic, polite", "Restless, scattered when weak"],
    professions: ["Traders, merchants, entrepreneurs", "Aviation, transport, sailors", "Diplomats, yoga teachers, legal advisors, musicians"],
    health: ["Kidney and urinary diseases", "Skin disorders, gas, Vata ailments", "Chest and lung complaints"],
  },
  {
    deity: "Indra & Agni (இந்திராக்னி)",
    symbol: "Triumphal arch, potter's wheel (தோரணம்)",
    gana: "Rakshasa", yoni: "Tiger — male (ஆண் புலி)", nadi: "Antya (Kapha)", nature: "Mishra",
    vriksha: "Vilaa / Wood apple (விளா)", bodyPart: "Breasts, arms (மார்பகம்)",
    traits: ["Goal-oriented, determined, ambitious", "Single-minded, competitive", "Can be jealous, quarrelsome"],
    professions: ["Politicians, leaders, military", "Researchers, scholars, debaters", "Sales, advertising, chemists"],
    health: ["Breast and chest disorders", "Kidney and bladder issues", "Genital and prostate diseases (Vrischika portion)"],
  },
  {
    deity: "Mitra (மித்ரன்) — god of friendship",
    symbol: "Lotus, staff (தாமரை)",
    gana: "Deva", yoni: "Deer — female (பெண் மான்)", nadi: "Madhya (Pitta)", nature: "Mridu",
    vriksha: "Magizham / Bullet wood (மகிழம்)", bodyPart: "Stomach (வயிறு)",
    traits: ["Friendly, devoted, cooperative", "Organizer, disciplined, balanced", "Success in foreign lands"],
    professions: ["Diplomats, organizers, group leaders", "Mining, occult research, psychology", "Photographers, statisticians, travel"],
    health: ["Stomach ailments, constipation", "Menstrual problems, piles", "Throat and bone issues"],
  },
  {
    deity: "Indra (இந்திரன்) — king of the gods",
    symbol: "Earring, umbrella, talisman (குடை / குண்டலம்)",
    gana: "Rakshasa", yoni: "Deer — male (ஆண் மான்)", nadi: "Adi (Vata)", nature: "Tikshna",
    vriksha: "Kuttippalai / Ivory wood (குட்டிப்பாலை)", bodyPart: "Right side of torso (வலது விலா)",
    traits: ["Senior, protective, courageous", "Proud, responsible, leadership", "Secretive, prone to jealousy"],
    professions: ["Police, military, defense officers", "Leaders, managers, administrators", "Occultists, detectives, surgeons"],
    health: ["Genital and anal disorders", "Colon and bladder diseases", "Arm and shoulder pain"],
  },
  {
    deity: "Nirriti (நிருதி) — goddess of dissolution",
    symbol: "Bunch of roots, elephant goad (வேர்க்கொத்து)",
    gana: "Rakshasa", yoni: "Dog — male (ஆண் நாய்)", nadi: "Adi (Vata)", nature: "Tikshna",
    vriksha: "Maa / Mango (மா)", bodyPart: "Left side of torso (இடது விலா)",
    traits: ["Investigative, goes to the root", "Philosophical, destructive-transformative", "Bold, outspoken, detached"],
    professions: ["Researchers, investigators, scientists", "Herbalists, Ayurveda, Siddha medicine", "Philosophers, demolition, mining, politics"],
    health: ["Hips, thighs and sciatica", "Back pain, rheumatism", "Liver complaints, lung troubles"],
  },
  {
    deity: "Apas (அப்) — water deities",
    symbol: "Elephant tusk, winnowing fan (முறம்)",
    gana: "Manushya", yoni: "Monkey — male (ஆண் குரங்கு)", nadi: "Madhya (Pitta)", nature: "Ugra",
    vriksha: "Vanji / Indian willow (வஞ்சி)", bodyPart: "Back (முதுகு)",
    traits: ["Invincible, persuasive, proud", "Purifying, idealistic, philosophical", "Stubborn when opposed"],
    professions: ["Shipping, water industries, navy", "Lawyers, debaters, motivational speakers", "Cosmetics, beverages, teachers"],
    health: ["Back and hip pain", "Thigh and sciatica issues", "Lung problems, diabetes, colds"],
  },
  {
    deity: "Vishvedevas (விஸ்வதேவர்கள்) — universal gods",
    symbol: "Elephant tusk, planks of bed (யானைத் தந்தம்)",
    gana: "Manushya", yoni: "Mongoose — male (கீரி)", nadi: "Antya (Kapha)", nature: "Dhruva",
    vriksha: "Pala / Jackfruit (பலா)", bodyPart: "Waist (இடுப்பு)",
    traits: ["Final victory, integrity, righteous", "Leadership, responsible, patient", "Can be rigid, delayed success"],
    professions: ["Government officers, judges, leaders", "Military, security, pioneers", "Professors, researchers, hunters"],
    health: ["Knee and skin problems", "Waist and thigh pain", "Eye diseases, stomach complaints"],
  },
  {
    deity: "Vishnu (விஷ்ணு) — the preserver",
    symbol: "Ear, three footprints (காது / மூன்று பாதச்சுவடு)",
    gana: "Deva", yoni: "Monkey — female (பெண் குரங்கு)", nadi: "Antya (Kapha)", nature: "Chara",
    vriksha: "Erukku / Crown flower (எருக்கு)", bodyPart: "Genitals, ears (பிறப்புறுப்பு)",
    traits: ["Listening, learning, wisdom", "Traditional, devoted, respectful", "Gossip and sensitivity when weak"],
    professions: ["Teachers, linguists, scholars", "Media, radio, telecom, music", "Counselors, travel, hospitality"],
    health: ["Ear diseases, hearing problems", "Knees, skin, eczema", "Lymphatic and digestive disorders"],
  },
  {
    deity: "Eight Vasus (அஷ்ட வசுக்கள்)",
    symbol: "Drum (மிருதங்கம்)",
    gana: "Rakshasa", yoni: "Lion — female (பெண் சிங்கம்)", nadi: "Madhya (Pitta)", nature: "Chara",
    vriksha: "Vanni / Prosopis (வன்னி)", bodyPart: "Anus, back (ஆசனம்)",
    traits: ["Wealthy, rhythmic, musical", "Generous, courageous, ambitious", "Can be arrogant or marital disharmony"],
    professions: ["Musicians, drummers, dancers", "Real estate, property, wealth management", "Sports, science, surgery, engineering"],
    health: ["Knee and calf problems", "Blood disorders, anaemia, palpitations", "Back and leg injuries"],
  },
  {
    deity: "Varuna (வருணன்) — god of cosmic waters",
    symbol: "Empty circle, hundred flowers (வட்டம்)",
    gana: "Rakshasa", yoni: "Horse — female (பெண் குதிரை)", nadi: "Adi (Vata)", nature: "Chara",
    vriksha: "Kadambu / Kadamba (கடம்பு)", bodyPart: "Right thigh (வலது தொடை)",
    traits: ["Healing (hundred physicians), secretive", "Scientific, mystical, independent", "Solitary, philosophical"],
    professions: ["Doctors, healers, pharmacists", "Astronomers, scientists, electricians", "Aviation, space, astrology"],
    health: ["Circulation disorders, varicose veins", "Calf and leg ailments", "Chronic and incurable diseases"],
  },
  {
    deity: "Aja Ekapada (அஜ ஏகபாதன்) — one-footed goat",
    symbol: "Sword, front legs of funeral cot (வாள்)",
    gana: "Manushya", yoni: "Lion — male (ஆண் சிங்கம்)", nadi: "Adi (Vata)", nature: "Ugra",
    vriksha: "Theymaa / Sweet mango (தேமா)", bodyPart: "Left thigh (இடது தொடை)",
    traits: ["Fiery, intense, ascetic", "Passionate, idealistic, radical", "Two-sided nature"],
    professions: ["Occultists, ascetics, astrologers", "Funeral services, mining", "Politicians, revolutionaries, researchers"],
    health: ["Ankle and feet problems", "Liver troubles, swelling", "Left side ailments, rib issues"],
  },
  {
    deity: "Ahirbudhnya (அஹிர்புத்னியன்) — serpent of the deep",
    symbol: "Back legs of funeral cot, twins (இரட்டையர்)",
    gana: "Manushya", yoni: "Cow — female (பசு)", nadi: "Madhya (Pitta)", nature: "Dhruva",
    vriksha: "Vembu / Neem (வேம்பு)", bodyPart: "Shins (கணுக்கால்)",
    traits: ["Deep, wise, stable", "Self-controlled, compassionate", "Spiritual, introverted"],
    professions: ["Counselors, charitable workers", "Yoga, meditation teachers", "Researchers, philosophers, non-profit"],
    health: ["Feet problems, flat foot", "Lymphatic disorders", "Constipation, hernia"],
  },
  {
    deity: "Pushan (பூஷன்) — nourisher and protector of travellers",
    symbol: "Fish, drum (மீன்)",
    gana: "Deva", yoni: "Elephant — female (பெண் யானை)", nadi: "Antya (Kapha)", nature: "Mridu",
    vriksha: "Iluppai / Mahua (இலுப்பை)", bodyPart: "Ankles (கணுக்கால்)",
    traits: ["Nourishing, compassionate, protective", "Safe travel, guiding others", "Gentle, artistic, idealistic"],
    professions: ["Travel guides, shepherds, transport", "Artists, musicians, actors", "Pastors, caretakers, social workers"],
    health: ["Feet and ankle ailments", "Ear diseases", "Intestinal and kidney problems"],
  },
];

const BIRDS = [
  "Rajali / hawk (ராஜாளி)", "Crow (காக்கை)", "Peacock (மயில்)", "Owl (ஆந்தை)", "Hen (கோழி)",
  "Andril bird (அன்றில்)", "Swan (அன்னம்)", "Cormorant (நீர்க்காகம்)", "Kingfisher (கிச்சிலி)",
  "Eagle (கழுகு)", "Female eagle (பெண் கழுகு)", "Kiluvai bird (கிளுவை)", "Kite (பருந்து)",
  "Woodpecker (மரங்கொத்தி)", "Bee (தேனீ)", "Red partridge (செஞ்சிவல்)", "Skylark (வானம்பாடி)",
  "Chakravaka / ruddy shelduck (சக்கரவாகம்)", "Crow-pheasant (செம்போத்து)", "Partridge (கௌதாரி)",
  "Valiyan bird (வலியன்)", "Drongo (கரிக்குருவி)", "Golden beetle (பொன்வண்டு)", "Jungle crow (அண்டங்காக்கை)",
  "Sandpiper (உள்ளான்)", "Owl (கோட்டான்)", "Falcon (வல்லூறு)",
];

const VARNAS: Record<number, string> = {};
const VARNA_GROUPS: Array<[string, number[]]> = [
  ["Brahmana", [2, 10, 19, 24]],
  ["Kshatriya", [7, 11, 20, 25]],
  ["Vaishya", [0, 6, 12]],
  ["Shudra", [3, 9, 16, 26]],
  ["Servant / farmer (Dasa)", [4, 13, 17, 22]],
  ["Butcher (Kasai)", [5, 14, 18, 23]],
  ["Outcaste (Mleccha)", [1, 8, 15, 21]],
];
for (const [varna, indices] of VARNA_GROUPS) {
  for (const i of indices) VARNAS[i] = varna;
}

const GOTRA_RISHIS = ["Marichi", "Vasishtha", "Angiras", "Atri", "Pulastya", "Pulaha", "Kratu"];

const NAME_SYLLABLES = [
  "Chu, Che, Cho, La", "Li, Lu, Le, Lo", "A, I, U, E", "O, Va, Vi, Vu", "Ve, Vo, Ka, Ki",
  "Ku, Gha, Ng, Chha", "Ke, Ko, Ha, Hi", "Hu, He, Ho, Da", "Di, Du, De, Do", "Ma, Mi, Mu, Me",
  "Mo, Ta, Ti, Tu", "Te, To, Pa, Pi", "Pu, Sha, Na, Tha", "Pe, Po, Ra, Ri", "Ru, Re, Ro, Ta",
  "Ti, Tu, Te, To", "Na, Ni, Nu, Ne", "No, Ya, Yi, Yu", "Ye, Yo, Bha, Bhi", "Bhu, Dha, Pha, Dha",
  "Be, Bo, Ja, Ji", "Ju/Khi, Je/Khu, Jo/Khe, Gha/Kho", "Ga, Gi, Gu, Ge", "Go, Sa, Si, Su",
  "Se, So, Da, Di", "Du, Tha, Jha, Na", "De, Do, Cha, Chi",
];

function gotra(index: number): string {
  // Gotra cycle runs over 28 nakshatras; Abhijit sits between Uttara Ashadha and Shravana.
  const position = index < 21 ? index : index + 1;
  return GOTRA_RISHIS[position % 7];
}

function formatDms(degrees: number): string {
  const totalMinutes = Math.round(degrees * 60);
  const d = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${d}°${String(m).padStart(2, "0")}′`;
}

function spanLabel(index: number, tamil = false): string {
  const start = index * NAKSHATRA_SPAN_DEGREES;
  const end = start + NAKSHATRA_SPAN_DEGREES;
  const startRasi = Math.floor(start / 30);
  const endRasi = Math.floor((end - 1e-9) / 30);
  const name = (r: number) => (tamil ? RASIS[r].nameTamil : RASIS[r].nameEnglish);
  const startText = `${name(startRasi)} ${formatDms(start - startRasi * 30)}`;
  const endText = `${name(endRasi)} ${formatDms(end - endRasi * 30)}`;
  return `${startText} – ${endText}`;
}

function padaNavamsas(index: number, tamil = false): string {
  return [0, 1, 2, 3]
    .map((pada) => {
      const navamsa = (index * 4 + pada) % 12;
      return tamil ? `பாதம் ${pada + 1}: ${RASIS[navamsa].nameTamil}` : `P${pada + 1}: ${RASIS[navamsa].nameEnglish}`;
    })
    .join(" • ");
}

function rasiLords(index: number, tamil = false): string {
  const start = index * NAKSHATRA_SPAN_DEGREES;
  const end = start + NAKSHATRA_SPAN_DEGREES;
  const startRasi = Math.floor(start / 30);
  const endRasi = Math.floor((end - 1e-9) / 30);
  const rasis = startRasi === endRasi ? [startRasi] : [startRasi, endRasi];
  return rasis
    .map((r) => (tamil ? `${RASIS[r].nameTamil} (${PLANET_TA[RASIS[r].lord]})` : `${RASIS[r].nameEnglish} (${RASIS[r].lord})`))
    .join(", ");
}

function paren(text: string): string {
  return tamilFromParen(text) ?? text;
}

export const NAKSHATRA_KARAKAS: KarakaEntry[] = NAKSHATRAS.map((nakshatra, index) => {
  const seed = SEEDS[index];
  const seedTa = NAKSHATRA_SEEDS_TA[index];
  const nature = NATURE_INFO[seed.nature];
  const natureTa = NATURE_TA[seed.nature];
  const lordTa = PLANET_TA[nakshatra.lord] ?? nakshatra.lord;
  const deityTa = paren(seed.deity);
  const vrikshaTa = paren(seed.vriksha);
  const categories: KarakaCategoryGroup[] = [
    { category: "Nature & Temperament (குணநலன்கள்)", categoryTamil: "குணநலன்", items: seed.traits, itemsTa: seedTa.traits },
    { category: "Professions & Career (தொழில்)", categoryTamil: "தொழில்", items: seed.professions, itemsTa: seedTa.professions },
    {
      category: "Body Part & Medical (உடல் & நோய்)",
      categoryTamil: "உடல் & நோய்",
      items: [`Nakshatra Purusha: ${seed.bodyPart}`, ...seed.health],
      itemsTa: [`நட்சத்திர புருஷ அங்கம்: ${paren(seed.bodyPart)}`, ...seedTa.health],
    },
    {
      category: `Suitable Activities — ${nature.label}`,
      categoryTamil: "முகூர்த்தம்",
      categoryTa: `ஏற்ற செயல்கள் — ${natureTa.label}`,
      items: nature.activities,
      itemsTa: natureTa.activities,
    },
    {
      category: "Bird, Varna, Gotra & Name Syllables (பட்சி, வர்ணம், கோத்திரம் & நாமாக்ஷரம்)",
      categoryTamil: "பட்சி & நாமாக்ஷரம்",
      items: [
        `Bird (பட்சி): ${BIRDS[index]}`,
        `Varna: ${VARNAS[index]}`,
        `Gotra (Rishi): ${gotra(index)}`,
        `Name syllables by pada (1–4): ${NAME_SYLLABLES[index]}`,
      ],
      itemsTa: [
        `பட்சி: ${paren(BIRDS[index])}`,
        `வர்ணம்: ${VARNA_TA[VARNAS[index]]}`,
        `கோத்திரம் (ரிஷி): ${RISHI_TA[gotra(index)]}`,
        `பாத வாரியான நாமாக்ஷரங்கள் (1–4): ${NAME_SYLLABLES_TA[index]}`,
      ],
    },
    {
      category: "Remedies & Worship (பரிகாரம் & வழிபாடு)",
      categoryTamil: "பரிகாரம்",
      items: [
        `Worship the presiding deity: ${seed.deity.split(" — ")[0]}`,
        `Worship the star lord ${nakshatra.lord} on its weekday, with its grain and gem`,
        `Plant, water or protect the nakshatra tree: ${seed.vriksha}`,
        `Feed or protect the yoni animal and the nakshatra bird`,
        "Tara Bala: counted from this janma star, favour the 2nd, 4th, 6th, 8th and 9th stars; avoid the 3rd, 5th and 7th (Vipat, Pratyak, Naidhana)",
      ],
      itemsTa: [
        `அதிதேவதை வழிபாடு: ${deityTa}`,
        `நட்சத்திர அதிபதியான ${lordTa} கிரகத்தை அவருக்குரிய கிழமையில், உரிய தானியம் & ரத்தினத்துடன் வழிபடவும்`,
        `நட்சத்திர மரத்தை நடுதல், நீர் ஊற்றுதல் அல்லது பாதுகாத்தல்: ${vrikshaTa}`,
        "யோனி விலங்கு & நட்சத்திரப் பட்சிக்கு உணவளித்தல் அல்லது பாதுகாத்தல்",
        "தாரா பலம்: இந்த ஜன்ம நட்சத்திரத்திலிருந்து எண்ணி 2, 4, 6, 8, 9-வது நட்சத்திரங்கள் நன்மை; 3, 5, 7-வது (விபத், பிரத்யக், நைதனம்) தவிர்க்கவும்",
      ],
    },
  ];

  return {
    id: `nakshatra-${index + 1}`,
    index: index + 1,
    section: "nakshatra",
    titleEnglish: `${index + 1}. ${nakshatra.nameEnglish}`,
    titleTamil: nakshatra.nameTamil,
    subtitle: `Lord: ${nakshatra.lord} • ${seed.gana} Gana • ${seed.nature}`,
    subtitleTa: `அதிபதி: ${lordTa} • ${GANA_TA[seed.gana]} • ${natureTa.label.split(" / ")[0]}`,
    badge: spanLabel(index),
    badgeTa: spanLabel(index, true),
    attributes: [
      { label: "Star Lord (நட்சத்திர அதிபதி)", value: nakshatra.lord, valueTa: lordTa },
      { label: "Rasi & Rasi Lord", value: rasiLords(index), valueTa: rasiLords(index, true) },
      { label: "Span", value: spanLabel(index), valueTa: spanLabel(index, true) },
      { label: "Pada Navamsas", value: padaNavamsas(index), valueTa: padaNavamsas(index, true) },
      { label: "Deity (அதிதேவதை)", value: seed.deity, valueTa: deityTa },
      { label: "Symbol (சின்னம்)", value: seed.symbol, valueTa: paren(seed.symbol) },
      { label: "Gana (கணம்)", value: seed.gana, valueTa: GANA_TA[seed.gana] },
      { label: "Yoni (யோனி)", value: seed.yoni, valueTa: paren(seed.yoni) },
      { label: "Nadi (நாடி)", value: seed.nadi, valueTa: NADI_TA[seed.nadi] },
      { label: "Purushartha", value: PURUSHARTHA_CYCLE[index % 8], valueTa: PURUSHARTHA_TA[PURUSHARTHA_CYCLE[index % 8]] },
      { label: "Nature (தன்மை)", value: nature.label, valueTa: natureTa.label },
      { label: "Vriksha (விருட்சம்)", value: seed.vriksha, valueTa: vrikshaTa },
    ],
    categories,
  };
});
