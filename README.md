# Tonberry Liberation Front Suite

Umbrella repository for the Tonberry Liberation Front FFXIV UI/HUD suite, supporting mod resources, design handoffs, and compatibility distribution files.

## Current runtime

Active plugin project:

```text
TonberryLiberationFront.Plugin/
Version: 2.0.0.1
Dalamud SDK: 15.0.0
Product: Tonberry Liberation Front Suite
Compatibility assembly/root namespace: KhPartyBars
```

`KhPartyBars` remains the internal/assembly compatibility lineage. The current product is the broader Tonberry Liberation Front Suite.

## Repository layout

```text
TonberryLiberationFront/
├─ TonberryLiberationFront.Plugin/   active Dalamud plugin source
├─ TlfMod/                           mod-side metadata / window resources
├─ design_handoff_tlf_hud_v01/      historical/implementation design handoff
├─ design_handoff_tlf_hud_v02/      later design handoff iteration
├─ tlf-hud-v0.1-dropin/              historical drop-in package/work area
├─ umbra-widget/                     Umbra-related widget/integration work
├─ docs/                             suite documentation
├─ KhPartyBars/                      legacy repository-manifest compatibility path
├─ repo.json                         active custom Dalamud repository manifest
├─ repo_mod.json                     mod distribution metadata
├─ latest.zip                        committed distribution artifact where required
└─ README.md
```

## Active plugin surfaces

Current source includes:

- party HUD
- player HUD
- configuration window
- layout/edit mode
- position persistence and off-screen recovery
- runtime asset loading
- `/tlf` primary command
- legacy `/khparty*` compatibility aliases
- diagnostics

The plugin-local README under `TonberryLiberationFront.Plugin/` documents the runtime in more detail.

## Distribution state

The active root `repo.json` and the legacy `KhPartyBars/repo.json` path both identify the current **2.0.0.1** release and point at the same release ZIP. The legacy path is intentionally kept valid for compatibility rather than left as an empty manifest.

The packaged plugin manifest retains `InternalName: KhPartyBars` so existing installs can continue through the product transition.

## TlfMod

`TlfMod/` contains mod-side metadata, build notes, and window-style assets used by the wider suite. It is related to, but distinct from, the Dalamud runtime.

## Design handoffs

The v01/v02 handoff directories are historical/implementation references. They should not be treated as the current runtime by themselves; current source code and current documentation are authoritative for what actually ships.

## Relationship to Tonberry Tactics

Tonberry Tactics is a separate character-optimization platform:

```text
GearGoblin          — in-game optimizer plugin
GearGoblin-Core     — shared optimizer/formulas
TonberryTactics     — browser companion
```

The TLF UI Suite owns the **interface/HUD experience**. Tonberry Tactics owns **character/gear optimization**. They may share visual language and surface each other's status later, but they remain separate products/codebases.

## Build

From `TonberryLiberationFront.Plugin/`:

```powershell
dotnet restore
dotnet build -c Release
```

## Current architecture debt

- `KhPartyBars` assembly/root namespace remains for compatibility
- legacy `kh*` commands remain as aliases
- historical design/drop-in directories still document earlier phases
- target/buff/hotbar and wider HUD replacement surfaces are not complete

## Roadmap direction

```text
Player HUD
Party HUD
Target / target-of-target HUD
Buff/debuff presentation
Suite navigation / tweaks
additional HUD surfaces
Tonberry Tactics status integration where useful
```

Current source and v2 documentation take precedence over old pre-implementation roadmap language.
