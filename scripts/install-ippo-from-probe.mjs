import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const probe = path.join(__dirname, "..", "public", "images", "restaurants", "_probe_rg_1_1080x1350.jpg");
const out = path.join(__dirname, "..", "public", "images", "restaurants", "ippokambos.jpg");

const buf = fs.readFileSync(probe);
const meta = await sharp(buf).metadata();
await sharp(buf)
  .resize(1920, 1440, { fit: "cover", position: "centre" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);

const stat = fs.statSync(out);
console.log(
  JSON.stringify(
    {
      sourceUrl: "https://img4.restaurantguru.com/refa-Ippokampos-interior-2026-05.jpg",
      originalWidth: meta.width,
      originalHeight: meta.height,
      width: 1920,
      height: 1440,
      bytes: stat.size,
    },
    null,
    2,
  ),
);
