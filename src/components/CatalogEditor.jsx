import { useEffect, useRef, useState } from 'react';
import { DEFAULT_ASSETS } from '../data/catalogDefaults.js';

export default function CatalogEditor({ item, kind, onSave, onClose }) {
  const dialog = useRef(null);
  const [error, setError] = useState('');
  const product = kind === 'products';
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  const submit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name')).trim();
    const image = String(data.get('image')).trim();
    const price = Number(data.get('price'));
    const stock = Number(data.get('stock'));
    if (!name) return setError('Enter a name.');
    if (!Number.isFinite(price) || price < 0 || (product && (!Number.isInteger(stock) || stock < 0))) return setError('Enter a valid price and whole-number stock.');
    if (image && !/^(https?:\/\/|\/(?!\/))/.test(image)) return setError('Use an image URL beginning with https:// or a local path beginning with /.');
    onSave({ name, price, image: image || item.image || '', ...(product
      ? { stock, desc: String(data.get('desc')).trim(), category: data.get('category') }
      : { type: data.get('type') || item.type, available: data.get('available') === 'on' }) });
  };
  return (
    <dialog className="catalog-editor" ref={dialog} onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }} aria-labelledby="catalogEditorTitle">
      <form onSubmit={submit}>
        <div className="catalog-editor-heading"><div><div className="admin-kicker">Catalog details</div><h2 id="catalogEditorTitle">Edit {product ? 'bouquet' : 'asset'}</h2></div><button className="icon-btn" type="button" aria-label="Close editor" onClick={onClose}>×</button></div>
        <div className="field"><label htmlFor="editName">Name</label><input id="editName" name="name" defaultValue={item.name} required autoFocus /></div>
        {product && <div className="field"><label htmlFor="editDesc">Description</label><textarea id="editDesc" name="desc" defaultValue={item.desc || ''} rows="3" /></div>}
        <div className="form-grid">
          <div className="field"><label htmlFor="editPrice">Price (₱)</label><input id="editPrice" name="price" type="number" min="0" step="0.01" defaultValue={item.price} required /></div>
          {product ? <div className="field"><label htmlFor="editStock">Stock</label><input id="editStock" name="stock" type="number" min="0" step="1" defaultValue={item.stock} required /></div>
            : <div className="field"><label htmlFor="editType">Type</label><select id="editType" name="type" defaultValue={item.type} disabled={DEFAULT_ASSETS.some(a => a.id === item.id)}><option>Flower</option><option>Wrapper</option><option>Ribbon</option></select></div>}
        </div>
        {product && <div className="field"><label htmlFor="editCategory">Category</label><select id="editCategory" name="category" defaultValue={item.category || 'bouquet'}><option value="bouquet">Bouquet</option><option value="seasonal">Seasonal</option><option value="add-on">Add-on</option></select></div>}
        <div className="field"><label htmlFor="editImage">Image URL or local path</label><input id="editImage" name="image" defaultValue={item.image?.startsWith('data:') ? '' : item.image || ''} placeholder="Leave blank to keep current artwork" /><small>Use https://… or /images/… . Leave blank to keep the current image.</small></div>
        {!product && <label className="catalog-available"><input type="checkbox" name="available" defaultChecked={item.available} /> Available in the bouquet builder</label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="detail-actions"><button className="btn btn-outline" type="button" onClick={onClose}>Cancel</button><button className="btn btn-dark" type="submit">Save changes</button></div>
      </form>
    </dialog>
  );
}
