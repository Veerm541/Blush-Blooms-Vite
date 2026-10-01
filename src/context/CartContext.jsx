import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CART_KEY = 'blushBloomsCart'; // same key as the original site
const CartContext = createContext(null);

const load = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const timer = useRef();

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);

  const showToast = useCallback(msg => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  const addToCart = useCallback(product => {
    setItems(cur => cur.some(i => i.id === product.id)
      ? cur.map(i => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      : [...cur, { ...product, qty: 1 }]);
    setOpen(true);
    showToast(`${product.name} added to your cart.`);
  }, [showToast]);

  const changeQty = useCallback((id, delta) => {
    setItems(cur => cur.map(i => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter(i => i.qty > 0));
  }, []);
  const clear = useCallback(() => setItems([]), []);
  const remove = useCallback(id => setItems(cur => cur.filter(i => i.id !== id)), []);

  const value = useMemo(() => ({
    items, open, setOpen, toast, showToast, addToCart, changeQty, remove, clear,
    count: items.reduce((s, i) => s + i.qty, 0),
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
  }), [items, open, toast, showToast, addToCart, changeQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
