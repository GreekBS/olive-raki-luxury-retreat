import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "images", "restaurants", "erganos.jpg");
const UA = "Mozilla/5.0";
const sourceUrl = "https://www.facebook.com/taverna.erganos/";
const downloadUrl = "https://graph.facebook.com/taverna.erganos/picture?width=2000";

const r = await fetch(downloadUrl, {
  headers: { "User-Agent": UA, Referer: sourceUrl },
  redirect: "follow",
});
const buf = Buffer.from(await r.arrayBuffer());
const meta = await sharp(buf).metadata();
console.log("Downloaded", meta.width, meta.height, "final URL", r.url);

await sharp(buf)
  .resize(1920, 1440, { fit: "cover", position: "centre" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT);

const stat = fs.statSync(OUT);
console.log(
  JSON.stringify(
    {
      sourceUrl,
      downloadUrl: r.url,
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
