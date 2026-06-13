import { propertyLocation } from "@/data/location";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Olive & Raki Luxury Retreat",
    description:
      "Olive & Raki Luxury Retreat — boutique villa in Crete with private pool, vineyard setting and 4,000 sqm estate, 15 minutes from Heraklion.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Heraklion",
      addressRegion: "Crete",
      addressCountry: "GR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: propertyLocation.lat,
      longitude: propertyLocation.lng,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Private Pool", value: true },
      { "@type": "LocationFeatureSpecification", name: "Vineyard", value: true },
      { "@type": "LocationFeatureSpecification", name: "Garden", value: true },
    ],
    telephone: "+306948386235",
    email: "vaggelis.stefan1@gmail.com",
    image: "https://oliveandraki.gr/images/villa-pool-exterior.jpg",
    url: "https://oliveandraki.gr",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
