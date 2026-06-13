import sharp from "sharp";

const candidates = [
  ["Peskesi A", "https://peskesicrete.gr/wp-content/uploads/2024/07/home.jpg"],
  ["Peskesi B", "https://peskesicrete.gr/wp-content/uploads/2024/07/MZ2_7127-scaled-1.jpg"],
  ["Peskesi C", "https://peskesicrete.gr/wp-content/uploads/2021/11/IMG_1837-scaled.jpg"],
  ["Peskesi D", "https://peskesicrete.gr/wp-content/uploads/2024/07/MZ2_7340-scaled-1.jpg"],
  ["Peskesi E", "https://peskesicrete.gr/wp-content/uploads/2022/05/pagoni.jpg"],
  ["Parasties A", "https://parastiescrete.gr/wp-content/uploads/2025/03/3-scaled.jpg"],
  ["Parasties B", "https://parastiescrete.gr/wp-content/uploads/2025/02/Parasties-Mar-2024-Photos-Stefanos-by-BeeDigital-03325-1365x2048.jpg"],
  ["Parasties C", "https://parastiescrete.gr/wp-content/uploads/2025/02/Parasties-Mar-2024-Photos-Stefanos-by-BeeDigital-04577.png"],
  ["7 Thalasses A", "https://7thalases.gr/wp-content/uploads/2025/06/7ses.jpg"],
  ["7 Thalasses B", "https://7thalases.gr/wp-content/uploads/2025/06/043e47295b15c067a7b436fad145925d.jpg"],
  ["7 Thalasses C", "https://7thalases.gr/wp-content/uploads/2025/06/b8e7cc8a5f354f2342394d2491998bb3.jpg"],
  ["7 Thalasses D", "https://7thalases.gr/wp-content/uploads/2025/06/9d276d8968eaea474616de72af71221c.jpg"],
  ["Petousis A", "https://www.petousis-restaurant.gr/photos/slider/01.jpg"],
  ["Petousis B", "https://www.petousis-restaurant.gr/photos/about/01.jpg"],
  ["Petousis C", "https://www.petousis-restaurant.gr/images/opengraph.jpg"],
  ["Ippokambos A", "https://ippokamposseafood.gr/wp-content/uploads/2024/01/ippokampos-hero.jpg"],
  ["Ippokambos B", "https://ippokamposseafood.gr/wp-content/uploads/2023/06/hero-image.jpg"],
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

for (const [label, url] of candidates) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!r.ok) {
      console.log(`${label}\t${r.status}\t${url}`);
      continue;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const meta = await sharp(buf).metadata();
    console.log(
      `${label}\t${r.status}\t${meta.width}x${meta.height}\t${meta.format}\t${url}`,
    );
  } catch (e) {
    console.log(`${label}\tERR\t${e.message}\t${url}`);
  }
}
