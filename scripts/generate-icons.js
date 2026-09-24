// Generates favicon/PWA icons from the heroicons BoltIcon path. Run: npm run generate:icons
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BRAND = '#e44735';
const BOLT_PATH = 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z'; // @heroicons/react/24/outline BoltIcon
const OUT = path.join(__dirname, '..', 'public');

// Bolt (24x24 grid, centered on 12,12) scaled by `scale` about the canvas center.
function svg({ size = 512, scale = 1, radius = 0, bg = BRAND }) {
  const k = (size / 24) * scale;
  const t = size / 2 - 12 * k;
  const rect = bg ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rect}<g transform="translate(${t} ${t}) scale(${k})" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${BOLT_PATH}"/></g></svg>`;
}

const png = (opts, size) => sharp(Buffer.from(svg({ ...opts, size })), { density: 300 }).resize(size, size).png().toBuffer();
const write = (name, data) => fs.writeFileSync(path.join(OUT, name), data);

// Minimal ICO container embedding PNG images.
function ico(entries) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dirs = entries.map(({ size, data }) => {
    const d = Buffer.alloc(16);
    d[0] = size; d[1] = size; d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6);
    d.writeUInt32LE(data.length, 8); d.writeUInt32LE(offset, 12);
    offset += data.length;
    return d;
  });
  return Buffer.concat([head, ...dirs, ...entries.map((e) => e.data)]);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const solid = { scale: 0.62 };
  write('favicon.svg', svg({ size: 32, scale: 0.7, radius: 7 }));
  write('favicon-32x32.png', await png({ scale: 0.7 }, 32));
  write('favicon-16x16.png', await png({ scale: 0.7 }, 16));
  write('favicon.ico', ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png({ scale: 0.7 }, size) })))));
  write('apple-touch-icon.png', await png(solid, 180));
  write('icon-192.png', await png(solid, 192));
  write('icon-512.png', await png(solid, 512));
  write('icon-maskable-512.png', await png({ scale: 0.5 }, 512)); // bolt (~0.5 of canvas) stays inside the central 80% safe zone
  console.log('Icons written to', OUT);
})();
