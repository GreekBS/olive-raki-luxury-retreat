const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const pages = [
  ["Erganos", "https://restaurantguru.com/Peskesi-Heraklion"],
  ["Erganos", "https://restaurantguru.com/Erganos-Heraklion"],
  ["Ippokambos", "https://restaurantguru.com/Ippokampos-Heraklion"],
  ["Ippokambos", "https://ru.restaurantguru.com/Ippokampos-Heraklion"],
  ["Erganos purefood", "https://www.purefoodtravel.com/taverna-erganos-heraklion/"],
  ["Ippokambos aetoi", "https://www.aetoitisgastronomias.eu/profile-38267-ippokampos"],
];

for (const [name, url] of pages) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  const t = await r.text();
  console.log(`\n=== ${name} ${r.status} ===`);
  const scontent = [...new Set([...t.matchAll(/https:\/\/[^"'\s]*(?:scontent|fbcdn)[^"'\s]+\.(?:jpg|jpeg|png)/gi)].map((m) => m[0].replace(/\\u0026/g, "&")))];
  scontent.slice(0, 10).forEach((u) => console.log(u));
  const imgs = [...new Set([...t.matchAll(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|webp)(?:\?[^"'\s]*)?/gi)].map((m) => m[0]))]
    .filter((u) => /erganos|ippokam|taverna|restaurant|upload|wp-content|cdninstagram/i.test(u) && !/logo|icon|avatar|emoji/i.test(u));
  imgs.slice(0, 10).forEach((u) => console.log("img", u));
}
