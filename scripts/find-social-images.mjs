import sharp from "sharp";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function igProfile(username) {
  const r = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
    headers: {
      "User-Agent": UA,
      "X-IG-App-ID": "936619743392459",
      Accept: "*/*",
    },
  });
  console.log(`IG ${username}`, r.status);
  if (!r.ok) return;
  const j = await r.json();
  const user = j.data?.user;
  if (!user) return;
  console.log("full_name", user.full_name);
  console.log("bio", user.biography?.slice(0, 120));
  const edges = user.edge_owner_to_timeline_media?.edges || [];
  for (const e of edges.slice(0, 8)) {
    const n = e.node;
    const url = n.display_url || n.thumbnail_src;
    const cap = (n.edge_media_to_caption?.edges?.[0]?.node?.text || "").slice(0, 80);
    console.log(`${n.dimensions?.width}x${n.dimensions?.height}\t${cap}\t${url}`);
  }
}

async function waybackUrls(domain) {
  const r = await fetch(
    `https://web.archive.org/cdx/search/cdx?url=${domain}/wp-content/uploads/*&output=json&limit=30&fl=original,timestamp&filter=statuscode:200&filter=mimetype:image/jpeg`,
    { headers: { "User-Agent": UA } },
  );
  if (!r.ok) return;
  const data = await r.json();
  data.slice(1, 15).forEach((row) => console.log(row[0], row[1]));
}

async function probe(label, url, referer) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Referer: referer || url, Accept: "image/*" },
    });
    if (!r.ok) return console.log(label, r.status, url);
    const buf = Buffer.from(await r.arrayBuffer());
    const m = await sharp(buf).metadata();
    console.log(label, `${m.width}x${m.height}`, m.format, `${Math.round(buf.length / 1024)}KB`, url);
  } catch (e) {
    console.log(label, "ERR", e.message);
  }
}

console.log("=== Instagram profiles ===");
for (const u of ["kouzeineri", "ippokamposseafood", "taverna.erganos"]) {
  await igProfile(u);
  console.log("");
}

console.log("=== Wayback Kouzeineri ===");
await waybackUrls("kouzeineri.com");

console.log("\n=== Wayback Ippokambos ===");
await waybackUrls("ippokamposseafood.gr");

console.log("\n=== e-restaurants erganos ===");
const er = await fetch("https://www.e-restaurants.gr/en/estiatorio/erganos-irakleio", {
  headers: { "User-Agent": UA },
});
const et = await er.text();
const imgs = [...et.matchAll(/https:\/\/www\.e-restaurants\.gr\/image\/[^"']+/g)].map((m) => m[0]);
imgs.forEach((i) => console.log(i));

console.log("\n=== Probes ===");
for (const [l, u, ref] of [
  ["erganos e-rest", "https://www.e-restaurants.gr/image/5143-erganos-irakleio.jpg", "https://www.e-restaurants.gr/"],
]) await probe(l, u, ref);
