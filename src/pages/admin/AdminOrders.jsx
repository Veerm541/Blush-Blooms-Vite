import { useEffect, useMemo, useState } from 'react';
import useOrders from '../../hooks/useOrders.js';
import OrderInvoice from '../../components/OrderInvoice.jsx';
import {
  ORDER_STATUSES,
  getFulfillmentMethod,
  getOrderStatuses,
  getPaymentMethodLabel,
  peso,
  statusClass,
} from '../../lib/format.js';

const formatPickup = order => {
  const value = order.fulfillment?.pickupTime || order.pickupTime;
  return value ? new Date(value).toLocaleString() : '—';
};

const DELIVERY_SLOTS = ['Morning', 'Afternoon', 'Evening'];
const confirmedLabel = (order, method) => {
  const c = order.confirmedSchedule;
  if (!c) return '';
  return method === 'Delivery' ? `${c.date || '—'} · ${c.slot || '—'}` : (c.time ? new Date(c.time).toLocaleString() : '—');
};

// The customer's date is only a preference. After calling them, staff records the schedule they agreed on here.
function ScheduleConfirm({ order, method, onSave, onClear }) {
  const saved = order.confirmedSchedule;
  const delivery = method === 'Delivery';
  const phone = order.customer?.phone;
  const [date, setDate] = useState(saved?.date || '');
  const [slot, setSlot] = useState(saved?.slot || '');
  const [time, setTime] = useState(saved?.time || '');
  const [note, setNote] = useState(saved?.note || '');
  const [error, setError] = useState('');
  const submit = event => {
    event.preventDefault();
    if (delivery ? !date || !slot : !time) { setError(delivery ? 'Choose a date and a time slot.' : 'Choose a date and time.'); return; }
    setError('');
    onSave({ ...(delivery ? { date, slot } : { time }), note: note.trim(), confirmedAt: new Date().toISOString() });
  };
  return (
    <form className="schedule-confirm" onSubmit={submit}>
      <div className="schedule-confirm-head">
        <div>
          <strong>Confirmed {delivery ? 'delivery' : 'pick-up'} schedule</strong>
          <small>The customer's date above is only a preference. Call them, then record what you agreed on.</small>
        </div>
        {phone && <a className="order-btn order-btn-soft" href={`tel:${phone}`}>Call {phone}</a>}
      </div>
      {saved && <p className="schedule-confirm-saved"><b className="confirmed-tag">Confirmed</b> {confirmedLabel(order, method)}</p>}
      <div className="schedule-confirm-grid">
        {delivery ? (
          <>
            <div className="field"><label htmlFor={`cdate-${order.id}`}>Delivery date</label><input id={`cdate-${order.id}`} type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div className="field"><label htmlFor={`cslot-${order.id}`}>Time slot</label><select id={`cslot-${order.id}`} value={slot} onChange={e => setSlot(e.target.value)}><option value="">Choose a slot</option>{DELIVERY_SLOTS.map(x => <option key={x}>{x}</option>)}</select></div>
          </>
        ) : (
          <div className="field"><label htmlFor={`ctime-${order.id}`}>Pick-up date and time</label><input id={`ctime-${order.id}`} type="datetime-local" value={time} onChange={e => setTime(e.target.value)} /></div>
        )}
        <div className="field wide-field"><label htmlFor={`cnote-${order.id}`}>Call note (optional)</label><input id={`cnote-${order.id}`} type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Called customer, moved to next day" /></div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="detail-actions">
        <button className="btn btn-dark btn-sm" type="submit">Save confirmed schedule</button>
        {saved && <button className="btn btn-outline btn-sm" type="button" onClick={onClear}>Use customer's preferred</button>}
      </div>
    </form>
  );
}

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
  const [invoiceId, setInvoiceId] = useState(null);
  const filtersActive = Boolean(query.trim()) || statusFilter !== 'All' || fulfillmentFilter !== 'All' || paymentFilter !== 'All';
  const invoiceOrder = orders.find(o => o.id === invoiceId) || null;

  useEffect(() => {
    if (!invoiceId) return undefined;
    const onKey = e => { if (e.key === 'Escape') setInvoiceId(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [invoiceId]);

  const list = useMemo(() => [...orders].reverse().filter(o => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [o.id, o.customer?.name, o.customer?.phone, o.customer?.email]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesFulfillment = fulfillmentFilter === 'All' || getFulfillmentMethod(o) === fulfillmentFilter;
    const matchesPayment = paymentFilter === 'All' || getPaymentMethodLabel(o) === paymentFilter;
    return matchesQuery && matchesStatus && matchesFulfillment && matchesPayment;
  }), [orders, query, statusFilter, fulfillmentFilter, paymentFilter]);

  const setConfirmedSchedule = (id, confirmedSchedule) => setOrders(all => all.map(o => (o.id === id ? { ...o, confirmedSchedule } : o)));
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
        <div className="filter-select filter-search">
          <label htmlFor="orderSearch">Search orders</label>
          <div className="order-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
            <input id="orderSearch" type="search" placeholder="Order no., customer, phone, or email" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <div className={`filter-select${statusFilter !== 'All' ? ' is-set' : ''}`}>
          <label htmlFor="statusFilter">Status</label>
          <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All statuses ({orders.length})</option>
            {ORDER_STATUSES.map(st => <option key={st} value={st}>{st} ({orders.filter(o => o.status === st).length})</option>)}
          </select>
        </div>
        <div className={`filter-select${fulfillmentFilter !== 'All' ? ' is-set' : ''}`}>
          <label htmlFor="fulfillmentFilter">Fulfillment</label>
          <select id="fulfillmentFilter" value={fulfillmentFilter} onChange={e => setFulfillmentFilter(e.target.value)}>
            <option value="All">All methods</option>
            <option>Pickup</option>
            <option>Delivery</option>
          </select>
        </div>
        <div className={`filter-select${paymentFilter !== 'All' ? ' is-set' : ''}`}>
          <label htmlFor="paymentFilter">Payment</label>
          <select id="paymentFilter" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
            <option value="All">All payments</option>
            <option>Cash on Pick-Up</option>
            <option>Cash on Delivery</option>
            <option>GCash</option>
          </select>
        </div>
        <button className="filter-clear" type="button" disabled={!filtersActive} onClick={() => { setQuery(''); setStatusFilter('All'); setFulfillmentFilter('All'); setPaymentFilter('All'); }}>Clear filters</button>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Orders</h2>
            <p className="panel-subtitle">Showing {list.length} of {orders.length} order{orders.length === 1 ? '' : 's'}.</p>
          </div>
        </div>
        <div className="order-list">
          <div className="order-list-head" aria-hidden="true"><span>Order &amp; customer</span><span>Fulfillment</span><span>Payment</span><span>Status</span><span /></div>
          {!list.length && <div className="admin-empty-state"><strong>No orders match the current filters.</strong><span>Try clearing one or more filters.</span></div>}
          {list.map(o => {
                const method = getFulfillmentMethod(o);
                const allowedStatuses = getOrderStatuses(o);
                const statusOptions = allowedStatuses.includes(o.status) ? allowedStatuses : [o.status, ...allowedStatuses];
                const stems = o.items
                  .map(i => (i.stemList ? i.stemList.map(s => `${s.name} × ${s.qty}`).join(', ') : `${i.name} × ${i.qty}`))
                  .join(' · ');
                const snapshot = o.items.find(i => i.snapshot)?.snapshot;
                const delivery = o.fulfillment || {};
                const schedule = method === 'Delivery'
                  ? `${delivery.deliveryDate || 'No date'} · ${delivery.deliveryTimeSlot || 'No slot'}`
                  : formatPickup(o);
                const confirmedText = confirmedLabel(o, method);

                return (
                  <article className={`order-item${open[o.id] ? ' is-open' : ''}`} key={o.id}>
                    <div className="order-row">
                      <div className="oc oc-order">
                        <div className="order-id"><strong>{o.id}</strong><span>{new Date(o.createdAt).toLocaleDateString()}</span></div>
                        <div className="order-customer"><strong>{o.customer?.name || '—'}</strong><span>{o.customer?.phone || ''}</span></div>
                      </div>
                      <div className="oc oc-fulfillment">
                        <span className="method-pill">{method}</span>
                        <span className="order-schedule">{confirmedText ? <><b className="confirmed-tag">Confirmed</b> {confirmedText}<small>Preferred: {schedule}</small></> : schedule}</span>
                      </div>
                      <div className="oc oc-payment">
                        <strong className="order-total">{peso(o.total)}</strong>
                        <span>{getPaymentMethodLabel(o)}</span>
                        {o.payment?.method === 'GCash' && <span className={`verification-text ${verificationLabel(o).replaceAll(' ', '-').toLowerCase()}`}>{verificationLabel(o)}</span>}
                      </div>
                      <div className="oc oc-status">
                        <div className={`status-select-wrap ${statusClass(o.status)}`}>
                          <span className="status-dot" aria-hidden="true" />
                          <select aria-label={`Status for order ${o.id}`} value={o.status} onChange={e => setStatus(o.id, e.target.value)}>
                            {statusOptions.map(st => <option key={st}>{st}</option>)}
                          </select>
                        </div>
                        <div className="status-steps" role="img" aria-label={`Step ${Math.max(0, allowedStatuses.indexOf(o.status)) + 1} of ${allowedStatuses.length}`}>
                          {allowedStatuses.map((st, i) => <i key={st} title={st} className={i <= allowedStatuses.indexOf(o.status) ? 'on' : ''} />)}
                        </div>
                      </div>
                      <div className="oc oc-actions">
                        <button className="order-btn order-btn-soft" type="button" onClick={() => setInvoiceId(o.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h7" /></svg>
                          Invoice
                        </button>
                        <button className={`order-btn order-btn-dark${open[o.id] ? ' is-open' : ''}`} type="button" aria-expanded={Boolean(open[o.id])} onClick={() => setOpen(m => ({ ...m, [o.id]: !m[o.id] }))}>
                          {open[o.id] ? 'Hide details' : 'View details'}
                          <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="order-item-detail" hidden={!open[o.id]}>
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
                                <strong>Customer's preferred schedule</strong>
                                <p>{delivery.deliveryDate || '—'} · {delivery.deliveryTimeSlot || '—'}</p>
                              </div>
                            ) : (
                              <div className="detail-note"><strong>Preferred pick-up</strong><p>{formatPickup(o)}<br />Blush Blooms Ozamiz store</p></div>
                            )}
                            <ScheduleConfirm key={`${o.id}-${o.confirmedSchedule?.confirmedAt || 'none'}`} order={o} method={method} onSave={data => setConfirmedSchedule(o.id, data)} onClear={() => setConfirmedSchedule(o.id, null)} />
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
                                {o.items.filter(i => typeof i.includeFillers === 'boolean').map((i, index) => <p key={index}><strong>{i.name}:</strong> {i.includeFillers ? 'Add fillers — florist chooses the final touches.' : 'No fillers requested.'}</p>)}
                                {o.dedication && <><strong>Dedication card</strong><p className="text-muted">“{o.dedication}”</p></>}
                              </div>
                              <div>
                                {snapshot ? <><strong>Bouquet snapshot</strong><img className="bouquet-preview" src={snapshot} alt="Custom bouquet snapshot" /></> : <div className="proof-placeholder">Pre-made bouquet / no custom snapshot</div>}
                              </div>
                            </div>
                          </div>

                          <div className="order-detail-section wide">
                            <div className="detail-section-head"><span>04</span><div><strong>Staff notes</strong><small>Change the status from the Status column in the table</small></div></div>
                            <div className="fulfillment-control-grid">
                              <div className="field wide-field"><label htmlFor={`note-${o.id}`}>Internal note / cancellation reason</label><input id={`note-${o.id}`} type="text" placeholder="Optional staff note (UI placeholder)" /></div>
                              <button className="btn btn-outline btn-sm danger-outline" type="button">Cancel order</button>
                            </div>
                          </div>
                        </div>
                    </div>
                  </article>
                );
              })}
        </div>
      </div>

      {invoiceOrder && (
        <div className="invoice-modal-backdrop" onClick={() => setInvoiceId(null)}>
          <div className="invoice-modal" role="dialog" aria-modal="true" aria-label={`Invoice for ${invoiceOrder.id}`} onClick={e => e.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close invoice" onClick={() => setInvoiceId(null)}>×</button>
            <OrderInvoice order={invoiceOrder} />
          </div>
        </div>
      )}
    </>
  );
}
