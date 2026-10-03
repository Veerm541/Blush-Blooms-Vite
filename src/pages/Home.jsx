import A from '../components/A.jsx';
import { useCart } from '../context/CartContext.jsx';
import { PRODUCTS } from '../data/products.js';
import { peso } from '../lib/format.js';

const FEATURED_IDS = ['royal-blue', 'orchid-blush', 'lily-rose', 'crimson-roses'];
const featured = FEATURED_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

export default function Home() {
  const { addToCart } = useCart();
  return (
    <>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content fade-in">
          <div className="script">Hand-picked with a little heart</div>
          <h1>Fresh flowers.<br />Soft moments.</h1>
          <p>Browse pre-made bouquets or create your own arrangement using our interactive 2D floral customizer.</p>
          <div className="hero-actions"><A className="btn btn-primary" href="/shop">Shop fresh blooms</A><A className="btn btn-light" href="/customize">Build a bouquet</A></div>
        </div>
      </section>

      <section className="section"><div className="container">
        <div className="section-head fade-in"><div><div className="eyebrow">Featured arrangements</div><h2>Blooms for every mood.</h2></div><p>Browse current bouquet options, review prices and details, then add your chosen arrangement to the bag.</p></div>
        <div className="grid grid-4 recommended-grid">{featured.map(p => <article className="product-card home-product-card card fade-in" key={p.id}><div className="media"><img src={p.image} alt={p.name} /></div><div className="product-info">{p.tag && <span className="tag">{p.tag}</span>}<div className="product-meta"><div><h3>{p.name}</h3><p className="text-muted">{p.desc}</p></div><strong className="product-price">{peso(p.price)}</strong></div><div className="home-product-actions"><button className="home-add-bag-btn" type="button" onClick={() => addToCart(p)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V6a5 5 0 0 1 10 0v2"/><path d="M5.5 8h13l1 12h-15l1-12Z"/></svg><span>Add to bag</span></button><A className="home-view-shop-link" href="/shop">View in shop <span aria-hidden="true">→</span></A></div></div></article>)}</div>
        <div className="center" style={{ marginTop: 30 }}><A className="btn btn-outline" href="/shop">See the full shop</A></div>
      </div></section>

      <section className="section-sm"><div className="container split">
        <div className="soft-panel fade-in"><div className="eyebrow">Make it yours</div><h2>Drag. Drop. Bloom.</h2><p>Choose flowers, wrappers, and ribbons, arrange them on the 2D canvas, and watch the bouquet price update as you build.</p><A className="btn btn-dark" href="/customize">Open bouquet builder</A></div>
        <img className="round-img fade-in" src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=85" alt="Fresh flowers on a table" />
      </div></section>

      <section className="section"><div className="container">
        <div className="section-head fade-in"><div><div className="eyebrow">How it works</div><h2>From bouquet to fulfillment.</h2></div><p>The storefront guides customers through product selection, customization, checkout, and order tracking.</p></div>
        <div className="customer-flow-grid">
          <div className="flow-card"><span>01</span><strong>Browse</strong><p>Choose a pre-made bouquet and review product details and pricing.</p></div>
          <div className="flow-card"><span>02</span><strong>Customize</strong><p>Build a 2D arrangement using flowers, wrappers, and ribbons.</p></div>
          <div className="flow-card"><span>03</span><strong>Checkout</strong><p>Select store pick-up or eligible delivery, then choose cash or GCash.</p></div>
          <div className="flow-card"><span>04</span><strong>Track</strong><p>Use the generated order number to monitor fulfillment progress.</p></div>
        </div>
      </div></section>

      <section className="section-sm"><div className="container fulfillment-home-grid">
        <div className="fulfillment-home-card"><div className="eyebrow">Store pick-up</div><h3>Pick up when your bouquet is ready.</h3><p className="text-muted">Choose a preferred pick-up date and time during checkout. The order status will show when the bouquet is ready for pick-up.</p></div>
        <div className="fulfillment-home-card"><div className="eyebrow">Delivery</div><h3>Delivery for eligible locations.</h3><p className="text-muted">Provide your address, barangay, landmark, preferred date, and delivery time slot. Availability depends on the shop&apos;s serviceable area.</p></div>
      </div></section>
    </>
  );
}
