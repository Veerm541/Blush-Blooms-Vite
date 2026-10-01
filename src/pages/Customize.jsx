import { useRef, useState } from 'react';
import { FLOWERS } from '../data/flowers.js';
import { useCart } from '../context/CartContext.jsx';
import { peso } from '../lib/format.js';

const GRID = 20;
const SIZES = ['Small', 'Medium', 'Large'];

export default function Customize() {
  const { addToCart, showToast } = useCart();
  const canvasRef = useRef(null);
  const uid = useRef(0);
  const z = useRef(1);
  const moved = useRef(false);
  const [flowers, setFlowers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [size, setSize] = useState('Small');
  const [snap, setSnap] = useState(true);

  const total = flowers.reduce((sum, f) => sum + f.price, 0);
  const counts = flowers.reduce((m, f) => {
    m[f.name] = m[f.name] || { qty: 0, total: 0 };
    m[f.name].qty += 1;
    m[f.name].total += f.price;
    return m;
  }, {});

  const snapTo = n => (snap ? Math.round(n / GRID) * GRID : n);
  const update = (id, patch) => setFlowers(list => list.map(f => (f.uid === id ? { ...f, ...patch } : f)));
  const remove = id => { setFlowers(list => list.filter(f => f.uid !== id)); setSelected(s => (s === id ? null : s)); };

  // x/y are canvas-relative left/top values
  const spawn = (data, x, y) =>
    setFlowers(list => [...list, {
      name: data.name, price: data.price, image: data.image,
      uid: ++uid.current, z: ++z.current, x, y, rotation: 0, scale: 1, flipped: false,
    }]);

  // Convert a pointer position (or random spot near the middle) into canvas coordinates
  const add = (data, clientX, clientY) => {
    const r = canvasRef.current.getBoundingClientRect();
    const cx = clientX ?? r.left + r.width / 2 + (Math.random() * 120 - 60);
    const cy = clientY ?? r.top + r.height / 2 + (Math.random() * 120 - 60);
    const x = snapTo(Math.max(30, Math.min(r.width - 30, cx - r.left)));
    const y = snapTo(Math.max(30, Math.min(r.height - 30, cy - r.top)));
    spawn(data, x - 46, y - 46);
  };

  const startDrag = (e, f) => {
    moved.current = false;
    const box = e.currentTarget.getBoundingClientRect();
    const ox = e.clientX - box.left;
    const oy = e.clientY - box.top;
    const move = ev => {
      moved.current = true;
      const r = canvasRef.current.getBoundingClientRect();
      update(f.uid, { x: snapTo(ev.clientX - r.left - ox), y: snapTo(ev.clientY - r.top - oy) });
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const act = action => {
    const f = flowers.find(x => x.uid === selected);
    if (!f) return;
    if (action === 'delete') return remove(f.uid);
    if (action === 'duplicate') return spawn(f, f.x + 24, f.y + 24);
    const patch = {
      'rotate-left': { rotation: f.rotation - 15 },
      'rotate-right': { rotation: f.rotation + 15 },
      'scale-up': { scale: Math.min(2, f.scale + 0.15) },
      'scale-down': { scale: Math.max(0.5, f.scale - 0.15) },
      flip: { flipped: !f.flipped },
    }[action];
    update(f.uid, patch);
  };

  const onDrop = e => {
    e.preventDefault();
    try { add(JSON.parse(e.dataTransfer.getData('text/plain')), e.clientX, e.clientY); } catch { /* ignore bad drag data */ }
  };

  const save = async () => {
    if (!flowers.length) return showToast('Add at least one flower first.');
    setSelected(null);
    let snapshot = null;
    try {
      const { default: html2canvas } = await import('html2canvas');
      await new Promise(r => requestAnimationFrame(r)); // let the selection outline clear
      const shot = await html2canvas(canvasRef.current, { backgroundColor: '#fbf3ee', useCORS: true });
      snapshot = shot.toDataURL('image/png');
    } catch { /* snapshot failed (e.g. CORS) — order still proceeds */ }
    addToCart({
      id: 'custom-' + Date.now(),
      name: `Custom Bouquet (${size})`,
      price: total,
      image: snapshot || flowers[0].image,
      size,
      stemList: Object.entries(counts).map(([name, c]) => ({ name, qty: c.qty })),
      snapshot,
    });
  };

  const transform = f => `rotate(${f.rotation}deg) scale(${f.scale}) scaleX(${f.flipped ? -1 : 1})`;

  return (
    <>
      <section className="page-hero">
        <div className="container fade-in">
          <div className="eyebrow">Your bouquet, your rules</div>
          <h1>Build your bloom.</h1>
          <p>
            Drag or tap flowers from the palette, then move each stem around the canvas. Double-click a flower to
            remove it. This playful 2D layout is saved into your cart as a custom bouquet.
          </p>
          <div className="notice-banner" style={{ marginTop: '22px' }}>
            <span className="notice-icon">!</span>
            <p>
              <strong>Good to know:</strong> the palette shows the flower types we usually carry, but fresh stock
              changes with the season. We'll confirm your exact stems and colors with you before your bouquet is made.
            </p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container builder">
          <aside className="palette fade-in">
            <div className="eyebrow">Choose stems</div>
            <h3>Flower palette</h3>
            <p className="text-muted">Drag on desktop or tap to place.</p>
            <div className="flower-list">
              {FLOWERS.map(f => (
                <div
                  key={f.name}
                  className="flower-token"
                  draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify({ name: f.name, price: f.price, image: f.image }))}
                  onClick={() => add(f)}
                >
                  <img src={f.thumb} alt={f.name} />
                  <strong>{f.name}</strong>
                  <small>{peso(f.price)}</small>
                </div>
              ))}
            </div>
          </aside>

          <section className="builder-preview fade-in">
            <div className="canvas-toolbar">
              <div className="eyebrow" style={{ margin: 0 }}>2D bouquet canvas</div>
              <div className="size-presets" role="group" aria-label="Bouquet size">
                {SIZES.map(s => (
                  <button key={s} className={`size-btn${size === s ? ' active' : ''}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
              <label className="snap-toggle">
                <input type="checkbox" checked={snap} onChange={e => setSnap(e.target.checked)} />
                Snap to grid
              </label>
            </div>
            <div
              className="canvas"
              data-size={size}
              ref={canvasRef}
              onClick={() => setSelected(null)}
              onDragOver={e => e.preventDefault()}
              onDrop={onDrop}
            >
              <div className="bouquet-base"></div>
              <div className="drop-hint" hidden={flowers.length > 0}>
                <div>
                  <strong>Start with a few stems</strong>
                  <p>Place flowers around the bouquet base.</p>
                </div>
              </div>
              {flowers.map(f => (
                <img
                  key={f.uid}
                  className={`dropped-flower${selected === f.uid ? ' selected' : ''}`}
                  src={f.image}
                  alt={f.name}
                  draggable={false}
                  style={{ left: f.x, top: f.y, zIndex: f.z, transform: transform(f) }}
                  onPointerDown={e => startDrag(e, f)}
                  onClick={e => { e.stopPropagation(); if (!moved.current) setSelected(f.uid); }}
                  onDoubleClick={() => remove(f.uid)}
                />
              ))}
            </div>
            <div className="flower-toolbar" id="flowerToolbar" hidden={selected == null}>
              <button onClick={() => act('rotate-left')} title="Rotate left">⟲</button>
              <button onClick={() => act('rotate-right')} title="Rotate right">⟳</button>
              <button onClick={() => act('scale-down')} title="Shrink">－</button>
              <button onClick={() => act('scale-up')} title="Enlarge">＋</button>
              <button onClick={() => act('flip')} title="Flip">⇋</button>
              <button onClick={() => act('duplicate')} title="Duplicate">⧉</button>
              <button onClick={() => act('delete')} title="Remove">✕</button>
            </div>
            <p className="text-muted" style={{ marginTop: '12px' }}>
              Tip: click a flower to select it and use the toolbar above, double-click to remove it.
            </p>
          </section>

          <aside className="builder-summary fade-in">
            <div className="eyebrow">Your recipe</div>
            <h3>Bouquet summary</h3>
            <div className="builder-items">
              {flowers.length === 0 ? (
                <p className="text-muted">Drag flowers into the canvas to start.</p>
              ) : Object.entries(counts).map(([name, c]) => (
                <div className="summary-line" key={name}>
                  <span>{name} × {c.qty}</span>
                  <span>{peso(c.total)}</span>
                </div>
              ))}
            </div>
            <div className="summary-line" style={{ fontWeight: 800 }}>
              <span>Total</span><span className="builder-total">{peso(total)}</span>
            </div>
            <div style={{ display: 'grid', gap: '9px', marginTop: '16px' }}>
              <button className="btn btn-dark save-bouquet" onClick={save}>Add custom bouquet to bag</button>
              <button className="btn btn-outline clear-bouquet" onClick={() => { setFlowers([]); setSelected(null); }}>
                Clear canvas
              </button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
