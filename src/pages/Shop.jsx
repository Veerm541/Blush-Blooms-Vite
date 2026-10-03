import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FILTERS, PRODUCTS } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';
import { peso } from '../lib/format.js';

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
      <section className="section">
        <div className="container">
          <div className="notice-banner" style={{ marginBottom: 28 }}>
            <span className="notice-icon">!</span>
            <p><strong>Good to know:</strong> photos show a recent example of each bouquet. Exact varieties, colors, and stem counts may shift with seasonal availability.</p>
          </div>
          <div className="shop-toolbar">
            <div className="filter-group">
              {FILTERS.map(([key, label]) => <button key={key} className={`filter-btn${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>{label}</button>)}
            </div>
            <select className="select sort-select" aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          <div className="grid grid-3 shop-grid">
            {list.map(p => (
              <article className="product-card card fade-in visible" key={p.id}>
                <button className="product-media-button" type="button" onClick={() => setSelected(p)} aria-label={`View ${p.name} details`}>
                  <div className="media">{p.image ? <img src={p.image} alt={p.name} /> : <div className="product-image-placeholder">Blush Blooms</div>}</div>
                </button>
                <div className="product-info">
                  {p.tag && <span className="tag">{p.tag}</span>}
                  <div className="product-meta"><div><h3>{p.name}</h3><p className="text-muted">{p.desc}</p></div><strong>{peso(p.price)}</strong></div>
                  <div className="card-actions"><button className="btn btn-dark" onClick={() => addToCart(p)}>Add to bag</button><button className="btn btn-outline" onClick={() => setSelected(p)}>View details</button></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <div className="product-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="productModalTitle" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close product details">×</button>
            <div className="product-modal-media">{selected.image ? <img src={selected.image} alt={selected.name} /> : <div className="product-image-placeholder">Blush Blooms</div>}</div>
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
              <div className="modal-actions"><button className="btn btn-dark" onClick={() => { addToCart(selected); setSelected(null); }}>Add to bag</button><Link className="btn btn-outline" to="/customize">Build a custom bouquet</Link></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
