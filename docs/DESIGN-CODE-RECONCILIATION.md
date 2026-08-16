# Design-Code Reconciliation

## Divergence Identified
The shipped plugin (`v2.0.0.1`) was built using raw ImGui. However, the locked design (`design_handoff_tlf_hud_v01/context/02-LOCKED_DECISIONS.md`) explicitly specifies using `Una.Drawing` alongside baked `Theme/` tokens and a Penumbra sidecar mod. The shipped version had no `Theme/` directory and no integrated mod.

## Operator Ruling
**Rebuild the plugin on `Una.Drawing` per the locked design.**

## Scope of Rebuild Work Order
- Add `Una.Drawing` `PackageReference` to the project.
- Implement the `Theme/` token folder according to Decision 1.
- Port all `KhRenderer` raw ImGui draw calls to `Una.Drawing` component declarations.
- Wire the UI to respect the `TlfMod` accent preset from Penumbra.

## Continuity Note
**Important:** The plugin's `InternalName` must remain `KhPartyBars` to ensure save-state continuity for users upgrading from older versions. Do not change the internal name.
