import type { Planet } from "../engine/types";

export interface KpPlanetRemedy {
  day: string;
  dayTa: string;
  deity: string;
  deityTa: string;
  mantra: string;
  temple: string;
  templeTa: string;
  dana: string;
  danaTa: string;
  practice: string;
  practiceTa: string;
  /** Advisory only — wear a gem only after consulting a qualified astrologer. */
  gem: string;
  gemTa: string;
}

export const KP_PLANET_REMEDIES: Record<Planet, KpPlanetRemedy> = {
  Sun: {
    day: "Sunday",
    dayTa: "ஞாயிறு",
    deity: "Surya / Shiva",
    deityTa: "சூரியன் / சிவன்",
    mantra: "Om Hraam Hreem Hraum Sah Suryaya Namah",
    temple: "Suryanar Kovil (near Kumbakonam)",
    templeTa: "சூரியனார் கோவில் (கும்பகோணம் அருகில்)",
    dana: "Wheat, jaggery, copper, red cloth",
    danaTa: "கோதுமை, வெல்லம், செம்பு, சிவப்புத் துணி",
    practice: "Aditya Hridayam, Surya Namaskar, offer water (arghya) at sunrise",
    practiceTa: "ஆதித்ய ஹிருதயம், சூரிய நமஸ்காரம், சூரிய உதயத்தில் அர்க்யம்",
    gem: "Ruby (Manikyam)",
    gemTa: "மாணிக்கம்",
  },
  Moon: {
    day: "Monday",
    dayTa: "திங்கள்",
    deity: "Chandra / Parvati",
    deityTa: "சந்திரன் / பார்வதி",
    mantra: "Om Shraam Shreem Shraum Sah Chandraya Namah",
    temple: "Thingalur Kailasanathar (near Thiruvaiyaru)",
    templeTa: "திங்களூர் கைலாசநாதர் (திருவையாறு அருகில்)",
    dana: "Raw rice, milk, white cloth, silver",
    danaTa: "பச்சரிசி, பால், வெள்ளைத் துணி, வெள்ளி",
    practice: "Serve mother, Ambal worship, Pradosham fasting",
    practiceTa: "தாய் சேவை, அம்பாள் வழிபாடு, பிரதோஷ விரதம்",
    gem: "Pearl (Muthu)",
    gemTa: "முத்து",
  },
  Mars: {
    day: "Tuesday",
    dayTa: "செவ்வாய்",
    deity: "Murugan / Hanuman",
    deityTa: "முருகன் / அனுமன்",
    mantra: "Om Kraam Kreem Kraum Sah Bhaumaya Namah",
    temple: "Vaitheeswaran Koil (near Sirkazhi)",
    templeTa: "வைத்தீஸ்வரன் கோவில் (சீர்காழி அருகில்)",
    dana: "Toor dal, red cloth, copper, jaggery",
    danaTa: "துவரம் பருப்பு, சிவப்புத் துணி, செம்பு, வெல்லம்",
    practice: "Skanda Shashti Kavacham, Murugan worship, blood donation",
    practiceTa: "கந்த சஷ்டி கவசம், முருகன் வழிபாடு, இரத்த தானம்",
    gem: "Red Coral (Pavalam)",
    gemTa: "பவளம்",
  },
  Mercury: {
    day: "Wednesday",
    dayTa: "புதன்",
    deity: "Vishnu / Budha",
    deityTa: "விஷ்ணு / புதன்",
    mantra: "Om Braam Breem Braum Sah Budhaya Namah",
    temple: "Thiruvenkadu Swetharanyeswarar (near Sirkazhi)",
    templeTa: "திருவெண்காடு ஸ்வேதாரண்யேஸ்வரர் (சீர்காழி அருகில்)",
    dana: "Green gram, green cloth, books",
    danaTa: "பச்சைப் பயறு, பச்சைத் துணி, புத்தகங்கள்",
    practice: "Vishnu Sahasranamam, feed cows, help students",
    practiceTa: "விஷ்ணு சஹஸ்ரநாமம், பசுவுக்கு உணவு, மாணவர்களுக்கு உதவி",
    gem: "Emerald (Maragatham)",
    gemTa: "மரகதம்",
  },
  Jupiter: {
    day: "Thursday",
    dayTa: "வியாழன்",
    deity: "Dakshinamurthy / Guru",
    deityTa: "தட்சிணாமூர்த்தி / குரு",
    mantra: "Om Graam Greem Graum Sah Gurave Namah",
    temple: "Alangudi Apatsahayeswarar (near Needamangalam)",
    templeTa: "ஆலங்குடி ஆபத்சகாயேஸ்வரர் (நீடாமங்கலம் அருகில்)",
    dana: "Bengal gram, turmeric, yellow cloth, books",
    danaTa: "கடலைப் பருப்பு, மஞ்சள், மஞ்சள் துணி, புத்தகங்கள்",
    practice: "Dakshinamurthy worship, respect teachers and elders",
    practiceTa: "தட்சிணாமூர்த்தி வழிபாடு, குரு/பெரியோர் மரியாதை",
    gem: "Yellow Sapphire (Pushparagam)",
    gemTa: "புஷ்பராகம்",
  },
  Venus: {
    day: "Friday",
    dayTa: "வெள்ளி",
    deity: "Mahalakshmi",
    deityTa: "மகாலட்சுமி",
    mantra: "Om Draam Dreem Draum Sah Shukraya Namah",
    temple: "Kanjanur Agneeswarar (near Kumbakonam)",
    templeTa: "கஞ்சனூர் அக்னீஸ்வரர் (கும்பகோணம் அருகில்)",
    dana: "White beans (mochai), white silk, curd, sugar",
    danaTa: "மொச்சை, வெள்ளைப் பட்டு, தயிர், சர்க்கரை",
    practice: "Lalitha Sahasranamam, Mahalakshmi worship, respect women",
    practiceTa: "லலிதா சஹஸ்ரநாமம், மகாலட்சுமி வழிபாடு, பெண்களுக்கு மரியாதை",
    gem: "Diamond / White Sapphire (Vairam)",
    gemTa: "வைரம்",
  },
  Saturn: {
    day: "Saturday",
    dayTa: "சனி",
    deity: "Shani Bhagavan / Hanuman",
    deityTa: "சனி பகவான் / அனுமன்",
    mantra: "Om Praam Preem Praum Sah Shanaye Namah",
    temple: "Thirunallar Darbaranyeswarar (near Karaikal)",
    templeTa: "திருநள்ளாறு தர்பாரண்யேஸ்வரர் (காரைக்கால் அருகில்)",
    dana: "Black sesame, gingelly oil, black cloth, iron",
    danaTa: "எள், நல்லெண்ணெய், கருப்புத் துணி, இரும்பு",
    practice: "Sesame-oil lamp, Hanuman worship, feed crows, serve labourers",
    practiceTa: "எள் எண்ணெய் தீபம், அனுமன் வழிபாடு, காகத்துக்கு உணவு, உழைப்பாளிகளுக்கு உதவி",
    gem: "Blue Sapphire (Neelam) — test carefully",
    gemTa: "நீலம் (கவனமாக சோதித்து)",
  },
  Rahu: {
    day: "Saturday (Rahu Kalam)",
    dayTa: "சனி (ராகு காலம்)",
    deity: "Durga / Naga devata",
    deityTa: "துர்க்கை / நாகர்",
    mantra: "Om Bhraam Bhreem Bhraum Sah Rahave Namah",
    temple: "Thirunageswaram Naganathar (near Kumbakonam)",
    templeTa: "திருநாகேஸ்வரம் நாகநாதர் (கும்பகோணம் அருகில்)",
    dana: "Urad dal, blue cloth, blankets",
    danaTa: "உளுந்து, நீலத் துணி, போர்வை",
    practice: "Durga worship in Rahu Kalam, milk abhishekam to Naga idols",
    practiceTa: "ராகு காலத்தில் துர்க்கை வழிபாடு, நாகருக்கு பால் அபிஷேகம்",
    gem: "Hessonite (Gomedhagam)",
    gemTa: "கோமேதகம்",
  },
  Ketu: {
    day: "Tuesday / Thursday",
    dayTa: "செவ்வாய் / வியாழன்",
    deity: "Ganesha / Chitragupta",
    deityTa: "விநாயகர் / சித்திரகுப்தர்",
    mantra: "Om Sraam Sreem Sraum Sah Ketave Namah",
    temple: "Keezhaperumpallam Naganathar (near Poompuhar)",
    templeTa: "கீழப்பெரும்பள்ளம் நாகநாதர் (பூம்புகார் அருகில்)",
    dana: "Horse gram, multi-coloured blanket, sesame",
    danaTa: "கொள்ளு, பல வண்ணப் போர்வை, எள்",
    practice: "Ganesha worship, feed dogs, meditation",
    practiceTa: "விநாயகர் வழிபாடு, நாய்களுக்கு உணவு, தியானம்",
    gem: "Cat's Eye (Vaiduryam)",
    gemTa: "வைடூரியம்",
  },
};

export interface KpTopicTip {
  en: string;
  ta: string;
}

/** Topic-specific lifestyle/ritual support, added alongside planetary remedies. */
export const KP_TOPIC_TIPS: Record<string, KpTopicTip> = {
  marriage: {
    en: "Worship Parvati–Parameswara (Friday/Monday); keep communication gentle; resolve family disputes before alliance talks.",
    ta: "பார்வதி–பரமேஸ்வரர் வழிபாடு (வெள்ளி/திங்கள்); பேச்சில் மென்மை; திருமணப் பேச்சுக்கு முன் குடும்பப் பிணக்கைத் தீர்க்கவும்.",
  },
  career: {
    en: "Offer water to the Sun at sunrise; honour seniors and employer; be punctual and consistent in effort.",
    ta: "சூரிய உதயத்தில் அர்க்யம்; மேலதிகாரிகளை மதித்தல்; நேரம் தவறாமை, தொடர் முயற்சி.",
  },
  finance: {
    en: "Lakshmi worship on Fridays; avoid speculative loans; save a fixed share of every income.",
    ta: "வெள்ளிக்கிழமை லட்சுமி வழிபாடு; ஊக கடன் தவிர்க்கவும்; ஒவ்வொரு வருமானத்திலும் சேமிப்பு.",
  },
  childbirth: {
    en: "Santana Gopala mantra, Jupiter worship on Thursdays; support children's welfare causes; medical check-ups for both partners.",
    ta: "சந்தான கோபால மந்திரம், வியாழன் குரு வழிபாடு; குழந்தை நல உதவி; இருவருக்கும் மருத்துவ பரிசோதனை.",
  },
  property: {
    en: "Bhumi/Varahi worship; verify title documents and legal clearance; start construction on a Mars-favourable day.",
    ta: "பூமி/வாராஹி வழிபாடு; பத்திரம், சட்ட சரிபார்ப்பு; செவ்வாய் சாதகமான நாளில் தொடக்கம்.",
  },
  education: {
    en: "Saraswati / Hayagriva worship; fixed study schedule; Wednesday offerings to Mercury.",
    ta: "சரஸ்வதி / ஹயக்ரீவர் வழிபாடு; நிலையான படிப்பு நேரம்; புதன் கிழமை வழிபாடு.",
  },
  foreign: {
    en: "Keep documents and visa paperwork precise; Ganesha worship before applying; Saturday lamp for obstacles.",
    ta: "ஆவணங்கள், விசா சரிபார்ப்பு; விண்ணப்பம் முன் விநாயகர் வழிபாடு; தடைக்கு சனிக்கிழமை தீபம்.",
  },
  litigation: {
    en: "Prefer settlement where possible; Murugan / Durga worship on Tuesdays; keep records and witnesses in order.",
    ta: "முடிந்தால் சமரசம்; செவ்வாய் முருகன்/துர்க்கை வழிபாடு; ஆதாரங்களை ஒழுங்காக வைக்கவும்.",
  },
  health: {
    en: "Maha Mrityunjaya mantra, regular check-ups, disciplined diet and sleep; do not postpone treatment.",
    ta: "மகா மிருத்யுஞ்சய மந்திரம், தொடர் பரிசோதனை, ஒழுங்கான உணவு/தூக்கம்; சிகிச்சையை தள்ளிப்போட வேண்டாம்.",
  },
};
