"use client";

import { mapPoints, propertyLocation, travelTimes } from "@/data/location";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/sections/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center bg-sand-200 md:h-[500px]">
      <p className="text-sm text-sand-500">Loading map...</p>
    </div>
  ),
});

const markerColors: Record<string, string> = {
  property: "#443a31",
  city: "#b5654a",
  airport: "#4a8494",
  beach: "#6b7a52",
  attraction: "#9a8570",
};

export function LocationMap() {
  return (
    <section id="location" className="bg-sand-50 py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Location"
            title="Perfectly Positioned"
            subtitle="Peaceful hillside living with Heraklion, beaches, and attractions all within easy reach."
          />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="overflow-hidden border border-sand-200">
            <Map points={mapPoints} center={[propertyLocation.lat, propertyLocation.lng]} />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-sand-600">
            {Object.entries({
              property: "Villa",
              city: "Heraklion",
              airport: "Airport",
              beach: "Beaches",
              attraction: "Attractions",
            }).map(([type, label]) => (
              <span key={type} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: markerColors[type] }}
                />
                {label}
              </span>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mt-12">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {travelTimes.map((item) => (
              <div
                key={item.destination}
                className="border border-sand-200 bg-sand-100 p-5 text-center"
              >
                <p className="font-serif text-2xl text-sand-900">{item.time}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-sand-500">
                  {item.destination}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
