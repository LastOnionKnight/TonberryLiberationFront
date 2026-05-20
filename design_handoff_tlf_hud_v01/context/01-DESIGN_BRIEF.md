# Tonberry Liberation Front — Suite Design Brief

## 1. Vision

**The TLF Suite is a family of FFXIV Dalamud plugins under one visual,
narrative, and architectural identity.** It replaces, over time, the
constellation of one-off plugins a typical user installs — gear advisors,
HUD overlays, character-panel mods, toolbars — with a coherent
Refia-branded experience.

Three plugins are in scope:

1. **Tonberry Tactics** (in flight; ships v1.0 separately on its own
   roadmap) — gear and materia optimization. The "Ask Mr. Robot for FFXIV."
   Replaces CharacterPanelRefined.

2. **TLF HUD** (new — this design pass) — HUD overhaul. Player frame,
   party list, target frame, buffs, hotbars, chat, toolbar, layout
   editor. Replaces Kingdom Hearts Bars and Umbra.

3. **Future TLF widgets / utilities** (TBD) — depending on how many of
   the user's existing plugins prove worth absorbing into TLF.

The end state is a user who has uninstalled CharacterPanelRefined,
Kingdom Hearts Bars, Umbra, and possibly DelvUI, and replaced all of
them with TLF Suite plugins. Each TLF plugin is independently shippable
and independently versioned, but visually and conceptually unified.

## 2. What this design pass produces

The output of THIS pass is the **TLF HUD plugin v0.1 design package**,
delivered in the same shape as the prior v2 package:

- Component recipes (JSX-or-equivalent for browser preview)
- CSS-token system extending the existing v2 tokens
- Una.Drawing-compatible style descriptions (TLF HUD's runtime is
  Una.Drawing on top of Dalamud's ImGui — see decision #2)
- Asset organization (portraits, emotes, logos, decorative glyphs)
- Behavior-state specs (HP green/yellow/red, audit critical/warning/note,
  combat/danger/hurt portrait swaps, etc.)
- Layout-mode specs (window edit mode, drag/resize handles, snap zones)

**This pass is additive, not replacement.** The v2 design package
(`ui-package-v2/`) defines the shared design language. The HUD plugin
v0.1 is the FIRST new runtime to ship under that language. The Tonberry
Tactics plugin will adopt the same language at v0.7+. The website lands
the language whenever it ships. **Do not redo the v2 tokens.** Extend them.

## 3. v0.1 MVP scope (TLF HUD)

The full HUD design from v2 includes 8 draggable windows + a toolbar +
a tactics popout + a tweaks panel + decorations. **v0.1 is intentionally
smaller** so the plugin ships in weeks, not months. v0.1 scope:

### In v0.1

- **TLF unified toolbar (top of screen)** — brand chip, clock, accent
  selector, audit-state indicator that opens the Tactics Popout. This
  is the visible-on-day-one Refia presence. Replaces Umbra's topbar
  pattern.
- **Tactics Popout** — the TT data bridge. Already designed in v2;
  ports cleanly. Audit score ring, top findings list with Refia "Stab.
  / Stab? / Stab…" severity voice, "Open Full Audit" CTA that opens
  the Tonberry Tactics window.
- **Tweaks panel (minimal)** — theme (dark/light), accent (5 palettes),
  opacity. Edit-mode toggle. NOT full v2 tweaks (no portrait
  positioning, no particle density, no scanlines yet).
- **Layout edit mode** — only the toolbar is repositionable in v0.1.
  Other surfaces don't exist yet.

### NOT in v0.1 (later versions)

- PlayerFrame (HP/MP/portrait/limit-break) — v0.2 or v0.3
- Party list — v0.2+
- Target frame — v0.2+
- Buff strip — v0.3+
- Hotbar — v0.4+ (not sure we ever want to own this; FFXIV's native
  hotbars are fine)
- Chat panel — v0.4+ (same caveat — native chat is fine)
- Currency / Purse — v0.4+
- Decorations (crystal tower silhouette, fog, ember particles, aether
  motes) — gradual addition v0.2+
- Scanlines / portrait positioning / particle density tweaks — gradual

The v0.1 scope above is the **minimum** that establishes the TLF HUD's
presence on screen, hooks the Tactics Popout into Tonberry Tactics data,
and lets us start iterating without taking on KH Bars' full surface
area on day one.

## 4. What design decisions are open

This pass should produce concrete answers for:

### a. Toolbar shape

The v2 design has a single toolbar at top. For v0.1, should it be:
- Full-width top strip (Umbra style)
- Compact pill (drag-anywhere, default top-center)
- Edge-docked (top, bottom, left, right — user picks)

Recommend the design picks one as default and notes the others as
opt-in tweaks for v0.2.

### b. Tactics Popout invocation

The v2 design has the popout opening from a toolbar button. v0.1
should specify:
- Toolbar widget (the audit-state indicator) is what opens it
- Visual treatment of the indicator (icon, gradient, ring)
- Hover preview vs click-to-open

### c. Accent picker UX

The v2 design has 5 accent palettes. v0.1 picker should specify:
- Inline swatch row in Tweaks panel? Dropdown? Modal palette browser?
- Color preview while hovering (live recolor of toolbar)
- Persistence (user choice survives restart)

### d. Edit mode visual

When user enters layout-edit mode, what changes visually?
- Toolbar gains a drag handle outline?
- Background tint to signal "edit state active"?
- ESC-to-exit hint?

### e. Refia voice integration

The Tactics Popout already uses "Stab. / Stab? / Stab…" as severity
annotations. The Toolbar's audit-state indicator should reflect the
same voice in some compressed form. What does that look like in a
30-pixel-tall toolbar widget?

## 5. Constraints

**Three architectural decisions are locked** (see `02-LOCKED_DECISIONS.md`).
Read that file. Don't propose alternatives.

In summary:
1. Frost UI is **inspiration only**, not a runtime dependency. We bake
   our own copy of the relevant tokens.
2. Una.Drawing is used **only in TLF HUD**, not in Tonberry Tactics.
3. PlayerFrame **replaces** KH Bars (eventually) but does so **in stages**.
   v0.1 ships without PlayerFrame.

## 6. Runtime context for TLF HUD

The TLF HUD plugin runs as a Dalamud plugin on top of FFXIV. It draws
its UI using **Una.Drawing**, a CSS-like declarative styling layer built
by the Umbra plugin author. Una.Drawing maps cleanly to HTML/CSS in
intent, so the design tokens from v2 should translate ~1:1.

Brian's installed Umbra source is in `inspiration/` for reference — but
the TLF HUD plugin is independent of Umbra; it just uses the same
drawing library.

The Tonberry Tactics plugin (separate repo, separate runtime) uses raw
ImGui via Dalamud's bindings, not Una.Drawing. When TT adopts these
tokens at v0.7+, the design tokens will be hand-translated to ImGui
`Push*Color` calls. So tokens must be expressed in a way that maps to
both runtimes:

- Color values as hex or RGBA (Una.Drawing parses, ImGui needs Vector4)
- Spacing as numeric pixels (both runtimes use pixel math)
- Border styling as "1px solid color" recipes (both runtimes can draw)
- Font specifications as family + size + weight (both can resolve)

**Do not specify CSS box-shadow, blur filters, or other browser-specific
effects unless we agree they're optional polish that a runtime can skip.**

## 7. Asset inventory

Already on hand (see `ui-package-v2/assets/`):

- `portrait-combat.png`, `portrait-combat-alt.png` — cyan-glow combat
  portraits, transparent bg
- `portrait-danger.png`, `portrait-danger-alt.png` — red-halo danger
  portraits, transparent bg
- `helm-avatar.png` — full-helm icon for brand chip
- `shield-crest.png` — Onion shield for crest variants
- `wordmark.png` — "The Last Onion Knight" wordmark
- `rags-pixel.png` — pixelated Refia variant (8-bit homage)
- `tonberry/stab-emote.gif` and `tonberry/stab-sticker.gif` — Stab.
  mascot animations (used in Tactics Popout)
- `tonberry/heart-emote.gif`, `heart-sticker.gif` — affection variants
- `tonberry/vibing-emote.gif`, `vibing-sticker.gif` — neutral variants

Not yet on hand — Claude Design may need to spec:

- Toolbar widget glyphs (clock, audit indicator, edit-mode handle)
- Accent palette swatches as preview elements
- "Empty state" Tonberry illustration for the Tactics Popout when
  there are zero findings (could reuse `vibing-emote` from the existing
  set)

## 8. Tonberry Tactics — current state (for context)

Tonberry Tactics is at v0.6.6.4 today. Visual treatment is "TlfTheme"
(gold/navy), the legacy palette. It adopts the v2 ember/frost-blue
language at v0.7+ during the Plan-tab paste UI ship. At v1.0 the entire
TT plugin is in the new language and the old TlfTheme is deleted.

TT's Materia tab was just merged: Stat Sheet + Plan share one default
landing, with right-aligned `[Audit ▸]` and `[Pure math / Balance preset]`
toggles. The Current Gear tab was just removed (redundant with the
Character tab's Equipped Gear section). These changes are reflected in
the latest plugin source (`plugin/GearGoblin/`).

The website (`website/`) is a Blazor WASM app deployed to
`tonberrytactics.pages.dev`. It currently ships the v2 design language.
Brian will add the source folder to this package.

## 9. Future phases (not v0.1)

For Claude Design's awareness — not deliverables for THIS pass:

- **v0.2+**: PlayerFrame (KH Bars replacement), Party list, Target frame
- **v0.3+**: Buff strip, more decorations, accent picker variants
- **v0.4+**: Hotbar, Chat panel, Currency
- **v1.0**: PlayerFrame is feature-complete, KH Bars uninstalled,
  Umbra uninstalled, the suite stands on its own

Long-term we may also absorb DelvUI's job-gauge surface, Honorific's
title rendering, ChatBubbles' chat bubbles, and a few other widgets.
The plugin landscape (`03-PLUGIN_LANDSCAPE.md`) catalogs the candidates.

## 10. Success criteria for this design pass

The pass succeeds if:

- ✅ TLF HUD v0.1 has a concrete component spec for toolbar + tactics
  popout + tweaks panel, sufficient to implement in a few weeks
- ✅ Tokens extend `ui-package-v2/hud.css`'s existing `--fr-*` /
  `--ember*` system without renaming or breaking it
- ✅ Una.Drawing-compatible style recipes (or close enough that the
  port is mechanical, not interpretive)
- ✅ Behavioral state specs are explicit for every visible element
  (combat/idle/edit-mode for toolbar; loading/loaded/empty for
  tactics popout)
- ✅ The pass does NOT re-design TT's existing surfaces — those are
  carried forward via tokens
- ✅ Refia voice integration is concrete (specific copy for at least
  3 toolbar states)
- ✅ Assets are organized in a folder structure the implementation
  pass can lift directly

Hand the output back as a single ZIP, same shape as the v2 package.
