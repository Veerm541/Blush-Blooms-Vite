import { useEffect, useState } from 'react';

const ITEMS = [
  ['“The bouquet felt like a tiny garden delivered to our doorstep. My sister cried — the good kind.”', '— Mara, Quezon City'],
  ['“The customizer was so easy and fun. I built exactly the loose, blush-toned bouquet I had in mind.”', '— Dani, Makati'],
  ['“Beautiful flowers, thoughtful notes, and no stiff supermarket-bouquet feeling. I’m officially a regular.”', '— Anton, Pasig'],
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % ITEMS.length), 5200);
    return () => clearInterval(id);
  }, [index]);

  return (
    <div className="testimonial-wrap fade-in">
      <div className="testimonial-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {ITEMS.map(([quote, who]) => (
          <article className="testimonial" key={who}>
            <div className="quote">{quote}</div>
            <p className="text-muted">{who}</p>
          </article>
        ))}
      </div>
      <div className="slider-controls">
        {ITEMS.map((_, i) => (
          <button key={i} className="slider-dot" aria-label={`Slide ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
