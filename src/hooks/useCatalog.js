import useLocalStorage from './useLocalStorage.js';
import { DEFAULT_PRODUCTS, DEFAULT_ASSETS } from '../data/catalogDefaults.js';

export default function useCatalog() {
  const [products, setProducts] = useLocalStorage('blushBloomsCatalogProducts', DEFAULT_PRODUCTS);
  const [assets, setAssets] = useLocalStorage('blushBloomsCatalogAssets', DEFAULT_ASSETS);
  return { products, setProducts, assets, setAssets };
}
