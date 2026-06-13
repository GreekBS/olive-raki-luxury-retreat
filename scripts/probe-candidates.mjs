import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function probe(label, url, referer) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Referer: referer || url, Accept: "image/*" },
      redirect: "follow",
    });
    if (!r.ok) return console.log(`${label}\t${r.status}\t${url}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    console.log(`${label}\t${m.width}x${m.height}\t${m.format}\t${Math.round(buf.length / 1024)}KB\t${url}`);
  } catch (e) {
    console.log(`${label}\tERR\t${e.message}`);
  }
}

const kouzeineri = [
  "https://kouzeineri.com/wp-content/uploads/2024/05/front_page_hero.jpg",
  "https://kouzeineri.com/wp-content/uploads/2024/05/intro_image.jpg",
  "https://kouzeineri.com/wp-content/uploads/2024/10/230531-KOUZINERI7407.jpg",
  "https://kouzeineri.com/wp-content/uploads/2024/04/backround-scaled.jpg",
  "https://web.archive.org/web/20250327231012im_/https://kouzeineri.com/wp-content/uploads/2024/05/front_page_hero.jpg",
  "https://web.archive.org/web/20250327231023im_/https://kouzeineri.com/wp-content/uploads/2024/10/230531-KOUZINERI7407.jpg",
  "https://web.archive.org/web/20250327231015im_/https://kouzeineri.com/wp-content/uploads/2024/05/intro_image.jpg",
];

for (const u of kouzeineri) await probe("K", u, "https://kouzeineri.com/en/");

// More wayback kouzeineri
const wb = await fetch(
  "https://web.archive.org/cdx/search/cdx?url=kouzeineri.com/wp-content/uploads/*.jpg&output=json&limit=50&fl=original&filter=statuscode:200&collapse=urlkey",
  { headers: { "User-Agent": UA } },
);
const data = await wb.json();
const unique = [...new Set(data.slice(1).map((r) => r[0]))].filter(
  (u) => !/400x400|300x|150x|100x|thumb|logo/i.test(u),
);
console.log("\nKouzeineri wayback unique:", unique.length);
for (const u of unique.slice(0, 20)) {
  const wbu = `https://web.archive.org/web/20250327231012im_/${u}`;
  await probe("KW", wbu, "https://kouzeineri.com/");
}

// Ippokambos wayback broader
const wb2 = await fetch(
  "https://web.archive.org/cdx/search/cdx?url=ippokamposseafood.gr/*&output=json&limit=50&fl=original&filter=statuscode:200&filter=mimetype:image/jpeg",
  { headers: { "User-Agent": UA } },
);
const data2 = await wb2.json();
console.log("\nIppokambos wayback:", data2.length - 1);
for (const row of data2.slice(1, 15)) await probe("I", `https://web.archive.org/web/${row[1]}im_/${row[0]}`, "https://ippokamposseafood.gr/");

// Erganos wayback + facebook graph
const wb3 = await fetch(
  "https://web.archive.org/cdx/search/cdx?url=erganos.gr/*&output=json&limit=20&fl=original,timestamp&filter=statuscode:200",
  { headers: { "User-Agent": UA } },
);
const data3 = await wb3.json();
console.log("\nErganos wayback:", data3.length - 1, data3.slice(1, 5));

// Google indexed FB images search via duckduckgo HTML - skip, try restaurant guru og
