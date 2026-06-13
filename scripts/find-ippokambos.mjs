import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function probe(label, url, referer) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Referer: referer || url, Accept: "image/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) return console.log(label, "FAIL", r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    console.log(label, `${m.width}x${m.height}`, `${Math.round(buf.length / 1024)}KB`, url);
    return { url, w: m.width, h: m.height, buf };
  } catch (e) {
    console.log(label, "ERR", e.message);
    return null;
  }
}

// e-restaurants Ippokampos
const er = await fetch("https://www.e-restaurants.gr/en/estiatorio/ippokampos-irakleio", {
  headers: { "User-Agent": UA },
  signal: AbortSignal.timeout(30000),
});
console.log("e-restaurants", er.status);
if (er.ok) {
  const t = await er.text();
  const imgs = [...t.matchAll(/https:\/\/www\.e-restaurants\.gr\/image\/[^"']+/g)].map((m) => m[0]);
  console.log("images", imgs);
  for (const u of imgs) await probe("e-rest", u, "https://www.e-restaurants.gr/");
}

// Facebook page HTML
const fb = await fetch("https://www.facebook.com/IppokamposSeafood", {
  headers: { "User-Agent": UA },
  signal: AbortSignal.timeout(30000),
});
console.log("\nFB", fb.status);
if (fb.ok) {
  const t = await fb.text();
  const og = t.match(/property="og:image" content="([^"]+)"/);
  if (og) {
    console.log("og:image", og[1]);
    await probe("fb-og", og[1].replace(/&amp;/g, "&"), "https://www.facebook.com/");
  }
  const scontent = [...new Set([...t.matchAll(/https:\\\/\\\/[^"']+scontent[^"']+/g)].map((m) =>
    JSON.parse(`"${m[0]}"`),
  ))];
  console.log("scontent count", scontent.length);
  for (const u of scontent.slice(0, 5)) await probe("fb-sc", u, "https://www.facebook.com/");
}

// Wayback homepage snapshots for image refs in HTML
const cdx = await fetch(
  "https://web.archive.org/cdx/search/cdx?url=ippokamposseafood.gr/&output=json&limit=10&fl=timestamp,statuscode&filter=statuscode:200",
  { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) },
);
if (cdx.ok) {
  const rows = await cdx.json();
  console.log("\nWayback snapshots", rows.length - 1);
  for (const row of rows.slice(1, 4)) {
    const ts = row[0];
    const snap = await fetch(`https://web.archive.org/web/${ts}id_/https://ippokamposseafood.gr/`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(60000),
    });
    console.log("snap", ts, snap.status);
    if (!snap.ok) continue;
    const html = await snap.text();
    const imgs = [
      ...new Set(
        [...html.matchAll(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi)].map((m) => m[0]),
      ),
    ].filter((u) => /ippokam|upload|wp-content|photo/i.test(u));
    imgs.forEach((u) => console.log("  found", u));
    for (const u of imgs.slice(0, 3)) {
      const wb = u.startsWith("http") ? u : `https://ippokamposseafood.gr${u}`;
      const wbu = `https://web.archive.org/web/${ts}im_/${wb}`;
      await probe("wb-img", wbu, "https://ippokamposseafood.gr/");
    }
  }
}
