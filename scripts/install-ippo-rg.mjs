import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "images", "restaurants", "ippokambos.jpg");
const UA = "Mozilla/5.0";
const sourceUrl = "https://img4.restaurantguru.com/refa-Ippokampos-interior-2026-05.jpg";

const r = await fetch(sourceUrl, { headers: { "User-Agent": UA } });
const buf = Buffer.from(await r.arrayBuffer());
const meta = await sharp(buf).metadata();

await sharp(buf)
  .resize(1920, 1440, { fit: "cover", position: "centre" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT);

const stat = fs.statSync(OUT);
console.log(
  JSON.stringify(
    {
      sourceUrl,
      originalWidth: meta.width,
      originalHeight: meta.height,
      finalWidth: 1920,
      finalHeight: 1440,
      bytes: stat.size,
    },
    null,
    2,
  ),
);
