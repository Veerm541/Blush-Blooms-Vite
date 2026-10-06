import { buildArtwork } from '../data/customizerAssets.js';

// Placeholder limits; update these when the florist confirms the final sizes.
export const FLOWER_LIMITS = { Small: 6, Medium: 12, Large: 18 };
export const flowerCount = items => items.filter(item => item.type === 'Flower').length;
export const fitsBouquet = (items, size) => flowerCount(items) <= FLOWER_LIMITS[size];

// Customizer elements are always drawn from their design (style + colours) — never from a picture.
// Older saved catalog entries that only had an image fall back to the base drawing.
export function catalogArtwork(asset, base) {
  const design = asset.design || base?.design;
  if (!design || !['Flower', 'Wrapper', 'Ribbon'].includes(asset.type)) return { ...base, ...asset };
  return { ...base, ...asset, design, ...buildArtwork(asset.type, design) };
}
