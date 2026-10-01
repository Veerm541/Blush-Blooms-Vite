import { useMemo, useState } from 'react';
import { FILTERS, PRODUCTS } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';

export default function Shop() {
  const { addToCart } = useCart();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');

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
          <p>Choose from our signature bouquets, seasonal bunches, and small add-ons. Every item is prepared in small batches so your stems arrive vibrant and full.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="notice-banner" style={{ marginBottom: 28 }}>
            <span className="notice-icon">!</span>
            <p><strong>Good to know:</strong> photos show a recent example of each bouquet. Exact varieties, colors, and stem counts can shift slightly with seasonal availability — we'll reach out first if a substitution is needed.</p>
          </div>
          <div className="shop-toolbar">
            <div className="filter-group">
              {FILTERS.map(([key, label]) => (
                <button key={key} className={`filter-btn${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
              ))}
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
                <div className="media">{p.image && <img src={p.image} alt={p.name} />}</div>
                <div className="product-info">
                  {p.tag && <span className="tag">{p.tag}</span>}
                  <div className="product-meta">
                    <div><h3>{p.name}</h3><p className="text-muted">{p.desc}</p></div>
                    <strong>₱{p.price.toLocaleString()}</strong>
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-dark" onClick={() => addToCart(p)}>Add to bag</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
