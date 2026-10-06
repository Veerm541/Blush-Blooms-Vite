import { useRef } from 'react';
import { getFulfillmentMethod, getPaymentMethodLabel, peso } from '../lib/format.js';
import { orderDate } from '../lib/reports.js';
import { printSection } from '../lib/print.js';

export default function OrderInvoice({ order }) {
  const invoiceRef = useRef(null);
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
  const adjustment = Number(order.total || 0) - subtotal;
  return (
    <section className="order-invoice order-detail-section wide" ref={invoiceRef} aria-label={`Invoice for ${order.id}`}>
      <div className="invoice-heading">
        <div><div className="admin-kicker">Blush Blooms · Ozamiz</div><h2>Order invoice</h2><p><strong>INV-{order.id}</strong> · {orderDate(order.createdAt)}</p></div>
        <button className="btn btn-outline btn-sm no-print" type="button" onClick={() => printSection(invoiceRef.current, 'invoice')}>Print / Save PDF</button>
      </div>
      <div className="invoice-meta">
        <div><strong>Bill to</strong><p>{order.customer?.name || '—'}<br />{order.customer?.email}<br />{order.customer?.phone}</p></div>
        <div><strong>{getFulfillmentMethod(order)}</strong><p>{getPaymentMethodLabel(order)}<br />Order status: {order.status}<br />{order.payment?.method === 'GCash' && `Payment verification: ${order.payment.verification || 'Pending Verification'}`}</p></div>
      </div>
      <div className="table-scroll"><table className="admin-table invoice-table"><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>
        {items.map((item, index) => <tr key={`${item.id}-${index}`}>
          <td><strong>{item.name}</strong>{item.stemList?.length > 0 && <p className="invoice-components">{item.stemList.map(s => `${s.name} × ${s.qty}`).join(' · ')}</p>}
            {typeof item.includeFillers === 'boolean' && <p className="invoice-components">{item.includeFillers ? 'Florist to add fillers as finishing touches' : 'No fillers requested'}</p>}</td>
          <td>{item.qty || 1}</td><td>{peso(item.price)}</td><td>{peso(Number(item.price || 0) * Number(item.qty || 1))}</td>
        </tr>)}
      </tbody></table></div>
      <div className="invoice-totals"><div><span>Subtotal</span><strong>{peso(subtotal)}</strong></div>{adjustment !== 0 && <div><span>Order adjustments</span><strong>{peso(adjustment)}</strong></div>}<div className="invoice-total"><span>Order total</span><strong>{peso(order.total)}</strong></div></div>
      {order.dedication && <p>Dedication: {order.dedication}</p>}
      <p className="text-muted">Thank you for choosing Blush Blooms. This invoice records your order; payment is confirmed separately.</p>
    </section>
  );
}
