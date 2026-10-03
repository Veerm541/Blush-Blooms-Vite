import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import CartDrawer from './CartDrawer.jsx';

const TITLES = {
  '/': 'Blush Blooms', '/shop': 'Shop | Blush Blooms', '/customize': 'Customize | Blush Blooms',
  '/about': 'Our Story | Blush Blooms', '/contact': 'Contact | Blush Blooms',
  '/checkout': 'Checkout | Blush Blooms', '/order-status': 'Track Order | Blush Blooms',
};

const NAV = [
  ['/', 'Home'], ['/shop', 'Shop'], ['/customize', 'Customize'],
  ['/about', 'Our Story'], ['/contact', 'Contact'], ['/order-status', 'Track Order'],
];

export default function Layout() {
  const { count, setOpen, toast } = useCart();
  const [menu, setMenu] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => { document.title = TITLES[pathname] || 'Blush Blooms'; }, [pathname]);

  useEffect(() => {
    setMenu(false);
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Scroll-reveal for every .fade-in element on the current page
  useEffect(() => {
    const items = [...document.querySelectorAll('.fade-in:not(.visible)')];
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('visible')); return; }
    const obs = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
    }), { threshold: 0.12 });
    items.forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="container nav-wrap">
          <Link className="logo" to="/">Blush <span className="script">Blooms</span></Link>
          <nav className={`nav-menu${menu ? ' open' : ''}`}>
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="icon-btn" to="/contact#newsletter">✉</Link>
            <button className="cart-btn" onClick={() => setOpen(true)}>
              Bag <span className="cart-count">{count}</span>
            </button>
            <button className="hamburger" aria-label="Menu" onClick={() => setMenu(m => !m)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link className="logo" to="/">Blush <span className="script">Blooms</span></Link>
            <p className="text-muted">
              Fresh, garden-inspired flowers and a playful 2D bouquet builder — arranged with a little heart in Ozamiz City.
            </p>
            <span className="socials">
              <a href="#" aria-label="Instagram" title="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="#" aria-label="Facebook" title="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 21v-7.6h2.6l.4-3h-3V8.4c0-.9.3-1.5 1.6-1.5H17.6V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4v2.3H8.6v3H11.2V21h3.3z" /></svg>
              </a>
              <a href="#" aria-label="Pinterest" title="Pinterest">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2c-4.8 0-8.2 3.4-8.2 7.5 0 2.4 1.2 4.2 2.7 5 .2.1.4 0 .5-.3l.3-1.2c.1-.3 0-.4-.2-.6-.5-.6-.9-1.4-.9-2.6 0-2.8 2.1-5.3 5.4-5.3 2.9 0 4.6 1.8 4.6 4.2 0 3.1-1.4 5.8-3.4 5.8-1.1 0-1.9-.9-1.7-2.1.3-1.3 1-2.8 1-3.8 0-.9-.5-1.6-1.5-1.6-1.1 0-2.1 1.2-2.1 2.8 0 1 .4 1.7.4 1.7l-1.3 5.8c-.4 1.7-.1 3.7 0 3.9.1.1.2.1.3 0 .9-1.2 1.9-4.4 2.3-6l.5-1.9c.5.9 1.8 1.6 3.1 1.6 4.1 0 6.9-3.7 6.9-8.6 0-3.9-3.2-6.9-7.7-6.9z" /></svg>
              </a>
            </span>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop">Fresh bouquets</Link>
            <Link to="/customize">Build a bouquet</Link>
            <Link to="/order-status">Track an order</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">Our story</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/contact#newsletter">Newsletter</Link>
            <Link to="/admin/login">Admin</Link>
          </div>
          <div className="footer-col">
            <h4>Visit us</h4>
            <p className="text-muted">Kaamino St. corner Ledesma St.,<br />Ozamiz City, Philippines, 7200</p>
          </div>
        </div>
        <div className="container footer-row">
          <span>© 2026 Blush Blooms · Fresh Flowers</span>
          <span className="text-muted">Pick-up &amp; delivery · Cash and GCash options</span>
        </div>
      </footer>

      <button className={`back-top${showTop ? ' show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
      <CartDrawer />
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </>
  );
}
