import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "images", "restaurants", "ippokambos.jpg");
const sourceUrl =
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9647_11zon-scaled.jpg";
const referer = "https://ippokamposseafood.gr/";

const r = await fetch(sourceUrl, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: referer,
    Accept: "image/*",
  },
  redirect: "follow",
  signal: AbortSignal.timeout(120000),
});
if (!r.ok) throw new Error(`HTTP ${r.status}`);
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
      width: 1920,
      height: 1440,
      bytes: stat.size,
    },
    null,
    2,
  ),
);
