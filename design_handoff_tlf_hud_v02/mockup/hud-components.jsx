/* global React, Icon, useEorzeaTime, useLiveXP, useGCD, JOBS, ONION_KIT, PARTY, BUFFS, TARGET, CHAT */
// =========================================================================
// Last Onion Knight — UI components
// CharCard, PartyList, BuffStrip, TargetFrame, Hotbar, Chat, Purse, modal.
// =========================================================================

const { useState, useEffect, useRef, useMemo } = React;

// ─── ChronoBar ────────────────────────────────────────────────────────────
function ChronoBar() {
  const { et, lt } = useEorzeaTime();
  return (
    <div className="chrono">
      <span className="pip"></span>
      <span><span className="et-label">ET</span><span>{et}</span></span>
      <span className="divider"></span>
      <span><span className="lt-label">LT</span><span>{lt}</span></span>
      <span className="divider"></span>
      <span className="rune" style={{ fontSize: 14 }}>The Bastion</span>
    </div>);

}

// ─── Header ───────────────────────────────────────────────────────────────
function Header() {
  return (
    <div className="header-bar">
      <img src="assets/wordmark.png" className="wordmark" alt="Last Onion Knight" />
      <ChronoBar />
    </div>);

}

// ─── Character Card ───────────────────────────────────────────────────────
// IDENTITY ONLY. The player's HP/MP/Limit live in the PlayerFrame widget —
// this card is the menu/profile view (name, job, FC, XP) and stays out of
// the combat parameter loop. Click to open the Job menu.
function CharCard({ activeJob, onOpenJobs }) {
  const xp = useLiveXP(62);
  return (
    <div className="panel char-card interactive panel-corners" onClick={onOpenJobs}>
      <div className="char-portrait">
        <div className="aether-ring"></div>
        <img src="assets/helm-avatar.png" alt="Onion Knight helm" style={{ objectFit: "none" }} />
        <div className="frame"></div>
      </div>
      <div className="char-info">
        <div>
          <div className="char-title-row">
            <span className="eyebrow">Adventurer</span>
            <span className="lv">LV<b>{activeJob.level}</b></span>
          </div>
          <div className="char-name">Vellum Eorzea</div>
          <div className="char-job-row mt-2">
            <span className="char-job-icon"><Icon name={activeJob.icon} size={18} /></span>
            <span className="char-job-name">{activeJob.name}</span>
            <span className="char-fc" style={{ marginLeft: 'auto' }}>«Onion of Us»</span>
          </div>
        </div>
        <div className="char-meta-grid">
          <div className="char-meta-cell">
            <span className="char-meta-label">Free Co.</span>
            <span className="char-meta-val">Onion of Us</span>
          </div>
          <div className="char-meta-cell">
            <span className="char-meta-label">Home</span>
            <span className="char-meta-val">Mor Dhona · Bastion</span>
          </div>
          <div className="char-meta-cell">
            <span className="char-meta-label">Grand Co.</span>
            <span className="char-meta-val rune">maelstrom</span>
          </div>
          <div className="char-meta-cell">
            <span className="char-meta-label">Chronicles</span>
            <span className="char-meta-val">147 entries</span>
          </div>
        </div>
        <div className="bar-row" style={{ marginTop: 10 }}>
          <span className="label">XP</span>
          <div className="bar thin">
            <div className="bar-fill shimmer" style={{ '--bar': `${xp.toFixed(1)}%`, '--bar-c1': 'var(--ember-bright)', '--bar-c2': 'var(--ember-deep)', '--bar-glow': 'var(--ember-glow-rgb, rgba(214,123,60,0.55))' }}></div>
          </div>
          <span className="value">{xp.toFixed(1)}% L{activeJob.level + 1}</span>
        </div>
      </div>
    </div>);

}

// ─── Party list ───────────────────────────────────────────────────────────
function PartyList({ onSelect, targetId, style = 'classic' }) {
  if (style === 'kh') {
    return (
      <div className="panel party kh">
        <div className="party-header">
          <span className="eyebrow">Party · KH Layout</span>
          <span className="numeric" style={{ fontSize: 11, color: 'var(--frost-fg-3)' }}>8 / 8</span>
        </div>
        <div className="party-list">
          {PARTY.map(m => {
            const hpClass = m.hp > 60 ? '' : m.hp > 30 ? 'yellow' : 'red';
            const stroke = hpClass === 'red' ? '#D26060' : hpClass === 'yellow' ? '#E2C36A' : '#6FBF2C';
            return (
              <div key={m.id}
                   className={`kh-row ${m.id === targetId ? 'target' : ''}`}
                   onClick={() => onSelect && onSelect(m.id)}>
                <div className={`kh-portrait ${m.role} ${m.you ? 'you' : ''}`}>
                  {m.you
                    ? <img src="assets/portrait-combat.png" alt="" />
                    : <span className="ji">{m.job.slice(0,3)}</span>}
                </div>
                <div className="kh-mid">
                  <div className={`kh-name-tab ${m.role}`}>
                    {m.name} <span className="job">· {m.job}</span>
                  </div>
                  <div className="kh-bar-stack">
                    <div className={`kh-bar-bg hp ${hpClass}`}>
                      <div className="fill" style={{ '--w': `${m.hp}%` }}></div>
                      <div className="kh-curl">
                        <svg viewBox="0 0 32 32">
                          <path
                            d="M 0 18 L 4 18 C 8 18 12 18 14 16 C 16 14 16 10 14 8 C 12 6 8 6 6 8 C 4 10 4 12 6 14 C 7 15 9 15 10 14"
                            fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    <div className="kh-bar-bg mp">
                      <div className="fill" style={{ '--w': `${m.mp}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="kh-end">
                  <span className="lvl">Lv{m.lvl}</span>
                  <span className="hppct">{m.hp}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // Classic style (default)
  return (
    <div className="panel party panel-corners">
      <div className="party-header">
        <span className="eyebrow">Linkshell · The Onion Eight</span>
        <span className="numeric" style={{ fontSize: 11, color: 'var(--frost-fg-3)' }}>8 / 8</span>
      </div>
      <div className="party-list">
        {PARTY.map((m) => {
          const hpColor =
          m.hp > 75 ? ['#7DD17A', '#3E7A39', 'rgba(125,209,122,0.5)'] :
          m.hp > 35 ? ['#E2C36A', '#7C641F', 'rgba(226,195,106,0.5)'] :
          ['#D26060', '#7A2F2F', 'rgba(210,96,96,0.5)'];
          return (
            <div key={m.id}
            className={`party-member ${m.id === targetId ? 'target' : ''}`}
            onClick={() => onSelect && onSelect(m.id)}>
              <span className={`role-icon ${m.role}`}>
                <Icon name={
                m.role === 'tank' ? 'shield-plus' :
                m.role === 'healer' ? 'cross' : 'sword'
                } size={16} />
              </span>
              <div className="member-body">
                <div className="member-name">
                  {m.you && <span style={{ color: 'var(--ember-bright)', marginRight: 4 }}>◆</span>}
                  {m.name}
                </div>
                <div className="member-bars">
                  <div className="bar thin"><div className="bar-fill" style={{ '--bar': `${m.hp}%`, '--bar-c1': hpColor[0], '--bar-c2': hpColor[1], '--bar-glow': hpColor[2] }}></div></div>
                  <div className="bar thin"><div className="bar-fill" style={{ '--bar': `${m.mp}%`, '--bar-c1': '#A8C8F0', '--bar-c2': '#436A9E', '--bar-glow': 'rgba(123,168,224,0.35)', height: '4px' }}></div></div>
                </div>
              </div>
              <div className="member-meta">
                <div style={{ color: 'var(--frost-fg-2)' }}>{m.job}</div>
                <div>L{m.lvl}</div>
              </div>
            </div>);

        })}
      </div>
    </div>);

}

// ─── Buffs / debuffs strip ────────────────────────────────────────────────
// Each buff icon carries a radial cooldown overlay (conic-gradient sweep)
// AND the numeric tail label. The radial reads at-a-glance during fights;
// the numeric tail confirms when timers get short.
function BuffStrip({ onHover }) {
  // The buffs have static time strings ("24", "12", "8s", "29:50"). For
  // demo we map time → remaining fraction (0..1). Real implementation will
  // pump fraction = remainingMs / totalMs from the game tick.
  const parseTime = (t) => {
    if (!t) return 1;
    // mm:ss → seconds
    if (typeof t === 'string' && t.includes(':')) {
      const [m, s] = t.split(':').map(n => parseInt(n, 10));
      return Math.min(1, (m * 60 + s) / 1800); // assume 30-min food
    }
    const sec = parseFloat(t);
    if (sec >= 60) return Math.min(1, sec / 1800);
    return Math.min(1, sec / 60); // assume 60s default
  };

  return (
    <div className="panel buffs">
      {BUFFS.map((b) => {
        const remaining = parseTime(b.time);
        const sweepDeg = 360 * (1 - remaining); // expended sweep
        const lowTime = remaining < 0.2;
        return (
          <div key={b.id}
               className={`buff ${b.ember ? 'ember' : ''} ${lowTime ? 'low' : ''}`}
               data-time={b.time}
               onMouseEnter={(e) => onHover && onHover({ ...b, _rect: e.currentTarget.getBoundingClientRect() })}
               onMouseLeave={() => onHover && onHover(null)}>
            <span className="buff-glyph">{b.glyph}</span>
            <span className="buff-cd-ring" style={{
              background: `conic-gradient(rgba(0,0,0,0.65) ${sweepDeg}deg, transparent ${sweepDeg}deg)`
            }} />
          </div>
        );
      })}
    </div>);

}

// ─── Target frame (with cast bar) ─────────────────────────────────────────
function TargetFrame() {
  const [cast, setCast] = useState(0);
  const [phase, setPhase] = useState('casting');
  useEffect(() => {
    let raf;
    const start = performance.now();
    function step(now) {
      const elapsed = (now - start) / 1000;
      // 8s cast → 1.2s settle → reset
      const cycle = TARGET.cast.dur + 2.4;
      const t = elapsed % cycle;
      if (t < TARGET.cast.dur) {
        setCast(t / TARGET.cast.dur * 100);
        setPhase('casting');
      } else {
        setCast(100);
        setPhase('settle');
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  const hpColor = ['#D26060', '#7A2F2F', 'rgba(210,96,96,0.5)'];
  return (
    <div className="panel target panel-corners">
      <div className="target-header">
        <span className="target-rank">{TARGET.rank}</span>
        <span className="target-name">{TARGET.name}</span>
        <span className="target-level">LV{TARGET.level}</span>
        <span className="target-affix rune">aetheryte</span>
      </div>
      <div className="bar thick">
        <div className="bar-fill" style={{ '--bar': `${TARGET.hp}%`, '--bar-c1': hpColor[0], '--bar-c2': hpColor[1], '--bar-glow': hpColor[2] }}></div>
      </div>
      <div className="flex between mt-2" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--frost-fg-3)' }}>
        <span>HP {TARGET.hp}%</span>
        <span style={{ color: 'var(--ember)' }}>4,128,000 / 6,450,000</span>
      </div>
      <div className="cast-bar-wrap">
        <div className="cast-bar">
          <div className="cast-bar-fill" style={{ '--cast': `${cast}%` }}></div>
          <div className="cast-bar-text">
            <span>{TARGET.cast.name}</span>
            <span>{phase === 'casting' ? (TARGET.cast.dur * (1 - cast / 100)).toFixed(1) + 's' : '— —'}</span>
          </div>
        </div>
      </div>
    </div>);

}

// ─── Hotbar ───────────────────────────────────────────────────────────────
// Laid out for a Logitech G600 MMO mouse: 3 modifier rows (Normal · Shift+
// · Ctrl+) × 9 thumb-button columns. Plus an adjacent 9-slot keyboard row.
function Hotbar({ onHover }) {
  // Slice into three 9-slot bars. If we have fewer than 27 abilities,
  // pad with placeholders so the grid still renders 3×9.
  const all = ONION_KIT.slice(0, 27);
  while (all.length < 27) {
    all.push({ id: `pad-${all.length}`, glyph: '·', key: '', type: 'gcd', name: 'Empty Slot', desc: '—' });
  }
  const bars = [
    { mod: 'Normal',  prefix: '',    abilities: all.slice(0, 9)   },
    { mod: 'Shift +', prefix: '⇧',   abilities: all.slice(9, 18)  },
    { mod: 'Ctrl +',  prefix: '⌃',   abilities: all.slice(18, 27) },
  ];
  const gcd = useGCD(2200);
  const [pressed, setPressed] = useState(null);

  function renderHotkey(ab, mod, isGcdRow) {
    const proc = ab.proc;
    const isGcd = ab.type === 'gcd';
    const gcdShown = isGcd && isGcdRow ? gcd : 0;
    const empty = ab.id.startsWith('pad-');
    return (
      <button key={ab.id}
              className={`hotkey ${empty ? 'empty' : ''} ${ab.proc ? 'proc' : ''}`}
              onMouseEnter={(e) => !empty && onHover && onHover({ ...ab, _rect: e.currentTarget.getBoundingClientRect() })}
              onMouseLeave={() => !empty && onHover && onHover(null)}
              onClick={() => { if (empty) return; setPressed(ab.id); setTimeout(() => setPressed(p => p === ab.id ? null : p), 600); }}>
        <span className="key">{mod}{ab.key}</span>
        <span className={`glyph ${ab.rune ? 'r' : ''}`}>{ab.glyph}</span>
        {gcdShown > 0 && gcdShown < 1 && (
          <span className="cd-ring" style={{
            background: `conic-gradient(rgba(0,0,0,0.55) ${gcdShown * 360}deg, transparent 0)`
          }}></span>
        )}
        {pressed === ab.id && <span className="cd"></span>}
      </button>
    );
  }

  return (
    <div className="panel hotbar panel-corners">
      <div className="flex between" style={{ marginBottom: 10 }}>
        <span className="eyebrow">Hotbar · G600 Layout · Onion Chronicle</span>
        <span className="numeric" style={{ fontSize: 10, color: 'var(--frost-fg-3)' }}>SET 1 / 10</span>
      </div>
      <div className="hotbar-grid">
        {bars.map((bar, ri) => (
          <div className="hotbar-bar" key={bar.mod}>
            <span className="hotbar-modlabel">{bar.mod}</span>
            <div className="hotbar-row">
              {bar.abilities.map(ab => renderHotkey(ab, bar.prefix, ri === 0))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tooltip (floating) ───────────────────────────────────────────────────
function Tooltip({ data }) {
  if (!data) return null;
  // We render the tooltip via fixed positioning into the document; but we
  // want it inside the stage so the scale applies. Use stage-relative coords.
  // The hovered element passes its bounding rect; we project into stage px.
  const stage = document.querySelector('.stage');
  const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 };
  const scale = stage ? stageRect.width / 1920 : 1;
  const x = (data._rect.left - stageRect.left) / scale + data._rect.width / scale / 2;
  const y = (data._rect.top - stageRect.top) / scale;
  return (
    <div className="tooltip"
    style={{ left: x, top: y - 14, transform: 'translate(-50%, -100%)', bottom: 'auto' }}>
      <div className="tip-name">{data.name}</div>
      <div className="tip-meta">
        <span>{data.type === 'gcd' ? 'GCD · 2.4s' : data.type === 'cd' ? `Cooldown · ${data.cd}s` : 'Status Effect'}</span>
        <span>{data.time ? `${data.time}s remaining` : ''}</span>
      </div>
      <div className="tip-desc">{data.desc}</div>
      {data.rune && <div className="tip-rune">{data.rune}</div>}
    </div>);

}

// ─── FC / Linkshell chat ──────────────────────────────────────────────────
function ChatPanel() {
  const [tab, setTab] = useState('General');
  return (
    <div className="panel chat panel-corners">
      <div className="chat-tabs">
        {['General', 'Party', 'Free Co.', 'Linkshell'].map((t) =>
        <span key={t} className={`chat-tab ${t === tab ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</span>
        )}
      </div>
      <div className="chat-log">
        {CHAT.map((line, i) =>
        <div className="chat-line" key={i}>
            <span className="chat-time">{line.t}</span>
            <span className={`chat-who ${line.k}`}>{line.who}</span>
            <span style={{ color: 'var(--frost-fg-4)' }}>›</span>
            <span className="chat-text">{line.text}</span>
          </div>
        )}
      </div>
    </div>);

}

// ─── Purse / currency strip ───────────────────────────────────────────────
function Purse() {
  const items = [
  { icon: 'coins', val: '4,128,402', lbl: 'Gil' },
  { icon: 'gem', val: '2,000', lbl: 'Allagan Tomes' },
  { icon: 'feather', val: '88', lbl: 'Onion Plumes' },
  { icon: 'scroll', val: '12', lbl: 'Vellum Tokens' },
  { icon: 'crown', val: '99 / 100', lbl: 'Chronicle Lv' },
  { icon: 'sparkles', val: '37,420', lbl: 'MGP' }];

  return (
    <div className="panel purse panel-corners">
      {items.map((i) =>
      <div className="purse-item" key={i.lbl}>
          <span className="purse-icon"><Icon name={i.icon} size={14} /></span>
          <div>
            <div className="purse-val">{i.val}</div>
            <div className="purse-lbl">{i.lbl}</div>
          </div>
        </div>
      )}
    </div>);

}

// ─── Shield & mascot decorations ──────────────────────────────────────────
function Decorations() {
  return (
    <React.Fragment>
      <img src="assets/shield-crest.png" className="shield-deco" alt="" />
      <img src="assets/rags-pixel.png" className="mascot" alt="" />
    </React.Fragment>);

}

// ─── Player parameter state — single shared source of truth ──────────────
// PlayerFrame (HP ring + portrait + MP), PlayerCastBar, JobGauge, and
// LimitBreak are all SEPARATE widgets but read from one simulated player.
// In the Dalamud port this becomes `IClientState.LocalPlayer` + a tick poll.
function usePlayerSim() {
  const [hp, setHp] = useState(118000);
  const [mp, setMp] = useState(7400);
  const [limit, setLimit] = useState(2);
  const [limitFill, setLimitFill] = useState(64);
  const [cast, setCast] = useState(null); // { name, dur, t } or null
  const [jobGauge, setJobGauge] = useState(0); // 0..100 Onion Petals
  const [jobStacks, setJobStacks] = useState(3); // 0..5
  const maxHp = 158400, maxMp = 10000;

  useEffect(() => {
    let raf, t0 = performance.now(), castT0 = t0 + 4200;
    const castEntries = [
      { name: 'Vellum Cleave',   dur: 1.5 },
      { name: 'Layered Guard',   dur: 1.5 },
      { name: 'Ember Plume',     dur: 2.4 },
      { name: 'Maelstrom Charge',dur: 0.8 },
      { name: "Cook's Mercy",    dur: 1.5 },
    ];
    let castIdx = 0;
    function step(now) {
      const elapsed = (now - t0) / 1000;
      // HP slow oscillation full↔critical
      const phase = (elapsed % 18) / 18;
      const ease = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
      const target = maxHp - ease * 150400;
      const jitter = (Math.sin(elapsed * 6.3) * 1200);
      setHp(Math.round(Math.max(4000, Math.min(maxHp, target + jitter))));
      // MP drain/restore
      const mpPhase = (elapsed % 11) / 11;
      const mpEase = 0.5 - 0.5 * Math.cos(mpPhase * Math.PI * 2);
      setMp(Math.round(2200 + mpEase * 7600));
      // Limit climbs
      setLimitFill(prev => {
        const next = prev + 0.35;
        if (next >= 100) {
          setLimit(l => Math.min(3, l + 1));
          return next - 100;
        }
        return next;
      });
      // Job gauge bar — sawtooth, builds during casts and dumps every ~12s
      setJobGauge(prev => {
        const inc = 0.6;
        return prev >= 100 ? 0 : prev + inc;
      });
      // Stacks cycle 0..5
      const stacksPhase = Math.floor((elapsed / 3) % 6);
      setJobStacks(stacksPhase);
      // Cast bar — start a new cast every 4 seconds
      if (now >= castT0) {
        const c = castEntries[castIdx % castEntries.length];
        castIdx++;
        const start = now;
        const dur = c.dur * 1000;
        setCast({ name: c.name, dur: c.dur, t: 0, start });
        castT0 = now + dur + 1500; // ~1.5s between casts
      }
      // Update active cast
      setCast(prev => {
        if (!prev) return null;
        const t = (now - prev.start) / 1000;
        if (t >= prev.dur) return null;
        return { ...prev, t };
      });
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { hp, mp, limit, limitFill, cast, jobGauge, jobStacks, maxHp, maxMp };
}
// ─── Player Frame — Kingdom Hearts-style HP ring + MP bar ────────────────
// Player HP/MP/portrait ONLY. Limit Break, Cast Bar, and Job Gauge live in
// their own draggable windows. This is the canonical "player parameter"
// entity, distinct from the party-member HP/MP bars.
function PlayerFrame({ activeJob, sim }) {
  const { hp, mp, maxHp, maxMp } = sim;

  const hpPct = hp / maxHp;
  const mpPct = (mp / maxMp) * 100;

  // HP color gradient stops based on HP%
  const hpStops =
    hpPct > 0.6 ? ['#A8E060', '#3FA82F'] :
    hpPct > 0.3 ? ['#F2D86A', '#B58A28'] :
                  ['#F26A6A', '#A82828'];

  // Ring geometry: 270° sweep from 135° around to 45° (open at the bottom-left so the MP bar tucks under)
  const R = 80;        // arc radius
  const SW = 12;       // stroke width
  const CX = 100, CY = 100;
  const C = 2 * Math.PI * R;
  const sweepRatio = 0.78; // 280°  ish — KH-like opening
  const arcLen = C * sweepRatio;
  // rotate so opening is at lower-left (start angle ~ 150°)
  const rotation = 138;
  const value = arcLen * hpPct;

  return (
    <div className="panel player-frame">
      <div className="pf-status-stack">
        <div className="pf-status-bar" />
        <div className="pf-status-bar" />
      </div>

      <div className="pf-mp-num">{mp.toLocaleString()}</div>
      <div className="pf-mp-track">
        <div className="pf-mp-fill" style={{ '--mp': `${mpPct}%` }} />
      </div>
      <div className="pf-mp-label">MP</div>

      <div className="pf-hp-num">{hp.toLocaleString()}</div>
      <div className="pf-hp-recovery">+ 1,040</div>

      <div className="pf-ring-wrap">
        <svg viewBox="0 0 200 200">
          <defs>
            <linearGradient id="pfHpGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"  stopColor={hpStops[0]} />
              <stop offset="100%" stopColor={hpStops[1]} />
            </linearGradient>
            <linearGradient id="pfEmberGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"  stopColor="#FFD86A" />
              <stop offset="55%" stopColor="#F2A057" />
              <stop offset="100%" stopColor="#A85820" />
            </linearGradient>
            <filter id="pfRingGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={R + 10}
                  fill="none" stroke="url(#pfEmberGrad)" strokeWidth="2"
                  strokeDasharray={`${(2 * Math.PI * (R + 10)) * sweepRatio} ${(2 * Math.PI * (R + 10))}`}
                  transform={`rotate(${rotation} ${CX} ${CY})`}
                  opacity="0.85"
                  filter="url(#pfRingGlow)" />

          <circle cx={CX} cy={CY} r={R + 14}
                  fill="none" stroke="rgba(214,123,60,0.45)" strokeWidth="1"
                  strokeDasharray={`${(2 * Math.PI * (R + 14)) * sweepRatio} ${(2 * Math.PI * (R + 14))}`}
                  transform={`rotate(${rotation} ${CX} ${CY})`} />

          <circle cx={CX} cy={CY} r={R}
                  fill="none"
                  stroke="rgba(0,0,0,0.85)"
                  strokeWidth={SW}
                  strokeDasharray={`${arcLen} ${C}`}
                  transform={`rotate(${rotation} ${CX} ${CY})`}
                  strokeLinecap="butt" />

          <circle cx={CX} cy={CY} r={R}
                  fill="none"
                  stroke="url(#pfHpGrad)"
                  strokeWidth={SW - 2}
                  strokeDasharray={`${value} ${C}`}
                  transform={`rotate(${rotation} ${CX} ${CY})`}
                  strokeLinecap="butt"
                  style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.2,0.6,0.2,1)', filter: 'drop-shadow(0 0 6px rgba(168,224,96,0.6))' }} />

          {(() => {
            const angle = (rotation + (value / C) * 360) * Math.PI / 180;
            const tx = CX + Math.cos(angle) * R;
            const ty = CY + Math.sin(angle) * R;
            return (
              <g transform={`translate(${tx} ${ty}) rotate(${rotation + (value / C) * 360 + 90})`}>
                <polygon points="0,-8 6,4 -6,4" fill={hpStops[0]} stroke="#000" strokeWidth="0.6"
                         filter="url(#pfRingGlow)" />
              </g>
            );
          })()}
        </svg>

        {(() => {
          let portrait, state;
          if (hpPct > 0.66)      { portrait = 'assets/portrait-combat.png';     state = ''; }
          else if (hpPct > 0.33) { portrait = 'assets/portrait-combat-alt.png'; state = 'state-warning'; }
          else if (hpPct > 0.10) { portrait = 'assets/portrait-danger.png';     state = 'state-danger'; }
          else                    { portrait = 'assets/portrait-danger-alt.png'; state = 'state-critical'; }
          return (
            <div className={`pf-orb ${state}`}>
              <span className="pf-orb-lv">Lv<span className="pf-orb-lv-num">{activeJob.level}</span></span>
              <img src={portrait} className="pf-orb-helm" alt="" />
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Limit Break — standalone widget ──────────────────────────────────────
// FFXIV party-shared limit gauge. 3 segments (1/2/3). MAX badge when full.
// Frost UI color tokens: --fr-lb-charge / --fr-lb-full.
function LimitBreak({ sim }) {
  const { limit, limitFill } = sim;
  const isLimitMax = limit >= 3;
  return (
    <div className="lb-widget">
      <div className="lb-label">LIMIT BREAK</div>
      <div className="lb-segments">
        {[0, 1, 2].map(i => {
          const filled = i < limit;
          const charging = i === limit;
          const w = filled ? 100 : charging ? limitFill : 0;
          return (
            <div key={i} className={`lb-seg ${filled ? 'on' : ''} ${charging ? 'charging' : ''} ${isLimitMax ? 'max' : ''}`}>
              <div className="lb-seg-fill" style={{ '--w': `${w}%` }} />
              <span className="lb-seg-num">{i + 1}</span>
            </div>
          );
        })}
      </div>
      {isLimitMax && <div className="lb-max-badge">MAX</div>}
    </div>
  );
}

// ─── Player Cast Bar — standalone widget ──────────────────────────────────
// Yours, not the target's. Idle state when nothing is casting.
function PlayerCastBar({ sim }) {
  const c = sim.cast;
  if (!c) {
    return (
      <div className="pcb-widget pcb-idle">
        <div className="pcb-label">Ready</div>
        <div className="pcb-flavor rune">the chronicle waits</div>
      </div>
    );
  }
  const pct = (c.t / c.dur) * 100;
  const remaining = Math.max(0, c.dur - c.t).toFixed(1);
  // First 0.5s of cast is the "interrupt window" — color shift
  const interruptable = c.t < 0.5;
  return (
    <div className={`pcb-widget ${interruptable ? 'interrupt' : ''}`}>
      <div className="pcb-name">{c.name}</div>
      <div className="pcb-bar">
        <div className="pcb-fill" style={{ '--cast': `${pct}%` }} />
        <div className="pcb-slidecast" />
      </div>
      <div className="pcb-time">{remaining}s</div>
    </div>
  );
}

// ─── Job Gauge — Onion Knight ─────────────────────────────────────────────
// Custom Onion Knight gauge: "Petals" radial dial (0..100) + 5-stack pip row
// representing layers of guard accumulated.
function JobGauge({ sim, activeJob }) {
  const { jobGauge, jobStacks } = sim;
  const R = 32, CX = 40, CY = 40, C = 2 * Math.PI * R;
  const sweep = 0.82;
  const arcLen = C * sweep;
  const rotation = 144;
  const value = arcLen * (jobGauge / 100);
  return (
    <div className="jg-widget">
      <div className="jg-petals">
        <svg viewBox="0 0 80 80">
          <defs>
            <linearGradient id="jgGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"  stopColor="var(--fr-accent-bright)" />
              <stop offset="100%" stopColor="var(--fr-accent-deep)" />
            </linearGradient>
          </defs>
          <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="rgba(0,0,0,0.75)" strokeWidth="6"
                  strokeDasharray={`${arcLen} ${C}`}
                  transform={`rotate(${rotation} ${CX} ${CY})`} />
          <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="url(#jgGrad)" strokeWidth="5"
                  strokeDasharray={`${value} ${C}`}
                  transform={`rotate(${rotation} ${CX} ${CY})`}
                  strokeLinecap="butt"
                  style={{ transition: 'stroke-dasharray 280ms var(--ease-frost)' }} />
        </svg>
        <div className="jg-petals-val">{Math.floor(jobGauge)}</div>
      </div>
      <div className="jg-mid">
        <div className="jg-name">{activeJob.name}</div>
        <div className="jg-stacks">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} className={`jg-pip ${i < jobStacks ? 'on' : ''}`} />
          ))}
        </div>
        <div className="jg-flavor rune">layered guard</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Header, CharCard, PartyList, BuffStrip, TargetFrame, Hotbar, Tooltip, ChatPanel, Purse, Decorations,
  PlayerFrame, LimitBreak, PlayerCastBar, JobGauge, usePlayerSim,
});
