import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FILTERS, PRODUCTS } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';
import { peso } from '../lib/format.js';

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.8 8.25h10.4l1.05 11H5.75l1.05-11Z" />
      <path d="M9 9V6.75a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.8 12s3.2-5.25 9.2-5.25S21.2 12 21.2 12s-3.2 5.25-9.2 5.25S2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export default function Shop() {
  const { addToCart } = useCart();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [selected, setSelected] = useState(null);

  const list = useMemo(() => {
    const out = PRODUCTS.filter(p => filter === 'all' || p.category === filter);
    if (sort === 'low') out.sort((a, b) => a.price - b.price);
    if (sort === 'high') out.sort((a, b) => b.price - a.price);
    return out;
  }, [filter, sort]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">The flower counter</div>
          <h1>Fresh flowers, arranged softly.</h1>
          <p>Browse pre-made floral arrangements, review details and prices, or open the customizer to create something more personal.</p>
        </div>
      </section>

      <section className="section shop-section">
        <div className="container">
          <div className="notice-banner" style={{ marginBottom: 28 }}>
            <span className="notice-icon">!</span>
            <p><strong>Good to know:</strong> photos show a recent example of each bouquet. Exact varieties, colors, and stem counts may shift with seasonal availability.</p>
          </div>

          <div className="shop-toolbar">
            <div className="filter-group" aria-label="Filter products">
              {FILTERS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-btn${filter === key ? ' active' : ''}`}
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                >
                  {label}
                </button>
              ))}
            </div>

            <select
              className="select sort-select"
              aria-label="Sort products"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="default">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>

          <div className="shop-grid">
            {list.map(p => (
              <article className="product-card card fade-in visible shop-product-card" key={p.id}>
                <button
                  className="product-media-button"
                  type="button"
                  onClick={() => setSelected(p)}
                  aria-label={`View ${p.name} details`}
                >
                  <div className="media">
                    {p.image ? <img src={p.image} alt={p.name} /> : <div className="product-image-placeholder">Blush Blooms</div>}
                  </div>
                </button>

                <div className="product-info">
                  <div className="shop-product-copy">
                    {p.tag && <span className="tag">{p.tag}</span>}
                    <div className="product-meta">
                      <div>
                        <h3>{p.name}</h3>
                        <p className="text-muted">{p.desc}</p>
                      </div>
                      <strong className="shop-product-price">{peso(p.price)}</strong>
                    </div>
                  </div>

                  <div className="shop-card-actions">
                    <button
                      type="button"
                      className="shop-action-btn shop-add-btn"
                      onClick={() => addToCart(p)}
                    >
                      <span className="shop-action-icon"><BagIcon /></span>
                      <span>Add to bag</span>
                    </button>

                    <button
                      type="button"
                      className="shop-action-btn shop-details-btn"
                      onClick={() => setSelected(p)}
                    >
                      <span className="shop-action-icon"><EyeIcon /></span>
                      <span>View details</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <div className="product-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="productModalTitle" onClick={e => e.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close product details">×</button>
            <div className="product-modal-media">
              {selected.image ? <img src={selected.image} alt={selected.name} /> : <div className="product-image-placeholder">Blush Blooms</div>}
            </div>

            <div className="product-modal-copy">
              <div className="eyebrow">Bouquet details</div>
              <h2 id="productModalTitle">{selected.name}</h2>
              <p className="product-modal-price">{peso(selected.price)}</p>
              <p className="text-muted">{selected.desc}</p>

              <div className="product-detail-list">
                <div><strong>Availability</strong><span>Subject to fresh flower stock</span></div>
                <div><strong>Fulfillment</strong><span>Store pick-up or eligible delivery</span></div>
                <div><strong>Customization</strong><span>Use the 2D builder for a personalized arrangement</span></div>
              </div>

              <div className="modal-actions shop-modal-actions">
                <button
                  type="button"
                  className="shop-action-btn shop-add-btn"
                  onClick={() => { addToCart(selected); setSelected(null); }}
                >
                  <span className="shop-action-icon"><BagIcon /></span>
                  <span>Add to bag</span>
                </button>
                <Link className="shop-action-btn shop-details-btn" to="/customize">
                  <span>Build a custom bouquet</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
