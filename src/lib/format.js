export const peso = n => `₱${Number(n || 0).toLocaleString()}`;
export const ORDER_STATUSES = ['Pending', 'In Preparation', 'Ready for Pickup', 'Completed'];
export const statusClass = s => (s || '').replace(/ /g, '-');
