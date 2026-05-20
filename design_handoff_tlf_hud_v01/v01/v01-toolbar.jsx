/* global React, TLF_WORLD, TLF_TACTICS_VOICE, TLF_BRAND_VOICE */
// =========================================================================
// TLF HUD v0.1 — Toolbar (compact pill, drag-anywhere)
// --------------------------------------------------------------------------
// v0.1 spec departure from v2's full-width toolbar:
//   - Default shape is a COMPACT PILL, default top-center, drag anywhere.
//   - Shape can be overridden via Tweak: pill / full / edge-top / edge-bottom.
//   - The audit-state widget (Tactics chip) is the focal click target —
//     it opens the Tactics Popout as an anchored dropdown.
//   - Edit mode: a visible drag handle appears on the left edge plus a
//     dashed/solid/tinted outline (selectable via Tweak).
// =========================================================================

const { useState, useEffect, useRef, useLayoutEffect } = React;

// ── Lucide icon helper ───────────────────────────────────────────────────
function Icon({ name, size = 16, color }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const i = document.createElement('i');
      i.setAttribute('data-lucide', name);
      ref.current.appendChild(i);
      window.lucide.createIcons({ icons: window.lucide.icons, attrs: { width: size, height: size, stroke: color || 'currentColor' } });
    }
  }, [name, size, color]);
  return <span ref={ref} style={{ display: 'inline-grid', placeItems: 'center', width: size, height: size, color: color || 'inherit' }} />;
}

// ── Clock (Eorzea Time + Local Time) ─────────────────────────────────────
function useTLFClock() {
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const factor = (24 * 60) / 70;
  const etSec = Math.floor((tick / 1000) * factor) % (24 * 3600);
  const h = Math.floor(etSec / 3600);
  const m = Math.floor((etSec % 3600) / 60);
  const lt = new Date(tick);
  return {
    et: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
    lt: `${String(lt.getHours()).padStart(2,'0')}:${String(lt.getMinutes()).padStart(2,'0')}`,
    etHour: h,
  };
}

// ── Tooltip (anchored below widget) ──────────────────────────────────────
function TlfTooltip({ rect, title, lines, quip }) {
  if (!rect) return null;
  const stage = document.querySelector('.stage');
  if (!stage) return null;
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / 1920;
  const x = (rect.left - stageRect.left) / scale + (rect.width / scale) / 2;
  const y = (rect.bottom - stageRect.top) / scale + 10;
  return (
    <div className="tlf-tooltip" style={{
      left: x,
      top: y,
      transform: 'translateX(-50%)',
    }}>
      <div className="tlf-tooltip-title">{title}</div>
      {lines && lines.map((l, i) => <div key={i} className="tlf-tooltip-line">{l}</div>)}
      {quip && <div className="tlf-tooltip-quip">{quip}</div>}
    </div>
  );
}

// ── Widget chip ──────────────────────────────────────────────────────────
function Widget({ lucide, label, value, accent, onClick, onHover, tooltipTitle, tooltipLines, tooltipQuip }) {
  const enter = (e) => onHover && onHover({
    title: tooltipTitle || label,
    lines: tooltipLines || [`${label}: ${value}`],
    quip: tooltipQuip,
    rect: e.currentTarget.getBoundingClientRect(),
  });
  const leave = () => onHover && onHover(null);
  return (
    <button className="tlf-widget"
            onMouseEnter={enter}
            onMouseLeave={leave}
            onClick={onClick}
            style={accent ? { borderColor: accent } : null}>
      {lucide && <span className="tlf-widget-icon" style={accent ? { color: accent } : null}>
        <Icon name={lucide} size={16} />
      </span>}
      <span className="tlf-widget-text">
        <span className="tlf-widget-label">{label}</span>
        <span className="tlf-widget-value" style={accent ? { color: accent } : null}>{value}</span>
      </span>
    </button>
  );
}

function Divider() { return <span className="tlf-divider" />; }

// ── Brand chip ───────────────────────────────────────────────────────────
function BrandChip({ onClick, onHover, isOpen, runeEnabled = true }) {
  const enter = (e) => onHover && onHover({
    title: TLF_BRAND_VOICE.brandTitle,
    lines: TLF_BRAND_VOICE.brandLines,
    quip: TLF_BRAND_VOICE.brandQuip,
    rect: e.currentTarget.getBoundingClientRect(),
  });
  const leave = () => onHover && onHover(null);
  return (
    <button className={`tlf-brand ${isOpen ? 'open' : ''}`}
            data-anchor="brand"
            onClick={onClick}
            onMouseEnter={enter}
            onMouseLeave={leave}>
      <img src="assets/helm-avatar.png" alt="" className="tlf-brand-helm" />
      <span className="tlf-brand-text">
        <span className="tlf-brand-l1">TONBERRY</span>
        <span className="tlf-brand-l2">LIBERATION FRONT</span>
      </span>
      {runeEnabled && <span className="tlf-brand-rune">« TLF »</span>}
    </button>
  );
}

// ── Tactics chip — the focal audit widget ────────────────────────────────
function TacticsChip({ score, issuesCount, severity, isOpen, onClick, onHover, useEmotePlaceholder, popoutMode }) {
  const buttonRef = useRef(null);
  const voice = TLF_TACTICS_VOICE[severity];
  const stateClass = severity === 'critical' ? '' :
                     severity === 'warning'  ? 'has-warning' :
                                               'all-clear';
  // Hover-mode preview firing
  const enter = (e) => {
    onHover && onHover({
      title: 'Tonberry Tactics · Gear Audit',
      lines: [
        score !== null ? `Audit score: ${score} / 100` : 'Auditing your equipped gear…',
        issuesCount > 0
          ? `${issuesCount} ${issuesCount === 1 ? 'issue needs' : 'issues need'} attention.`
          : 'No findings. All clear.',
        popoutMode === 'click' ? 'Click to open the full audit.' :
        popoutMode === 'hover' ? 'Already showing below. Click to pin.' :
                                 'Click to open the floating audit window.',
      ],
      quip: voice.tooltipQuip,
      rect: e.currentTarget.getBoundingClientRect(),
    });
  };
  const leave = () => onHover && onHover(null);
  return (
    <button
      ref={buttonRef}
      className={`tlf-widget tlf-tactics ${stateClass} ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      onMouseEnter={enter}
      onMouseLeave={leave}
      data-anchor="tactics">
      {useEmotePlaceholder
        ? <span className="tlf-tactics-mascot placeholder">STAB</span>
        : <img src="assets/tonberry/stab-emote.gif" alt="" className="tlf-tactics-mascot"
               onError={(e) => { e.currentTarget.style.display='none'; }} />}
      <span className="tlf-widget-text">
        <span className="tlf-widget-label">Tactics</span>
        <span className="tlf-widget-value" style={{
          color: severity === 'ok' ? 'var(--hp-green)' :
                 severity === 'warning' ? 'var(--sev-warning)' :
                                          'var(--ember-bright)',
        }}>
          {score !== null ? `${score} / 100` : '— / —'}
        </span>
        <span className="tlf-tactics-voice" data-tone={voice.tone}>{voice.voice}</span>
      </span>
      {issuesCount > 0 && (
        <span className="tlf-tactics-pip"
              data-severity={severity}>
          {issuesCount}
        </span>
      )}
    </button>
  );
}

// ── Toolbar — draggable container ────────────────────────────────────────
function TlfToolbar({
  position,
  setPosition,
  shape,
  opacity,
  editMode,
  tacticsOpen,
  onToggleTactics,
  onHoverTactics,        // for hover-preview mode
  popoutMode,
  audit,
  emotePlaceholder,
  navigatorOpen,
  onToggleNavigator,
}) {
  const ref = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const [dragging, setDragging] = useState(false);
  const [tip, setTip] = useState(null);
  const clock = useTLFClock();

  // Drag handling — works whether in edit mode or not for "pill" shape.
  // For full/edge shapes, position is locked to the edge.
  const draggable = editMode && (shape === 'pill');

  const onPointerDown = (e) => {
    if (!draggable) return;
    // Allow drag from anywhere on the toolbar EXCEPT the tactics chip / brand /
    // widget buttons themselves (those should still click). Use the toolbar's
    // own pointerdown but ignore the chip's pointerdown via the event target.
    if (e.target.closest('button')) return;
    if (!ref.current) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: position.x,
      baseY: position.y,
    };
    setDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!draggable) return;
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      const stage = document.querySelector('.stage');
      const stageRect = stage ? stage.getBoundingClientRect() : { width: 1920, height: 1080 };
      const scale = stage ? stageRect.width / 1920 : 1;
      const dx = (e.clientX - dragRef.current.startX) / scale;
      const dy = (e.clientY - dragRef.current.startY) / scale;
      const nx = Math.max(0, Math.min(1920 - 100, dragRef.current.baseX + dx));
      const ny = Math.max(0, Math.min(1080 - 50, dragRef.current.baseY + dy));
      setPosition({ x: nx, y: ny });
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
  }, [draggable, setPosition]);

  // Hover-mode for popout
  const handleTacticsHover = (info) => {
    if (popoutMode === 'hover') {
      onHoverTactics && onHoverTactics(info ? true : false);
    }
    setTip(info);
  };

  // Position styles — pill follows position, others are locked
  let positionStyle = {};
  if (shape === 'pill') {
    positionStyle = {
      left: position.x,
      top: position.y,
    };
  } else if (shape === 'full' || shape === 'edge-top') {
    positionStyle = { left: 0, right: 0, top: 0 };
  } else if (shape === 'edge-bottom') {
    positionStyle = { left: 0, right: 0, bottom: 0 };
  }

  return (
    <>
      <div
        ref={ref}
        className={`tlf-toolbar ${dragging ? 'dragging' : ''}`}
        data-shape={shape}
        style={{
          ...positionStyle,
          '--tlf-toolbar-opacity': opacity,
        }}
        onPointerDown={onPointerDown}>
        <BrandChip onHover={setTip}
                   onClick={onToggleNavigator}
                   isOpen={navigatorOpen} />
        <Divider />

        <Widget lucide="map-pin"
                label="Zone"
                value={TLF_WORLD.zone}
                tooltipTitle="The Bastion of the Last Onion"
                tooltipLines={[TLF_WORLD.zoneSub, "Aetheryte: Revenant's Toll"]}
                tooltipQuip="Out where the realm thins."
                onHover={setTip} />

        <Widget lucide={TLF_WORLD.weather.icon}
                label="Weather"
                value={TLF_WORLD.weather.name}
                accent={TLF_WORLD.weather.accent}
                tooltipTitle={TLF_WORLD.weather.name}
                tooltipLines={['Next change: 18m 44s', 'Forecast: Embers → Fair → Clouds']}
                onHover={setTip} />

        <Widget lucide="clock"
                label={`ET ${clock.et}`}
                value={`LT ${clock.lt}`}
                tooltipTitle="Realm Chronos"
                tooltipLines={[
                  `Eorzea Time: ${clock.et}`,
                  `Local Time: ${clock.lt}`,
                  clock.etHour >= 6 && clock.etHour < 18 ? 'Astral hours' : 'Umbral hours',
                ]}
                onHover={setTip} />

        <Divider />

        {/* Focal audit chip — opens the Tactics Popout */}
        <TacticsChip
          score={audit.score}
          issuesCount={audit.findings.length}
          severity={
            audit.findings.some(f => f.severity === 'critical') ? 'critical' :
            audit.findings.some(f => f.severity === 'warning')  ? 'warning' :
                                                                   'ok'
          }
          isOpen={tacticsOpen}
          onClick={onToggleTactics}
          onHover={handleTacticsHover}
          popoutMode={popoutMode}
          useEmotePlaceholder={emotePlaceholder} />

        <Divider />

        {/* Linkshell / status (vibing tonberry) */}
        <button className="tlf-widget"
                onMouseEnter={(e) => setTip({
                  title: TLF_BRAND_VOICE.linkshellTitle,
                  lines: TLF_BRAND_VOICE.linkshellLines,
                  quip: TLF_BRAND_VOICE.linkshellQuip,
                  rect: e.currentTarget.getBoundingClientRect(),
                })}
                onMouseLeave={() => setTip(null)}>
          {emotePlaceholder
            ? <span className="tlf-status-mascot placeholder">VIBE</span>
            : <img src="assets/tonberry/vibing-emote.gif" alt="" className="tlf-status-mascot"
                   onError={(e) => { e.currentTarget.style.display='none'; }} />}
          <span className="tlf-widget-text">
            <span className="tlf-widget-label">Linkshell</span>
            <span className="tlf-widget-value">8 / 8 vibing</span>
          </span>
        </button>

        <Widget lucide="settings-2"
                label="Config"
                value="TLF"
                tooltipTitle={TLF_BRAND_VOICE.configTitle}
                tooltipLines={TLF_BRAND_VOICE.configLines}
                tooltipQuip={TLF_BRAND_VOICE.configQuip}
                onHover={setTip} />
      </div>

      {tip && !tacticsOpen && (
        <TlfTooltip rect={tip.rect} title={tip.title} lines={tip.lines} quip={tip.quip} />
      )}
    </>
  );
}

Object.assign(window, { TlfToolbar, Icon });
