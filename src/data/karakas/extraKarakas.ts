import type { KarakaCategoryGroup } from "./types";

type Groups = Record<string, KarakaCategoryGroup[]>;

function group(category: string, categoryTamil: string, items: string[]): KarakaCategoryGroup {
  return { category, categoryTamil, items };
}

// —— Graha: additional classical karakas ——

interface GrahaClassicalSeed {
  time: string[];
  mind: string[];
  remedies: string[];
  nature: string[];
}

const GRAHA_CLASSICAL: Record<string, GrahaClassicalSeed> = {
  "graha-sun": {
    time: [
      "Weekday: Sunday (ஞாயிறு)",
      "Time unit ruled: Ayana (6-month solar half-year)",
      "Season: Grishma (summer) • Vimshottari Dasa: 6 years",
      "Age of maturity: 22 • Life stage: prime adulthood",
      "Strong at midday, in Uttarayana, in the 10th house",
    ],
    mind: [
      "Faculty: Atma (soul), willpower, self-respect, vitality",
      "Clothing: thick coarse cloth, copper-red or saffron garments",
      "Ornaments: gold and copper ornaments, crowns",
      "BPHS place: temples and places of worship",
    ],
    remedies: [
      "Temple: Suryanar Kovil (near Kumbakonam)",
      "Beeja mantra: Om Hraam Hreem Hraum Sah Suryaya Namah",
      "Samidh (sacred twig): Erukku / Arka",
      "Dana: wheat, jaggery, copper, red cloth • Fast on Sunday",
      "Practices: Surya Namaskar, Aditya Hridayam, offering water (arghya) at sunrise",
    ],
    nature: [
      "Foods: wheat, jaggery, saffron, oranges, pepper, ginger",
      "Plants: tall trees, thorny trees, red lotus, sunflower, Erukku",
      "Animals & birds: lion, horse, bull, swan, peacock",
    ],
  },
  "graha-moon": {
    time: [
      "Weekday: Monday (திங்கள்)",
      "Time unit ruled: Kshana / Muhurta (moment)",
      "Season: Varsha (monsoon) • Vimshottari Dasa: 10 years",
      "Age of maturity: 24 • Life stage: infancy",
      "Strong at night, in Shukla Paksha, in the 4th house",
    ],
    mind: [
      "Faculty: Manas (mind), emotions, memory, imagination",
      "Clothing: new, soft white cloth",
      "Ornaments: pearls, silver ornaments",
      "BPHS place: watery places — rivers, tanks, sea shores",
    ],
    remedies: [
      "Temple: Thingalur Kailasanathar (near Thiruvaiyaru)",
      "Beeja mantra: Om Shraam Shreem Shraum Sah Chandraya Namah",
      "Samidh: Purasu / Palasa",
      "Dana: raw rice, milk, white cloth, silver • Fast on Monday",
      "Practices: serving mother, Parvati / Ambal worship, Pradosham",
    ],
    nature: [
      "Foods: rice, milk, curd, sugarcane, watery vegetables (gourds, cucumber)",
      "Plants: milky-sap plants, creepers, white flowers, water lily",
      "Animals & birds: crab, fish, hare, water birds, cow",
    ],
  },
  "graha-mars": {
    time: [
      "Weekday: Tuesday (செவ்வாய்)",
      "Time unit ruled: Vara (a day)",
      "Season: Grishma (summer) • Vimshottari Dasa: 7 years",
      "Age of maturity: 28 • Life stage: middle age",
      "Strong in the 10th house, in Makara, in day births",
    ],
    mind: [
      "Faculty: Sattva (physical strength), courage, fighting spirit",
      "Clothing: red cloth, partly burnt cloth",
      "Ornaments: coral, copper ornaments",
      "BPHS place: fire places — kitchens, furnaces, battlefields",
    ],
    remedies: [
      "Temple: Vaitheeswaran Koil (near Sirkazhi)",
      "Beeja mantra: Om Kraam Kreem Kraum Sah Bhaumaya Namah",
      "Samidh: Karungali / Khadira",
      "Dana: toor dal, red cloth, copper, jaggery • Fast on Tuesday",
      "Practices: Murugan worship, Skanda Shashti Kavacham, donating blood",
    ],
    nature: [
      "Foods: toor dal, red lentils, chillies, pepper, garlic",
      "Plants: thorny trees, red-flowered plants, Karungali",
      "Animals & birds: ram, cock, tiger, jackal, monkey",
    ],
  },
  "graha-mercury": {
    time: [
      "Weekday: Wednesday (புதன்)",
      "Time unit ruled: Ritu (season of two months)",
      "Season: Sharad (autumn) • Vimshottari Dasa: 17 years",
      "Age of maturity: 32 • Life stage: childhood",
      "Strong in the 1st house, at sunrise and sunset",
    ],
    mind: [
      "Faculty: Vani (speech), intellect, discrimination, humour",
      "Clothing: wet or water-soaked green cloth",
      "Ornaments: emerald, brass ornaments",
      "BPHS place: playgrounds and sports fields",
    ],
    remedies: [
      "Temple: Thiruvenkadu Swetharanyeswarar (near Sirkazhi)",
      "Beeja mantra: Om Braam Breem Braum Sah Budhaya Namah",
      "Samidh: Naayuruvi / Apamarga",
      "Dana: green gram, green cloth, books • Fast on Wednesday",
      "Practices: Vishnu Sahasranamam, feeding cows, helping students",
    ],
    nature: [
      "Foods: green gram, leafy greens, mixed-taste dishes",
      "Plants: fruitless trees, creepers, tulsi, Naayuruvi",
      "Animals & birds: parrot, birds in general, goat, cat",
    ],
  },
  "graha-jupiter": {
    time: [
      "Weekday: Thursday (வியாழன்)",
      "Time unit ruled: Masa (a month)",
      "Season: Hemanta (pre-winter) • Vimshottari Dasa: 16 years",
      "Age of maturity: 16 • Life stage: mature age",
      "Strong in the 1st house, in day and night births alike",
    ],
    mind: [
      "Faculty: Jnana (knowledge) and Sukha (happiness)",
      "Clothing: cloth neither new nor old, yellow garments",
      "Ornaments: gold, yellow sapphire",
      "BPHS place: treasury and wealth stores",
    ],
    remedies: [
      "Temple: Alangudi Apatsahayeswarar (near Needamangalam)",
      "Beeja mantra: Om Graam Greem Graum Sah Gurave Namah",
      "Samidh: Arasu / Ashvattha",
      "Dana: Bengal gram, turmeric, yellow cloth, books • Fast on Thursday",
      "Practices: Dakshinamurthy worship, respecting teachers and elders",
    ],
    nature: [
      "Foods: Bengal gram, ghee, honey, sweets, banana, mango",
      "Plants: fruit-bearing trees, Peepal, yellow flowers",
      "Animals & birds: elephant, horse, swan, eagle",
    ],
  },
  "graha-venus": {
    time: [
      "Weekday: Friday (வெள்ளி)",
      "Time unit ruled: Paksha (fortnight)",
      "Season: Vasanta (spring) • Vimshottari Dasa: 20 years",
      "Age of maturity: 25 • Life stage: youth",
      "Strong in the 4th house, at night, in Meena",
    ],
    mind: [
      "Faculty: Madana (passion), desire, aesthetic sense",
      "Clothing: strong, durable fine silk; white and multi-coloured garments",
      "Ornaments: diamonds, silver, platinum, perfumes",
      "BPHS place: bedrooms and places of pleasure",
    ],
    remedies: [
      "Temple: Kanjanur Agneeswarar (near Kumbakonam)",
      "Beeja mantra: Om Draam Dreem Draum Sah Shukraya Namah",
      "Samidh: Athi / Udumbara",
      "Dana: mochai (white beans), white silk, curd, sugar • Fast on Friday",
      "Practices: Mahalakshmi worship, respecting women, Lalitha Sahasranamam",
    ],
    nature: [
      "Foods: white beans, curd, sweets, juicy fruits, rice dishes",
      "Plants: flowering plants, jasmine, lotus, Athi",
      "Animals & birds: cow, horse, peacock, swan, parrot",
    ],
  },
  "graha-saturn": {
    time: [
      "Weekday: Saturday (சனி)",
      "Time unit ruled: Varsha (a year)",
      "Season: Shishira (winter) • Vimshottari Dasa: 19 years",
      "Age of maturity: 36 • Life stage: old age",
      "Strong in the 7th house, at night, in Tula",
    ],
    mind: [
      "Faculty: Dukha (sorrow), endurance, detachment",
      "Clothing: old, torn or patched black cloth",
      "Ornaments: iron rings, blue sapphire",
      "BPHS place: filthy places — dumps, slums, cremation grounds",
    ],
    remedies: [
      "Temple: Thirunallar Darbaranyeswarar (near Karaikal)",
      "Beeja mantra: Om Praam Preem Praum Sah Shanaye Namah",
      "Samidh: Vanni / Shami",
      "Dana: black sesame, gingelly oil, black cloth, iron • Fast on Saturday",
      "Practices: lighting sesame-oil lamp, Hanuman worship, feeding crows, serving labourers",
    ],
    nature: [
      "Foods: sesame, black gram, millets (ragi), bitter and dry foods",
      "Plants: hardy and thorny trees, palmyra, Vanni",
      "Animals & birds: crow, buffalo, donkey, camel, dog",
    ],
  },
  "graha-rahu": {
    time: [
      "Day: Saturday (shares with Saturn) • Rahu Kalam every day",
      "Vimshottari Dasa: 18 years",
      "Age of maturity: 42",
      "Strong in the 3rd, 6th, 10th and 11th houses, at night",
    ],
    mind: [
      "Faculty: obsession, ambition, illusion, unconventional thinking",
      "Clothing: dark blue or smoky multi-coloured cloth",
      "Ornaments: hessonite (gomed), mixed alloys",
      "Places: anthills, dark holes, foreign lands, outskirts",
    ],
    remedies: [
      "Temple: Thirunageswaram Naganathar (near Kumbakonam)",
      "Beeja mantra: Om Bhraam Bhreem Bhraum Sah Rahave Namah",
      "Samidh: Arugu / Durva grass",
      "Dana: urad dal, blue cloth, lead, blankets",
      "Practices: Durga worship in Rahu Kalam, Naga worship, milk abhishekam to snake idols",
    ],
    nature: [
      "Foods: urad dal, garlic, onion, mushrooms, fermented foods",
      "Plants: Arugu grass, poisonous and narcotic plants, creepers in dark places",
      "Animals & birds: snakes, wolves, owls, mosquitoes, reptiles",
    ],
  },
  "graha-ketu": {
    time: [
      "Day: Tuesday (shares with Mars) • Emagandam period",
      "Vimshottari Dasa: 7 years",
      "Age of maturity: 48",
      "Strong in the 3rd, 6th, 11th and 12th houses",
    ],
    mind: [
      "Faculty: intuition, detachment, liberation (moksha)",
      "Clothing: multi-coloured or patched cloth, saffron robes of ascetics",
      "Ornaments: cat's eye (vaidurya), panchaloha",
      "Places: hermitages, caves, cremation grounds, corners of the house",
    ],
    remedies: [
      "Temple: Keezhaperumpallam Naganathar (near Poompuhar)",
      "Beeja mantra: Om Sraam Sreem Sraum Sah Ketave Namah",
      "Samidh: Darbha / Kusha grass",
      "Dana: horse gram, multi-coloured blanket, sesame",
      "Practices: Ganesha worship, Chitragupta worship, feeding dogs",
    ],
    nature: [
      "Foods: horse gram, roots and tubers, sprouts",
      "Plants: Darbha grass, Banyan tree, roots",
      "Animals & birds: dog, horned animals, vulture, mouse",
    ],
  },
};

// —— Graha: modern sub-groups ——

interface GrahaModernSeed {
  gadgets: string[];
  products: string[];
  careers: string[];
  places: string[];
  health: string[];
}

const GRAHA_MODERN: Record<string, GrahaModernSeed> = {
  "graha-sun": {
    gadgets: ["Solar panels, inverters, power banks", "LED lights, projectors, spotlights", "Smartwatch ECG and heart-rate monitors", "Government apps: DigiLocker, Aadhaar, passport portal"],
    products: ["Gold coins and bullion", "Ruby jewellery, copper bottles", "Vitamin D and heart supplements", "Sunglasses, sunscreen, spectacles"],
    careers: ["IAS / IPS / civil services", "Political leadership, PR for politicians", "Cardiologist, ophthalmologist", "Energy sector, power-grid engineers", "Start-up founder / CEO"],
    places: ["Secretariats, collectorates, ministries", "Solar farms, power stations", "Stadium VIP boxes, stages", "Shiva and Surya temples"],
    health: ["Hypertension, heart disease", "Vitamin D deficiency", "Eye strain, cataract", "Baldness, migraine, heat stroke"],
  },
  "graha-moon": {
    gadgets: ["Water purifiers, ROs, humidifiers", "Refrigerators, milk chillers", "Sleep trackers, smart night-lamps", "Cloud storage, backups (memory)"],
    products: ["Packaged milk, curd, ice-cream brands", "Bottled water, juices, soft drinks", "Baby care, maternity products", "Pearls, silver articles, white clothing"],
    careers: ["Nurses, caregivers, psychologists", "Hotel and restaurant management", "Dairy and beverage industry", "Travel agencies, tourism", "Public relations, customer experience"],
    places: ["Malls, food courts, cafés", "Swimming pools, water parks, beaches", "Maternity hospitals, crèches", "Ports, cruise terminals"],
    health: ["Anxiety, depression, insomnia", "Sinusitis, cold, asthma", "Hormonal and menstrual cycles", "Water retention, low BP"],
  },
  "graha-mars": {
    gadgets: ["Induction cooktops, microwaves, gas stoves", "Power tools, drills, welding machines", "Fitness bands, treadmills, gym equipment", "Fire alarms, CCTV, security systems"],
    products: ["Protein supplements, energy drinks", "Sports gear, bikes, helmets", "Red coral, copper", "Spices: chilli, pepper, garlic"],
    careers: ["Army, police, security agencies", "Surgeons, dentists, physiotherapists", "Civil and mechanical engineers", "Real-estate developers and brokers", "Professional athletes, fitness trainers"],
    places: ["Gyms, sports arenas, IPL grounds", "Construction sites, factories", "Police stations, army cantonments", "Operation theatres, emergency wards"],
    health: ["Accidents, cuts, burns, fractures", "High BP, bleeding, anaemia", "Piles, fistula, ulcers", "Inflammations, fevers, acne"],
  },
  "graha-mercury": {
    gadgets: ["Smartphones, laptops, tablets", "Keyboards, printers, scanners", "Calculators, POS machines, barcode scanners", "Routers, Wi-Fi, telecom networks"],
    products: ["Books, stationery, e-books, Kindle", "Apps, software licences, SaaS", "Green-coloured clothing, emerald", "Puzzle games, chess, educational toys"],
    careers: ["Software developers, data analysts", "Chartered accountants, auditors, GST consultants", "Journalists, content writers, translators", "Digital marketers, SEO experts", "Teachers, tutors, ed-tech trainers"],
    places: ["IT parks, co-working spaces", "Banks, post offices, courier hubs", "Schools, coaching centres, libraries", "Stock exchanges, trading desks"],
    health: ["Skin allergies, eczema", "Nervous anxiety, stammering", "Thyroid, speech disorders", "Screen-induced headaches, carpal tunnel"],
  },
  "graha-jupiter": {
    gadgets: ["Banking and investment apps", "E-readers, smart boards in classrooms", "Spiritual and astrology apps", "Legal research databases"],
    products: ["Gold, mutual funds, insurance policies", "Religious books, puja items, turmeric", "Yellow sapphire, gold jewellery", "Ghee, honey, organic foods"],
    careers: ["Bankers, fund managers, financial planners", "Professors, principals, education counsellors", "Judges, lawyers, legal advisors", "Priests, spiritual coaches, astrologers", "Paediatricians, fertility specialists"],
    places: ["Banks, treasuries, insurance offices", "Universities, temples, ashrams", "Courts and legal chambers", "Libraries, museums"],
    health: ["Diabetes, obesity", "Fatty liver, high cholesterol", "Jaundice, hepatitis", "Tumours, cysts"],
  },
  "graha-venus": {
    gadgets: ["Electric and luxury cars, premium bikes", "Smart TVs, home theatres, speakers", "Cameras, editing software", "Air conditioners, luxury appliances"],
    products: ["Cosmetics, skincare, perfumes", "Designer clothing, silk sarees, diamonds", "Home décor, furniture, mattresses", "Chocolates, desserts, wines"],
    careers: ["Actors, singers, dancers, models", "Fashion and interior designers", "Beauticians, salon owners, makeup artists", "Wedding planners, event managers", "Hotel, resort and luxury-retail managers"],
    places: ["Cinemas, OTT studios, malls", "Beauty salons, spas, boutiques", "Resorts, five-star hotels, wedding halls", "Car showrooms"],
    health: ["PCOD, hormonal imbalance", "Diabetes, kidney stones", "Sexual and fertility disorders", "Eye problems, cataract"],
  },
  "graha-saturn": {
    gadgets: ["Heavy machinery, JCBs, cranes", "Batteries, engines, generators", "Recycling and waste-management machines", "Physiotherapy and mobility aids"],
    products: ["Iron, steel, cement, coal", "Petroleum, oil, lubricants", "Leather goods, footwear", "Black sesame, gingelly oil"],
    careers: ["Factory workers, labour contractors", "Delivery partners, gig workers", "Mining, oil and gas engineers", "Sanitation and municipal services", "Elder-care, physiotherapy"],
    places: ["Factories, mines, oil refineries", "Construction sites, metro projects", "Old-age homes, hospitals, prisons", "Scrap yards, landfills"],
    health: ["Arthritis, knee and joint pain", "Chronic diseases, paralysis", "Dental decay, bone loss", "Depression, fatigue, constipation"],
  },
  "graha-rahu": {
    gadgets: ["AI tools, chatbots, VR headsets", "Drones, satellites, 5G", "Gaming consoles, online gaming", "Crypto wallets, trading apps"],
    products: ["Plastics, synthetics, chemicals", "Vapes, cigarettes, alcohol", "Junk food, energy drinks", "Foreign brands, imported goods"],
    careers: ["AI/ML engineers, cyber-security", "Pilots, aviation crew", "Film, animation, VFX", "Influencers, social media managers", "Import-export, MNC jobs"],
    places: ["Airports, foreign countries", "Data centres, server farms", "Casinos, clubs, pubs", "Research labs, chemical plants"],
    health: ["Viral infections, pandemics", "Allergies, poisoning", "Addictions, hallucinations", "Undiagnosed or mysterious illnesses"],
  },
  "graha-ketu": {
    gadgets: ["Coding tools, debuggers", "Microscopes, nanotech devices", "Fibre-optic cables, wires", "Meditation and astrology apps"],
    products: ["Cat's eye, panchaloha", "Ayurvedic and Siddha medicines", "Incense, rudraksha, puja items", "Herbal and organic remedies"],
    careers: ["Programmers, debuggers, cyber analysts", "Astrologers, healers, yoga teachers", "Microbiologists, lab technicians", "Surgeons (minor surgeries)", "Researchers in niche fields"],
    places: ["Ashrams, meditation centres", "Labs, diagnostic centres", "Pilgrimage sites, caves", "Remote and isolated places"],
    health: ["Unexplained pains", "Infections, worms", "Spinal issues, low BP", "Chickenpox, viral eruptions"],
  },
};

// —— Bhava: relatives, prasna, mundane ——

interface BhavaClassicalSeed {
  relatives: string[];
  prasna: string[];
  mundane: string[];
}

const BHAVA_CLASSICAL: Record<string, BhavaClassicalSeed> = {
  "bhava-1": {
    relatives: ["Self (ஜாதகர்)", "Spouse's spouse (7th from 7th) — the native as seen from the partner", "Father's 5th (5th from 9th) — the native as father's child"],
    prasna: ["The querent, their health and intent", "Success of the query itself", "Present condition and appearance of the person asking"],
    mundane: ["The nation and its people as a whole", "Public health and national character", "General condition of the country"],
  },
  "bhava-2": {
    relatives: ["Mother's elder sibling (11th from 4th)", "Spouse's longevity (8th from 7th)", "Second spouse (per Parashara, 8th from 7th)"],
    prasna: ["Money matters, lost wallet or valuables", "Family affairs", "Food, speech and recovery of cash lent"],
    mundane: ["National treasury and revenue", "Budget, foreign exchange reserves", "Banking sector and financial markets"],
  },
  "bhava-3": {
    relatives: ["Younger siblings (இளைய சகோதரர்)", "Father-in-law (9th from 7th)", "Neighbours and cousins"],
    prasna: ["Messages, letters, news, phone calls", "Short journeys", "Siblings' welfare, agreements"],
    mundane: ["Communications, media, telecom", "Transport, railways, roads", "Neighbouring countries"],
  },
  "bhava-4": {
    relatives: ["Mother (தாய்)", "Father's longevity (8th from 9th)", "Maternal relatives"],
    prasna: ["House, land, vehicle questions", "Location of lost items (hidden, buried, at home)", "Mother's welfare, end of the matter"],
    mundane: ["Land, agriculture, mines", "Opposition party, the masses", "Education system, weather, housing"],
  },
  "bhava-5": {
    relatives: ["First child", "Paternal grandfather (9th from 9th)", "Elder sibling's spouse (7th from 11th) and spouse's elder sibling (11th from 7th)"],
    prasna: ["Pregnancy and childbirth questions", "Love affairs, exam results", "Speculation, lottery, stock market"],
    mundane: ["Entertainment, sports, stock markets", "Birth rate, children's welfare", "Speculation and national morale"],
  },
  "bhava-6": {
    relatives: ["Maternal uncle and aunt (3rd and 11th from 4th)", "Step-mother, servants, employees", "Enemies, pets"],
    prasna: ["Disease, health of the patient", "Loans, debts, lawsuits", "Enemies, missing pets, servants"],
    mundane: ["Army, police, civil services", "Public health, epidemics", "Working class, labour unions"],
  },
  "bhava-7": {
    relatives: ["Spouse (கணவன் / மனைவி)", "Maternal grandmother (4th from 4th)", "Second child (3rd from 5th) and father's elder sibling (11th from 9th)"],
    prasna: ["Marriage proposals, partnerships", "Thief in lost-article questions", "Opponent, missing person"],
    mundane: ["Foreign relations, treaties", "War and peace", "International trade partners"],
  },
  "bhava-8": {
    relatives: ["Spouse's family and wealth (2nd from 7th)", "Children's home and property (4th from 5th)", "Opponent's wealth"],
    prasna: ["Danger, death, chronic illness", "Hidden matters, secrets", "Insurance, inheritance, debts of others"],
    mundane: ["National debt, taxes", "Death rate, disasters", "Secret services, hidden enemies within"],
  },
  "bhava-9": {
    relatives: ["Father (தந்தை), guru", "Grandchildren (5th from 5th)", "Younger sibling's spouse (7th from 3rd), spouse's younger sibling (3rd from 7th), third child"],
    prasna: ["Long journeys, foreign travel", "Father, religious or ethical questions", "Legal appeals, higher studies"],
    mundane: ["Judiciary, religion, universities", "Shipping, foreign trade", "Pilgrimages and religious institutions"],
  },
  "bhava-10": {
    relatives: ["Mother-in-law (4th from 7th)", "Boss, employer, superiors", "Father's wealth (2nd from 9th)"],
    prasna: ["Job, promotion, career queries", "Government matters, honours", "Result of an undertaking"],
    mundane: ["Head of state, government", "Ruling party", "National prestige and administration"],
  },
  "bhava-11": {
    relatives: ["Elder siblings (மூத்த சகோதரர்)", "Father's younger sibling (3rd from 9th)", "Son-in-law / daughter-in-law (7th from 5th), friends"],
    prasna: ["Gains, profits, wish fulfilment", "Recovery of lost items or money", "Friends and support"],
    mundane: ["Parliament, legislature", "Allies and friendly nations", "Municipal bodies, national gains"],
  },
  "bhava-12": {
    relatives: ["Paternal grandmother (4th from 9th)", "Maternal grandfather (9th from 4th)", "Spouse's illness and enemies (6th from 7th)"],
    prasna: ["Losses, expenses", "Imprisonment, hospitalisation", "Foreign travel, settling abroad"],
    mundane: ["Prisons, hospitals, asylums", "Secret enemies, espionage", "Foreign expenditure, refugees"],
  },
};

// —— Rasi: classification and foods ——

const TAMIL_MONTHS = ["Chithirai (சித்திரை)", "Vaikasi (வைகாசி)", "Aani (ஆனி)", "Aadi (ஆடி)", "Aavani (ஆவணி)", "Purattasi (புரட்டாசி)", "Aippasi (ஐப்பசி)", "Karthigai (கார்த்திகை)", "Margazhi (மார்கழி)", "Thai (தை)", "Maasi (மாசி)", "Panguni (பங்குனி)"];
const RASI_COLOURS = ["Blood red", "White", "Grass green", "Pale pink", "Pale white / smoky", "Variegated", "Dark / black", "Golden brown", "Golden yellow", "Spotted / variegated", "Mongoose brown", "Fish colour / cream"];
const RASI_FERTILITY = ["Barren", "Semi-fruitful", "Barren", "Fruitful", "Barren", "Barren", "Semi-fruitful", "Fruitful", "Semi-fruitful", "Semi-fruitful", "Semi-fruitful", "Fruitful"];
const DAY_STRONG = new Set([4, 5, 6, 7, 10, 11]);

const RASI_FOODS: string[][] = [
  ["Red chillies, pepper, garlic, wheat, masoor dal", "Thorny shrubs, red-flowered plants"],
  ["Rice, milk products, sweets, sugarcane", "Fruit trees, jasmine, rose"],
  ["Green gram, leafy greens, mixed snacks", "Creepers, tulsi, betel"],
  ["Rice, gourds, cucumber, milk", "Lotus, water lily, plantain"],
  ["Wheat, jaggery, honey, citrus fruits", "Tall forest trees, sunflower, saffron"],
  ["Grains, pulses, green vegetables, herbs", "Vegetable gardens, medicinal plants"],
  ["Black gram, oilseeds, sweet fruits", "Fragrant flowers, cotton"],
  ["Red gram, sesame, pungent roots, fermented foods", "Thorny and poisonous plants, medicinal roots"],
  ["Bengal gram, ghee, turmeric, mango, banana", "Peepal, banyan, yellow flowers"],
  ["Sesame, black gram, ragi, root vegetables", "Hardy and thorny trees, palmyra"],
  ["Millets, dried and preserved foods", "Tall shady trees, medicinal herbs"],
  ["Fish, seafood, coconut water, juicy fruits, milk sweets", "Aquatic plants, lotus, moss"],
];

// —— Modern additions to existing modern lists ——

const BHAVA_MODERN_EXTRA: Record<string, string[]> = {
  "bhava-1": ["Selfies, profile pictures, personal grooming", "Gym, diet plans, fitness apps", "Personal reputation online", "Situations: rebranding yourself, health scares, new beginnings"],
  "bhava-2": ["Savings apps, digital gold, FDs", "Family businesses, food blogging", "Dentists, opticians, speech therapy", "Situations: family property talks, money lent to relatives, diet changes"],
  "bhava-3": ["Reels, shorts, podcasts, blogs", "Bikes, scooters, local commute apps", "Online skill courses, hobbies", "Situations: interviews, signing documents, sibling quarrels, short trips"],
  "bhava-4": ["Smart homes, home automation", "Home loans, rent agreements", "School admissions, degree certificates", "Situations: shifting house, buying a car, mother's health, renovation"],
  "bhava-5": ["Fantasy sports, stock trading apps", "Parenting and kids' education apps", "Creative hobbies, YouTube channels", "Situations: pregnancy news, exam results, romance, speculation gains/losses"],
  "bhava-6": ["Health insurance, diagnostic labs", "Office politics, appraisal reviews", "Loan apps, credit scores (CIBIL)", "Situations: lawsuits, cyber-crime complaints, illness, competitive exams"],
  "bhava-7": ["Matrimony sites, dating apps", "Business partnerships, client contracts", "Customer reviews, public image", "Situations: engagement, marriage, divorce proceedings, partnership disputes"],
  "bhava-8": ["Life insurance, wills, PF withdrawals", "Data analytics, cyber forensics", "ICU, surgeries, chronic care", "Situations: sudden losses, scandals, inheritance disputes, transformation"],
  "bhava-9": ["Study-abroad consultancies, scholarships", "Pilgrimage tours, international flights", "Online spiritual courses, gurus", "Situations: father's health, PhD, publishing a book, good luck phase"],
  "bhava-10": ["LinkedIn, job portals, resumes", "Government exams, start-up funding", "Awards, media coverage", "Situations: job change, promotion, career break, public recognition"],
  "bhava-11": ["Salary credits, bonuses, dividends", "Professional networks, alumni groups", "Rental income, passive income", "Situations: profits, wish fulfilment, gains through friends, elder sibling's support"],
  "bhava-12": ["Visa, PR, immigration consultants", "Hospital bills, rehab, ashrams", "Late-night OTT, sleep apps", "Situations: big expenses, foreign settlement, data loss, spiritual retreat"],
};

const RASI_MODERN_EXTRA: Record<string, string[]> = {
  "rasi-1": ["Sports bikes, adventure gear", "Fire safety, security services", "Start-up founders, defence tech"],
  "rasi-2": ["Gold, banking, luxury food brands", "Skincare, beauty, singing apps", "Savings, real estate investment"],
  "rasi-3": ["Mobiles, laptops, social media", "Content creation, journalism", "Courier, ride-sharing, telecom"],
  "rasi-4": ["Homes, appliances, dairy brands", "Hospitality, food delivery", "Nursing, maternity care"],
  "rasi-5": ["Politics, cinema, events", "Gold and luxury goods", "Cardiology, solar energy"],
  "rasi-6": ["Healthcare, pharma, labs", "Accounting software, audits", "Nutrition and fitness apps"],
  "rasi-7": ["Fashion e-commerce, salons", "Law firms, matrimony apps", "Luxury retail, design studios"],
  "rasi-8": ["Insurance, forensic labs", "Cyber-security, surveillance", "Oil, chemicals, occult apps"],
  "rasi-9": ["Universities, study abroad", "Airlines, travel portals", "Publishing, legal services"],
  "rasi-10": ["Construction, cement, steel", "Government administration", "Logistics, warehouses"],
  "rasi-11": ["AI, space tech, satellites", "Renewable energy, electronics", "NGOs, crowdfunding"],
  "rasi-12": ["Cruises, shipping, foreign settlement", "Hospitals, retreats, rehab", "OTT, films, photography"],
};

const NAKSHATRA_MODERN_EXTRA: string[][] = [
  ["Ride-hailing, quick-commerce apps", "Sports medicine, physiotherapy", "Racing, motorsport"],
  ["Film production, OTT", "Gynaecology, surrogacy", "Tobacco and coffee industry"],
  ["Cloud kitchens, food trucks", "Steel and metal works", "Critics, reviewers"],
  ["Organic farming, dairy start-ups", "Beauty and fashion e-commerce", "Luxury real estate"],
  ["Travel vlogging, backpacking", "Textile and garment exports", "Music streaming"],
  ["AI research, data science", "Chemical and pharma plants", "Disaster management"],
  ["Hotels, homestays (Airbnb)", "Teaching platforms, tutoring", "Architecture and housing"],
  ["Food banks, NGOs", "Government welfare schemes", "Child-care and nursing"],
  ["Psychology and therapy", "Cyber-crime, espionage", "Petroleum, pharma"],
  ["Family businesses, heritage brands", "Genealogy, history channels", "Government administration"],
  ["Wedding planning, event management", "Luxury and lifestyle brands", "OTT and entertainment"],
  ["HR, recruitment platforms", "Social work, CSR", "Public administration"],
  ["Handicrafts on e-commerce", "Surgeons, dentists", "Stand-up comedy, magic"],
  ["Interior and graphic design", "Jewellery design", "Architecture, 3D modelling"],
  ["Online trading, e-commerce", "Aviation, airlines", "Freelancing platforms"],
  ["Political campaigns, sales targets", "Marketing and advertising", "Competitive exams"],
  ["Networking platforms, LinkedIn", "Mining, photography", "Overseas jobs"],
  ["Police, defence, security firms", "Corporate management", "Detective agencies"],
  ["Herbal and Ayurvedic brands", "Investigative journalism", "Demolition and recycling"],
  ["Beverage and water industries", "Cosmetics brands", "Motivational speaking"],
  ["Government services, judiciary", "Defence leadership", "Long-term projects"],
  ["Podcasts, radio, audiobooks", "Language and translation apps", "Telecom"],
  ["Music production, DJs", "Real estate, property", "Sports industry"],
  ["Hospitals, healthcare start-ups", "Space and astronomy", "Electrical engineering"],
  ["Activism, revolutionary movements", "Mining, funeral services", "Occult and tantra"],
  ["Counselling, therapy", "Yoga and meditation studios", "Charitable trusts"],
  ["Travel agencies, shipping", "Arts, music, acting", "Caregiving, social work"],
];

// —— Builders ——

function buildGrahaClassical(): Groups {
  const out: Groups = {};
  for (const [id, seed] of Object.entries(GRAHA_CLASSICAL)) {
    out[id] = [
      group("Time, Period & Age (காலம் & வயது)", "காலம்", seed.time),
      group("Mind, Clothing & Places (மனம், உடை & இடம்)", "மனம் & உடை", seed.mind),
      group("Worship & Remedies (வழிபாடு & பரிகாரம்)", "பரிகாரம்", seed.remedies),
      group("Foods, Plants & Animals (உணவு, தாவரம் & உயிரினம்)", "உணவு & உயிரினம்", seed.nature),
    ];
  }
  return out;
}

function buildGrahaModern(): Groups {
  const out: Groups = {};
  for (const [id, seed] of Object.entries(GRAHA_MODERN)) {
    out[id] = [
      group("Modern — Gadgets & Technology (நவீன கருவிகள்)", "கருவிகள்", seed.gadgets),
      group("Modern — Products & Consumer Goods (நவீன பொருட்கள்)", "பொருட்கள்", seed.products),
      group("Modern — New-Age Careers (நவீன தொழில்கள்)", "தொழில்கள்", seed.careers),
      group("Modern — Places (நவீன இடங்கள்)", "இடங்கள்", seed.places),
      group("Modern — Lifestyle Health (வாழ்க்கை முறை நோய்கள்)", "நோய்கள்", seed.health),
    ];
  }
  return out;
}

function buildBhavaClassical(): Groups {
  const out: Groups = {};
  for (const [id, seed] of Object.entries(BHAVA_CLASSICAL)) {
    out[id] = [
      group("Relatives by House Counting — Bhavat Bhavam (உறவுகள்)", "உறவுகள்", seed.relatives),
      group("Prasna / Horary Meanings (பிரசன்னம்)", "பிரசன்னம்", seed.prasna),
      group("Mundane / National Meanings (உலகியல்)", "உலகியல்", seed.mundane),
    ];
  }
  return out;
}

function buildRasiClassical(): Groups {
  const out: Groups = {};
  for (let i = 0; i < 12; i++) {
    const ascension = i >= 9 || i <= 2 ? "Short ascension" : "Long ascension";
    out[`rasi-${i + 1}`] = [
      group("Classification & Timing (வகைப்பாடு & காலம்)", "வகைப்பாடு", [
        `Tamil solar month: ${TAMIL_MONTHS[i]} (Sun's transit)`,
        `Colour: ${RASI_COLOURS[i]}`,
        `Fertility: ${RASI_FERTILITY[i]}`,
        `Strength: ${DAY_STRONG.has(i) ? "Day-strong (Diva Bali)" : "Night-strong (Ratri Bali)"}`,
        `${ascension} (northern latitudes)`,
      ]),
      group("Foods & Plants (உணவு & தாவரம்)", "உணவு & தாவரம்", RASI_FOODS[i]),
    ];
  }
  return out;
}

export const EXTRA_CLASSICAL: Groups = {
  ...buildGrahaClassical(),
  ...buildBhavaClassical(),
  ...buildRasiClassical(),
};

export const EXTRA_MODERN_GROUPS: Groups = buildGrahaModern();

export const MODERN_EXTRA_ITEMS: Record<string, string[]> = {
  ...BHAVA_MODERN_EXTRA,
  ...RASI_MODERN_EXTRA,
  ...Object.fromEntries(NAKSHATRA_MODERN_EXTRA.map((items, i) => [`nakshatra-${i + 1}`, items])),
};
