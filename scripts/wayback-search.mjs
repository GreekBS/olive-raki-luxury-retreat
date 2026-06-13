const UA = "Mozilla/5.0";
import sharp from "sharp";

async function cdx(query) {
  const r = await fetch(`https://web.archive.org/cdx/search/cdx?${query}`, {
    headers: { "User-Agent": UA },
  });
  return r.ok ? await r.json() : [];
}

async function probeWb(timestamp, original) {
  const u = `https://web.archive.org/web/${timestamp}im_/${original}`;
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA } });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    return { u, w: m.width, h: m.height, kb: Math.round(buf.length / 1024) };
  } catch {
    return null;
  }
}

const queries = [
  "url=ippokamposseafood.gr/*&output=json&limit=50&fl=original,timestamp&filter=statuscode:200&filter=mimetype:image/jpeg",
  "url=ippokamposseafood.gr/*&output=json&limit=50&fl=original,timestamp&filter=statuscode:200&filter=mimetype:image/png",
  "url=kouzeineri.com/wp-content/uploads/2024/10/*.jpg&output=json&limit=20&fl=original,timestamp&filter=statuscode:200",
  "url=kouzeineri.com/wp-content/uploads/2024/05/*.jpg&output=json&limit=20&fl=original,timestamp&filter=statuscode:200",
  "url=facebook.com/taverna.erganos/photos/*&output=json&limit=10&fl=original,timestamp&filter=statuscode:200",
];

for (const q of queries) {
  const data = await cdx(q);
  console.log("\nQUERY", q.split("&")[0], "hits", data.length - 1);
  for (const row of data.slice(1, 8)) {
    const p = await probeWb(row[1], row[0]);
    console.log(p ? `${p.w}x${p.h} ${p.kb}KB ${row[0]}` : `FAIL ${row[0]}`);
  }
}
