/* global React, Icon */
// =========================================================================
// Tonberry Liberation Front — Umbra-style unified toolbar
// Top-of-screen widget rail: brand, zone, weather, currency, gear-audit,
// quest tracker, FATE chip, Tonberry status, ET/LT clock, settings.
// =========================================================================

const { useState, useEffect, useRef } = React;

// ── Eorzea / Local time (kept here for the toolbar; same math as effects) ──
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

// ── Tooltip helper for toolbar widgets ────────────────────────────────────
function TlfTooltip({ rect, title, lines }) {
  if (!rect) return null;
  const stage = document.querySelector('.stage');
  const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0, width: 1 };
  const scale = stage ? stageRect.width / 1920 : 1;
  const x = (rect.left - stageRect.left) / scale + rect.width / scale / 2;
  const y = (rect.bottom - stageRect.top) / scale;
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y + 8,
      transform: 'translateX(-50%)',
      minWidth: 200, maxWidth: 280,
      padding: '10px 12px',
      background: 'var(--fr-bg-darker)',
      border: '1px solid var(--fr-outline)',
      borderRadius: 'var(--shape-radius)',
      color: 'var(--fr-fg)',
      fontFamily: 'var(--font-display)',
      fontSize: 11,
      letterSpacing: '0.04em',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      zIndex: 80,
      pointerEvents: 'none',
      animation: 'tipIn 180ms cubic-bezier(0.2,0.6,0.2,1)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: 12,
        color: 'var(--ember-bright)',
        marginBottom: 4,
      }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ color: 'var(--fr-fg-2)', fontSize: 11, lineHeight: 1.5 }}>{l}</div>
      ))}
    </div>
  );
}

// ── Toolbar widget shell ─────────────────────────────────────────────────
function Widget({ icon, lucide, label, value, accent, onClick, onHover, tooltipTitle, tooltipLines }) {
  const ref = useRef(null);
  const enter = (e) => onHover && onHover({
    title: tooltipTitle || label,
    lines: tooltipLines || [`${label}: ${value}`],
    rect: e.currentTarget.getBoundingClientRect(),
  });
  const leave = () => onHover && onHover(null);
  return (
    <button ref={ref}
            className="tlf-widget"
            onMouseEnter={enter}
            onMouseLeave={leave}
            onClick={onClick}
            style={accent ? { borderColor: accent } : null}>
      {icon ? (
        <span className="tlf-widget-icon" style={accent ? { color: accent } : null}>{icon}</span>
      ) : lucide ? (
        <span className="tlf-widget-icon" style={accent ? { color: accent } : null}>
          <Icon name={lucide} size={16} />
        </span>
      ) : null}
      <span className="tlf-widget-text">
        <span className="tlf-widget-label">{label}</span>
        <span className="tlf-widget-value" style={accent ? { color: accent } : null}>{value}</span>
      </span>
    </button>
  );
}

function WidgetDivider() {
  return <span className="tlf-divider" />;
}

// ── Brand chip (left side of the toolbar) ─────────────────────────────────
function BrandChip({ onClick, onHover }) {
  const enter = (e) => onHover && onHover({
    title: 'Tonberry Liberation Front',
    lines: [
      'A united cult of grumpy gear-obsessives.',
      'Forged by Refia Rakkiri · The Last Onion Knight.',
      'Click for quick links.',
    ],
    rect: e.currentTarget.getBoundingClientRect(),
  });
  const leave = () => onHover && onHover(null);
  return (
    <button className="tlf-brand" onClick={onClick} onMouseEnter={enter} onMouseLeave={leave}>
      <img src="assets/tonberry/stab-emote.gif" alt="" className="tlf-brand-mascot" />
      <span className="tlf-brand-text">
        <span className="tlf-brand-line1">TONBERRY</span>
        <span className="tlf-brand-line2">LIBERATION FRONT</span>
      </span>
    </button>
  );
}

// ── Main toolbar ─────────────────────────────────────────────────────────
function TlfToolbar({ onOpenAudit }) {
  const { et, lt, etHour } = useTLFClock();
  const [tip, setTip] = useState(null);

  // Day/night-aware weather rotation (purely cosmetic)
  const weatherSeed = Math.floor(Date.now() / 60000) % 6;
  const weather = [
    { id: 'fair',  name: 'Fair Skies',     icon: 'sun',          accent: '#F2D67A' },
    { id: 'clouds',name: 'Clouds',         icon: 'cloud',        accent: '#B3DEF3' },
    { id: 'rain', name: 'Rain',           icon: 'cloud-rain',   accent: '#7FC9EE' },
    { id: 'gale', name: 'Gales',          icon: 'wind',         accent: '#C2D0E0' },
    { id: 'umbral',name: 'Umbral Static',  icon: 'zap',          accent: '#B585D8' },
    { id: 'embers',name: 'Ember Showers',  icon: 'flame',        accent: '#F2A057' },
  ][weatherSeed];

  // Demo state — would come from game in real plugin
  const auditScore = 72;
  const auditIssues = 3;
  const tomes = 2000;
  const gil = 4128402;
  const mgp = 37420;

  return (
    <div className="tlf-toolbar">
      <BrandChip onHover={setTip} onClick={onOpenAudit} />

      <WidgetDivider />

      <Widget lucide="map-pin"
              label="Zone"
              value="The Bastion"
              tooltipTitle="The Bastion of the Last Onion"
              tooltipLines={['Mor Dhona · 14.2, 6.8', 'Aetheryte: Revenant\'s Toll']}
              onHover={setTip} />

      <Widget lucide={weather.icon}
              label="Weather"
              value={weather.name}
              accent={weather.accent}
              tooltipTitle={weather.name}
              tooltipLines={['Next change: 18m 44s', 'Forecast: Fair → Clouds → Rain']}
              onHover={setTip} />

      <Widget lucide="clock"
              label={`ET ${et}`}
              value={`LT ${lt}`}
              tooltipTitle="Realm Chronos"
              tooltipLines={[
                `Eorzea Time: ${et}`,
                `Local Time: ${lt}`,
                etHour >= 6 && etHour < 18 ? '☀ Astral hours' : '🌙 Umbral hours',
              ]}
              onHover={setTip} />

      <WidgetDivider />

      {/* Tonberry Tactics audit chip — clickable */}
      <button className={`tlf-widget tlf-tactics ${auditIssues > 0 ? 'has-issues' : 'all-clear'}`}
              onClick={onOpenAudit}
              onMouseEnter={(e) => setTip({
                title: 'Tonberry Tactics · Gear Audit',
                lines: [
                  `Audit score: ${auditScore} / 100`,
                  `${auditIssues} issues need attention.`,
                  'Click to open the full audit.',
                  '— Stab.',
                ],
                rect: e.currentTarget.getBoundingClientRect(),
              })}
              onMouseLeave={() => setTip(null)}>
        <img src="assets/tonberry/stab-emote.gif" alt="" className="tlf-tactics-mascot" />
        <span className="tlf-widget-text">
          <span className="tlf-widget-label">Tactics</span>
          <span className="tlf-widget-value" style={{
            color: auditIssues > 0 ? 'var(--ember-bright)' : 'var(--hp-green)'
          }}>
            {auditScore} / 100
          </span>
        </span>
        {auditIssues > 0 && <span className="tlf-tactics-pip">{auditIssues}</span>}
      </button>

      <Widget lucide="scroll-text"
              label="Quest"
              value="Liberation, Day 7"
              tooltipTitle="Active Quest"
              tooltipLines={[
                'Day Seven of the Liberation',
                'Speak with Grub-Grub at the western hearth.',
                'Reward: 2,400 gil · 480 EXP',
              ]}
              onHover={setTip} />

      <Widget lucide="compass"
              label="FATE"
              value="None nearby"
              tooltipTitle="FATE Tracker"
              tooltipLines={[
                'No active FATEs in zone.',
                'Next forecast spawn: ~6m',
              ]}
              onHover={setTip} />

      <WidgetDivider />

      <Widget lucide="coins"
              label="Gil"
              value={gil.toLocaleString()}
              accent="var(--ember-bright)"
              tooltipTitle="Currency Wallet"
              tooltipLines={[
                `Gil: ${gil.toLocaleString()}`,
                `Allagan Tomes: ${tomes.toLocaleString()} / 2,000 cap`,
                `MGP: ${mgp.toLocaleString()}`,
              ]}
              onHover={setTip} />

      <Widget lucide="gem"
              label="Tomes"
              value={tomes.toLocaleString()}
              accent={tomes >= 2000 ? 'var(--ember-bright)' : null}
              tooltipTitle="Allagan Tomestones"
              tooltipLines={[
                'Weekly cap reached. Spend them.',
                'Reset: Tuesday 09:00 UTC',
              ]}
              onHover={setTip} />

      <WidgetDivider />

      {/* Liberation Front status: vibing tonberry mascot, animated */}
      <button className="tlf-widget tlf-status"
              onMouseEnter={(e) => setTip({
                title: 'Liberation Front · Linkshell',
                lines: [
                  '«The Onion Eight» · 8 / 8 members',
                  '3 in the Bastion, 5 farming Materia',
                  'Grub-Grub is vibing.',
                ],
                rect: e.currentTarget.getBoundingClientRect(),
              })}
              onMouseLeave={() => setTip(null)}>
        <img src="assets/tonberry/vibing-emote.gif" alt="" className="tlf-status-mascot" />
        <span className="tlf-widget-text">
          <span className="tlf-widget-label">Linkshell</span>
          <span className="tlf-widget-value">8 / 8 vibing</span>
        </span>
      </button>

      <Widget lucide="settings-2"
              label="Config"
              value="TLF"
              tooltipTitle="Settings"
              tooltipLines={['Open the Tweaks panel for theme + chrome.']}
              onHover={setTip} />

      {tip && <TlfTooltip rect={tip.rect} title={tip.title} lines={tip.lines} />}
    </div>
  );
}

Object.assign(window, { TlfToolbar });
