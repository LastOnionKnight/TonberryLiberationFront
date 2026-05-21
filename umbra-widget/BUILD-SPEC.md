# TLF Umbra Widget Pack — Build Spec

**Source:** design intent extracted from `Onion_Knight_Ui_3` (`tlf-umbra-pack`), corrected against the **real Umbra schema** decoded from the live `umbrawidget.json` config export.

**Status:** the v3 pack is a design spec, not an importable pack — its JSON shape was authored against public docs and does not match Umbra's actual config format. This document is the reconciled build target. Behavior is locked; the fake schema is discarded.

---

## 1. Ground truth — how Umbra actually stores widgets

Verified by round-tripping the live config export.

**Config storage (nested encoding):**
- The whole Umbra config = `JSON → raw DEFLATE (zlib wbits -15) → base64`.
- Widgets live in the key `Toolbar.WidgetData`, which is itself the same `JSON → deflate → base64` nesting.
- `Toolbar.WidgetProfiles` holds saved profiles as `{"<name>": "<same blob>"}`; `Toolbar.ActiveProfile` names the live one (`Default`). The active profile's blob must stay in sync with `WidgetData`.

**Per-widget object** (keyed by a GUID instance id):
```json
"4452e38b-...": {
  "Name": "Currencies",
  "SortIndex": 7,
  "Location": "Left",          // Left | Center | Right
  "Config": { ...flat PascalCase keys... }
}
```

**Config conventions:**
- Keys are **flat PascalCase**: `DisplayMode`, `IconLocation`, `Decorate`, `ButtonMode_0`, `ButtonCommand_0`. No dotted namespaces.
- Colors are **named** (`"Window.TitlebarText"`) or **ARGB uint** (`4294967295` = opaque white). Not hex, not CSS strings.
- Command widget = `CustomMenu`: per-entry `ButtonMode_N` (`Command`/`Separator`), `ButtonLabel_N`, `ButtonCommand_N` (and `ButtonAltLabel_N`), `ButtonIconId_N` (FFXIV game icon id), `ButtonIconColor_N`.

**Theming (config-level, no code):** Umbra has a global **ColorProfile** (`ColorProfileName` / `ColorProfileData`) and **Font** settings (`Font.Default.Name`, `Font.Monospace.Name`, sizes). These re-skin native widgets without a plugin.

**Real widget type Names available** (observed in the live bar): `Weather`, `Clock`, `Location`, `Currencies`, `CustomMenu`, `Separator`, `Spacer`, `ExperienceBar`, `ShortcutPanel`, `GearsetSwitcher`, `RetainerList`, `UnifiedMainMenu`, `Teleport`, `BattleEffects`, `DtrBar`, `Volume`, `OnlineStatus`, `MarkerControl`, `EmoteList`, `SocietiesWidget`, `MailIndicator`.

**Install:** full-config import (the blob), or add widgets in the Umbra UI. There is **no** "drop a packs folder in `%appdata%`" mechanism — that path in the v3 README is fictional.

---

## 2. Config vs plugin — what each v3 widget really requires

| v3 widget | What it shows | Real path | Code? |
|---|---|---|---|
| `tlf-zone` | zone / coords / aetheryte | native `Location` + ColorProfile | no |
| `tlf-weather` | current + forecast | native `Weather` + ColorProfile* | no* |
| `tlf-clock` | ET + LT combined | native `Clock` (one source per instance; run two) | no |
| `tlf-gil` | gil balance | native `Currencies` (`Gil`) | no |
| `tlf-tomes` | weekly tome / cap | native `Currencies` (tomestone) | no |
| `tlf-quest` | MSQ tracker | verify native catalog; else plugin | maybe |
| `tlf-fate` | nearest FATE | verify native catalog; else plugin | maybe |
| `tlf-config` | opens TLF tweaks | `CustomMenu` → command, **or** plugin for branded look | no / opt |
| `tlf-brand` | wordmark + mascot chip | **plugin** (asset image, dual label, animated) | yes |
| `tlf-linkshell` | vibing mascot + roster | **plugin** (animated asset, live roster) | yes |
| `tlf-tactics` | live audit score + pip | **plugin** (`Custom.TonberryTactics`, live data) | yes |

\* The per-condition ember weather palette isn't a stock config field; the global ColorProfile gets you most of the TLF look. Exact per-icon tinting would need the plugin.

**Takeaway:** the bar's data widgets are already native and just need a TLF ColorProfile + font set. The only things that demand a Una.Drawing plugin are the three branded/live widgets — and of those, **`Custom.TonberryTactics` is the one with real value.**

---

## 3. `Custom.TonberryTactics` — primary build target

The audit chip. Build this first; it's the only widget that does something no native widget can.

**Displays:**
- Label `Tactics`, value `{score} / 100`.
- A pip showing unresolved-issue count; hidden when zero.

**States:**
- `AllClear` — score clean / zero issues: green value + green border (`hp-green`).
- `HasIssues` — ember value (`accent-bright`) + ember border (`accent`).

**Severity map** (icon + Refia annotation, never both loud):
- Critical → `alert-octagon` → **Stab.**
- Warning → `alert-triangle` → **Stab?**
- Note → `info` → **Stab…**

**Interaction:**
- Left-click → open the Tactics popout window.
- Right-click → run the audit (not silent).

**Tooltip:**
- `Audit score: {score} / 100`
- `{issuesCount} issues need attention.`
- `Click to open the full audit.`
- `— Stab.`

**Data the plugin must surface to the widget:** `score` (0–100), `issuesCount`, and the per-severity breakdown. These come from the same audit logic the plugin already runs (`MeldAudit` / severity tiers) — the widget is a read-only view onto it.

---

## 4. Secondary custom widgets (after Tactics lands)

- **Brand chip** — dual label `TONBERRY` / `LIBERATION FRONT` (Cinzel, ember-bright over frost-muted), stab-tonberry mascot (animated), ember border, left-click toggles the Tactics popout. Leftmost slot.
- **Linkshell · Vibing** — vibing-tonberry mascot, value `{online} / {total} vibing`, empty state `Offline` (dry, not cute), tooltip flavor `Grub-Grub is vibing.`, click opens linkshell chat.
- **Config** — gear icon, opens the TLF tweaks window. Could ship as a plain `CustomMenu` command first; upgrade to the branded version with the plugin.

---

## 5. Layout (from the v3 profile)

Umbra buckets are Left / Center / Right, ordered within a bucket by `SortIndex`.

- **Left:** brand → zone → weather
- **Center:** clock → **tactics** → quest → fate
- **Right:** gil → tomes → linkshell → config
- **Dividers** after: weather, fate, tomes (use the native `Separator` widget).

---

## 6. Tokens — TLF palette + type

Maps to Umbra's ColorProfile (native widgets) and the plugin theme (custom widgets).

```
accent          #D67B3C
accent-bright   #F2A057
accent-deep     #A85820
frost-bg        #0E1624 (E5 alpha)
frost-bg-darker #0A0D14 (F2 alpha)
frost-fg        #E4ECF5
frost-fg-muted  #8E9EB2
outline         #B2B2B2
hp-green        #6FBF6A
proc            #FFAD38

font.display    Cinzel
font.mono       JetBrains Mono
font.rune       Eorzea
```

**Open decision that gates the plugin:** token prefix (`--fr-*` / ember vs `--tlf-*`) and whether Tonberry Tactics adopts the new theme as a hard swap or coexists with `TlfTheme`. Settle before the widget hardcodes colors — it does not block the config-level theming or the placement test.

---

## 7. Microcopy rules

- Severity = a Lucide category icon + a one-word Refia annotation (**Stab.** / **Stab?** / **Stab…**).
- No `!`, no emoji, no chirp. Personality lives in word choice.
- Empty states are dry, never cute (`Offline`, not `No one home :(`).

---

## 8. Build order

1. **(Optional quick win)** TLF ColorProfile + font set — re-skins the native bar to TLF colors/fonts, zero code.
2. **`Custom.TonberryTactics`** — the Una.Drawing widget, registered with Umbra's widget registry. The real test and the highest-value piece.
3. **Brand + Linkshell + Config** custom widgets.
4. **Extract** the validated widget code toward the standalone TLF HUD plugin (same Una.Drawing runtime).

The KH-style player frame (portrait + HP ring, bottom-left) is **not** in scope here — it isn't a horizontal toolbar shape and doesn't fit Umbra's widget model. It stays in the standalone plugin.

---

## Appendix — corrected schema reference (for the next design pass)

If JSONs keep getting authored, target the real format:

| v3 pack (wrong) | Real Umbra (right) |
|---|---|
| `"type": "World.Weather"` | `"Name": "Weather"` |
| `"slot": "main-center"` | `"Location": "Center"` |
| `"sortIndex": 40` | `"SortIndex": 40` |
| `"config": { "Display.ValueSource": ... }` | `"Config": { ...flat PascalCase... }` |
| `"color.accent"` / `"#D67B3C"` / CSS strings | named color or ARGB uint (`4294967295`) |
| `"Custom.TonberryTactics"`, `"Generic.Button"` | a type registered by a companion plugin |
| per-widget `id` / `instanceId` / `displayName` | none — the GUID key is the instance id |
| profile `layout` + `dividers` + CSS `toolbar` block | widgets carry their own `Location`/`SortIndex`; dividers are `Separator` widgets |
| drop folder into `packs/` dir | full-config blob import, or add in-UI |
