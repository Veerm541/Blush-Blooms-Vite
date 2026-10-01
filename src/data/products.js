const img = n => `/images/bouquet-${n}.jpg`;

export const PRODUCTS = [
  { id: 'royal-blue', name: 'Royal Blue Elegance', desc: 'Cream roses, pink carnations & gyp', price: 1750, image: img('royal-blue'), category: 'bouquet', tag: 'Best seller' },
  { id: 'orchid-blush', name: 'Orchid Blush Mix', desc: 'Carnations, roses & statice', price: 1650, image: img('orchid-blush'), category: 'seasonal', tag: 'Seasonal' },
  { id: 'lily-rose', name: 'Lily & Rose', desc: 'White roses & stargazer lilies', price: 2350, image: img('lily-rose'), category: 'bouquet', tag: 'New' },
  { id: 'sunshine-red', name: 'Sunshine & Red', desc: 'Red roses & yellow chrysanthemums', price: 1550, image: img('sunshine-red'), category: 'seasonal', tag: 'Weekend drop' },
  { id: 'crimson-roses', name: 'Crimson Romance', desc: "A dozen red roses & baby's breath", price: 2100, image: img('crimson-roses'), category: 'bouquet', tag: 'Customer favorite' },
  { id: 'vase', name: 'Sandstone Vase', desc: 'Hand-finished neutral ceramic', price: 520, image: '', category: 'add-on', tag: 'Add-on' },
  { id: 'card', name: 'Handwritten Note', desc: 'Your message on textured stock', price: 240, image: '', category: 'add-on', tag: 'Add-on' },
  { id: 'petite-posy', name: 'Petite Posy', desc: 'A sweet, desk-friendly bunch for simple surprises.', price: 950, image: img('petite-posy'), category: 'bouquet' },
  { id: 'signature-bouquet', name: 'Signature Bouquet', desc: 'The Blush Blooms balance — abundant, soft, and naturally shaped.', price: 1850, image: img('signature'), category: 'bouquet' },
  { id: 'garden-grande', name: 'Garden Grande', desc: 'A generously gathered statement bouquet for celebrations and milestones.', price: 3250, image: img('garden-grande'), category: 'bouquet' },
];

export const FILTERS = [
  ['all', 'All'], ['bouquet', 'Bouquets'], ['seasonal', 'Seasonal'], ['add-on', 'Add-ons'],
];
