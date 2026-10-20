// Dasakoota (10-point) porutham reference tables, indexed by nakshatra index (0-26).
// These are the standard classification tables used across Vedic/Tamil porutham calculators.

export const GANA: ("Deva" | "Manushya" | "Rakshasa")[] = [
  "Deva", "Manushya", "Rakshasa", "Manushya", "Deva", "Manushya", "Deva", "Deva",
  "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", "Deva", "Deva", "Rakshasa",
  "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Rakshasa",
  "Manushya", "Manushya", "Deva",
];

export const YONI: string[] = [
  "Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog", "Cat", "Sheep", "Cat",
  "Rat", "Rat", "Cow", "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer", "Deer",
  "Dog", "Monkey", "Mongoose", "Monkey", "Lion", "Horse", "Lion", "Cow", "Elephant",
];

export const NADI: ("Aadi" | "Madhya" | "Antya")[] = [
  "Aadi", "Madhya", "Antya", "Aadi", "Madhya", "Antya", "Aadi", "Madhya", "Antya",
  "Aadi", "Madhya", "Antya", "Aadi", "Madhya", "Antya", "Aadi", "Madhya", "Antya",
  "Aadi", "Madhya", "Antya", "Aadi", "Madhya", "Antya", "Aadi", "Madhya", "Antya",
];

// Rajju groups (by nakshatra), used for the Rajju koota check.
export const RAJJU: ("Pada" | "Kati" | "Udara" | "Kantha" | "Shiro")[] = [
  "Pada", "Pada", "Pada", "Kati", "Kati", "Kati", "Udara", "Udara", "Udara", "Udara",
  "Udara", "Kantha", "Kantha", "Kantha", "Kantha", "Kantha", "Shiro", "Shiro", "Shiro",
  "Kantha", "Kantha", "Kantha", "Kantha", "Kantha", "Udara", "Udara", "Pada",
];

// Vasya compatibility groups, by rasi index (0-11).
export const VASYA_GROUP: string[] = [
  "Chatushpada", "Chatushpada", "Dwipada", "Jalachara", "Vanachara", "Dwipada",
  "Dwipada", "Keeta", "Dwipada", "Chatushpada", "Dwipada", "Jalachara",
];

export const YONI_COMPATIBLE_PAIRS: Record<string, string[]> = {
  Horse: ["Horse", "Elephant", "Sheep"],
  Elephant: ["Elephant", "Horse", "Cow", "Sheep"],
  Sheep: ["Sheep", "Horse", "Elephant", "Monkey"],
  Serpent: ["Serpent", "Mongoose"],
  Dog: ["Dog", "Deer", "Rat"],
  Cat: ["Cat"],
  Rat: ["Rat", "Dog", "Cow"],
  Cow: ["Cow", "Rat", "Elephant", "Buffalo"],
  Buffalo: ["Buffalo", "Cow", "Tiger"],
  Tiger: ["Tiger", "Buffalo", "Deer"],
  Deer: ["Deer", "Dog", "Tiger", "Lion"],
  Monkey: ["Monkey", "Sheep"],
  Mongoose: ["Mongoose", "Serpent"],
  Lion: ["Lion", "Deer", "Horse"],
};
