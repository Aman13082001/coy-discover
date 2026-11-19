/**
 * Deterministic demo data. Photos are bundled in /public/profiles (sourced from
 * pravatar.cc, which serves Unsplash-licensed portraits). No public figures.
 */

export const DEMO_USER_ID = "me";

export interface SeedProfile {
  id: string;
  name: string;
  age: number;
  photo: number; // pravatar image number, copied to /public/profiles/<id>.jpg
  location: string;
  bio: string;
  interests: string[];
}

export const demoUser: SeedProfile = {
  id: DEMO_USER_ID,
  name: "Arjun",
  age: 24,
  photo: 12,
  location: "Bengaluru",
  bio: "Product engineer. Will trade restaurant recommendations for book ones.",
  interests: ["Coffee", "Bouldering", "Sci-fi", "Cooking"],
};

export const seedProfiles: SeedProfile[] = [
  { id: "ananya", name: "Ananya", age: 23, photo: 5, location: "Miranda House, Delhi", bio: "Economics final year. I make a very serious cold brew and an unserious playlist.", interests: ["Coffee", "Indie music", "Debate", "Thrifting"] },
  { id: "meera", name: "Meera", age: 25, photo: 9, location: "Mumbai", bio: "Architect by day, sketchbook-in-every-café by night. Ask me about stairwells.", interests: ["Architecture", "Sketching", "Jazz", "Old cinema"] },
  { id: "tara", name: "Tara", age: 22, photo: 10, location: "St. Xavier's, Mumbai", bio: "Laughs too loud at her own jokes. Currently learning to surf, badly.", interests: ["Surfing", "Stand-up", "Photography", "Street food"] },
  { id: "zoya", name: "Zoya", age: 24, photo: 16, location: "Hyderabad", bio: "UX researcher. I will interview you about your breakfast habits.", interests: ["Design", "Running", "Podcasts", "Baking"] },
  { id: "isha", name: "Isha", age: 21, photo: 20, location: "Christ University, Bengaluru", bio: "Psychology student with a houseplant problem (I have 41).", interests: ["Plants", "Psychology", "Poetry", "Yoga"] },
  { id: "naina", name: "Naina", age: 26, photo: 21, location: "Pune", bio: "Data analyst who reads the last page of a novel first. No regrets.", interests: ["Books", "Chess", "Trekking", "Sci-fi"] },
  { id: "kavya", name: "Kavya", age: 23, photo: 23, location: "Chennai", bio: "Carnatic vocalist turned software tester. I hum while debugging.", interests: ["Music", "Classical dance", "Filter coffee", "Travel"] },
  { id: "riya", name: "Riya", age: 22, photo: 24, location: "IIT Bombay", bio: "Chemical engineering, third year. Chai over coffee, always.", interests: ["Chai", "Robotics", "Badminton", "Anime"] },
  { id: "aanya", name: "Aanya", age: 24, photo: 25, location: "Kolkata", bio: "Illustrator. I draw the people next to me on the metro (sorry in advance).", interests: ["Illustration", "Comics", "Metro rides", "Momos"] },
  { id: "sana", name: "Sana", age: 27, photo: 26, location: "Delhi", bio: "Lawyer. Excellent at arguing, terrible at choosing a restaurant.", interests: ["Law", "Bouldering", "Food walks", "True crime"] },
  { id: "diya", name: "Diya", age: 23, photo: 27, location: "Ashoka University", bio: "Philosophy major who wants to talk about free will at 2am.", interests: ["Philosophy", "Hiking", "Vinyl", "Cooking"] },
  { id: "pooja", name: "Pooja", age: 25, photo: 28, location: "Jaipur", bio: "Runs a tiny block-print studio. My hands are permanently indigo.", interests: ["Textiles", "Pottery", "Markets", "Sunsets"] },
  { id: "esha", name: "Esha", age: 22, photo: 30, location: "NIFT Delhi", bio: "Fashion design student. I can tell your fabric from across the room.", interests: ["Fashion", "Dance", "Thrifting", "K-dramas"] },
  { id: "mira", name: "Mira", age: 26, photo: 31, location: "Goa", bio: "Marine biologist. Yes, I have a favourite octopus.", interests: ["Ocean", "Diving", "Sustainability", "Reggae"] },
  { id: "aditi", name: "Aditi", age: 24, photo: 32, location: "Bengaluru", bio: "Frontend developer. I care about your button padding more than you do.", interests: ["Coding", "Coffee", "Cycling", "Board games"] },
  { id: "lavanya", name: "Lavanya", age: 25, photo: 34, location: "Kochi", bio: "Doctor in residency. Sleep is a myth; good dosa is not.", interests: ["Medicine", "Backwaters", "Cooking", "Swimming"] },
  { id: "shreya", name: "Shreya", age: 23, photo: 36, location: "BITS Pilani", bio: "Electronics student, amateur astronomer, professional over-thinker.", interests: ["Astronomy", "Electronics", "Night drives", "Sci-fi"] },
  { id: "noor", name: "Noor", age: 24, photo: 38, location: "Lucknow", bio: "Writes short stories. Will absolutely put you in one.", interests: ["Writing", "Urdu poetry", "Kebabs", "Old Delhi"] },
  { id: "avni", name: "Avni", age: 21, photo: 41, location: "Manipal", bio: "Med student in a beanie, all seasons. Snow trip planner of the group.", interests: ["Snowboarding", "Medicine", "Indie folk", "Hot chocolate"] },
  { id: "priya", name: "Priya", age: 26, photo: 44, location: "Ahmedabad", bio: "Startup ops lead. Spreadsheets are my love language, garba is my cardio.", interests: ["Startups", "Garba", "Travel", "Street food"] },
  { id: "rohan", name: "Rohan", age: 25, photo: 3, location: "Mumbai", bio: "Film editor. I notice continuity errors in real life.", interests: ["Film", "Boxing", "Photography", "Late-night food"] },
  { id: "kabir", name: "Kabir", age: 24, photo: 8, location: "IIM Ahmedabad", bio: "MBA, first year. Recovering consultant, aspiring baker.", interests: ["Baking", "Football", "Podcasts", "Coffee"] },
  { id: "vivaan", name: "Vivaan", age: 27, photo: 11, location: "Dehradun", bio: "Trek leader. Has opinions about tents and will share them.", interests: ["Trekking", "Camping", "Guitar", "Maggi"] },
  { id: "ishaan", name: "Ishaan", age: 23, photo: 13, location: "Delhi University", bio: "History postgrad. I can make any monument sound like gossip.", interests: ["History", "Heritage walks", "Chess", "Biryani"] },
  { id: "aryan", name: "Aryan", age: 26, photo: 14, location: "Goa", bio: "Runs a beach shack playlist and a very small dog.", interests: ["Music", "Dogs", "Surfing", "Seafood"] },
  { id: "dev", name: "Dev", age: 22, photo: 15, location: "NID Ahmedabad", bio: "Product design student. Collector of weird chairs.", interests: ["Industrial design", "Skateboarding", "Zines", "Coffee"] },
  { id: "nikhil", name: "Nikhil", age: 28, photo: 18, location: "Gurugram", bio: "Fintech PM. Always on a call, but I'll pause it for you.", interests: ["Finance", "Tennis", "Wine", "Travel"] },
  { id: "samuel", name: "Samuel", age: 25, photo: 51, location: "Shillong", bio: "Plays bass in a band nobody has heard of yet. Hats are not optional.", interests: ["Bass guitar", "Live music", "Football", "Hills"] },
  { id: "farhan", name: "Farhan", age: 26, photo: 53, location: "Hyderabad", bio: "Backend engineer and weekend potter. Both involve a lot of spinning.", interests: ["Pottery", "Coding", "Biryani", "Cricket"] },
  { id: "yash", name: "Yash", age: 24, photo: 58, location: "Pune", bio: "Wildlife photographer. Patient with leopards, impatient with traffic.", interests: ["Wildlife", "Photography", "Road trips", "Birding"] },
  { id: "omar", name: "Omar", age: 27, photo: 60, location: "Srinagar", bio: "Teaches kayaking on Dal Lake in summer and skiing in winter.", interests: ["Kayaking", "Skiing", "Kahwa", "Folk music"] },
];

/**
 * Swipes made BY other profiles TOWARD the demo user.
 * These are private: the API never reveals them. A like here becomes a match
 * only if the demo user likes back.
 */
export const incomingSwipes: { fromId: string; action: "LIKE" | "PASS" }[] = [
  { fromId: "meera", action: "LIKE" },
  { fromId: "zoya", action: "LIKE" },
  { fromId: "naina", action: "LIKE" },
  { fromId: "aanya", action: "LIKE" },
  { fromId: "diya", action: "LIKE" },
  { fromId: "kabir", action: "LIKE" },
  { fromId: "mira", action: "LIKE" },
  { fromId: "farhan", action: "LIKE" },
  { fromId: "tara", action: "PASS" },
  { fromId: "rohan", action: "PASS" },
];

/** Background activity between other profiles, so the Swipe table looks realistic. */
export const otherSwipes: { fromId: string; toId: string; action: "LIKE" | "PASS" }[] = [
  { fromId: "ananya", toId: "kabir", action: "LIKE" },
  { fromId: "kabir", toId: "ananya", action: "LIKE" },
  { fromId: "riya", toId: "dev", action: "LIKE" },
  { fromId: "dev", toId: "riya", action: "PASS" },
  { fromId: "sana", toId: "nikhil", action: "LIKE" },
];
