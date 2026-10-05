import { Link } from 'react-router-dom';
import { StatusPill, StockPill } from '../../components/Pills.jsx';
import useCatalog from '../../hooks/useCatalog.js';
import useOrders from '../../hooks/useOrders.js';
import { getFulfillmentMethod, getPaymentMethodLabel, peso } from '../../lib/format.js';

const isSameDate = (value, date = new Date()) => {
  if (!value) return false;
  const d = new Date(value);
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
};

const scheduledForToday = order => {
  const f = order.fulfillment || {};
  if (getFulfillmentMethod(order) === 'Delivery') return f.deliveryDate === new Date().toISOString().slice(0, 10);
  return isSameDate(f.pickupTime || order.pickupTime);
};

export default function AdminDashboard() {
  const [orders] = useOrders();
  const { products, assets } = useCatalog();
  const recent = [...orders].reverse().slice(0, 6);
  const lowStock = products.filter(p => Number(p.stock) <= 5);
  const pendingPayments = orders.filter(o => o.payment?.method === 'GCash' && (o.payment?.verification || 'Pending Verification') === 'Pending Verification');
  const activePrep = orders.filter(o => o.status === 'In Preparation');
  const today = orders.filter(scheduledForToday);
  const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0);

  const stats = [
    ['Pending payment checks', pendingPayments.length, 'GCash proofs waiting for review'],
    ['Active preparations', activePrep.length, 'Bouquets currently being prepared'],
    ['Scheduled today', today.length, 'Pick-ups and deliveries'],
    ['Total sales', peso(revenue), `${orders.length} order${orders.length === 1 ? '' : 's'} recorded`],
  ];

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="admin-kicker">Operations overview</div>
          <h1>Dashboard</h1>
          <p>Monitor orders, payment checks, fulfillment schedules, and catalog availability from one place.</p>
        </div>
        <div className="admin-quick-actions">
          <Link className="btn btn-outline btn-sm" to="/admin/orders">Review orders</Link>
          <Link className="btn btn-dark btn-sm" to="/admin/catalog">Manage catalog</Link>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map(([label, value, sub]) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Today&apos;s fulfillment</h2>
              <p className="panel-subtitle">Orders scheduled for pick-up or delivery today.</p>
            </div>
            <Link className="icon-link-btn" to="/admin/orders">Open orders →</Link>
          </div>
          <div className="admin-list-stack">
            {today.length ? today.slice(0, 5).map(o => (
              <div className="admin-list-card" key={o.id}>
                <div>
                  <strong>{o.id}</strong>
                  <span>{o.customer?.name || 'Customer'} · {getFulfillmentMethod(o)}</span>
                </div>
                <StatusPill status={o.status} />
              </div>
            )) : (
              <div className="admin-empty-state compact">
                <strong>No fulfillment scheduled for today.</strong>
                <span>Upcoming pick-ups and deliveries will appear here.</span>
              </div>
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Attention needed</h2>
              <p className="panel-subtitle">Items that may need staff action.</p>
            </div>
          </div>
          <div className="attention-grid">
            <Link className="attention-card" to="/admin/orders">
              <span className="attention-icon">₱</span>
              <div><strong>{pendingPayments.length} payment proof{pendingPayments.length === 1 ? '' : 's'}</strong><small>Waiting for manual verification</small></div>
            </Link>
            <Link className="attention-card" to="/admin/catalog">
              <span className="attention-icon">!</span>
              <div><strong>{lowStock.length} low / out-of-stock item{lowStock.length === 1 ? '' : 's'}</strong><small>Review catalog availability</small></div>
            </Link>
            <Link className="attention-card" to="/admin/catalog">
              <span className="attention-icon">✿</span>
              <div><strong>{assets.filter(a => !a.available).length} hidden customizer asset{assets.filter(a => !a.available).length === 1 ? '' : 's'}</strong><small>Flowers, wrappers, and ribbons</small></div>
            </Link>
          </div>
        </section>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Recent orders</h2>
            <p className="panel-subtitle">Latest customer orders and their current fulfillment state.</p>
          </div>
          <Link className="icon-link-btn" to="/admin/orders">View all orders →</Link>
        </div>
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Fulfillment</th><th>Payment</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {recent.length ? recent.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.id}</strong></td>
                  <td>{o.customer?.name || '—'}</td>
                  <td><span className="method-pill">{getFulfillmentMethod(o)}</span></td>
                  <td>{getPaymentMethodLabel(o)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{peso(o.total)}</td>
                  <td><StatusPill status={o.status} /></td>
                </tr>
              )) : <tr><td colSpan="7"><div className="admin-empty-state compact"><strong>No orders placed yet.</strong><span>Customer orders will appear here after checkout.</span></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Catalog inventory</h2>
            <p className="panel-subtitle">Quick view of bouquet stock and availability.</p>
          </div>
          <Link className="icon-link-btn" to="/admin/catalog">Manage catalog →</Link>
        </div>
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th></th><th>Bouquet</th><th>Price</th><th>Stock</th><th>Availability</th></tr></thead>
            <tbody>
              {products.slice(0, 6).map(p => (
                <tr key={p.id}>
                  <td><img src={p.image} alt={p.name} /></td>
                  <td><strong>{p.name}</strong></td>
                  <td>{peso(p.price)}</td>
                  <td>{p.stock}</td>
                  <td><StockPill stock={p.stock} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
