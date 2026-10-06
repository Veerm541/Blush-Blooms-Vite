import { useMemo, useState } from 'react';
import { StockPill } from '../../components/Pills.jsx';
import useCatalog from '../../hooks/useCatalog.js';
import { peso } from '../../lib/format.js';
import CatalogEditor from '../../components/CatalogEditor.jsx';

function ProductRow({ product, onSave, onEdit }) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  return (
    <tr>
      <td>{product.image ? <img src={product.image} alt={product.name} /> : <div className="asset-fallback">✿</div>}</td>
      <td><strong>{product.name}</strong><div className="text-muted tiny-text">{product.category === 'add-on' ? 'Add-on' : 'Pre-made bouquet'}</div></td>
      <td><input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} /></td>
      <td><input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} /></td>
      <td><StockPill stock={Number(stock)} /></td>
      <td><div className="row-actions"><button className="btn btn-outline btn-sm" disabled={price === '' || stock === '' || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0} onClick={() => onSave({ price: Number(price), stock: Number(stock) })}>Save</button><button className="text-action" type="button" onClick={onEdit}>Edit details</button></div></td>
    </tr>
  );
}

function AssetRow({ asset, onSave, onEdit }) {
  const [price, setPrice] = useState(asset.price);
  const [available, setAvailable] = useState(asset.available);
  return (
    <tr>
      <td>{asset.image ? <img src={asset.image} alt={asset.name} /> : <div className="asset-fallback">{asset.type === 'Wrapper' ? '◇' : asset.type === 'Ribbon' ? '〰' : '✿'}</div>}</td>
      <td><strong>{asset.name}</strong></td>
      <td><span className="asset-type-pill">{asset.type}</span></td>
      <td><input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} /></td>
      <td>
        <select value={String(available)} onChange={e => setAvailable(e.target.value === 'true')}>
          <option value="true">Available</option>
          <option value="false">Hidden</option>
        </select>
      </td>
      <td><div className="row-actions"><button className="btn btn-outline btn-sm" disabled={price === '' || !Number.isFinite(Number(price)) || Number(price) < 0} onClick={() => onSave({ price: Number(price), available })}>Save</button><button className="text-action" type="button" onClick={onEdit}>Edit asset</button></div></td>
    </tr>
  );
}

export default function AdminCatalog() {
  const { products, setProducts, assets, setAssets } = useCatalog();
  const [tab, setTab] = useState('products');
  const [assetType, setAssetType] = useState('All');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const patch = (setter, id) => changes => { setter(list => list.map(x => (x.id === id ? { ...x, ...changes } : x))); setNotice('Catalog changes saved.'); };

  const visibleProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const visibleAssets = useMemo(() => assets.filter(a => (assetType === 'All' || a.type === assetType) && a.name.toLowerCase().includes(query.toLowerCase())), [assets, assetType, query]);

  const addProduct = e => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (!String(d.get('name')).trim()) return;
    setProducts(l => [...l, { id: 'p-' + Date.now(), name: String(d.get('name')).trim(), category: 'bouquet', desc: '', price: Number(d.get('price')), stock: Number(d.get('stock')), image: d.get('image') || '/images/bouquet-signature.jpg' }]);
    setNotice('Bouquet added.');
    e.currentTarget.reset();
  };

  const addAsset = e => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setAssets(l => [...l, { id: 'a-' + Date.now(), name: d.get('name'), type: d.get('type'), price: Number(d.get('price')), available: true, image: d.get('image') || '' }]);
    setNotice('Asset added.');
    e.currentTarget.reset();
  };

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="admin-kicker">Store inventory</div>
          <h1>Catalog &amp; assets</h1>
          <p>Manage pre-made bouquets and the flower, wrapper, and ribbon assets used in the 2D customizer.</p>
        </div>
        <div className="catalog-summary-chips">
          <span>{products.length} bouquets</span><span>{assets.length} customizer assets</span><span>{products.filter(p => p.stock <= 5).length} low stock</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Pre-made bouquets</button>
        <button className={tab === 'assets' ? 'active' : ''} onClick={() => setTab('assets')}>2D customizer assets</button>
      </div>
      {notice && <p className="catalog-save-notice" role="status">{notice}</p>}
      {editing && <CatalogEditor item={editing.item} kind={editing.kind} onClose={() => setEditing(null)} onSave={changes => { patch(editing.kind === 'products' ? setProducts : setAssets, editing.item.id)(changes); setEditing(null); }} />}

      <div className="catalog-toolbar admin-panel">
        <div className="admin-search-field"><label htmlFor="catalogSearch">Search catalog</label><input id="catalogSearch" type="search" placeholder="Search by name" value={query} onChange={e => setQuery(e.target.value)} /></div>
        {tab === 'assets' && <div className="field"><label htmlFor="assetTypeFilter">Asset type</label><select id="assetTypeFilter" value={assetType} onChange={e => setAssetType(e.target.value)}><option>All</option><option>Flower</option><option>Wrapper</option><option>Ribbon</option></select></div>}
      </div>

      {tab === 'products' ? (
        <div className="admin-panel">
          <div className="admin-panel-head"><div><h2>Pre-made bouquets</h2><p className="panel-subtitle">Update prices, stock levels, and product details shown on the storefront.</p></div></div>
          <div className="table-scroll"><table className="admin-table"><thead><tr><th></th><th>Product</th><th>Price (₱)</th><th>Stock</th><th>Availability</th><th>Actions</th></tr></thead><tbody>{visibleProducts.map(p => <ProductRow key={`${p.id}-${p.price}-${p.stock}`} product={p} onSave={patch(setProducts, p.id)} onEdit={() => setEditing({ item: p, kind: 'products' })} />)}</tbody></table></div>
          <form className="mini-form expanded-mini-form" onSubmit={addProduct}>
            <div className="mini-form-title"><strong>Add pre-made bouquet</strong><span>Create a new catalog item for the customer storefront.</span></div>
            <div className="field"><label htmlFor="pName">Bouquet name</label><input type="text" id="pName" name="name" required /></div>
            <div className="field"><label htmlFor="pPrice">Price</label><input type="number" id="pPrice" name="price" min="0" required /></div>
            <div className="field"><label htmlFor="pStock">Stock</label><input type="number" id="pStock" name="stock" min="0" required /></div>
            <div className="field"><label htmlFor="pImage">Image path</label><input type="text" id="pImage" name="image" placeholder="/images/..." /></div>
            <button className="btn btn-dark btn-sm" type="submit">Add bouquet</button>
          </form>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-panel-head"><div><h2>2D sticker assets</h2><p className="panel-subtitle">Manage flowers, wrappers, ribbons, prices, and customer-facing availability.</p></div></div>
          <div className="table-scroll"><table className="admin-table"><thead><tr><th></th><th>Asset</th><th>Type</th><th>Price (₱)</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{visibleAssets.map(a => <AssetRow key={`${a.id}-${a.price}-${a.available}`} asset={a} onSave={patch(setAssets, a.id)} onEdit={() => setEditing({ item: a, kind: 'assets' })} />)}</tbody></table></div>
          <form className="mini-form expanded-mini-form" onSubmit={addAsset}>
            <div className="mini-form-title"><strong>Add customizer asset</strong><span>Add another flower, wrapper, or ribbon option.</span></div>
            <div className="field"><label htmlFor="aName">Asset name</label><input type="text" id="aName" name="name" required /></div>
            <div className="field"><label htmlFor="aType">Type</label><select id="aType" name="type"><option>Flower</option><option>Wrapper</option><option>Ribbon</option></select></div>
            <div className="field"><label htmlFor="aPrice">Price</label><input type="number" id="aPrice" name="price" min="0" required /></div>
            <div className="field"><label htmlFor="aImage">Image URL/path</label><input type="text" id="aImage" name="image" placeholder="https://... or /images/..." /></div>
            <button className="btn btn-dark btn-sm" type="submit">Add asset</button>
          </form>
        </div>
      )}
    </>
  );
}
