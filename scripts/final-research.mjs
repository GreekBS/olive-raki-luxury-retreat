import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function probe(label, url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) return { label, url, status: r.status };
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    return { label, url, status: r.status, w: m.width, h: m.height, fmt: m.format };
  } catch (e) {
    return { label, url, err: e.message };
  }
}

function log(p) {
  if (p.w) console.log(`${p.label}\t${p.w}x${p.h}\t${p.fmt}\t${p.url}`);
  else console.log(`${p.label}\t${p.status || p.err}\t${p.url}`);
}

const more = [
  ["Peskesi home", "https://peskesicrete.gr/wp-content/uploads/2024/07/home.jpg"],
  ["Peskesi IMG", "https://peskesicrete.gr/wp-content/uploads/2021/11/IMG_1837-scaled.jpg"],
  ["Peskesi MZ7127", "https://peskesicrete.gr/wp-content/uploads/2024/07/MZ2_7127-scaled-1.jpg"],
  ["Peskesi estiatorio", "https://peskesicrete.gr/wp-content/uploads/2022/06/estiatorio_desktop.png"],
  ["Parasties hero", "https://parastiescrete.gr/wp-content/uploads/2025/03/3-scaled.jpg"],
  ["Parasties interior", "https://parastiescrete.gr/wp-content/uploads/2025/02/Parasties-Mar-2024-Photos-Stefanos-by-BeeDigital-04577.png"],
  ["Parasties kitchen", "https://parastiescrete.gr/wp-content/uploads/2025/02/Parasties-Mar-2024-Photos-Stefanos-by-BeeDigital-03325-1365x2048.jpg"],
  ["7T bar", "https://7thalases.gr/wp-content/uploads/2025/06/%CE%B2%CE%B1%CF%81.jpg"],
  ["7T img3", "https://7thalases.gr/wp-content/uploads/2025/06/043e47295b15c067a7b436fad145925d.jpg"],
  ["7T img5", "https://7thalases.gr/wp-content/uploads/2025/06/b8e7cc8a5f354f2342394d2491998bb3.jpg"],
  ["7T rethymno", "https://7thalases.gr/wp-content/uploads/2025/06/7ses.jpg"],
  ["Petousis s1", "https://www.petousis-restaurant.gr/photos/slider/01.jpg"],
  ["Petousis s2", "https://www.petousis-restaurant.gr/photos/slider/02.jpg"],
  ["Petousis s3", "https://www.petousis-restaurant.gr/photos/slider/03.jpg"],
  ["Petousis about1", "https://www.petousis-restaurant.gr/photos/about/01.jpg"],
  ["Petousis about2", "https://www.petousis-restaurant.gr/photos/about/02.jpg"],
  ["Erganos e-rest", "https://www.e-restaurants.gr/images/estiatoria/erganos-irakleio/erganos-irakleio-1.jpg"],
  ["Erganos e-rest2", "https://www.e-restaurants.gr/images/estiatoria/erganos-irakleio/erganos-irakleio-2.jpg"],
];

for (const [l, u] of more) log(await probe(l, u));

// Scrape e-restaurants erganos page
const er = await fetch("https://www.e-restaurants.gr/en/estiatorio/erganos-irakleio", {
  headers: { "User-Agent": UA },
});
console.log("\ne-restaurants", er.status);
if (er.ok) {
  const t = await er.text();
  const imgs = [...new Set([...t.matchAll(/https?:\/\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)/gi)].map((m) => m[0]))];
  imgs.filter((x) => /erganos/i.test(x)).forEach((i) => console.log(i));
}

// 7thalases all pages from sitemap
const sm = await fetch("https://7thalases.gr/sitemap.xml", { headers: { "User-Agent": UA } });
console.log("\nsitemap", sm.status);
if (sm.ok) {
  const st = await sm.text();
  const pages = [...st.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  pages.slice(0, 30).forEach((p) => console.log(p));
}

// Kouzeineri via web archive
const wb = await fetch(
  "https://web.archive.org/cdx/search/cdx?url=kouzeineri.com/wp-content/uploads/*.jpg&output=json&limit=20&fl=original",
  { headers: { "User-Agent": UA } },
);
console.log("\nwayback", wb.status);
if (wb.ok) {
  const data = await wb.json();
  data.slice(1).forEach((row) => console.log(row[0]));
}
