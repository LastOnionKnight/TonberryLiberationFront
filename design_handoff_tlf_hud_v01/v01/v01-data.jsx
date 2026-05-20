/* global */
// =========================================================================
// TLF HUD v0.1 — demo data + Refia voice copy
// All copy here follows 04-DESIGN_PRINCIPLES:
//   - Severity annotations are Grub-Grub's voice (Stab. / Stab? / Stab…)
//   - Headline copy stays neutral / factual (no Gremlin Chaos in UI labels)
//   - Empty / about / quip surfaces can carry light Cork register
// =========================================================================

// ── Accent palettes (5 per brief; ember default) ─────────────────────────
const TLF_ACCENTS = {
  ember:   { c: '#D67B3C', b: '#F2A057', d: '#A85820', label: 'Ember' },
  gold:    { c: '#E0B652', b: '#F2D67A', d: '#9A7820', label: 'Heraldic Gold' },
  cyan:    { c: '#7FC9EE', b: '#B3DEF3', d: '#3A86B5', label: 'Frost Cyan' },
  violet:  { c: '#B585D8', b: '#D2A5EE', d: '#6A4A9A', label: 'Aether Violet' },
  crimson: { c: '#D85A5A', b: '#F28080', d: '#A82828', label: 'Garlean Crimson' },
};

// ── Demo audit state (varies based on Tweak) ─────────────────────────────
const TLF_AUDIT_SCENARIOS = {
  // Default — three issues need attention
  default: {
    score: 72,
    headline: 'Three issues need attention',
    quip: 'Most of your kit passes muster. The rest is fixable in under a minute.',
    findings: [
      {
        id: 'f1',
        severity: 'critical',
        title: 'Wrong-set ring equipped',
        body: 'Lunar Envoy\'s Ring is off-set for the Augmented Credendum loadout. 65 iLvl recoverable. The Augmented replacement is in your armoury chest.',
        stab: 'Stab.',
      },
      {
        id: 'f2',
        severity: 'warning',
        title: 'DH overcap detected',
        body: 'Direct Hit substat exceeds plan target by 42. Each point past plan returns less than half the value of an equivalent Crit point.',
        stab: 'Stab?',
      },
      {
        id: 'f3',
        severity: 'warning',
        title: 'Legs unmelded',
        body: 'Credendum Hose has two open materia sockets. The plan wants Crit XII × 2 — materia is in your inventory.',
        stab: 'Stab?',
      },
      {
        id: 'f4',
        severity: 'note',
        title: 'Pre-pull food untracked',
        body: 'Plan assumes Mille Feuille (HQ) pre-pull. Last logged pull had no food buff. Not urgent, but correct.',
        stab: 'Stab…',
      },
    ],
  },
  // Loading — audit is being computed
  loading: {
    score: null,
    headline: 'Auditing your equipped gear…',
    quip: 'The Onion is consulting its lists.',
    findings: [],
  },
  // All clear — best case
  ok: {
    score: 97,
    headline: 'All findings cleared',
    quip: 'Grub-Grub finds nothing to stab. The realm is mildly disappointed.',
    findings: [],
  },
};

// ── Toolbar audit-chip voice (compressed Refia / Grub-Grub for 30px) ─────
// Three states: critical, warning, ok. Each has:
//   - voice: the Stab. / Stab? / Stab… annotation
//   - tooltipQuip: a longer-form line that appears in the chip's tooltip
const TLF_TACTICS_VOICE = {
  critical: {
    voice: 'Stab.',
    tone: 'critical',
    tooltipQuip: 'Issues need attention. Grub-Grub is not amused.',
  },
  warning: {
    voice: 'Stab?',
    tone: 'warning',
    tooltipQuip: 'Minor matters. Worth a glance when you have the moment.',
  },
  ok: {
    voice: 'Stab…',
    tone: 'ok',
    tooltipQuip: 'All clear. Carry on, adventurer.',
  },
};

// ── Demo: world / character state for the toolbar ────────────────────────
const TLF_WORLD = {
  zone: 'The Bastion',
  zoneSub: 'Mor Dhona · 14.2, 6.8',
  weather: { id: 'embers', name: 'Ember Showers', icon: 'flame', accent: '#F2A057' },
};

// ── Brand voice strings (for tooltips + brand chip popover) ──────────────
const TLF_BRAND_VOICE = {
  brandTitle: 'Tonberry Liberation Front',
  brandLines: [
    'A united cult of grumpy gear-obsessives.',
    'Forged by Refia Rakkiri · the Last Onion Knight.',
  ],
  brandQuip: 'Click the audit chip to see what Grub-Grub thinks.',

  linkshellTitle: 'Liberation Front · Linkshell',
  linkshellLines: [
    '«The Onion Eight» · 8 / 8 members',
    '3 in the Bastion, 5 farming Materia',
  ],
  linkshellQuip: 'Grub-Grub is vibing.',

  configTitle: 'TLF Tweaks',
  configLines: [
    'Theme, accent, opacity, edit mode.',
  ],
  configQuip: 'Open the panel at lower-right.',
};

// ── Severity palette options (Tweak) ─────────────────────────────────────
const TLF_SEVERITY_OPTIONS = ['classic', 'leaf', 'ember-only'];
const TLF_SEVERITY_LABEL = {
  'classic':    'Ember + Gold + Cyan',
  'leaf':       'Ember + Gold + Leaf',
  'ember-only': 'Ember triad',
};

// ── Toolbar shape options (Tweak) ────────────────────────────────────────
const TLF_TOOLBAR_SHAPES = ['pill', 'full', 'edge-top', 'edge-bottom'];
const TLF_TOOLBAR_SHAPE_LABEL = {
  'pill':        'Compact pill (drag anywhere)',
  'full':        'Full-width strip',
  'edge-top':    'Edge-docked · top',
  'edge-bottom': 'Edge-docked · bottom',
};

// ── Popout invocation options (Tweak) ────────────────────────────────────
const TLF_POPOUT_MODES = ['click', 'hover', 'floating'];
const TLF_POPOUT_MODE_LABEL = {
  'click':    'Click chip · anchored dropdown',
  'hover':    'Hover preview · click to pin',
  'floating': 'Floating window (draggable)',
};

// ── Edit-mode visual options (Tweak) ─────────────────────────────────────
const TLF_EDIT_VISUALS = ['dashed', 'solid-glow', 'tinted'];
const TLF_EDIT_VISUAL_LABEL = {
  'dashed':     'Dashed outline + handle',
  'solid-glow': 'Solid glow ring',
  'tinted':     'Tinted background only',
};

// Export everything to window for cross-script access
Object.assign(window, {
  TLF_ACCENTS,
  TLF_AUDIT_SCENARIOS,
  TLF_TACTICS_VOICE,
  TLF_WORLD,
  TLF_BRAND_VOICE,
  TLF_SEVERITY_OPTIONS,
  TLF_SEVERITY_LABEL,
  TLF_TOOLBAR_SHAPES,
  TLF_TOOLBAR_SHAPE_LABEL,
  TLF_POPOUT_MODES,
  TLF_POPOUT_MODE_LABEL,
  TLF_EDIT_VISUALS,
  TLF_EDIT_VISUAL_LABEL,
});
