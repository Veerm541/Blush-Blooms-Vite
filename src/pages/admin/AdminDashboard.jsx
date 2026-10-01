import { Link } from 'react-router-dom';
import StatusPill from '../../components/StatusPill.jsx';
import StockPill from '../../components/StockPill.jsx';
import useCatalog from '../../hooks/useCatalog.js';
import useOrders from '../../hooks/useOrders.js';
import { peso } from '../../lib/format.js';

export default function AdminDashboard() {
  const [orders] = useOrders();
  const { products } = useCatalog();
  const recent = [...orders].reverse().slice(0, 5);
  const stats = [
    ['Total orders', orders.length],
    ['Pending fulfillment', orders.filter(o => o.status === 'Pending').length],
    ['Total sales', peso(orders.reduce((s, o) => s + (o.total || 0), 0))],
    ['Low / out of stock', products.filter(p => p.stock <= 5).length],
  ];

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of incoming orders, recent sales, and catalog inventory.</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Recent orders</h2>
          <Link className="icon-link-btn" to="/admin/orders">View all orders →</Link>
        </div>
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {recent.length ? recent.map(o => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong></td>
                <td>{o.customer?.name || '—'}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{peso(o.total)}</td>
                <td><StatusPill status={o.status} /></td>
              </tr>
            )) : <tr><td colSpan="5" className="text-muted">No orders placed yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Catalog inventory</h2>
          <Link className="icon-link-btn" to="/admin/catalog">Manage catalog →</Link>
        </div>
        <table className="admin-table">
          <thead><tr><th></th><th>Bouquet</th><th>Price</th><th>Stock</th></tr></thead>
          <tbody>
            {products.slice(0, 5).map(p => (
              <tr key={p.id}>
                <td><img src={p.image} alt={p.name} /></td>
                <td>{p.name}</td>
                <td>{peso(p.price)}</td>
                <td><StockPill stock={p.stock} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
