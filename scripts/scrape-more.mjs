const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const urls = [
  ["Kouzeineri gallery", "https://kouzeineri.com/en/gallery/"],
  ["Kouzeineri home", "https://kouzeineri.com/en/"],
  ["Ippokambos", "https://ippokamposseafood.gr/"],
  ["Erganos FB", "https://www.facebook.com/taverna.erganos/"],
  ["Peskesi press home", "https://peskesicrete.gr/wp-content/uploads/2024/07/home.jpg"],
];

for (const [name, u] of urls) {
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA }, redirect: "follow" });
    console.log(`\n=== ${name} | ${u} | ${r.status} ===`);
    if (r.headers.get("content-type")?.startsWith("image")) {
      console.log("IMAGE", r.headers.get("content-length"), r.headers.get("content-type"));
      continue;
    }
    const t = await r.text();
    const imgs = [
      ...new Set(
        [...t.matchAll(/(?:src|data-src|href)=["']([^"']+)["']/gi)].map((m) => m[1]),
      ),
    ].filter((x) => /\.(jpg|jpeg|png|webp)/i.test(x) && !/icon|favicon|emoji/i.test(x));
    imgs.slice(0, 25).forEach((i) => console.log(i));
  } catch (e) {
    console.log(name, e.message);
  }
}
