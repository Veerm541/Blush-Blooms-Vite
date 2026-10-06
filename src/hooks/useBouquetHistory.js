import { useCallback, useRef, useState } from 'react';
const clone = document => ({ ...document, elements: document.elements.map(item => ({ ...item })) });
export default function useBouquetHistory() {
  const [document, setDocument] = useState({ size: 'Medium', elements: [] });
  const documentRef = useRef(document); const history = useRef({ past: [], future: [] });
  const [, renderHistory] = useState(0);
  const live = useCallback(next => { const value = typeof next === 'function' ? next(documentRef.current) : next; documentRef.current = value; setDocument(value); }, []);
  const record = useCallback(before => { history.current.past.push(clone(before)); if (history.current.past.length > 80) history.current.past.shift(); history.current.future = []; renderHistory(n => n + 1); }, []);
  const commit = useCallback(next => { record(documentRef.current); live(next); }, [record, live]);
  const undo = useCallback(() => { const state = history.current; if (!state.past.length) return; state.future.push(clone(documentRef.current)); live(state.past.pop()); renderHistory(n => n + 1); }, [live]);
  const redo = useCallback(() => { const state = history.current; if (!state.future.length) return; state.past.push(clone(documentRef.current)); live(state.future.pop()); renderHistory(n => n + 1); }, [live]);
  return { document, documentRef, live, commit, record, undo, redo, canUndo: history.current.past.length > 0, canRedo: history.current.future.length > 0 };
}
