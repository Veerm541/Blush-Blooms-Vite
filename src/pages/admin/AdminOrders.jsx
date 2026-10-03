import { Fragment, useMemo, useState } from 'react';
import StatusPill from '../../components/StatusPill.jsx';
import useOrders from '../../hooks/useOrders.js';
import {
  ORDER_STATUSES,
  getFulfillmentMethod,
  getOrderStatuses,
  getPaymentMethodLabel,
  peso,
} from '../../lib/format.js';

const formatPickup = order => {
  const value = order.fulfillment?.pickupTime || order.pickupTime;
  return value ? new Date(value).toLocaleString() : '—';
};

const verificationLabel = order => order.payment?.method === 'GCash'
  ? (order.payment?.verification || 'Pending Verification')
  : 'Not required';

export default function AdminOrders() {
  const [orders, setOrders] = useOrders();
  const [statusFilter, setStatusFilter] = useState('All');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState({});

  const list = useMemo(() => [...orders].reverse().filter(o => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [o.id, o.customer?.name, o.customer?.phone, o.customer?.email]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesFulfillment = fulfillmentFilter === 'All' || getFulfillmentMethod(o) === fulfillmentFilter;
    const matchesPayment = paymentFilter === 'All' || getPaymentMethodLabel(o) === paymentFilter;
    return matchesQuery && matchesStatus && matchesFulfillment && matchesPayment;
  }), [orders, query, statusFilter, fulfillmentFilter, paymentFilter]);

  const setStatus = (id, status) => setOrders(all => all.map(o => (o.id === id ? { ...o, status } : o)));
  const setPaymentVerification = (id, verification) => setOrders(all => all.map(o => (
    o.id === id ? { ...o, payment: { ...o.payment, verification } } : o
  )));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="admin-kicker">Order operations</div>
          <h1>Order management</h1>
          <p>Search orders, inspect bouquet specifications, verify GCash proofs, and manage pick-up or delivery fulfillment.</p>
        </div>
      </div>

      <div className="order-filter-panel admin-panel">
        <div className="admin-search-field">
          <label htmlFor="orderSearch">Search orders</label>
          <input id="orderSearch" type="search" placeholder="Order no., customer, phone, or email" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="statusFilter">Status</label>
          <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fulfillmentFilter">Fulfillment</label>
          <select id="fulfillmentFilter" value={fulfillmentFilter} onChange={e => setFulfillmentFilter(e.target.value)}>
            <option value="All">All methods</option>
            <option>Pickup</option>
            <option>Delivery</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="paymentFilter">Payment</label>
          <select id="paymentFilter" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
            <option value="All">All payments</option>
            <option>Cash on Pick-Up</option>
            <option>Cash on Delivery</option>
            <option>GCash</option>
          </select>
        </div>
        <button className="btn btn-outline btn-sm" type="button" onClick={() => { setQuery(''); setStatusFilter('All'); setFulfillmentFilter('All'); setPaymentFilter('All'); }}>Clear filters</button>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Orders</h2>
            <p className="panel-subtitle">Showing {list.length} of {orders.length} order{orders.length === 1 ? '' : 's'}.</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Fulfillment</th>
                <th>Schedule</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!list.length && <tr><td colSpan="8"><div className="admin-empty-state"><strong>No orders match the current filters.</strong><span>Try clearing one or more filters.</span></div></td></tr>}
              {list.map(o => {
                const method = getFulfillmentMethod(o);
                const allowedStatuses = getOrderStatuses(o);
                const stems = o.items
                  .map(i => (i.stemList ? i.stemList.map(s => `${s.name} × ${s.qty}`).join(', ') : `${i.name} × ${i.qty}`))
                  .join(' · ');
                const snapshot = o.items.find(i => i.snapshot)?.snapshot;
                const delivery = o.fulfillment || {};
                const schedule = method === 'Delivery'
                  ? `${delivery.deliveryDate || 'No date'} · ${delivery.deliveryTimeSlot || 'No slot'}`
                  : formatPickup(o);

                return (
                  <Fragment key={o.id}>
                    <tr>
                      <td><strong>{o.id}</strong><div className="text-muted tiny-text">{new Date(o.createdAt).toLocaleDateString()}</div></td>
                      <td>
                        <strong>{o.customer?.name || '—'}</strong>
                        <div className="text-muted tiny-text">{o.customer?.phone || ''}</div>
                      </td>
                      <td><span className="method-pill">{method}</span></td>
                      <td className="schedule-cell">{schedule}</td>
                      <td>
                        {getPaymentMethodLabel(o)}
                        {o.payment?.method === 'GCash' && <div className={`verification-text ${verificationLabel(o).replaceAll(' ', '-').toLowerCase()}`}>{verificationLabel(o)}</div>}
                      </td>
                      <td>{peso(o.total)}</td>
                      <td><StatusPill status={o.status} /></td>
                      <td className="order-action-cell">
                        <button
                          className={`admin-detail-btn ${open[o.id] ? 'is-open' : ''}`}
                          type="button"
                          aria-expanded={Boolean(open[o.id])}
                          onClick={() => setOpen(m => ({ ...m, [o.id]: !m[o.id] }))}
                        >
                          <span className="admin-detail-eye" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                              <circle cx="12" cy="12" r="2.6" />
                            </svg>
                          </span>
                          <span>{open[o.id] ? 'Hide details' : 'View details'}</span>
                          <span className="admin-detail-chevron" aria-hidden="true">⌄</span>
                        </button>
                      </td>
                    </tr>

                    <tr className="row-detail" hidden={!open[o.id]}>
                      <td colSpan="8">
                        <div className="order-detail-shell">
                          <div className="order-detail-section">
                            <div className="detail-section-head"><span>01</span><div><strong>Customer &amp; fulfillment</strong><small>Contact and scheduling information</small></div></div>
                            <dl className="detail-list">
                              <div><dt>Name</dt><dd>{o.customer?.name || '—'}</dd></div>
                              <div><dt>Email</dt><dd>{o.customer?.email || '—'}</dd></div>
                              <div><dt>Phone</dt><dd>{o.customer?.phone || '—'}</dd></div>
                              <div><dt>Method</dt><dd>{method}</dd></div>
                            </dl>
                            {method === 'Delivery' ? (
                              <div className="detail-note">
                                <strong>Delivery address</strong>
                                <p>{delivery.address || '—'}<br />Barangay: {delivery.barangay || '—'}<br />Landmark: {delivery.landmark || '—'}</p>
                                <strong>Preferred schedule</strong>
                                <p>{delivery.deliveryDate || '—'} · {delivery.deliveryTimeSlot || '—'}</p>
                              </div>
                            ) : (
                              <div className="detail-note"><strong>Preferred pick-up</strong><p>{formatPickup(o)}<br />Blush Blooms Ozamiz store</p></div>
                            )}
                          </div>

                          <div className="order-detail-section">
                            <div className="detail-section-head"><span>02</span><div><strong>Payment verification</strong><small>Manual review for GCash proof uploads</small></div></div>
                            <dl className="detail-list">
                              <div><dt>Method</dt><dd>{getPaymentMethodLabel(o)}</dd></div>
                              <div><dt>Verification</dt><dd>{verificationLabel(o)}</dd></div>
                              <div><dt>Order total</dt><dd>{peso(o.total)}</dd></div>
                            </dl>
                            {o.payment?.method === 'GCash' ? (
                              <>
                                {o.payment?.receipt ? <img className="proof-preview" src={o.payment.receipt} alt="GCash receipt" /> : <div className="proof-placeholder">No receipt image available</div>}
                                <div className="detail-actions">
                                  <button className="btn btn-dark btn-sm" type="button" onClick={() => setPaymentVerification(o.id, 'Approved')}>Approve</button>
                                  <button className="btn btn-outline btn-sm" type="button" onClick={() => setPaymentVerification(o.id, 'Rejected')}>Reject</button>
                                </div>
                              </>
                            ) : <div className="detail-note"><p>No manual payment verification is required for this cash order.</p></div>}
                          </div>

                          <div className="order-detail-section wide">
                            <div className="detail-section-head"><span>03</span><div><strong>Bouquet specification</strong><small>Florist reference for preparation</small></div></div>
                            <div className="spec-grid">
                              <div>
                                <strong>Itemized components</strong>
                                <p className="text-muted">{stems || '—'}</p>
                                {o.dedication && <><strong>Dedication card</strong><p className="text-muted">“{o.dedication}”</p></>}
                              </div>
                              <div>
                                {snapshot ? <><strong>Bouquet snapshot</strong><img className="bouquet-preview" src={snapshot} alt="Custom bouquet snapshot" /></> : <div className="proof-placeholder">Pre-made bouquet / no custom snapshot</div>}
                              </div>
                            </div>
                          </div>

                          <div className="order-detail-section wide">
                            <div className="detail-section-head"><span>04</span><div><strong>Fulfillment controls</strong><small>Update order progress and record internal notes</small></div></div>
                            <div className="fulfillment-control-grid">
                              <div className="field">
                                <label htmlFor={`status-${o.id}`}>Order status</label>
                                <select id={`status-${o.id}`} value={o.status} onChange={e => setStatus(o.id, e.target.value)}>
                                  {allowedStatuses.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                              <div className="field wide-field"><label htmlFor={`note-${o.id}`}>Internal note / cancellation reason</label><input id={`note-${o.id}`} type="text" placeholder="Optional staff note (UI placeholder)" /></div>
                              <button className="btn btn-outline btn-sm danger-outline" type="button">Cancel order</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
