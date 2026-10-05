import { useState } from 'react';
import { StatusPill } from '../../components/Pills.jsx';
import useOrders from '../../hooks/useOrders.js';
import { ORDER_STATUSES, getFulfillmentMethod, getPaymentMethodLabel, peso } from '../../lib/format.js';

function Bars({ rows }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return <div className="report-bars">{rows.map(r => <div className="report-bar" key={r.label}><div className="bar-value">{r.display}</div><div className="bar" style={{ height: `${(r.value / max) * 100}%` }}></div><div className="bar-label">{r.label}</div></div>)}</div>;
}

export default function AdminReports() {
  const [orders] = useOrders();
  const [range, setRange] = useState('All time');
  const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const average = orders.length ? Math.round(revenue / orders.length) : 0;
  const completed = orders.filter(o => o.status === 'Completed').length;
  const completionRate = orders.length ? Math.round((completed / orders.length) * 100) : 0;

  const byStatus = ORDER_STATUSES.map(s => { const n = orders.filter(o => o.status === s).length; return { label: s, value: n, display: n }; });
  const paymentMethods = ['Cash on Pick-Up', 'Cash on Delivery', 'GCash'];
  const byMethod = paymentMethods.map(m => { const t = orders.filter(o => getPaymentMethodLabel(o) === m).reduce((s, o) => s + (o.total || 0), 0); return { label: m, value: t, display: peso(t) }; });
  const fulfillmentRows = ['Pickup', 'Delivery'].map(m => { const n = orders.filter(o => getFulfillmentMethod(o) === m).length; return { label: m, value: n, display: n }; });

  return (
    <>
      <div className="admin-topbar">
        <div><div className="admin-kicker">Business insights</div><h1>Sales &amp; reporting</h1><p>Review revenue, order status, payment method, fulfillment method, and transaction summaries.</p></div>
        <div className="report-actions"><select value={range} onChange={e => setRange(e.target.value)}><option>Today</option><option>This week</option><option>This month</option><option>All time</option></select><button className="btn btn-outline btn-sm" type="button">Print report</button><button className="btn btn-dark btn-sm" type="button">Export CSV</button></div>
      </div>

      <div className="stat-grid">
        {[
          ['Total revenue', peso(revenue), range],
          ['Total orders', orders.length, 'Recorded transactions'],
          ['Average order value', peso(average), 'Average customer spend'],
          ['Completion rate', `${completionRate}%`, `${completed} completed order${completed === 1 ? '' : 's'}`],
        ].map(([l, v, s]) => <div className="stat-card" key={l}><div className="stat-label">{l}</div><div className="stat-value">{v}</div><div className="stat-sub">{s}</div></div>)}
      </div>

      <div className="report-grid">
        <div className="admin-panel"><div className="admin-panel-head"><div><h2>Orders by status</h2><p className="panel-subtitle">Current fulfillment distribution.</p></div></div><Bars rows={byStatus} /></div>
        <div className="admin-panel"><div className="admin-panel-head"><div><h2>Revenue by payment</h2><p className="panel-subtitle">Cash and GCash order value.</p></div></div><Bars rows={byMethod} /></div>
        <div className="admin-panel"><div className="admin-panel-head"><div><h2>Fulfillment mix</h2><p className="panel-subtitle">Pick-up versus delivery orders.</p></div></div><Bars rows={fulfillmentRows} /></div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><div><h2>Transaction history</h2><p className="panel-subtitle">Detailed order records for sales monitoring.</p></div><span className="text-muted tiny-text">Filter: {range}</span></div>
        <div className="table-scroll"><table className="admin-table"><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Fulfillment</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.length ? [...orders].reverse().map(o => <tr key={o.id}><td><strong>{o.id}</strong></td><td>{new Date(o.createdAt).toLocaleDateString()}</td><td>{o.customer?.name || '—'}</td><td><span className="method-pill">{getFulfillmentMethod(o)}</span></td><td>{getPaymentMethodLabel(o)}</td><td>{peso(o.total)}</td><td><StatusPill status={o.status} /></td></tr>) : <tr><td colSpan="7"><div className="admin-empty-state"><strong>No sales recorded yet.</strong><span>Completed customer checkouts will populate this report.</span></div></td></tr>}</tbody></table></div>
      </div>
    </>
  );
}
