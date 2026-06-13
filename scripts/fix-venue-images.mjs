import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "images", "restaurants");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function download(url, referer) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: referer,
      Accept: "image/*",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function saveVenue(filename, buf) {
  const out = path.join(OUT_DIR, filename);
  const meta = await sharp(buf).metadata();
  await sharp(buf)
    .resize(1920, 1440, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  const stat = fs.statSync(out);
  return { originalWidth: meta.width, originalHeight: meta.height, bytes: stat.size };
}

const candidates = [
  {
    file: "erganos.jpg",
    url: "https://www.e-restaurants.gr/image/5143-erganos-irakleio.jpg",
    referer: "https://www.e-restaurants.gr/en/estiatorio/erganos-irakleio",
    sourceUrl: "https://www.e-restaurants.gr/image/5143-erganos-irakleio.jpg",
    note: "Erganos venue interior/terrace (e-restaurants gallery, sourced from official Facebook)",
  },
  {
    file: "ippokambos.jpg",
    url: "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9640.jpg",
    referer: "https://ippokamposseafood.gr/",
    sourceUrl: "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9640.jpg",
    note: "Ippokambos waterfront terrace dining (official website)",
  },
  {
    file: "ippokambos-alt",
    url: "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9619.jpg",
    referer: "https://ippokamposseafood.gr/",
    sourceUrl: "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9619.jpg",
    note: "Ippokambos venue alt",
  },
];

for (const c of candidates) {
  try {
    const buf = await download(c.url, c.referer);
    const m = await sharp(buf).metadata();
    const probe = path.join(OUT_DIR, `_probe_${c.file}`);
    await sharp(buf).jpeg({ quality: 90 }).toFile(probe);
    console.log(`OK ${c.file} ${m.width}x${m.height} ${Math.round(buf.length / 1024)}KB -> ${probe}`);
  } catch (e) {
    console.log(`FAIL ${c.file}`, e.message);
  }
}

// Install confirmed venue replacements
const installs = [
  {
    filename: "erganos.jpg",
    url: "https://www.e-restaurants.gr/image/5143-erganos-irakleio.jpg",
    referer: "https://www.e-restaurants.gr/en/estiatorio/erganos-irakleio",
    sourceUrl: "https://www.e-restaurants.gr/image/5143-erganos-irakleio.jpg",
  },
  {
    filename: "ippokambos.jpg",
    url: "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9640.jpg",
    referer: "https://ippokamposseafood.gr/",
    sourceUrl: "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9640.jpg",
  },
];

const results = [];
for (const job of installs) {
  const buf = await download(job.url, job.referer);
  const info = await saveVenue(job.filename, buf);
  results.push({ ...job, ...info, status: "installed" });
  console.log("INSTALLED", job.filename, info);
}

// cleanup probes
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.startsWith("_probe_")) fs.unlinkSync(path.join(OUT_DIR, f));
}

console.log(JSON.stringify(results, null, 2));
