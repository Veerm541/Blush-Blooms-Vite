import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { adminLogout, adminName, isAdminAuthed } from '../../lib/adminAuth.js';

const LINKS = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/orders', 'Orders'],
  ['/admin/catalog', 'Catalog & Assets'],
  ['/admin/reports', 'Reports'],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  if (!isAdminAuthed()) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="logo" to="/">Blush Blooms</Link>
        <span className="admin-tag">Admin panel</span>
        <nav className="admin-nav">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <span>Logged in as <strong>{adminName()}</strong></span>
          <Link to="/">View storefront</Link>
          <button className="admin-logout" onClick={() => { adminLogout(); navigate('/admin/login'); }}>Log out</button>
        </div>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}
