/* global React, ReactDOM,
   FFXIVScene, TlfToolbar, TacticsPopout, SuiteNavigator, Icon,
   TLF_ACCENTS, TLF_AUDIT_SCENARIOS, TLF_TACTICS_VOICE,
   TLF_SEVERITY_OPTIONS, TLF_SEVERITY_LABEL,
   TLF_TOOLBAR_SHAPES, TLF_TOOLBAR_SHAPE_LABEL,
   TLF_POPOUT_MODES, TLF_POPOUT_MODE_LABEL,
   TLF_EDIT_VISUALS, TLF_EDIT_VISUAL_LABEL,
   TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakSlider, TweakSelect, TweakColor,
   useTweaks */
// =========================================================================
// TLF HUD v0.1 — main app
// =========================================================================

const { useState, useEffect, useRef, useLayoutEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "ember",
  "toolbarShape": "pill",
  "toolbarOpacity": 1,
  "popoutMode": "click",
  "severity": "classic",
  "editVisual": "dashed",
  "auditScenario": "default",
  "emotePlaceholders": false,
  "editMode": false,
  "showDocCard": true
}/*EDITMODE-END*/;

// ── Stage scale hook (fits 1920×1080 into any viewport, letterboxed) ─────
function useStageScale(W = 1920, H = 1080) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  useEffect(() => {
    const apply = () => {
      if (!wrapRef.current || !stageRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const scale = Math.min(r.width / W, r.height / H);
      const offsetX = (r.width  - W * scale) / 2;
      const offsetY = (r.height - H * scale) / 2;
      stageRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      ro.disconnect();
    };
  }, [W, H]);
  return { wrapRef, stageRef };
}

// ── About / Chronicle modal (opens from the Navigator) ───────────────────
function AboutModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="tlf-about-scrim" onClick={onClose}>
      <div className="tlf-about" onClick={(e) => e.stopPropagation()}>
        <button className="tlf-popout-x"
                style={{ position: 'absolute', top: 12, right: 12 }}
                onClick={onClose} title="Close (Esc)">×</button>
        <img className="tlf-about-wordmark"
             src="assets/wordmark.png" alt="Last Onion Knight"
             onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div className="tlf-about-eyebrow">Tonberry Liberation Front · Chronicle</div>
        <p className="tlf-about-p">
          A united cult of grumpy gear-obsessives, forged by Refia Rakkiri —
          the Last Onion Knight. We replace the constellation of one-off
          plugins, one surface at a time.
        </p>
        <p className="tlf-about-p tlf-about-cork">
          Oi'm fixin' ta build ye a HUD that doesn't make yer eyes weep.
          Don't be at that bouncin' party-frame nonsense. Wipin' is for butts —
          cry now, peel later.
        </p>
        <div className="tlf-about-meta">
          <span>v0.1.0 · «The Onion Eight» · Mor Dhona</span>
          <span className="rune">« TLF »</span>
        </div>
      </div>
    </div>
  );
}

// ── Inner app ────────────────────────────────────────────────────────────
function Inner() {
  const { wrapRef, stageRef } = useStageScale(1920, 1080);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [position, setPosition] = useState({ x: 1920 / 2 - 380, y: 18 });
  const [floatPos, setFloatPos] = useState({ x: 1280, y: 110 });

  // Tactics popout
  const [popoutOpen, setPopoutOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const [hoverPreviewing, setHoverPreviewing] = useState(false);

  // Navigator (brand-chip surface)
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [navAnchorRect, setNavAnchorRect] = useState(null);

  // About modal (opened from Navigator)
  const [aboutOpen, setAboutOpen] = useState(false);

  // Tweaks-panel highlight flash
  const [highlightTweaks, setHighlightTweaks] = useState(false);

  const [showDoc, setShowDoc] = useState(true);

  // Apply theme + accent + severity to :root
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.dataset.severity = t.severity;
    const a = TLF_ACCENTS[t.accent] || TLF_ACCENTS.ember;
    const root = document.documentElement.style;
    root.setProperty('--fr-accent',        a.c);
    root.setProperty('--fr-accent-bright', a.b);
    root.setProperty('--fr-accent-deep',   a.d);
    root.setProperty('--ember',            a.c);
    root.setProperty('--ember-bright',     a.b);
    root.setProperty('--ember-deep',       a.d);
    root.setProperty('--fr-accent-glow',
      `0 0 12px ${a.c}8C, 0 0 28px ${a.c}48`);
    root.setProperty('--ember-glow',
      `0 0 12px ${a.c}8C, 0 0 28px ${a.c}48`);
    if (t.severity === 'classic' || t.severity === 'leaf' || t.severity === 'ember-only') {
      root.setProperty('--sev-critical', a.c);
    }
  }, [t.theme, t.accent, t.severity]);

  // Apply edit-mode visual variant
  useEffect(() => {
    const root = document.documentElement.style;
    if (t.editVisual === 'dashed') {
      root.setProperty('--tlf-editmode-outline', '2px dashed var(--fr-accent)');
    } else if (t.editVisual === 'solid-glow') {
      root.setProperty('--tlf-editmode-outline', '2px solid var(--fr-accent)');
    } else if (t.editVisual === 'tinted') {
      root.setProperty('--tlf-editmode-outline', '2px solid transparent');
    }
  }, [t.editVisual]);

  // Audit data
  const audit = TLF_AUDIT_SCENARIOS[t.auditScenario] || TLF_AUDIT_SCENARIOS.default;

  // Anchor rect helpers
  const updateAnchor = () => {
    const el = document.querySelector('[data-anchor="tactics"]');
    if (el) setAnchorRect(el.getBoundingClientRect());
  };
  const updateNavAnchor = () => {
    const el = document.querySelector('[data-anchor="brand"]');
    if (el) setNavAnchorRect(el.getBoundingClientRect());
  };

  // ── Navigator (brand chip) ────────────────────────────────────────────
  const toggleNavigator = () => {
    if (navigatorOpen) { setNavigatorOpen(false); return; }
    closePopout();
    updateNavAnchor();
    setNavigatorOpen(true);
  };
  const closeNavigator = () => setNavigatorOpen(false);

  const handleNavAction = (action) => {
    closeNavigator();
    if (action === 'open-tactics') {
      updateAnchor();
      setPopoutOpen(true);
    } else if (action === 'open-tweaks') {
      setHighlightTweaks(true);
      setTimeout(() => setHighlightTweaks(false), 1400);
    } else if (action === 'focus-linkshell') {
      alert('In v0.1 plugin: this focuses the linkshell chat tab.');
    } else if (action === 'open-about') {
      setAboutOpen(true);
    }
  };

  // ── Tactics popout (Tactics chip) ─────────────────────────────────────
  const openPopout = () => {
    closeNavigator();
    updateAnchor();
    setPopoutOpen(true);
  };
  const closePopout = () => {
    setPopoutOpen(false);
    setHoverPreviewing(false);
  };
  const onTacticsClick = () => {
    if (t.popoutMode === 'click') {
      if (popoutOpen) closePopout();
      else openPopout();
    } else if (t.popoutMode === 'hover') {
      updateAnchor();
      setPopoutOpen(true);
      setHoverPreviewing(false);
    } else if (t.popoutMode === 'floating') {
      if (popoutOpen) closePopout();
      else openPopout();
    }
  };
  const onTacticsHover = (hovering) => {
    if (t.popoutMode !== 'hover') return;
    if (hovering) {
      updateAnchor();
      setHoverPreviewing(true);
    } else {
      if (hoverPreviewing) setHoverPreviewing(false);
    }
  };

  const popoutShowing = popoutOpen || hoverPreviewing;

  // Keep anchors fresh
  useEffect(() => {
    if (!popoutShowing) return;
    updateAnchor();
    const id = setInterval(updateAnchor, 100);
    return () => clearInterval(id);
  }, [popoutShowing]);

  useEffect(() => {
    if (!navigatorOpen) return;
    updateNavAnchor();
    const id = setInterval(updateNavAnchor, 100);
    return () => clearInterval(id);
  }, [navigatorOpen]);

  // ESC closes the topmost overlay
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (aboutOpen)       { setAboutOpen(false); return; }
      if (popoutShowing)   { closePopout(); return; }
      if (navigatorOpen)   { closeNavigator(); return; }
      if (t.editMode)      { setTweak('editMode', false); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popoutShowing, navigatorOpen, aboutOpen, t.editMode, setTweak]);

  const onOpenFullAudit = () => {
    alert('In v0.1 plugin: this opens the Tonberry Tactics window.');
  };

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <div ref={stageRef}
           className={`stage ${t.editMode ? 'edit-mode' : ''}`}
           data-screen-label="01 TLF HUD v0.1">

        <FFXIVScene />

        <TlfToolbar
          position={position}
          setPosition={setPosition}
          shape={t.toolbarShape}
          opacity={t.toolbarOpacity}
          editMode={t.editMode}
          tacticsOpen={popoutShowing}
          onToggleTactics={onTacticsClick}
          onHoverTactics={onTacticsHover}
          popoutMode={t.popoutMode}
          audit={audit}
          emotePlaceholder={t.emotePlaceholders}
          navigatorOpen={navigatorOpen}
          onToggleNavigator={toggleNavigator}
        />

        <SuiteNavigator
          open={navigatorOpen}
          anchorRect={navAnchorRect}
          onClose={closeNavigator}
          onAction={handleNavAction}
        />

        <TacticsPopout
          open={popoutShowing}
          mode={t.popoutMode}
          anchorRect={anchorRect}
          audit={audit}
          onClose={closePopout}
          onOpenFull={onOpenFullAudit}
          floatPos={floatPos}
          setFloatPos={setFloatPos}
          useEmotePlaceholder={t.emotePlaceholders}
        />

        {t.editMode && (
          <div className="tlf-editmode-banner">
            <span>Layout Edit Mode</span>
            <span className="sep" />
            <span><span className="kbd">Drag</span> the pill to reposition</span>
            <span className="sep" />
            <span><span className="kbd">Esc</span> to exit</span>
            <span className="sep" />
            <span className="quip">"Don't be at that."</span>
          </div>
        )}

        {t.showDocCard && showDoc && (
          <div className="tlf-doc-card">
            <div className="h">TLF HUD · v0.1 — Live Mock</div>
            <ul>
              <li>Click the <b>brand chip</b> (left) for the TLF Suite Navigator.</li>
              <li>Click the <b>Tactics chip</b> for the gear-audit popout.</li>
              <li>Tweaks (bottom-right) flip every open question in the brief.</li>
              <li>Toggle Edit Mode to drag the pill anywhere.</li>
            </ul>
            <div className="dismiss" onClick={() => setShowDoc(false)}>↳ Dismiss</div>
          </div>
        )}

        {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      </div>

      <TweaksPanel title={highlightTweaks ? 'Tweaks  ← HERE' : 'Tweaks'}>
        <TweakSection title="Theme">
          <TweakRadio label="Mode" value={t.theme}
                      options={['dark', 'light']}
                      onChange={v => setTweak('theme', v)} />
          <TweakColor label="Accent"
                      value={TLF_ACCENTS[t.accent].c}
                      options={Object.values(TLF_ACCENTS).map(a => a.c)}
                      onChange={c => {
                        const key = Object.keys(TLF_ACCENTS).find(k => TLF_ACCENTS[k].c === c) || 'ember';
                        setTweak('accent', key);
                      }} />
          <TweakSelect label="Severity palette" value={t.severity}
                       options={TLF_SEVERITY_OPTIONS.map(v => ({ value: v, label: TLF_SEVERITY_LABEL[v] }))}
                       onChange={v => setTweak('severity', v)} />
        </TweakSection>

        <TweakSection title="Toolbar">
          <TweakSelect label="Shape" value={t.toolbarShape}
                       options={TLF_TOOLBAR_SHAPES.map(v => ({ value: v, label: TLF_TOOLBAR_SHAPE_LABEL[v] }))}
                       onChange={v => setTweak('toolbarShape', v)} />
          <TweakSlider label="Opacity" value={t.toolbarOpacity}
                       min={0.3} max={1} step={0.05}
                       onChange={v => setTweak('toolbarOpacity', v)} />
        </TweakSection>

        <TweakSection title="Tactics Popout">
          <TweakSelect label="Invocation" value={t.popoutMode}
                       options={TLF_POPOUT_MODES.map(v => ({ value: v, label: TLF_POPOUT_MODE_LABEL[v] }))}
                       onChange={v => {
                         setTweak('popoutMode', v);
                         closePopout();
                       }} />
          <TweakRadio label="Audit state" value={t.auditScenario}
                      options={['default', 'loading', 'ok']}
                      onChange={v => setTweak('auditScenario', v)} />
        </TweakSection>

        <TweakSection title="Edit Mode">
          <TweakToggle label="Edit mode" value={t.editMode}
                       onChange={v => setTweak('editMode', v)} />
          <TweakRadio label="Visual" value={t.editVisual}
                      options={TLF_EDIT_VISUALS}
                      onChange={v => setTweak('editVisual', v)} />
        </TweakSection>

        <TweakSection title="Demo">
          <TweakToggle label="Asset placeholders (stub Tonberry GIFs)"
                       value={t.emotePlaceholders}
                       onChange={v => setTweak('emotePlaceholders', v)} />
          <TweakToggle label="Show doc card" value={t.showDocCard}
                       onChange={v => setTweak('showDocCard', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Inner />);
