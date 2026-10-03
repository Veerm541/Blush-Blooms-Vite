// Measures the painted bounding box of every customizer drawing and prints the BOX table
// to paste into src/data/customizerAssets.js. Needs `sharp` (dev only):  npm i -D sharp
import sharp from 'sharp';
import { __RAW_ART } from '../src/data/customizerAssets.js';

const SS = 2; // supersample for accuracy
const bboxOf = async svg => {
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 * SS })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  return { x0: x0 / SS, y0: y0 / SS, x1: (x1 + 1) / SS, y1: (y1 + 1) / SS };
};

const PAD = 3;
const out = {};
for (const [id, art] of Object.entries(__RAW_ART())) {
  const layers = typeof art === 'string' ? [art] : [art.back, art.front];
  const boxes = await Promise.all(layers.map(bboxOf));
  const x0 = Math.min(...boxes.map(b => b.x0)) - PAD;
  const y0 = Math.min(...boxes.map(b => b.y0)) - PAD;
  const x1 = Math.max(...boxes.map(b => b.x1)) + PAD;
  const y1 = Math.max(...boxes.map(b => b.y1)) + PAD;
  out[id] = { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - Math.floor(x0)), h: Math.ceil(y1 - Math.floor(y0)) };
}
console.log(JSON.stringify(out, null, 2));
