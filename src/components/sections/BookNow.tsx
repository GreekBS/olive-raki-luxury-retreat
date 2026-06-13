"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";

const whatsappBookingUrl =
  "https://wa.me/306948386235?text=Hello%20Olive%20%26%20Raki%20Luxury%20Retreat%2C%20I%20would%20like%20information%20about%20availability%20and%20pricing.";

export function BookNow() {
  return (
    <section id="book" className="relative py-24 md:py-32 lg:py-40" aria-label="Book your stay">
      <div className="absolute inset-0">
        <Image
          src="/images/villa-pool-night.jpg"
          alt="Villa at night with illuminated pool"
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-sand-900/70" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-terracotta-400"
        >
          Begin Your Journey
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-3xl font-light text-white md:text-4xl lg:text-5xl"
        >
          Ready for Your Cretan Escape?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base leading-relaxed text-white/80 md:text-lg"
        >
          Reserve your dates at Olive & Raki Luxury Retreat and discover the perfect balance of
          privacy, nature, and Cretan charm.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            href={whatsappBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="lg"
          >
            Book Your Stay
          </Button>
          <Button
            href={whatsappBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="lg"
          >
            Contact Us
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
