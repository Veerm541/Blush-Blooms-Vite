import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer() {
  const { items, open, setOpen, total, changeQty, remove, showToast } = useCart();
  const navigate = useNavigate();

  const checkout = () => {
    if (!items.length) return showToast('Your cart is empty.');
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className={`drawer-overlay${open ? ' show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`cart-drawer${open ? ' open' : ''}`}>
        <div className="drawer-head">
          <strong>Your bag</strong>
          <button className="icon-btn drawer-close" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="drawer-body cart-items">
          {!items.length ? (
            <div className="center" style={{ padding: '60px 10px' }}>
              <div className="script" style={{ fontSize: '2rem' }}>A little empty...</div>
              <p className="text-muted">Add a bouquet or a vase and your cart will bloom.</p>
            </div>
          ) : items.map(i => (
            <div className="cart-item" key={i.id}>
              {i.image && <img src={i.image} alt={i.name} />}
              <div>
                <strong>{i.name}</strong>
                {typeof i.includeFillers === 'boolean' && <div className="text-muted cart-filler-preference">{i.includeFillers ? 'Florist finishing touches: add fillers' : 'No fillers requested'}</div>}
                <div className="text-muted">₱{i.price.toLocaleString()}</div>
                <div className="qty">
                  <button aria-label="Decrease quantity" onClick={() => changeQty(i.id, -1)}>−</button>
                  <span>{i.qty}</span>
                  <button aria-label="Increase quantity" onClick={() => changeQty(i.id, 1)}>+</button>
                  <button style={{ marginLeft: 6, border: 0, background: 'none' }} onClick={() => remove(i.id)}>Remove</button>
                </div>
              </div>
              <strong>₱{(i.price * i.qty).toLocaleString()}</strong>
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <div className="total-row"><span>Total</span><span className="cart-total">₱{total.toLocaleString()}</span></div>
          <button className="btn btn-dark checkout-btn" style={{ width: '100%' }} onClick={checkout}>
            Proceed to checkout
          </button>
        </div>
      </aside>
    </>
  );
}
