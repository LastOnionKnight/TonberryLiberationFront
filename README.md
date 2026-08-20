# Tonberry Liberation Front Suite

Umbrella repository for the Tonberry Liberation Front FFXIV plugin/mod suite and its shared visual language.

## Current status

The repository now contains an active Dalamud plugin implementation, supporting assets, and mod resources rather than only a design handoff.

Current plugin project:

```text
TonberryLiberationFront.Plugin
Version: 2.0.0.1
Dalamud SDK: 15.0.0
Product: Tonberry Liberation Front Suite
Assembly/Internal lineage: KhPartyBars
```

The `KhPartyBars` assembly/root namespace remains for compatibility while the product itself is the broader Tonberry Liberation Front Suite.

## What lives here

```text
TonberryLiberationFront/
├─ TonberryLiberationFront.Plugin/   Active Dalamud plugin source
├─ TlfMod/                           TLF mod metadata and window assets
├─ KhPartyBars/                      plugin-repository placeholder area
└─ README.md
```

### TonberryLiberationFront.Plugin

The active Dalamud plugin project contains the current HUD/system implementation, configuration, rendering code, runtime resources, portraits, UI assets, and plugin manifest.

It currently targets Dalamud API 15 through `Dalamud.NET.Sdk/15.0.0`.

### TlfMod

Contains the TLF mod-side metadata, build notes, banner, and window-style assets used by the wider suite.

### KhPartyBars

Retained for compatibility/distribution lineage. The current product scope is broader than the original Kingdom Hearts-style party-bar implementation.

## Relationship to Tonberry Tactics

Tonberry Tactics is a separate but related gearing/optimization system:

- `LastOnionKnight/GearGoblin` — in-game Tonberry Tactics plugin; public product name is Tonberry Tactics, internal name remains `GearGoblin`
- `LastOnionKnight/GearGoblin-Core` — shared optimizer/formula library
- `LastOnionKnight/TonberryTactics` — browser companion

The Tonberry Liberation Front Suite and Tonberry Tactics share project identity and visual language, but they are separate codebases with separate responsibilities.

## Design direction

The suite uses the TLF HUD visual system that evolved out of the original handoff work. That design language now informs active runtime implementation rather than existing only as a future concept.

Current development should treat the repository source and shipped assets as authoritative over old roadmap language that referenced pre-implementation `v0.1`/`v0.2` phases.

## Build

From the plugin project directory:

```powershell
dotnet restore
dotnet build -c Release
```

## Current caution

The plugin still carries `KhPartyBars` as its root namespace and assembly name. That is intentional compatibility debt, not evidence that the repository is still only a party-bar experiment.

## Related repositories

- https://github.com/LastOnionKnight/GearGoblin
- https://github.com/LastOnionKnight/GearGoblin-Core
- https://github.com/LastOnionKnight/TonberryTactics

## Project identity

Forged by Refia Rakkiri / The Last Onion Knight.
