import { useState } from 'react';

export default function FaqItem({ question, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item fade-in visible${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)}>
        {question} <span className="faq-icon">+</span>
      </button>
      <div className="faq-a">{children}</div>
    </div>
  );
}
