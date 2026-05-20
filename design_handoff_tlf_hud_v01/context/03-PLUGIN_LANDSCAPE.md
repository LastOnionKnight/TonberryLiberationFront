# Plugin Landscape — What TLF Suite Will Replace

Cataloged from Brian's `pluginConfigs/` folder (74 entries). Some are
duplicates from version upgrades (e.g. two `Artisan` configs, two
`GatherBuddy` configs); the actual installed plugin count is lower.

Plugins are grouped by their relationship to the TLF Suite:

---

## A. ABSORB — slated for replacement by TLF Suite

These plugins overlap with TLF Suite's planned scope. They get
uninstalled as TLF plugins reach parity.

| Plugin                         | Replaced by                              | Phase |
|--------------------------------|------------------------------------------|-------|
| CharacterPanelRefined          | Tonberry Tactics Character tab           | TT v0.7 |
| KingdomHeartsPlugin (KH Bars)  | TLF HUD — PlayerFrame                    | TLF HUD v0.2-v0.3 |
| Umbra                          | TLF HUD — toolbar + widgets + layout ed. | TLF HUD v0.1 (toolbar), v0.2+ (widgets/editor) |

---

## B. ABSORB CANDIDATES — possible future TLF widgets

These are smaller-surface plugins that could be folded into TLF HUD
as optional widgets rather than warranting their own plugin. Not in
v0.1 scope; evaluate per case after PlayerFrame ships.

| Plugin           | What it does                                | Potential TLF home                       |
|------------------|---------------------------------------------|------------------------------------------|
| DelvUI           | Full HUD overlay (HP/MP/gauges/etc.)        | TLF HUD long-term (post-PlayerFrame)     |
| ChatBubbles      | Chat bubbles over NPCs/players              | TLF HUD chat widget                      |
| Honorific        | Custom title text rendering                 | TLF HUD party-list / target widget       |
| MaterialUI       | Native UI texture theme                     | TLF HUD Penumbra-collection companion    |
| DynamicUIScaling | UI scaling                                  | TLF HUD tweaks panel                     |
| Namingway        | Skill name aliases                          | TLF HUD optional widget                  |
| AutoVisor        | Visor toggle                                | TLF HUD micro-widget                     |
| PeepingTom       | Target tracker                              | TLF HUD optional widget                  |

---

## C. KEEP — infrastructure / mod system

These are foundational tools other plugins depend on. Out of scope for
absorption.

- **Penumbra** — mod loader
- **Glamourer** — appearance modification
- **MareSynchronos** — appearance sync
- **CustomizePlus** — character customization
- **VFXEditor**, **VFXEditor-Beta** — VFX modification
- **Dalamud.DiscordBridge** — Discord integration
- **BDTHPlugin** — housing modification

---

## D. KEEP — gameplay utilities (different category from HUD)

Plugins that solve specific gameplay problems (crafting, retainers,
markets, minigames) and have nothing to do with HUD/UI overhaul. Not
absorption candidates.

- **Artisan**, **Craftimizer** — crafting
- **AutoRetainer**, **AutoHook** — retainer / fishing automation
- **GatherBuddy** — gathering
- **LazyLoot** — auto-loot
- **MapPartyAssist**, **TeleporterPlugin** — navigation
- **MarketBoardPlugin**, **ItemSearchPlugin**, **Avarice** — economy
- **MiniCactpotSolver**, **TriadBuddy**, **PalacePal**, **ZodiacBuddy**,
  **HarpHero**, **MidiBard2**, **MidiBard2Preview** — minigames /
  content-specific tools
- **MultiHit** — input emulation
- **PandorasBox** — feature pack (overlaps trivially with TLF Suite
  but not enough to absorb)
- **WrathCombo**, **XIVCombo**, **XIVComboExpanded** — combo helpers
- **InventoryTools**, **Saucy**, **MakePlacePlugin**, **ReMakePlacePlugin**,
  **SubmarineTracker**, **DailyDuty**, **Doorbell**, **Tourist**,
  **Kapture**, **MiniCactpotSolver**, **ResLogger2.Plugin** — utility
- **XIVDeck.FFXIVPlugin** — Stream Deck integration

---

## E. NOISE — duplicate or stale config folders

These appear to be old version configs that linger after upgrades.
No action needed; informational only.

- `Artisan` (×2)
- `GatherBuddy` (×2)
- `DailyDuty` (×2)
- `Glamourer` (×2)
- `InventoryTools` (×2)
- `Kapture` (×2)
- `MapPartyAssist` (×2)
- `MaterialUI` (×2)
- `MidiBard2` / `MidiBard2Preview`
- `Penumbra` + `Penumbra.json.bak`
- `Saucy` + `Saucy.json.old`
- `MareSynchronos` + `MareSynchronos.json.old`
- `SubmarineTracker` (×2)
- `Tourist` (×2)
- `VFXEditor` + `VFXEditor-Beta`

---

## What this means for the suite design

**Concrete TLF Suite end-state (1-2 years out):**

- ✅ Tonberry Tactics — replaces CharacterPanelRefined
- ✅ TLF HUD — replaces KH Bars and Umbra
- ❓ TLF HUD ALSO absorbs: DelvUI's gauges (maybe), ChatBubbles (maybe),
   Honorific (maybe), 2-3 micro-widgets from category B
- ✅ Brian keeps: Penumbra, Glamourer, MareSynchronos, all gameplay
   utilities from category D

That's a realistic, focused suite. Not "TLF replaces everything" — TLF
replaces the HUD-shaped things and the gear-advice-shaped things, and
that's enough to justify the brand.

**v0.1 of TLF HUD only needs to deliver on the Umbra-replacement
piece** (toolbar pattern) plus the Tactics Popout (TT bridge). The
other absorptions are downstream.
