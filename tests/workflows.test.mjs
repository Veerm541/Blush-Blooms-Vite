import test from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, filterOrders, orderDate, orderRevenue } from '../src/lib/reports.js';
import { FLOWER_LIMITS, catalogArtwork, fitsBouquet } from '../src/lib/bouquet.js';

const orders = [
  { id: 'july', createdAt: '2026-07-31T15:59:59Z', total: 100, status: 'Completed' },
  { id: 'august', createdAt: '2026-07-31T16:00:00Z', total: 200, status: 'Completed' },
  { id: 'cancelled', createdAt: '2026-08-02T00:00:00Z', total: 900, status: 'Cancelled' },
  { id: 'future', createdAt: '2027-08-02T00:00:00Z', total: 300, status: 'Pending' },
  { id: 'invalid', createdAt: 'bad-date', total: 400 },
];
test('reports filter by Philippine calendar month and specific year', () => {
  assert.equal(orderDate(orders[0].createdAt), '2026-07-31');
  assert.equal(orderDate(orders[1].createdAt), '2026-08-01');
  assert.deepEqual(filterOrders(orders, { year: '2026', month: '8' }).map(o => o.id), ['august', 'cancelled']);
  assert.deepEqual(filterOrders(orders, { year: '2027', month: 'all' }).map(o => o.id), ['future']);
  assert.equal(orderDate('bad-date'), '');
});
test('exact date bounds are inclusive and combine with year/month', () => {
  assert.deepEqual(filterOrders(orders, { year: 'all', month: 'all', from: '2026-08-01', to: '2026-08-01' }).map(o => o.id), ['august']);
  assert.deepEqual(filterOrders(orders, { year: '2027', month: 'all', to: '2026-12-31' }), []);
});
test('cancelled orders are excluded consistently from revenue', () => {
  assert.equal(orderRevenue(filterOrders(orders, { year: '2026', month: '8' })), 200);
});
test('CSV quotes commas/newlines and prevents formula execution', () => {
  assert.equal(csvCell('Rose, "pink"\n'), '"Rose, ""pink""\n"');
  assert.equal(csvCell('=SUM(1,2)'), '"\'=SUM(1,2)"');
  assert.equal(csvCell(' +123'), '"\' +123"');
});
test('all bouquet sizes enforce flower limits while excluding wrappers/ribbons', () => {
  for (const [size, limit] of Object.entries(FLOWER_LIMITS)) {
    const bouquet = [{ type: 'Wrapper' }, { type: 'Ribbon' }, ...Array.from({ length: limit }, () => ({ type: 'Flower' }))];
    assert.equal(fitsBouquet(bouquet, size), true);
    assert.equal(fitsBouquet([...bouquet, { type: 'Flower' }], size), false);
  }
});
test('customizer elements are drawn from a design, never from an image, and colours are validated', () => {
  const base = { design: { style: 'rose', petals: '#ef9ba8' }, width: 1, height: 1 };
  const drawn = catalogArtwork({ type: 'Flower', design: { style: 'tulip', petals: '#112233' } }, base);
  assert.match(drawn.svg, /#112233/);
  assert.doesNotMatch(drawn.svg, /<image/);
  const hostile = catalogArtwork({ type: 'Flower', design: { petals: 'red" onload="alert(1)' } }, base);
  assert.doesNotMatch(hostile.svg, /onload/);
  assert.ok(catalogArtwork({ type: 'Wrapper', design: { a: '#2b2b30' } }, {}).svgBack.includes('<svg'));
});
