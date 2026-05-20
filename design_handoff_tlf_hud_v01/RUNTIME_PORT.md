# Runtime Port — Tokens → Una.Drawing → ImGui

The goal of this document is to make the design tokens in this handoff
**unambiguous to port** for both runtime targets:

- **Una.Drawing** — TLF HUD plugin (this v0.1 scope)
- **ImGui** — Tonberry Tactics plugin (v0.7+ adopts the same tokens)

For every token group, you'll see:
1. The canonical value (CSS hex/string)
2. The Una.Drawing expression
3. The ImGui call

If you only implement one section completely, make it **§3 Colors** —
those are the values most likely to be wrong if you eyeball them from
screenshots.

> ⚠️ This document assumes a working knowledge of both Una.Drawing's
> `Node` / `Style` model and Dalamud's ImGui bindings. It does NOT
> attempt to teach either library. When in doubt, the canonical CSS
> values in `v01/v01.css` are the source of truth; if your runtime
> output doesn't match the CSS reference, the CSS wins.

---

## §1 — Conversion helpers

### 1.1 Hex → ImGui Vector4

Dalamud's `Vector4(r, g, b, a)` takes floats in `[0, 1]`. The
conversion from `#RRGGBB[AA]` is:

```csharp
public static Vector4 Hex(uint hex)
{
    var a = ((hex >> 24) & 0xFF) / 255f;
    var r = ((hex >> 16) & 0xFF) / 255f;
    var g = ((hex >>  8) & 0xFF) / 255f;
    var b = ( hex        & 0xFF) / 255f;
    // If the alpha byte is 0, treat as opaque (so #D67B3C parses correctly)
    if (a == 0f) a = 1f;
    return new Vector4(r, g, b, a);
}
// Usage:
// Vector4 ember = Hex(0xD67B3CFF);      // explicit alpha
// Vector4 ember = Hex(0xD67B3C);        // implicit 1.0 alpha
```

For `rgba(r,g,b,a)` strings where `a < 1`, just normalize each
component yourself:

```csharp
public static Vector4 Rgba(byte r, byte g, byte b, float a)
    => new Vector4(r / 255f, g / 255f, b / 255f, a);
// Usage:
// Vector4 tbg = Rgba(20, 22, 28, 0.92f);
```

### 1.2 Hex → Una.Drawing `Color`

Una.Drawing's `Color` constructor accepts either an `argb` uint or
component bytes. **Recommend the explicit ARGB uint** because the CSS
file you'll be porting is hex-native:

```csharp
// Solid color from a hex literal — ARGB byte order (A in the high byte):
var ember = new Color(0xFFD67B3C);            // matches CSS #D67B3C
var emberSoft = new Color(0x2DD67B3C);        // 18% alpha = 0x2D ≈ 0.18
```

If you keep the literal in RGB order (matching the CSS file character
for character), wrap it:

```csharp
public static Color UC(uint rgb, float a = 1f)
    => new Color(((uint)(a * 255) << 24) | (rgb & 0x00FFFFFF));
// var ember = UC(0xD67B3C);
// var emberHover = UC(0xD67B3C, 0.10f);
```

### 1.3 Centralize them in `TlfTokens.cs`

Don't scatter color literals across plugin files. Define one static
class so future palette changes are a one-file diff:

```csharp
public static class TlfTokens
{
    // Frost UI authentic (preserved from v2)
    public static readonly Color FrBg          = UC(0x14161C, 0.90f);
    public static readonly Color FrBgDarker    = UC(0x0E1016, 0.95f);
    public static readonly Color FrSecondary   = UC(0x3A3E48);
    public static readonly Color FrFg          = UC(0xF2F2F5);
    public static readonly Color FrFg2         = UC(0xBEC4D0);
    public static readonly Color FrFg3         = UC(0x8791A2);
    public static readonly Color FrFg4         = UC(0x505A69);
    public static readonly Color FrOutline     = UC(0xB2B2B2);
    public static readonly Color FrOutlineSoft = UC(0xB2B2B2, 0.45f);

    // Ember accent (Onion Knight default)
    public static readonly Color FrAccent       = UC(0xD67B3C);
    public static readonly Color FrAccentBright = UC(0xF2A057);
    public static readonly Color FrAccentDeep   = UC(0xA85820);

    // Status
    public static readonly Color HpGreen   = UC(0x6FBF6A);
    public static readonly Color SevWarn   = UC(0xE2C36A);
    public static readonly Color SevNote   = UC(0x7FC9EE);

    // Per-token sizes (px)
    public const int ToolbarHeight   = 44;
    public const int ToolbarRadius   = 10;
    public const int ToolbarPadX     = 10;
    public const int ToolbarPadY     = 6;
    public const int ToolbarGap      = 6;
    // …
}
```

The ImGui plugin (Tonberry Tactics) reads from the same class via
`Vector4 ToVec4(this Color c)` extension.

---

## §2 — Conversion table at a glance

Generated from `v01/v01.css`. Every value is exact.

### 2.1 Frost UI tokens (preserved from v2)

| CSS token            | Hex / value              | Vector4 (R, G, B, A)               | Notes |
|----------------------|--------------------------|-------------------------------------|-------|
| `--fr-bg`            | `rgba(20,22,28,0.90)`    | `(0.0784, 0.0863, 0.1098, 0.90)`   | Window fill |
| `--fr-bg-darker`     | `rgba(14,16,22,0.95)`    | `(0.0549, 0.0627, 0.0863, 0.95)`   | Tooltip / popout fill |
| `--fr-secondary`     | `rgb(58,62,72)`          | `(0.2275, 0.2431, 0.2824, 1)`      | Buttons (idle) |
| `--fr-ternary`       | `rgb(178,178,181)`       | `(0.6980, 0.6980, 0.7098, 1)`      | Slider knobs |
| `--fr-fg`            | `rgb(242,242,245)`       | `(0.9490, 0.9490, 0.9608, 1)`      | Primary text |
| `--fr-fg-2`          | `rgb(190,196,208)`       | `(0.7451, 0.7686, 0.8157, 1)`      | Secondary text |
| `--fr-fg-3`          | `rgb(135,145,162)`       | `(0.5294, 0.5686, 0.6353, 1)`      | Tertiary text / labels |
| `--fr-fg-4`          | `rgb(80,90,105)`         | `(0.3137, 0.3529, 0.4118, 1)`      | Quaternary / disabled |
| `--fr-outline`       | `rgba(178,178,178,1)`    | `(0.6980, 0.6980, 0.6980, 1)`      | Hard borders |
| `--fr-outline-soft`  | `rgba(178,178,178,0.45)` | `(0.6980, 0.6980, 0.6980, 0.45)`   | Soft borders |
| `--fr-accent`        | `#D67B3C`                | `(0.8392, 0.4824, 0.2353, 1)`      | Ember accent — PRIMARY |
| `--fr-accent-bright` | `#F2A057`                | `(0.9490, 0.6275, 0.3412, 1)`      | Ember highlight |
| `--fr-accent-deep`   | `#A85820`                | `(0.6588, 0.3451, 0.1255, 1)`      | Ember shadow |
| `--fr-proc`          | `rgb(255,173,56)`        | `(1.0000, 0.6784, 0.2196, 1)`      | Skill proc highlight |
| `--fr-tank`          | `rgb(81,104,204)`        | `(0.3176, 0.4078, 0.8000, 1)`      | Tank role |
| `--fr-healer`        | `rgb(135,204,81)`        | `(0.5294, 0.8000, 0.3176, 1)`      | Healer role |
| `--fr-dps`           | `rgb(204,81,81)`         | `(0.8000, 0.3176, 0.3176, 1)`      | DPS role |

### 2.2 Severity tokens (v0.1-new, palette-dependent)

| Palette       | `--sev-critical`         | `--sev-warning`         | `--sev-note`             |
|---------------|--------------------------|-------------------------|--------------------------|
| `classic` ★   | `#D67B3C` (ember)        | `#E2C36A` (gold)        | `#7FC9EE` (cyan)         |
| `leaf`        | `#D67B3C`                | `#E2C36A`               | `#6FBF6A` (leaf-green)   |
| `ember-only`  | `#D67B3C`                | `#F2A057`               | `#C89A6E`                |

★ Default. Persist `severityPalette` in plugin config; read at frame-zero.

### 2.3 Toolbar tokens (v0.1-new)

| Token                       | Value                                     | Type   |
|-----------------------------|-------------------------------------------|--------|
| `--tlf-toolbar-bg`          | `rgba(20,22,28,0.92)`                     | color  |
| `--tlf-toolbar-opacity`     | `1.0`                                     | float  |
| `--tlf-toolbar-height`      | `44`                                      | px     |
| `--tlf-toolbar-pad-x`       | `10`                                      | px     |
| `--tlf-toolbar-pad-y`       | `6`                                       | px     |
| `--tlf-toolbar-gap`         | `6`                                       | px     |
| `--tlf-toolbar-radius`      | `10`                                      | px     |
| `--tlf-toolbar-border`      | `1px solid var(--fr-outline-soft)`        | recipe |
| `--tlf-toolbar-shadow`      | three-layer shadow                        | recipe |

Shadow decomposition:
```
0 12px 32px rgba(0,0,0,0.55)        — primary drop shadow
0 0 0 1px rgba(0,0,0,0.4)           — 1px inset border (above outline-soft)
inset 0 1px 0 rgba(255,255,255,0.06) — 1px top inner highlight
```

In Una.Drawing express as the node's `ShadowSize` plus a manual inset
node for the top highlight (Una.Drawing's shadow doesn't support
multi-stop drop shadows out of the box — see §6.4).

### 2.4 Widget / Brand / Popout / Navigator / Edit-mode tokens

| Token                         | Value                                      |
|-------------------------------|--------------------------------------------|
| `--tlf-widget-bg`             | `rgba(0,0,0,0.28)`                         |
| `--tlf-widget-bg-hover`       | `rgba(214,123,60,0.10)`                    |
| `--tlf-widget-radius`         | `5px`                                      |
| `--tlf-widget-min-h`          | `36px`                                     |
| `--tlf-brand-bg`              | gradient `rgba(214,123,60, 0.22 → 0.06)`   |
| `--tlf-brand-bg-hover`        | gradient `rgba(214,123,60, 0.34 → 0.10)`   |
| `--tlf-brand-radius`          | `6px`                                      |
| `--tlf-popout-bg`             | `rgba(14,16,22,0.96)`                      |
| `--tlf-popout-border`         | `2px solid var(--fr-outline)`              |
| `--tlf-popout-radius`         | `8px`                                      |
| `--tlf-popout-width`          | `380px` (tactics) / `320px` (navigator)    |
| `--tlf-popout-max-h`          | `540px`                                    |
| `--tlf-popout-arrow-size`     | `12px`                                     |
| `--tlf-popout-offset`         | `10px` (vertical gap from anchor)          |
| `--tlf-editmode-outline`      | `2px dashed var(--fr-accent)` (default)    |
| `--tlf-editmode-offset`       | `6px`                                      |
| `--tlf-editmode-bg-tint`      | `rgba(214,123,60,0.10)`                    |
| `--tlf-editmode-handle`       | `var(--ember)`                             |

### 2.5 Typography

Per the v0.1 design, **only one display family** (Cinzel) and **one
body family** (Cormorant Garamond). JetBrains Mono is used for
numerics. Eorzea.ttf is decoration only.

| Use                       | Family             | Size  | Weight | Letter-spacing |
|---------------------------|--------------------|-------|--------|-----------------|
| Widget all-caps label     | Cinzel             | 8px   | 600    | 0.20em          |
| Popout eyebrow            | Cinzel             | 9px   | 600    | 0.20em          |
| Banner label, button text | Cinzel             | 10px  | 700-800| 0.18em          |
| Tooltip line              | Cinzel             | 11px  | 400    | 0.04em          |
| Widget value (numeric)    | JetBrains Mono     | 11px  | 600    | 0.02em          |
| Finding title             | Cinzel             | 11px  | 700    | 0.04em          |
| Stab. / Stab? / Stab…     | Cormorant Garamond italic | 11px | 400 | 0               |
| Body quip                 | Cormorant Garamond italic | 12px | 400 | 0               |
| Finding body              | Cormorant Garamond italic | 12.5px | 400 | 0             |
| Popout title              | Cinzel             | 13px  | 800    | 0.12em          |
| Popout headline           | Cinzel             | 14px  | 700    | 0.03em          |
| Score number              | JetBrains Mono     | 16px  | 700    | 0               |
| Navigator title           | Cinzel             | 14px  | 800    | 0.10em          |

In Una.Drawing, register the fonts at plugin startup:

```csharp
FontRegistry.SetNativeFontFamily(0, "Cinzel");
FontRegistry.SetNativeFontFamily(1, "Cormorant Garamond");
FontRegistry.SetNativeFontFamily(2, "JetBrains Mono");
FontRegistry.SetNativeFontFamily(3, "Eorzea");
```

In ImGui (Tonberry Tactics), push/pop fonts via Dalamud's font atlas:

```csharp
using (ImRaii.PushFont(plugin.Fonts.Cinzel14Bold))
{
    ImGui.TextUnformatted("AUDIT SCORE");
}
```

---

## §3 — Component recipes

For each visible component below, the section gives:
- a **CSS reference** (the class in `v01.css`)
- an **Una.Drawing C# node-tree** sketch
- an **ImGui drawlist** sketch

These are sketches, not literal code. Adapt to your plugin's actual
helper classes.

### 3.1 Toolbar root (.tlf-toolbar)

**CSS (extract):**
```css
.tlf-toolbar {
  position: absolute;
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px;
  background: rgba(20,22,28,0.92);
  border: 1px solid rgba(178,178,178,0.45);
  border-radius: 10px;
  height: 44px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.55), ...;
}
```

**Una.Drawing:**
```csharp
var toolbar = new Node {
    Id = "tlf-toolbar",
    Style = new Style {
        Anchor       = Anchor.TopLeft,
        Flow         = Flow.Horizontal,
        Padding      = new EdgeSize(TlfTokens.ToolbarPadY, TlfTokens.ToolbarPadX),
        Gap          = TlfTokens.ToolbarGap,
        BorderRadius = TlfTokens.ToolbarRadius,
        BackgroundColor = TlfTokens.FrBg.WithAlpha(0.92f),
        BorderWidth  = new EdgeSize(1),
        BorderColor  = new BorderColor(TlfTokens.FrOutlineSoft),
        ShadowSize   = new EdgeSize(24),
        ShadowColor  = new Color(0x8C000000),  // rgba(0,0,0,0.55) approximated
        Size         = new Size(0, TlfTokens.ToolbarHeight),  // auto width
    }
};
// child nodes: BrandChip, Divider, Widget×N, Divider, TacticsChip, …
```

**ImGui** (Tonberry Tactics uses this pattern when adopting these
tokens at v0.7+; the plugin doesn't draw the toolbar itself today):
```csharp
var drawList = ImGui.GetForegroundDrawList();
drawList.AddRectFilled(p0, p1,
    ImGui.GetColorU32(TlfTokens.FrBg.WithAlpha(0.92f).ToVec4()),
    TlfTokens.ToolbarRadius);
drawList.AddRect(p0, p1,
    ImGui.GetColorU32(TlfTokens.FrOutlineSoft.ToVec4()),
    TlfTokens.ToolbarRadius, ImDrawFlags.None, 1f);
```

### 3.2 Widget chip (.tlf-widget)

**Una.Drawing:**
```csharp
var widget = new Node {
    Style = new Style {
        Flow         = Flow.Horizontal,
        Padding      = new EdgeSize(4, 10),
        Gap          = 8,
        BorderRadius = 5,
        BackgroundColor = TlfTokens.FrBg.WithAlpha(0.28f).Multiply(0, 0, 0, 1), // ~rgba(0,0,0,0.28)
        BorderWidth  = new EdgeSize(1),
        BorderColor  = new BorderColor(TlfTokens.FrOutlineSoft.WithAlpha(0.22f)),
        MinSize      = new Size(0, TlfTokens.WidgetMinH),
    }
};
widget.OnMouseEnter += _ => widget.Style.BackgroundColor =
    TlfTokens.FrAccent.WithAlpha(0.10f);
widget.OnMouseEnter += _ => widget.Style.BorderColor =
    new BorderColor(TlfTokens.FrAccent);
widget.OnMouseLeave += _ => /* reset to defaults */;
```

Inside, two children: an icon node (18×18) and a text column with
label + value rows.

### 3.3 Tactics chip (.tlf-tactics, .tlf-tactics-pip)

State drives the chip appearance. Compute once per frame:

```csharp
TacticsSeverity severity =
    auditFindings.Any(f => f.Severity == Severity.Critical) ? TacticsSeverity.Critical :
    auditFindings.Any(f => f.Severity == Severity.Warning)  ? TacticsSeverity.Warning  :
                                                              TacticsSeverity.Ok;

(Color bg, Color border, Color voiceColor, string voice) = severity switch
{
    TacticsSeverity.Critical => (
        GradientStart(TlfTokens.FrAccent, 0.18f),
        TlfTokens.FrAccent,
        TlfTokens.FrAccent,
        "Stab."),
    TacticsSeverity.Warning => (
        GradientStart(TlfTokens.SevWarn, 0.16f),
        TlfTokens.SevWarn,
        TlfTokens.SevWarn,
        "Stab?"),
    TacticsSeverity.Ok => (
        GradientStart(TlfTokens.HpGreen, 0.15f),
        TlfTokens.HpGreen,
        TlfTokens.HpGreen,
        "Stab…"),
};
```

`GradientStart` for Una.Drawing returns a flat color approximation
(since Una.Drawing's gradient support is currently a stretch). If you
need the real gradient, layer two nodes (top: brighter, bottom:
darker).

The **count pip** is a separate circular node anchored to the chip's
top-right corner:

```csharp
var pip = new Node {
    Style = new Style {
        Anchor        = Anchor.TopRight,
        Translate     = new Vector2(6, -6),  // overhang
        Size          = new Size(18, 18),
        BorderRadius  = 9,                   // fully round
        BackgroundColor = bg,                 // ember / gold / green per severity
        BorderWidth   = new EdgeSize(1),
        BorderColor   = new BorderColor(TlfTokens.FrAccentBright),
    },
    NodeValue = findings.Count.ToString(),
    // text style: Cinzel 900, 10px, #1A0D04
};
```

### 3.4 Brand chip (.tlf-brand)

**Important:** the brand chip click target opens the **Suite Navigator**
popover — NOT the Tactics popout. These are peer surfaces. See §4.2 for
the close-the-other-when-opening logic.

**Una.Drawing:**
```csharp
var brand = new Node {
    Id = "brand-chip",
    Style = new Style {
        Flow         = Flow.Horizontal,
        Padding      = new EdgeSize(4, 12, 4, 6),  // top, right, bottom, left
        Gap          = 10,
        BorderRadius = TlfTokens.BrandRadius,
        BackgroundColor = GradientStart(TlfTokens.FrAccent, 0.22f),
        BorderWidth  = new EdgeSize(1),
        BorderColor  = new BorderColor(TlfTokens.FrAccent),
    }
};
brand.OnClick += _ => OpenNavigator();

// Child 1: helm avatar (30×30 circular, masked image)
brand.AppendChild(new Node {
    Style = new Style {
        Size = new Size(30, 30),
        BorderRadius = 15,
        BackgroundImage = "assets/helm-avatar.png",
        BackgroundImageScaleMode = ScaleMode.Cover,
        // Mask to fit a circle. object-position: 50% 35% in CSS means
        // shift the image down ~15% so the face is centered.
        BackgroundImageOffset = new Vector2(0, -0.15f),
    }
});

// Child 2: text column (TONBERRY / LIBERATION FRONT)
// Child 3: « TLF » rune in Eorzea font, opacity 0.7
```

### 3.5 Tactics Popout (.tlf-popout) — anchored dropdown

The popout is a **separate Una.Drawing window** (or a high-z floating
node) that opens beneath the Tactics chip. Pseudo:

```csharp
public void OpenTacticsPopout()
{
    var chipRect = tacticsChip.AbsoluteBoundingRect;
    var popX = chipRect.Center.X - PopoutWidth / 2f;
    popX = Math.Clamp(popX, 12, screenW - PopoutWidth - 12);
    var popY = chipRect.Bottom + TlfTokens.PopoutOffset;
    var arrowX = chipRect.Center.X - popX - 7f;  // for the ::before pseudo

    popout.Position = new Vector2(popX, popY);
    popout.Visible  = true;
    popout.SetArrowOffset(arrowX);
}
```

The popout's internal structure (header / score / findings list /
footer) is a vertical flow of nodes; see `v01/v01-popout.jsx` for the
layout to mirror.

**Anchor refresh.** In edit mode the toolbar can move; in non-edit mode
the toolbar is static but the user could resize the game window. Re-
compute the popout position every frame while it's visible (cheap; just
re-call `OpenTacticsPopout`'s position math).

### 3.6 Suite Navigator (.tlf-nav) — brand-chip popover

Same anchored-dropdown pattern as the Tactics popout, but **smaller**
(320px wide), anchored under the brand chip instead.

Navigator rows are clickable nodes that emit one of these actions:

| Action            | Plugin call                                             |
|-------------------|---------------------------------------------------------|
| `open-tactics`    | Close navigator, open the Tactics popout                |
| `open-tweaks`     | Focus the plugin's Tweaks window                        |
| `focus-linkshell` | Issue `/chat focus` or activate the LS tab              |
| `open-about`      | Open the About modal                                    |

Rows that aren't available yet (PlayerFrame, Party list — flagged
"v0.2", "v0.3+") render with `opacity: 0.55` and no click target.
They're catalog items, not interactive.

### 3.7 About modal (.tlf-about)

Centered modal, ember-bordered, dark scrim. Closes on Esc, scrim
click, or × button. Single column of two `<p>` blocks (one neutral,
one heavier Cork accent) over a wordmark.

This is one of the few places the brand voice explicitly leans into
the Cork register per §3.6 of `04-DESIGN_PRINCIPLES.md`. The UI labels
stay neutral; the chronicle body is where the voice gets thicker.

---

## §4 — Interaction & state

### 4.1 Peer-surface invariants

**Brand chip → Suite Navigator** and **Tactics chip → Tactics Popout**
are peer overlays. Only one is visible at a time. Per the plugin's
state machine:

```csharp
void OpenNavigator()
{
    if (tacticsPopout.Visible) CloseTacticsPopout();
    navigator.Visible = true;
    UpdateNavAnchor();
}

void OpenTacticsPopout()
{
    if (navigator.Visible) CloseNavigator();
    tacticsPopout.Visible = true;
    UpdateTacticsAnchor();
}
```

### 4.2 Esc-key precedence

Multiple overlays can stack (Tactics + About is the realistic case —
the user navigates to About via Navigator → About, but Navigator
closes itself before About opens, so usually only one is visible).
Defensive precedence:

```
About (modal)  →  Tactics popout  →  Navigator  →  Edit mode
```

A single Esc consumes the topmost; subsequent Escs unwind down the
stack.

### 4.3 Cross-plugin signals (one-shot flags)

Per `04-DESIGN_PRINCIPLES.md` "Cross-surface signals are one-shot
flags." Implement as a static `TlfSuiteBus` (or similar) with bool
fields the receiving plugin consumes-and-resets on its next draw:

```csharp
public static class TlfSuiteBus
{
    public static bool WantsAuditOnNextDraw   { get; set; }
    public static bool WantsTweaksOnNextDraw  { get; set; }
    public static bool WantsLinkshellOnNextDraw { get; set; }
    public static bool WantsAboutOnNextDraw   { get; set; }
}

// Tonberry Tactics' draw loop:
public void Draw()
{
    if (TlfSuiteBus.WantsAuditOnNextDraw)
    {
        TlfSuiteBus.WantsAuditOnNextDraw = false;
        OpenAuditTab();
    }
    // …
}
```

No event bus. No observer pattern. The ImGui/Una.Drawing single-thread
redraw model makes simple bools the cleanest path.

### 4.4 Persistence

Per the brief: **persistence is per-session unless the user explicitly
saves.** Configuration toggles (theme, accent, opacity, toolbar shape,
popout mode) persist immediately. Layout positions (toolbar X/Y,
floating popout X/Y) persist immediately. Mode-state (popoutOpen,
navigatorOpen, editMode) is in-memory only.

`DalamudPluginInterface.SavePluginConfig` on every persisted change.

---

## §5 — Animation translation

CSS uses `cubic-bezier(0.2, 0.6, 0.2, 1)` ease-out at 180–240ms for
state transitions and 220ms for popover entrances. In Una.Drawing
your options are:

1. **Property tween via Una.Drawing's built-in transitions** if the
   library supports them at your version. Some versions expose
   `Style.Transition` properties like CSS.
2. **Manual lerping** in `Draw` — track the previous frame's value,
   advance by `dt / duration`, clamp.

For ImGui (Tonberry Tactics), use manual lerping. Pseudo:

```csharp
float lerpHoverProgress = 0f;
public void Draw(bool hovered)
{
    var target = hovered ? 1f : 0f;
    var dt = ImGui.GetIO().DeltaTime;
    var k  = 1f - MathF.Pow(0.001f, dt / 0.220f);   // ease-out approximation
    lerpHoverProgress = MathHelper.Lerp(lerpHoverProgress, target, k);

    var color = Vector4.Lerp(idleColor, hoverColor, lerpHoverProgress);
    drawList.AddRectFilled(p0, p1, ImGui.GetColorU32(color), radius);
}
```

If frame rate is the constraint, **snap** instead of lerping — an
instant transition reads cleaner than a janky one.

---

## §6 — Known degradations

CSS features that won't translate cleanly. For each, the spec gives
a fallback that should be used.

### 6.1 `backdrop-filter: blur()`

CSS uses `backdrop-filter: blur(20px) saturate(1.2)` on the toolbar,
popout, and navigator. Una.Drawing has no equivalent. Drop the blur
entirely. The flat fill at `alpha = 0.92` is the implementation
reality — the result is a slightly more opaque chrome. **Polish —
optional**, but explicitly accepted as deferred.

### 6.2 CSS gradients

`linear-gradient(180deg, rgba(214,123,60,0.22), rgba(214,123,60,0.06))`
on the brand chip, the popout header, etc. Three implementation paths
in Una.Drawing, ranked best → worst:

1. **Native gradient property** if your Una.Drawing version supports
   `BackgroundGradient`.
2. **Stacked nodes** — two semi-transparent nodes (top = brighter,
   bottom = darker) overlapping a flat-color parent.
3. **Flat color averaged** — `rgba(214,123,60,0.14)` as the chrome
   fill. Acceptable degradation for v0.1.

For ImGui, `ImDrawList.AddRectFilledMultiColor` natively does
two-color vertical/horizontal gradients — use it directly:

```csharp
drawList.AddRectFilledMultiColor(p0, p1,
    Pack(0xD67B3C, 0.22f),    // top-left
    Pack(0xD67B3C, 0.22f),    // top-right
    Pack(0xD67B3C, 0.06f),    // bottom-right
    Pack(0xD67B3C, 0.06f));   // bottom-left
```

### 6.3 Dashed borders

Una.Drawing typically only supports solid borders. The edit-mode
`dashed` visual variant is the only place v0.1 uses dashed strokes.

Fallback strategy: when the user's `editVisual` setting is `dashed`,
silently substitute `solid-glow` (2px solid ember) until/unless
dashed-stroke support lands. Or fake it with a 9-slice repeating
texture if you want the authentic look — `assets/` has no such
texture today; flagged as out-of-scope for v0.1.

`solid-glow` and `tinted` translate natively, so the user can opt out
of `dashed` via Tweaks if the Una.Drawing version doesn't support it.

### 6.4 Multi-stop drop shadows

CSS toolbar shadow stacks three layers. Una.Drawing's `Style.ShadowSize`
+ `Style.ShadowColor` give you one. For v0.1, **use only the primary
drop shadow**:

```csharp
ShadowSize  = new EdgeSize(24),
ShadowColor = new Color(0x8C000000),     // rgba(0,0,0,0.55)
```

Drop the 1px inset border ("0 0 0 1px rgba(0,0,0,0.4)") — it's a fine
detail that won't visually break anything. Drop the inset top highlight
unless your Una.Drawing version has `BoxShadowInset` support.

For ImGui, build the stack manually — three sequential
`AddRectFilled` calls behind the chrome rect (largest first).

### 6.5 `image-rendering: pixelated`

The Tonberry mascot GIFs are pixel art (32×32 sprite assets) that
should render with nearest-neighbor scaling when displayed at
24×24 / 26×26 / 30×30 / 64×64 in the HUD. Una.Drawing's image
display is typically linear-sampled by default.

If your Una.Drawing version supports a `BackgroundImageScaleMode`
or `Texture.FilterMode`, set it to `Nearest` / `Point` for these
images.

If not, render the sprites at their native 32px size when possible
(the toolbar mascot at 26px is the worst case — close enough that
linear sampling looks OK).

### 6.6 Animated GIFs

Static FFXIV addons render at 60fps. The Tonberry GIFs have multiple
frames. If your Una.Drawing or texture pipeline doesn't handle
animated GIFs, extract a representative single frame (frame 0) and
ship that as a PNG. The mascot read is dominated by silhouette
recognition, not the animation.

---

## §7 — Cross-runtime checklist

Use this when implementing each surface. Tick everything before
considering the surface "done".

### Toolbar
- [ ] Position: `(toolbarX, toolbarY)` from config; default top-center
- [ ] Shape: pill / full / edge-top / edge-bottom respected from config
- [ ] Opacity: applies to the toolbar root only, NOT child text/images
- [ ] Brand chip → opens Suite Navigator
- [ ] Tactics chip → opens Tactics Popout per `popoutMode`
- [ ] Hover tooltips fire on each non-brand widget after ~120ms hover
- [ ] Edit mode: outline + drag handle + drag-to-reposition + Esc exits

### Tactics Popout
- [ ] Anchored arrow points at the Tactics chip
- [ ] Score ring color tracks score band (green ≥90, ember ≥70, gold <70)
- [ ] Score = `…` and arc hidden when audit is loading
- [ ] Findings rendered with severity color on left border + icon
- [ ] Refia annotation pill (Stab. / Stab? / Stab…) on the right
- [ ] Empty state when zero findings (vibing-emote + Grub-Grub quip)
- [ ] "Open Full Audit" sets `TlfSuiteBus.WantsAuditOnNextDraw = true`
- [ ] Closes on Esc, click-outside, × button, or chip re-click
- [ ] Closes when Navigator opens (peer-surface invariant)

### Suite Navigator
- [ ] Anchored arrow points at the brand chip
- [ ] Width 320px; rows render with icon + name + sub + chevron
- [ ] Disabled rows (PlayerFrame, Party list) render at opacity 0.55, no click
- [ ] Each action wires to its handler (open-tactics / open-tweaks /
       focus-linkshell / open-about)
- [ ] Closes when Tactics popout opens (peer-surface invariant)
- [ ] Closes on Esc / click-outside / brand chip re-click

### About modal
- [ ] Scrim covers the stage
- [ ] Wordmark + neutral paragraph + Cork paragraph
- [ ] Closes on Esc, scrim click, × button

### Tweaks panel
- [ ] All sections present (Theme / Toolbar / Tactics Popout / Edit Mode / Demo)
- [ ] Theme toggle hot-applies (dark/light vellum)
- [ ] Accent picker updates `--fr-accent` + all aliases on the fly
- [ ] Severity-palette picker updates `--sev-*` tokens
- [ ] Toolbar opacity slider hot-applies
- [ ] Edit-mode visual radio picks dashed / solid-glow / tinted
- [ ] Config persists on every change
- [ ] **DO NOT SHIP** the "asset placeholders" toggle — that's a
       design-tool affordance, not user-facing config

---

## §8 — Where to find the canonical values

If you ever need to confirm an exact value during implementation:

| You want…                            | File                                    |
|--------------------------------------|-----------------------------------------|
| The hex/RGBA for a color             | `v01/v01.css` lines 30–80               |
| The widget/popout/nav dimensions     | `v01/v01.css` lines 90–150              |
| The Refia voice strings              | `v01/v01-data.jsx` (TLF_TACTICS_VOICE, TLF_BRAND_VOICE) |
| The demo findings (shape/format)     | `v01/v01-data.jsx` (TLF_AUDIT_SCENARIOS)|
| The accent palette hex values        | `v01/v01-data.jsx` (TLF_ACCENTS)        |
| The toolbar layout (children order)  | `v01/v01-toolbar.jsx` (`<TlfToolbar>`)  |
| The popout structure                 | `v01/v01-popout.jsx`                    |
| The navigator structure              | `v01/v01-navigator.jsx`                 |
| The interaction state machine        | `v01/v01-app.jsx` (Inner component)     |

End of port doc. Cross-reference `README.md` and `context/` for the
why; this doc tells you the how.
