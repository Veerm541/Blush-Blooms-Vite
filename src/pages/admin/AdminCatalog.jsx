import { useState } from 'react';
import StockPill from '../../components/StockPill.jsx';
import useCatalog from '../../hooks/useCatalog.js';

function ProductRow({ product, onSave }) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  return (
    <tr>
      <td><img src={product.image} alt={product.name} /></td>
      <td>{product.name}</td>
      <td>₱<input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} /></td>
      <td><input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} /> <StockPill stock={product.stock} /></td>
      <td><button className="btn btn-outline" onClick={() => onSave({ price: Number(price), stock: Number(stock) })}>Save</button></td>
    </tr>
  );
}

function AssetRow({ asset, onSave }) {
  const [price, setPrice] = useState(asset.price);
  const [available, setAvailable] = useState(asset.available);
  return (
    <tr>
      <td>{asset.image ? <img src={asset.image} alt={asset.name} /> : '—'}</td>
      <td>{asset.name}</td>
      <td>{asset.type}</td>
      <td>₱<input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} /></td>
      <td>
        <select value={String(available)} onChange={e => setAvailable(e.target.value === 'true')}>
          <option value="true">Available</option>
          <option value="false">Hidden</option>
        </select>
      </td>
      <td><button className="btn btn-outline" onClick={() => onSave({ price: Number(price), available })}>Save</button></td>
    </tr>
  );
}

export default function AdminCatalog() {
  const { products, setProducts, assets, setAssets } = useCatalog();
  const patch = (setter, id) => changes => setter(list => list.map(x => (x.id === id ? { ...x, ...changes } : x)));

  const addProduct = e => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setProducts(l => [...l, {
      id: 'p-' + Date.now(), name: d.get('name'), price: Number(d.get('price')), stock: Number(d.get('stock')),
      image: d.get('image') || '/images/bouquet-signature.jpg',
    }]);
    e.currentTarget.reset();
  };

  const addAsset = e => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setAssets(l => [...l, {
      id: 'a-' + Date.now(), name: d.get('name'), type: d.get('type'), price: Number(d.get('price')),
      available: true, image: d.get('image') || '',
    }]);
    e.currentTarget.reset();
  };

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Catalog &amp; asset management</h1>
          <p>Update the pre-made bouquet catalog and the 2D stickers (flowers, wrappers, ribbons) used in the customizer.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><h2>Pre-made bouquets</h2></div>
        <table className="admin-table">
          <thead><tr><th></th><th>Name</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {products.map(p => (
              <ProductRow key={`${p.id}-${p.price}-${p.stock}`} product={p} onSave={patch(setProducts, p.id)} />
            ))}
          </tbody>
        </table>
        <form className="mini-form" onSubmit={addProduct}>
          <div className="field"><label htmlFor="pName">New bouquet name</label><input type="text" id="pName" name="name" required /></div>
          <div className="field"><label htmlFor="pPrice">Price</label><input type="number" id="pPrice" name="price" min="0" required /></div>
          <div className="field"><label htmlFor="pStock">Stock</label><input type="number" id="pStock" name="stock" min="0" required /></div>
          <div className="field"><label htmlFor="pImage">Image path (optional)</label><input type="text" id="pImage" name="image" placeholder="/images/..." /></div>
          <button className="btn btn-dark" type="submit">Add bouquet</button>
        </form>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><h2>2D sticker assets (flowers, wrappers, ribbons)</h2></div>
        <table className="admin-table">
          <thead><tr><th></th><th>Name</th><th>Type</th><th>Price</th><th>Visibility</th><th></th></tr></thead>
          <tbody>
            {assets.map(a => (
              <AssetRow key={`${a.id}-${a.price}-${a.available}`} asset={a} onSave={patch(setAssets, a.id)} />
            ))}
          </tbody>
        </table>
        <form className="mini-form" onSubmit={addAsset}>
          <div className="field"><label htmlFor="aName">New asset name</label><input type="text" id="aName" name="name" required /></div>
          <div className="field">
            <label htmlFor="aType">Type</label>
            <select id="aType" name="type"><option>Flower</option><option>Wrapper</option><option>Ribbon</option></select>
          </div>
          <div className="field"><label htmlFor="aPrice">Price</label><input type="number" id="aPrice" name="price" min="0" required /></div>
          <div className="field"><label htmlFor="aImage">Image URL (optional)</label><input type="text" id="aImage" name="image" placeholder="https://..." /></div>
          <button className="btn btn-dark" type="submit">Add asset</button>
        </form>
      </div>
    </>
  );
}
