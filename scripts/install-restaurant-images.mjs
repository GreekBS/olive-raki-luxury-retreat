import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "images", "restaurants");
const WIDTH = 1920;
const HEIGHT = 1440;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const restaurants = [
  {
    filename: "peskesi.jpg",
    name: "Peskesi",
    website: "https://peskesicrete.gr/en/",
    sourceUrl:
      "https://peskesicrete.gr/wp-content/uploads/2021/11/IMG_1837-scaled.jpg",
    referer: "https://peskesicrete.gr/",
    note: "Official homepage photograph of the Peskesi restaurant in the restored Captain Polyxigis mansion, Heraklion. Image © Peskesi; used for promotional display on the Olive & Raki Luxury Retreat website.",
  },
  {
    filename: "parasties.jpg",
    name: "Parasties",
    website: "https://parastiescrete.gr/",
    sourceUrl:
      "https://parastiescrete.gr/wp-content/uploads/2025/03/3-scaled.jpg",
    referer: "https://parastiescrete.gr/",
    note: "Official homepage hero photograph of the Parasties neoclassical restaurant, Heraklion (commissioned venue shoot). Image © Parasties; used for promotional display on the Olive & Raki Luxury Retreat website.",
  },
  {
    filename: "7-thalasses.jpg",
    name: "7 Thalasses",
    website: "https://7thalases.gr/",
    sourceUrl:
      "https://7thalases.gr/wp-content/uploads/2025/06/b8e7cc8a5f354f2342394d2491998bb3.jpg",
    referer: "https://7thalases.gr/",
    note: "Official website photograph of the 7 Thalasses restaurant interior. Image © 7 Thalasses; used for promotional display on the Olive & Raki Luxury Retreat website.",
  },
  {
    filename: "petousis.jpg",
    name: "Petousis Restaurant",
    website: "https://www.petousis-restaurant.gr/en/",
    sourceUrl: "https://www.petousis-restaurant.gr/photos/slider/01.jpg",
    referer: "https://www.petousis-restaurant.gr/",
    note: "Official homepage slider photograph of Petousis Restaurant, Ammoudara/Heraklion. Image © Petousis; used for promotional display on the Olive & Raki Luxury Retreat website.",
  },
  {
    filename: "kouzeineri.jpg",
    name: "Kouzeineri",
    website: "https://kouzeineri.com/en/",
    sourceUrl: "https://kouzeineri.com/wp-content/uploads/slide.jpg",
    referer: "https://kouzeineri.com/en/",
    optional: true,
    note: "Official homepage hero photograph of Kouzeineri steak house, Heraklion. Image © Kouzeineri; used for promotional display on the Olive & Raki Luxury Retreat website.",
  },
];

async function download(url, referer) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: referer,
    },
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function optimize(input, outputPath) {
  await sharp(input)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  const stat = fs.statSync(outputPath);
  return { width: meta.width, height: meta.height, bytes: stat.size };
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const results = [];
const attribution = [];

for (const r of restaurants) {
  const outPath = path.join(OUT_DIR, r.filename);
  try {
    console.log(`Downloading ${r.name}...`);
    const buf = await download(r.sourceUrl, r.referer);
    const info = await optimize(buf, outPath);
    console.log(`  OK ${info.width}x${info.height} ${(info.bytes / 1024).toFixed(0)} KB`);
    results.push({ ...r, status: "ok", ...info });
    attribution.push(r);
  } catch (e) {
    if (r.optional) {
      console.log(`  SKIP ${r.name} (${e.message}) — keeping existing placeholder`);
      results.push({ ...r, status: "skipped", error: e.message });
    } else {
      throw new Error(`${r.name}: ${e.message}`);
    }
  }
}

const attrLines = [
  "Restaurant Image Attributions",
  "==============================",
  "Venue photographs sourced from official restaurant websites.",
  "Optimized for web use on the Olive & Raki Luxury Retreat website.",
  "These images are not Creative Commons; courtesy of each restaurant.",
  "",
];

for (const r of attribution) {
  attrLines.push(`Restaurant: ${r.name}`);
  attrLines.push(`File: ${r.filename}`);
  attrLines.push(`Official website: ${r.website}`);
  attrLines.push(`Source image URL: ${r.sourceUrl}`);
  attrLines.push(`Attribution note: ${r.note}`);
  attrLines.push("");
}

attrLines.push("Placeholder (venue photo pending):");
attrLines.push("  erganos.jpg — Erganos (http://www.erganos.gr/)");
attrLines.push("  ippokambos.jpg — Ippokambos (https://ippokamposseafood.gr/)");
attrLines.push("");

fs.writeFileSync(path.join(OUT_DIR, "ATTRIBUTION.txt"), attrLines.join("\n"));
console.log("\nWrote ATTRIBUTION.txt");
console.log(JSON.stringify(results, null, 2));
