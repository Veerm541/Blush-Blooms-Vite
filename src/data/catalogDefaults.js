const u = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&q=70`;

export const DEFAULT_PRODUCTS = [
  { id: 'royal-blue', name: 'Royal Blue Elegance', price: 1750, stock: 14, image: '/images/bouquet-royal-blue.jpg' },
  { id: 'orchid-blush', name: 'Orchid Blush Mix', price: 1650, stock: 3, image: '/images/bouquet-orchid-blush.jpg' },
  { id: 'lily-rose', name: 'Lily & Rose', price: 2350, stock: 8, image: '/images/bouquet-lily-rose.jpg' },
  { id: 'sunshine-red', name: 'Sunshine & Red', price: 1550, stock: 0, image: '/images/bouquet-sunshine-red.jpg' },
  { id: 'crimson-romance', name: 'Crimson Romance', price: 2100, stock: 11, image: '/images/bouquet-crimson-roses.jpg' },
  { id: 'petite-posy', name: 'Petite Posy', price: 950, stock: 20, image: '/images/bouquet-petite-posy.jpg' },
  { id: 'signature', name: 'Signature Bouquet', price: 2600, stock: 6, image: '/images/bouquet-signature.jpg' },
  { id: 'garden-grande', name: 'Garden Grande', price: 3100, stock: 4, image: '/images/bouquet-garden-grande.jpg' },
];

export const DEFAULT_ASSETS = [
  { id: 'rose', name: 'Blush Rose', type: 'Flower', price: 180, available: true, image: u('photo-1612168829710-1405fc7e0a48') },
  { id: 'daisy', name: 'White Daisy', type: 'Flower', price: 120, available: true, image: u('photo-1776353014826-8ba28902e655') },
  { id: 'peony', name: 'Peony', type: 'Flower', price: 230, available: true, image: u('photo-1686902741402-dd0036cc973c') },
  { id: 'sunflower', name: 'Sunflower', type: 'Flower', price: 150, available: true, image: u('photo-1533523611631-15e4ef69be08') },
  { id: 'tulip', name: 'Pink Tulip', type: 'Flower', price: 160, available: true, image: u('photo-1551994687-339c3160c47f') },
  { id: 'eucalyptus', name: 'Eucalyptus', type: 'Flower', price: 90, available: true, image: u('photo-1509223197845-458d87318791') },
  { id: 'kraft-wrap', name: 'Kraft Wrap', type: 'Wrapper', price: 60, available: true, image: '' },
  { id: 'satin-ribbon', name: 'Satin Ribbon', type: 'Ribbon', price: 40, available: true, image: '' },
];
