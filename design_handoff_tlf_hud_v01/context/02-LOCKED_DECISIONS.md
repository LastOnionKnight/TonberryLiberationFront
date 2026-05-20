# Locked Architectural Decisions

These three decisions are settled. **The design pass should not propose
alternatives, ask clarifying questions about them, or revisit the
reasoning.** They are inputs, not negotiables.

---

## Decision 1 — Frost UI is inspiration, not dependency

**Choice:** TLF HUD bakes its own copy of the Frost UI token system
into the plugin's `Theme/` folder. Frost UI does NOT need to be
installed for TLF HUD to work.

**Rejected alternative:** Hard dependency on Frost UI being installed,
with TLF HUD layering on top.

**Why:** A unified-design-hub workflow with multiple runtime targets
(TLF HUD's Una.Drawing, Tonberry Tactics' raw ImGui, the website's
CSS) only works if the tokens travel WITH each runtime. Adding a
runtime dependency just to share tokens is the opposite of that. Each
TLF plugin is self-contained.

**Implication for design pass:** Use Frost UI vocabulary freely as
inspiration (it's a known FFXIV plugin aesthetic — users recognize
it). Cite the spec sources where helpful. But express the design as
self-contained tokens, not as Frost UI overrides.

---

## Decision 2 — Una.Drawing in TLF HUD only

**Choice:** TLF HUD plugin uses Una.Drawing (the CSS-like declarative
styling library used by Umbra) as its UI layer. Tonberry Tactics
plugin stays on raw ImGui via Dalamud bindings.

**Rejected alternatives:**
- Una.Drawing in both plugins (would require lifting library into TT)
- Raw ImGui in both plugins (would lose Una.Drawing's clean token mapping)

**Why:** TT is already shipping with raw ImGui and a working TlfTheme
helper. Forcing Una.Drawing into TT now is busywork. TLF HUD is a new
plugin with no legacy, and Una.Drawing's CSS-style declarations map
1:1 to the design tokens. The Umbra-style toolbar pattern Brian wants
in TLF HUD is Una.Drawing's home turf. Best tool per plugin.

**Implication for design pass:** Tokens, recipes, and behavior specs
for TLF HUD should be expressed in a way that Una.Drawing can consume
directly (selector-style names, CSS-property-style values). They
should ALSO be expressible in ImGui terms (Vector4 colors, pixel math)
so the same tokens can be lifted into TT at v0.7+. Avoid Una.Drawing-
specific or ImGui-specific features that can't translate.

**Re-evaluation point:** At Tonberry Tactics v1.0+, we may decide to
lift Una.Drawing into TT too. Not a decision for this pass.

---

## Decision 3 — PlayerFrame replaces KH Bars, but in stages

**Choice:** TLF HUD's PlayerFrame component (HP/MP/portrait/limit-break
ring per the v2 design) is intentionally a KH Bars replacement. But
v0.1 ships WITHOUT it. PlayerFrame lands in v0.2 or v0.3.

**Rejected alternatives:**
- Coexist with KH Bars forever (TLF HUD never owns HP/MP) — too
  small a scope long-term
- Ship PlayerFrame in v0.1 (too big to verify cleanly in one ship)

**Why:** v0.1 needs to ship in weeks. PlayerFrame is the most
visually-charged surface in the whole suite, and getting HP color
transitions, limit-break gauge math, portrait-state swapping, and
ring geometry right is months of polish. We sequence it so the
toolbar + tactics popout get real users on day one, then PlayerFrame
arrives as the headline v0.2 ship.

**Implication for design pass:** v0.1 design should NOT include
PlayerFrame specs. They're in v2 already; carry them forward to v0.2.
v0.1's plugin will explicitly NOT replace KH Bars (KH Bars stays
installed alongside). Users who want the full TLF HUD experience
install both during the transition. v0.2's PlayerFrame is the
"uninstall KH Bars now" moment.

---

## Cross-cutting: the suite is incremental

These three decisions share a meta-principle:

**TLF Suite is a long road, not a big bang.** v0.1 of each plugin
ships small. The next several versions extend gradually. The user's
existing plugin stack is replaced ONE plugin at a time, not all at
once. Brian has 74 plugin configs installed today. He'll have 73 the
day he uninstalls CharacterPanelRefined (Tonberry Tactics v0.7 lands
this). He'll have ~70 a year from now as TLF HUD absorbs KH Bars,
Umbra, and maybe one or two others. That's the cadence. Design
accordingly.
