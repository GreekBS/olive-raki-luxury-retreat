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

async function download(url, referer) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: referer || url,
    },
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

async function optimize(buf, outputPath) {
  const metaIn = await sharp(buf).metadata();
  await sharp(buf)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outputPath);
  const stat = fs.statSync(outputPath);
  return {
    originalWidth: metaIn.width,
    originalHeight: metaIn.height,
    width: WIDTH,
    height: HEIGHT,
    bytes: stat.size,
  };
}

const jobs = [
  {
    filename: "kouzeineri.jpg",
    name: "Kouzeineri",
    website: "https://kouzeineri.com/en/",
    sourceUrl:
      "https://kouzeineri.com/wp-content/uploads/2024/05/front_page_hero.jpg",
    downloadUrl:
      "https://web.archive.org/web/20250327231012im_/https://kouzeineri.com/wp-content/uploads/2024/05/front_page_hero.jpg",
    referer: "https://kouzeineri.com/en/",
    note: "Official website hero image (Internet Archive copy of kouzeineri.com). Interior of Kouzeineri steak house, Heraklion.",
  },
  {
    filename: "erganos.jpg",
    name: "Erganos",
    website: "http://www.erganos.gr/",
    sourceUrl: "https://www.e-restaurants.gr/image/5143-erganos-irakleio.jpg",
    downloadUrl: "https://www.e-restaurants.gr/image/5143-erganos-irakleio.jpg",
    referer: "https://www.e-restaurants.gr/en/estiatorio/erganos-irakleio",
    note: "Venue photo from Erganos listing gallery (e-restaurants.gr); restaurant photo gallery sourced from official Facebook page facebook.com/taverna.erganos.",
    fallback: true,
  },
];

// Probe Erganos + Ippokambos candidates first
console.log("=== Probing candidates ===\n");
const probes = [
  ["K hero WB", jobs[0].downloadUrl, jobs[0].referer],
  ["K KOUZ7407", "https://web.archive.org/web/20250327231023im_/https://kouzeineri.com/wp-content/uploads/2024/10/230531-KOUZINERI7407.jpg", "https://kouzeineri.com/en/"],
  ["E e-rest", jobs[1].downloadUrl, jobs[1].referer],
  ["I booking", "https://ippokamposseafood.gr/wp-content/uploads/2024/06/ippokampos-1.jpg", "https://ippokamposseafood.gr/"],
  ["I hero", "https://ippokamposseafood.gr/wp-content/uploads/2024/06/hero.jpg", "https://ippokamposseafood.gr/"],
  ["I rest", "https://ippokamposseafood.gr/wp-content/uploads/2023/12/restaurant.jpg", "https://ippokamposseafood.gr/"],
];

const probeResults = [];
for (const [label, url, ref] of probes) {
  try {
    const buf = await download(url, ref);
    const m = await sharp(buf).metadata();
    const row = { label, url, w: m.width, h: m.height, bytes: buf.length, ok: m.width >= 1200 };
    probeResults.push(row);
    console.log(`${label}\t${m.width}x${m.height}\t${Math.round(buf.length / 1024)}KB\t${url}`);
  } catch (e) {
    console.log(`${label}\tFAIL\t${e.message}`);
  }
}

// Scrape e-restaurants erganos page for more gallery images
const erPage = await fetch("https://www.e-restaurants.gr/en/estiatorio/erganos-irakleio", {
  headers: { "User-Agent": UA },
});
const erHtml = await erPage.text();
const erImgs = [...erHtml.matchAll(/https:\/\/www\.e-restaurants\.gr\/image\/[^"']+/g)].map((m) => m[0]);
console.log("\nErganos e-restaurant images:", erImgs);

for (const u of erImgs.slice(0, 8)) {
  try {
    const buf = await download(u, "https://www.e-restaurants.gr/");
    const m = await sharp(buf).metadata();
    console.log(`  ${m.width}x${m.height} ${u}`);
    if (m.width >= 1600 && !probeResults.find((p) => p.url === u)) {
      jobs[1].downloadUrl = u;
      jobs[1].sourceUrl = u;
    }
  } catch {}
}

// Scrape ippokampos booking page
for (const page of [
  "https://ippokamposseafood.gr/",
  "https://ippokamposseafood.gr/%cf%86%cf%8c%cf%81%ce%bc%ce%b1-%ce%ba%cf%81%ce%ac%cf%84%ce%b7%cf%83%ce%b7%cf%82/",
]) {
  try {
    const r = await fetch(page, { headers: { "User-Agent": UA } });
    console.log(`\nIppokambos page ${r.status} ${page}`);
    if (!r.ok) continue;
    const t = await r.text();
    const imgs = [
      ...new Set(
        [...t.matchAll(/(?:src|data-src|href)=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi)].map(
          (m) => m[1].replace(/\\\//g, "/"),
        ),
      ),
    ].filter((x) => /upload|photo|image|hero|slider/i.test(x));
    imgs.forEach((i) => console.log(" ", i.startsWith("http") ? i : new URL(i, page).href));
  } catch (e) {
    console.log("page err", e.message);
  }
}

// Wayback ippokampos
const wb = await fetch(
  "https://web.archive.org/cdx/search/cdx?url=ippokamposseafood.gr/wp-content/uploads/*.jpg&output=json&limit=30&fl=original,timestamp&filter=statuscode:200&collapse=urlkey",
  { headers: { "User-Agent": UA } },
);
if (wb.ok) {
  const data = await wb.json();
  console.log("\nIppokambos wayback jpg count:", data.length - 1);
  for (const row of data.slice(1, 12)) {
    const u = `https://web.archive.org/web/${row[1]}im_/${row[0]}`;
    try {
      const buf = await download(u, "https://ippokamposseafood.gr/");
      const m = await sharp(buf).metadata();
      console.log(`WB ${m.width}x${m.height} ${row[0]}`);
    } catch (e) {
      console.log(`WB FAIL ${row[0]} ${e.message}`);
    }
  }
}

const results = [];
for (const job of jobs) {
  const out = path.join(OUT_DIR, job.filename);
  console.log(`\nInstalling ${job.name}...`);
  const buf = await download(job.downloadUrl, job.referer);
  const info = await optimize(buf, out);
  results.push({ ...job, ...info, status: "ok" });
  console.log(`  saved ${job.filename} ${info.width}x${info.height} ${Math.round(info.bytes / 1024)}KB`);
}

console.log("\n=== RESULTS ===");
console.log(JSON.stringify(results, null, 2));
