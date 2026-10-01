import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ADMIN_PASS, ADMIN_USER, adminLogin } from '../../lib/adminAuth.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('admin-login-body');
    return () => document.body.classList.remove('admin-login-body');
  }, []);

  const submit = e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const username = String(data.get('username')).trim();
    if (username === ADMIN_USER && data.get('password') === ADMIN_PASS) {
      adminLogin(username);
      navigate('/admin/dashboard');
    } else setError('Incorrect username or password.');
  };

  return (
    <div className="admin-login-card">
      <Link className="logo" to="/">Blush <span className="script">Blooms</span></Link>
      <div className="eyebrow">Admin back office</div>
      <form noValidate onSubmit={submit}>
        <div className="field full">
          <label htmlFor="adminUsername">Username</label>
          <input type="text" id="adminUsername" name="username" autoComplete="username" required />
        </div>
        <div className="field full" style={{ marginTop: 12 }}>
          <label htmlFor="adminPassword">Password</label>
          <input type="password" id="adminPassword" name="password" autoComplete="current-password" required />
        </div>
        <p className="form-error">{error}</p>
        <button className="btn btn-dark" type="submit" style={{ width: '100%', marginTop: 6 }}>Log in</button>
      </form>
      <p className="admin-login-hint">
        Prototype credentials — username <strong>admin</strong>, password <strong>blush2026</strong>. A production
        build would verify this against the Admin table over a real API.
      </p>
      <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.85rem' }}>
        <Link to="/">← Back to storefront</Link>
      </p>
    </div>
  );
}
