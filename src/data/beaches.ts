export interface Beach {
  name: string;
  distance: string;
  driveTime: string;
  description: string;
  image: string;
  imageAlt: string;
  lat: number;
  lng: number;
  mapsUrl: string;
}

export const beaches: Beach[] = [
  {
    name: "Agia Pelagia Beach",
    distance: "~18 km",
    driveTime: "~20 min",
    description:
      "A picturesque seaside village with turquoise waters, waterfront tavernas, and a protected bay perfect for swimming and relaxing.",
    image: "/images/beaches/agia-pelagia.jpg",
    imageAlt: "Agia Pelagia Beach — turquoise waters and protected bay",
    lat: 35.406,
    lng: 25.015,
    mapsUrl: "https://maps.google.com/?q=Agia+Pelagia+Beach+Crete",
  },
  {
    name: "Ligaria Beach",
    distance: "~20 km",
    driveTime: "~22 min",
    description:
      "A beautiful sheltered beach known for its crystal-clear waters, peaceful atmosphere, and excellent swimming conditions.",
    image: "/images/beaches/ligaria.jpg",
    imageAlt: "Ligaria Beach — sheltered bay with crystal-clear waters",
    lat: 35.403,
    lng: 25.008,
    mapsUrl: "https://maps.google.com/?q=Ligaria+Beach+Crete",
  },
  {
    name: "Psaromoura Beach",
    distance: "~21 km",
    driveTime: "~25 min",
    description:
      "A hidden gem surrounded by rocky cliffs, offering stunning blue waters and a more secluded beach experience.",
    image: "/images/beaches/psaromoura.jpg",
    imageAlt: "Psaromoura Beach — secluded cove with rocky cliffs",
    lat: 35.41,
    lng: 25.005,
    mapsUrl: "https://maps.google.com/?q=Psaromoura+Beach+Crete",
  },
  {
    name: "Mononaftis Beach",
    distance: "~22 km",
    driveTime: "~25 min",
    description:
      "A small yet spectacular beach famous for snorkeling, diving, and exceptionally clear waters.",
    image: "/images/beaches/mononaftis.jpg",
    imageAlt: "Mononaftis Beach — clear waters ideal for snorkeling",
    lat: 35.405,
    lng: 25.012,
    mapsUrl: "https://maps.google.com/?q=Mononaftis+Beach+Crete",
  },
  {
    name: "Matala Beach",
    distance: "~65 km",
    driveTime: "~1 hr",
    description:
      "One of Crete's most iconic destinations, famous for its cliffside caves, golden beach, and spectacular sunsets.",
    image: "/images/beaches/matala.jpg",
    imageAlt: "Matala Beach — iconic cliffs and cave-lined shoreline",
    lat: 35.188,
    lng: 24.75,
    mapsUrl: "https://maps.google.com/?q=Matala+Beach+Crete",
  },
  {
    name: "Voulisma Beach",
    distance: "~75 km",
    driveTime: "~1 hr 10 min",
    description:
      "Often described as the Caribbean of Crete, featuring soft golden sand and crystal-clear turquoise waters.",
    image: "/images/beaches/voulisma.jpg",
    imageAlt: "Voulisma Beach — white sand and turquoise waters",
    lat: 35.192,
    lng: 25.715,
    mapsUrl: "https://maps.google.com/?q=Voulisma+Beach+Crete",
  },
  {
    name: "Bali Beach",
    distance: "~45 km",
    driveTime: "~40 min",
    description:
      "A collection of charming bays with calm waters, perfect for families, swimming, and day trips along the north coast.",
    image: "/images/beaches/bali.jpg",
    imageAlt: "Bali Beach — calm bays along the north coast",
    lat: 35.413,
    lng: 24.788,
    mapsUrl: "https://maps.google.com/?q=Bali+Beach+Rethymno+Crete",
  },
];
