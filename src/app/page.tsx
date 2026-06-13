import { StructuredData } from "@/components/StructuredData";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Gallery } from "@/components/sections/Gallery";
import { Beaches } from "@/components/sections/Beaches";
import { Restaurants } from "@/components/sections/Restaurants";
import { Attractions } from "@/components/sections/Attractions";
import { LocationMap } from "@/components/sections/LocationMap";
import { Testimonials } from "@/components/sections/Testimonials";
import { BookNow } from "@/components/sections/BookNow";

export default function Home() {
  return (
    <>
      <StructuredData />
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Experience />
        <Gallery />
        <Beaches />
        <Restaurants />
        <Attractions />
        <LocationMap />
        <Testimonials />
        <BookNow />
      </main>
      <Footer />
    </>
  );
}
