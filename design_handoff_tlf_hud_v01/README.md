# Handoff: TLF HUD v0.1 — Toolbar, Tactics Popout, Tweaks

## Overview

This handoff covers the **v0.1 MVP design for the TLF HUD Dalamud plugin** —
the second plugin in the Tonberry Liberation Front suite. v0.1 ships **four**
visible surfaces on day one:

1. **TLF Toolbar** — a compact pill at the top of the screen, draggable
   in edit mode. Brand chip + a small rail of widgets (zone, weather, ET/LT
   clock, gear-audit, linkshell, settings).
2. **Tonberry Tactics Popout** — an anchored dropdown that opens from the
   toolbar's audit chip. Score ring + finding rows with severity colors
   and Grub-Grub's "Stab. / Stab? / Stab…" voice annotations. The
   "Open Full Audit" CTA hands off to the Tonberry Tactics plugin.
3. **Suite Navigator** — a separate popover anchored to the BRAND chip
   (not the Tactics chip). Lists the surfaces of the TLF Suite —
   Tonberry Tactics, TLF HUD tweaks, the linkshell, About / Chronicle —
   so the brand chip is a navigation surface, not an audit shortcut.
4. **Tweaks Panel + About modal** — minimal config (theme, accent,
   opacity, edit mode) plus a Chronicle-voice About surface opened from
   the Navigator.

**v0.1 explicitly does NOT ship** the PlayerFrame (KH Bars replacement),
party list, target frame, buff strip, hotbar, chat, or any decorations.
Those are v0.2+ on the roadmap and remain owned by KH Bars / Umbra /
native FFXIV during the transition. See `context/01-DESIGN_BRIEF.md`
section 3 for the full scope statement and `context/02-LOCKED_DECISIONS.md`
for the three locked architectural decisions.

---

## Open the prototype

- `TLF HUD v0.1.html` opens in any modern browser, no build step.

## Implementation port

**Read `RUNTIME_PORT.md` second** — after the context briefs. It is the
highest-leverage doc in this bundle. It gives:
- Every CSS token's exact value in three forms: hex, RGBA bytes, ImGui
  Vector4.
- A `TlfTokens.cs` scaffold so colors live in one file.
- Per-component Una.Drawing C# sketches and ImGui drawlist sketches.
- Known degradations (backdrop blur, gradients, dashed borders) with
  the agreed fallback for each.
- A per-surface implementation checklist.

If you only have time to read one file in this bundle besides the
prototype, read `RUNTIME_PORT.md`.

---

## About the Design Files

The files in this bundle — particularly `TLF HUD v0.1.html` and the
`v01/*.jsx` components — are **design references created in HTML/React**.
They are not the production codebase; they exist to show the intended
visual treatment, interaction model, and Refia/Grub-Grub voice in a
runnable form.

**The implementation target is a Dalamud plugin** authored in **C#** that
draws its UI via **Una.Drawing** (the CSS-like declarative styling layer
built by the Umbra plugin author). The job is **not** to ship the HTML
prototype — it is to **reproduce the visual + interaction spec in the
Dalamud plugin** using Una.Drawing nodes and styles, following the
locked decisions in `context/02-LOCKED_DECISIONS.md`.

If you want to run the prototype as-is, open `TLF HUD v0.1.html` in any
modern browser. No build step.

---

## Fidelity

**High-fidelity.** All colors, type sizes, spacing, radii, shadows, and
interactions in this package are intended to ship pixel-equivalent.
The translation layer is the visual *idiom* (Una.Drawing instead of CSS),
not the visual *language*.

When something can't be expressed faithfully in Una.Drawing (e.g. CSS
`backdrop-filter: blur()`), drop it cleanly rather than approximate it.
Backdrop blur is flagged below as "polish — optional".

---

## Architectural Context — Read These First

Before implementing, read these in order (they're in `context/`):

1. `context/00-README.md` — the kickoff package overview
2. `context/01-DESIGN_BRIEF.md` — the vision, the in-scope/out-of-scope
   split, the open questions this design answers
3. `context/02-LOCKED_DECISIONS.md` — three settled architectural calls
   (Frost UI as inspiration only, Una.Drawing in TLF HUD only,
   PlayerFrame ships in v0.2 not v0.1)
4. `context/03-PLUGIN_LANDSCAPE.md` — what the suite will eventually
   replace (KH Bars, Umbra, CharacterPanelRefined)
5. `context/04-DESIGN_PRINCIPLES.md` — the cross-surface rules (voice,
   token-portability, severity-color-vs-voice separation, no emoji,
   no `!`, behavior-state requirement)

Anything in this README that contradicts those documents — those win.

---

## Screens / Views

This is a single full-screen HUD layer over the FFXIV game window. There
is one "screen" in the conventional sense, with three independently-
visible chrome surfaces over it.

### Screen 01 — TLF HUD overlay

- **Name:** TLF HUD v0.1 overlay
- **Purpose:** Persistent at-a-glance read of the player's audit status,
  realm time, zone, and linkshell, plus one click to dig into the full
  gear audit.
- **Layout:** The HUD is drawn on top of the live FFXIV viewport. v0.1
  occupies a small ribbon at the top of the screen for the toolbar, plus
  an on-demand floating popout. Edit mode adds a banner near the top.
  Tweaks panel is anchored bottom-right; it's a configuration surface,
  not gameplay UI.

### Component 1 — TLF Toolbar (compact pill)

**Position (default):** top-center, ~18px from the top edge, centered
horizontally. Draggable in edit mode; position persists across sessions.

**Click-target separation — brand chip vs Tactics chip.** v0.1 keeps two
distinct click affordances on the toolbar so users learn one mapping
from day one:
- **Brand chip (left)** → opens the **Suite Navigator** popover (see
  Component 3 below). Navigation surface.
- **Tactics chip (focal)** → opens the **Tactics Popout** dropdown.
  Audit surface.
Clicking one closes the other (peer-surface invariant). Do not alias
these to the same action.

**Dimensions:**
- Height: `44px` (`--tlf-toolbar-height`)
- Auto-width based on widget contents (typically ~760px for the default
  widget set)
- Inner padding: `6px × 10px` (`--tlf-toolbar-pad-y` × `--tlf-toolbar-pad-x`)
- Inter-widget gap: `6px` (`--tlf-toolbar-gap`)
- Radius: `10px` (`--tlf-toolbar-radius`)

**Chrome:**
- Background: `rgba(20, 22, 28, 0.92)` (`--tlf-toolbar-bg`)
- Border: `1px solid rgba(178, 178, 178, 0.45)` (`--fr-outline-soft`)
- Shadow: `0 12px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4),
  inset 0 1px 0 rgba(255,255,255,0.06)`
- Backdrop blur: `20px` saturate `1.2` — **polish — optional**. If
  Una.Drawing can't, just paint the flat fill at full opacity `(0.92)`.

**Contents (left → right):**

1. **Brand chip** — helm avatar (30×30 circular), `TONBERRY` / `LIBERATION FRONT`
   stacked Cinzel labels, `« TLF »` Eorzea-font rune. Click opens the
   **Suite Navigator** (see Component 3).
2. **Divider** — 1px vertical, 22px tall, `--frost-border-1`
3. **Zone widget** — `MapPin` icon, label `ZONE`, value `The Bastion`
4. **Weather widget** — `Flame` icon (or current weather), label `WEATHER`,
   value `Ember Showers`. Icon tinted with the weather accent
   (`#F2A057` for embers).
5. **Clock widget** — `Clock` icon, label `ET 18:42`, value `LT 14:07`.
   Eorzea time computed as `floor((unix * (24*60)/70) % 86400)`.
6. **Divider**
7. **Tactics audit chip** ★ (the focal widget — see below for detail)
8. **Divider**
9. **Linkshell widget** — vibing-emote.gif (24×24 pixelated), label
   `LINKSHELL`, value `8 / 8 vibing`
10. **Settings widget** — `Settings2` icon, label `CONFIG`, value `TLF`

**Widget chip recipe** (`.tlf-widget`):
- Background: `rgba(0,0,0,0.28)` (`--tlf-widget-bg`)
- Border: `1px solid rgba(178, 178, 178, 0.22)` (`--frost-border-1`)
- Radius: `5px` (`--tlf-widget-radius`)
- Inner padding: `4px × 10px`
- Min height: `36px`
- Gap between icon and text: `8px`
- Icon: `18×18`, `--ember-bright` (`#F2A057`) unless widget specifies an accent
- Label: Cinzel 600, 8px, letter-spacing `0.2em`, uppercase, color `--fr-fg-3`
- Value: JetBrains Mono 600, 11px, color `--fr-fg`, no-wrap
- Hover: background → `rgba(214,123,60,0.10)`, border → `--ember` (`#D67B3C`),
  text → `--fr-fg` (`#F2F2F5`)

**Tactics audit chip recipe** (`.tlf-tactics`):
- Same shell as `.tlf-widget`, but:
- Background: linear-gradient (180deg) from `rgba(214,123,60,0.18)` to
  `rgba(214,123,60,0.06)`
- Border color: `--ember` (`#D67B3C`)
- Mascot slot on the left: `26×26` `stab-emote.gif`, `image-rendering: pixelated`,
  drop-shadow `0 0 5px rgba(214,123,60,0.45)`
- Label `TACTICS`, value `72 / 100` (score color tracks severity — see below)
- Compressed Refia voice slot below the value: `Stab.` / `Stab?` / `Stab…`
  in Cormorant Garamond italic 11px, color tracks severity
- Issue count pip in top-right corner: 18px circle, ember background,
  Cinzel 900 10px black text, ember-bright border, drop-shadow
- States:
  - `critical` (one or more critical findings): background ember gradient,
    border ember, voice `Stab.` ember, pip ember
  - `warning` (warnings only): background gold-tinted gradient
    (`rgba(226,195,106,0.16) → 0.04`), border `--sev-warning` (`#E2C36A`),
    voice `Stab?` gold, pip gold
  - `ok` (no findings): background green-tinted gradient
    (`rgba(111,191,106,0.15) → 0.04`), border `--hp-green` (`#6FBF6A`),
    voice `Stab…` green, no pip
  - `loading` (audit computing): score shows `— / —`, voice empty,
    headline reads `Auditing your equipped gear…`
- `open` (popout currently shown): background gradient at higher
  saturation (`0.36 → 0.12`), box-shadow `0 0 0 1px var(--ember-bright),
  0 0 16px rgba(214,123,60,0.45)`

**Brand chip recipe** (`.tlf-brand`):
- Background: linear-gradient `rgba(214,123,60,0.22) → 0.06`
- Border: `1px solid var(--ember)`
- Radius: `6px` (`--tlf-brand-radius`)
- Helm avatar: `30×30`, circular (50% border-radius), `object-position 50% 35%`
  so the face frames correctly when cropped to a circle, drop-shadow
  `0 0 6px rgba(214,123,60,0.45)`. **Don't redraw — use `assets/helm-avatar.png` as-is.**
- L1 text: `TONBERRY` — Cinzel 900, 11px, letter-spacing `0.16em`,
  color `--ember-bright`, text-shadow `0 1px 2px rgba(0,0,0,0.8)`
- L2 text: `LIBERATION FRONT` — Cinzel 700, 8.5px, letter-spacing `0.20em`,
  color `--fr-fg-2`
- Rune slot: `« TLF »` in Eorzea.ttf, 13px, color `--ember` at 0.7 opacity

#### Toolbar shape variants (Tweak)

Default v0.1 is the **compact pill** above. The Tweaks panel exposes
three alternates that the user can opt into:

- `pill` (default) — as described above, draggable in edit mode
- `full` — full-viewport-width strip, no left/right border, radius 0,
  position locked
- `edge-top` — same as `full` but bottom corners are rounded; reads as
  "docked to top edge"
- `edge-bottom` — same as `edge-top` but on the bottom edge, top corners
  rounded

Implementation note: the default-on-disk should be `pill`. Persist the
user's choice in the plugin config and apply on startup.

### Component 2 — Tactics Popout (anchored dropdown)

**Trigger:** click the Tactics audit chip on the toolbar. **Position
(default):** anchored under the chip, with a `14px` vertical offset and a
12px arrow pointing up at the chip. The popout's horizontal position is
clamped so the arrow stays inside the popout's left/right margins.

**Dimensions:**
- Width: `380px` (`--tlf-popout-width`)
- Max height: `540px` (`--tlf-popout-max-h`); body scrolls if needed

**Chrome:**
- Background: `rgba(14, 16, 22, 0.96)` (`--tlf-popout-bg`)
- Border: `2px solid rgba(178, 178, 178, 1.0)` (`--fr-outline`)
- Radius: `8px` (`--tlf-popout-radius`)
- Shadow: `0 18px 48px rgba(0,0,0,0.75), 0 0 32px rgba(214,123,60,0.18)`
- Backdrop blur: `22px` saturate `1.2` — **polish — optional**
- Enter animation: 220ms ease-out, fade from `opacity:0 translateY(-6px)`
  to `opacity:1 translateY(0)`

**Sections (top → bottom):**

#### a. Header
- Background: linear-gradient `rgba(214,123,60,0.18) → 0.04`
- Border-bottom: `1px solid --fr-outline-soft`
- Inner padding: `10px 14px`
- Layout: mascot (left) + title block + close button (right)
- Mascot: `30×30` `stab-emote.gif`, pixelated rendering
- Title: `Tonberry Tactics` — Cinzel 800, 13px, letter-spacing `0.12em`,
  uppercase, color `--ember-bright`
- Subtitle: `"Grub-Grub disapproves of guessing."` — Cormorant Garamond
  italic, 11px, color `--fr-fg-3`. When the popout is in floating mode,
  the subtitle reads `Drag the header to move.`
- Close button: `22×22` circle, `rgba(0,0,0,0.4)` bg, `--frost-border-1`
  border, `×` glyph color `--fr-fg-3`. Hover → ember.

#### b. Body — Score row
- Box: padding `12px`, background `rgba(0,0,0,0.32)`, border
  `1px solid --frost-border-1`, radius `5px`
- Score ring: `64×64` SVG, 6px stroke, dark track + colored progress arc.
  Arc color logic:
  - score ≥ 90 → `--hp-green` (`#6FBF6A`)
  - score ≥ 70 → `--ember-bright` (`#F2A057`)
  - score < 70 → `--sev-warning` (`#E2C36A`)
- Score number centered in the ring: JetBrains Mono 700, 16px,
  `--ember-bright`, text-shadow `0 1px 2px rgba(0,0,0,0.7)`
- Right side (stat-text):
  - Eyebrow: `AUDIT SCORE` — Cinzel 600, 9px, letter-spacing `0.20em`,
    uppercase, `--fr-fg-3`
  - Headline: e.g. `Three issues need attention` — Cinzel 700, 14px,
    letter-spacing `0.03em`, color `--fr-fg`
  - Quip: Cormorant Garamond italic, 12px, color `--fr-fg-3`, line-height 1.35.
    Quips are factual + lightly Cork. Example:
    `"Most of your kit passes muster. The rest is fixable in under a minute."`

#### c. Body — Finding rows (0..N)
Each finding is a vertical card:
- Padding: `10px 12px 10px 14px`
- Background: `rgba(0,0,0,0.22)`
- Border-left: `3px solid` — **color = severity**:
  - `critical` → `--sev-critical` (default `#D67B3C` ember)
  - `warning` → `--sev-warning` (default `#E2C36A` gold)
  - `note` → `--sev-note` (default `#7FC9EE` cyan)
- Radius: `0 4px 4px 0`
- Head row: lucide icon (14px) + title + Refia annotation pill
  - Icon: `alert-octagon` for critical, `alert-triangle` for warning,
    `info` for note. Icon color tracks severity.
  - Title: Cinzel 700, 11px, letter-spacing `0.04em`, uppercase, `--fr-fg`
  - Annotation pill (right-aligned): `Stab.` / `Stab?` / `Stab…` —
    Cormorant Garamond italic 11px, color tracks severity. **This is
    Grub-Grub's voice; the severity color is on the row itself. They
    are independently toggleable per principle 4 — do not couple
    them in code.**
- Body: Cormorant Garamond italic 12.5px, color `--fr-fg-2`,
  line-height 1.5

#### d. Body — Empty state (when there are zero findings)
- Centered column, 26px vertical padding
- Mascot: `64×64` `vibing-emote.gif`, pixelated rendering
- Heading: `No findings` — Cinzel 700, 13px, letter-spacing `0.06em`,
  uppercase, `--ember-bright`
- Body: Cormorant Garamond italic 12px, color `--fr-fg-3`, max-width
  `280px`, line-height 1.4. Example copy:
  `"Grub-Grub finds nothing to stab. Your kit is in fine fettle —
  carry on, adventurer."`

#### e. Footer
- Background: `rgba(0,0,0,0.25)`
- Border-top: `1px solid --fr-outline-soft`
- Padding: `10px 14px`
- Layout: meta on the left, primary CTA on the right
- Meta (`Last audit · 2 min ago · ilvl 730 · Onion Knight (NIN)`):
  JetBrains Mono 10px, color `--fr-fg-3`
- CTA (`Open Full Audit ›`):
  - Padding `6px 14px`
  - Background: linear-gradient `--ember-bright → --ember-deep`
  - Color: `#1A0D04`
  - Border: `1px solid --ember`
  - Radius: `4px`
  - Cinzel 800, 10px, letter-spacing `0.18em`, uppercase
  - Hover: `filter: brightness(1.08); box-shadow: 0 0 14px rgba(214,123,60,0.5)`
  - On click: invoke the Tonberry Tactics plugin's
    `WantsAuditOnNextDraw = true` one-shot flag (per principle "Cross-surface
    signals are one-shot flags"). The receiving plugin consumes-and-resets
    on its next frame.

#### Popout invocation variants (Tweak)

v0.1 default is **click → anchored dropdown**. The Tweaks panel offers two
alternates the user can opt into:

- `click` (default) — chip click toggles the dropdown open/closed; arrow
  points at the chip; click outside or Esc to close
- `hover` — chip hover shows the dropdown as a preview (not pinned);
  click pins it open
- `floating` — clicking the chip opens the popout as a detached,
  draggable window (no arrow); the header has cursor: move and is the
  drag handle

### Component 3 — Suite Navigator (brand-chip popover) ★ NEW

A peer surface to the Tactics Popout. Opens beneath the brand chip when
the user clicks the brand chip. **Not the same as the Tactics Popout** —
this is a suite-level navigation surface; the Tactics Popout is audit
data.

**Dimensions:**
- Width: `320px`
- Auto-height based on row count (currently 6 rows, ~340px tall)

**Chrome:** identical to the Tactics Popout (same background, border,
radius, shadow, blur tokens, anchored-arrow recipe).

**Header (`.tlf-nav-head`):**
- Background: linear-gradient `rgba(214,123,60,0.22) → 0.04`
- Inner padding: `12px 14px`
- Wordmark (left): `assets/wordmark.png` at `height: 36px`,
  drop-shadow `0 2px 4px rgba(0,0,0,0.7)`
- Text column:
  - Eyebrow: `TLF SUITE` — Cinzel 700, 9px, letter-spacing `0.20em`,
    uppercase, `--fr-fg-3`
  - Title: `NAVIGATOR` — Cinzel 800, 14px, letter-spacing `0.10em`,
    `--ember-bright`
- Version chip (right): `v0.1.0` in JetBrains Mono 10px, ember-bright,
  `rgba(0,0,0,0.42)` background, hairline border, `3px` radius

**Body — navigation rows.**
6 rows. Each row is `grid-template-columns: 30px 1fr auto` with `10px`
gap, `9px 10px` padding, `5px` radius, transparent default background.

| Row id        | Icon            | Name                              | Sub                                              | Action / availability       |
|---------------|-----------------|-----------------------------------|--------------------------------------------------|-----------------------------|
| `tactics`     | `sword`         | Tonberry Tactics                  | Open the gear-audit window.                      | `open-tactics` (v0.1)       |
| `tweaks`      | `settings-2`    | TLF HUD · Layout & Tweaks         | Theme, accent, opacity, edit mode.               | `open-tweaks` (v0.1)        |
| `linkshell`   | `message-circle`| Linkshell · The Onion Eight       | Eight grumpy adventurers. Mostly vibing.         | `focus-linkshell` (v0.1)    |
| `chronicle`   | `scroll-text`   | Chronicle · About TLF             | "Wiping is for butts. Cry now, peel later."      | `open-about` (v0.1)         |
| `playerframe` | `shield`        | PlayerFrame · HP / MP / Limit     | Ships in v0.2. KH Bars stays installed until.    | DISABLED, badge `v0.2`      |
| `partylist`   | `users`         | Party · Target · Buffs            | Sequenced after PlayerFrame.                     | DISABLED, badge `v0.3+`     |

**Row recipe:**
- Icon column: `30×30` square, `rgba(0,0,0,0.32)` bg, `--frost-border-1`
  border, `4px` radius, `--ember-bright` icon color
- Name: Cinzel 700, 12px, letter-spacing `0.04em`, uppercase, `--fr-fg`
- Sub: Cormorant Garamond italic, 11px, color `--fr-fg-3`
- Chevron (right): `›` in JetBrains Mono 14px, `--fr-fg-3`
- Hover (available rows only): background `rgba(214,123,60,0.10)`,
  border `--frost-border-1`, chevron `--ember-bright`
- Disabled rows: opacity `0.55`, no hover, badge `v0.2` etc. shown
  instead of chevron (Cinzel 700 8px, letter-spacing 0.16em)

**Footer (`.tlf-nav-foot`):**
- Background: `rgba(0,0,0,0.22)`
- Padding: `10px 14px`
- Tagline: `Forged by Refia Rakkiri.` — Cormorant Garamond italic, 11px,
  `--fr-fg-3`
- Rune (right): `« TLF »` in Eorzea.ttf, 12px, `--ember`

**Plugin actions:**

| Action            | Plugin-side handler                                              |
|-------------------|------------------------------------------------------------------|
| `open-tactics`    | Close navigator, open the Tactics popout (anchored under chip)   |
| `open-tweaks`     | Focus the Tweaks window; briefly flash the title for findability |
| `focus-linkshell` | `/chat focus` + activate the LS tab (or whatever your chat surface exposes) |
| `open-about`      | Open the About modal (Component 4)                               |

### Component 4 — About / Chronicle modal

Opened from the Navigator's Chronicle row. Closes on Esc, scrim click,
or × button. Centered modal over a dark scrim.

**Dimensions:**
- Width: `520px` (max 90% viewport)
- Auto-height

**Chrome:**
- Background: `--tlf-popout-bg`
- Border: `2px solid --ember`
- Radius: `8px`
- Shadow: `0 24px 56px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.5),
  0 0 48px rgba(214,123,60,0.30)`
- Inner padding: `32px 36px 28px`

**Contents:**
- Wordmark (centered, `height: 64px`, drop-shadow + ember glow)
- Eyebrow: `TONBERRY LIBERATION FRONT · CHRONICLE` — Cinzel 700, 10px,
  letter-spacing `0.22em`, uppercase, `--fr-fg-3`
- Neutral paragraph (Cormorant Garamond 15px, `--fr-fg-2`, line-height 1.55):
  > A united cult of grumpy gear-obsessives, forged by Refia Rakkiri
  > — the Last Onion Knight. We replace the constellation of one-off
  > plugins, one surface at a time.
- Cork paragraph (Cormorant Garamond italic 14px, `--fr-fg-3`):
  > Oi'm fixin' ta build ye a HUD that doesn't make yer eyes weep.
  > Don't be at that bouncin' party-frame nonsense. Wipin' is for butts
  > — cry now, peel later.

  This is the one v0.1 surface where the Cork register thickens, per
  `04-DESIGN_PRINCIPLES.md` §3.6. NOT in UI labels or error text.

- Footer meta: `v0.1.0 · «The Onion Eight» · Mor Dhona` + `« TLF »` rune

### Component 5 — Tweaks Panel (minimal v0.1 config)

This is the plugin's config window equivalent. In the prototype it's
implemented via the shared `tweaks-panel.jsx` component (a development
chrome). **In the Dalamud plugin, this maps to an Una.Drawing config
window opened from the toolbar's CONFIG widget.**

v0.1 surface:

**Section: Theme**
- Mode: radio — `dark` / `light` (light is vellum-warm — defaults in
  `--fr-bg` light variant in `v01.css`)
- Accent: 5 swatches — Ember (default `#D67B3C`), Heraldic Gold `#E0B652`,
  Frost Cyan `#7FC9EE`, Aether Violet `#B585D8`, Garlean Crimson `#D85A5A`.
  Each accent updates all of `--fr-accent`, `--fr-accent-bright`,
  `--fr-accent-deep`, `--fr-accent-glow`, `--ember*`. See
  `v01/v01-data.jsx` → `TLF_ACCENTS` for the canonical hex values
  (`c` = base, `b` = bright, `d` = deep).
- Severity palette: select — three variants:
  - `classic` (default): ember / gold / cyan
  - `leaf`: ember / gold / Gridanian leaf-green
  - `ember-only`: ember / pale-ember / desaturated-ember triad

**Section: Toolbar**
- Shape: select — `pill` (default) / `full` / `edge-top` / `edge-bottom`
- Opacity: slider 0.30 → 1.00, step 0.05, default `1`. Applies to the
  toolbar root element only — child contents stay at full opacity.

**Section: Tactics Popout**
- Invocation: select — `click` (default) / `hover` / `floating`
- Audit state (demo only — does not persist in plugin): radio —
  `default` / `loading` / `ok`. **This is a prototype-only control to
  preview empty/loading states; the plugin reads real audit data from
  TT.**

**Section: Edit Mode**
- Edit mode toggle (also surfaced via a one-shot keybind in the plugin)
- Visual: radio — `dashed` (default) / `solid-glow` / `tinted`. Controls
  what the toolbar's "I am editable" affordance looks like:
  - `dashed`: 2px dashed ember outline + drag-dot handle on the left edge
  - `solid-glow`: 2px solid ember outline (no dashes)
  - `tinted`: transparent outline; rely on the stage's edit-mode
    background tint only

**Section: Demo** (prototype-only — do NOT ship in plugin)
- Asset placeholders toggle: swaps the Tonberry GIFs for `STAB` / `VIBE`
  text-stub squares. Useful in the design tool when GIFs aren't loaded.
  This is purely a design-prototype affordance; the plugin always uses
  the real GIFs.
- Show doc card toggle.

---

## Interactions & Behavior

### Toolbar — default mode (edit mode OFF)

- All widget chips are buttons. Hover transitions border + background
  + text color over 180ms `cubic-bezier(0.2, 0.6, 0.2, 1)`.
- Mouseover any chip shows a tooltip 10px below the chip. Tooltip
  body: title (Cinzel 800 12px ember-bright), 1–3 plain lines
  (Cinzel 11px fr-fg-2), and an optional Cormorant italic quip
  separated by a 1px dashed border-top. See `v01/v01-toolbar.jsx`
  `TlfTooltip` for the recipe.
- Tactics chip click: opens the popout per the invocation mode setting.

### Toolbar — edit mode (toggled via Tweaks or future keybind)

- Stage gets a subtle ember vignette (`--tlf-editmode-stage-vignette`).
- Toolbar gets an outline (dashed/solid/tinted per `editVisual`) plus a
  drag handle of vertical dots on the left edge (only for shape=pill).
- Pointerdown anywhere on the toolbar (except inside a button) initiates
  a drag. Pointermove updates the toolbar's `(x, y)` in stage coordinates
  (1920×1080 logical canvas; scale-aware). Pointerup commits.
- Clamping: toolbar can't be dragged off-screen
  (`0 ≤ x ≤ 1920 - 100`, `0 ≤ y ≤ 1080 - 50`).
- Esc exits edit mode.
- Banner at top center reads:
  ```
  LAYOUT EDIT MODE  |  [Drag] the pill to reposition  |  [Esc] to exit  |
  "Don't be at that."
  ```

### Brand chip click → Suite Navigator

- Brand-chip click toggles the Suite Navigator open/closed (peer to the
  Tactics Popout — only one is visible at a time).
- Navigator opens with the same 220ms ease-out enter animation as the
  Tactics popout.
- Closes on Esc, click-outside, brand-chip re-click.
- Each navigation row emits one of: `open-tactics`, `open-tweaks`,
  `focus-linkshell`, `open-about`. The handlers in `v01-app.jsx`
  (`handleNavAction`) show the production mapping.
- Disabled rows (PlayerFrame, Party list) are catalog-only — they
  render but don't fire actions. The `v0.2` / `v0.3+` badge tells the
  user when the row will become active.

### Tactics Popout

- Open via click on the chip (default mode). Open animation: 220ms
  ease-out, fade + translateY(-6px → 0).
- Close conditions: click outside, click the × button, Esc keypress,
  click the chip again.
- For mode=hover: chip mouseenter sets `hoverPreviewing=true`; chip
  mouseleave clears it; chip click pins it (`popoutOpen=true`).
- For mode=floating: dropdown loses the arrow, gets a drag-cursor on
  its header; dragging the header repositions the popout in stage
  coordinates.
- The popout's anchor rect is sampled from the DOM (`[data-anchor="tactics"]`)
  and re-sampled every 100ms while open so the popout follows the
  toolbar if the user drags it during edit mode.
- The "Open Full Audit" button posts a one-shot
  `WantsAuditOnNextDraw=true` to the Tonberry Tactics plugin.

### About / Chronicle modal

Opened only from the Suite Navigator's Chronicle row. Esc closes; the
scrim is click-to-dismiss.

### Loading state

- When the audit is computing, the tactics chip shows `— / —` value and
  no Stab.-voice annotation.
- Popout score ring renders the track but no progress arc; the number
  shows as `…`.
- Headline reads `Auditing your equipped gear…`; quip reads
  `"The Onion is consulting its lists."`

### Empty state

- When the audit returns zero findings, the chip shows `OK` severity:
  no pip, green border, `Stab…` voice.
- Popout body shows the empty-state block: `vibing-emote.gif` mascot,
  `No findings` heading, the Grub-Grub quip in the body section.

---

## State Management

Plugin-side state (persisted to disk):

| Key                  | Type             | Default     | Notes |
|----------------------|------------------|-------------|-------|
| `theme`              | enum             | `dark`      | dark / light |
| `accent`             | enum             | `ember`     | ember / gold / cyan / violet / crimson |
| `severityPalette`    | enum             | `classic`   | classic / leaf / ember-only |
| `toolbarShape`       | enum             | `pill`      | pill / full / edge-top / edge-bottom |
| `toolbarOpacity`     | float (0.3–1.0)  | `1.0`       |  |
| `toolbarX`           | int (px)         | center-x    | only used when `toolbarShape=pill` |
| `toolbarY`           | int (px)         | `18`        | only used when `toolbarShape=pill` |
| `popoutMode`         | enum             | `click`     | click / hover / floating |
| `editVisual`         | enum             | `dashed`    | dashed / solid-glow / tinted |
| `floatingPopoutX`    | int              | `1280`      | only when popoutMode=floating |
| `floatingPopoutY`    | int              | `110`       | only when popoutMode=floating |

Per-session (not persisted):

- `popoutOpen` (bool) — popout pinned visible
- `hoverPreviewing` (bool) — only when popoutMode=hover; cleared on
  mouseout
- `editMode` (bool) — exits on Esc; does not persist

Read from Tonberry Tactics plugin (one-shot or polled per frame):

- `auditScore` (int 0–100, nullable when loading)
- `auditFindings` ([{ id, severity, title, body, stab }])
- `lastAuditAt` (timestamp)
- `playerSummary` (string — "ilvl 730 · Onion Knight (NIN)")

Cross-plugin signals (per principle "one-shot flags"):

- `WantsAuditOnNextDraw` — TLF HUD sets this; Tonberry Tactics
  consumes-and-resets on its next draw.

---

## Design Tokens

The tokens below split into **v2-preserved** (do not rename — they
already exist in `ui-package-v2/hud.css` and are consumed by the
Tonberry Tactics plugin and the website) and **v0.1-new** (added for
this surface). Both are defined in `v01/v01.css`.

### v2-preserved tokens (Frost UI authentic + Onion Knight ember)

```
--fr-bg            rgba(20, 22, 28, 0.90)
--fr-bg-darker     rgba(14, 16, 22, 0.95)
--fr-secondary     rgb(58, 62, 72)
--fr-ternary       rgb(178, 178, 181)
--fr-fg            rgb(242, 242, 245)
--fr-fg-2          rgb(190, 196, 208)
--fr-fg-3          rgb(135, 145, 162)
--fr-fg-4          rgb(80, 90, 105)
--fr-outline       rgba(178, 178, 178, 1.0)
--fr-outline-soft  rgba(178, 178, 178, 0.45)

--fr-accent        #D67B3C   (ember — Onion Knight accent; replaces Frost UI's default blue)
--fr-accent-bright #F2A057
--fr-accent-deep   #A85820
--fr-accent-glow   0 0 12px rgba(214,123,60,0.55), 0 0 28px rgba(214,123,60,0.28)

--fr-proc          rgb(255, 173, 56)
--fr-tank          rgb(81, 104, 204)
--fr-healer        rgb(135, 204, 81)
--fr-dps           rgb(204, 81, 81)

--fr-stroke               2px
--fr-stroke-standalone    4px
--fr-corner-standalone    22px
--fr-corner-other         10px
```

Legacy aliases (kept for compat with v2 components):

```
--ember         = --fr-accent
--ember-bright  = --fr-accent-bright
--ember-deep    = --fr-accent-deep
--ember-glow    = --fr-accent-glow
--frost-fg-1    = --fr-fg
--frost-fg-2    = --fr-fg-2
--frost-fg-3    = --fr-fg-3
--frost-border-1  rgba(178, 178, 178, 0.22)
--frost-border-2  = --fr-outline-soft

--hp-green       #6FBF6A     (used in tactics chip OK state)
```

Severity tokens (new in v0.1; controlled by `data-severity` attribute):

```
[data-severity="classic"]    (default)
  --sev-critical  = --fr-accent       (#D67B3C)
  --sev-warning   = #E2C36A
  --sev-note      = #7FC9EE

[data-severity="leaf"]
  --sev-critical  = --fr-accent
  --sev-warning   = #E2C36A
  --sev-note      = #6FBF6A

[data-severity="ember-only"]
  --sev-critical  = #D67B3C
  --sev-warning   = #F2A057
  --sev-note      = #C89A6E
```

### v0.1-new tokens (TLF HUD-specific)

All prefixed `--tlf-toolbar-*`, `--tlf-popout-*`, or `--tlf-editmode-*`
so they don't collide with v2 or the website.

```
/* Toolbar */
--tlf-toolbar-bg            rgba(20, 22, 28, 0.92)
--tlf-toolbar-opacity       1
--tlf-toolbar-height        44px
--tlf-toolbar-pad-x         10px
--tlf-toolbar-pad-y         6px
--tlf-toolbar-gap           6px
--tlf-toolbar-radius        10px
--tlf-toolbar-border        1px solid var(--fr-outline-soft)
--tlf-toolbar-shadow        0 12px 32px rgba(0,0,0,0.55),
                            0 0 0 1px rgba(0,0,0,0.4),
                            inset 0 1px 0 rgba(255,255,255,0.06)
--tlf-toolbar-shadow-edit   0 0 0 2px var(--fr-accent),
                            0 16px 40px rgba(0,0,0,0.7),
                            0 0 36px rgba(214,123,60,0.35)

/* Widget chip */
--tlf-widget-bg             rgba(0,0,0,0.28)
--tlf-widget-bg-hover       rgba(214,123,60,0.10)
--tlf-widget-border         1px solid var(--frost-border-1)
--tlf-widget-radius         5px
--tlf-widget-pad-x          10px
--tlf-widget-pad-y          4px
--tlf-widget-min-h          36px

/* Brand chip */
--tlf-brand-bg              linear-gradient(180deg, rgba(214,123,60,0.22), rgba(214,123,60,0.06))
--tlf-brand-bg-hover        linear-gradient(180deg, rgba(214,123,60,0.34), rgba(214,123,60,0.10))
--tlf-brand-border          1px solid var(--ember)
--tlf-brand-radius          6px

/* Popout */
--tlf-popout-bg             rgba(14, 16, 22, 0.96)
--tlf-popout-border         2px solid var(--fr-outline)
--tlf-popout-radius         8px
--tlf-popout-width          380px
--tlf-popout-max-h          540px
--tlf-popout-shadow         0 18px 48px rgba(0,0,0,0.75),
                            0 0 32px rgba(214,123,60,0.18)
--tlf-popout-arrow-size     12px
--tlf-popout-offset         10px

/* Edit mode */
--tlf-editmode-outline      2px dashed var(--fr-accent)
--tlf-editmode-offset       6px
--tlf-editmode-bg-tint      rgba(214,123,60,0.10)
--tlf-editmode-handle       var(--ember)
```

### Typography

```
--font-display   'Cinzel', 'Trajan Pro', serif         (headings, labels, buttons)
--font-body      'Cinzel', 'Trajan Pro', serif         (same family as display)
--font-quote     'Cormorant Garamond', Georgia, serif  (italic quips, Stab. voice, finding bodies)
--font-mono      'JetBrains Mono', 'Menlo', monospace  (numerics, score, meta)
--font-rune      'Eorzea', 'Cinzel', serif             (ornamental rune accents only)

--ls-eyebrow     0.22em   (uppercase labels)
--ls-heading     0.06em   (display headings)
```

Type scale in v0.1:

- 8px (widget labels, all-caps) · Cinzel 600
- 9px (popout eyebrow, all-caps) · Cinzel 600
- 10px (banner labels, button text) · Cinzel 700–800
- 11px (widget values, tooltip lines, finding titles) · varies
- 12–12.5px (body quips, finding body) · Cormorant Garamond italic
- 13px (popout title, empty-state heading) · Cinzel 700–800
- 14px (popout headline, finding score number) · Cinzel 700
- 16px (score ring number) · JetBrains Mono 700

### Spacing & radii summary

- Page padding (toolbar from top): 18px
- Toolbar inner padding: 6px × 10px, gap 6px
- Widget inner padding: 4px × 10px, gap 8px
- Popout inner padding: 14px outer, 10px row gap, 10px–14px section padding
- Radii: 4px (button) · 5px (widget) · 6px (brand chip) · 8px (popout, edit
  banner) · 10px (toolbar) · 50% (close button, pip)

### Shadows

All warm-tinted (no neutral grey) — see token block above for the
exact stacks.

---

## Runtime port — token → Una.Drawing → ImGui

Una.Drawing maps almost 1:1 to CSS. ImGui needs explicit Vector4 colors
and pixel math. For each token category:

### Colors

| CSS                              | Una.Drawing                       | ImGui (Vector4)                    |
|----------------------------------|-----------------------------------|------------------------------------|
| `#D67B3C`                        | `Color("#D67B3C")`                | `new Vector4(0.840f, 0.482f, 0.235f, 1f)` |
| `rgba(20,22,28,0.92)`            | `Color(20,22,28,0.92f)`           | `new Vector4(0.078f, 0.086f, 0.110f, 0.92f)` |
| `rgba(214,123,60,0.18)` gradient | gradient via stacked nodes        | manual `ImDrawList.AddRectFilledMultiColor` |

Recommendation: in the plugin, centralize all colors in a static
`TlfTokens.cs` (or similar) so any future palette change is one file.
The CSS file in this handoff is the source of truth — match its hex
values exactly.

### Sizes

CSS pixels = Una.Drawing logical px = ImGui pixels (no DPI math required
beyond what Dalamud already does globally). Use `int` or `float` literals
matching the token values.

### Borders

- 1px solid: `node.Style.BorderWidth = 1; node.Style.BorderColor = …;`
- 2px solid (popout): same with 2
- Dashed borders (`--tlf-editmode-outline`): Una.Drawing has no native
  dashed-stroke support today. If/when needed, fall back to a manual
  9-slice or stacked-node hack. The `solid-glow` variant is the safer
  default; the `dashed` variant is currently flagged as **polish —
  optional**.

### Backdrop blur

`backdrop-filter: blur(20px) saturate(1.2)` doesn't translate to
Una.Drawing today. Drop it. The flat fill at `alpha=0.92` is the
implementation reality — it's the same chrome on a slightly darker
background.

### Gradient fills

The toolbar's brand-chip gradient and the tactics chip's "open"
gradient should be implemented as either:
1. A stacked semi-transparent node (top layer at higher opacity,
   bottom at lower) — fine if Una.Drawing's compositing handles
   this cheaply; or
2. A `ImDrawList.AddRectFilledMultiColor` call directly in the
   tactics chip's `OnDraw`.

If neither is fast/clean, a flat ~`rgba(214,123,60,0.14)` averaged
fill is an acceptable degradation.

### Animations

CSS uses 180–240ms ease-out (`cubic-bezier(0.2, 0.6, 0.2, 1)`). In the
plugin, lerp on a per-frame basis at `dt * (1 / 0.22f)` for entrance
and `dt * (1 / 0.18f)` for hover state changes. If frame rate is the
gating factor, snap instead of lerping — better an instant transition
than a janky one.

### Backdrop / opacity

Toolbar opacity (`--tlf-toolbar-opacity`) applies to the toolbar's root
node only; child contents stay at full opacity. In Una.Drawing this is
either a root-node `Opacity` style or applying alpha multiplication only
to the root's fill/border colors. **Do NOT propagate** it to mascot
GIFs / text — the values would become unreadable below ~0.7.

---

## Refia / Grub-Grub voice rules

These are summarized from `context/04-DESIGN_PRINCIPLES.md`. **Do not
deviate.**

- **Severity color is on the issue itself.** Border-left color, icon
  color, score-ring color. These are visual states.
- **`Stab.` / `Stab?` / `Stab…` is a SEPARATE annotation** in Cormorant
  Garamond italic. This is Grub-Grub's voice, not Refia's. The
  declarative `Stab.` matches critical, the questioning `Stab?` matches
  warning, the trailing-off `Stab…` matches note / all-clear.
- **Both are independently toggleable.** The codebase should not couple
  severity color and stab-voice in a single switch statement. If a user
  setting later disables the voice annotation, severity colors remain.
- **No emoji. No `!`.** Microcopy is factual sentence first, character
  flourish second.
- **Cork accent stays light in UI.** Words like "Adventurer", "Friend",
  "Carry on", "Fixable in under a minute" — fine. `Oi'm fixin' ta`
  — not fine in v0.1 UI text. Reserve thicker Cork for the About panel
  and merch contexts.

Voice strings used in v0.1 are listed in `v01/v01-data.jsx`:
- `TLF_TACTICS_VOICE` — the chip-level Stab voice and tooltip quip
- `TLF_BRAND_VOICE` — brand chip, linkshell chip, config tooltips
- `TLF_AUDIT_SCENARIOS` — the demo audit headlines + quips

---

## Assets

All in `assets/` — **use as-is, do not redraw, do not recolor**.

| File                                | Source                                | Use in v0.1 |
|-------------------------------------|---------------------------------------|--------------|
| `assets/helm-avatar.png`            | brand canon, ui-package-v2            | Brand chip, masked into a 30px circle (object-position 50% 35%) |
| `assets/wordmark.png`               | brand canon, ui-package-v2            | Reserved for About panel; not used in v0.1 toolbar |
| `assets/shield-crest.png`           | brand canon, ui-package-v2            | Reserved; not used in v0.1 |
| `assets/rags-pixel.png`             | brand canon                           | Reserved (8-bit homage); not used in v0.1 |
| `assets/tonberry/stab-emote.gif`    | brand canon                           | Tactics chip mascot, popout header mascot |
| `assets/tonberry/heart-emote.gif`   | brand canon                           | Reserved (affection variant); not used in v0.1 |
| `assets/tonberry/vibing-emote.gif`  | brand canon                           | Linkshell chip mascot, popout empty-state mascot |
| `assets/tonberry/stab-sticker.gif`  | brand canon                           | Reserved (larger sticker variant) |
| `assets/tonberry/heart-sticker.gif` | brand canon                           | Reserved |
| `assets/tonberry/vibing-sticker.gif`| brand canon                           | Reserved |
| `fonts/Eorzea.ttf`                  | Square Enix, 2010 (community use)     | The `« TLF »` rune accent on the brand chip. **Ornament only** — do not set body or UI text in it. |

Lucide icons used (CDN: `lucide@0.469.0`):

- `map-pin` — Zone widget
- `flame` — Weather (Ember Showers)
- `clock` — Clock widget
- `settings-2` — Config widget
- `alert-octagon` — Critical finding
- `alert-triangle` — Warning finding
- `info` — Note finding

For the Dalamud plugin, swap Lucide for equivalent stroke-only SVG
icons (1.5–2px stroke, rounded line caps). The Lucide list is the
shopping list; the visual register is "thin stroke, slightly rustic
geometry."

---

## Files in this bundle

### Files in this bundle

### Top-level docs

```
README.md                       This file. Implementation-level visual / interaction spec.
RUNTIME_PORT.md                 ★ Tokens → Una.Drawing → ImGui port doc. Read second.
```

### Reference / context (read first)

```
context/00-README.md           Kickoff package overview
context/01-DESIGN_BRIEF.md     The brief — vision, scope, open questions
context/02-LOCKED_DECISIONS.md Three locked architectural decisions
context/03-PLUGIN_LANDSCAPE.md What the suite replaces over time
context/04-DESIGN_PRINCIPLES.md Cross-surface rules — voice, tokens, behavior
```

### Design source (the runnable prototype)

```
TLF HUD v0.1.html              Entry — open in a browser to run
v01/v01.css                    All tokens + chrome
v01/v01-data.jsx               Voice copy, accent palettes, demo data
v01/v01-scene.jsx              FFXIV placeholder backdrop
v01/v01-toolbar.jsx            Compact pill toolbar + drag + tooltips
v01/v01-popout.jsx             Anchored / floating Tactics popout
v01/v01-navigator.jsx          ★ NEW — Suite Navigator (brand-chip popover)
v01/v01-app.jsx                Main app, tweaks wiring, About modal, state
tweaks-panel.jsx               Tweaks panel host (shared with v2)
```

### Brand assets (do not redraw)

```
assets/helm-avatar.png
assets/wordmark.png
assets/shield-crest.png
assets/rags-pixel.png
assets/tonberry/stab-emote.gif
assets/tonberry/heart-emote.gif
assets/tonberry/vibing-emote.gif
assets/tonberry/stab-sticker.gif
assets/tonberry/heart-sticker.gif
assets/tonberry/vibing-sticker.gif
fonts/Eorzea.ttf
```

---

## Open questions for the next pass

Captured here so they're not lost — these are NOT v0.1 blockers:

1. **Drag handle in `solid-glow` and `tinted` edit visual variants.** The
   current implementation always shows the left-edge dot handle when
   `shape=pill`. Should the handle hide for `tinted` (since "tinted only"
   reads as a minimalist preference)?
2. **Hover-mode dismiss latency.** Currently the hover-preview pop clears
   instantly on mouseout. A 120–180ms delay would feel less twitchy.
3. **Edit-mode keybind.** v0.1 has Esc to exit but no keybind to enter.
   Should be added in v0.2 alongside the layout editor for non-toolbar
   surfaces.
4. **Navigator search / fuzzy-find.** If the navigator grows past 8
   rows (v0.3+ as more widgets get absorbed), a search input may be
   warranted. Skip for v0.1.
