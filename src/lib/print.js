export function printSection(node, view) {
  if (!node) return;
  const documentCopy = document.createElement('div');
  documentCopy.className = 'print-document';
  documentCopy.append(node.cloneNode(true));
  document.body.append(documentCopy);
  document.body.dataset.printView = view;
  const cleanup = () => {
    documentCopy.remove();
    delete document.body.dataset.printView;
  };
  window.addEventListener('afterprint', cleanup, { once: true });
  try { window.print(); } catch (error) { cleanup(); throw error; }
}
