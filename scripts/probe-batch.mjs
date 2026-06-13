import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function probe(label, url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) return console.log(`${label}\t${r.status}\t${url}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    console.log(`${label}\t${m.width}x${m.height}\t${m.format}\t${url}`);
  } catch (e) {
    console.log(`${label}\tERR ${e.message}\t${url}`);
  }
}

const urls = [
  ["Kouzeineri apolausi", "https://kouzeineri.com/wp-content/uploads/apolausi.jpg"],
  ["Kouzeineri logo", "https://kouzeineri.com/wp-content/uploads/logo.png"],
  ["Erganos e-rest", "https://www.e-restaurants.gr/image/5143-erganos-irakleio.jpg"],
  ["7T thumb", "https://7thalases.gr/wp-content/uploads/2025/06/46f4f39c52912f317b09020c96cfc1cd_thumb.jpg"],
];

for (const u of urls) await probe(...u);

// 7thalases page sitemap
const sm = await fetch("https://7thalases.gr/page-sitemap.xml", { headers: { "User-Agent": UA } });
const st = await sm.text();
const pages = [...st.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log("\nPages:", pages.join("\n"));

for (const p of pages.filter((x) => /heraklion|rethymno|restaurant|about/i.test(x) || x === "https://7thalases.gr/")) {
  const r = await fetch(p, { headers: { "User-Agent": UA } });
  const t = await r.text();
  const imgs = [...t.matchAll(/src="(https:\/\/7thalases\.gr\/wp-content\/uploads\/[^"]+\.(?:jpg|jpeg|png))"/gi)].map(
    (m) => m[1],
  );
  console.log(`\n${p}`);
  [...new Set(imgs)].forEach((i) => console.log(i));
}

// Ippokambos Facebook og
const fb = await fetch("https://www.facebook.com/IppokamposSeafood/", {
  headers: { "User-Agent": UA },
  redirect: "follow",
});
console.log("\nFB Ippokambos", fb.status, fb.url);
const fbt = await fb.text();
const og = fbt.match(/property="og:image" content="([^"]+)"/);
if (og) console.log("og:image", og[1]);

// Erganos FB
const efb = await fetch("https://www.facebook.com/taverna.erganos/", { headers: { "User-Agent": UA } });
console.log("\nFB Erganos", efb.status);
const efbt = await efb.text();
const eog = efbt.match(/property="og:image" content="([^"]+)"/);
if (eog) console.log("og:image", eog[1]);

// Kouzeineri FB
const kfb = await fetch("https://www.facebook.com/kouzeineri/", { headers: { "User-Agent": UA } });
console.log("\nFB Kouzeineri", kfb.status);
const kfbt = await kfb.text();
const kog = kfbt.match(/property="og:image" content="([^"]+)"/);
if (kog) console.log("og:image", kog[1]);
