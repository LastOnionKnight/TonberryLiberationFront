/* global React, ReactDOM, useStageScale, ParticleField,
   Header, CharCard, PartyList, BuffStrip, TargetFrame, Hotbar, Tooltip,
   ChatPanel, Purse, Decorations, JobModal, JOBS, PlayerFrame,
   LimitBreak, PlayerCastBar, JobGauge, usePlayerSim,
   HudLayoutProvider, useHudLayout, HudWindow, LayoutToolbar, HudEditButton,
   TlfToolbar, TacticsPopout,
   TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakSlider, TweakSelect, useTweaks */
// =========================================================================
// Tonberry Liberation Front — Main App
// FFXIV-style HUD layout editing (drag/resize panels) for Frost UI-flavored
// HUD theme. Player parameter (HP/MP) lives in PlayerFrame; party parameter
// lives in PartyList — they are SEPARATE entities by design and by data
// source (LocalPlayer vs PartyMember[]).
// =========================================================================

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "frostBlur": 18,
  "particles": true,
  "particleDensity": 60,
  "shakeIntensity": 1,
  "accent": "ember",
  "scanlines": false,
  "windowStyle": "rounded-top",
  "partyStyle": "kh",
  "portraitScale": 145,
  "portraitX": 0,
  "portraitY": 0,
  "mascotPerch": true
}/*EDITMODE-END*/;

// City-state accent presets — locked, no free RGB picker.
// (c = primary, b = bright/hover, d = deep/press)
// Each preset corresponds to a Grand Company / city-state in Eorzea.
const ACCENT_PRESETS = {
  ember:    { c: '#D67B3C', b: '#F2A057', d: '#A85820', name: 'Onion Ember',    sub: 'Heralds of the Bastion' },
  limsa:    { c: '#3A86C8', b: '#6FB3EE', d: '#1F5A95', name: 'Limsa Azure',    sub: 'Maelstrom — Admiral Bloefhiswyn' },
  uldah:    { c: '#D9A84A', b: '#F2CC72', d: '#8F6E1F', name: "Ul'dah Gold",    sub: 'Immortal Flames — Flame General' },
  gridania: { c: '#6FB23E', b: '#9EDB6E', d: '#3F7820', name: 'Gridania Leaf',  sub: 'Order of the Twin Adder' },
  ishgard:  { c: '#7BB3D9', b: '#A8D2EE', d: '#4A7A98', name: 'Ishgard Frost',  sub: 'House Fortemps — Dragoon Steel' },
};

function Inner() {
  const { wrapRef, stageRef } = useStageScale(1920, 1080);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const { editing } = useHudLayout();
  const playerSim = usePlayerSim();

  const [activeJobId, setActiveJobId] = useState('onk');
  const [modalOpen, setModalOpen] = useState(false);
  const [tacticsOpen, setTacticsOpen] = useState(false);
  const [tip, setTip] = useState(null);

  const activeJob = JOBS.find(j => j.id === activeJobId) || JOBS[0];

  // Apply tweaks to the document root
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.dataset.windowStyle = t.windowStyle;
    document.documentElement.style.setProperty('--frost-blur', `${t.frostBlur}px`);
    document.documentElement.style.setProperty('--shake-intensity', String(t.shakeIntensity));
    const a = ACCENT_PRESETS[t.accent] || ACCENT_PRESETS.ember;
    document.documentElement.style.setProperty('--fr-accent',        a.c);
    document.documentElement.style.setProperty('--fr-accent-bright', a.b);
    document.documentElement.style.setProperty('--fr-accent-deep',   a.d);
    document.documentElement.style.setProperty('--ember',        a.c);
    document.documentElement.style.setProperty('--ember-bright', a.b);
    document.documentElement.style.setProperty('--ember-deep',   a.d);
    document.documentElement.style.setProperty('--ember-glow',
      `0 0 12px ${a.c}8C, 0 0 28px ${a.c}48`);
    document.documentElement.style.setProperty('--fr-accent-glow',
      `0 0 12px ${a.c}8C, 0 0 28px ${a.c}48`);
    // Portrait position controls (applied to .pf-orb-helm via CSS vars)
    document.documentElement.style.setProperty('--portrait-scale', String(t.portraitScale));
    document.documentElement.style.setProperty('--portrait-x', String(t.portraitX));
    document.documentElement.style.setProperty('--portrait-y', String(t.portraitY));
  }, [t]);

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <div ref={stageRef} className={`stage ${editing ? 'layout-mode' : ''}`} data-screen-label="01 HUD">

        {/* Backdrop */}
        <div className="backdrop"></div>
        <div className="fog"></div>

        {/* Crystal Tower silhouette */}
        <svg className="tower" viewBox="0 0 380 720" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F2A057" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#D67B3C" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#1B2F54" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <polygon points="190,0 220,140 230,720 150,720 160,140" fill="url(#towerGrad)" />
          <line x1="190" y1="40" x2="190" y2="700" stroke="#F2A057" strokeWidth="2" opacity="0.7" />
          <circle cx="190" cy="40" r="6" fill="#F2A057" opacity="0.9" />
        </svg>

        {t.particles && <ParticleField enabled={t.particles} density={t.particleDensity} />}

        {/* Decorations — non-draggable */}
        <Decorations />

        {/* Tonberry mascot perch — sits near the player frame, reacts on low HP */}
        {t.mascotPerch && (
          <div className={`tonberry-perch ${playerSim.hp / playerSim.maxHp < 0.3 ? 'angry' : ''}`}>
            <img
              src={playerSim.hp / playerSim.maxHp < 0.3
                ? 'assets/tonberry/stab-emote.gif'
                : playerSim.cast
                  ? 'assets/tonberry/heart-emote.gif'
                  : 'assets/tonberry/vibing-emote.gif'}
              alt="Tonberry"
              className="tonberry-mascot-art" />
            <span className="tonberry-perch-quip rune">grudge bearer</span>
          </div>
        )}

        {/* TLF unified toolbar (replaces old header — brand + clock + widgets) */}
        <TlfToolbar onOpenAudit={() => setTacticsOpen(o => !o)} />
        <TacticsPopout open={tacticsOpen} onClose={() => setTacticsOpen(false)} />
        <HudEditButton />

        {/* ─── Draggable / Resizable HUD windows ────────────────────────── */}

        <HudWindow id="char" label="Character · Identity" defaults={{ top: 130, left: 24, width: 540 }}>
          <CharCard activeJob={activeJob} onOpenJobs={() => setModalOpen(true)} />
        </HudWindow>

        <HudWindow id="party" label="Party · HP/MP" defaults={{ top: 460, left: 24, width: 420 }}>
          <PartyList targetId="p1" style={t.partyStyle} />
        </HudWindow>

        <HudWindow id="buffs" label="Status" defaults={{ top: 130, left: 720, width: 480 }}>
          <BuffStrip onHover={setTip} />
        </HudWindow>

        <HudWindow id="target" label="Target" defaults={{ top: 130, right: 24, width: 420 }}>
          <TargetFrame />
        </HudWindow>

        {/* Player parameter — KH ring + portrait + MP. Separate entity from party. */}
        <HudWindow id="player-frame" label="Player · HP/MP/Portrait"
                   defaults={{ bottom: 300, right: 24, width: 600, height: 200 }}>
          <PlayerFrame activeJob={activeJob} sim={playerSim} />
        </HudWindow>

        {/* Player cast bar — yours only. Target cast bar is in TargetFrame. */}
        <HudWindow id="player-cast" label="Player Cast"
                   defaults={{ bottom: 520, left: '50%', width: 380, height: 64 }}
                   style={{ transform: 'translateX(-50%)' }}>
          <PlayerCastBar sim={playerSim} />
        </HudWindow>

        {/* Job gauge — Onion Knight petals + stacks */}
        <HudWindow id="job-gauge" label="Job Gauge · Onion Knight"
                   defaults={{ bottom: 240, left: 700, width: 280, height: 96 }}>
          <JobGauge sim={playerSim} activeJob={activeJob} />
        </HudWindow>

        {/* Limit Break — party-shared gauge, separate widget */}
        <HudWindow id="limit-break" label="Limit Break"
                   defaults={{ bottom: 140, left: 700, width: 420, height: 80 }}>
          <LimitBreak sim={playerSim} />
        </HudWindow>

        <HudWindow id="hotbar" label="Hotbar · G600" defaults={{ bottom: 24, left: 24, width: 660 }}>
          <Hotbar onHover={setTip} />
        </HudWindow>

        <HudWindow id="chat" label="Chat" defaults={{ bottom: 60, right: 24, width: 380, height: 220 }}>
          <ChatPanel />
        </HudWindow>

        <HudWindow id="purse" label="Currency" defaults={{ bottom: 60, left: 24, width: 360 }}>
          <Purse />
        </HudWindow>

        {/* Aether motes */}
        {[...Array(8)].map((_, i) => (
          <span key={i} className="aether-mote" style={{
            left: `${10 + i * 11}%`,
            top:  `${60 + ((i * 37) % 25)}%`,
            '--dur': `${6 + i % 4}s`,
            '--delay': `${i * 0.7}s`,
          }} />
        ))}

        {tip && <Tooltip data={tip} />}

        <JobModal open={modalOpen} activeId={activeJobId}
                  onClose={() => setModalOpen(false)}
                  onPick={(j) => setActiveJobId(j.id)} />

        {/* Scanlines overlay */}
        {t.scanlines && (
          <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 4px)',
            mixBlendMode: 'multiply',
            zIndex: 60,
          }} />
        )}

        <LayoutToolbar />
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Layout">
          <TweakSelect label="Window style" value={t.windowStyle}
                       options={[
                         { value: 'rounded-top',  label: 'Rounded — top border' },
                         { value: 'rounded-full', label: 'Rounded — full border' },
                         { value: 'rounded-edge', label: 'Rounded — edge border' },
                         { value: 'square-top',   label: 'Square — top border' },
                         { value: 'square-full',  label: 'Square — full border' },
                         { value: 'sharp',        label: 'Sharp — no border' },
                       ]}
                       onChange={v => setTweak('windowStyle', v)} />
          <TweakRadio label="Party style" value={t.partyStyle}
                      options={['classic', 'kh']}
                      onChange={v => setTweak('partyStyle', v)} />
        </TweakSection>
        <TweakSection title="Theme">
          <TweakRadio label="Mode" value={t.theme} options={['dark', 'light']}
                      onChange={v => setTweak('theme', v)} />
          <TweakSelect label="Accent · City-state" value={t.accent}
                       options={[
                         { value: 'ember',    label: 'Onion Ember (default)' },
                         { value: 'limsa',    label: 'Limsa Azure — Maelstrom' },
                         { value: 'uldah',    label: "Ul'dah Gold — Flames" },
                         { value: 'gridania', label: 'Gridania Leaf — Twin Adder' },
                         { value: 'ishgard',  label: 'Ishgard Frost — Dragoon' },
                       ]}
                       onChange={v => setTweak('accent', v)} />
        </TweakSection>
        <TweakSection title="Frost">
          <TweakSlider label="Blur" value={t.frostBlur} min={0} max={40} unit="px"
                       onChange={v => setTweak('frostBlur', v)} />
          <TweakSlider label="Shake on hover" value={t.shakeIntensity} min={0} max={3} step={0.25}
                       onChange={v => setTweak('shakeIntensity', v)} />
        </TweakSection>
        <TweakSection title="Player Portrait">
          <TweakSlider label="Scale" value={t.portraitScale} min={80} max={220} step={1} unit="%"
                       onChange={v => setTweak('portraitScale', v)} />
          <TweakSlider label="Offset X" value={t.portraitX} min={-40} max={40} step={1} unit="px"
                       onChange={v => setTweak('portraitX', v)} />
          <TweakSlider label="Offset Y" value={t.portraitY} min={-40} max={40} step={1} unit="px"
                       onChange={v => setTweak('portraitY', v)} />
        </TweakSection>
        <TweakSection title="Effects">
          <TweakToggle label="Ember particles" value={t.particles}
                       onChange={v => setTweak('particles', v)} />
          <TweakSlider label="Particle density" value={t.particleDensity} min={10} max={200} step={5}
                       onChange={v => setTweak('particleDensity', v)} />
          <TweakToggle label="CRT scanlines" value={t.scanlines}
                       onChange={v => setTweak('scanlines', v)} />
          <TweakToggle label="Tonberry mascot perch" value={t.mascotPerch}
                       onChange={v => setTweak('mascotPerch', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function App() {
  return (
    <HudLayoutProvider>
      <Inner />
    </HudLayoutProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
