using Dalamud.Bindings.ImGui;
using System;
using System.Collections.Generic;
using System.Numerics;

namespace KhPartyBars;

public sealed class KhRenderer
{
    // Outline thickness for authentic KH style
    private const float OutlineThick = 2.5f;

    public void DrawRoster(List<KhRosterEntry> roster, Action<KhRosterEntry>? onActivate = null, Action<KhRosterEntry>? onContextMenu = null)
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
            if (!Plugin.Config.EditMode)
            {
                ImGui.SetCursorScreenPos(rowPos);
                if (ImGui.InvisibleButton($"##khrow{i}", new Vector2(w, h)))
                    onActivate?.Invoke(roster[i]);
                
                if (ImGui.IsItemHovered(ImGuiHoveredFlags.RectOnly))
                    ImGui.SetMouseCursor(ImGuiMouseCursor.Hand);
                    
                if (ImGui.BeginPopupContextItem($"##khparty_context_{roster[i].EntityId}"))
                {
                    onContextMenu?.Invoke(roster[i]);
                    ImGui.EndPopup();
                }
            }
        }

        if (!Plugin.Config.EditMode) ImGui.Dummy(new Vector2(w, roster.Count * (h + gap)));
    }

    private void DrawRow(Vector2 pos, Vector2 size, KhRosterEntry m)
    {
        var dl    = ImGui.GetWindowDrawList();
        var cfg   = Plugin.Config;

        var portraitR = size.Y * 0.5f;
        var portraitC = new Vector2(pos.X + portraitR, pos.Y + portraitR);
        var midX      = pos.X + portraitR * 2 + 6;
        var midW      = size.X - (portraitR * 2 + 6) - 16; 

        // 1. Target Ring & Portrait
        if (cfg.HighlightTarget && m.EntityId != 0 && m.EntityId == Plugin.Targets.Target?.EntityId)
        {
            var emCol = ImGui.GetColorU32(cfg.Accent);
            dl.AddCircle(portraitC, portraitR + 2.5f, emCol, 32, 3.0f);
        }
        DrawPortrait(dl, portraitC, portraitR, m);

        // Calculate Y positions for the stacked bars
        // Green HP (bottom), Blue MP (middle), Orange Name (top)
        var hpY = pos.Y + 22f;
        var mpY = pos.Y + 12f;
        var nameY = pos.Y;

        var hpRect = new Vector4(midX + 24, hpY, midW - 24, 12f);
        var mpRect = new Vector4(midX + 30, mpY, midW - 30, 10f); // Shift right by 6 to align diagonal slant
        var nameW = MathF.Min(midW - 40, 160f); // name tab width

        // Draw from bottom to top
        DrawHpBar(dl, hpRect, m);
        if (cfg.ShowMpBar) DrawMpBar(dl, mpRect, m);
        if (cfg.ShowNameTab) DrawNameTab(dl, new Vector2(midX, nameY), nameW, m);

        // Curl loop terminator on HP bar's right end
        if (cfg.ShowCurl)
        {
            DrawCurl(dl, new Vector2(hpRect.X + hpRect.Z, hpRect.Y + hpRect.W), m);
        }
    }

    private void DrawPortrait(ImDrawListPtr dl, Vector2 c, float r, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        dl.AddCircleFilled(c, r, ImGui.GetColorU32(new Vector4(0.05f, 0.06f, 0.08f, 1.0f)), 64);
        var ring = m.IsLocal ? cfg.Accent : RoleColor(m.Role);
        dl.AddCircle(c, r - 1f, ImGui.GetColorU32(ring), 64, 2.5f);

        var fontSize = ImGui.GetFontSize() * 0.85f;
        var label    = m.JobAbbr.Length > 3 ? m.JobAbbr[..3] : m.JobAbbr;
        var txtSize  = ImGui.CalcTextSize(label) * 0.85f;
        dl.AddText(ImGui.GetFont(), fontSize, c - txtSize * 0.5f, ImGui.GetColorU32(new Vector4(1, 1, 1, 0.92f)), label);

        if (cfg.ShowLevel)
        {
            var lvlTxt  = $"Lv{m.Level}";
            var lvlFs   = ImGui.GetFontSize() * 0.72f;
            var lvlSize = ImGui.CalcTextSize(lvlTxt) * 0.72f;
            var lvlPos  = new Vector2(c.X - lvlSize.X * 0.5f, c.Y + r - lvlSize.Y - 1f);
            DrawTextWithOutline(dl, lvlTxt, lvlPos, ImGui.GetColorU32(new Vector4(1, 1, 1, 1f)), lvlFs);
        }
    }

    private void DrawHpBar(ImDrawListPtr dl, Vector4 rect, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var bg = ImGui.GetColorU32(new Vector4(0.05f, 0.05f, 0.05f, 1));
        var fillCol = ImGui.GetColorU32(SolidHpColor(m.HpFraction));
        var outline = ImGui.GetColorU32(new Vector4(0, 0, 0, 1));
        
        var frac = MathF.Max(0, MathF.Min(1, m.HpFraction));
        var fillW = rect.Z * frac;

        // Slant size
        float s = 8f;
        float h = rect.W;

        // Main Bar geometry
        Vector2[] mainBg = new Vector2[] {
            new Vector2(rect.X - s, rect.Y + h),
            new Vector2(rect.X, rect.Y),
            new Vector2(rect.X + rect.Z, rect.Y),
            new Vector2(rect.X + rect.Z, rect.Y + h)
        };
        dl.AddConvexPolyFilled(ref mainBg[0], 4, bg);

        if (fillW > 0)
        {
            Vector2[] mainFill = new Vector2[] {
                new Vector2(rect.X - s, rect.Y + h),
                new Vector2(rect.X, rect.Y),
                new Vector2(rect.X + fillW, rect.Y),
                new Vector2(rect.X + fillW - s * (1f - frac), rect.Y + h)
            };
            dl.AddConvexPolyFilled(ref mainFill[0], 4, fillCol);
        }
        
        dl.AddPolyline(ref mainBg[0], 4, outline, ImDrawFlags.Closed, OutlineThick);

        // 3 Slanted Segments on the left
        float segW = 6f;
        float gap = 3f;
        float currX = rect.X - gap;

        for (int i = 0; i < 3; i++)
        {
            Vector2[] seg = new Vector2[] {
                new Vector2(currX - segW - s, rect.Y + h),
                new Vector2(currX - segW, rect.Y),
                new Vector2(currX, rect.Y),
                new Vector2(currX - s, rect.Y + h)
            };
            
            dl.AddConvexPolyFilled(ref seg[0], 4, bg);
            if (frac > 0.1f) // Just fill them if somewhat alive
                dl.AddConvexPolyFilled(ref seg[0], 4, fillCol);
                
            dl.AddPolyline(ref seg[0], 4, outline, ImDrawFlags.Closed, OutlineThick);
            currX -= (segW + gap);
        }

        if (cfg.ShowHpPercent)
        {
            var pctTxt  = $"{(int)MathF.Round(m.HpFraction * 100)}%";
            var pctFs   = ImGui.GetFontSize() * 0.8f;
            var pctSize = ImGui.CalcTextSize(pctTxt) * 0.8f;
            var pctPos  = new Vector2(rect.X + rect.Z - pctSize.X - 4f, rect.Y + (rect.W - pctSize.Y) * 0.5f);
            DrawTextWithOutline(dl, pctTxt, pctPos, ImGui.GetColorU32(new Vector4(1, 1, 1, 1f)), pctFs);
        }
    }

    private void DrawMpBar(ImDrawListPtr dl, Vector4 rect, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var bg = ImGui.GetColorU32(new Vector4(0.05f, 0.05f, 0.05f, 1));
        var mpCol = cfg.ColorMp;
        var fillCol = ImGui.GetColorU32(new Vector4(mpCol.X, mpCol.Y, mpCol.Z, 1.0f));
        var outline = ImGui.GetColorU32(new Vector4(0, 0, 0, 1));
        
        var frac = MathF.Max(0, MathF.Min(1, m.MpFraction));
        var fillW = rect.Z * frac;

        float s = 6f; // slight slant
        float h = rect.W;

        Vector2[] mainBg = new Vector2[] {
            new Vector2(rect.X - s, rect.Y + h),
            new Vector2(rect.X, rect.Y),
            new Vector2(rect.X + rect.Z, rect.Y),
            new Vector2(rect.X + rect.Z, rect.Y + h)
        };
        dl.AddConvexPolyFilled(ref mainBg[0], 4, bg);

        if (fillW > 0)
        {
            Vector2[] mainFill = new Vector2[] {
                new Vector2(rect.X - s, rect.Y + h),
                new Vector2(rect.X, rect.Y),
                new Vector2(rect.X + fillW, rect.Y),
                new Vector2(rect.X + fillW - s * (1f - frac), rect.Y + h)
            };
            dl.AddConvexPolyFilled(ref mainFill[0], 4, fillCol);
        }

        dl.AddPolyline(ref mainBg[0], 4, outline, ImDrawFlags.Closed, OutlineThick);

        // 3 Slanted Segments on the left
        float segW = 5f;
        float gap = 2.5f;
        float currX = rect.X - gap;

        for (int i = 0; i < 3; i++)
        {
            Vector2[] seg = new Vector2[] {
                new Vector2(currX - segW - s, rect.Y + h),
                new Vector2(currX - segW, rect.Y),
                new Vector2(currX, rect.Y),
                new Vector2(currX - s, rect.Y + h)
            };
            dl.AddConvexPolyFilled(ref seg[0], 4, bg);
            if (frac > 0.1f)
                dl.AddConvexPolyFilled(ref seg[0], 4, fillCol);
            dl.AddPolyline(ref seg[0], 4, outline, ImDrawFlags.Closed, OutlineThick);
            currX -= (segW + gap);
        }

        // MP Text
        var txt = "MP";
        var fs = ImGui.GetFontSize() * 0.7f;
        var sz = ImGui.CalcTextSize(txt) * 0.7f;
        var tPos = new Vector2(rect.X + rect.Z - sz.X - 4f, rect.Y + (h - sz.Y)*0.5f);
        DrawTextWithOutline(dl, txt, tPos, ImGui.GetColorU32(new Vector4(1,1,1,1)), fs);
    }

    private void DrawNameTab(ImDrawListPtr dl, Vector2 anchor, float w, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var outline = ImGui.GetColorU32(new Vector4(0, 0, 0, 1));
        var orange = ImGui.GetColorU32(cfg.Accent); // using accent color as the drive bar color
        var blackFill = ImGui.GetColorU32(new Vector4(0.05f, 0.05f, 0.05f, 1));
        
        float h = 14f;
        float stepX = w * 0.6f;
        float stepY = -4f; // goes UP by 4 pixels
        float capW = 16f;

        // Orange part polygon
        Vector2[] poly = new Vector2[] {
            new Vector2(anchor.X, anchor.Y + h),
            new Vector2(anchor.X, anchor.Y),
            new Vector2(anchor.X + stepX, anchor.Y),
            new Vector2(anchor.X + w, anchor.Y + stepY),
            new Vector2(anchor.X + w, anchor.Y + h)
        };

        // Black Cap
        Vector2[] cap = new Vector2[] {
            new Vector2(anchor.X + w, anchor.Y + stepY),
            new Vector2(anchor.X + w + capW, anchor.Y + stepY),
            new Vector2(anchor.X + w + capW - 6f, anchor.Y + h),
            new Vector2(anchor.X + w, anchor.Y + h)
        };

        // Combined Outline
        Vector2[] combined = new Vector2[] {
            new Vector2(anchor.X, anchor.Y + h),
            new Vector2(anchor.X, anchor.Y),
            new Vector2(anchor.X + stepX, anchor.Y),
            new Vector2(anchor.X + w, anchor.Y + stepY),
            new Vector2(anchor.X + w + capW, anchor.Y + stepY),
            new Vector2(anchor.X + w + capW - 6f, anchor.Y + h)
        };

        dl.AddConvexPolyFilled(ref poly[0], 5, orange);
        dl.AddConvexPolyFilled(ref cap[0], 4, blackFill);
        dl.AddPolyline(ref combined[0], 6, outline, ImDrawFlags.Closed, OutlineThick);

        // Text: Name on left, Job on right
        var nameTxt = m.Name;
        var jobTxt = m.JobAbbr;
        
        DrawTextWithOutline(dl, nameTxt, anchor + new Vector2(4, 0), ImGui.GetColorU32(new Vector4(1,1,1,1)), ImGui.GetFontSize() * 0.85f);
        
        var jobSz = ImGui.CalcTextSize(jobTxt) * 0.7f;
        DrawTextWithOutline(dl, jobTxt, new Vector2(anchor.X + stepX - jobSz.X - 4, anchor.Y + 1), ImGui.GetColorU32(new Vector4(1,1,1,1)), ImGui.GetFontSize() * 0.7f);
    }

    private void DrawCurl(ImDrawListPtr dl, Vector2 anchor, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var color = cfg.CurlMatchesHp ? SolidHpColor(m.HpFraction) : cfg.Accent;
        var u32   = ImGui.GetColorU32(color);
        var outline = ImGui.GetColorU32(new Vector4(0, 0, 0, 1));

        float radius = 16f;
        float thickness = 10f; // thick loop
        
        // anchor is at the BOTTOM RIGHT of the HP bar.
        // Shift left by 8px so the thick outline overlaps instead of causing a gap
        var center = anchor + new Vector2(radius - 8f, -radius);
        
        // First draw outline (thicker)
        dl.PathArcTo(center, radius, 1.57f, 1.57f + 4.71f, 40); // from bottom (pi/2) to almost full loop
        dl.PathStroke(outline, ImDrawFlags.None, thickness + OutlineThick * 2);

        // Then draw inner fill
        dl.PathArcTo(center, radius, 1.57f, 1.57f + 4.71f, 40);
        dl.PathStroke(u32, ImDrawFlags.None, thickness);
        
        // Black connection piece from top of the loop down to the Drive bar cap
        // The drive bar cap is slightly above and to the left
        // We'll just drop a tiny vertical line
        var topOfLoop = center + new Vector2(0, -radius);
        dl.AddLine(topOfLoop, topOfLoop + new Vector2(0, 8), outline, OutlineThick + 1f);
    }

    private void DrawTextWithOutline(ImDrawListPtr dl, string text, Vector2 pos, uint color, float fontSize)
    {
        var outlineCol = ImGui.GetColorU32(new Vector4(0, 0, 0, 1));
        var font = ImGui.GetFont();
        // standard 4-way stroke
        dl.AddText(font, fontSize, pos + new Vector2(-1, 0), outlineCol, text);
        dl.AddText(font, fontSize, pos + new Vector2(1, 0), outlineCol, text);
        dl.AddText(font, fontSize, pos + new Vector2(0, -1), outlineCol, text);
        dl.AddText(font, fontSize, pos + new Vector2(0, 1), outlineCol, text);
        dl.AddText(font, fontSize, pos, color, text);
    }

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

    private Vector4 SolidHpColor(float frac)
    {
        var cfg = Plugin.Config;
        if (frac > cfg.HpYellowAt)      return cfg.ColorHpGreen;
        else if (frac > cfg.HpRedAt)    return cfg.ColorHpYellow;
        else                            return cfg.ColorHpRed;
    }
}
