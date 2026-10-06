// All bouquet positions use one fixed artboard, so resizing a phone/tablet never changes the design.
export const ARTBOARD = { width: 720, height: 800 };
export const BOUQUET_SIZES = {
  Small: { limit: 6, width: 46, height: 58, label: 'Up to 6 flowers' },
  Medium: { limit: 12, width: 64, height: 72, label: 'Up to 12 flowers' },
  Large: { limit: 18, width: 82, height: 84, label: 'Up to 18 flowers' },
};
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const normalizeAngle = degrees => ((degrees + 180) % 360 + 360) % 360 - 180;
export const flowerCount = elements => elements.filter(item => item.type === 'Flower').length;
export const canAddFlowers = (elements, incoming, size) => flowerCount(elements) + flowerCount(incoming) <= BOUQUET_SIZES[size].limit;
export function bounds(item) {
  const angle = item.rotation * Math.PI / 180;
  const width = item.w * item.scale; const height = item.h * item.scale;
  const ex = (Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle))) / 2;
  const ey = (Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle))) / 2;
  return { left: item.cx - ex, right: item.cx + ex, top: item.cy - ey, bottom: item.cy + ey, ex, ey };
}
export function fitElement(item) {
  const angle = item.rotation * Math.PI / 180;
  const width = Math.abs(item.w * Math.cos(angle)) + Math.abs(item.h * Math.sin(angle));
  const height = Math.abs(item.w * Math.sin(angle)) + Math.abs(item.h * Math.cos(angle));
  const scale = clamp(item.scale, .3, Math.min(3.5, (ARTBOARD.width - 32) / width, (ARTBOARD.height - 32) / height));
  const result = { ...item, scale }; const box = bounds(result);
  return { ...result, cx: clamp(result.cx, box.ex + 16, ARTBOARD.width - box.ex - 16), cy: clamp(result.cy, box.ey + 16, ARTBOARD.height - box.ey - 16) };
}
export function moveGroup(elements, ids, dx, dy) {
  const selected = elements.filter(item => ids.includes(item.uid));
  if (!selected.length) return elements;
  const boxes = selected.map(bounds);
  const x = clamp(dx, 16 - Math.min(...boxes.map(b => b.left)), ARTBOARD.width - 16 - Math.max(...boxes.map(b => b.right)));
  const y = clamp(dy, 16 - Math.min(...boxes.map(b => b.top)), ARTBOARD.height - 16 - Math.max(...boxes.map(b => b.bottom)));
  return elements.map(item => ids.includes(item.uid) ? { ...item, cx: item.cx + x, cy: item.cy + y } : item);
}
export function bouquetCounts(elements) {
  const groups = new Map();
  for (const item of elements) {
    const group = groups.get(item.id) || { id: item.id, name: item.name, type: item.type, qty: 0, total: 0 };
    group.qty += 1; group.total += item.price; groups.set(item.id, group);
  }
  return [...groups.values()];
}
export const layer = item => ({ Wrapper: 0, Filler: 2000, Flower: 3000, Ribbon: 5000 }[item.type] || 0);
export function renderLayers(elements) {
  return elements.flatMap((item, i) => item.type === 'Wrapper'
    ? [{ item, src: item.imageBack, svg: item.svgBack, key: `${item.uid}-back`, z: i }, { item, src: item.image, svg: item.svg, key: `${item.uid}-front`, z: 4000 + i }]
    : [{ item, src: item.image, svg: item.svg, key: String(item.uid), z: layer(item) + i }]).sort((a, b) => a.z - b.z);
}
// Export the same artboard and layer order used on screen; no DOM controls appear in the florist snapshot.
export async function bouquetSnapshot(elements) {
  const canvas = document.createElement('canvas'); canvas.width = ARTBOARD.width; canvas.height = ARTBOARD.height;
  const context = canvas.getContext('2d'); context.fillStyle = '#fffaf7'; context.fillRect(0, 0, canvas.width, canvas.height);
  for (const { item, src } of renderLayers(elements)) {
    const image = await new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
    context.save(); context.translate(item.cx, item.cy); context.rotate(item.rotation * Math.PI / 180);
    if (item.flipped) context.scale(-1, 1);
    context.drawImage(image, -item.w * item.scale / 2, -item.h * item.scale / 2, item.w * item.scale, item.h * item.scale); context.restore();
  }
  return canvas.toDataURL('image/png');
}
