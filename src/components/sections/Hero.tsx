"use client";

import { heroImage } from "@/data/images";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

type Highlight = {
  id: string;
  main: string;
  secondary?: string;
  icon: "bed" | "check";
};

const highlights: Highlight[] = [
  {
    id: "accommodation",
    main: "King Size Bed",
    secondary: "+ Double Sofa Bed",
    icon: "bed",
  },
  { id: "pool", main: "Private Pool", icon: "check" },
  {
    id: "estate",
    main: "67 sqm Luxury Retreat",
    secondary: "Nestled within a 4,000 sqm Estate",
    icon: "check",
  },
  { id: "vineyard", main: "Vineyard Setting", icon: "check" },
  { id: "heraklion", main: "15 min to Heraklion Centre", icon: "check" },
];

function BedIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-terracotta-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12h18M3 12v4h18v-4M5 12V8a2 2 0 012-2h2a2 2 0 012 2v4M13 12V8a2 2 0 012-2h2a2 2 0 012 2v4M3 16v2M21 16v2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-terracotta-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen" aria-label="Hero">
      <div className="absolute inset-0">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sand-900/50 via-sand-900/30 to-sand-900/70" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/80"
        >
          Boutique Villa · Crete, Greece
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl font-serif text-4xl font-light leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Your Peaceful Retreat in Crete
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg"
        >
          Private pool, vineyard views and authentic Cretan living just 15
          minutes from Heraklion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Button href="#book" variant="secondary" size="lg">
            Check Availability
          </Button>
          <Button href="#gallery" variant="ghost" size="lg">
            View Gallery
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative border-t border-white/10 bg-sand-900/40 backdrop-blur-md"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 py-6 md:grid-cols-5 md:gap-0 md:py-8">
          {highlights.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-center gap-2 text-center md:border-r md:border-white/10 md:last:border-r-0",
                index === 0 &&
                  "col-span-2 border-b border-white/10 pb-5 mb-4 md:col-span-1 md:border-b-0 md:pb-0 md:mb-0"
              )}
            >
              {item.icon === "bed" ? <BedIcon /> : <CheckIcon />}
              {item.secondary ? (
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/90">
                    {item.main}
                  </span>
                  <span className="mt-0.5 text-[10px] normal-case tracking-wide text-white/60">
                    {item.secondary}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/90">
                  {item.main}
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
