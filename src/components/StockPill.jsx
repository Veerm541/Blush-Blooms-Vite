export default function StockPill({ stock }) {
  if (stock <= 0) return <span className="stock-pill out">Out of stock</span>;
  if (stock <= 5) return <span className="stock-pill low">Low stock · {stock}</span>;
  return <span className="stock-pill in">In stock · {stock}</span>;
}
