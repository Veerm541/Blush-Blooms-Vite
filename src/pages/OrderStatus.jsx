import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import A from '../components/A.jsx';
import { readJSON } from '../hooks/useLocalStorage.js';
import { ORDERS_KEY } from '../hooks/useOrders.js';
import { ORDER_STATUSES, peso } from '../lib/format.js';

const find = id => (id ? readJSON(ORDERS_KEY, []).find(o => o.id === id) || null : null);

export default function OrderStatus() {
  const [params] = useSearchParams();
  const initial = params.get('order') || localStorage.getItem('blushBloomsLastOrder') || '';
  const [input, setInput] = useState(initial);
  const [order, setOrder] = useState(() => find(initial));

  const current = order ? ORDER_STATUSES.indexOf(order.status) : -1;
  const snapshot = order?.items.find(i => i.snapshot)?.snapshot;

  return (
    <>
      <section className="page-hero">
        <div className="container fade-in">
          <div className="eyebrow">Track your order</div>
          <h1>Look up your order status anytime.</h1>
          <p>
            Save your order number to look up your status any time. Our florists can see your itemized stem list and
            any custom bouquet snapshot you built.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="order-lookup form-card fade-in">
            <div className="field full">
              <label htmlFor="lookupInput">Order number</label>
              <input id="lookupInput" type="text" placeholder="e.g. BB-10234" value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <button className="btn btn-outline" id="lookupBtn" onClick={() => setOrder(find(input.trim()))}>
              Look up order
            </button>
          </div>

          {order ? (
            <div className="order-detail fade-in visible">
              <div className="order-detail-head">
                <div>
                  <div className="eyebrow">Order {order.id}</div>
                  <h2 style={{ margin: '4px 0 0' }}>Order status</h2>
                </div>
                <strong className="cart-total">{peso(order.total)}</strong>
              </div>

              <ol className="status-tracker">
                {ORDER_STATUSES.map((s, i) => (
                  <li key={s} className={`${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`.trim()}>{s}</li>
                ))}
              </ol>

              <div className="order-grid">
                <div>
                  <h3>Itemized stem list</h3>
                  <div className="drawer-body">
                    {order.items.map(item => (
                      <div className="cart-item" key={item.id}>
                        {item.image && <img src={item.image} alt={item.name} />}
                        <div>
                          <strong>{item.name}</strong>
                          <div className="text-muted">{peso(item.price)} × {item.qty}</div>
                          {item.stemList && (
                            <div className="text-muted" style={{ fontSize: '.82rem' }}>
                              {item.stemList.map(s => `${s.name} × ${s.qty}`).join(', ')}
                            </div>
                          )}
                        </div>
                        <strong>{peso(item.price * item.qty)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>Pickup details</h3>
                  <p className="text-muted">
                    {order.customer.name} · {order.customer.phone}
                    {order.pickupTime && ` · Preferred pickup: ${new Date(order.pickupTime).toLocaleString()}`}
                    {order.dedication && ` · Card: "${order.dedication}"`}
                    {' · Pickup at Blush Blooms, Kaamino St. corner Ledesma St., Ozamiz City.'}
                  </p>
                  <h3>Payment</h3>
                  <p className="text-muted">
                    {order.payment.method === 'GCash' ? 'GCash — receipt uploaded, pending verification.' : 'Cash on Pickup.'}
                  </p>
                </div>
              </div>

              {snapshot && (
                <div>
                  <h3>Bouquet snapshot</h3>
                  <img className="round-img" src={snapshot} alt="Custom bouquet snapshot" />
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted fade-in">
              No order yet? <A href="/shop">Start shopping</A> or <A href="/customize">build a custom bouquet</A>.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
