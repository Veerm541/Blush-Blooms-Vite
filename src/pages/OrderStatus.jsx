import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import A from '../components/A.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { readJSON } from '../hooks/useLocalStorage.js';
import { ORDERS_KEY } from '../hooks/useOrders.js';
import { getFulfillmentMethod, getOrderStatuses, getPaymentMethodLabel, peso } from '../lib/format.js';

const find = id => (id ? readJSON(ORDERS_KEY, []).find(o => o.id === id) || null : null);
const formatPickup = order => {
  const value = order?.fulfillment?.pickupTime || order?.pickupTime;
  return value ? new Date(value).toLocaleString() : '—';
};

export default function OrderStatus() {
  const [params] = useSearchParams();
  const initial = params.get('order') || localStorage.getItem('blushBloomsLastOrder') || '';
  const [input, setInput] = useState(initial);
  const [order, setOrder] = useState(() => find(initial));

  const statuses = order ? getOrderStatuses(order) : [];
  const current = order ? statuses.indexOf(order.status) : -1;
  const snapshot = order?.items.find(i => i.snapshot)?.snapshot;
  const fulfillmentMethod = order ? getFulfillmentMethod(order) : null;
  const fulfillment = order?.fulfillment || {};
  const paymentVerification = order?.payment?.method === 'GCash' ? (order.payment.verification || 'Pending Verification') : 'Not required';
  const schedule = fulfillmentMethod === 'Delivery'
    ? `${fulfillment.deliveryDate || '—'} · ${fulfillment.deliveryTimeSlot || '—'}`
    : formatPickup(order);

  return (
    <>
      <section className="page-hero"><div className="container fade-in"><div className="eyebrow">Track your order</div><h1>Look up your order status anytime.</h1><p>Enter the order reference generated at checkout to view payment, fulfillment, bouquet details, and the current order status.</p></div></section>

      <section className="section"><div className="container">
        <div className="order-lookup form-card fade-in"><div className="field full"><label htmlFor="lookupInput">Order number</label><input id="lookupInput" type="text" placeholder="e.g. BB-10234" value={input} onChange={e => setInput(e.target.value)} /></div><button className="btn btn-dark" id="lookupBtn" onClick={() => setOrder(find(input.trim()))}>Look up order</button></div>

        {order ? (
          <div className="order-detail fade-in visible">
            <div className="order-detail-head"><div><div className="eyebrow">Order {order.id}</div><h2 style={{ margin: '4px 0 0' }}>Order status</h2></div><div className="track-head-right"><strong className="cart-total">{peso(order.total)}</strong><StatusPill status={order.status} /></div></div>

            <div className="tracking-summary-grid">
              <div><span>Fulfillment</span><strong>{fulfillmentMethod}</strong></div>
              <div><span>Schedule</span><strong>{schedule}</strong></div>
              <div><span>Payment</span><strong>{getPaymentMethodLabel(order)}</strong></div>
              <div><span>Payment check</span><strong>{paymentVerification}</strong></div>
            </div>

            <ol className="status-tracker">{statuses.map((s, i) => <li key={s} className={`${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`.trim()}>{s}</li>)}</ol>

            {order.payment?.method === 'GCash' && (
              <div className={`customer-payment-banner ${paymentVerification.replaceAll(' ', '-').toLowerCase()}`}>
                <strong>GCash verification: {paymentVerification}</strong>
                <span>{paymentVerification === 'Approved' ? 'Your uploaded proof has been approved.' : paymentVerification === 'Rejected' ? 'The uploaded proof needs attention. Please contact the shop.' : 'Your uploaded proof is waiting for manual verification by the shop.'}</span>
              </div>
            )}

            <div className="order-grid">
              <div><h3>Order items</h3><div className="drawer-body">{order.items.map(item => <div className="cart-item" key={item.id}>{item.image && <img src={item.image} alt={item.name} />}<div><strong>{item.name}</strong><div className="text-muted">{peso(item.price)} × {item.qty}</div>{item.stemList && <div className="text-muted" style={{ fontSize: '.82rem' }}>{item.stemList.map(s => `${s.name} × ${s.qty}`).join(', ')}</div>}</div><strong>{peso(item.price * item.qty)}</strong></div>)}</div></div>

              <div><h3>{fulfillmentMethod === 'Delivery' ? 'Delivery details' : 'Pick-up details'}</h3>
                {fulfillmentMethod === 'Delivery' ? <p className="text-muted">{order.customer?.name || '—'} · {order.customer?.phone || '—'}<br />Address: {fulfillment.address || '—'}<br />Barangay: {fulfillment.barangay || '—'}<br />Landmark: {fulfillment.landmark || '—'}<br />Preferred delivery date: {fulfillment.deliveryDate || '—'}<br />Preferred delivery time slot: {fulfillment.deliveryTimeSlot || '—'}</p> : <p className="text-muted">{order.customer?.name || '—'} · {order.customer?.phone || '—'}<br />Preferred pick-up: {formatPickup(order)}<br />Pick up at Blush Blooms, Kaamino St. corner Ledesma St., Ozamiz City.</p>}
                {order.dedication && <><h3>Dedication card</h3><p className="text-muted">“{order.dedication}”</p></>}
                <h3>Payment</h3><p className="text-muted">{order.payment?.method === 'GCash' ? 'GCash — proof of payment uploaded for manual verification.' : getPaymentMethodLabel(order)}</p>
                {fulfillmentMethod === 'Delivery' && <p className="schedule-note">The selected delivery slot is a preferred window. Actual arrival time may vary depending on bouquet preparation, order volume, traffic, distance, and address availability.</p>}
              </div>
            </div>

            {snapshot && <div className="tracking-snapshot"><h3>Bouquet snapshot</h3><p className="text-muted">This visual reference is attached to the order for florist preparation.</p><img className="round-img" src={snapshot} alt="Custom bouquet snapshot" /></div>}
          </div>
        ) : <div className="tracking-empty fade-in"><strong>No matching order found yet.</strong><p className="text-muted">Check the reference code or start a new order.</p><div><A className="btn btn-dark" href="/shop">Shop bouquets</A> <A className="btn btn-outline" href="/customize">Build a custom bouquet</A></div></div>}
      </div></section>
    </>
  );
}
