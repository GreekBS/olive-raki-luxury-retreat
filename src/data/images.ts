export type GalleryCategory =
  | "exterior"
  | "pool"
  | "vineyard"
  | "living"
  | "bedrooms"
  | "outdoor";

export interface PropertyImage {
  src: string;
  alt: string;
  category: GalleryCategory;
  featured?: boolean;
  hero?: boolean;
  aspect?: "tall" | "wide" | "square";
}

export const galleryCategories: { id: GalleryCategory; label: string }[] = [
  { id: "exterior", label: "Exterior" },
  { id: "pool", label: "Pool" },
  { id: "vineyard", label: "Vineyard" },
  { id: "living", label: "Living Areas" },
  { id: "bedrooms", label: "Bedrooms" },
  { id: "outdoor", label: "Outdoor Living" },
];

export const propertyImages: PropertyImage[] = [
  {
    src: "/images/villa-pool-exterior.jpg",
    alt: "Modern villa with private pool and wooden deck overlooking Cretan hills",
    category: "exterior",
    featured: true,
    hero: true,
    aspect: "wide",
  },
  {
    src: "/images/pool-garden-wide.jpg",
    alt: "Private swimming pool surrounded by green lawn and sun loungers",
    category: "pool",
    featured: true,
    aspect: "wide",
  },
  {
    src: "/images/pool-estate-wide.jpg",
    alt: "Estate pool with vineyard hills and outdoor kitchen in the background",
    category: "pool",
    featured: true,
    aspect: "wide",
  },
  {
    src: "/images/pool-estate-day.jpg",
    alt: "Sun-drenched pool area with olive grove views",
    category: "vineyard",
    featured: true,
    aspect: "wide",
  },
  {
    src: "/images/villa-pool-dusk.jpg",
    alt: "Villa exterior at golden hour with illuminated pool deck",
    category: "exterior",
    aspect: "wide",
  },
  {
    src: "/images/villa-pool-night.jpg",
    alt: "Luxury villa at night with glowing turquoise pool",
    category: "exterior",
    featured: true,
    aspect: "wide",
  },
  {
    src: "/images/pool-night-close.jpg",
    alt: "Illuminated pool at night with warm architectural lighting",
    category: "pool",
    aspect: "wide",
  },
  {
    src: "/images/pool-lounger-golden.jpg",
    alt: "Premium sun lounger on wooden deck beside the pool",
    category: "pool",
    aspect: "square",
  },
  {
    src: "/images/pool-lounger-close.jpg",
    alt: "Close-up of wooden sun lounger with pool in background",
    category: "pool",
    aspect: "square",
  },
  {
    src: "/images/living-room-pool-view.jpg",
    alt: "Contemporary living room opening to private pool and garden",
    category: "living",
    featured: true,
    aspect: "wide",
  },
  {
    src: "/images/living-room-garden.jpg",
    alt: "Elegant living room with fireplace and garden views",
    category: "living",
    aspect: "wide",
  },
  {
    src: "/images/living-room-closet.jpg",
    alt: "Open-plan living area with walk-in closet and kitchen",
    category: "living",
    aspect: "square",
  },
  {
    src: "/images/kitchen-01.jpg",
    alt: "Modern kitchen with wood cabinetry and dining area",
    category: "living",
    aspect: "wide",
  },
  {
    src: "/images/kitchen-02.jpg",
    alt: "Fully equipped gourmet kitchen with premium appliances",
    category: "living",
    aspect: "wide",
  },
  {
    src: "/images/bathroom-01.jpg",
    alt: "Spa-like bathroom with textured tiles and vessel sink",
    category: "living",
    aspect: "tall",
  },
  {
    src: "/images/bathroom-02.jpg",
    alt: "Luxury double vanity bathroom with backlit mirror",
    category: "living",
    aspect: "wide",
  },
  {
    src: "/images/closet-storage.jpg",
    alt: "Built-in storage and wardrobe space",
    category: "living",
    aspect: "tall",
  },
  {
    src: "/images/bedroom-main.jpg",
    alt: "Serene master bedroom with wood slat accent wall",
    category: "bedrooms",
    featured: true,
    aspect: "wide",
  },
  {
    src: "/images/bedroom-suite.jpg",
    alt: "Bedroom suite with custom wood divider and workspace",
    category: "bedrooms",
    aspect: "wide",
  },
  {
    src: "/images/bedroom-laundry.jpg",
    alt: "Bedroom with ensuite access and laundry facilities",
    category: "bedrooms",
    aspect: "tall",
  },
  {
    src: "/images/outdoor-dining-patio.jpg",
    alt: "Shaded outdoor dining patio with hillside views",
    category: "outdoor",
    aspect: "wide",
  },
  {
    src: "/images/outdoor-dining-covered.jpg",
    alt: "Covered terrace with wooden dining set",
    category: "outdoor",
    aspect: "wide",
  },
  {
    src: "/images/outdoor-seating-private.jpg",
    alt: "Private outdoor seating framed by Mediterranean flowers",
    category: "outdoor",
    featured: true,
    aspect: "square",
  },
  {
    src: "/images/bbq-garden-day.jpg",
    alt: "Stone barbecue area in lush garden setting",
    category: "outdoor",
    aspect: "wide",
  },
  {
    src: "/images/bbq-garden-dusk.jpg",
    alt: "Outdoor kitchen and BBQ at twilight",
    category: "outdoor",
    aspect: "wide",
  },
];

export const heroImage = propertyImages.find((img) => img.hero)!;
export const aboutImage = propertyImages.find(
  (img) => img.src === "/images/living-room-pool-view.jpg"
)!;

export function getImagesByCategory(category: GalleryCategory | "all") {
  if (category === "all") return propertyImages;
  return propertyImages.filter((img) => img.category === category);
}
