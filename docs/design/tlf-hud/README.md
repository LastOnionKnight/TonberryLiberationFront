# Handoff: Tonberry Liberation Front — FFXIV UI Theme

A Frost-UI-style theme + custom HUD plugin for Final Fantasy XIV.

---

## Overview

**Tonberry Liberation Front (TLF)** is a UI replacer for FFXIV in the
spirit of [Sevii77/frost_ui](https://github.com/Sevii77/frost_ui). It
ships in two halves that work together:

1. **TLF.Mod** — a Penumbra mod (`meta.yaml`) that retints + reshapes
   the game's existing chrome (colors, window corners, ImGui style).
2. **TLF.Plugin** — a Dalamud plugin that draws custom widgets on top
   of (or in place of) the vanilla parameter / party / cast / limit
   addons.

The default look is "Onion Knight" — indigo + ember orange, heraldic
typography, Kingdom-Hearts-Birth-By-Sleep-style HP ring, and a Tonberry
mascot perched in the corner. Five locked accent presets reskin the
whole UI to other FFXIV city-state palettes.

The codebase target is **Dalamud SDK (C# .NET 8)** for the plugin half,
and **Penumbra .pcp** for the mod half.

---

## About the Design Files

The files in `mockup/` are **design references created in HTML/JSX**
— a working prototype that shows intended look, motion, and
interactions. They are NOT production code to copy directly.

**Your task is to recreate these designs in a Dalamud plugin** (C#,
ImGui via Dalamud's `IImGui` interface, or Una.Drawing for higher-level
layout). The HTML is the visual ground truth; the C# code is what you
write.

A working `Tonberry Liberation Front.html` is included so you can
open it in a browser and visually compare your implementation against
the reference at any moment.

---

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, motion
timings, and interaction states are all locked. Every pixel value you
see in the mockup should be matched in the implementation. The
`HANDOFF.md` token table gives you the exact RGBA Vector4 values for
each CSS custom property in `hud.css`.

The single exception is the **font stack**: the mockup uses Cinzel
(display), Cormorant Garamond (body italic), JetBrains Mono (numeric).
The plugin should ship Cinzel embedded as WOFF2 and use JetBrains Mono
for numerics; Cormorant is a body-text font that doesn't read well at
ImGui's nominal sizes, so drop it.

---

## Start Here

1. **Read `HANDOFF.md`.** It's the canonical implementation spec.
   - §1 Architecture
   - §2 Token map (CSS → ImGui Vector4)
   - §3 Accent presets (5 city-states, locked)
   - §4 Widget catalog (one section per custom widget with data
     hooks, geometry, asset paths)
   - §5 FFXIV addon manifest (which vanilla addons to hide and when)
   - §6 Edit-mode REQUIREMENT — every widget must be runtime-adjustable
   - §7 Toolbar (Umbra-style)
   - §8 Tactics popout (deferred to v0.2)
   - §9 Asset inventory
   - §10 Suggested build order
   - §11 Out of scope for v0.1
   - §12 Open questions for you

2. **Skim `meta.yaml`.** This is the Penumbra mod manifest. The plugin
   reads the same file at runtime to stay in sync with whatever preset
   the user picked. Drop-in compatible with Sevii's Frost UI schema.

3. **Open `mockup/Tonberry Liberation Front.html`** in a browser. Use
   it as the visual ground truth. Toggle the "Edit HUD" button to see
   the drag/resize UX that needs to port to the plugin. Open the Tweaks
   panel (top toolbar) to see every runtime-tunable parameter.

4. **Start with §10 build order.** Items 1–6 get you a usable v0.1.

---

## Critical design rule: separated entities

The user is explicit: **player HP/MP/Cast/Limit/JobGauge and party
HP/MP/Role are SEPARATE entities.** Do not couple them. Each is its
own draggable, resizable, toggleable widget reading from its own data
source:

| Widget | Data source |
|---|---|
| PlayerFrame (HP ring + MP + portrait) | `IClientState.LocalPlayer` |
| PlayerCastBar | `LocalPlayer.IsCasting / CurrentCastTime / ...` |
| LimitBreak | `LimitBreakController` (FFXIVClientStructs) |
| JobGauge | `JobGaugeManager.Get<TGauge>()` |
| PartyList | `IPartyList[]` |

The mockup demonstrates this by giving each its own `<HudWindow>` —
you can drag and resize them independently. The plugin must preserve
this independence.

---

## Runtime adjustability — REQUIRED

The user said it explicitly: "the UI itself needs to be adjustable."
Every visible widget MUST be:

- **Movable** (drag in edit mode)
- **Resizable** (drag corner in edit mode)
- **Toggleable** (on/off per widget; vanilla addon re-shows when off)
- **Persisted** (positions/sizes/toggles survive plugin reload)

See `HANDOFF.md §6` for the full edit-mode spec and the per-widget
adjustability table.

---

## File layout

```
design_handoff_tonberry_liberation_front/
├── README.md                          ← this file
├── README-handoff-folder.md           ← original handoff folder README
├── HANDOFF.md                         ← canonical implementation spec
├── meta.yaml                          ← Penumbra mod manifest
└── mockup/                            ← visual reference (HTML/JSX/CSS)
    ├── Tonberry Liberation Front.html ← open in browser
    ├── hud.css                        ← token source of truth
    ├── hud-app.jsx                    ← main app + tweaks panel
    ├── hud-components.jsx             ← CharCard, PartyList, BuffStrip,
    │                                    TargetFrame, Hotbar, ChatPanel,
    │                                    Purse, PlayerFrame, LimitBreak,
    │                                    PlayerCastBar, JobGauge,
    │                                    usePlayerSim
    ├── hud-data.jsx                   ← JOBS / ONION_KIT / PARTY /
    │                                    BUFFS / TARGET / CHAT mock data
    ├── hud-effects.jsx                ← stage scale, particles, Icon,
    │                                    Eorzea time, GCD timer
    ├── hud-modal.jsx                  ← job picker modal
    ├── hud-toolbar.jsx                ← Umbra-style top toolbar
    ├── hud-tactics-popout.jsx         ← gear audit popout (v0.2 stub)
    ├── hud-window.jsx                 ← HudWindow drag/resize wrapper
    ├── tweaks-panel.jsx               ← runtime tweaks UI
    ├── assets/                        ← portraits, emotes, mascot,
    │                                    wordmark, shield-crest
    └── fonts/Eorzea.ttf               ← rune ornament font
                                         (© Square Enix — see §12)
```

---

## Open questions before you start

These are flagged in `HANDOFF.md §12`; the user needs to answer two of
them before you ship:

1. **Eorzea.ttf licensing.** © Square Enix. Ornament-only community
   use is tolerated but technically infringing. Confirm with the user
   that they accept that risk; if not, swap to "Cinzel italic
   small-caps" as a substitute.
2. **Penumbra config reader.** Sevii's `meta.yaml` parser is in F#.
   Recommend re-implementing in C# with `YamlDotNet` — the schema is
   small. Confirm before going.

---

## Design tokens — quick reference

Full table in `HANDOFF.md §2`. The five most-used:

| CSS | RGB Vector4 | Hex | Role |
|---|---|---|---|
| `--fr-bg` | `0.078, 0.086, 0.110, 0.90` | `#141620` | Window backdrop |
| `--fr-fg` | `0.949, 0.949, 0.961, 1.00` | `#F2F2F5` | Text |
| `--fr-outline` | `0.698, 0.698, 0.698, 1.00` | `#B2B2B2` | Window borders |
| `--fr-accent` (Onion Ember default) | `0.839, 0.482, 0.235, 1.00` | `#D67B3C` | Primary accent |
| `--fr-secondary` | `0.227, 0.243, 0.282, 1.00` | `#3A3E48` | Buttons |

---

## Accent presets — locked

`HANDOFF.md §3` has the full table. The five and only five preset keys:

- `ember` — Onion Ember (default · Heralds of the Bastion)
- `limsa` — Limsa Azure (Maelstrom)
- `uldah` — Ul'dah Gold (Immortal Flames)
- `gridania` — Gridania Leaf (Twin Adder)
- `ishgard` — Ishgard Frost (Dragoon steel)

No free RGB picker. Deliberate design call.

---

## Brand voice (for any user-facing copy)

Stately, second-person, lightly archaic. The Tonberry Liberation Front
brand voice is "a kind innkeeper narrating your evening" with a
grudge-bearing Tonberry mascot for comic relief.

- "/tlf layout" not "/tlf editmode"
- "The path is barred." not "Error: 403"
- "Set forth" buttons, not "Submit"

Voice rules and "do / don't" examples are in the parent design system
guide (`Vision of Eorzea`). Match it.

---

## What's done vs. what's open

**Done (v0.1 scope):**
- ✅ Color + chrome theme (meta.yaml)
- ✅ Token map (CSS → ImGui)
- ✅ 5 city-state accent presets
- ✅ PlayerFrame widget spec (KH ring + portrait + MP)
- ✅ PartyList widget spec (KH-curl + classic variants)
- ✅ LimitBreak widget spec
- ✅ PlayerCastBar widget spec
- ✅ JobGauge widget spec (Onion Knight; other jobs follow same shape)
- ✅ BuffStrip with radial CD overlay
- ✅ Tonberry mascot perch
- ✅ Edit-mode / runtime adjustability requirements
- ✅ FFXIV addon override list
- ✅ Toolbar spec
- ✅ Asset inventory

**Deferred to v0.2:**
- ⏳ Tactics popout audit engine (chrome stub in v0.1)
- ⏳ Alliance / 24-man party layouts
- ⏳ Per-job gauge skins beyond Onion Knight (incremental rollout)
- ⏳ Voice-over chrono ticks (Refia voice acting wishlist)

**Out of scope entirely:**
- ❌ Mounted UI / flight HUD
- ❌ Minimap chrome (vanilla acceptable)
- ❌ FlyText / damage number styling (Penumbra mods exist)
