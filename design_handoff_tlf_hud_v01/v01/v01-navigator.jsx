/* global React, Icon */
// =========================================================================
// TLF HUD v0.1 — Suite Navigator (brand-chip popover)
// --------------------------------------------------------------------------
// Opens when the user clicks the BRAND CHIP on the toolbar (NOT the
// Tactics chip — that opens the audit popout). Lists the surfaces of the
// TLF Suite and lets the user jump between them.
//
// Per the locked-decisions doc, surfaces in v0.1 scope:
//   - Tonberry Tactics (the gear-advice plugin — a real surface today)
//   - TLF HUD layout / tweaks (this plugin's own config)
//   - Linkshell · The Onion Eight (chat focus)
//   - About / Chronicle (Cork voice surface)
// Surfaces flagged "later" appear disabled with a tag.
// =========================================================================

const { useState, useEffect, useRef } = React;

const NAV_ITEMS = [
  {
    id: 'tactics',
    icon: 'sword',
    name: 'Tonberry Tactics',
    sub: 'Open the gear-audit window.',
    action: 'open-tactics',
    available: true,
  },
  {
    id: 'tweaks',
    icon: 'settings-2',
    name: 'TLF HUD · Layout & Tweaks',
    sub: 'Theme, accent, opacity, edit mode.',
    action: 'open-tweaks',
    available: true,
  },
  {
    id: 'linkshell',
    icon: 'message-circle',
    name: 'Linkshell · The Onion Eight',
    sub: 'Eight grumpy adventurers. Mostly vibing.',
    action: 'focus-linkshell',
    available: true,
  },
  {
    id: 'chronicle',
    icon: 'scroll-text',
    name: 'Chronicle · About TLF',
    sub: '"Wiping is for butts. Cry now, peel later."',
    action: 'open-about',
    available: true,
  },
  {
    id: 'playerframe',
    icon: 'shield',
    name: 'PlayerFrame · HP / MP / Limit',
    sub: 'Ships in v0.2. KH Bars stays installed until.',
    action: null,
    available: false,
    badge: 'v0.2',
  },
  {
    id: 'partylist',
    icon: 'users',
    name: 'Party · Target · Buffs',
    sub: 'Sequenced after PlayerFrame.',
    action: null,
    available: false,
    badge: 'v0.3+',
  },
];

function NavRow({ item, isActive, onClick }) {
  const disabled = !item.available;
  return (
    <button
      className={`tlf-nav-row ${disabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`}
      onClick={() => !disabled && onClick(item)}
      disabled={disabled}>
      <span className="icon">
        <Icon name={item.icon} size={18} />
      </span>
      <span className="text">
        <span className="name">{item.name}</span>
        <span className="sub">{item.sub}</span>
      </span>
      {item.badge
        ? <span className="badge">{item.badge}</span>
        : <span className="chev">›</span>}
    </button>
  );
}

function SuiteNavigator({ open, anchorRect, onClose, onAction, activeId }) {
  const ref = useRef(null);

  // Click outside / Esc to close
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-anchor="brand"]')) return;
      onClose && onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Position math (anchored below the brand chip)
  let wrapStyle = {};
  let arrowX = 30;
  const stage = document.querySelector('.stage');
  const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0, width: 1920 };
  const scale = stage ? stageRect.width / 1920 : 1;
  if (anchorRect) {
    const ax = (anchorRect.left - stageRect.left) / scale;
    const ay = (anchorRect.bottom - stageRect.top) / scale;
    const aw = anchorRect.width / scale;
    const popW = 320;
    let left = ax + aw / 2 - popW / 2;
    left = Math.max(12, Math.min(1920 - popW - 12, left));
    const top = ay + 14;
    wrapStyle = { left, top };
    arrowX = ax + aw / 2 - left - 7;
    arrowX = Math.max(14, Math.min(popW - 28, arrowX));
  } else {
    wrapStyle = { left: 60, top: 80 };
  }

  return (
    <div className="tlf-nav-wrap" style={wrapStyle}>
      <div ref={ref}
           className="tlf-nav"
           style={{ '--tlf-popout-arrow-x': `${arrowX}px` }}>
        <div className="tlf-nav-head">
          <img className="tlf-nav-wordmark"
               src="assets/wordmark.png"
               alt="Last Onion Knight"
               onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="tlf-nav-headtext">
            <span className="tlf-nav-eyebrow">TLF Suite</span>
            <span className="tlf-nav-title">Navigator</span>
          </div>
          <span className="tlf-nav-ver">v0.1.0</span>
        </div>

        <div className="tlf-nav-body">
          {NAV_ITEMS.map(item => (
            <NavRow key={item.id}
                    item={item}
                    isActive={item.id === activeId}
                    onClick={(it) => { onAction && onAction(it.action); }} />
          ))}
        </div>

        <div className="tlf-nav-foot">
          <span>Forged by Refia Rakkiri.</span>
          <span className="rune">« TLF »</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SuiteNavigator });
