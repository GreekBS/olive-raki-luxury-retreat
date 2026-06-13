import sharp from "sharp";

const UA = "Mozilla/5.0";
const SNAP = "https://web.archive.org/web/20240926063141id_/https://ippokamposseafood.gr/";

const r = await fetch(SNAP, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(120000) });
console.log("snapshot", r.status);
const html = await r.text();
const imgs = [
  ...new Set(
    [...html.matchAll(/(?:src|data-src|srcset)=["']([^"']+)["']/gi)].map((m) => m[1]),
  ),
];
console.log("img refs", imgs.length);
imgs.forEach((u) => console.log(u));

for (const u of imgs.filter((x) => /\.(jpg|jpeg|png|webp)/i.test(x) && !/logo|favi|150x|100x|117|78/i.test(x))) {
  let full = u;
  if (u.startsWith("/web/")) full = "https://web.archive.org" + u;
  else if (!u.startsWith("http")) full = new URL(u, SNAP).href;
  try {
    const ir = await fetch(full, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(90000) });
    if (!ir.ok) {
      console.log("FAIL", ir.status, full.slice(0, 120));
      continue;
    }
    const buf = Buffer.from(await ir.arrayBuffer());
    const m = await sharp(buf).metadata();
    console.log(`OK ${m.width}x${m.height} ${Math.round(buf.length / 1024)}KB ${full.slice(0, 140)}`);
  } catch (e) {
    console.log("ERR", e.message, full.slice(0, 100));
  }
}
