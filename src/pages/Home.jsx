import A from '../components/A.jsx';
import Stat from '../components/Stat.jsx';
import Testimonials from '../components/Testimonials.jsx';
import { NewsletterForm } from '../components/forms.jsx';
import { useCart } from '../context/CartContext.jsx';
import { PRODUCTS } from '../data/products.js';

const byId = id => PRODUCTS.find(p => p.id === id);

export default function Home() {
  const { addToCart } = useCart();
  return (
    <>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content fade-in">
          <div className="script">Hand-picked with a little heart</div>
          <h1>Fresh flowers.<br />Soft moments.</h1>
          <p>
            Warm, garden-inspired blooms arranged for birthdays, quiet
            thank-yous, dinner tables, and the ordinary days that deserve
            something beautiful.
          </p>
          <div className="hero-actions">
            <A className="btn btn-primary" href="/shop">Shop fresh blooms</A><A className="btn btn-light" href="/customize">Build a bouquet</A>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head fade-in">
            <div>
              <div className="eyebrow">Recommended for you</div>
              <h2>Blooms for every mood.</h2>
            </div>
            <p>
              Our seasonal collection leans romantic, loose, and natural — never
              too perfect, always arranged with intention.
            </p>
          </div>
          <div className="grid grid-3 recommended-grid">
            <article className="product-card card fade-in">
              <div className="media">
                <img
                  src="/images/bouquet-royal-blue.jpg"
                  alt="Royal Blue Elegance bouquet — cream roses and pink carnations wrapped in royal blue paper"
                />
              </div>
              <div className="product-info">
                <span className="tag">Best seller</span>
                <div className="product-meta">
                  <div>
                    <h3>Royal Blue Elegance</h3>
                    <p className="text-muted">Cream roses, pink carnations &amp; gyp</p>
                  </div>
                  <strong className="product-price">₱1,750</strong>
                </div>
                <div className="card-actions">
                  <button className="btn btn-dark" onClick={() => addToCart(byId('royal-blue'))}>
                    Add to bag</button
                  ><A className="btn btn-outline" href="/shop">View</A>
                </div>
              </div>
            </article>
            <article className="product-card card fade-in">
              <div className="media">
                <img
                  src="/images/bouquet-orchid-blush.jpg"
                  alt="Orchid Blush Mix bouquet — carnations, roses and statice in violet and pink"
                />
              </div>
              <div className="product-info">
                <span className="tag">Seasonal</span>
                <div className="product-meta">
                  <div>
                    <h3>Orchid Blush Mix</h3>
                    <p className="text-muted">Carnations, roses &amp; statice</p>
                  </div>
                  <strong className="product-price">₱1,650</strong>
                </div>
                <div className="card-actions">
                  <button className="btn btn-dark" onClick={() => addToCart(byId('orchid-blush'))}>
                    Add to bag</button
                  ><A className="btn btn-outline" href="/shop">View</A>
                </div>
              </div>
            </article>
            <article className="product-card card fade-in">
              <div className="media">
                <img
                  src="/images/bouquet-lily-rose.jpg"
                  alt="Lily and Rose bouquet — white roses and pink stargazer lilies in kraft wrap"
                />
              </div>
              <div className="product-info">
                <span className="tag">New</span>
                <div className="product-meta">
                  <div>
                    <h3>Lily &amp; Rose</h3>
                    <p className="text-muted">White roses &amp; stargazer lilies</p>
                  </div>
                  <strong className="product-price">₱2,350</strong>
                </div>
                <div className="card-actions">
                  <button className="btn btn-dark" onClick={() => addToCart(byId('lily-rose'))}>
                    Add to bag</button
                  ><A className="btn btn-outline" href="/shop">View</A>
                </div>
              </div>
            </article>
            <article className="product-card card fade-in">
              <div className="media">
                <img
                  src="/images/bouquet-crimson-roses.jpg"
                  alt="Crimson Romance bouquet — a dozen red roses with baby's breath"
                />
              </div>
              <div className="product-info">
                <span className="tag">Customer favorite</span>
                <div className="product-meta">
                  <div>
                    <h3>Crimson Romance</h3>
                    <p className="text-muted">A dozen red roses &amp; baby's breath</p>
                  </div>
                  <strong className="product-price">₱2,100</strong>
                </div>
                <div className="card-actions">
                  <button className="btn btn-dark" onClick={() => addToCart(byId('crimson-roses'))}>
                    Add to bag</button
                  ><A className="btn btn-outline" href="/shop">View</A>
                </div>
              </div>
            </article>
          </div>
          <div className="center" style={{marginTop: '30px'}}>
            <A className="btn btn-outline" href="/shop">See the full shop</A>
          </div>
        </div>
      </section>
      <section className="section-sm">
        <div className="container split">
          <div className="soft-panel fade-in">
            <div className="eyebrow">Make it yours</div>
            <h2>Drag. Drop. Bloom.</h2>
            <p>
              Our playful 2D bouquet builder lets you choose stems and arrange
              them your way before adding your creation to the bag.
            </p>
            <A className="btn btn-dark" href="/customize"
              >Open bouquet builder</A>
          </div>
          <img
            className="round-img fade-in"
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=85"
            alt="Fresh flowers on a table"
          />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="stats fade-in">
            <div className="stat-grid">
              <div>
                <Stat count={1200} suffix="+" />
                <div className="stat-label">bouquets delivered</div>
              </div>
              <div>
                <Stat count={48} suffix="h" />
                <div className="stat-label">freshness promise</div>
              </div>
              <div>
                <Stat count={96} suffix="%" />
                <div className="stat-label">happy gifters</div>
              </div>
              <div>
                <Stat count={17} suffix="" />
                <div className="stat-label">seasonal stem types</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section-sm">
        <div className="container">
          <div className="section-head fade-in">
            <div>
              <div className="eyebrow">Kind words</div>
              <h2>Flowers that made someone's day.</h2>
            </div>
            <p>Realistic sample testimonials for the storefront experience.</p>
          </div>
          <Testimonials />
        </div>
      </section>
      <section className="section-sm" id="newsletter">
        <div className="container">
          <div className="newsletter fade-in">
            <div>
              <div className="eyebrow">Stay in the loop</div>
              <h2>Fresh drops, not inbox clutter.</h2>
              <p>Seasonal flowers, weekend stems, and small shop stories.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
