import { beaches } from "@/data/beaches";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";

export function Beaches() {
  return (
    <section id="beaches" className="bg-sand-100 py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Discover"
            title="Discover Crete's Most Beautiful Beaches"
            subtitle="Crystal-clear waters and golden shores, all within easy reach."
          />
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {beaches.map((beach, i) => (
            <AnimatedSection key={beach.name} delay={i * 0.05}>
              <article className="group flex h-full flex-col border border-sand-200 bg-sand-50 transition-shadow hover:shadow-md">
                <div className="px-4 pt-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-sand-200">
                    <Image
                      src={beach.image}
                      alt={beach.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 pt-4">
                  <h3 className="font-serif text-xl text-sand-900">
                    {beach.name}
                  </h3>
                  <div className="mt-3 flex gap-4 text-xs uppercase tracking-[0.15em] text-terracotta-500">
                    <span>{beach.distance}</span>
                    <span>·</span>
                    <span>{beach.driveTime} drive</span>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-sand-600">
                    {beach.description}
                  </p>
                  <a
                    href={beach.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block text-xs font-medium uppercase tracking-[0.15em] text-terracotta-500 transition-colors hover:text-terracotta-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400 focus-visible:ring-offset-2"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
