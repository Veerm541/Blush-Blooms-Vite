import { buildArtwork } from '../data/customizerAssets.js';

// Draws a customizer element (flower, wrapper, ribbon) as live vector art.
// Pass `art` (an asset that already has svg/svgBack) or a `type` + `design`.
export default function AssetPreview({ art, type, design, size, label }) {
  const drawing = art?.svg ? art : buildArtwork(type, design);
  return (
    <span className="part-art" style={size ? { '--art-size': `${size}px` } : undefined} role="img" aria-label={label || 'Preview'}>
      {drawing.svgBack && <span dangerouslySetInnerHTML={{ __html: drawing.svgBack }} />}
      <span dangerouslySetInnerHTML={{ __html: drawing.svg }} />
    </span>
  );
}
