import { aboutImage } from "@/data/images";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";

export function About() {
  return (
    <section id="about" className="bg-sand-50 py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <AnimatedSection>
            <SectionHeading
              align="left"
              eyebrow="The Property"
              title="A Sanctuary of Calm in the Cretan Hills"
              subtitle="Where vineyard serenity meets effortless access to Heraklion."
            />
            <div className="space-y-5 text-base leading-relaxed text-sand-600 md:text-lg">
              <p>
                Nestled on a private 4,000 square metre estate just fifteen
                minutes from Heraklion, Olive & Raki Luxury Retreat offers an escape from the
                ordinary. Here, time slows down — mornings begin with birdsong
                among the vines, afternoons unfold beside your own swimming pool,
                and evenings are spent under a canopy of stars.
              </p>
              <p>
                Designed for families and couples seeking both privacy and
                convenience, the villa blends contemporary comfort with authentic
                Cretan character. Wander through the vineyard, grill fresh local
                produce at the outdoor kitchen, or simply unwind in the garden
                while the hills stretch endlessly before you.
              </p>
              <p>
                When adventure calls, golden beaches, ancient palaces, and
                Heraklion&apos;s vibrant harbour are all within easy reach — yet
                returning to your peaceful hillside retreat feels like coming
                home.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={aboutImage.src}
                alt={aboutImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden bg-sand-100 p-6 md:block lg:-bottom-8 lg:-left-8 lg:p-8">
              <p className="font-serif text-3xl text-sand-900 lg:text-4xl">67</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sand-500">
                sqm Luxury Retreat
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sand-500">
                on a 4,000 sqm Estate
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
