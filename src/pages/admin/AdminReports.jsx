import { useRef, useState } from 'react';
import { StatusPill } from '../../components/Pills.jsx';
import useOrders from '../../hooks/useOrders.js';
import { ORDER_STATUSES, getFulfillmentMethod, getPaymentMethodLabel, peso } from '../../lib/format.js';
import { MONTHS, csvCell, filterOrders, orderDate, orderRevenue, salesOrders } from '../../lib/reports.js';
import { printSection } from '../../lib/print.js';

function Bars({ rows }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return <div className="report-bars">{rows.map(r => <div className="report-bar" key={r.label}><div className="bar-value">{r.display}</div><div className="bar" style={{ height: `${(r.value / max) * 100}%` }}></div><div className="bar-label">{r.label}</div></div>)}</div>;
}

export default function AdminReports() {
  const [orders] = useOrders();
  const currentYear = Number(orderDate(new Date()).slice(0, 4));
  const [year, setYear] = useState(String(Math.max(2026, currentYear)));
  const [month, setMonth] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const reportRef = useRef(null);
  const lastYear = Math.max(2026, currentYear, ...orders.map(o => Number(orderDate(o.createdAt).slice(0, 4)) || 2026));
  const years = Array.from({ length: lastYear - 2026 + 1 }, (_, i) => 2026 + i).reverse();
  const invalidRange = from && to && from > to;
  const filtered = invalidRange ? [] : filterOrders(orders, { year, month, from, to });
  const eligible = salesOrders(filtered);
  const revenue = orderRevenue(filtered);
  const average = eligible.length ? revenue / eligible.length : 0;
  const completed = filtered.filter(o => o.status === 'Completed').length;
  const completionRate = filtered.length ? Math.round((completed / filtered.length) * 100) : 0;
  const period = `${year === 'all' ? 'All years' : year} · ${month === 'all' ? 'All months' : MONTHS[Number(month) - 1]}${from || to ? ` · ${from || 'Start'} to ${to || 'Present'}` : ''}`;
  const byStatus = [...ORDER_STATUSES, 'Cancelled'].map(s => ({ label: s, value: filtered.filter(o => o.status === s).length, display: filtered.filter(o => o.status === s).length }));
  const byMethod = ['Cash on Pick-Up', 'Cash on Delivery', 'GCash'].map(m => {
    const value = orderRevenue(filtered.filter(o => getPaymentMethodLabel(o) === m));
    return { label: m, value, display: peso(value) };
  });
  const fulfillmentRows = ['Pickup', 'Delivery'].map(m => {
    const value = filtered.filter(o => getFulfillmentMethod(o) === m).length;
    return { label: m, value, display: value };
  });
  const monthly = MONTHS.map((name, i) => {
    const rows = filtered.filter(o => Number(orderDate(o.createdAt).slice(5, 7)) === i + 1);
    return { name, count: rows.length, revenue: orderRevenue(rows) };
  });

  const exportCSV = () => {
    const rows = [
      ['Order', 'Date (Asia/Manila)', 'Customer', 'Fulfillment', 'Payment', 'Total (PHP)', 'Status'],
      ...filtered.map(o => [o.id, orderDate(o.createdAt), o.customer?.name, getFulfillmentMethod(o), getPaymentMethodLabel(o), o.total, o.status]),
    ];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `blush-blooms-sales-${year}-${month}${from ? '-' + from : ''}${to ? '-' + to : ''}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="sales-report" ref={reportRef}>
      <div className="admin-topbar">
        <div><div className="admin-kicker">Business insights</div><h1>Sales &amp; reporting</h1><p>View a full year, a specific month, or exact dates. Dates use Philippine time.</p></div>
        <div className="report-actions no-print"><button className="btn btn-outline btn-sm" type="button" disabled={!!invalidRange} onClick={() => printSection(reportRef.current, 'report')}>Print report</button><button className="btn btn-dark btn-sm" type="button" disabled={!!invalidRange} onClick={exportCSV}>Export CSV</button></div>
      </div>
      <div className="report-filters admin-panel no-print">
        <div className="field"><label htmlFor="reportYear">Year</label><select id="reportYear" value={year} onChange={e => setYear(e.target.value)}><option value="all">All years</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
        <div className="field"><label htmlFor="reportMonth">Month</label><select id="reportMonth" value={month} onChange={e => setMonth(e.target.value)}><option value="all">All months</option>{MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}</select></div>
        <div className="field"><label htmlFor="reportFrom">From date (optional)</label><input id="reportFrom" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
        <div className="field"><label htmlFor="reportTo">To date (optional)</label><input id="reportTo" type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
        <button className="btn btn-outline btn-sm" type="button" onClick={() => { setYear('all'); setMonth('all'); setFrom(''); setTo(''); }}>Clear filters</button>
      </div>
      {invalidRange && <p className="form-error" role="alert">The end date must be on or after the start date.</p>}
      <p className="report-period" aria-live="polite">{period} · {filtered.length} orders</p>
      <div className="stat-grid">
        {[
          ['Total revenue', peso(revenue), 'Order value excluding cancelled orders'],
          ['Total orders', filtered.length, 'Orders in this period'],
          ['Average order value', peso(Math.round(average)), 'Excludes cancelled orders'],
          ['Completion rate', `${completionRate}%`, `${completed} completed orders`],
        ].map(([l, v, s]) => <div className="stat-card" key={l}><div className="stat-label">{l}</div><div className="stat-value">{v}</div><div className="stat-sub">{s}</div></div>)}
      </div>
      <div className="admin-panel monthly-sales-panel">
        <div className="admin-panel-head"><div><h2>Monthly sales</h2><p className="panel-subtitle">January–December · {year === 'all' ? 'combined selected years' : year}. Empty months show zero sales.</p></div></div>
        <div className="monthly-sales-grid">{monthly.map(m => <div className="monthly-sales-card" key={m.name}><strong>{m.name}</strong><span>{peso(m.revenue)}</span><small>{m.count} orders</small></div>)}</div>
      </div>
      <div className="report-grid">
        <div className="admin-panel"><div className="admin-panel-head"><h2>Orders by status</h2></div><Bars rows={byStatus} /></div>
        <div className="admin-panel"><div className="admin-panel-head"><h2>Revenue by payment</h2></div><Bars rows={byMethod} /></div>
        <div className="admin-panel"><div className="admin-panel-head"><h2>Fulfillment mix</h2></div><Bars rows={fulfillmentRows} /></div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head"><div><h2>Transaction history</h2><p className="panel-subtitle">{period}</p></div></div>
        <div className="table-scroll"><table className="admin-table"><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Fulfillment</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead><tbody>{filtered.length ? [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(o => <tr key={o.id}><td><strong>{o.id}</strong></td><td>{orderDate(o.createdAt)}</td><td>{o.customer?.name || '—'}</td><td><span className="method-pill">{getFulfillmentMethod(o)}</span></td><td>{getPaymentMethodLabel(o)}</td><td>{peso(o.total)}</td><td><StatusPill status={o.status} /></td></tr>) : <tr><td colSpan="7"><div className="admin-empty-state"><strong>No orders in this period.</strong><span>Choose another month, year, or date range.</span></div></td></tr>}</tbody></table></div>
      </div>
    </section>
  );
}
