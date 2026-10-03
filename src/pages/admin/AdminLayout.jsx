import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { adminLogout, adminName, isAdminAuthed } from '../../lib/adminAuth.js';

const LINKS = [
  ['/admin/dashboard', '▦', 'Dashboard'],
  ['/admin/orders', '☷', 'Orders'],
  ['/admin/catalog', '✿', 'Catalog & Assets'],
  ['/admin/reports', '▥', 'Reports'],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  if (!isAdminAuthed()) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="logo" to="/">Blush Blooms</Link>
        <span className="admin-tag">Administrative back office</span>
        <nav className="admin-nav">
          {LINKS.map(([to, icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}><span className="admin-nav-icon">{icon}</span><span>{label}</span></NavLink>)}
        </nav>
        <div className="admin-sidebar-foot">
          <span>Logged in as <strong>{adminName()}</strong></span>
          <Link to="/">View customer storefront</Link>
          <button className="admin-logout" type="button" onClick={() => { adminLogout(); navigate('/admin/login'); }}>
            <span className="admin-logout-icon" aria-hidden="true">↪</span>
            <span>Log out</span>
          </button>
        </div>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}
