import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";

const experiences = [
  {
    title: "Private Pool",
    description:
      "Relax under the Cretan sun in your own private swimming pool.",
    image: "/images/pool-lounger-golden.jpg",
    alt: "Sun lounger beside private pool",
  },
  {
    title: "Vineyard Estate",
    description:
      "Enjoy peaceful walks among the vineyard and gardens.",
    image: "/images/pool-estate-day.jpg",
    alt: "Estate with vineyard hillside views",
  },
  {
    title: "Authentic Crete",
    description:
      "Experience genuine Cretan hospitality and local culture.",
    image: "/images/bbq-garden-day.jpg",
    alt: "Traditional outdoor barbecue in garden",
  },
  {
    title: "Prime Location",
    description:
      "Close to Heraklion while surrounded by nature.",
    image: "/images/outdoor-seating-private.jpg",
    alt: "Private outdoor seating with Mediterranean garden",
  },
];

export function Experience() {
  return (
    <section id="experience" className="bg-sand-100 py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            eyebrow="The Experience"
            title="Everything You Need for the Perfect Stay"
          />
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {experiences.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 0.1}>
              <article className="group overflow-hidden bg-sand-50">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 lg:p-8">
                  <h3 className="font-serif text-xl text-sand-900 md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-sand-600">
                    {item.description}
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
