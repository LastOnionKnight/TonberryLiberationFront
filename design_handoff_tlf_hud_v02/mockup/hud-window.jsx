/* global React */
// =========================================================================
// HudWindow — draggable + resizable wrapper for HUD panels
// Mimics FFXIV's /hudlayout: enter edit mode → drag and resize the panels →
// exit edit mode → positions saved to localStorage.
// =========================================================================

const { useEffect, useRef, useState, useCallback, createContext, useContext } = React;

const HudLayoutContext = createContext({
  editing: false,
  positions: {},
  setPos: () => {},
  reset: () => {},
});

const LS_KEY = 'onion-knight-hud-layout-v2';

function loadPositions() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}
function savePositions(p) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)); }
  catch {}
}

function HudLayoutProvider({ children }) {
  const [editing, setEditing] = useState(false);
  const [positions, setPositions] = useState(() => loadPositions());

  // Persist whenever positions change (debounced)
  const saveT = useRef(null);
  useEffect(() => {
    if (saveT.current) clearTimeout(saveT.current);
    saveT.current = setTimeout(() => savePositions(positions), 200);
  }, [positions]);

  const setPos = useCallback((id, patch) => {
    setPositions(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const reset = useCallback(() => {
    setPositions({});
    try { localStorage.removeItem(LS_KEY); } catch {}
  }, []);

  return (
    <HudLayoutContext.Provider value={{ editing, setEditing, positions, setPos, reset }}>
      {children}
    </HudLayoutContext.Provider>
  );
}

function useHudLayout() {
  return useContext(HudLayoutContext);
}

// ── HudWindow ────────────────────────────────────────────────────────────
// Renders an absolutely-positioned wrapper around its children. Position
// + size come from layout context if present, otherwise the supplied
// defaults. In edit mode the user can drag the body or grab the bottom-
// right corner to resize.
function HudWindow({
  id,
  label,
  defaults,
  minWidth = 120,
  minHeight = 80,
  lockAspect = false,
  children,
  style: extraStyle,
}) {
  const { editing, positions, setPos } = useHudLayout();
  const saved = positions[id] || {};
  const top    = saved.top    ?? defaults.top;
  const left   = saved.left   ?? defaults.left;
  const right  = saved.right  ?? defaults.right;
  const bottom = saved.bottom ?? defaults.bottom;
  const width  = saved.width  ?? defaults.width;
  const height = saved.height ?? defaults.height;

  const rootRef = useRef(null);
  const [drag, setDrag] = useState(null);     // {type, startX, startY, startTop, ...}

  // The stage scale factor — needed so screen mouse deltas convert correctly
  // into 1920×1080 design pixels.
  const stageScale = () => {
    const stage = document.querySelector('.stage');
    if (!stage) return 1;
    const rect = stage.getBoundingClientRect();
    return rect.width / 1920;
  };

  // ── Drag (move) ────────────────────────────────────────────────────────
  const onDragMouseDown = (e) => {
    if (!editing) return;
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = rootRef.current.getBoundingClientRect();
    const stage = document.querySelector('.stage').getBoundingClientRect();
    const startTop  = (rect.top  - stage.top)  / stageScale();
    const startLeft = (rect.left - stage.left) / stageScale();
    setDrag({
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      startTop, startLeft,
      currentTop: startTop, currentLeft: startLeft,
    });
  };

  // ── Resize ─────────────────────────────────────────────────────────────
  const onResizeMouseDown = (e) => {
    if (!editing) return;
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = rootRef.current.getBoundingClientRect();
    const s = stageScale();
    setDrag({
      type: 'resize',
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width / s,
      startH: rect.height / s,
      ratio: rect.width / rect.height,
      currentW: rect.width / s,
      currentH: rect.height / s,
    });
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const s = stageScale();
      const dx = (e.clientX - drag.startX) / s;
      const dy = (e.clientY - drag.startY) / s;
      if (drag.type === 'move') {
        const newTop  = Math.max(0, Math.min(1080 - 40, drag.startTop  + dy));
        const newLeft = Math.max(0, Math.min(1920 - 40, drag.startLeft + dx));
        // null right/bottom so left/top take over
        setPos(id, { top: newTop, left: newLeft, right: null, bottom: null });
      } else if (drag.type === 'resize') {
        let w = Math.max(minWidth,  drag.startW + dx);
        let h = Math.max(minHeight, drag.startH + dy);
        if (lockAspect) {
          // keep ratio from initial size
          if (Math.abs(dx) >= Math.abs(dy)) h = w / drag.ratio;
          else w = h * drag.ratio;
        }
        setPos(id, { width: Math.round(w), height: Math.round(h) });
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, id, setPos, minWidth, minHeight, lockAspect]);

  const wrapperStyle = {
    top:    top    != null ? top    : undefined,
    left:   left   != null ? left   : undefined,
    right:  right  != null ? right  : undefined,
    bottom: bottom != null ? bottom : undefined,
    width:  width  != null ? width  : undefined,
    height: height != null ? height : undefined,
    ...extraStyle,
  };

  return (
    <div
      ref={rootRef}
      className={`hud-window ${drag ? (drag.type === 'move' ? 'dragging' : 'resizing') : ''}`}
      data-window-id={id}
      style={wrapperStyle}
    >
      {children}
      {editing && (
        <React.Fragment>
          <div className="hud-window-label">{label || id}</div>
          <div className="hud-window-drag"   onMouseDown={onDragMouseDown}   title="Drag to move" />
          <div className="hud-window-resize" onMouseDown={onResizeMouseDown} title="Drag to resize" />
        </React.Fragment>
      )}
    </div>
  );
}

// ── Layout Toolbar (visible when editing) ─────────────────────────────────
function LayoutToolbar() {
  const { editing, setEditing, reset } = useHudLayout();
  if (!editing) return null;
  return (
    <div className="layout-toolbar">
      <span className="lt-title">HUD Layout</span>
      <button className="lt-btn" onClick={reset}>Reset</button>
      <button className="lt-btn primary" onClick={() => setEditing(false)}>Save &amp; Exit</button>
      <span className="lt-hint">Drag panels to move · drag corner to resize · changes save automatically</span>
    </div>
  );
}

// ── "Edit HUD" button — small chip pinned when not editing ───────────────
function HudEditButton() {
  const { editing, setEditing } = useHudLayout();
  if (editing) return null;
  return (
    <button className="hud-edit-btn" onClick={() => setEditing(true)} title="Edit HUD layout (move/resize panels)">
      ◇ Edit HUD
    </button>
  );
}

Object.assign(window, {
  HudLayoutProvider, useHudLayout, HudWindow, LayoutToolbar, HudEditButton,
});
