export function invoiceRows(order) {
  return (order.items || []).map((item, index) => {
    const quantity = Number.isFinite(Number(item.qty)) && Number(item.qty) > 0 ? Number(item.qty) : 1;
    const price = Number.isFinite(Number(item.price)) ? Math.max(0, Number(item.price)) : 0;
    return { key: `${item.id || index}-${index}`, name: item.name || 'Bouquet', quantity, price, amount: quantity * price, size: item.size, stems: item.stemList || [], fillerIncluded: item.fillerIncluded };
  });
}
export function invoiceTotals(order) {
  const subtotal = invoiceRows(order).reduce((sum, item) => sum + item.amount, 0);
  const total = order.total != null && order.total !== '' && Number.isFinite(Number(order.total)) ? Number(order.total) : subtotal;
  return { subtotal, total, adjustment: total - subtotal };
}
export const invoiceNumber = order => `INV-${String(order.id).replace(/^BB-/, '')}`;
