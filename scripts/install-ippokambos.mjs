import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "images", "restaurants", "ippokambos.jpg");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const originals = [
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9640.jpg",
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9647_11zon-scaled.jpg",
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9619.jpg",
];

function wbUrls(orig) {
  const ts = "20240926063141";
  return [
    orig,
    `https://web.archive.org/web/${ts}im_/${orig}`,
    `https://web.archive.org/web/${ts}if_/${orig}`,
    `https://web.archive.org/web/${ts}/${orig}`,
    `https://web.archive.org/web/${ts}id_/${orig}`,
  ];
}

const candidates = [
  ...originals.flatMap((orig) =>
    wbUrls(orig).map((downloadUrl) => ({
      sourceUrl: orig,
      downloadUrl,
      referer: "https://ippokamposseafood.gr/",
      note: "Official website photograph — Ippokampos waterfront restaurant, Sofokli Venizelou 3, Heraklion.",
    })),
  ),
  {
    sourceUrl: "https://www.facebook.com/IppokamposSeafood",
    downloadUrl: "https://graph.facebook.com/IppokamposSeafood/picture?width=2000",
    referer: "https://www.facebook.com/",
    note: "Official Facebook page profile/cover image for Ippokampos Seafood, Heraklion.",
  },
];

async function download(url, referer) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: referer,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

let chosen = null;
for (const c of candidates) {
  try {
    const buf = await download(c.downloadUrl, c.referer);
    const meta = await sharp(buf).metadata();
    if (meta.width < 800 || meta.height < 600) {
      console.log("SKIP small", meta.width, meta.height, c.downloadUrl.slice(0, 90));
      continue;
    }
    console.log(`OK ${meta.width}x${meta.height} ${Math.round(buf.length / 1024)}KB`, c.downloadUrl.slice(0, 100));
    if (!chosen || meta.width > chosen.originalWidth) {
      chosen = { ...c, buf, originalWidth: meta.width, originalHeight: meta.height };
    }
  } catch (e) {
    console.log("FAIL", e.message, c.downloadUrl.slice(0, 90));
  }
}

if (!chosen) throw new Error("No Ippokambos source accessible");

await sharp(chosen.buf)
  .resize(1920, 1440, { fit: "cover", position: "centre" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT);

const stat = fs.statSync(OUT);
console.log(
  "\nINSTALLED",
  JSON.stringify(
    {
      sourceUrl: chosen.sourceUrl,
      downloadUrl: chosen.downloadUrl,
      originalWidth: chosen.originalWidth,
      originalHeight: chosen.originalHeight,
      width: 1920,
      height: 1440,
      bytes: stat.size,
      note: chosen.note,
    },
    null,
    2,
  ),
);
