# KH Party Bars — a Dalamud plugin

Kingdom Hearts-style party bars for FFXIV. Round job portraits, angled
wing name tabs, gradient HP bars, the signature curl-loop terminator,
and a slim MP stripe — themed in Onion Knight ember by default.

> Status: **0.1.0 — pre-test scaffold.** Compiles against the Dalamud
> dev SDK. Reskinnable from `/khpartycfg`. The curl-loop, name-tab
> wing, gradient bars, and role rings are all rendered with ImGui draw
> calls (no textures required) so they scale crisply.

## Install (dev)

1. Clone or unzip this folder somewhere — `KhPartyBars/`.
2. Make sure XIVLauncher is installed and Dalamud has been built at
   least once (the dev DLLs live at
   `%appdata%\XIVLauncher\addon\Hooks\dev\`).
3. From a Developer Command Prompt:
   ```
   cd KhPartyBars
   dotnet build -c Release
   ```
   The output (`bin\Release\KhPartyBars.dll` + `KhPartyBars.json`) is
   the plugin. If `DalamudLibPath` doesn't resolve automatically,
   add a `KhPartyBars.csproj.user` next to the csproj with:
   ```xml
   <Project>
     <PropertyGroup>
       <DalamudLibPath>C:\full\path\to\XIVLauncher\addon\Hooks\dev\</DalamudLibPath>
     </PropertyGroup>
   </Project>
   ```
4. In-game, type `/xlsettings`, go to **Experimental**, add the local
   plugin path (the folder containing the built DLL), and install.
5. Use `/khparty` to toggle the overlay, `/khpartycfg` to open
   settings.

## Commands

| Command | Effect |
|---|---|
| `/khparty` | Toggle the party-bars overlay on or off |
| `/khpartycfg` | Open the configuration window |

## Configuration

The config window covers:

- **Layout** — row width / height / gap / UI scale / lock position
- **Style** — ember accent, MP color, the three HP-band colors, the
  three role-ring colors
- **HP thresholds** — where the bar shifts green → yellow → red
- **Toggles** — show MP bar / curl / level / HP% / name tab / job /
  shimmer / target ring / curl-matches-HP

All settings persist via Dalamud's per-plugin config.

## Files

```
KhPartyBars/
├── KhPartyBars.csproj         ← project + Dalamud refs
├── KhPartyBars.json           ← Dalamud plugin manifest
├── Plugin.cs                  ← entry, command handlers, services
├── Configuration.cs           ← persistent settings
├── KhRosterEntry.cs           ← normalized party-member record
├── KhRenderer.cs              ← the drawing logic
├── Windows/
│   ├── WindowManager.cs
│   ├── PartyBarsWindow.cs     ← transparent overlay window
│   └── ConfigWindow.cs        ← settings ImGui window
└── README.md
```

## Caveats

- The portrait currently shows the job abbreviation. If you want
  textured job icons inside the disc, point `KhRenderer.DrawPortrait`
  at `Plugin.Textures.GetFromGameIcon(...)` and pass the icon id; the
  scaffold leaves a comment where to splice it in.
- HP recovery / shield overlay are not yet drawn. PR welcome.
- This is a "render on top of the native party list" overlay — it does
  **not** hide the native one. Combine with a UI-hide preset (Frost UI,
  Native Mod, etc.) for the full effect.

## Credits

Concept: Kingdom Hearts: Birth by Sleep HUD; Square Enix.
Reskin + plugin: **Refia Rakkiri · The Last Onion Knight**, with
the Tonberry Liberation Front.

License: **CC-BY-4.0** for assets, **Apache-2.0** for code.
