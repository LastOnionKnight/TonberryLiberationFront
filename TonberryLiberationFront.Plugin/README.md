# Tonberry Liberation Front Suite — Dalamud Plugin

**Current version:** `2.0.0.1`  
**Dalamud SDK:** `15.0.0`

This project is the active Dalamud runtime for the **Tonberry Liberation Front UI Suite**.

It began as the Kingdom Hearts-style `KhPartyBars` experiment, but the product has expanded beyond party bars. The assembly/root namespace still use `KhPartyBars` for compatibility; the public product is the Tonberry Liberation Front Suite.

## Current runtime surfaces

The current WindowManager owns:

```text
PartyBarsWindow
PlayerBarWindow
ConfigWindow
```

The suite also provides:

- `/tlf` primary command
- layout/edit mode
- persistent player/party-bar positioning
- off-screen position recovery
- asset loading and shared TLF resources
- diagnostics through `/khpbinfo`
- compatibility aliases for the original `/khparty` command family

## Commands

Primary:

```text
/tlf              Toggle suite display state
/tlf layout       Toggle layout/edit mode
/tlf config       Open configuration
```

Compatibility aliases:

```text
/khparty
/khpartycfg
/khpbinfo
```

The `kh*` names are retained for compatibility and should be treated as legacy lineage, not the current product identity.

## Project layout

```text
TonberryLiberationFront.Plugin/
├─ Plugin.cs
├─ Configuration.cs
├─ AssetLoader.cs
├─ KhRosterEntry.cs
├─ KhRenderer.cs
├─ Windows/
│  ├─ WindowManager.cs
│  ├─ PartyBarsWindow.cs
│  ├─ PlayerBarWindow.cs
│  └─ ConfigWindow.cs
├─ Resources/
├─ KhPartyBars.json
├─ TonberryLiberationFront.Plugin.csproj
└─ README.md
```

## Resources

Runtime resources are loaded from `Resources/`.

The active asset loader currently uses:

- `helm-avatar.png`
- `onion-sigil.png`
- `onion-sigil-mask.png`
- `wordmark.png`
- portraits under `Resources/portraits/`
- Eorzea font under `Resources/fonts/`

When cleaning assets, verify references in `AssetLoader.cs` before deleting files.

## Build

```powershell
dotnet restore
dotnet build -c Release
```

## Current architecture debt

- `RootNamespace` and `AssemblyName` are still `KhPartyBars` for compatibility.
- legacy `/khparty*` command names remain registered as aliases.
- repository/distribution structure still carries some original KhPartyBars lineage.
- the suite has not yet implemented the full planned target/buff/hotbar replacement stack.

These are known transition items, not evidence that the project is still a 0.1 scaffold.

## Product boundary

The TLF UI Suite is responsible for the **FFXIV interface/HUD experience**.

Tonberry Tactics / GearGoblin is a separate optimization platform responsible for **character/gear recommendations**.

The two systems may share visual language and eventually surface each other's information, but they should remain separate codebases with distinct responsibilities.

## Roadmap direction

Current expansion path:

```text
Player HUD
Party HUD
Target / target-of-target HUD
Buff/debuff presentation
Suite navigation / tweaks
additional HUD surfaces
Tonberry Tactics status integration where useful
```

The source code and current v2 runtime are authoritative over the old pre-test 0.1 documentation.
