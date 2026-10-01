import { Fragment, useState } from 'react';
import useOrders from '../../hooks/useOrders.js';
import { ORDER_STATUSES, peso } from '../../lib/format.js';

export default function AdminOrders() {
  const [orders, setOrders] = useOrders();
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState({});

  const list = [...orders].reverse().filter(o => filter === 'All' || o.status === filter);
  const setStatus = (id, status) => setOrders(all => all.map(o => (o.id === id ? { ...o, status } : o)));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Order management</h1>
          <p>View each order's itemized stem list and design snapshot, and move it through the fulfillment lifecycle.</p>
        </div>
        <div className="field" style={{ minWidth: 200 }}>
          <label htmlFor="statusFilter">Filter by status</label>
          <select id="statusFilter" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-panel">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Details</th></tr></thead>
          <tbody>
            {!list.length && <tr><td colSpan="6" className="text-muted">No orders match this filter.</td></tr>}
            {list.map(o => {
              const stems = o.items
                .map(i => (i.stemList ? i.stemList.map(s => `${s.name} × ${s.qty}`).join(', ') : `${i.name} × ${i.qty}`))
                .join(' · ');
              const snapshot = o.items.find(i => i.snapshot)?.snapshot;
              return (
                <Fragment key={o.id}>
                  <tr>
                    <td><strong>{o.id}</strong></td>
                    <td>
                      {o.customer?.name || '—'}
                      <div className="text-muted" style={{ fontSize: '.78rem' }}>{o.customer?.phone || ''}</div>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>{peso(o.total)}</td>
                    <td>
                      <select className="status-select" value={o.status} onChange={e => setStatus(o.id, e.target.value)}>
                        {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="icon-link-btn toggle-detail" onClick={() => setOpen(m => ({ ...m, [o.id]: !m[o.id] }))}>View</button>
                    </td>
                  </tr>
                  <tr className="row-detail" hidden={!open[o.id]}>
                    <td colSpan="6">
                      <div className="row-detail-grid">
                        <div>
                          <strong>Itemized stem list</strong>
                          <p className="text-muted">{stems || '—'}</p>
                          <strong>Pickup</strong>
                          <p className="text-muted">
                            Pickup at store · Kaamino St. corner Ledesma St., Ozamiz City<br />
                            Preferred: {o.pickupTime ? new Date(o.pickupTime).toLocaleString() : '—'}<br />
                            {o.dedication ? `Card: "${o.dedication}"` : ''}
                          </p>
                          <strong>Payment</strong>
                          <p className="text-muted">{o.payment?.method || '—'}</p>
                        </div>
                        <div>
                          {snapshot && <><strong>Bouquet snapshot</strong><br /><img src={snapshot} alt="Custom bouquet snapshot" /></>}
                          {o.payment?.method === 'GCash' && o.payment?.receipt && (
                            <div style={{ marginTop: 10 }}>
                              <strong>GCash receipt</strong><br />
                              <img src={o.payment.receipt} alt="GCash receipt" />
                            </div>
                          )}
                        </div>
                        <div></div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
