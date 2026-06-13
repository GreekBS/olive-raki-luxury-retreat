import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function probe(label, url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) return `${label}\t${r.status}\t${url}`;
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    return `${label}\t${m.width}x${m.height}\t${m.format}\t${url}`;
  } catch (e) {
    return `${label}\tERR\t${url}`;
  }
}

// Kouzeineri common WP paths from search snippets
const kouzeineri = [
  "https://kouzeineri.com/wp-content/uploads/2016/03/kouzeineri-heraklion.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/restaurant.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/gallery-1.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/gallery-2.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/gallery-3.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/gallery-4.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/gallery-5.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/gallery-6.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/steakhouse.jpg",
  "https://kouzeineri.com/wp-content/uploads/2016/03/kouzeineri.jpg",
  "https://kouzeineri.com/wp-content/uploads/2015/06/kouzeineri-steak-house.jpg",
  "https://kouzeineri.com/wp-content/uploads/2015/06/restaurant-heraklion.jpg",
];

for (const u of kouzeineri) console.log(await probe("K", u));

// Ippokambos - fetch homepage with referer
const ippHtml = await fetch("https://ippokamposseafood.gr/", {
  headers: {
    "User-Agent": UA,
    Accept: "text/html",
    "Accept-Language": "en-US,en;q=0.9",
  },
});
console.log("\nIppokambos HTML", ippHtml.status);
if (ippHtml.ok) {
  const t = await ippHtml.text();
  const imgs = [...t.matchAll(/(?:src|data-src|srcset)=["']([^"']+)["']/gi)].map(
    (m) => m[1],
  );
  [...new Set(imgs)].slice(0, 30).forEach((i) => console.log(i));
}

// Erganos site
const erg = await fetch("http://www.erganos.gr/", { headers: { "User-Agent": UA } });
console.log("\nErganos", erg.status);
if (erg.ok) {
  const t = await erg.text();
  console.log("len", t.length);
  const imgs = [...t.matchAll(/(?:src|background[^:]*:\s*url\(["']?)([^"')]+)/gi)].map(
    (m) => m[1],
  );
  [...new Set(imgs)].forEach((i) => console.log(i));
  // print snippet around img
  const idx = t.indexOf("img");
  if (idx > -1) console.log(t.slice(idx, idx + 500));
}

// 7 Thalasses - get page and image context
const th = await fetch("https://7thalases.gr/", { headers: { "User-Agent": UA } });
const tht = await th.text();
const blocks = [...tht.matchAll(/<img[^>]+>/gi)].map((m) => m[0]);
console.log("\n7 Thalasses img tags:");
blocks.forEach((b) => console.log(b.slice(0, 200)));
