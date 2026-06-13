import { restaurants } from "@/data/restaurants";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";

export function Restaurants() {
  return (
    <section id="restaurants" className="bg-sand-50 py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Taste Crete"
            title="Exceptional Dining Experiences"
            subtitle="From authentic Cretan tavernas to refined waterfront dining, discover some of the finest restaurants near your retreat."
          />
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant, i) => (
            <AnimatedSection key={restaurant.name} delay={i * 0.05}>
              <a
                href={restaurant.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col border border-sand-200 bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400 focus-visible:ring-offset-2"
              >
                <div className="px-4 pt-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-sand-200">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 pt-4">
                  <h3 className="font-serif text-xl text-sand-900 md:text-2xl">
                    {restaurant.name}
                  </h3>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-terracotta-500">
                    {restaurant.cuisine}
                  </p>
                  <div className="mt-3 flex gap-4 text-xs uppercase tracking-[0.15em] text-sand-400">
                    <span>{restaurant.distance}</span>
                    <span>·</span>
                    <span>{restaurant.driveTime} drive</span>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-sand-600">
                    {restaurant.description}
                  </p>
                  <span className="mt-5 inline-flex min-h-[44px] items-center py-3 text-xs font-medium uppercase tracking-[0.15em] text-terracotta-500 transition-colors group-hover:text-terracotta-600">
                    View on Google Maps →
                  </span>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
