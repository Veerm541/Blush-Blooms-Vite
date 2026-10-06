// Every generator below returns a raw <svg> string. `fit()` crops each one to its real
// artwork (see BOX), so the on-canvas box hugs the picture the way it does in Canva —
// no invisible padding to drag around.
const svgData = svg => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const flowerSvg = ({ petals = '#ef9da9', center = '#8b5d45', stem = '#65845f', style = 'rose' }) => {
  const commonStart = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="260" viewBox="0 0 180 260">`;
  const stemMarkup = `<path d="M90 238 C88 190 94 150 90 112" fill="none" stroke="${stem}" stroke-width="8" stroke-linecap="round"/>
    <path d="M91 176 C65 160 49 162 37 176 C58 184 75 185 91 176Z" fill="#789a70"/>
    <path d="M91 198 C115 178 132 178 145 190 C126 202 108 204 91 198Z" fill="#6f9068"/>`;

  let bloom = '';
  if (style === 'tulip') {
    bloom = `<path d="M48 94 C46 49 63 28 82 51 C90 18 105 18 111 52 C132 27 145 50 136 93 C123 120 106 130 90 130 C72 130 57 118 48 94Z" fill="${petals}"/>
      <path d="M58 84 C76 102 102 106 128 84" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="5"/>`;
  } else if (style === 'sunflower') {
    const petalsMarkup = Array.from({ length: 16 }, (_, i) => {
      const a = i * 22.5;
      return `<ellipse cx="90" cy="44" rx="12" ry="34" fill="${petals}" transform="rotate(${a} 90 86)"/>`;
    }).join('');
    bloom = `${petalsMarkup}<circle cx="90" cy="86" r="34" fill="${center}"/><circle cx="90" cy="86" r="24" fill="#62402f"/><circle cx="82" cy="78" r="3" fill="#d9b77a"/><circle cx="101" cy="88" r="3" fill="#d9b77a"/><circle cx="91" cy="101" r="3" fill="#d9b77a"/>`;
  } else if (style === 'lily') {
    const lilyPetals = [0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="90" cy="48" rx="17" ry="43" fill="${petals}" transform="rotate(${a} 90 88)"/>`).join('');
    bloom = `${lilyPetals}<circle cx="90" cy="88" r="18" fill="#f5d07e"/><path d="M90 86 L76 54 M90 86 L106 54 M90 86 L90 49" stroke="#8d7045" stroke-width="3"/><circle cx="76" cy="54" r="4" fill="#8d7045"/><circle cx="106" cy="54" r="4" fill="#8d7045"/><circle cx="90" cy="49" r="4" fill="#8d7045"/>`;
  } else if (style === 'gerbera') {
    const petalsMarkup = Array.from({ length: 18 }, (_, i) => {
      const a = i * 20;
      return `<ellipse cx="90" cy="45" rx="9" ry="31" fill="${petals}" transform="rotate(${a} 90 84)"/>`;
    }).join('');
    bloom = `${petalsMarkup}<circle cx="90" cy="84" r="24" fill="${center}"/><circle cx="90" cy="84" r="11" fill="#d8b26b"/>`;
  } else if (style === 'carnation') {
    const circles = [
      [90, 70, 33], [65, 83, 26], [115, 83, 26], [74, 58, 24], [106, 58, 24],
      [90, 96, 28], [54, 68, 18], [126, 68, 18]
    ].map(([cx, cy, r], idx) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${idx % 2 ? petals : '#f5bcc4'}"/>`).join('');
    bloom = `${circles}<circle cx="90" cy="78" r="13" fill="#e98595"/>`;
  } else {
    bloom = `<g>
      <ellipse cx="90" cy="50" rx="26" ry="43" fill="${petals}"/>
      <ellipse cx="90" cy="50" rx="26" ry="43" fill="#f4b0b9" transform="rotate(72 90 86)"/>
      <ellipse cx="90" cy="50" rx="26" ry="43" fill="${petals}" transform="rotate(144 90 86)"/>
      <ellipse cx="90" cy="50" rx="26" ry="43" fill="#f2a8b3" transform="rotate(216 90 86)"/>
      <ellipse cx="90" cy="50" rx="26" ry="43" fill="${petals}" transform="rotate(288 90 86)"/>
      <circle cx="90" cy="86" r="28" fill="#dc7e8e"/>
      <path d="M75 91 C83 68 104 67 111 89 C102 100 86 103 75 91Z" fill="#f7c0c7"/>
    </g>`;
  }

  return `${commonStart}${stemMarkup}${bloom}</svg>`;
};

const fillerSvg = ({ bloom = '#fff8ef', center = '#d8b56a', branch = '#7d9b72', style = 'baby' }) => {
  let markup = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="260" viewBox="0 0 180 260">
    <path d="M90 240 C90 185 87 148 91 102" fill="none" stroke="${branch}" stroke-width="6" stroke-linecap="round"/>
    <path d="M91 168 L54 125 M91 148 L128 108 M91 190 L138 150 M90 210 L48 166" fill="none" stroke="${branch}" stroke-width="4" stroke-linecap="round"/>`;
  const flowers = style === 'chamomile'
    ? [[54,125],[128,108],[138,150],[48,166],[90,96],[72,113],[109,126]]
    : [[54,125],[128,108],[138,150],[48,166],[90,96],[72,113],[109,126],[39,149],[148,128],[67,146]];
  flowers.forEach(([cx, cy], i) => {
    if (style === 'chamomile') {
      markup += [0,45,90,135].map(a => `<ellipse cx="${cx}" cy="${cy-9}" rx="5" ry="10" fill="${bloom}" transform="rotate(${a} ${cx} ${cy})"/>`).join('');
      markup += `<circle cx="${cx}" cy="${cy}" r="5" fill="${center}"/>`;
    } else {
      markup += `<circle cx="${cx}" cy="${cy}" r="${i % 3 === 0 ? 8 : 6}" fill="${bloom}" stroke="#eadfd5" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="2.5" fill="${center}"/>`;
    }
  });
  markup += `</svg>`;
  return markup;
};

const greenerySvg = ({ leaf = '#6d9170', stem = '#607c61', style = 'eucalyptus' }) => {
  let markup = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="260" viewBox="0 0 180 260"><path d="M88 242 C94 190 91 134 100 62" fill="none" stroke="${stem}" stroke-width="6" stroke-linecap="round"/>`;
  const leaves = style === 'fern'
    ? [[87,210,-30],[99,196,30],[88,177,-34],[101,162,34],[91,143,-32],[104,128,32],[94,108,-28],[107,92,28],[98,74,-20]]
    : [[86,214,-35],[101,196,35],[88,176,-38],[104,158,38],[91,138,-34],[108,121,34],[94,101,-28],[111,85,28],[99,68,-18]];
  leaves.forEach(([cx, cy, rot], i) => {
    if (style === 'fern') markup += `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="25" fill="${i%2?leaf:'#7ca17d'}" transform="rotate(${rot} ${cx} ${cy})"/>`;
    else markup += `<ellipse cx="${cx}" cy="${cy}" rx="16" ry="12" fill="${i%2?leaf:'#7ca17d'}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  });
  markup += `</svg>`;
  return markup;
};


/* ------------------------------------------------------------------ *
 * Wrappers — modelled on the real wraps in the Blush Blooms shop photos:
 * a wide fan of pointed, layered paper sheets (BACK) that sits behind the
 * flowers, plus the gathered front fold and trailing tails (FRONT) that
 * sit in front of the stems, so stems visibly go *into* the wrap.
 * Both layers share one viewBox so they line up exactly.
 * ------------------------------------------------------------------ */
const WRAP_VIEWBOX = { w: 520, h: 410 };
const NECK = { x: 260, y: 272 };

const wrapperLayers = ({ a, b, edge, sheer = '#ffffff' }) => {
  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${WRAP_VIEWBOX.w}" height="${WRAP_VIEWBOX.h}" viewBox="0 0 ${WRAP_VIEWBOX.w} ${WRAP_VIEWBOX.h}">`;
  const stroke = `stroke="${edge}" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round"`;

  // Three nested, flared sheets with softly scalloped rims — like the layered paper
  // wraps in the shop photos. Drawn big-to-small so each inner sheet overlaps the one behind.
  const fan = (k, fill, opacity = 1) => {
    const X = [-205, -137, -68, 0, 68, 137, 205];
    const rimY = x => NECK.y - 150 * k - 84 * k * (1 - (x / 205) ** 2);
    const pts = X.map(x => [NECK.x + x * k, rimY(x)]);
    let rim = `L ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      rim += ` Q ${(x0 + x1) / 2} ${Math.min(y0, y1) - 20 * k} ${x1} ${y1}`;
    }
    const [lx, ly] = pts[0];
    const [rx, ry] = pts[pts.length - 1];
    const d = `M ${NECK.x} ${NECK.y} C ${NECK.x - 60 * k} ${NECK.y - 28 * k}, ${lx + 36 * k} ${ly + 70 * k}, ${lx} ${ly} ${rim.slice(rim.indexOf('Q'))} C ${rx - 36 * k} ${ry + 70 * k}, ${NECK.x + 60 * k} ${NECK.y - 28 * k}, ${NECK.x} ${NECK.y} Z`;
    const folds = [-150, -100, -50, 0, 50, 100, 150].map((x, i) => `<path d="M ${NECK.x} ${NECK.y - 10} L ${NECK.x + x * k} ${rimY(x) + 14}" stroke="${i % 2 ? '#fff' : edge}" stroke-opacity="${i % 2 ? 0.3 : 0.16}" stroke-width="${i % 2 ? 3 : 2}" stroke-linecap="round"/>`).join('');
    return `<path d="${d}" fill="${fill}" fill-opacity="${opacity}" ${stroke}/>${folds}`;
  };
  const mix = (hex, amount) => {
    const n = parseInt(hex.slice(1), 16);
    const ch = shift => Math.round(((n >> shift) & 255) * (1 - amount) + 255 * amount);
    return `#${[16, 8, 0].map(shift => ch(shift).toString(16).padStart(2, '0')).join('')}`;
  };
  const sheets = fan(1, a) + fan(0.84, b) + fan(0.62, mix(b, 0.5), 0.96);

  const back = `${open}${sheets}</svg>`;

  const nx = NECK.x;
  const ny = NECK.y;
  const front = `${open}
    <path d="M${nx} ${ny + 4} C ${nx - 26} ${ny + 30}, ${nx - 42} ${ny + 62}, ${nx - 50} ${ny + 96} C ${nx - 12} ${ny + 92}, ${nx + 22} ${ny + 70}, ${nx + 34} ${ny + 38} Z" fill="${sheer}" fill-opacity=".62" stroke="${sheer}" stroke-opacity=".8" stroke-width="1.4"/>
    <path d="M${nx} ${ny + 2} C ${nx - 28} ${ny + 22}, ${nx - 62} ${ny + 50}, ${nx - 92} ${ny + 88} C ${nx - 50} ${ny + 86}, ${nx - 12} ${ny + 62}, ${nx + 4} ${ny + 26} Z" fill="${b}" ${stroke}/>
    <path d="M${nx} ${ny + 2} C ${nx + 28} ${ny + 22}, ${nx + 62} ${ny + 50}, ${nx + 92} ${ny + 88} C ${nx + 50} ${ny + 86}, ${nx + 12} ${ny + 62}, ${nx - 4} ${ny + 26} Z" fill="${a}" ${stroke}/>
    <path d="M${nx} ${ny} C ${nx + 44} ${ny - 18}, ${nx + 84} ${ny - 52}, ${nx + 104} ${ny - 96} C ${nx + 62} ${ny - 90}, ${nx + 26} ${ny - 74}, ${nx - 16} ${ny - 54} Z" fill="${b}" ${stroke}/>
    <path d="M${nx} ${ny} C ${nx - 44} ${ny - 18}, ${nx - 84} ${ny - 52}, ${nx - 104} ${ny - 96} C ${nx - 62} ${ny - 90}, ${nx - 26} ${ny - 74}, ${nx + 16} ${ny - 54} Z" fill="${a}" ${stroke}/>
    <path d="M${nx - 6} ${ny - 6} L${nx - 56} ${ny - 62}" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/>
    <path d="M${nx + 6} ${ny - 6} L${nx + 56} ${ny - 62}" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/>
    <path d="M${nx - 22} ${ny - 14} C ${nx - 10} ${ny + 2}, ${nx + 10} ${ny + 2}, ${nx + 22} ${ny - 14}" fill="none" stroke="${edge}" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M${nx - 15} ${ny - 4} C ${nx - 6} ${ny + 8}, ${nx + 6} ${ny + 8}, ${nx + 15} ${ny - 4}" fill="none" stroke="${edge}" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  return { back, front };
};

const ribbonSvg = ({ color = '#c96f7f', shade = '#8f4052', style = 'bow' }) => {
  const base = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="150" viewBox="0 0 220 150">`;
  const bow = style === 'long'
    ? `<path d="M103 71 C62 36 34 39 29 66 C28 91 60 94 102 78Z" fill="${color}"/><path d="M117 71 C158 36 186 39 191 66 C192 91 160 94 118 78Z" fill="${color}"/><circle cx="110" cy="75" r="17" fill="${shade}"/><path d="M99 87 L70 144 L106 124 L112 91Z" fill="${shade}"/><path d="M121 87 L150 144 L114 124 L108 91Z" fill="${color}"/>`
    : `<path d="M101 72 C66 38 36 39 32 65 C30 87 61 95 102 79Z" fill="${color}"/><path d="M119 72 C154 38 184 39 188 65 C190 87 159 95 118 79Z" fill="${color}"/><circle cx="110" cy="75" r="18" fill="${shade}"/><path d="M101 90 L83 139 L109 121 L112 92Z" fill="${color}"/><path d="M119 90 L137 139 L111 121 L108 92Z" fill="${shade}"/>`;
  return `${base}${bow}</svg>`;
};


/* ------------------------------------------------------------------ *
 * Tight crop boxes (x, y, w, h in each drawing's own units), measured from the
 * painted pixels. Regenerate with `node scripts/measure-assets.mjs` whenever a
 * drawing changes, then paste the output here.
 * ------------------------------------------------------------------ */
const BOX = {
  "pink-wrap": {
    "x": 51,
    "y": 26,
    "w": 418,
    "h": 346
  },
  "blue-wrap": {
    "x": 51,
    "y": 26,
    "w": 418,
    "h": 346
  },
  "black-wrap": {
    "x": 51,
    "y": 26,
    "w": 418,
    "h": 346
  },
  "kraft-wrap": {
    "x": 51,
    "y": 26,
    "w": 418,
    "h": 346
  },
  "rose-stem": {
    "x": 11,
    "y": 4,
    "w": 158,
    "h": 241
  },
  "tulip-stem": {
    "x": 34,
    "y": 23,
    "w": 114,
    "h": 222
  },
  "sunflower-stem": {
    "x": 11,
    "y": 7,
    "w": 158,
    "h": 238
  },
  "lily-stem": {
    "x": 14,
    "y": 2,
    "w": 152,
    "h": 243
  },
  "carnation-stem": {
    "x": 33,
    "y": 31,
    "w": 115,
    "h": 214
  },
  "gerbera-stem": {
    "x": 18,
    "y": 11,
    "w": 144,
    "h": 234
  },
  "baby-breath": {
    "x": 29,
    "y": 86,
    "w": 129,
    "h": 160
  },
  "chamomile": {
    "x": 40,
    "y": 74,
    "w": 120,
    "h": 172
  },
  "eucalyptus": {
    "x": 68,
    "y": 52,
    "w": 62,
    "h": 196
  },
  "fern": {
    "x": 69,
    "y": 47,
    "w": 56,
    "h": 201
  },
  "blush-ribbon": {
    "x": 28,
    "y": 42,
    "w": 164,
    "h": 100
  },
  "cream-ribbon": {
    "x": 26,
    "y": 42,
    "w": 168,
    "h": 105
  },
  "wine-ribbon": {
    "x": 28,
    "y": 42,
    "w": 164,
    "h": 100
  }
}
;

const fit = (svg, id) => {
  const box = BOX[id];
  if (!box) return svg;
  return svg.replace(/width="\d+" height="\d+" viewBox="[^"]+"/, `width="${box.w}" height="${box.h}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}"`);
};

const SCALE = { Flower: 0.68, Filler: 0.68, Greenery: 0.68, Wrapper: 0.85, Ribbon: 0.7 };

const make = (def, svg, extra = {}) => {
  const box = BOX[def.id] || { w: 180, h: 260 };
  const k = SCALE[def.type];
  return {
    ...def,
    image: svgData(fit(svg, def.id)),
    svg: fit(svg, def.id),
    width: Math.round(box.w * k),
    height: Math.round(box.h * k),
    ...extra,
  };
};

const flower = (def, opts) => make({ type: 'Flower', design: { style: 'rose', petals: '#ef9da9', center: '#8b5d45', stem: '#65845f', ...opts }, ...def }, flowerSvg(opts));
const filler = (def, opts) => make({ type: 'Filler', ...def }, fillerSvg(opts));
const greenery = (def, opts) => make({ type: 'Greenery', ...def }, greenerySvg(opts));
const ribbon = (def, opts) => make({ type: 'Ribbon', design: { style: 'bow', color: '#c96f7f', shade: '#8f4052', ...opts }, ...def }, ribbonSvg(opts));
const wrapper = (def, colors) => {
  const { back, front } = wrapperLayers(colors);
  return make({ type: 'Wrapper', design: { ...colors }, ...def }, front, { imageBack: svgData(fit(back, def.id)), svgBack: fit(back, def.id) });
};


/* ------------------------------------------------------------------ *
 * Designable elements. Flowers, wrappers and ribbons are DRAWN from a small
 * design (style + colours) — the admin never uploads a picture for them.
 * ------------------------------------------------------------------ */
export const FLOWER_STYLES = [
  { id: 'rose', label: 'Rose', center: false },
  { id: 'tulip', label: 'Tulip', center: false },
  { id: 'sunflower', label: 'Sunflower', center: true },
  { id: 'lily', label: 'Lily', center: false },
  { id: 'carnation', label: 'Carnation', center: false },
  { id: 'gerbera', label: 'Gerbera', center: true },
];
export const RIBBON_STYLES = [{ id: 'bow', label: 'Bow' }, { id: 'long', label: 'Long tails' }];
export const DEFAULT_DESIGNS = {
  Flower: { style: 'rose', petals: '#ef9ba8', center: '#8b5d45', stem: '#65845f' },
  Ribbon: { style: 'bow', color: '#e99aa8', shade: '#b85f72' },
  Wrapper: { a: '#e8689f', b: '#f6b3d0', edge: '#b83a78' },
};
const STYLE_BOX = { rose: 'rose-stem', tulip: 'tulip-stem', sunflower: 'sunflower-stem', lily: 'lily-stem', carnation: 'carnation-stem', gerbera: 'gerbera-stem' };
const RIBBON_BOX = { bow: 'blush-ribbon', long: 'cream-ribbon' };
const HEX = /^#[0-9a-f]{6}$/i;

// Lightens (toward #ffffff) or darkens (toward #000000) a #rrggbb colour.
export const mixHex = (hex, toward, amount) => {
  const from = parseInt((HEX.test(hex) ? hex : '#888888').slice(1), 16);
  const to = toward === 'white' ? 255 : 0;
  const ch = shift => Math.round(((from >> shift) & 255) * (1 - amount) + to * amount);
  return `#${[16, 8, 0].map(shift => ch(shift).toString(16).padStart(2, '0')).join('')}`;
};

const art = (type, boxId, svg) => {
  const box = BOX[boxId] || { w: 180, h: 260 };
  const fitted = fit(svg, boxId);
  return { svg: fitted, image: svgData(fitted), width: Math.round(box.w * SCALE[type]), height: Math.round(box.h * SCALE[type]) };
};

export function buildArtwork(type, design = {}) {
  const base = DEFAULT_DESIGNS[type] || DEFAULT_DESIGNS.Flower;
  const d = { ...base };
  Object.keys(base).forEach(key => {
    const value = design?.[key];
    if (key === 'style') d.style = typeof value === 'string' && /^[a-z]+$/.test(value) ? value : base.style;
    else d[key] = HEX.test(value) ? value : base[key];      // colours are validated before they touch the SVG markup
  });
  if (type === 'Wrapper') {
    const { back, front } = wrapperLayers(d);
    const backFit = fit(back, 'pink-wrap');
    return { ...art('Wrapper', 'pink-wrap', front), svgBack: backFit, imageBack: svgData(backFit) };
  }
  if (type === 'Ribbon') return art('Ribbon', RIBBON_BOX[d.style] || 'blush-ribbon', ribbonSvg({ color: d.color, shade: d.shade, style: d.style }));
  return art('Flower', STYLE_BOX[d.style] || 'rose-stem', flowerSvg({ petals: d.petals, center: d.center, stem: d.stem, style: d.style }));
}

// Wrapper colours follow the real wraps sold in the shop (pink, royal blue, black & grey, kraft & cream).
const WRAPPERS = [
  { def: { id: 'pink-wrap', name: 'Pink Layered Wrap', price: 70 }, colors: { a: '#e8689f', b: '#f6b3d0', edge: '#b83a78' } },
  { def: { id: 'blue-wrap', name: 'Royal Blue Wrap', price: 70 }, colors: { a: '#1f3fae', b: '#7b95dd', edge: '#142a7c' } },
  { def: { id: 'black-wrap', name: 'Black & Grey Wrap', price: 80 }, colors: { a: '#2b2b30', b: '#9a9ca6', edge: '#0f0f12' } },
  { def: { id: 'kraft-wrap', name: 'Kraft & Cream Wrap', price: 60 }, colors: { a: '#cfa57a', b: '#f3e6d1', edge: '#9c7650' } },
];

// Wrappers come first: in the shop the wrap is chosen before the flowers go into it.
export const CUSTOMIZER_PALETTES = {
  Wrapper: WRAPPERS.map(({ def, colors }) => wrapper(def, colors)),
  Flower: [
    flower({ id: 'rose-stem', name: 'Blush Rose', price: 180 }, { petals: '#ef9ba8', style: 'rose' }),
    flower({ id: 'tulip-stem', name: 'Pink Tulip', price: 160 }, { petals: '#f39aae', style: 'tulip' }),
    flower({ id: 'sunflower-stem', name: 'Sunflower', price: 150 }, { petals: '#f5c342', center: '#6d4631', style: 'sunflower' }),
    flower({ id: 'lily-stem', name: 'White Lily', price: 220 }, { petals: '#fff7ef', style: 'lily' }),
    flower({ id: 'carnation-stem', name: 'Carnation', price: 110 }, { petals: '#f0a7b1', style: 'carnation' }),
    flower({ id: 'gerbera-stem', name: 'Gerbera', price: 130 }, { petals: '#ec8299', center: '#7e553e', style: 'gerbera' }),
  ],
  Filler: [
    filler({ id: 'baby-breath', name: "Baby's Breath", price: 80 }, { style: 'baby' }),
    filler({ id: 'chamomile', name: 'Chamomile Filler', price: 90 }, { style: 'chamomile', bloom: '#fffef8' }),
  ],
  Greenery: [
    greenery({ id: 'eucalyptus', name: 'Eucalyptus', price: 90 }, { style: 'eucalyptus' }),
    greenery({ id: 'fern', name: 'Fern Leaf', price: 75 }, { style: 'fern', leaf: '#668b61' }),
  ],
  Ribbon: [
    ribbon({ id: 'blush-ribbon', name: 'Blush Satin Bow', price: 40 }, { color: '#e99aa8', shade: '#b85f72', style: 'bow' }),
    ribbon({ id: 'cream-ribbon', name: 'Cream Ribbon', price: 45 }, { color: '#e6d1aa', shade: '#b89a6b', style: 'long' }),
    ribbon({ id: 'wine-ribbon', name: 'Wine Velvet Bow', price: 50 }, { color: '#8f4052', shade: '#602838', style: 'bow' }),
  ],
};

// Raw drawings, used only by scripts/measure-assets.mjs to measure the crop boxes.
export const __RAW_ART = () => {
  const out = {};
  WRAPPERS.forEach(({ def, colors }) => { out[def.id] = wrapperLayers(colors); });
  Object.assign(out, {
    'rose-stem': flowerSvg({ petals: '#ef9ba8', style: 'rose' }),
    'tulip-stem': flowerSvg({ petals: '#f39aae', style: 'tulip' }),
    'sunflower-stem': flowerSvg({ petals: '#f5c342', center: '#6d4631', style: 'sunflower' }),
    'lily-stem': flowerSvg({ petals: '#fff7ef', style: 'lily' }),
    'carnation-stem': flowerSvg({ petals: '#f0a7b1', style: 'carnation' }),
    'gerbera-stem': flowerSvg({ petals: '#ec8299', center: '#7e553e', style: 'gerbera' }),
    'baby-breath': fillerSvg({ style: 'baby' }),
    chamomile: fillerSvg({ style: 'chamomile', bloom: '#fffef8' }),
    eucalyptus: greenerySvg({ style: 'eucalyptus' }),
    fern: greenerySvg({ style: 'fern', leaf: '#668b61' }),
    'blush-ribbon': ribbonSvg({ color: '#e99aa8', shade: '#b85f72', style: 'bow' }),
    'cream-ribbon': ribbonSvg({ color: '#e6d1aa', shade: '#b89a6b', style: 'long' }),
    'wine-ribbon': ribbonSvg({ color: '#8f4052', shade: '#602838', style: 'bow' }),
  });
  return out;
};

export const DEFAULT_WRAPPER = CUSTOMIZER_PALETTES.Wrapper[0];
