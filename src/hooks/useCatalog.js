import useLocalStorage from './useLocalStorage.js';
import { DEFAULT_PRODUCTS, DEFAULT_ASSETS } from '../data/catalogDefaults.js';

const PRODUCT_ALIASES = { 'crimson-romance': 'crimson-roses', signature: 'signature-bouquet' };
const ASSET_ALIASES = { rose: 'rose-stem', tulip: 'tulip-stem', sunflower: 'sunflower-stem', 'satin-ribbon': 'blush-ribbon' };

export default function useCatalog() {
  const [storedProducts, setStoredProducts] = useLocalStorage('blushBloomsCatalogProducts', DEFAULT_PRODUCTS);
  const [storedAssets, setStoredAssets] = useLocalStorage('blushBloomsCatalogAssets', DEFAULT_ASSETS);
  const products = storedProducts.map(product => {
    const id = PRODUCT_ALIASES[product.id] || product.id;
    return { category: 'bouquet', ...DEFAULT_PRODUCTS.find(p => p.id === id), ...product, id };
  });
  // Retain older catalog edits while exposing the actual artwork used by the builder.
  const overrides = storedAssets.filter(a => ['Flower', 'Wrapper', 'Ribbon'].includes(a.type) && a.id !== 'eucalyptus').map(a => ({ ...a, id: ASSET_ALIASES[a.id] || a.id }));
  const assets = DEFAULT_ASSETS.map(asset => ({ ...asset, ...overrides.find(a => a.id === asset.id) }));
  assets.push(...overrides.filter(a => !DEFAULT_ASSETS.some(base => base.id === a.id)));
  const setProducts = update => setStoredProducts(typeof update === 'function' ? update(products) : update);
  const setAssets = update => setStoredAssets(typeof update === 'function' ? update(assets) : update);
  return { products, setProducts, assets, setAssets };
}
