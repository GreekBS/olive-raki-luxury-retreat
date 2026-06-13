export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "property" | "city" | "airport" | "beach" | "attraction";
}

export const propertyLocation = {
  name: "Cretan Villa Retreat",
  address: "Quiet hillside near Heraklion, Crete, Greece",
  lat: 35.3128,
  lng: 25.0834,
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=35.3128,25.0834",
};

export const mapPoints: MapPoint[] = [
  {
    id: "property",
    name: "Villa",
    lat: 35.3128,
    lng: 25.0834,
    type: "property",
  },
  {
    id: "heraklion",
    name: "Heraklion Center",
    lat: 35.3387,
    lng: 25.1442,
    type: "city",
  },
  {
    id: "airport",
    name: "Heraklion Airport",
    lat: 35.3397,
    lng: 25.1803,
    type: "airport",
  },
  {
    id: "ammoudara",
    name: "Ammoudara Beach",
    lat: 35.355,
    lng: 25.061,
    type: "beach",
  },
  {
    id: "agia-pelagia",
    name: "Agia Pelagia",
    lat: 35.406,
    lng: 25.015,
    type: "beach",
  },
  {
    id: "knossos",
    name: "Palace of Knossos",
    lat: 35.298,
    lng: 25.163,
    type: "attraction",
  },
  {
    id: "harbor",
    name: "Venetian Harbor",
    lat: 35.3445,
    lng: 25.137,
    type: "attraction",
  },
];

export const travelTimes = [
  { destination: "Heraklion Center", time: "15 min" },
  { destination: "Heraklion Airport", time: "20 min" },
  { destination: "Ammoudara Beach", time: "12 min" },
  { destination: "Palace of Knossos", time: "18 min" },
  { destination: "Agia Pelagia Beach", time: "22 min" },
];
