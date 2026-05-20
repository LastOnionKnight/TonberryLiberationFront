# TLF Suite — Design Kickoff Package

This package is the input bundle for the next Claude Design pass. It seeds
the Tonberry Liberation Front design system across all current and planned
surfaces: the Tonberry Tactics plugin, the TonberryTactics website, and
the new TLF HUD plugin.

## What's in this package

```
00-README.md                this file
01-DESIGN_BRIEF.md          the strategic brief for the design pass
02-LOCKED_DECISIONS.md      three architectural decisions to honor
03-PLUGIN_LANDSCAPE.md      catalog of currently installed plugins +
                            absorption tier-list (what TLF Suite replaces)
04-DESIGN_PRINCIPLES.md     prose rules for visual + behavioral choices

plugin/                     Tonberry Tactics plugin source (GearGoblin)
core/                       GearGoblin.Core (Brian to add — local D: drive)
website/                    TonberryTactics web app (Brian to add)
ui-package-v2/              prior Claude Design output to extend (not redo)
inspiration/                portraits + reference assets
```

## How to use this

1. Hand the whole ZIP to Claude Design as the input context.
2. Claude Design reads files in numeric order (00 → 01 → 02 → 03 → 04),
   then absorbs the existing UI package (ui-package-v2/) and plugin
   source (plugin/) to understand the runtime contexts.
3. Claude Design produces the next-generation design package, building
   on (not replacing) the v2 tokens, with explicit deliverables for
   the TLF HUD plugin's v0.1 MVP.

## Why this exists

We're moving from "single tool" to "suite." Tonberry Tactics handles the
gear and materia surface. The new TLF HUD plugin handles the HUD overhaul
surface (replacing KH Bars + Umbra over time). Both share one design
language, one set of tokens, one brand. This kickoff exists to make sure
the next Claude Design pass extends what's already built rather than
producing parallel mismatched output.

Read `01-DESIGN_BRIEF.md` first.
