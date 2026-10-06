import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import AssetPreview from '../components/AssetPreview.jsx';
import { peso } from '../lib/format.js';
import { CUSTOMIZER_PALETTES } from '../data/customizerAssets.js';
import useCatalog from '../hooks/useCatalog.js';
import { FLOWER_LIMITS, catalogArtwork, fitsBouquet, flowerCount } from '../lib/bouquet.js';

const SIZES = {
  Small: { guideWidth: '46%', guideHeight: '58%', title: 'Small', subtitle: `Up to ${FLOWER_LIMITS.Small} flowers` },
  Medium: { guideWidth: '64%', guideHeight: '72%', title: 'Medium', subtitle: `Up to ${FLOWER_LIMITS.Medium} flowers` },
  Large: { guideWidth: '82%', guideHeight: '84%', title: 'Large', subtitle: `Up to ${FLOWER_LIMITS.Large} flowers` },
};

const PALETTE_LABELS = {
  Wrapper: 'Wrappers',
  Flower: 'Flowers',
  Ribbon: 'Ribbons',
};

// Stacking order, back to front. The wrapper is split in two: its back sheets sit behind
// the flowers, its front fold sits in FRONT of the stems (like a real wrap). Inside one
// layer, newer items sit on top of older ones.
const LAYER = {
  wrapperBack: 0,
  Greenery: 1000,
  Filler: 2000,
  Flower: 3000,
  wrapperFront: 4000,
  Ribbon: 5000,
};

const SNAP_DISTANCE = 7;      // px: how close to a centre line before it "clicks" into place
const ROTATE_SNAP = 15;       // degrees
const ROTATE_SNAP_RANGE = 4;  // degrees
const MIN_SCALE = 0.3;
const MAX_SCALE = 3.5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const normalizeAngle = deg => ((((deg + 180) % 360) + 360) % 360) - 180;
const frontLayerOf = item => (item.type === 'Wrapper' ? LAYER.wrapperFront : LAYER[item.type] ?? LAYER.Flower);

export default function Customize() {
  const { addToCart, showToast } = useCart();
  const { assets } = useCatalog();
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const paletteRef = useRef(null);
  const uid = useRef(0);
  const drag = useRef(null);
  const elementsRef = useRef([]);
  const selectedIdsRef = useRef([]);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const clipboardRef = useRef([]);
  const pasteStepRef = useRef(0);
  const sizeRef = useRef('Medium');

  const [elements, setElements] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [size, setSize] = useState('Medium');
  const [guidesOn, setGuidesOn] = useState(true);
  const [guides, setGuides] = useState({ v: false, h: false });
  const [interacting, setInteracting] = useState(false);
  const [palette, setPalette] = useState('Wrapper');
  const [, setHistoryVersion] = useState(0);
  const [clipboardCount, setClipboardCount] = useState(0);
  const [includeFillers, setIncludeFillers] = useState(false);
  const [trayOpen, setTrayOpen] = useState(() => typeof window === 'undefined' || !window.matchMedia('(max-width: 900px)').matches);
  const [canvasScale, setCanvasScale] = useState(1);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const palettes = Object.fromEntries(Object.keys(PALETTE_LABELS).map(type => [type, assets.filter(asset => asset.type === type && asset.available)
    .map(asset => catalogArtwork(asset, CUSTOMIZER_PALETTES[type]?.find(base => base.id === asset.id)))]));

  useEffect(() => {
    const node = viewportRef.current;
    const observer = new ResizeObserver(() => setCanvasScale(node.clientWidth / 600));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);

  const sizeInfo = SIZES[size];
  const selected = selectedIds.length === 1 ? selectedIds[0] : null;
  const selectedElement = selected ? elements.find(item => item.uid === selected) || null : null;
  const selectedElements = elements.filter(item => selectedIds.includes(item.uid));
  const hasWrapper = elements.some(item => item.type === 'Wrapper');
  const canUndo = historyRef.current.length > 0;
  const canRedo = redoRef.current.length > 0;
  const flowers = flowerCount(elements);
  const capacity = FLOWER_LIMITS[size];
  const limitMessage = () => setNotice(`${sizeRef.current} bouquets allow up to ${FLOWER_LIMITS[sizeRef.current]} flowers. Remove a flower or choose a larger size.`);
  const changeSize = next => {
    if (!fitsBouquet(elementsRef.current, next)) {
      setNotice(`Remove flowers before choosing ${next}: its limit is ${FLOWER_LIMITS[next]}. Your bouquet has ${flowerCount(elementsRef.current)}.`);
      return;
    }
    sizeRef.current = next;
    setSize(next);
    setNotice('');
  };

  const total = elements.reduce((sum, item) => sum + item.price, 0);
  const counts = useMemo(() => {
    const map = elements.reduce((acc, item) => {
      const key = `${item.type}:${item.name}`;
      acc[key] = acc[key] || { name: item.name, type: item.type, qty: 0, total: 0 };
      acc[key].qty += 1;
      acc[key].total += item.price;
      return acc;
    }, {});
    const order = Object.keys(PALETTE_LABELS);
    return Object.values(map).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  }, [elements]);

  const canvasSize = () => {
    const node = canvasRef.current;
    return { W: node?.clientWidth || 600, H: node?.clientHeight || 600 };
  };

  // Pointer position relative to the canvas' own top-left (inside its border).
  const pointOnCanvas = event => {
    const node = canvasRef.current;
    const rect = node.getBoundingClientRect();
    const scale = rect.width / node.offsetWidth;
    return { x: (event.clientX - rect.left) / scale - node.clientLeft, y: (event.clientY - rect.top) / scale - node.clientTop };
  };

  const cloneElements = list => list.map(item => ({ ...item }));

  const pushHistory = useCallback((snapshot = elementsRef.current) => {
    historyRef.current.push(cloneElements(snapshot));
    if (historyRef.current.length > 80) historyRef.current.shift();
    redoRef.current = [];
    setHistoryVersion(value => value + 1);
  }, []);

  const update = useCallback((id, patch) => {
    setElements(list => list.map(item => (item.uid === id ? { ...item, ...patch } : item)));
  }, []);

  const removeItems = useCallback((ids, record = true) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    if (!idList.length) return;
    if (record) pushHistory();
    setElements(list => list.filter(item => !idList.includes(item.uid)));
    setSelectedIds(current => current.filter(id => !idList.includes(id)));
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (!historyRef.current.length) return;
    if (!fitsBouquet(historyRef.current.at(-1), sizeRef.current)) { limitMessage(); return; }
    const previous = historyRef.current.pop();
    redoRef.current.push(cloneElements(elementsRef.current));
    setElements(cloneElements(previous));
    setSelectedIds([]);
    setHistoryVersion(value => value + 1);
  }, []);

  const redo = useCallback(() => {
    if (!redoRef.current.length) return;
    if (!fitsBouquet(redoRef.current.at(-1), sizeRef.current)) { limitMessage(); return; }
    const next = redoRef.current.pop();
    historyRef.current.push(cloneElements(elementsRef.current));
    setElements(cloneElements(next));
    setSelectedIds([]);
    setHistoryVersion(value => value + 1);
  }, []);

  /* ---------------------------------------------------------------- *
   * Adding things
   * ---------------------------------------------------------------- */
  const makeElement = (data, cx, cy, overrides = {}) => ({
    uid: ++uid.current,
    id: data.id,
    name: data.name,
    type: data.type,
    price: data.price,
    image: data.image,
    imageBack: data.imageBack,
    svg: data.svg,
    svgBack: data.svgBack,
    w: data.width,
    h: data.height,
    cx,
    cy,
    scale: 1,
    rotation: 0,
    flipped: false,
    ...overrides,
  });

  // Finds a convenient open space for a newly tapped item instead of stacking
  // every new flower on the same centre point. It is intentionally deterministic:
  // the same arrangement produces the same next open spot.
  const spawnPoint = data => {
    const { W, H } = canvasSize();

    if (data.type === 'Wrapper') {
      const fit = clamp((W - 24) / data.width, 0.6, 1);
      return { cx: W / 2, cy: H - (data.height * fit) / 2 - 14, scale: fit, rotation: 0 };
    }

    const current = elementsRef.current;
    const wrap = current.find(item => item.type === 'Wrapper');

    // Ribbons naturally belong around the wrapper neck. If one is already there,
    // place the next ribbon beside it instead of directly on top of it.
    if (data.type === 'Ribbon' && wrap) {
      const wrapH = wrap.h * wrap.scale;
      const top = wrap.cy - wrapH / 2;
      const neckY = top + wrapH * 0.73;
      const ribbonOffsets = [0, -54, 54, -96, 96];
      const existingRibbons = current.filter(item => item.type === 'Ribbon');
      const bestOffset = ribbonOffsets
        .map(offset => ({
          offset,
          score: existingRibbons.reduce((score, item) => {
            const distance = Math.abs((wrap.cx + offset) - item.cx);
            return score + Math.max(0, 90 - distance);
          }, 0),
        }))
        .sort((a, b) => a.score - b.score)[0]?.offset ?? 0;
      return { cx: clamp(wrap.cx + bestOffset, 30, W - 30), cy: neckY - 6, scale: 1, rotation: 0 };
    }

    const candidates = [];

    if (wrap) {
      const wrapW = wrap.w * wrap.scale;
      const wrapH = wrap.h * wrap.scale;
      const top = wrap.cy - wrapH / 2;
      const neckY = top + wrapH * 0.73;
      const stemEndY = neckY - wrapH * 0.07;
      const xOffsets = [0, -0.11, 0.11, -0.22, 0.22, -0.32, 0.32, -0.4, 0.4];
      const yOffsets = [0, -36, 28, -72, 54];

      xOffsets.forEach(xRatio => {
        yOffsets.forEach(yOffset => {
          const cx = wrap.cx + wrapW * xRatio;
          const cy = stemEndY - data.height / 2 + yOffset;
          candidates.push({
            cx: clamp(cx, 20, W - 20),
            cy: clamp(cy, data.height * 0.18, H - 20),
            scale: 1,
            rotation: Math.round(xRatio * 38),
          });
        });
      });
    } else {
      // No wrapper yet: use the visible bouquet guide as the safe placement area.
      const ratios = size === 'Small'
        ? { w: 0.46, h: 0.58 }
        : size === 'Large'
          ? { w: 0.82, h: 0.84 }
          : { w: 0.64, h: 0.72 };
      const guideW = W * ratios.w;
      const guideH = H * ratios.h;
      const left = (W - guideW) / 2;
      const top = H - 18 - guideH;
      const xs = [0.5, 0.35, 0.65, 0.22, 0.78];
      const ys = [0.42, 0.28, 0.56, 0.18, 0.68];
      xs.forEach((xRatio, xi) => {
        ys.forEach((yRatio, yi) => {
          candidates.push({
            cx: left + guideW * xRatio,
            cy: top + guideH * yRatio,
            scale: 1,
            rotation: Math.round((xRatio - 0.5) * 24 + (yi - xi) * 1.5),
          });
        });
      });
    }

    const comparable = current.filter(item => item.type !== 'Wrapper' && item.type !== 'Ribbon');
    const headPoint = (item, candidate = false) => ({
      x: candidate ? item.cx : item.cx,
      y: item.cy - (item.h * (item.scale ?? 1)) * 0.28,
    });

    // Prefer the candidate whose visible flower head is furthest from existing heads.
    // A small centre bias keeps the bouquet cohesive instead of scattering items to edges.
    const scored = candidates.map(candidate => {
      const candidateItem = { ...candidate, h: data.height };
      const head = headPoint(candidateItem, true);
      const crowding = comparable.reduce((score, item) => {
        const other = headPoint(item);
        const distance = Math.hypot(head.x - other.x, head.y - other.y);
        return score + Math.max(0, 118 - distance) ** 2;
      }, 0);
      const centreBias = Math.abs(candidate.cx - W / 2) * 2.2 + Math.abs(candidate.cy - H * 0.42) * 0.35;
      return { ...candidate, score: crowding + centreBias };
    });

    return scored.sort((a, b) => a.score - b.score)[0] || { cx: W / 2, cy: H * 0.42, scale: 1, rotation: 0 };
  };

  const add = (data, dropPoint) => {
    const current = elementsRef.current;
    if (!Object.hasOwn(PALETTE_LABELS, data.type)) return;
    if (!fitsBouquet([...current, data], sizeRef.current)) { limitMessage(); return; }
    setNotice('');

    // One wrapper per bouquet: choosing another one swaps the wrapper design
    // while keeping all flowers in place.
    if (data.type === 'Wrapper') {
      const existing = current.find(item => item.type === 'Wrapper');
      if (existing) {
        pushHistory();
        update(existing.uid, {
          id: data.id, name: data.name, price: data.price, image: data.image, imageBack: data.imageBack,
          svg: data.svg, svgBack: data.svgBack, w: data.width, h: data.height,
        });
        setSelectedIds([existing.uid]);
        return;
      }
    }

    const spawn = spawnPoint(data);
    const { W, H } = canvasSize();
    const next = makeElement(
      data,
      dropPoint ? clamp(dropPoint.x, 0, W) : spawn.cx,
      dropPoint && data.type !== 'Wrapper' ? clamp(dropPoint.y, 0, H) : spawn.cy,
      { scale: spawn.scale, rotation: dropPoint && data.type !== 'Wrapper' ? 0 : spawn.rotation },
    );

    pushHistory();
    setElements(list => [...list, next]);
    setSelectedIds([next.uid]);
  };

  const onDrop = event => {
    event.preventDefault();
    try {
      const data = JSON.parse(event.dataTransfer.getData('text/plain'));
      const full = Object.values(palettes).flat().find(entry => entry.id === data.id);
      if (full) add(full, pointOnCanvas(event));
    } catch {
      // Ignore incomplete browser drag payloads.
    }
  };

  const itemBounds = item => {
    const width = item.w * item.scale;
    const height = item.h * item.scale;
    return {
      left: item.cx - width / 2,
      right: item.cx + width / 2,
      top: item.cy - height / 2,
      bottom: item.cy + height / 2,
    };
  };

  /* ---------------------------------------------------------------- *
   * Canva-style selection and direct manipulation.
   * - Drag empty canvas = box selection
   * - Shift + click = add/remove one item from the selection
   * - Drag a selected group = move the group together
   * - Corner handles = resize one item
   * - Top handle = rotate one item
   * ---------------------------------------------------------------- */
  const beginBoxSelection = event => {
    if (event.button !== 0) return;
    event.preventDefault();

    const startPoint = pointOnCanvas(event);
    const additive = event.shiftKey;
    const startingSelection = additive ? selectedIdsRef.current : [];
    let moved = false;

    if (!additive) setSelectedIds([]);
    setSelectionBox({ x: startPoint.x, y: startPoint.y, width: 0, height: 0 });

    const move = pointerEvent => {
      const point = pointOnCanvas(pointerEvent);
      if (Math.hypot(point.x - startPoint.x, point.y - startPoint.y) > 4) moved = true;
      setSelectionBox({
        x: Math.min(startPoint.x, point.x),
        y: Math.min(startPoint.y, point.y),
        width: Math.abs(point.x - startPoint.x),
        height: Math.abs(point.y - startPoint.y),
      });
    };

    const up = pointerEvent => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);

      if (moved) {
        const point = pointOnCanvas(pointerEvent);
        const box = {
          left: Math.min(startPoint.x, point.x),
          right: Math.max(startPoint.x, point.x),
          top: Math.min(startPoint.y, point.y),
          bottom: Math.max(startPoint.y, point.y),
        };
        const inside = elementsRef.current
          .filter(item => {
            const bounds = itemBounds(item);
            return bounds.right >= box.left && bounds.left <= box.right && bounds.bottom >= box.top && bounds.top <= box.bottom;
          })
          .map(item => item.uid);
        setSelectedIds(Array.from(new Set([...startingSelection, ...inside])));
      } else if (!additive) {
        setSelectedIds([]);
      }

      setSelectionBox(null);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const beginInteraction = (event, mode, item) => {
    event.preventDefault();
    event.stopPropagation();

    // Shift-click behaves like Canva: add/remove an object from the current selection.
    if (event.shiftKey && mode === 'move') {
      setSelectedIds(current => current.includes(item.uid)
        ? current.filter(id => id !== item.uid)
        : [...current, item.uid]);
      return;
    }

    const point = pointOnCanvas(event);
    const currentSelection = selectedIdsRef.current;
    const movingIds = mode === 'move' && currentSelection.includes(item.uid) && currentSelection.length > 1
      ? currentSelection
      : [item.uid];

    if (mode !== 'move' || !currentSelection.includes(item.uid)) setSelectedIds([item.uid]);

    const starts = Object.fromEntries(
      elementsRef.current
        .filter(entry => movingIds.includes(entry.uid))
        .map(entry => [entry.uid, { cx: entry.cx, cy: entry.cy }]),
    );

    drag.current = {
      mode,
      uid: item.uid,
      ids: movingIds,
      starts,
      before: cloneElements(elementsRef.current),
      startX: point.x,
      startY: point.y,
      offsetX: point.x - item.cx,
      offsetY: point.y - item.cy,
      startScale: item.scale,
      startDist: Math.max(12, Math.hypot(point.x - item.cx, point.y - item.cy)),
      cx: item.cx,
      cy: item.cy,
      moved: false,
      changed: false,
    };

    const move = pointerEvent => {
      const state = drag.current;
      if (!state) return;
      const p = pointOnCanvas(pointerEvent);
      const { W, H } = canvasSize();

      if (state.mode === 'move') {
        if (!state.moved && Math.hypot(p.x - state.startX, p.y - state.startY) < 2) return;
        state.moved = true;
        state.changed = true;
        setInteracting(true);

        const leaderStart = state.starts[state.uid];
        let nx = p.x - state.offsetX;
        let ny = p.y - state.offsetY;
        const nextGuides = { v: false, h: false };

        if (guidesOn) {
          if (Math.abs(nx - W / 2) < SNAP_DISTANCE) { nx = W / 2; nextGuides.v = true; }
          if (Math.abs(ny - H / 2) < SNAP_DISTANCE) { ny = H / 2; nextGuides.h = true; }
        }

        let dx = nx - leaderStart.cx;
        let dy = ny - leaderStart.cy;
        const startsList = Object.values(state.starts);
        dx = clamp(dx, Math.max(...startsList.map(start => -start.cx)), Math.min(...startsList.map(start => W - start.cx)));
        dy = clamp(dy, Math.max(...startsList.map(start => -start.cy)), Math.min(...startsList.map(start => H - start.cy)));

        setGuides(current => (current.v === nextGuides.v && current.h === nextGuides.h ? current : nextGuides));
        setElements(list => list.map(entry => state.ids.includes(entry.uid)
          ? { ...entry, cx: state.starts[entry.uid].cx + dx, cy: state.starts[entry.uid].cy + dy }
          : entry));
      } else if (state.mode === 'resize') {
        state.changed = true;
        setInteracting(true);
        const dist = Math.max(12, Math.hypot(p.x - state.cx, p.y - state.cy));
        update(state.uid, { scale: clamp(Number((state.startScale * (dist / state.startDist)).toFixed(3)), MIN_SCALE, MAX_SCALE) });
      } else if (state.mode === 'rotate') {
        state.changed = true;
        setInteracting(true);
        let angle = (Math.atan2(p.y - state.cy, p.x - state.cx) * 180) / Math.PI + 90;
        const nearest = Math.round(angle / ROTATE_SNAP) * ROTATE_SNAP;
        if (Math.abs(angle - nearest) <= ROTATE_SNAP_RANGE) angle = nearest;
        update(state.uid, { rotation: normalizeAngle(angle) });
      }
    };

    const up = () => {
      const state = drag.current;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      drag.current = null;
      setInteracting(false);
      setGuides({ v: false, h: false });
      if (state?.changed) pushHistory(state.before);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const copySelection = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (!ids.length) return;
    clipboardRef.current = elementsRef.current
      .filter(item => ids.includes(item.uid))
      .map(item => ({ ...item }));
    pasteStepRef.current = 0;
    setClipboardCount(clipboardRef.current.length);
  }, []);

  const pasteClipboard = useCallback(() => {
    const source = clipboardRef.current;
    if (!source.length) return;

    const existingHasWrapper = elementsRef.current.some(item => item.type === 'Wrapper');
    const pasteable = source.filter(item => !(item.type === 'Wrapper' && existingHasWrapper));
    if (!pasteable.length) return;
    if (!fitsBouquet([...elementsRef.current, ...pasteable], sizeRef.current)) { limitMessage(); return; }

    const { W, H } = canvasSize();
    pasteStepRef.current = (pasteStepRef.current % 5) + 1;
    let dx = 24 * pasteStepRef.current;
    let dy = 24 * pasteStepRef.current;

    const left = Math.min(...pasteable.map(item => itemBounds(item).left));
    const right = Math.max(...pasteable.map(item => itemBounds(item).right));
    const top = Math.min(...pasteable.map(item => itemBounds(item).top));
    const bottom = Math.max(...pasteable.map(item => itemBounds(item).bottom));
    if (right + dx > W) dx = Math.max(-left + 8, W - right - 8);
    if (bottom + dy > H) dy = Math.max(-top + 8, H - bottom - 8);

    const copies = pasteable.map(item => ({
      ...item,
      uid: ++uid.current,
      cx: clamp(item.cx + dx, 0, W),
      cy: clamp(item.cy + dy, 0, H),
    }));

    pushHistory();
    setElements(list => [...list, ...copies]);
    setSelectedIds(copies.map(item => item.uid));
  }, [pushHistory]);

  const duplicateSelection = () => {
    const ids = selectedIdsRef.current;
    if (!ids.length) return;
    const source = elementsRef.current.filter(item => ids.includes(item.uid) && item.type !== 'Wrapper');
    if (!source.length) return;
    if (!fitsBouquet([...elementsRef.current, ...source], sizeRef.current)) { limitMessage(); return; }
    const { W, H } = canvasSize();
    const copies = source.map(item => ({
      ...item,
      uid: ++uid.current,
      cx: clamp(item.cx + 26, 0, W),
      cy: clamp(item.cy + 26, 0, H),
    }));
    pushHistory();
    setElements(list => [...list, ...copies]);
    setSelectedIds(copies.map(item => item.uid));
  };

  const act = action => {
    const ids = selectedIdsRef.current;
    if (!ids.length) return;
    if (action === 'delete') { removeItems(ids); return; }
    if (action === 'duplicate') { duplicateSelection(); return; }

    pushHistory();
    setElements(list => list.map(item => {
      if (!ids.includes(item.uid)) return item;
      const patch = {
        'rotate-left': { rotation: normalizeAngle(item.rotation - 15) },
        'rotate-right': { rotation: normalizeAngle(item.rotation + 15) },
        'scale-up': { scale: clamp(Number((item.scale * 1.14).toFixed(3)), MIN_SCALE, MAX_SCALE) },
        'scale-down': { scale: clamp(Number((item.scale / 1.14).toFixed(3)), MIN_SCALE, MAX_SCALE) },
        flip: { flipped: !item.flipped },
      }[action];
      return patch ? { ...item, ...patch } : item;
    }));
  };

  // Keyboard shortcuts intentionally mirror familiar design tools.
  useEffect(() => {
    const onKey = event => {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable) return;

      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (modifier && key === 'c' && selectedIdsRef.current.length) {
        event.preventDefault();
        copySelection();
        return;
      }
      if (modifier && key === 'v' && clipboardRef.current.length) {
        event.preventDefault();
        pasteClipboard();
        return;
      }
      if (modifier && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
        return;
      }
      if (modifier && key === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (modifier && key === 'a' && elementsRef.current.length) {
        event.preventDefault();
        setSelectedIds(elementsRef.current.map(item => item.uid));
        return;
      }

      const ids = selectedIdsRef.current;
      if (!ids.length) return;

      const step = event.shiftKey ? 10 : 1;
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[event.key]) {
        event.preventDefault();
        pushHistory();
        const { W, H } = canvasSize();
        setElements(list => list.map(item => (ids.includes(item.uid)
          ? { ...item, cx: clamp(item.cx + moves[event.key][0], 0, W), cy: clamp(item.cy + moves[event.key][1], 0, H) }
          : item)));
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeItems(ids);
      } else if (event.key === 'Escape') {
        setSelectedIds([]);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [copySelection, pasteClipboard, pushHistory, redo, removeItems, undo]);

  const clearCanvas = () => {
    if (!elementsRef.current.length) return;
    pushHistory();
    setElements([]);
    setSelectedIds([]);
    setNotice('');
  };

  /* ---------------------------------------------------------------- *
   * Snapshot for the florist — drawn straight from the same artwork,
   * in the same stacking order the customer sees.
   * ---------------------------------------------------------------- */
  const renderSnapshot = async () => {
    const { W, H } = canvasSize();

    // Crop the picture to the bouquet itself (plus a little breathing room).
    let minX = W; let minY = H; let maxX = 0; let maxY = 0;
    elements.forEach(item => {
      const hw = (item.w * item.scale) / 2;
      const hh = (item.h * item.scale) / 2;
      const rad = (item.rotation * Math.PI) / 180;
      const ex = Math.abs(hw * Math.cos(rad)) + Math.abs(hh * Math.sin(rad));
      const ey = Math.abs(hw * Math.sin(rad)) + Math.abs(hh * Math.cos(rad));
      minX = Math.min(minX, item.cx - ex); maxX = Math.max(maxX, item.cx + ex);
      minY = Math.min(minY, item.cy - ey); maxY = Math.max(maxY, item.cy + ey);
    });
    const pad = 24;
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
    maxX = Math.min(W, maxX + pad); maxY = Math.min(H, maxY + pad);
    const cropW = Math.max(40, maxX - minX);
    const cropH = Math.max(40, maxY - minY);

    const ratio = 2;
    const out = document.createElement('canvas');
    out.width = Math.round(cropW * ratio);
    out.height = Math.round(cropH * ratio);
    const ctx = out.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.fillStyle = '#fbf3ee';
    ctx.fillRect(0, 0, cropW, cropH);
    ctx.translate(-minX, -minY);

    const layers = [];
    elements.forEach((item, index) => {
      if (item.type === 'Wrapper') {
        layers.push({ z: LAYER.wrapperBack + index, item, src: item.imageBack });
        layers.push({ z: LAYER.wrapperFront + index, item, src: item.image });
      } else {
        layers.push({ z: frontLayerOf(item) + index, item, src: item.image });
      }
    });
    layers.sort((a, b) => a.z - b.z);

    const load = src => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    for (const { item, src } of layers) {
      const img = await load(src);
      const width = item.w * item.scale;
      const height = item.h * item.scale;
      ctx.save();
      ctx.translate(item.cx, item.cy);
      ctx.rotate((item.rotation * Math.PI) / 180);
      if (item.flipped) ctx.scale(-1, 1);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.restore();
    }
    return out.toDataURL('image/png');
  };

  const save = async () => {
    if (saving) return;
    if (!fitsBouquet(elements, size)) { limitMessage(); return; }
    if (!elements.some(item => item.type === 'Flower')) {
      showToast('Please add at least one flower before adding the bouquet to your bag.');
      return;
    }

    setSelectedIds([]);
    setSaving(true);
    let snapshot = null;
    try {
      snapshot = await renderSnapshot();
    } catch {
      // Prototype can still save the order without a picture.
    }

    addToCart({
      id: `custom-${Date.now()}`,
      name: `Custom Bouquet (${size})`,
      price: total,
      image: snapshot || elements.find(item => item.type === 'Flower')?.image,
      size,
      includeFillers,
      stemList: counts.map(entry => ({ name: entry.name, type: entry.type, qty: entry.qty })),
      snapshot,
    });
    setSaving(false);
  };

  /* ---------------------------------------------------------------- *
   * Rendering helpers
   * ---------------------------------------------------------------- */
  const geometry = item => ({
    left: item.cx,
    top: item.cy,
    width: item.w * item.scale,
    height: item.h * item.scale,
    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
  });

  const art = (markup, item) => (
    <div
      className="cv-art"
      style={{ transform: item.flipped ? 'scaleX(-1)' : undefined }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );

  const renderItem = (item, index) => {
    const isSelected = selectedIds.includes(item.uid);
    const grab = event => beginInteraction(event, 'move', item);

    if (item.type === 'Wrapper') {
      return [
        <div key={`${item.uid}-back`} className="cv-item cv-wrapper-back" style={{ ...geometry(item), zIndex: LAYER.wrapperBack + index }} onPointerDown={grab}>
          {art(item.svgBack, item)}
        </div>,
        <div key={`${item.uid}-front`} className={`cv-item cv-wrapper-front${isSelected ? ' selected' : ''}`} style={{ ...geometry(item), zIndex: LAYER.wrapperFront + index }} onPointerDown={grab}>
          {art(item.svg, item)}
        </div>,
      ];
    }

    return (
      <div
        key={item.uid}
        className={`cv-item cv-${item.type.toLowerCase()}${isSelected ? ' selected' : ''}`}
        style={{ ...geometry(item), zIndex: frontLayerOf(item) + index }}
        onPointerDown={grab}
        aria-label={item.name}
      >
        {art(item.svg, item)}
      </div>
    );
  };

  const multiSelectionBounds = selectedElements.length > 1
    ? {
        left: Math.min(...selectedElements.map(item => itemBounds(item).left)),
        top: Math.min(...selectedElements.map(item => itemBounds(item).top)),
        right: Math.max(...selectedElements.map(item => itemBounds(item).right)),
        bottom: Math.max(...selectedElements.map(item => itemBounds(item).bottom)),
      }
    : null;

  const sortedCheck = [
    ['Wrapper', 'Wrapper added'],
    ['Flower', 'Flower added'],
    ['Ribbon', 'Ribbon added'],
  ];

  return (
    <>
      <section className="page-hero customizer-hero">
        <div className="container fade-in">
          <div className="eyebrow">Make your own bouquet</div>
          <h1>Build your bloom.</h1>
          <p>Pick a wrapper first, then add your flowers. Drag anything to move it.</p>
        </div>
      </section>

      <section className="customizer-help-wrap">
        <div className="container customizer-guidance">
          <details className="customizer-quick-guide">
            <summary>How to build your bouquet</summary>
            <ol><li>Choose a size and open a parts category. Tap a wrapper, flowers, and a ribbon to add them.</li><li>Tap a piece to select it. Drag it to move; use the handles or buttons to resize, rotate, and flip.</li><li>Choose whether the florist should add fillers. Review your summary and add the bouquet to your bag.</li></ol>
            <p>Computer shortcuts: Ctrl/Cmd+C to copy, V to paste, Z to undo. Drag an empty area to select multiple pieces.</p>
          </details>
          <details className="customizer-season-note">
            <summary>Seasonal flower availability</summary>
            <p>Real flowers may vary in shape and color. If a flower is unavailable, the florist will suggest a similar one. Your design is a visual guide for the final bouquet.</p>
          </details>
        </div>
      </section>

      <section className="section customizer-section">
        <div className={`container builder customizer-builder${selectedIds.length ? ' has-selection' : ''}${trayOpen ? ' tray-open' : ''}`}>
          <aside className={`palette customizer-palette${trayOpen ? ' is-open' : ''}`} ref={paletteRef}>
            <div className="parts-tray-heading"><div><div className="eyebrow">Step 1</div><h3>Pick your parts</h3></div><button className="parts-toggle" type="button" aria-expanded={trayOpen} aria-controls="bouquetParts" onClick={() => setTrayOpen(open => !open)}>{trayOpen ? 'Close parts' : 'Open parts'} <span aria-hidden="true">{trayOpen ? '⌄' : '⌃'}</span></button></div>
            <p className="customizer-readable-copy">Tap an item to place it in the bouquet. On a computer, you can also drag it into the middle.</p>

            <div className="palette-tabs customizer-tabs" role="tablist" aria-label="Bouquet parts">
              {Object.keys(PALETTE_LABELS).map(key => (
                <button
                  key={key}
                  type="button"
                  className={palette === key ? 'active' : ''}
                  onClick={() => { setPalette(key); setTrayOpen(true); }}
                  role="tab" aria-controls="bouquetParts" aria-selected={palette === key}
                >
                  {PALETTE_LABELS[key]}
                  {elements.some(e => e.type === key) && <span className="tab-count">{elements.filter(e => e.type === key).length}</span>}
                </button>
              ))}
            </div>

            <div id="bouquetParts" className="flower-list customizer-item-list" role="tabpanel" aria-label={PALETTE_LABELS[palette]} hidden={!trayOpen}>
              {palettes[palette].map(item => {
                const used = item.type === 'Wrapper'
                  ? elements.some(e => e.type === 'Wrapper' && e.id === item.id) ? 1 : 0
                  : elements.filter(e => e.id === item.id).length;
                return (
                <button
                  key={item.id}
                  type="button"
                  className={`flower-token customizer-item-card${used ? ' is-used' : ''}`}
                  disabled={item.type === 'Flower' && flowers >= capacity}
                  draggable
                  onDragStart={event => event.dataTransfer.setData('text/plain', JSON.stringify({ id: item.id }))}
                  onClick={() => add(item)}
                >
                  {used > 0 && <span className="item-badge">{item.type === 'Wrapper' ? 'In use' : `× ${used}`}</span>}
                  <span className="customizer-item-visual"><AssetPreview art={item} label="" /></span>
                  <span className="customizer-item-name">{item.name}</span>
                  <span className="customizer-item-meta">
                    {peso(item.price)} · {item.type === 'Flower' && flowers >= capacity ? 'Limit reached' : item.type === 'Wrapper' && hasWrapper ? 'Tap to switch' : 'Tap to add'}
                  </span>
                </button>
                );
              })}
              {!palettes[palette].length && <p className="text-muted">No {PALETTE_LABELS[palette].toLowerCase()} available at the moment.</p>}
            </div>
          </aside>

          <section className="builder-preview customizer-workspace">
            <div className="canvas-toolbar customizer-canvas-toolbar">
              <div>
                <div className="eyebrow" style={{ margin: 0 }}>Step 2</div>
                <h3 className="canvas-title">Arrange your bouquet</h3>
              </div>

              <div className="customizer-top-controls">
                <label className="snap-toggle customizer-snap-toggle">
                  <input type="checkbox" checked={guidesOn} onChange={event => setGuidesOn(event.target.checked)} />
                  Show size guide
                </label>
              </div>
            </div>

            <div className="size-choice-block">
              <div className="size-choice-copy">
                <strong>Bouquet size</strong>
                <span>Size sets your flower limit. Wrappers and ribbons do not count toward it.</span>
              </div>
              <div className="size-presets customizer-size-presets" role="group" aria-label="Bouquet size">
                {Object.entries(SIZES).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    className={`size-btn customizer-size-btn${size === key ? ' active' : ''}`}
                    aria-pressed={size === key}
                    onClick={() => changeSize(key)}
                  >
                    <strong>{info.title}</strong>
                    <span>{info.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

                <div className="customizer-edit-tools" aria-label="Canvas edit controls">
                  <button type="button" aria-label="Undo" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">↶ <span>Undo</span></button>
                  <button type="button" aria-label="Redo" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">↷ <span>Redo</span></button>
                  <button type="button" aria-label="Copy" onClick={copySelection} disabled={!selectedIds.length} title="Copy selected (Ctrl+C)">⧉ <span>Copy</span></button>
                  <button type="button" aria-label="Paste" onClick={pasteClipboard} disabled={!clipboardCount} title="Paste (Ctrl+V)">▣ <span>Paste</span></button>
                  <button type="button" aria-label="Clear" className="clear-tool" onClick={clearCanvas} disabled={!elements.length} title="Clear all objects">× <span>Clear</span></button>
                </div>
            <div className="selection-bar" aria-live="polite">
              <div className="selection-head">
                <span className={`selection-name${selectedIds.length ? ' has-selection' : ''}`}>
                  {selectedElement
                    ? <>Editing <strong>{selectedElement.name}</strong></>
                    : selectedElements.length > 1
                      ? <><strong>{selectedElements.length} items</strong> selected</>
                      : 'Tap a piece on the canvas to edit it'}
                </span>
                {selectedIds.length > 0 && <button type="button" className="selection-done" onClick={() => setSelectedIds([])}>Done</button>}
              </div>
              <div className="customizer-action-toolbar" role="group" aria-label="Edit selected piece">
                <button type="button" disabled={!selectedIds.length} onClick={() => act('scale-down')}><span aria-hidden="true">−</span>Smaller</button>
                <button type="button" disabled={!selectedIds.length} onClick={() => act('scale-up')}><span aria-hidden="true">＋</span>Bigger</button>
                <button type="button" disabled={!selectedIds.length} onClick={() => act('rotate-left')}><span aria-hidden="true">↶</span>Turn left</button>
                <button type="button" disabled={!selectedIds.length} onClick={() => act('rotate-right')}><span aria-hidden="true">↷</span>Turn right</button>
                <button type="button" disabled={!selectedIds.length} onClick={() => act('flip')}><span aria-hidden="true">⇄</span>Flip</button>
                <button
                  type="button"
                  onClick={() => act('duplicate')}
                  disabled={!selectedIds.length || selectedElements.every(item => item.type === 'Wrapper')}
                  title={selectedElements.length > 0 && selectedElements.every(item => item.type === 'Wrapper') ? 'A bouquet has one wrapper' : 'Duplicate selected item(s)'}
                ><span aria-hidden="true">⧉</span>Duplicate</button>
                <button type="button" className="danger" disabled={!selectedIds.length} onClick={() => act('delete')}><span aria-hidden="true">×</span>Remove</button>
              </div>
            </div>
            <div className="canvas-status-row"><span className={flowers >= capacity ? 'flower-count at-limit' : 'flower-count'} aria-live="polite">{flowers} / {capacity} flowers</span><span>Tap to select · drag to arrange</span></div>
            {notice && <div className="canvas-notice" role="alert">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
            <div className="canvas-viewport" ref={viewportRef}>
            <div
              className={`canvas customizer-canvas${interacting ? ' is-interacting' : ''}`}
              ref={canvasRef}
              style={{ transform: `scale(${canvasScale})`, '--canvas-scale': canvasScale }}
              role="region"
              aria-label="Bouquet design canvas"
              onPointerDown={beginBoxSelection}
              onDragOver={event => event.preventDefault()}
              onDrop={onDrop}
            >
              {guidesOn && <div
                className="bouquet-size-guide"
                style={{ '--guide-width': sizeInfo.guideWidth, '--guide-height': sizeInfo.guideHeight }}
                aria-hidden="true"
              >
                <span>{size} bouquet area</span>
              </div>}

              {guides.v && <div className="cv-guide cv-guide-v" aria-hidden="true" />}
              {guides.h && <div className="cv-guide cv-guide-h" aria-hidden="true" />}

              <div className="drop-hint" hidden={elements.length > 0}>
                <div>
                  <strong>Your bouquet starts here</strong>
                  <p>Choose a wrapper from the bouquet parts tray.</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onPointerDown={event => event.stopPropagation()}
                    disabled={!palettes.Wrapper.length}
                    onClick={() => { setPalette('Wrapper'); setTrayOpen(true); if (palettes.Wrapper[0]) add(palettes.Wrapper[0]); }}
                  >
                    Start with a wrapper
                  </button>
                </div>
              </div>

              {elements.map(renderItem)}

              {selectionBox && (
                <div
                  className="cv-box-selection"
                  style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height }}
                  aria-hidden="true"
                />
              )}

              {selectedElement && (
                <div
                  className="cv-selection"
                  style={{ ...geometry(selectedElement), zIndex: 9000 }}
                  role="group"
                  aria-label={`${selectedElement.name} selected`}
                >
                  {['tl', 'tr', 'bl', 'br'].map(corner => (
                    <span
                      key={corner}
                      className={`cv-handle cv-handle-${corner}`}
                      onPointerDown={event => beginInteraction(event, 'resize', selectedElement)}
                    />
                  ))}
                  <span className="cv-rotate-stem" />
                  <span className="cv-handle cv-handle-rotate" onPointerDown={event => beginInteraction(event, 'rotate', selectedElement)} />
                  <button
                    type="button"
                    className="cv-move-handle"
                    style={{ transform: `translate(-50%, 0) rotate(${-selectedElement.rotation}deg)` }}
                    onPointerDown={event => beginInteraction(event, 'move', selectedElement)}
                    title={`Drag ${selectedElement.name} to move it`}
                    aria-label={`Drag ${selectedElement.name} to move it`}
                  >
                    <span aria-hidden="true">⠿</span>
                    Drag to move
                  </button>
                </div>
              )}

              {multiSelectionBounds && (
                <div
                  className="cv-selection cv-selection-group"
                  style={{
                    left: multiSelectionBounds.left,
                    top: multiSelectionBounds.top,
                    width: multiSelectionBounds.right - multiSelectionBounds.left,
                    height: multiSelectionBounds.bottom - multiSelectionBounds.top,
                    zIndex: 9000,
                  }}
                  role="group"
                  aria-label={`${selectedElements.length} bouquet items selected`}
                >
                  <span className="cv-group-label">{selectedElements.length} items selected</span>
                  <button
                    type="button"
                    className="cv-move-handle cv-move-handle-group"
                    onPointerDown={event => beginInteraction(event, 'move', selectedElements[0])}
                    title="Drag the selected items together"
                    aria-label="Drag the selected items together"
                  >
                    <span aria-hidden="true">⠿</span>
                    Drag selected
                  </button>
                </div>
              )}
            </div>

            </div>
            <button className="mobile-browse-parts btn btn-outline" type="button" onClick={() => { setTrayOpen(true); requestAnimationFrame(() => paletteRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })); }}>Open bouquet parts</button>
          </section>

          <aside id="bouquetSummary" className="builder-summary customizer-summary">
            <div className="eyebrow">Step 3</div>
            <h3>Review &amp; order</h3>
            <div className="summary-size-row"><span>Size</span><strong>{size}</strong></div>

            <div className="builder-items customizer-summary-items">
              {elements.length === 0 ? (
                <p className="text-muted">Nothing added yet.</p>
              ) : (
                counts.map(entry => (
                  <div className="summary-line" key={`${entry.type}-${entry.name}`}>
                    <span><small className="summary-type">{PALETTE_LABELS[entry.type] || entry.type}</small>{entry.name} × {entry.qty}</span>
                    <span>{peso(entry.total)}</span>
                  </div>
                ))
              )}
            </div>

            <fieldset className="filler-preference"><legend>Would you like fillers in your bouquet?</legend><p>The florist will choose and add the final filler touches. You do not need to arrange them on the canvas.</p><div className="filler-options"><button type="button" aria-pressed={includeFillers} className={includeFillers ? 'active' : ''} onClick={() => setIncludeFillers(true)}>Yes, add fillers</button><button type="button" aria-pressed={!includeFillers} className={!includeFillers ? 'active' : ''} onClick={() => setIncludeFillers(false)}>No fillers</button></div></fieldset>
            <div className="summary-line customizer-total"><span>Total</span><span className="builder-total">{peso(total)}</span></div>

            <div className="builder-requirements customizer-checklist">
              {sortedCheck.map(([type, label]) => (
                <span key={type} className={elements.some(item => item.type === type) ? 'done' : ''}>{label}</span>
              ))}
            </div>

            <div className="customizer-summary-actions">
              <button className="btn btn-dark save-bouquet" type="button" disabled={saving || !flowers} onClick={save}>{saving ? 'Saving bouquet…' : 'Add bouquet to bag'}</button>
              <button className="btn btn-outline clear-bouquet" type="button" onClick={clearCanvas}>Clear everything</button>
            </div>
          </aside>
        </div>
      </section>

      <div className="customizer-mobile-bar" role="region" aria-label="Bouquet total">
        <div><strong>{peso(total)}</strong><span>{flowers} / {capacity} flowers · {size}</span></div>
        <button className="btn btn-dark" type="button" disabled={!flowers} onClick={() => document.getElementById('bouquetSummary')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Review &amp; add</button>
      </div>
    </>
  );
}
