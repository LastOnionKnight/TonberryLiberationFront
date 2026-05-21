# TLF Umbra Widget - Build Workspace

Foundation for the Tonberry Liberation Front Umbra widget plugin (Una.Drawing).
This is the stepping stone to the standalone TLF HUD: Umbra runs on Una.Drawing,
so the widget code here transfers forward.

## Layout

- BUILD-SPEC.md          The contract. Reconciled against the real Umbra schema.
- design-reference/      The v3 pack (tlf-umbra-pack). INTENT ONLY - its JSON
                         schema is invented and will NOT import. Do not ship it.
- test/                  umbrawidget-tlf.json - the static /tt button, a
                         config-level placement test (import in Umbra, revert
                         with the original export).
- src/                   The widget plugin, to implement. See src notes.

## Build order (from BUILD-SPEC.md section 8)

1. Optional: TLF ColorProfile + font set - reskins the native bar, zero code.
2. Custom.TonberryTactics widget - the real value. Build first.
3. Brand + Linkshell + Config custom widgets.
4. Extract toward the standalone TLF HUD plugin.

## Out of scope here

The KH-style player frame is not a toolbar shape and does not fit Umbra's
widget model. It stays in the standalone plugin.

## Gating decision before hardcoding colors

Token prefix (--fr-/ember vs --tlf-) and TT theme adoption (hard swap vs
coexist with TlfTheme). Does not block the placement test or ColorProfile work.