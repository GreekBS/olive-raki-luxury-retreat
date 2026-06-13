import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "images", "restaurants");
const UA = "Mozilla/5.0";
const REF = "https://ippokamposseafood.gr/";

const urls = [
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9619.jpg",
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9640.jpg",
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9647_11zon-scaled.jpg",
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9647_11zon-1363x2048.jpg",
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9640-300x200.jpg",
];

for (const url of urls) {
  const name = url.split("/").pop().replace(/\.[^.]+$/, "");
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Referer: REF },
      signal: AbortSignal.timeout(60000),
    });
    if (!r.ok) {
      console.log("FAIL", r.status, name);
      continue;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    const probe = path.join(OUT_DIR, `_probe_${name}.jpg`);
    await sharp(buf).jpeg({ quality: 90 }).toFile(probe);
    console.log("OK", name, `${m.width}x${m.height}`, `${Math.round(buf.length / 1024)}KB`);
  } catch (e) {
    console.log("ERR", name, e.message);
  }
}
