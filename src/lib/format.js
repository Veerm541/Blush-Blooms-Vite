export const peso = n => `₱${Number(n || 0).toLocaleString()}`;

export const PICKUP_ORDER_STATUSES = ['Pending', 'In Preparation', 'Ready for Pickup', 'Completed'];
export const DELIVERY_ORDER_STATUSES = ['Pending', 'In Preparation', 'Out for Delivery', 'Completed'];
export const ORDER_STATUSES = ['Pending', 'In Preparation', 'Ready for Pickup', 'Out for Delivery', 'Completed'];

export const getFulfillmentMethod = order => {
  if (order?.fulfillment?.method) return order.fulfillment.method;
  if (order?.deliveryAddress || order?.deliveryDate || order?.deliveryTimeSlot) return 'Delivery';
  return 'Pickup';
};

export const getOrderStatuses = order => (
  getFulfillmentMethod(order) === 'Delivery' ? DELIVERY_ORDER_STATUSES : PICKUP_ORDER_STATUSES
);

export const getPaymentMethodLabel = order => {
  const method = order?.payment?.method;
  if (method === 'COD') {
    return getFulfillmentMethod(order) === 'Delivery' ? 'Cash on Delivery' : 'Cash on Pick-Up';
  }
  return method || '—';
};

export const statusClass = s => (s || '').replace(/ /g, '-');
