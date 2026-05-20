# TLF Design Principles

Cross-surface rules. These apply equally to Tonberry Tactics, TLF HUD,
the website, and any future suite addition.

---

## Visual

**Tokens, not compositions.** The design system delivers reusable
tokens (`--ember`, `--frost-soft`, `--win-radius-top`) and recipes
(card chrome, severity badge, audit row), not pre-baked Photoshop
comps. Every runtime — Una.Drawing, ImGui, CSS — implements the
tokens locally. Compositions are samples, not source-of-truth.

**Frost UI is the visual vocabulary.** Window chrome, outline weights,
corner radii, type stack — all anchored in the Sevii77/frost_ui spec.
Our ember accent (`#D67B3C`) replaces Frost UI's default blue. Other
accents (gold, cyan, violet, crimson) are alternate user preferences.

**Doubled inner frame is the chrome signature.** Outer 2px border at
0px inset; inner 1px hairline at 6px inset. Optional ember-diamond
corner markers at 55% alpha. This pattern repeats on every TLF window
(plugin and HUD).

**Severity = ember / yellow / cyan, Refia voice = Stab. / Stab? /
Stab….** Critical issues are ember. Warnings are yellow. Notes/info
are cyan. The accompanying Refia annotation pill is the matching
voice: declarative for critical, questioning for warning, trailing-off
for note. These are SEPARATE elements — the severity color is on the
issue itself, the Stab voice is the annotation. Both are independently
toggleable.

**No emoji in microcopy.** No `!` either. Microcopy is factual sentence
first, character flourish second (and only in About/empty-state /
celebration contexts). Refia's Cork voice stays in canon contexts
(in-game RP, music, About panel), NOT in error messages or option
labels.

---

## Behavioral

**One default landing per surface.** Don't make users toggle through
sub-views to find the primary content. Tonberry Tactics Materia tab
just merged Stat Sheet + Plan for this reason. TLF HUD toolbar should
similarly show the most important state without needing config.

**Toggle treatment over mode-switching.** When secondary states ARE
needed (e.g. Audit view, Balance preset), they're a small right-aligned
toggle button, not a top-of-page radio strip. Saves vertical space
and keeps the default landing free of UI debt.

**Cross-surface signals are one-shot flags.** When one surface needs
to focus / navigate / signal another, use a `WantsXOnNextDraw`
boolean that the receiving surface consumes-and-resets on its next
frame. No event buses, no observer patterns. ImGui/Una.Drawing's
single-threaded redraw model makes simple flags the cleanest path.

**Persistence is per-session unless the user explicitly saves.** Tab
state, mode toggles, accent picks — these persist across redraws
within the session but reset when the plugin reloads. Anything the
user explicitly clicks "Save" on (window positions, color theme)
persists to disk. Don't auto-save UI fiddling.

**No `/xlrestart` UX surprises.** Don't require the user to restart
the game to pick up changes. DLL toggle off/on is the worst we ask
of them.

---

## Voice

**Refia's voice has three registers** (from `LIGHT NOVEL SERIES NOTES`):

1. **War Survivor Mode** (book/serious prose) — quiet intensity,
   minimal speech, no snark. Use sparingly, only in narrative-heavy
   surfaces.
2. **Bardic Emotional Mode** (music, About-style) — confessional,
   accent more audible, pain filtered through metaphor.
3. **Gremlin Chaos Mode** (social/RP/UI) — onion wordplay permitted,
   surreal humor, cult-like branding sincerity. This is the register
   for TLF Suite UI text.

**Cork Irish accent** thickens when stressed/casual, drops when
deadly serious. UI text leans light — "Oi'm fixin' ta" or "Don't be
at that" are FINE in tooltips and About blurbs, NOT fine in error
banners.

**Grub-Grub the Stab** is the moral counterweight. The Tactics Popout
already uses `stab-emote.gif` as the mascot — this is the right
register. Severity annotations "Stab. / Stab? / Stab…" are Grub-Grub's
voice, not Refia's.

**Brand slogans** ("Wiping is for butts", "Cry now, peel later")
appear in: merch contexts, About panel cork-line rotation, FC event
banners. NOT in regular UI.

---

## Technical

**Every visible element has a behavior state spec.** Color/alpha/text
for: default, hover, active, disabled, loading. Don't ship a component
without specifying all five.

**Layout is mostly fixed; user-tunable axes are explicit.** Don't
build "everything flex" layouts. Pick fixed dimensions where it
serves and tunable axes (toolbar X/Y, portrait scale) where the user
benefits. The v2 design's `--portrait-scale`/`--portrait-x`/
`--portrait-y` CSS-var pattern is good.

**Accessibility: minimum 4.5:1 contrast on body text.** Frost UI's
defaults pass this. Don't introduce text colors below it. Ember-on-
dark passes. Yellow-on-dark passes. Frost-soft-on-dark is borderline;
fine for secondary text only.

**Tokens are runtime-agnostic.** Color values as hex/RGBA. Spacing as
pixels. Borders as "Npx style color" recipes. Fonts as family + size +
weight. Avoid: CSS box-shadow specifics, ImGui-only constants,
Una.Drawing-only selectors. If a token can't be expressed in all three
target runtimes, mark it as "polish — optional" in the spec.

---

## Suite consistency

**Window chrome is identical across plugins.** TT's plan-tab window
and TLF HUD's toolbar window use the same doubled-frame, same ember-
diamond corners, same opacity, same hairline gradient. A user switching
between them shouldn't feel they're in different applications.

**Brand chip is consistent.** The Refia helm avatar (with optional
"« TLF »" tag) appears in the same shape and color treatment whether
it's the TT plugin's Adventurer Plate hero, the TLF HUD toolbar's
brand chip, or the website's nav avatar.

**Tonberry mascot stays Tonberry-shaped.** No alternate mascots, no
auxiliary creatures. Grub-Grub the Stab is the only mascot. Variants
are emotional states of Grub-Grub (stab / heart / vibing), not
different characters.
