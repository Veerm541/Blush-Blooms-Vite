import { PRODUCTS } from './products.js';
import { CUSTOMIZER_PALETTES } from './customizerAssets.js';

const STOCK = { 'royal-blue': 14, 'orchid-blush': 3, 'lily-rose': 8, 'sunshine-red': 0, 'crimson-roses': 11, 'petite-posy': 20, 'signature-bouquet': 6, 'garden-grande': 4 };
export const DEFAULT_PRODUCTS = PRODUCTS.map(product => ({ ...product, stock: STOCK[product.id] ?? 20 }));
export const DEFAULT_ASSETS = ['Wrapper', 'Flower', 'Ribbon'].flatMap(type =>
  CUSTOMIZER_PALETTES[type].map(({ id, name, price, design }) => ({ id, name, type, price, design, available: true })));
