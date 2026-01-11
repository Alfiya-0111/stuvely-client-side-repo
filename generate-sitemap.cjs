// generate-sitemap.cjs
const { writeFileSync } = require("fs");

const BASE_URL = "https://stuvely.com";

const pages = [
  "/",
  "/about",
  "/contact",
  // yahan apne aur routes add karo
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`
  )
  .join("")}
</urlset>`;

writeFileSync("./public/sitemap.xml", sitemap);

console.log("✅ Sitemap generated successfully!");
