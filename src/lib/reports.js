export const REPORT_TIMEZONE = 'Asia/Manila';
export const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, month, 1))));

export function orderDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: REPORT_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const part = name => parts.find(p => p.type === name).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function filterOrders(orders, { year, month, from, to }) {
  return orders.filter(order => {
    const day = orderDate(order.createdAt);
    return day && (year === 'all' || day.slice(0, 4) === String(year))
      && (month === 'all' || day.slice(5, 7) === String(month).padStart(2, '0'))
      && (!from || day >= from) && (!to || day <= to);
  });
}

export const salesOrders = orders => orders.filter(o => o.status !== 'Cancelled');
export const orderRevenue = orders => salesOrders(orders).reduce((sum, order) => sum + Number(order.total || 0), 0);

export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
