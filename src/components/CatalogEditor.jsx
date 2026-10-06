import { useEffect, useId, useRef, useState } from 'react';
import { DEFAULT_ASSETS } from '../data/catalogDefaults.js';
import { DEFAULT_DESIGNS, FLOWER_STYLES, RIBBON_STYLES } from '../data/customizerAssets.js';
import AssetPreview from './AssetPreview.jsx';

const SWATCHES = ['#ef9ba8', '#f39aae', '#e8689f', '#c0392b', '#f5c342', '#fff7ef', '#7b95dd', '#9b7bd0'];

function ColorField({ label, value, onChange, swatches }) {
  const id = useId();
  return (
    <div className="color-field">
      <label htmlFor={id}>{label}</label>
      <div className="color-field-row">
        <input id={id} type="color" value={value} onChange={e => onChange(e.target.value)} />
        <code>{value}</code>
      </div>
      {swatches && <div className="swatches">{swatches.map(c => <button key={c} type="button" className={`swatch${c === value ? ' on' : ''}`} style={{ background: c }} aria-label={`Use ${c}`} onClick={() => onChange(c)} />)}</div>}
    </div>
  );
}

export default function CatalogEditor({ item, kind, onSave, onClose }) {
  const dialog = useRef(null);
  const [error, setError] = useState('');
  const product = kind === 'products';
  const locked = !product && DEFAULT_ASSETS.some(a => a.id === item.id);
  const [type, setType] = useState(item.type || 'Flower');
  const [design, setDesign] = useState({ ...(DEFAULT_DESIGNS[item.type] || DEFAULT_DESIGNS.Flower), ...(item.design || {}) });
  const [photo, setPhoto] = useState(item.image?.startsWith('data:') ? '' : item.image || '');
  const set = key => value => setDesign(d => ({ ...d, [key]: value }));
  const changeType = next => { setType(next); setDesign({ ...DEFAULT_DESIGNS[next] }); };
  const flowerStyle = FLOWER_STYLES.find(s => s.id === design.style) || FLOWER_STYLES[0];

  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);

  const submit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name')).trim();
    const price = Number(data.get('price'));
    const stock = Number(data.get('stock'));
    if (!name) return setError('Enter a name.');
    if (!Number.isFinite(price) || price < 0 || (product && (!Number.isInteger(stock) || stock < 0))) return setError('Enter a valid price and whole-number stock.');
    if (product) {
      const image = photo.trim();
      if (image && !/^(https?:\/\/|\/(?!\/))/.test(image)) return setError('Use a photo URL beginning with https:// or a local path beginning with /.');
      return onSave({ name, price, stock, image: image || item.image || '', desc: String(data.get('desc')).trim(), category: data.get('category') });
    }
    return onSave({ name, price, type, design, available: data.get('available') === 'on' });
  };

  return (
    <dialog className="catalog-editor" ref={dialog} onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }} aria-labelledby="catalogEditorTitle">
      <form onSubmit={submit}>
        <div className="catalog-editor-heading"><div><div className="admin-kicker">{product ? 'Pre-made bouquet' : `Customizer ${type.toLowerCase()}`}</div><h2 id="catalogEditorTitle">Edit {product ? 'bouquet' : 'element'}</h2></div><button className="icon-btn" type="button" aria-label="Close editor" onClick={onClose}>×</button></div>

        {!product && (
          <div className="element-preview">
            <AssetPreview type={type} design={design} label={`${type} preview`} />
            <p>Live preview. This is the exact flower element customers drag into their bouquet, so it is drawn, not uploaded as a picture.</p>
          </div>
        )}

        <fieldset className="editor-group">
          <legend>Details</legend>
          <div className="field"><label htmlFor="editName">Name</label><input id="editName" name="name" defaultValue={item.name} required autoFocus /></div>
          {product && <div className="field"><label htmlFor="editDesc">Description</label><textarea id="editDesc" name="desc" defaultValue={item.desc || ''} rows="3" /></div>}
          <div className="form-grid">
            <div className="field"><label htmlFor="editPrice">Price (₱)</label><input id="editPrice" name="price" type="number" min="0" step="0.01" defaultValue={item.price} required /></div>
            {product
              ? <div className="field"><label htmlFor="editStock">Stock</label><input id="editStock" name="stock" type="number" min="0" step="1" defaultValue={item.stock} required /></div>
              : <div className="field"><label htmlFor="editType">Type</label><select id="editType" value={type} disabled={locked} onChange={e => changeType(e.target.value)}><option>Flower</option><option>Wrapper</option><option>Ribbon</option></select>{locked && <small>Built-in elements keep their type.</small>}</div>}
          </div>
          {product && <div className="field"><label htmlFor="editCategory">Category</label><select id="editCategory" name="category" defaultValue={item.category || 'bouquet'}><option value="bouquet">Bouquet</option><option value="seasonal">Seasonal</option><option value="add-on">Add-on</option></select></div>}
        </fieldset>

        {product && (
          <fieldset className="editor-group">
            <legend>Photo</legend>
            <div className="photo-row">
              {photo ? <img src={photo} alt="" /> : <div className="asset-fallback">✿</div>}
              <div className="field"><label htmlFor="editImage">Photo URL or local path</label><input id="editImage" value={photo} onChange={e => setPhoto(e.target.value)} placeholder="/images/… or https://…" /><small>Pre-made bouquets use real photos. Leave unchanged to keep the current one.</small></div>
            </div>
          </fieldset>
        )}

        {!product && (
          <fieldset className="editor-group">
            <legend>Look</legend>
            {type === 'Flower' && <>
              <div className="field"><label htmlFor="editStyle">Flower shape</label><select id="editStyle" value={design.style} onChange={e => set('style')(e.target.value)}>{FLOWER_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
              <ColorField label="Petal color" value={design.petals} onChange={set('petals')} swatches={SWATCHES} />
              <div className="color-pair">
                {flowerStyle.center && <ColorField label="Center color" value={design.center} onChange={set('center')} />}
                <ColorField label="Stem color" value={design.stem} onChange={set('stem')} />
              </div>
            </>}
            {type === 'Ribbon' && <>
              <div className="field"><label htmlFor="editRibbon">Ribbon shape</label><select id="editRibbon" value={design.style} onChange={e => set('style')(e.target.value)}>{RIBBON_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
              <div className="color-pair"><ColorField label="Ribbon color" value={design.color} onChange={set('color')} swatches={SWATCHES} /><ColorField label="Knot & shadow" value={design.shade} onChange={set('shade')} /></div>
            </>}
            {type === 'Wrapper' && <div className="color-pair three">
              <ColorField label="Outer paper" value={design.a} onChange={set('a')} swatches={SWATCHES} />
              <ColorField label="Inner paper" value={design.b} onChange={set('b')} />
              <ColorField label="Edge line" value={design.edge} onChange={set('edge')} />
            </div>}
          </fieldset>
        )}

        {!product && <label className="catalog-available"><input type="checkbox" name="available" defaultChecked={item.available} /> Show this element in the bouquet builder</label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="detail-actions"><button className="btn btn-outline" type="button" onClick={onClose}>Cancel</button><button className="btn btn-dark" type="submit">Save changes</button></div>
      </form>
    </dialog>
  );
}
