import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchText(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    redirect: "follow",
  });
  return { status: r.status, url: r.url, text: r.ok ? await r.text() : "" };
}

function extractImages(html, base) {
  const found = new Set();
  for (const m of html.matchAll(
    /(?:src|data-src|content|href)=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/gi,
  )) {
    let u = m[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
    if (u.startsWith("//")) u = "https:" + u;
    else if (u.startsWith("/")) u = new URL(u, base).href;
    if (/\.(jpg|jpeg|png|webp)/i.test(u)) found.add(u);
  }
  return [...found];
}

async function probe(label, url, referer) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Referer: referer || url, Accept: "image/*" },
      redirect: "follow",
    });
    if (!r.ok) return `${label}\t${r.status}\t${url}`;
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    return `${label}\t${m.width}x${m.height}\t${m.format}\t${buf.length}\t${url}`;
  } catch (e) {
    return `${label}\tERR\t${e.message}\t${url}`;
  }
}

const pages = [
  ["Erganos site", "http://www.erganos.gr/"],
  ["Erganos FB", "https://www.facebook.com/taverna.erganos/"],
  ["Erganos IG", "https://www.instagram.com/taverna.erganos/"],
  ["Kouzeineri site", "https://kouzeineri.com/en/gallery/"],
  ["Kouzeineri home", "https://kouzeineri.com/en/"],
  ["Kouzeineri FB", "https://www.facebook.com/kouzeineri/"],
  ["Kouzeineri IG", "https://www.instagram.com/kouzeineri/"],
  ["Ippokambos site", "https://ippokamposseafood.gr/"],
  ["Ippokambos FB", "https://www.facebook.com/IppokamposSeafood/"],
  ["Ippokambos IG", "https://www.instagram.com/ippokamposseafood/"],
];

for (const [name, url] of pages) {
  console.log(`\n=== ${name} ===`);
  const { status, text } = await fetchText(url);
  console.log("status", status);
  if (!text) continue;
  const og = text.match(/property="og:image" content="([^"]+)"/);
  if (og) console.log("og:image", og[1]);
  const imgs = extractImages(text, url).filter(
    (x) =>
      !/emoji|favicon|icon|logo\.png|100x100|150x150|sprite/i.test(x) ||
      /scontent|fbcdn|cdninstagram|wp-content/i.test(x),
  );
  imgs
    .filter((x) => /scontent|fbcdn|cdninstagram|wp-content|uploads/i.test(x))
    .slice(0, 15)
    .forEach((i) => console.log(i));
}

const candidates = [
  ["K slide", "https://kouzeineri.com/wp-content/uploads/slide.jpg", "https://kouzeineri.com/en/"],
  ["K apolausi", "https://kouzeineri.com/wp-content/uploads/apolausi.jpg", "https://kouzeineri.com/en/"],
  ["K fine", "https://kouzeineri.com/wp-content/uploads/fine-dining.jpg", "https://kouzeineri.com/en/"],
  ["K JFS", "https://kouzeineri.com/wp-content/uploads/JFS_5221-1.jpg", "https://kouzeineri.com/en/"],
];

console.log("\n--- PROBE ---");
for (const [l, u, ref] of candidates) console.log(await probe(l, u, ref));
