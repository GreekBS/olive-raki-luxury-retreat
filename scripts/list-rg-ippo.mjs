const UA = "Mozilla/5.0";
const rg = await fetch("https://restaurantguru.com/Ippokampos-Heraklion", {
  headers: { "User-Agent": UA },
});
const html = await rg.text();
const urls = [
  ...new Set(
    [...html.matchAll(/https:\/\/img[0-9]\.restaurantguru\.com\/[^"'\s\\]+/gi)].map((m) =>
      m[0].replace(/\\u002F/g, "/"),
    ),
  ),
];
urls.forEach((u) => console.log(u));
