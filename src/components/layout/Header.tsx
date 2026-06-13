"use client";

import { whatsappBookingUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#gallery", label: "Gallery" },
  { href: "#location", label: "Location" },
  { href: "#book", label: "Book" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-sand-50/95 py-3 shadow-sm backdrop-blur-md"
          : "bg-transparent py-5"
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-sand-50 focus:px-4 focus:py-2 focus:text-sand-900 focus:outline-none focus:ring-2 focus:ring-sand-400"
      >
        Skip to content
      </a>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <a
          href="#"
          className={cn(
            "font-serif text-xl tracking-wide transition-colors md:text-2xl",
            scrolled ? "text-sand-900" : "text-white"
          )}
        >
          Olive & Raki Luxury Retreat
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:opacity-70",
                scrolled ? "text-sand-700" : "text-white/90"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#book"
          className={cn(
            "hidden text-xs font-medium uppercase tracking-[0.2em] md:inline-flex",
            "border px-5 py-2.5 transition-colors",
            scrolled
              ? "border-sand-900 text-sand-900 hover:bg-sand-900 hover:text-sand-50"
              : "border-white/40 text-white hover:bg-white/10"
          )}
        >
          Book Now
        </a>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href={whatsappBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex min-h-[44px] items-center border px-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors",
              scrolled
                ? "border-sand-900 text-sand-900 hover:bg-sand-900 hover:text-sand-50"
                : "border-white/40 text-white hover:bg-white/10"
            )}
          >
            Book Now
          </a>

          <button
            type="button"
            className={cn(
              "flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center",
              scrolled ? "text-sand-900" : "text-white"
            )}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-sand-50 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-medium uppercase tracking-[0.15em] text-sand-700"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
