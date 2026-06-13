import { attractions } from "@/data/attractions";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Attractions() {
  return (
    <section id="attractions" className="bg-sand-100 py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Explore"
            title="Explore Crete"
            subtitle="Ancient wonders and cultural treasures at your doorstep."
          />
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-2">
          {attractions.map((attraction, i) => (
            <AnimatedSection key={attraction.name} delay={i * 0.05}>
              <article className="flex flex-col gap-4 border-l-2 border-terracotta-400 pl-6 md:flex-row md:gap-6">
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-sand-900 md:text-2xl">
                    {attraction.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-sand-600">
                    {attraction.description}
                  </p>
                </div>
                <div className="shrink-0 text-left md:text-right">
                  <p className="font-serif text-2xl text-sand-900">
                    {attraction.driveTime}
                  </p>
                  <p className="text-xs uppercase tracking-[0.15em] text-sand-400">
                    drive
                  </p>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
