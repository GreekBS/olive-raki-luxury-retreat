"use client";

import {
  galleryCategories,
  getImagesByCategory,
  propertyImages,
  type GalleryCategory,
} from "@/data/images";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

const INITIAL_VISIBLE_COUNT = 12;
const GALLERY_TABPANEL_ID = "gallery-tabpanel";

const tabButtonClass =
  "px-4 py-3 min-h-[44px] text-xs font-medium uppercase tracking-[0.15em] transition-colors";

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "all">(
    "all"
  );
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const filteredImages = useMemo(
    () => getImagesByCategory(activeCategory),
    [activeCategory]
  );

  const displayImages = useMemo(() => {
    if (activeCategory === "all" && !showAllPhotos) {
      return filteredImages.slice(0, INITIAL_VISIBLE_COUNT);
    }
    return filteredImages;
  }, [activeCategory, filteredImages, showAllPhotos]);

  const showMorePhotosControl =
    activeCategory === "all" && filteredImages.length > INITIAL_VISIBLE_COUNT;

  const handleCategoryChange = (category: GalleryCategory | "all") => {
    setActiveCategory(category);
    setShowAllPhotos(false);
  };

  const handleTogglePhotos = () => {
    if (showAllPhotos) {
      setShowAllPhotos(false);
      requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    } else {
      setShowAllPhotos(true);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const activeTabId =
    activeCategory === "all" ? "gallery-tab-all" : `gallery-tab-${activeCategory}`;

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="bg-sand-50 py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Gallery"
            title="A Glimpse of Villa Life"
            subtitle="Explore every corner of your private Cretan retreat."
          />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div
            className="mb-10 flex flex-wrap justify-center gap-2 md:gap-3"
            role="tablist"
            aria-label="Gallery categories"
          >
            <button
              id="gallery-tab-all"
              role="tab"
              aria-selected={activeCategory === "all"}
              aria-controls={GALLERY_TABPANEL_ID}
              onClick={() => handleCategoryChange("all")}
              className={cn(
                tabButtonClass,
                activeCategory === "all"
                  ? "bg-sand-900 text-sand-50"
                  : "bg-sand-100 text-sand-600 hover:bg-sand-200"
              )}
            >
              All
            </button>
            {galleryCategories.map((cat) => (
              <button
                key={cat.id}
                id={`gallery-tab-${cat.id}`}
                role="tab"
                aria-selected={activeCategory === cat.id}
                aria-controls={GALLERY_TABPANEL_ID}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  tabButtonClass,
                  activeCategory === cat.id
                    ? "bg-sand-900 text-sand-50"
                    : "bg-sand-100 text-sand-600 hover:bg-sand-200"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <div
          id={GALLERY_TABPANEL_ID}
          role="tabpanel"
          aria-labelledby={activeTabId}
          className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
        >
          <AnimatePresence initial={false}>
            {displayImages.map((image, index) => {
              const globalIndex = propertyImages.findIndex(
                (img) => img.src === image.src
              );
              return (
                <motion.button
                  key={image.src}
                  layout
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    delay:
                      shouldReduceMotion || index < INITIAL_VISIBLE_COUNT
                        ? 0
                        : (index - INITIAL_VISIBLE_COUNT) * 0.03,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => openLightbox(globalIndex)}
                  className={cn(
                    "group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400",
                    image.aspect === "wide" && "md:col-span-2",
                    image.aspect === "tall" && "md:row-span-2"
                  )}
                  aria-label={`View ${image.alt}`}
                >
                  <div
                    className={cn(
                      "relative w-full",
                      image.aspect === "tall"
                        ? "aspect-[3/4] md:aspect-auto md:h-full md:min-h-[400px]"
                        : "aspect-[4/3]"
                    )}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-sand-900/0 transition-colors duration-300 group-hover:bg-sand-900/20" />
                    <div className="absolute bottom-0 left-0 right-0 translate-y-0 bg-gradient-to-t from-sand-900/60 to-transparent p-4 transition-transform duration-300 md:translate-y-full md:group-hover:translate-y-0">
                      <p className="text-left text-xs text-white/90 line-clamp-2">
                        {image.alt}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {showMorePhotosControl && (
          <div className="mt-10 flex justify-center">
            <Button variant="outline" size="md" onClick={handleTogglePhotos}>
              {showAllPhotos ? "Show Less" : "More Photos"}
            </Button>
          </div>
        )}
      </div>

      <Lightbox
        images={propertyImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
