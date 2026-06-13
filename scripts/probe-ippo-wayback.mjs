import sharp from "sharp";

const UA = "Mozilla/5.0";

async function cdx(url) {
  const q = `url=${encodeURIComponent(url)}&output=json&limit=5&fl=timestamp,statuscode,mimetype,length`;
  const r = await fetch(`https://web.archive.org/cdx/search/cdx?${q}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30000),
  });
  return r.ok ? await r.json() : [];
}

async function probe(label, wbUrl) {
  try {
    const r = await fetch(wbUrl, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(90000) });
    if (!r.ok) return console.log(label, "FAIL", r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    console.log(label, `${m.width}x${m.height}`, `${Math.round(buf.length / 1024)}KB`, wbUrl.slice(0, 130));
    return { w: m.width, h: m.height, buf, wbUrl };
  } catch (e) {
    console.log(label, "ERR", e.message);
    return null;
  }
}

const originals = [
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9640.jpg",
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9619.jpg",
  "https://ippokamposseafood.gr/wp-content/uploads/2024/01/9647_11zon-scaled.jpg",
];

for (const orig of originals) {
  const rows = await cdx(orig);
  console.log("\nCDX", orig, rows.length - 1);
  rows.slice(1).forEach((r) => console.log(" ", r));
  const ts = rows[1]?.[0];
  if (!ts) continue;
  for (const mode of ["im_", "if_", ""]) {
    const wb = `https://web.archive.org/web/${ts}${mode}/${orig}`;
    await probe(mode || "raw", wb);
  }
}
