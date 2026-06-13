import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "images", "restaurants");
const UA = "Mozilla/5.0";

const rg = await fetch("https://restaurantguru.com/Ippokampos-Heraklion", {
  headers: { "User-Agent": UA },
  signal: AbortSignal.timeout(90000),
});
const html = await rg.text();
const urls = [
  ...new Set(
    [...html.matchAll(/https:\/\/[^"'\s\\]+/gi)]
      .map((m) => m[0].replace(/\\u002F/g, "/").replace(/\\\//g, "/"))
      .filter((u) => /\.(jpg|jpeg|webp)/i.test(u)),
  ),
];
console.log("total jpg urls", urls.length);
let n = 0;
for (const u of urls) {
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
    if (!r.ok) continue;
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("image")) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    if (m.width < 600) continue;
    n++;
    const file = path.join(OUT, `_probe_rg_${n}_${m.width}x${m.height}.jpg`);
    await sharp(buf).jpeg({ quality: 90 }).toFile(file);
    console.log(n, m.width, m.height, u.slice(0, 120));
    if (n >= 8) break;
  } catch {}
}
