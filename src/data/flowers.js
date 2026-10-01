const unsplash = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;
const pexels = id => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&fit=crop&w=400&q=80`;
const withThumb = f => ({ ...f, thumb: f.image.replace('w=400&q=80', 'w=300&q=75') });

export const FLOWERS = [
  { name: 'Lily', price: 220, image: unsplash('photo-1515961746345-93d2d8f7dbf3') },
  { name: 'Gerbera', price: 130, image: pexels(8161635) },
  { name: 'Carnation', price: 110, image: unsplash('photo-1453486943089-fc6976a5d34e') },
  { name: 'Tulip', price: 160, image: unsplash('photo-1551994687-339c3160c47f') },
  { name: 'Rose', price: 180, image: unsplash('photo-1612168829710-1405fc7e0a48') },
  { name: 'Sunflower', price: 150, image: unsplash('photo-1533523611631-15e4ef69be08') },
  { name: 'Chamomile', price: 90, image: pexels(8753608) },
  { name: 'Aster', price: 100, image: pexels(7056624) },
].map(withThumb);
