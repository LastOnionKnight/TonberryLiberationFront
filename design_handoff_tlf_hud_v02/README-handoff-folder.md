# TLF v0.1 — SDK Handoff Package

This folder is the **handoff bundle** for the Dalamud SDK / Penumbra
implementation pass. The HTML mockup lives at the project root
(`Tonberry Liberation Front.html` + assets); these files turn that
mockup into something Claude Code can implement.

## Files

| File | Purpose | Format |
|---|---|---|
| `meta.yaml` | Penumbra mod manifest — colors, chrome, shape, presets. Drop-in compatible with Sevii's Frost UI schema. | YAML |
| `HANDOFF.md` | Dalamud plugin spec — widget catalog, addon overrides, token map, accent presets, build order, asset inventory. | Markdown |
| `README.md` | This file. | Markdown |

## How to use this

1. **For Penumbra-only users:** load `meta.yaml` into a Penumbra mod
   folder (rename to `meta.yaml`, build the .pcp). The 5 city-state
   presets + window-shape options are usable immediately. **No plugin
   needed** for color/chrome — you just won't get the KH ring or the
   mascot perch.
2. **For the full TLF experience:** Claude Code reads `HANDOFF.md` and
   builds the Dalamud plugin. The plugin reads the same meta.yaml at
   runtime to stay in sync with whatever preset the user picked in
   Penumbra. Plugin is a Dalamud-only install.

## Companion mockup

Open `../Tonberry Liberation Front.html` for the live design. Every
widget called out in `HANDOFF.md §4` has a matching JSX component in
`../hud-components.jsx` — that's the canonical visual reference for
the port.

## What's missing on purpose

- **Tactics popout audit engine** — stubbed in v0.1, deferred to v0.2.
  `HANDOFF.md §8` explains.
- **Alliance / 24-man party layouts** — same architecture as PartyList,
  out of scope for v0.1.
- **Voice-over chrono ticks (Refia voice)** — wishlist.

## Open questions

See `HANDOFF.md §12`. Two of them (font embedding, Eorzea.ttf
licensing) need the user's call before shipping.
