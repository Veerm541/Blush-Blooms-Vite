import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [gcash, setGcash] = useState(false);
  const [error, setError] = useState('');
  const [gcashError, setGcashError] = useState('');

  const submit = e => {
    e.preventDefault();
    setError(''); setGcashError('');
    if (!items.length) return setError('Your bag is empty.');
    const form = e.currentTarget;
    const data = new FormData(form);
    const method = data.get('paymentMethod') || 'COD';
    const file = data.get('gcashReceipt');
    if (method === 'GCash' && !(file && file.size)) return setGcashError('Please upload your GCash receipt screenshot for verification.');
    const finalize = receipt => {
      const order = {
        id: 'BB-' + Math.floor(10000 + Math.random() * 89999),
        createdAt: new Date().toISOString(), status: 'Pending',
        customer: { name: data.get('fullName'), email: data.get('email'), phone: data.get('phone') },
        pickupTime: data.get('pickupTime'), dedication: data.get('dedication') || '',
        payment: { method, receipt: receipt || null }, items, total,
      };
      const orders = JSON.parse(localStorage.getItem('blushBloomsOrders') || '[]');
      localStorage.setItem('blushBloomsOrders', JSON.stringify([...orders, order]));
      localStorage.setItem('blushBloomsLastOrder', order.id);
      clear();
      navigate('/order-status?order=' + order.id);
    };
    if (method === 'GCash') {
      const r = new FileReader(); r.onload = () => finalize(r.result); r.readAsDataURL(file);
    } else finalize(null);
  };

  return (
    <>
      <section className="page-hero">
        <div className="container fade-in">
          <div className="eyebrow">Almost there</div>
          <h1>Checkout.</h1>
          <p>
            No account needed — just leave your details below. We'll text you
            when your bouquet is ready for pickup at our Ozamiz store.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container checkout-grid">
          <form className="form-card fade-in" id="checkoutForm" noValidate onSubmit={submit}>
            <h3 style={{marginTop: '0'}}>Your details</h3>
            <div className="pickup-location-note">
              <strong>Pickup location</strong>
              <p className="text-muted">
                Blush Blooms · Kaamino St. corner Ledesma St., Ozamiz City,
                Philippines, 7200 — we don't offer delivery yet, every order
                is picked up in-store.
              </p>
            </div>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="fullName">Full name</label>
                <input type="text" id="fullName" name="fullName" required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input type="tel" id="phone" name="phone" required />
              </div>
              <div className="field">
                <label htmlFor="pickupTime">Preferred pickup time</label>
                <input
                  type="datetime-local"
                  id="pickupTime"
                  name="pickupTime"
                  required
                />
              </div>
              <div className="field full">
                <label htmlFor="dedication">Dedication card text (optional)</label>
                <input
                  type="text"
                  id="dedication"
                  name="dedication"
                  placeholder="e.g. Happy birthday, Mara!"
                  maxLength="140"
                />
              </div>
            </div>

            <h3>Payment method</h3>
            <p className="text-muted" style={{marginTop: '-8px'}}>
              We currently support Cash on Pickup and manual GCash payment
              verification.
            </p>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  defaultChecked onChange={() => setGcash(false)}
                />
                <div>
                  <strong>Cash on Pickup</strong>
                  <p className="text-muted">Pay in cash when you pick up your order.</p>
                </div>
              </label>
              <label className="payment-option">
                <input type="radio" name="paymentMethod" value="GCash" onChange={() => setGcash(true)} />
                <div>
                  <strong>GCash</strong>
                  <p className="text-muted">
                    Send payment, then upload a screenshot of your receipt for
                    verification.
                  </p>
                </div>
              </label>
            </div>

            <div className="field full gcash-details" id="gcashPayDetails" hidden={!gcash}>
              <div className="gcash-qr" aria-hidden="true">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="#fff" />
                  <g fill="#332c2a">
                    <rect x="6" y="6" width="22" height="22" />
                    <rect x="72" y="6" width="22" height="22" />
                    <rect x="6" y="72" width="22" height="22" />
                    <rect x="13" y="13" width="8" height="8" fill="#fff" />
                    <rect x="79" y="13" width="8" height="8" fill="#fff" />
                    <rect x="13" y="79" width="8" height="8" fill="#fff" />
                    <rect x="36" y="6" width="6" height="6" />
                    <rect x="48" y="6" width="6" height="6" />
                    <rect x="60" y="12" width="6" height="6" />
                    <rect x="36" y="18" width="6" height="6" />
                    <rect x="54" y="24" width="6" height="6" />
                    <rect x="66" y="30" width="6" height="6" />
                    <rect x="36" y="36" width="6" height="6" />
                    <rect x="48" y="36" width="6" height="6" />
                    <rect x="60" y="42" width="6" height="6" />
                    <rect x="36" y="48" width="6" height="6" />
                    <rect x="6" y="42" width="6" height="6" />
                    <rect x="18" y="48" width="6" height="6" />
                    <rect x="6" y="54" width="6" height="6" />
                    <rect x="72" y="42" width="6" height="6" />
                    <rect x="84" y="48" width="6" height="6" />
                    <rect x="72" y="54" width="6" height="6" />
                    <rect x="90" y="60" width="6" height="6" />
                    <rect x="36" y="60" width="6" height="6" />
                    <rect x="48" y="66" width="6" height="6" />
                    <rect x="60" y="60" width="6" height="6" />
                    <rect x="36" y="72" width="6" height="6" />
                    <rect x="48" y="78" width="6" height="6" />
                    <rect x="60" y="84" width="6" height="6" />
                    <rect x="60" y="72" width="6" height="6" />
                    <rect x="72" y="84" width="6" height="6" />
                    <rect x="84" y="72" width="6" height="6" />
                    <rect x="84" y="84" width="6" height="6" />
                  </g>
                </svg>
              </div>
              <div className="gcash-info">
                <span className="gcash-brand">GCash</span>
                <div className="gcash-name">Blush Blooms Ozamiz</div>
                <div className="gcash-number">0917 000 0000</div>
                <p className="gcash-note">
                  Sample QR &amp; number — send your payment to this account,
                  then upload your receipt screenshot below for verification.
                  Please confirm the exact name on the app before sending.
                </p>
              </div>
            </div>

            <div className="field full gcash-upload" id="gcashUploadField" hidden={!gcash}>
              <label htmlFor="gcashReceipt">GCash receipt screenshot</label>
              <input type="file" id="gcashReceipt" name="gcashReceipt" accept="image/*" />
              <p className="form-error" id="gcashError">{gcashError}</p>
            </div>

            <p className="form-error" id="checkoutError">{error}</p>

            <button className="btn btn-dark" type="submit" style={{width: '100%'}}>
              Place order
            </button>
          </form>

          <aside className="order-summary fade-in">
            <h3 style={{marginTop: '0'}}>Order summary</h3>
            <div className="drawer-body checkout-items">
              {!items.length ? <p className="text-muted">Your bag is empty — add something first.</p> : items.map(i => (
                <div className="cart-item" key={i.id}>
                  {i.image && <img src={i.image} alt={i.name} />}
                  <div><strong>{i.name}</strong><div className="text-muted">₱{i.price.toLocaleString()} × {i.qty}</div></div>
                  <strong>₱{(i.price * i.qty).toLocaleString()}</strong>
                </div>
              ))}
            </div>
            <div className="summary-line" style={{fontWeight: '800', marginTop: '10px'}}>
              <span>Total</span><span className="cart-total">₱{total.toLocaleString()}</span>
            </div>
            <p className="text-muted" style={{marginTop: '14px', fontSize: '0.85rem'}}>
              An itemized stem list and a snapshot of any custom bouquets are
              attached automatically to your order for our florists.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
