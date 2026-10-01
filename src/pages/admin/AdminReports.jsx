import StatusPill from '../../components/StatusPill.jsx';
import useOrders from '../../hooks/useOrders.js';
import { ORDER_STATUSES, peso } from '../../lib/format.js';

function Bars({ rows }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <div className="report-bars">
      {rows.map(r => (
        <div className="report-bar" key={r.label}>
          <div className="bar-value">{r.display}</div>
          <div className="bar" style={{ height: `${(r.value / max) * 100}%` }}></div>
          <div className="bar-label">{r.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminReports() {
  const [orders] = useOrders();
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const average = orders.length ? Math.round(revenue / orders.length) : 0;

  const byStatus = ORDER_STATUSES.map(s => {
    const n = orders.filter(o => o.status === s).length;
    return { label: s, value: n, display: n };
  });
  const byMethod = ['COD', 'GCash'].map(m => {
    const t = orders.filter(o => o.payment?.method === m).reduce((s, o) => s + (o.total || 0), 0);
    return { label: m, value: t, display: peso(t) };
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Sales &amp; reporting</h1>
          <p>Basic sales and order summaries to monitor daily transactions.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[['Total revenue', peso(revenue)], ['Total orders', orders.length], ['Average order value', peso(average)]].map(([l, v]) => (
          <div className="stat-card" key={l}>
            <div className="stat-label">{l}</div>
            <div className="stat-value">{v}</div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><h2>Orders by fulfillment status</h2></div>
        <Bars rows={byStatus} />
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head"><h2>Revenue by payment method</h2></div>
        <Bars rows={byMethod} />
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><h2>All transactions</h2></div>
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {orders.length ? [...orders].reverse().map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{o.customer?.name || '—'}</td>
                <td>{o.payment?.method || '—'}</td>
                <td>{peso(o.total)}</td>
                <td><StatusPill status={o.status} /></td>
              </tr>
            )) : <tr><td colSpan="6" className="text-muted">No sales recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
