import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oliveandraki.gr"),
  title: "Olive & Raki Luxury Retreat | Peaceful Boutique Retreat in Crete",
  description:
    "Private pool, vineyard views and authentic Cretan living on a 4,000 sqm estate just 15 minutes from Heraklion. Perfect for families and couples seeking tranquility near beaches and attractions.",
  keywords: [
    "Crete villa rental",
    "Heraklion accommodation",
    "private pool villa Crete",
    "boutique villa Greece",
    "family villa Crete",
    "vineyard estate Crete",
  ],
  openGraph: {
    title: "Olive & Raki Luxury Retreat | Your Peaceful Retreat in Crete",
    description:
      "Private pool, vineyard views and authentic Cretan living just 15 minutes from Heraklion.",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/images/villa-pool-exterior.jpg",
        width: 1920,
        height: 1080,
        alt: "Olive & Raki Luxury Retreat with private pool in Crete",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olive & Raki Luxury Retreat | Peaceful Retreat in Crete",
    description:
      "Private pool, vineyard views and authentic Cretan living just 15 minutes from Heraklion.",
    images: ["/images/villa-pool-exterior.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
