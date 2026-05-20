/* global React */
// =========================================================================
// TLF HUD v0.1 — placeholder FFXIV scene
// A painted backdrop with a clear "screenshot goes here" affordance.
// Includes faint ghosts of the native FFXIV hotbar + HP/MP bar so the
// HUD's relative placement reads correctly without requiring a real
// in-game screenshot.
// =========================================================================

function FFXIVScene() {
  return (
    <div className="scene">
      <div className="scene-bg" />
      <div className="scene-noise" />
      <div className="scene-grid" />
      <div className="scene-horizon" />

      {/* Ghost native FFXIV HUD bits — so the TLF HUD's placement reads
          relative to "where the game already draws things". */}
      <div className="scene-ghost-portrait" aria-hidden="true">
        <b />
        <b />
      </div>
      <div className="scene-ghost-hotbar" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => <i key={i} />)}
      </div>

      <div className="scene-placeholder-label">
        <span className="glyph">⚔ EORZEA SCREENSHOT HERE ⚔</span>
        <span className="lbl-2">The Bastion · Mor Dhona</span>
      </div>
    </div>
  );
}

Object.assign(window, { FFXIVScene });
