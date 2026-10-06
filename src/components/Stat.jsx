import { useEffect, useRef, useState } from 'react';

// Counts up to `count` the first time it scrolls into view.
export default function Stat({ count, suffix = '' }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!('IntersectionObserver' in window)) { setValue(count); return; }
    let raf;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const tick = t => {
        start ??= t;
        const p = Math.min((t - start) / 1300, 1);
        setValue(Math.floor(p * count));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [count]);

  return <div className="stat-number" ref={ref}>{value.toLocaleString()}{suffix}</div>;
}
