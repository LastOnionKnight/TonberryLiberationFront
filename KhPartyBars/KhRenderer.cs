using Dalamud.Bindings.ImGui;
using System;
using System.Collections.Generic;
using System.Numerics;

namespace KhPartyBars;

/// <summary>
/// All the bar-drawing logic. Pure ImGui draw-list calls â€” no SVG, no
/// images for the chrome (so it scales with UiScale crisply). Layout
/// mirrors the HTML/CSS design from the web mockup:
/// [portrait]  [wing-name-tab + hp/mp bars + curl loop]  [lvl + hp%]
/// </summary>
public sealed class KhRenderer
{
    public void DrawRoster(List<KhRosterEntry> roster)
    {
        var cfg   = Plugin.Config;
        var scale = cfg.UiScale;
        var w     = cfg.RowWidth * scale;
        var h     = cfg.RowHeight * scale;
        var gap   = cfg.RowGap * scale;

        var origin = ImGui.GetCursorScreenPos() + new Vector2(4, 4);
        for (int i = 0; i < roster.Count; i++)
        {
            var rowPos = origin + new Vector2(0, i * (h + gap));
            DrawRow(rowPos, new Vector2(w, h), roster[i]);
        }

        // Reserve invisible space so the window auto-sizes correctly.
        ImGui.Dummy(new Vector2(w, roster.Count * (h + gap)));
    }

    private void DrawRow(Vector2 pos, Vector2 size, KhRosterEntry m)
    {
        var dl    = ImGui.GetWindowDrawList();
        var cfg   = Plugin.Config;

        var portraitR = size.Y * 0.5f;
        var portraitC = new Vector2(pos.X + portraitR, pos.Y + portraitR);
        var midX      = pos.X + portraitR * 2 + 6;
        var midW      = size.X - (portraitR * 2 + 6) - 64; // 64px end column
        var midRect   = new Vector4(midX, pos.Y, midW, size.Y);

        // â”€â”€ Portrait â”€â”€
        DrawPortrait(dl, portraitC, portraitR, m);

        // â”€â”€ Wing name tab (top of mid column) â”€â”€
        if (cfg.ShowNameTab)
            DrawNameTab(dl, new Vector2(midX, pos.Y + 4), midW, m);

        // â”€â”€ HP / MP bar stack â”€â”€
        var barTop    = pos.Y + (cfg.ShowNameTab ? 18f : 4f);
        var hpRect    = new Vector4(midX, barTop, midW - 22, 12f);
        var mpRect    = new Vector4(midX, barTop + 13f, midW - 22, 5f);

        DrawHpBar(dl, hpRect, m);
        if (cfg.ShowMpBar) DrawMpBar(dl, mpRect, m);

        // â”€â”€ Curl loop terminator on HP bar's right end â”€â”€
        if (cfg.ShowCurl)
            DrawCurl(dl, new Vector2(hpRect.X + hpRect.Z, hpRect.Y + hpRect.W * 0.5f), m);

        // â”€â”€ Level + HP% on the right â”€â”€
        DrawEndColumn(dl, new Vector2(pos.X + size.X - 60, pos.Y), 60, size.Y, m);

        // â”€â”€ Target ring around portrait if highlighted â”€â”€
        if (cfg.HighlightTarget && m.IsTarget)
        {
            var emCol = ImGui.GetColorU32(cfg.Accent);
            dl.AddCircle(portraitC, portraitR + 2.5f, emCol, 32, 2.5f);
        }
    }

    private void DrawPortrait(ImDrawListPtr dl, Vector2 c, float r, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        // background disc
        dl.AddCircleFilled(c, r, ImGui.GetColorU32(new Vector4(0.05f, 0.06f, 0.08f, 1.0f)), 64);

        // role / you ring
        var ring = m.IsLocal ? cfg.Accent : RoleColor(m.Role);
        var ringCol = ImGui.GetColorU32(ring);
        dl.AddCircle(c, r - 1f, ringCol, 64, 2.5f);

        // job abbreviation (placeholder for an actual job-icon texture)
        var fontSize = ImGui.GetFontSize() * 0.85f;
        var label    = m.JobAbbr.Length > 3 ? m.JobAbbr[..3] : m.JobAbbr;
        var txtSize  = ImGui.CalcTextSize(label) * 0.85f;
        var txtPos   = c - txtSize * 0.5f;
        dl.AddText(ImGui.GetFont(), fontSize, txtPos, ImGui.GetColorU32(new Vector4(1, 1, 1, 0.92f)), label);
    }

    private void DrawNameTab(ImDrawListPtr dl, Vector2 anchor, float maxW, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var text = cfg.ShowJobInTab ? $"{m.Name} Â· {m.JobAbbr}" : m.Name;
        var pad  = new Vector2(6, 1.5f);
        var txtSize = ImGui.CalcTextSize(text) * 0.85f;
        var tabW    = MathF.Min(maxW, txtSize.X + pad.X * 2 + 10);
        var tabH    = txtSize.Y + pad.Y * 2;

        // angled wing shape â€” polygon points: (0,0) â†’ (tabW-10,0) â†’ (tabW, tabH) â†’ (0, tabH)
        Span<Vector2> poly = stackalloc Vector2[4];
        poly[0] = anchor;
        poly[1] = new Vector2(anchor.X + tabW - 10, anchor.Y);
        poly[2] = new Vector2(anchor.X + tabW,      anchor.Y + tabH);
        poly[3] = new Vector2(anchor.X,             anchor.Y + tabH);

        // fill + top border
        var fill   = ImGui.GetColorU32(new Vector4(0, 0, 0, 0.78f));
        var top    = ImGui.GetColorU32(cfg.Accent);
        var polyArr = new Vector2[] { poly[0], poly[1], poly[2], poly[3] };
        dl.AddConvexPolyFilled(ref polyArr[0], polyArr.Length, fill);
        dl.AddLine(poly[0], poly[1], top, 1.5f);

        dl.AddText(ImGui.GetFont(), ImGui.GetFontSize() * 0.85f,
            anchor + new Vector2(pad.X, pad.Y),
            ImGui.GetColorU32(new Vector4(0.92f, 0.94f, 0.96f, 1)), text);
    }

    private void DrawHpBar(ImDrawListPtr dl, Vector4 rect, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var origin = new Vector2(rect.X, rect.Y);
        var ext    = new Vector2(rect.Z, rect.W);

        // background
        var bg = ImGui.GetColorU32(new Vector4(0.02f, 0.03f, 0.06f, 1));
        dl.AddRectFilled(origin, origin + ext, bg);
        // outline
        var oc = ImGui.GetColorU32(cfg.ColorBorder);
        dl.AddRect(origin, origin + ext, oc);

        // fill
        var frac = MathF.Max(0, MathF.Min(1, m.HpFraction));
        var fillW = ext.X * frac;
        var (top, bot) = HpGradient(frac);
        var topCol = ImGui.GetColorU32(top);
        var botCol = ImGui.GetColorU32(bot);
        dl.AddRectFilledMultiColor(origin, origin + new Vector2(fillW, ext.Y), topCol, topCol, botCol, botCol);

        // inner highlight strip
        var hi = ImGui.GetColorU32(new Vector4(1f, 1f, 1f, 0.35f));
        if (fillW > 0)
            dl.AddLine(origin + new Vector2(0, 0.5f), origin + new Vector2(fillW, 0.5f), hi, 1f);

        // shimmer band
        if (cfg.ShimmerHpBar && fillW > 4)
        {
            var t  = ((float)(ImGui.GetTime() * 0.3f) % 1f);
            var bx = origin.X + (t * (fillW + 30) - 30);
            var bw = 20f;
            if (bx + bw > origin.X && bx < origin.X + fillW)
            {
                var shimmer = ImGui.GetColorU32(new Vector4(1, 1, 1, 0.25f));
                dl.AddRectFilled(
                    new Vector2(MathF.Max(bx, origin.X), origin.Y + 1),
                    new Vector2(MathF.Min(bx + bw, origin.X + fillW), origin.Y + ext.Y - 1),
                    shimmer);
            }
        }
    }

    private void DrawMpBar(ImDrawListPtr dl, Vector4 rect, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var origin = new Vector2(rect.X, rect.Y);
        var ext    = new Vector2(rect.Z, rect.W);
        var bg = ImGui.GetColorU32(new Vector4(0.02f, 0.03f, 0.06f, 1));
        dl.AddRectFilled(origin, origin + ext, bg);
        dl.AddRect(origin, origin + ext, ImGui.GetColorU32(cfg.ColorBorder));

        var frac = MathF.Max(0, MathF.Min(1, m.MpFraction));
        var fillW = ext.X * frac;
        var mp = cfg.ColorMp;
        var top = ImGui.GetColorU32(new Vector4(mp.X * 1.4f, mp.Y * 1.4f, mp.Z * 1.4f, mp.W));
        var bot = ImGui.GetColorU32(new Vector4(mp.X * 0.5f, mp.Y * 0.5f, mp.Z * 0.5f, mp.W));
        dl.AddRectFilledMultiColor(origin, origin + new Vector2(fillW, ext.Y), top, top, bot, bot);
    }

    /// <summary>
    /// KH curl-loop: a thick arc that springs up off the right end of the
    /// HP bar and loops back on itself. Drawn as a PathArcTo + PathStroke.
    /// </summary>
    private void DrawCurl(ImDrawListPtr dl, Vector2 anchor, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var color = cfg.CurlMatchesHp ? HpGradient(m.HpFraction).top : cfg.Accent;
        var u32   = ImGui.GetColorU32(color);

        // entry stub (horizontal)
        dl.AddLine(anchor, anchor + new Vector2(6, 0), u32, 3f);

        // big loop (radius 6) anchored above the bar
        var center = anchor + new Vector2(8, -6);
        dl.PathArcTo(center, 6f, 0.4f, 6.28f, 24);
        dl.PathStroke(u32, ImDrawFlags.None, 3f);

        // small inner curl (radius 3) to taste
        var innerCenter = center + new Vector2(0, 1);
        dl.PathArcTo(innerCenter, 3f, 0f, 4.7f, 16);
        dl.PathStroke(u32, ImDrawFlags.None, 2.5f);
    }

    private void DrawEndColumn(ImDrawListPtr dl, Vector2 origin, float w, float h, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var font = ImGui.GetFont();

        if (cfg.ShowLevel)
        {
            var lvl = $"Lv{m.Level}";
            var size = ImGui.CalcTextSize(lvl) * 0.95f;
            var pos = origin + new Vector2(w - size.X - 2, 4);
            dl.AddText(font, ImGui.GetFontSize() * 0.95f, pos, ImGui.GetColorU32(cfg.Accent), lvl);
        }
        if (cfg.ShowHpPercent)
        {
            var pct = $"{(int)MathF.Round(m.HpFraction * 100)}%";
            var size = ImGui.CalcTextSize(pct) * 0.85f;
            var pos  = origin + new Vector2(w - size.X - 2, h - size.Y - 2);
            dl.AddText(font, ImGui.GetFontSize() * 0.85f, pos,
                ImGui.GetColorU32(new Vector4(0.7f, 0.78f, 0.86f, 1f)), pct);
        }
    }

    // â”€â”€ Color helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private Vector4 RoleColor(KhRole role)
    {
        var cfg = Plugin.Config;
        return role switch
        {
            KhRole.Tank   => cfg.ColorRoleTank,
            KhRole.Healer => cfg.ColorRoleHealer,
            KhRole.Dps    => cfg.ColorRoleDps,
            _             => cfg.Accent,
        };
    }

    private (Vector4 top, Vector4 bot) HpGradient(float frac)
    {
        var cfg = Plugin.Config;
        Vector4 baseCol;
        if (frac > cfg.HpYellowAt)      baseCol = cfg.ColorHpGreen;
        else if (frac > cfg.HpRedAt)    baseCol = cfg.ColorHpYellow;
        else                            baseCol = cfg.ColorHpRed;

        var top = new Vector4(MathF.Min(1, baseCol.X * 1.3f), MathF.Min(1, baseCol.Y * 1.3f), MathF.Min(1, baseCol.Z * 1.3f), baseCol.W);
        var bot = new Vector4(baseCol.X * 0.45f, baseCol.Y * 0.45f, baseCol.Z * 0.45f, baseCol.W);
        return (top, bot);
    }
}
