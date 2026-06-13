export interface Attraction {
  name: string;
  driveTime: string;
  description: string;
}

export const attractions: Attraction[] = [
  {
    name: "Palace of Knossos",
    driveTime: "18 min",
    description:
      "The legendary Minoan palace, one of Europe's oldest civilizations and Crete's most iconic archaeological site.",
  },
  {
    name: "Heraklion Archaeological Museum",
    driveTime: "15 min",
    description:
      "World-class collection of Minoan artifacts, frescoes, and treasures spanning 5,500 years of history.",
  },
  {
    name: "Venetian Harbor",
    driveTime: "15 min",
    description:
      "Historic waterfront with colorful fishing boats, waterfront cafés, and the iconic Koules Fortress.",
  },
  {
    name: "Koules Fortress",
    driveTime: "15 min",
    description:
      "16th-century Venetian fortress guarding the harbor entrance, offering panoramic city and sea views.",
  },
  {
    name: "Historical Museum of Crete",
    driveTime: "14 min",
    description:
      "Journey through Cretan history from Byzantine times to the modern era in an elegant neoclassical building.",
  },
  {
    name: "Cretaquarium",
    driveTime: "20 min",
    description:
      "One of Europe's largest aquariums showcasing the rich marine life of the Mediterranean Sea.",
  },
  {
    name: "Natural History Museum of Crete",
    driveTime: "14 min",
    description:
      "Fascinating exhibits on Cretan flora, fauna, and geology, including a life-sized dinosaur display.",
  },
];
