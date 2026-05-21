# TLF HUD v0.1 — player frame + toolbar (prototype)

Destination repo: **LastOnionKnight/TonberryLiberationFront**
Place under the HUD design dir (alongside `design_handoff_tlf_hud_v01/`).

## Contents
- `LastOnionKnight-HUD.html` — runnable browser prototype. Umbra-style top bar
  (brand / zone / ET clock / weather / gil / audit-state indicator that opens
  the Tactics Popout / tweaks) + KH-style player frame (HP ring, MP bar,
  3-segment ember limit gauge, portrait emblem with ready/combat/danger swaps).
  Built on the v2 `--fr-*` ember tokens — ports ~1:1 to Una.Drawing.
- `assets/portraits/refia-portrait-1..4.png` — Refia onion-helm portraits,
  background keyed to transparency.

## Portrait notes
- `refia-portrait-1` and `-2` (cyan-glow, no ring) are clean — used in the HUD
  (1 = combat swap, 2 = ready). Danger state = CSS red hue-shift on the same art.
- `refia-portrait-3` and `-4` (ember-ring) auto-keyed with leftover checkerboard
  INSIDE the glow ring — that region is walled off by the glow and can't be
  border-keyed. Run these through proper bg-removal (rembg / Photopea) or use
  the original transparent source before shipping.

## Port target
TLF HUD plugin (InternalName `tthud`), Una.Drawing runtime. Decision #2 in the
kickoff: HUD uses Una.Drawing; tokens map to Vector4/pixels for the eventual
TT ImGui adoption at v0.7+.
