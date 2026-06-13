export interface Restaurant {
  name: string;
  cuisine: string;
  distance: string;
  driveTime: string;
  description: string;
  image: string;
  imageAlt: string;
  mapsUrl: string;
}

export const restaurants: Restaurant[] = [
  {
    name: "Peskesi",
    cuisine: "Traditional Cretan",
    distance: "~14 km",
    driveTime: "~18 min",
    description:
      "Farm-to-table Cretan cuisine in a beautifully restored mansion, celebrating heritage recipes with exceptional local produce.",
    image: "/images/restaurants/peskesi.jpg",
    imageAlt: "Peskesi — traditional Cretan dining in Heraklion",
    mapsUrl: "https://maps.google.com/?q=Peskesi+Restaurant+Heraklion+Crete",
  },
  {
    name: "Erganos",
    cuisine: "Cretan Meze & Wine",
    distance: "~13 km",
    driveTime: "~17 min",
    description:
      "An intimate taverna for creative meze and Cretan wines in a warm, authentically Greek setting.",
    image: "/images/restaurants/erganos.jpg",
    imageAlt: "Erganos — Cretan meze and wine in Heraklion",
    mapsUrl: "https://maps.google.com/?q=Erganos+Restaurant+Heraklion+Crete",
  },
  {
    name: "Parasties",
    cuisine: "Modern Greek",
    distance: "~14 km",
    driveTime: "~18 min",
    description:
      "Contemporary Greek dining with refined plates and an elegant atmosphere for a memorable evening.",
    image: "/images/restaurants/parasties.jpg",
    imageAlt: "Parasties — modern Greek cuisine in Heraklion",
    mapsUrl: "https://maps.google.com/?q=Parasties+Restaurant+Heraklion+Crete",
  },
  {
    name: "7 Thalasses",
    cuisine: "Fine Seafood",
    distance: "~16 km",
    driveTime: "~20 min",
    description:
      "Upscale seafood inspired by Crete's maritime heritage, with refined dishes and harbour-side sophistication.",
    image: "/images/restaurants/7-thalasses.jpg",
    imageAlt: "7 Thalasses — fine seafood dining in Heraklion",
    mapsUrl: "https://maps.google.com/?q=7+Thalasses+Restaurant+Heraklion+Crete",
  },
  {
    name: "Petousis Restaurant",
    cuisine: "Traditional Taverna",
    distance: "~10 km",
    driveTime: "~15 min",
    description:
      "A beloved local institution known for generous portions, grilled specialties, and genuine Cretan hospitality.",
    image: "/images/restaurants/petousis.jpg",
    imageAlt: "Petousis Restaurant — traditional Cretan taverna",
    mapsUrl: "https://maps.google.com/?q=Petousis+Restaurant+Crete",
  },
  {
    name: "Kouzeineri",
    cuisine: "Modern Cretan",
    distance: "~14 km",
    driveTime: "~18 min",
    description:
      "Creative Cretan cooking with a modern edge, showcasing seasonal ingredients and bold island flavours.",
    image: "/images/restaurants/kouzeineri.jpg",
    imageAlt: "Kouzeineri — modern Cretan cuisine in Heraklion",
    mapsUrl: "https://maps.google.com/?q=Kouzeineri+Restaurant+Heraklion+Crete",
  },
  {
    name: "Ippokambos",
    cuisine: "Seafood & Mediterranean",
    distance: "~14 km",
    driveTime: "~18 min",
    description:
      "Elegant waterfront dining with fresh seafood, Mediterranean flavours, and beautiful sunset views along Heraklion's coastline.",
    image: "/images/restaurants/ippokambos.jpg",
    imageAlt: "Ippokambos — waterfront seafood dining in Heraklion",
    mapsUrl: "https://maps.google.com/?q=Ippokambos+Restaurant+Heraklion+Crete",
  },
];
