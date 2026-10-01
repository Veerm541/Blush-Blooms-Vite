import { useEffect, useState } from 'react';

export const readJSON = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => readJSON(key, initial));
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}
