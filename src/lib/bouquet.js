// Placeholder limits; update these when the florist confirms the final sizes.
export const FLOWER_LIMITS = { Small: 6, Medium: 12, Large: 18 };
export const flowerCount = items => items.filter(item => item.type === 'Flower').length;
export const fitsBouquet = (items, size) => flowerCount(items) <= FLOWER_LIMITS[size];

export function catalogArtwork(asset, base) {
  if (base && asset.image === base.image) return { ...base, ...asset };
  const width = base?.width || (asset.type === 'Wrapper' ? 380 : 180);
  const height = base?.height || (asset.type === 'Wrapper' ? 500 : 240);
  const safeURL = (asset.image || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const svg = safeURL
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${safeURL}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" /></svg>`
    : base?.svg || `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><ellipse cx="90" cy="70" rx="55" ry="50" fill="#e9a2b5"/><path d="M90 110V230" stroke="#78966b" stroke-width="8"/></svg>`;
  return { ...base, ...asset, width, height, svg, svgBack: base?.svgBack || '', imageBack: base?.imageBack || asset.image, image: asset.image || base?.image || `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
}
