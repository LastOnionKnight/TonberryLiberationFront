# Tonberry Liberation Front — Dalamud Plugin Handoff Spec

**Status:** v0.1 design lock — ready for code implementation.
**Target:** Dalamud plugin (C# .NET 8) + Penumbra mod sidecar.
**Companion file:** `meta.yaml` (Penumbra colors / chrome / shape options).

This doc is for **Claude Code** to translate the HTML mockup
(`Tonberry Liberation Front.html`) into an actual FFXIV UI replacer. It is
intentionally exhaustive on the things the mockup can't render
(game-state hooks, ImGui style mapping, addon overrides) and minimal on
the things you can copy 1:1 from the JSX.

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Tonberry Liberation Front                                    │
│                                                              │
│  ┌────────────────────────┐    ┌─────────────────────────┐   │
│  │ TLF.Mod (Penumbra)     │    │ TLF.Plugin (Dalamud)    │   │
│  │                        │    │                         │   │
│  │ · meta.yaml options    │    │ · Custom widgets        │   │
│  │ · .tex color overrides │    │   (KH ring, Job Gauge,  │   │
│  │ · ImGui style profile  │    │   Limit, Cast Bar,      │   │
│  │ · Window chrome shapes │    │   Mascot perch)         │   │
│  │                        │    │ · Hides vanilla addons  │   │
│  │ (no code)              │    │   when its widget shows │   │
│  └─────────┬──────────────┘    └────────────┬────────────┘   │
│            │                                 │                │
│            └─────────── shared ──────────────┘                │
│                Accent preset + style tokens                   │
│                (plugin reads mod's current selection)         │
└──────────────────────────────────────────────────────────────┘
```

**Why split?** The Penumbra mod is what most users actually install — it
covers ~80% of the visual lift (colors, fonts, window shapes, ImGui
style). The plugin is opt-in for the custom KH-style widgets that
Penumbra can't express.

---

## 2. Token map — CSS → ImGui / Una.Drawing

The mockup uses CSS custom properties on `:root`. Every token has a
target binding in the plugin. **Authoritative source for token names is
`hud.css` lines 1–150**; the table below is the port map.

### 2.1 Color tokens

| CSS token | Vector4 RGBA | Penumbra slot | Notes |
|---|---|---|---|
| `--fr-bg` | `0.078, 0.086, 0.110, 0.90` | Background Color | Main window backdrop. Frost blur is faked via Una.Drawing's `BackgroundBlur` shader; passes through this alpha. |
| `--fr-bg-darker` | `0.055, 0.063, 0.086, 0.95` | derived from BG | `BackgroundBlur * 0.7` brightness; used for tooltips, popouts. |
| `--fr-secondary` | `0.227, 0.243, 0.282, 1.0` | Secondary Color | Buttons, inputs. |
| `--fr-fg` | `0.949, 0.949, 0.961, 1.0` | Foreground Color | Text / icons. |
| `--fr-fg-2` | `0.745, 0.769, 0.816, 1.0` | derived `Fg * 0.85` | Secondary text. |
| `--fr-fg-3` | `0.529, 0.569, 0.635, 1.0` | derived `Fg * 0.65` | Eyebrow / muted labels. |
| `--fr-outline` | `0.698, 0.698, 0.698, 1.0` | Outline Color | Window borders. **2px standalone window, 4px when stacked** per Frost UI spec. |
| `--fr-accent` | preset (Onion Ember = `0.839, 0.482, 0.235`) | Accent (chosen preset) | Primary brand color — see §3. |
| `--fr-accent-bright` | preset bright | derived `Accent * 1.18 brightness` | Hover state. |
| `--fr-accent-deep` | preset deep | derived `Accent * 0.72 brightness` | Press / pressed-medal state. |
| `--fr-castbar` | `1.0, 1.0, 1.0` | Castbar Color | Target cast bar fill. |
| `--fr-castbar-interrupt` | `0.9, 0.2, 0.1` | Castbar Interruptable Color | Cast bar during interrupt window. |
| `--fr-lb-charge` | `0.749, 0.875, 1.0` | Limit Break Charging Color | LB bar — partial segment. |
| `--fr-lb-full` | preset accent | Limit Break Full Color | LB bar — completed segment. **Defaults to current accent**, not blue. |
| `--fr-proc` | `1.0, 0.678, 0.220` | Proc Color | Action button proc ring. |
| `--fr-tank` | `0.318, 0.408, 0.800` | Tank Color | Tank role highlight. |
| `--fr-healer` | `0.532, 0.800, 0.318` | Healer Color | Healer role highlight. |
| `--fr-dps` | `0.800, 0.318, 0.318` | DPS Color | DPS role highlight. |
| `--hp-green` | `0.435, 0.749, 0.416` | (derived) | Player HP > 60%. |
| `--hp-yellow` | `0.886, 0.765, 0.416` | (derived) | Player HP 30–60%. |
| `--hp-red` | `0.761, 0.337, 0.337` | (derived) | Player HP < 30%. |

### 2.2 Shape / spacing tokens

| CSS token | Value | Maps to |
|---|---|---|
| `--fr-corner-standalone` | `22px` | `WindowRounding = 22.0` on detached windows |
| `--fr-corner-other` | `10px` | `WindowRounding = 10.0` on nested windows |
| `--shape-radius` | `6px` | `FrameRounding = 6.0` |
| `--fr-stroke` | `2px` | `WindowBorderSize = 2.0` |
| `--fr-stroke-standalone` | `4px` | `WindowBorderSize = 4.0` for detached windows |

The mockup exposes `window-style` and `shape-style` via the Tweaks
panel; the plugin reads these from Penumbra's option state at startup
(and on option change) and rebuilds the `ImGuiStylePtr`.

### 2.3 Type stack

- **Display / heading:** Cinzel (weights 400–900). UI ships an embedded
  WOFF2 in `TLF.Plugin/Resources/fonts/`; fall back to Trajan Pro.
- **Body:** Cinzel (we're not using Cormorant in the plugin half — too
  delicate at ImGui's nominal 14–16px sizes).
- **Monospace / numerics:** JetBrains Mono. Use `tnum` feature for all
  HP/MP/timer readouts so digits don't dance.
- **Rune ornament:** Eorzea.ttf. **Decorative only** — never set body or
  UI text in this font. Used for: party member subtitle ornaments, the
  "Onion Knight" L1 wordmark in the brand chip, the rune flavor lines
  on the Job Gauge.

---

## 3. Accent presets — 5 city-states (locked)

The mockup ships **five and only five** accent presets. No free RGB
picker — this is a deliberate design call. Each preset re-tints
`--fr-accent` family and the Limit Break Full color.

| Preset key | Primary `--fr-accent` | Bright | Deep | Display name | Heraldry |
|---|---|---|---|---|---|
| `ember` | `#D67B3C` (0.839, 0.482, 0.235) | `#F2A057` | `#A85820` | **Onion Ember** | Heralds of the Bastion (default) |
| `limsa` | `#3A86C8` (0.227, 0.525, 0.784) | `#6FB3EE` | `#1F5A95` | **Limsa Azure** | Maelstrom |
| `uldah` | `#D9A84A` (0.851, 0.659, 0.290) | `#F2CC72` | `#8F6E1F` | **Ul'dah Gold** | Immortal Flames |
| `gridania` | `#6FB23E` (0.435, 0.698, 0.243) | `#9EDB6E` | `#3F7820` | **Gridania Leaf** | Twin Adder |
| `ishgard` | `#7BB3D9` (0.482, 0.702, 0.851) | `#A8D2EE` | `#4A7A98` | **Ishgard Frost** | House Fortemps |

**Implementation:** store as a static `Dictionary<string, AccentPreset>`
in `TLF.Plugin/Config/Accents.cs`. The Penumbra meta.yaml `Accent Preset`
option sets a string key; the plugin watches the Penumbra config file
for changes and re-applies on switch.

---

## 4. Widget catalog — separate entities

> **Critical design rule:** Player parameter (HP/MP/Limit/Cast/Gauge) and
> Party parameter (per-member HP/MP/role) are **separate entities** with
> separate data sources. Do not couple them. The mockup makes this
> explicit by giving each its own draggable HudWindow.

### 4.1 PlayerFrame (HP ring + portrait + MP)
- **Mockup ref:** `hud-components.jsx › PlayerFrame`, `hud.css › .player-frame`
- **Data:** `IClientState.LocalPlayer` → `CurrentHp / MaxHp / CurrentMp / MaxMp`
- **Geometry:**
  - 200×200 SVG → 200×200 ImGui DrawList circle
  - HP arc: 280° sweep, radius 80px, stroke 12px, rotated +138°
  - Ember decorative outer ring at radius 90px / 94px
  - Center orb: 132px diameter, holds the helm portrait
- **State portraits** (swap based on HP%):
  | HP % | Portrait | Glow color |
  |---|---|---|
  | > 66% | `portrait-combat.png` | `#D67B3C` ember |
  | 33–66% | `portrait-combat-alt.png` | `#FFAD38` warning |
  | 10–33% | `portrait-danger.png` | `#FF5A3C` danger (pulse 1.6s) |
  | < 10% | `portrait-danger-alt.png` | `#FF281E` critical (pulse 0.8s) |
- **Replaces FFXIV addons:** `_ParameterWidget`, `_ParameterBar` (hide via Dalamud's `IGameGui.GetAddonByName + SetVisible(false)`)

### 4.2 PartyList (per-member HP/MP/role)
- **Mockup ref:** `hud-components.jsx › PartyList`, `hud.css › .party.kh`
- **Data:** `IPartyList[i]` for i in 0..7
- **Two render styles** (chosen via Penumbra option):
  - **KH Curl:** signature kingdom-hearts curl ornament SVG at HP bar tail. The curl path is `M 0 18 L 4 18 C 8 18 12 18 14 16 C 16 14 16 10 14 8 C 12 6 8 6 6 8 C 4 10 4 12 6 14 C 7 15 9 15 10 14` — stroke 4px, color matches HP threshold. Curl is 32×32 anchored at right edge, top: -8px.
  - **Classic:** plain horizontal HP/MP bars (Frost UI default look).
- **Replaces FFXIV addons:** `_PartyList`

### 4.3 LimitBreak (party-shared LB gauge)
- **Mockup ref:** `hud-components.jsx › LimitBreak`, `hud.css › .lb-widget`
- **Data:** `LimitBreakController` from FFXIVClientStructs → `(BarValue, BarCount)`
  - 3 segments × 10,000 units each = 30,000 max
  - `BarCount` = filled segment count (0..3)
  - `BarValue` = partial fill of the next segment in raw units
- **Geometry:** 3 equal segments, 4px gap, 22px height, accent gradient
- **MAX badge:** floating chip at top-right when `BarCount == 3`, accent-bright fill, italic display font
- **Replaces FFXIV addons:** `_LimitBreak`

### 4.4 PlayerCastBar (player-only)
- **Mockup ref:** `hud-components.jsx › PlayerCastBar`, `hud.css › .pcb-widget`
- **Data:** `IClientState.LocalPlayer.IsCasting / CurrentCastTime / TotalCastTime / CastActionId`
- **Idle state:** shows "Ready" + rune flavor line; bar collapses
- **Slidecast tick:** 2px vertical marker at 80% of total time (player can move from this point without canceling); always rendered, never absorbs alpha
- **Interrupt window:** first 0.5s of cast → fill switches to `--fr-castbar-interrupt` color
- **Replaces FFXIV addons:** `_CastBar`

### 4.5 JobGauge — Onion Knight (custom job)
- **Mockup ref:** `hud-components.jsx › JobGauge`, `hud.css › .jg-widget`
- **Data:** custom — Onion Knight is not a real job. The plugin synthesizes its gauge from:
  - `Petals` (0..100): blocks taken in last 12s, decays linearly
  - `Stacks` (0..5): consecutive successful guards, resets on miss
- **Geometry:** 80×80 radial dial + 5 horizontal pips
- **For real jobs**, the plugin should also bundle gauge skins for at minimum: PLD (Oath Gauge), DRK (Blood/MP), GNB (Cartridge), SMN (Aetherflow + Bahamut). All follow the same `<div className="jg-widget">` shape.
- **Replaces FFXIV addons:** `JobHud<JobAcronym>0`, `JobHud<JobAcronym>1`

### 4.6 BuffStrip (status effects with radial CD)
- **Mockup ref:** `hud-components.jsx › BuffStrip`, `hud.css › .buff`
- **Data:** `LocalPlayer.StatusList` filtered by self-cast
- **CD overlay:** `conic-gradient(rgba(0,0,0,0.65) <expended_deg>deg, transparent <expended_deg>deg)`. Port to ImGui: draw a pie slice via `DrawList.AddConvexPolyFilled` with N=24 segments approximating the sweep.
- **Low-time pulse:** when remaining < 20%, add `border: var(--fr-castbar-interrupt)` and a 0.9s pulse animation
- **Numeric tail:** keeps the original `data-time` label so timers under 5s read precisely
- **Replaces FFXIV addons:** `_StatusCustom*`

### 4.7 Tonberry mascot perch (decorative)
- **Mockup ref:** `hud-app.jsx › tonberry-perch`, `hud.css › .tonberry-perch`
- **Data:** derived from player sim — HP%, cast state
- **Asset:** the three Tonberry emote GIFs (`vibing-emote.gif`, `heart-emote.gif`, `stab-emote.gif`)
- **States:**
  | Condition | Asset | Behavior |
  |---|---|---|
  | HP > 30%, not casting | `vibing-emote.gif` | drift in place |
  | HP > 30%, casting | `heart-emote.gif` | drift in place |
  | HP < 30% | `stab-emote.gif` | rotate -1..+1° at 1.2s pace, red glow |
- **Position:** bottom-center, just above the hotbar
- **No new addon replacement** — this is pure ornament

---

## 5. Replaces / Hides — FFXIV addon manifest

When the plugin loads, it MUST hide these vanilla addons (the meta.yaml
mod alone leaves them visible — the plugin's job is to hide vanilla and
draw its own equivalent on top).

```csharp
private static readonly string[] HiddenAddons = {
  "_ParameterWidget",   // → 4.1 PlayerFrame
  "_PartyList",         // → 4.2 PartyList
  "_LimitBreak",        // → 4.3 LimitBreak
  "_CastBar",           // → 4.4 PlayerCastBar
  // Job gauges are conditional — hide only when TLF has a skin for that job
  "JobHudPLD0", "JobHudPLD1",
  "JobHudWAR0",
  "JobHudDRK0", "JobHudDRK1",
  "JobHudGNB0",
  "JobHudSMN0", "JobHudSMN1",
};
```

Use `Framework.Update` to re-assert visibility every tick (the game
re-shows addons on zone changes / cutscene exits).

---

## 6. Edit-mode (HUD layout) port — REQUIRED for v0.1

**Every visible TLF widget MUST be runtime-adjustable.** The user
explicitly called this out: "the UI itself needs to be adjustable."
This is not a v0.2 nice-to-have; if you can't move/resize/toggle a
widget at runtime, ship it disabled by default in v0.1.

The mockup ships an in-page `/hudlayout` equivalent — drag/resize each
window, persist to `localStorage`. The plugin should match this UX:

- **Trigger:** chat command `/tlf layout` opens edit mode. Also
  bindable to a hotkey via Dalamud's keybind system.
- **In edit mode:** each TLF window shows a dashed ember outline, a
  drag handle (whole-body click), a resize corner (bottom-right 18×18),
  and an ember label chip in the top-left of the panel.
- **Per-widget toggles:** the `/tlf config` panel must list every
  widget with an enable/disable checkbox. When a widget is disabled the
  corresponding vanilla addon (see §5) must be SHOWN again — TLF only
  hides vanilla when its own widget is taking over.
- **Layout persistence:** `~/.dalamud/configs/TonberryLiberationFront.json` →
  ```json
  {
    "windows": {
      "<id>": { "x": 0, "y": 0, "w": 0, "h": 0, "enabled": true, "locked": false }
    },
    "accent": "ember",
    "windowStyle": "rounded-top",
    "shapeStyle": "rounded",
    "tweaks": {
      "particles": true, "shakeIntensity": 1.0, "mascotPerch": true,
      "frostBlur": 18, "portraitScale": 1.45,
      "portraitOffsetX": 0, "portraitOffsetY": 0
    }
  }
  ```
- **Reset:** `/tlf layout reset` wipes the JSON.
- **Tweaks (sliders / toggles) ALSO live at runtime.** Don't bake any
  visual value into a `const` — every tunable in the mockup's Tweaks
  panel (`hud-app.jsx › TWEAK_DEFAULTS`) becomes a settable
  Configuration field.

Window IDs that the layout system tracks (match mockup):
`char`, `party`, `buffs`, `target`, `player-frame`, `player-cast`,
`job-gauge`, `limit-break`, `hotbar`, `chat`, `purse`.

### Per-widget runtime adjustables — full list

| Widget | Move | Resize | Toggle | Style tweaks |
|---|---|---|---|---|
| PlayerFrame | ✅ | ✅ aspect-locked | ✅ | Portrait scale 80–220%, offset X/Y ±40px, ring style (KH ring / Frost bars) |
| PartyList | ✅ | ✅ | ✅ | Style (kh-curl / classic), member sort order |
| LimitBreak | ✅ | ✅ width-only | ✅ | (none) |
| PlayerCastBar | ✅ | ✅ width-only | ✅ | Slidecast tick visible y/n |
| JobGauge | ✅ | ✅ | ✅ per-job | (none) |
| BuffStrip | ✅ | ✅ | ✅ | Sort (time-asc / time-desc / category), CD ring style (radial / numeric) |
| TargetFrame | ✅ | ✅ | ✅ | Cast bar visible y/n |
| Hotbar | ✅ | ✅ | ✅ | (none — vanilla hotbar is also visible) |
| Chat | ✅ | ✅ | ✅ | (vanilla — TLF only re-styles, doesn't replace) |
| Currency / Purse | ✅ | ✅ | ✅ | Which currencies shown |
| Mascot perch | ✅ position | (size fixed) | ✅ | Emote set (vibing-only / full cycle) |
| Toolbar | ✅ position (top-anchor / bottom-anchor) | (auto-width) | ✅ | Which widgets in the rail |

---

## 7. Toolbar — Umbra-style top rail

The TLF toolbar is a thin top-of-screen widget bar (mockup ref:
`hud-toolbar.jsx`). It is **not a vanilla replacement** — Umbra users
will already be familiar with it; non-Umbra users get it as a free
bonus when the plugin is installed.

Widgets, left-to-right:

1. **Brand chip** — Tonberry stab GIF + "TONBERRY · LIBERATION FRONT"
2. **Zone** — current zone + coordinates
3. **Weather** — current weather, color-coded by type
4. **Clock** — ET / LT pair, monospace
5. **Tactics** — links to a gear-audit popout (the existing
   `hud-tactics-popout.jsx`). Pip badge when issues are present.
6. **Quest** — current MSQ / active quest objective
7. **FATE** — nearest FATE
8. **Gil / Tomes** — currency readouts
9. **Linkshell** — Tonberry vibing GIF + member count
10. **Config** — opens TLF settings

If the user runs both Umbra AND TLF, the plugin should detect Umbra via
`PluginInterface.InstalledPlugins` and offer to hide its own toolbar
(toggle in /tlf config).

---

## 8. Tactics popout (gear audit)

The mockup includes a "Tonberry Tactics" popout — a gear-audit panel
that scores the player's current set and lists issues with a knife-
sharp tone. Implementation note: this is the LARGEST piece of net-new
work in the plugin and should be **deferred to v0.2**. v0.1 ships the
chrome stub (Tactics chip in toolbar opens a placeholder popout) but
the actual audit engine is out of scope.

If you do build it for v0.1:
- Hook `Items.GetGearset()` and compare against community BiS tables
  (XIVGear.app exports — bundle a snapshot per content tier)
- Score = clamp(100 − Σ(issue_weight), 0, 100)
- Each issue carries: severity (`note` | `warning` | `error`), title,
  finding (italic, Refia-voiced quip), action (e.g. "Replace Slot X")

---

## 9. Asset inventory

All assets live in `TLF.Plugin/Resources/`. From the mockup:

| Path | Purpose | Source |
|---|---|---|
| `assets/helm-avatar.png` | CharCard portrait (identity) | Brian's original Onion Knight art |
| `assets/portrait-combat.png` | PlayerFrame · HP > 66% | full helm, neutral state |
| `assets/portrait-combat-alt.png` | PlayerFrame · 33–66% | helm + furrowed brow |
| `assets/portrait-danger.png` | PlayerFrame · 10–33% | helm + red highlights |
| `assets/portrait-danger-alt.png` | PlayerFrame · < 10% | bloodied helm |
| `assets/wordmark.png` | Brand wordmark | full title-set |
| `assets/shield-crest.png` | Decoration · top-right ornament | heraldic shield |
| `assets/rags-pixel.png` | Decoration · pixel mascot | inventory-style sprite |
| `assets/tonberry/vibing-emote.gif` | Mascot perch · idle | animated GIF |
| `assets/tonberry/heart-emote.gif` | Mascot perch · casting | animated GIF |
| `assets/tonberry/stab-emote.gif` | Mascot perch · low HP | animated GIF |
| `fonts/Eorzea.ttf` | Rune ornament font | © Square Enix — ornament use only |

For ImGui, animated GIFs must be split to a sprite sheet at build time.
Use `ImageSharp.GifDecoder → SpriteAtlas.Build` (see `TLF.Plugin/Build/GifSplit.cs`).

---

## 10. Build order — suggested sequence

1. **Scaffold:** `dotnet new dalamud --name TLF.Plugin`
2. **Wire Penumbra config reader:** detect installed mod, parse current
   accent preset + window-style selection.
3. **Build the style applier:** `ImGuiStyleApplier.Apply(preset)` — sets
   the colors / corners / borders from §2.
4. **Hide vanilla addons:** §5 list, re-asserted on Framework.Update.
5. **PlayerFrame:** ship FIRST — it's the visual signature.
6. **PartyList:** KH-curl variant first; classic later.
7. **LimitBreak + PlayerCastBar:** parallel, both small.
8. **JobGauge:** start with Onion Knight (mock data); add real-job
   skins incrementally.
9. **BuffStrip with radial CD:** medium effort — ImGui pie-slice draw.
10. **Tonberry mascot perch:** decorative, easy.
11. **Edit mode (/tlf layout):** drag/resize, persistence.
12. **Toolbar:** clock/weather/zone/currency (Umbra-style).
13. **Tactics popout:** stub for v0.1, real audit in v0.2.

---

## 11. Out of scope for v0.1

- Alliance / 24-person raid party layouts (architecturally same as PartyList × 3, deferred)
- Minimap chrome (vanilla is acceptable)
- FlyText / damage number styling (Penumbra mods exist; don't reinvent)
- Cross-job custom gauges beyond the Onion Knight one
- Voice-over chrono ticks (Refia voice acting — a wishlist item)
- Mounted UI (FFXIV's flight HUD is its own beast)

---

## 12. Open questions for the implementer

1. **Penumbra config reader** — Sevii's `meta.yaml` parser is in F#; do
   we re-implement in C# or shell out to a CLI? Recommend re-implement
   with `YamlDotNet`; the schema is tiny.
2. **Font embedding** — Dalamud's font system has Cinzel? If not, we
   bundle the WOFF2; the plugin builds an ImFont atlas at startup.
3. **Eorzea.ttf licensing** — © Square Enix. Ornament-only use is
   community-tolerated but technically infringing. Confirm with the
   user that they accept that risk before shipping; if not, drop to
   "Cinzel italic small-caps" as a substitute.
4. **Tactics audit data source** — XIVGear.app vs custom curated BiS?
   v0.2 question, but worth flagging early so we know what format the
   audit engine consumes.
