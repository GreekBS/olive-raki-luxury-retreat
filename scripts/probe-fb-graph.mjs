import sharp from "sharp";

const UA = "Mozilla/5.0";
const pages = ["IppokamposSeafood", "taverna.erganos", "kouzeineri"];

for (const p of pages) {
  for (const w of [2000, 1200]) {
    const u = `https://graph.facebook.com/${p}/picture?width=${w}`;
    try {
      const r = await fetch(u, { headers: { "User-Agent": UA }, redirect: "follow" });
      const buf = Buffer.from(await r.arrayBuffer());
      const m = await sharp(buf).metadata();
      console.log(p, w, r.url.slice(0, 80), `${m.width}x${m.height}`, `${Math.round(buf.length / 1024)}KB`);
    } catch (e) {
      console.log(p, w, "ERR", e.message);
    }
  }
}
