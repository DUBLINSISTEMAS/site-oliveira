// One-shot script: render PDF logo to a tightly-cropped transparent PNG.
import { pdf } from "pdf-to-img";
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const pdfPath = resolve(root, "assets", "Sem título-2.pdf");
const outDir = resolve(root, "assets");

const pages = await pdf(pdfPath, { scale: 4 });
let i = 0;
for await (const page of pages) {
  i++;
  // Trim white background, then resize to a sane width.
  const trimmed = await sharp(page)
    .flatten({ background: "#ffffff" })
    .trim({ threshold: 10 })
    .png()
    .toBuffer();

  // Make near-white pixels transparent.
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let p = 0; p < data.length; p += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    if (r > 240 && g > 240 && b > 240) data[p + 3] = 0;
  }

  const outPath = resolve(outDir, "logo.png");
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ width: 1024, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`wrote ${outPath} (${info.width}x${info.height})`);
  break; // only first page
}
