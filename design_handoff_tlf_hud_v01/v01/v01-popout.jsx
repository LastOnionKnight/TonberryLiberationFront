/* global React, Icon, TLF_AUDIT_SCENARIOS */
// =========================================================================
// TLF HUD v0.1 — Tactics Popout
// --------------------------------------------------------------------------
// Anchored dropdown beneath the toolbar's Tactics chip (default).
// Variants (Tweak):
//   - click:    anchored dropdown (default v0.1)
//   - hover:    same dropdown but appears on chip hover; click pins it open
//   - floating: detached, draggable window with no arrow
//
// Refia/Grub-Grub voice rules:
//   - Severity color is on the finding itself (left border + icon color)
//   - Stab. / Stab? / Stab… is the SEPARATE annotation (right-side pill)
//   - Headlines stay factual, no Cork accent in error text
// =========================================================================

const { useState, useEffect, useRef } = React;

// ── Score ring (mini circular progress) ──────────────────────────────────
function ScoreRing({ score }) {
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const dash = score !== null ? (Math.max(0, Math.min(100, score)) / 100) * circ : 0;
  const color = score === null     ? 'var(--fr-fg-3)' :
                score >= 90        ? 'var(--hp-green)' :
                score >= 70        ? 'var(--ember-bright)' :
                                     'var(--sev-warning)';
  return (
    <div className="tlf-score-ring">
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius}
                fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="6" />
        {score !== null && (
          <circle cx="32" cy="32" r={radius}
                  fill="none" stroke={color} strokeWidth="6"
                  strokeDasharray={`${dash} ${circ}`}
                  strokeLinecap="butt"
                  transform="rotate(-90 32 32)" />
        )}
      </svg>
      <div className="tlf-score-ring-num">
        {score !== null ? score : '…'}
      </div>
    </div>
  );
}

// ── A single finding row ─────────────────────────────────────────────────
function Finding({ f }) {
  const iconName =
    f.severity === 'critical' ? 'alert-octagon' :
    f.severity === 'warning'  ? 'alert-triangle' :
                                'info';
  return (
    <div className="tlf-finding" data-sev={f.severity}>
      <div className="tlf-finding-head">
        <span className="icon"><Icon name={iconName} size={14} /></span>
        <span>{f.title}</span>
        <span className="tlf-finding-stab">{f.stab}</span>
      </div>
      <div className="tlf-finding-body">{f.body}</div>
    </div>
  );
}

// ── Popout body (used by both anchored + floating modes) ─────────────────
function PopoutInner({ audit, onOpenFull, useEmotePlaceholder }) {
  return (
    <>
      <div className="tlf-popout-body">
        <div className="tlf-score">
          <ScoreRing score={audit.score} />
          <div className="tlf-score-text">
            <div className="tlf-score-eyebrow">Audit Score</div>
            <div className="tlf-score-headline">{audit.headline}</div>
            <div className="tlf-score-quip">{audit.quip}</div>
          </div>
        </div>

        {audit.findings.length > 0
          ? audit.findings.map(f => <Finding key={f.id} f={f} />)
          : (
            <div className="tlf-empty">
              {useEmotePlaceholder
                ? <div className="placeholder">VIBE</div>
                : <img src="assets/tonberry/vibing-emote.gif" alt=""
                       onError={(e) => { e.currentTarget.style.display='none'; }} />}
              <div className="tlf-empty-h">No findings</div>
              <div className="tlf-empty-p">
                Grub-Grub finds nothing to stab. Your kit is in fine fettle —
                carry on, adventurer.
              </div>
            </div>
          )
        }
      </div>

      <div className="tlf-popout-foot">
        <span className="meta">
          Last audit · 2 min ago · ilvl 730 · Onion Knight (NIN)
        </span>
        <button className="tlf-btn" onClick={onOpenFull}>
          Open Full Audit ›
        </button>
      </div>
    </>
  );
}

// ── Anchored popout (default + hover modes) ──────────────────────────────
function TacticsPopout({
  open,
  mode,                 // 'click' | 'hover' | 'floating'
  anchorRect,
  audit,
  onClose,
  onOpenFull,
  floatPos,
  setFloatPos,
  useEmotePlaceholder,
}) {
  const popRef = useRef(null);
  const dragRef = useRef({ active: false, sx: 0, sy: 0, bx: 0, by: 0 });
  const [dragging, setDragging] = useState(false);

  // Click-outside to close (click/hover modes only)
  useEffect(() => {
    if (!open) return;
    if (mode === 'floating') return;
    const onDown = (e) => {
      if (!popRef.current) return;
      if (popRef.current.contains(e.target)) return;
      // Don't close if the click was on the anchor (let the chip toggle handle it)
      if (e.target.closest && e.target.closest('[data-anchor="tactics"]')) return;
      onClose && onClose();
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open, onClose, mode]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Drag for floating mode
  const onHeadPointerDown = (e) => {
    if (mode !== 'floating') return;
    if (e.target.closest('button')) return;
    dragRef.current = {
      active: true,
      sx: e.clientX, sy: e.clientY,
      bx: floatPos.x, by: floatPos.y,
    };
    setDragging(true);
    e.preventDefault();
  };
  useEffect(() => {
    if (mode !== 'floating') return;
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      const stage = document.querySelector('.stage');
      const stageRect = stage ? stage.getBoundingClientRect() : { width: 1920, height: 1080 };
      const scale = stage ? stageRect.width / 1920 : 1;
      const dx = (e.clientX - dragRef.current.sx) / scale;
      const dy = (e.clientY - dragRef.current.sy) / scale;
      const nx = Math.max(0, Math.min(1920 - 380, dragRef.current.bx + dx));
      const ny = Math.max(0, Math.min(1080 - 200, dragRef.current.by + dy));
      setFloatPos({ x: nx, y: ny });
    };
    const onUp = () => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        setDragging(false);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [mode, setFloatPos]);

  if (!open) return null;

  // Position math
  let wrapStyle = {};
  let arrowX = 30;
  if (mode === 'floating') {
    wrapStyle = { left: floatPos.x, top: floatPos.y };
  } else {
    // Anchored under the chip
    const stage = document.querySelector('.stage');
    const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0, width: 1920 };
    const scale = stage ? stageRect.width / 1920 : 1;
    if (anchorRect) {
      const ax = (anchorRect.left - stageRect.left) / scale;
      const ay = (anchorRect.bottom - stageRect.top) / scale;
      const aw = anchorRect.width / scale;
      const popW = 380;
      // Center popout under the chip; clamp to stage
      let left = ax + aw / 2 - popW / 2;
      left = Math.max(12, Math.min(1920 - popW - 12, left));
      const top = ay + 14;
      wrapStyle = { left, top };
      arrowX = ax + aw / 2 - left - 7;
      arrowX = Math.max(14, Math.min(popW - 28, arrowX));
    } else {
      wrapStyle = { left: 760, top: 80 };
    }
  }

  return (
    <div className="tlf-popout-wrap" style={wrapStyle}>
      <div
        ref={popRef}
        className={`tlf-popout ${dragging ? 'dragging' : ''}`}
        data-detached={mode === 'floating' ? 'true' : 'false'}
        style={{ '--tlf-popout-arrow-x': `${arrowX}px` }}>
        <div className="tlf-popout-head" onPointerDown={onHeadPointerDown}>
          {useEmotePlaceholder
            ? <span className="tlf-popout-mascot placeholder">STAB</span>
            : <img className="tlf-popout-mascot" src="assets/tonberry/stab-emote.gif" alt=""
                   onError={(e) => { e.currentTarget.style.display='none'; }} />}
          <div>
            <div className="tlf-popout-title">Tonberry Tactics</div>
            <div className="tlf-popout-sub">
              {mode === 'floating'
                ? 'Drag the header to move.'
                : '"Grub-Grub disapproves of guessing."'}
            </div>
          </div>
          <div className="tlf-popout-actions">
            <button className="tlf-popout-x" onClick={onClose} title="Close (Esc)">×</button>
          </div>
        </div>

        <PopoutInner audit={audit}
                     onOpenFull={onOpenFull}
                     useEmotePlaceholder={useEmotePlaceholder} />
      </div>
    </div>
  );
}

Object.assign(window, { TacticsPopout });
