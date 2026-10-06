import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOUQUET_SIZES, canAddFlowers, flowerCount, bouquetCounts, fitElement, bounds, moveGroup, renderLayers } from '../src/lib/customizerModel.js';
import { invoiceNumber, invoiceRows, invoiceTotals } from '../src/lib/invoice.js';

const flower = (uid, cx = 360, cy = 400, rotation = 0) => ({ uid, id: 'rose', name: 'Rose', type: 'Flower', price: 180, w: 100, h: 200, scale: 1, rotation, cx, cy });

for (const [size, limit] of Object.entries({ Small: 6, Medium: 12, Large: 18 })) {
  test(`${size} limits add and mixed paste batches to ${limit} flowers`, () => {
    assert.equal(BOUQUET_SIZES[size].limit, limit);
    const stems = Array.from({ length: limit - 1 }, (_, i) => flower(String(i)));
    assert(canAddFlowers(stems, [flower('new'), { type: 'Filler' }], size));
    assert(!canAddFlowers([...stems, flower('last')], [flower('extra')], size));
    assert(!canAddFlowers(stems, [flower('a'), flower('b')], size));
  });
}

test('Only flowers consume capacity while all chosen parts retain itemized prices', () => {
  const parts = [flower('a'), flower('b'), { id: 'wrap', name: 'Wrap', type: 'Wrapper', price: 70 }, { id: 'filler', name: 'Filler', type: 'Filler', price: 80 }, { id: 'bow', name: 'Bow', type: 'Ribbon', price: 40 }];
  assert.equal(flowerCount(parts), 2);
  assert.equal(bouquetCounts(parts)[0].qty, 2);
  assert.equal(bouquetCounts(parts).reduce((sum, part) => sum + part.total, 0), 550);
});

test('Rotated/resized parts stay within the artboard', () => {
  for (const rotation of [-180, -135, -90, -45, 0, 45, 90, 135, 180]) {
    for (const scale of [.1, 1, 4, 100]) {
      const item = fitElement({ ...flower('a', -1000, 2000, rotation), scale });
      const box = bounds(item);
      assert(box.left >= 15.999 && box.top >= 15.999 && box.right <= 704.001 && box.bottom <= 784.001);
    }
  }
});

test('Moving a group preserves relative spacing and leaves unselected parts untouched', () => {
  const parts = [flower('a', 150, 250), flower('b', 550, 550, 35), flower('untouched')];
  const moved = moveGroup(parts, ['a', 'b'], 9999, -9999);
  assert.equal(moved[1].cx - moved[0].cx, 400);
  assert.equal(moved[1].cy - moved[0].cy, 300);
  assert.equal(moved[2], parts[2]);
  for (const item of moved.slice(0, 2)) {
    const box = bounds(item);
    assert(box.left >= 15.99 && box.top >= 15.99 && box.right <= 704.01 && box.bottom <= 784.01);
  }
});

test('Wrapper back and front remain on the correct sides of the flowers', () => {
  const layers = renderLayers([{ uid: 'wrap', type: 'Wrapper' }, flower('rose'), { uid: 'fill', type: 'Filler' }, { uid: 'bow', type: 'Ribbon' }]);
  assert.deepEqual(layers.map(layer => layer.key), ['wrap-back', 'fill', 'rose', 'wrap-front', 'bow']);
});

test('Invoice totals respect quantities, missing totals, saved charges and zero totals', () => {
  const order = { id: 'BB-12345', items: [{ name: 'Custom Bouquet', qty: 2, price: 500 }, { name: 'Rose', qty: 1, price: 180 }], total: 1180 };
  assert.equal(invoiceNumber(order), 'INV-12345');
  assert.deepEqual(invoiceTotals(order), { subtotal: 1180, total: 1180, adjustment: 0 });
  assert.equal(invoiceTotals({ ...order, total: undefined }).total, 1180);
  assert.equal(invoiceTotals({ ...order, total: null }).total, 1180);
  assert.equal(invoiceTotals({ ...order, total: 0 }).total, 0);
  assert.equal(invoiceTotals({ ...order, total: 1280 }).adjustment, 100);
  assert.equal(invoiceRows({ items: [{ price: Infinity, qty: Infinity }] })[0].amount, 0);
});
