// Convertit un ou plusieurs fichiers image (jpg/png) en webp.
// Usage :
//   node scripts/convert-webp.mjs <src> <dst> [<src> <dst> ...]
//   node scripts/convert-webp.mjs --quality 85 <src> <dst>

import sharp from 'sharp';
import { stat } from 'node:fs/promises';

const argv = process.argv.slice(2);
let quality = 82;

while (argv[0] === '--quality') {
  argv.shift();
  quality = Number(argv.shift());
}

if (argv.length === 0 || argv.length % 2 !== 0) {
  console.error('Usage: node scripts/convert-webp.mjs [--quality 82] <src> <dst> [<src> <dst> ...]');
  process.exit(1);
}

for (let i = 0; i < argv.length; i += 2) {
  const src = argv[i];
  const dst = argv[i + 1];
  try {
    const srcStat = await stat(src);
    const info = await sharp(src).webp({ quality }).toFile(dst);
    const ratio = ((1 - info.size / srcStat.size) * 100).toFixed(0);
    console.log(`OK  ${src} -> ${dst}  ${(srcStat.size / 1024).toFixed(0)} -> ${(info.size / 1024).toFixed(0)} KB (-${ratio}%)`);
  } catch (e) {
    console.error(`ERR ${src} -> ${dst} : ${e.message}`);
  }
}
