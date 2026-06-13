const urls = [
  ["Peskesi", "https://peskesicrete.gr/en/"],
  ["Peskesi", "https://peskesicrete.gr/en/press-kit"],
  ["Parasties", "https://parastiescrete.gr/"],
  ["Parasties", "https://parastiescrete.gr/restaurant/"],
  ["7 Thalasses", "https://7thalases.gr/"],
  ["Ippokambos", "https://ippokamposseafood.gr/"],
  ["Petousis", "https://www.petousis-restaurant.gr/en/index.php"],
  ["Petousis", "https://www.petousis-restaurant.gr/en/restaurant.php"],
  ["Erganos", "http://www.erganos.gr/"],
];

function extractImages(html, base) {
  const found = new Set();
  const patterns = [
    /(?:src|data-src|data-lazy-src|data-original|href)=["']([^"']+)["']/gi,
    /url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp)[^"')]*)/gi,
    /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?)/gi,
    /(\/wp-content\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?)/gi,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      let u = m[1] || m[0];
      if (u.startsWith("//")) u = "https:" + u;
      else if (u.startsWith("/")) u = new URL(u, base).href;
      if (/\.(jpg|jpeg|png|webp)/i.test(u)) found.add(u);
    }
  }
  return [...found].filter(
    (x) =>
      !/icon|favicon|logo-small|sprite|emoji|1x1|pixel|gravatar|svg/i.test(x) ||
      /logo/i.test(x) === false,
  );
}

for (const [name, u] of urls) {
  try {
    const r = await fetch(u, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    });
    const t = await r.text();
    const imgs = extractImages(t, u).filter(
      (x) => !/icon|favicon|logo|gravatar|emoji|150x150|100x100/i.test(x),
    );
    console.log(`\n=== ${name} | ${u} | ${r.status} | ${imgs.length} imgs ===`);
    imgs.slice(0, 20).forEach((i) => console.log(i));
  } catch (e) {
    console.log(name, u, e.message);
  }
}
