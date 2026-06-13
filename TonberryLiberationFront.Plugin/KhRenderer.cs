using Dalamud.Bindings.ImGui;
using System;
using System.Collections.Generic;
using System.Numerics;

namespace TonberryLiberationFront.Plugin;

public sealed class KhRenderer
{
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
                
                // Lay an interactive hit-box over the row that captures BOTH clicks
                ImGui.InvisibleButton($"##khrow{i}", new Vector2(w, h), ImGuiButtonFlags.MouseButtonLeft | ImGuiButtonFlags.MouseButtonRight);
                
                if (ImGui.IsItemClicked(ImGuiMouseButton.Left))
                    onActivate?.Invoke(roster[i]);
                
                if (ImGui.IsItemHovered(ImGuiHoveredFlags.RectOnly))
                    ImGui.SetMouseCursor(ImGuiMouseCursor.Hand);
                    
                if (onContextMenu != null)
                {
                    if (ImGui.BeginPopupContextItem($"##khparty_context_{roster[i].EntityId}"))
                    {
                        onContextMenu.Invoke(roster[i]);
                        ImGui.EndPopup();
                    }
                }
            }
        }

        if (!Plugin.Config.EditMode) ImGui.Dummy(new Vector2(w, roster.Count * (h + gap)));
    }

    private void DrawRow(Vector2 pos, Vector2 size, KhRosterEntry m)
    {
        var dl    = ImGui.GetWindowDrawList();
        var cfg   = Plugin.Config;

        var portraitR = size.Y * 0.45f;
        var portraitC = new Vector2(pos.X + portraitR + 4f, pos.Y + size.Y * 0.5f);
        var r_inner = portraitR; // Ring touches portrait
        var hpThickness = 12f;
        
        var hpY = portraitC.Y + r_inner;
        var mpY = hpY - 12f;

        // HP Bar starts exactly at portrait center. Left half hidden by portrait.
        var barStartX = portraitC.X;
        
        // Ensure width is always strictly positive
        var availableW = size.X - (portraitC.X - pos.X);
        var hpWidth = MathF.Max(20f, availableW - 32f); 

        // Bars
        var hpRect = new Vector4(barStartX, hpY, hpWidth, hpThickness);
        var mpStartX = portraitC.X + r_inner * 0.8f; 
        var mpRect = new Vector4(mpStartX, mpY, MathF.Max(10f, hpWidth - (mpStartX - barStartX) + 8f), 10f);

        // 1. Draw Bars First (they go behind the portrait)
        DrawHpBar(dl, hpRect, portraitC, r_inner, m);
        if (cfg.ShowMpBar) DrawMpBar(dl, mpRect, m);

        // 2. Draw Portrait (goes on top, hiding the bar origins and seams)
        if (cfg.HighlightTarget && m.EntityId != 0 && m.EntityId == Plugin.Targets.Target?.EntityId)
        {
            var emCol = ImGui.GetColorU32(cfg.Accent);
            dl.AddCircle(portraitC, portraitR + 3.0f, emCol, 32, 4.0f);
        }
        DrawPortrait(dl, portraitC, portraitR, m);

        // 3. Name Text above bars
        var nameTxt = m.Name;
        var nameY = mpY - 16f;
        DrawTextWithOutline(dl, nameTxt, new Vector2(portraitC.X + portraitR + 4f, nameY), ImGui.GetColorU32(new Vector4(1,1,1,1)), ImGui.GetFontSize() * 0.9f);
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

    private void DrawHpBar(ImDrawListPtr dl, Vector4 rect, Vector2 portraitC, float r_inner, KhRosterEntry m)
    {
        var cfg = Plugin.Config;
        var bg = ImGui.GetColorU32(new Vector4(0.05f, 0.05f, 0.05f, 1));
        var fillCol = ImGui.GetColorU32(SolidHpColor(m.HpFraction));
        var outline = ImGui.GetColorU32(new Vector4(0, 0, 0, 1));
        
        var frac = MathF.Max(0, MathF.Min(1, m.HpFraction));
        var fillW = rect.Z * frac;

        float s = 8f;
        float h = rect.W;
        float r_center = r_inner + h / 2f;

        // 1. Solid Black Outlines (Ring + Bar)
        dl.PathArcTo(portraitC, r_center, MathF.PI / 2f, 3f * MathF.PI / 2f, 40);
        dl.PathStroke(outline, ImDrawFlags.None, h + OutlineThick * 2);

        Vector2[] hpBgOutline = new Vector2[] {
            new Vector2(rect.X, rect.Y - OutlineThick),
            new Vector2(rect.X + rect.Z - s + OutlineThick, rect.Y - OutlineThick),
            new Vector2(rect.X + rect.Z + OutlineThick, rect.Y + h + OutlineThick),
            new Vector2(rect.X, rect.Y + h + OutlineThick)
        };
        dl.AddConvexPolyFilled(ref hpBgOutline[0], 4, outline);

        // 2. Dark Grey Background (Bar only)
        Vector2[] mainBg = new Vector2[] {
            new Vector2(rect.X, rect.Y),
            new Vector2(rect.X + rect.Z - s, rect.Y),
            new Vector2(rect.X + rect.Z, rect.Y + h),
            new Vector2(rect.X, rect.Y + h)
        };
        dl.AddConvexPolyFilled(ref mainBg[0], 4, bg);

        // 3. Green Fills (Ring + Bar)
        dl.PathArcTo(portraitC, r_center, MathF.PI / 2f, 3f * MathF.PI / 2f, 40);
        dl.PathStroke(fillCol, ImDrawFlags.None, h);

        if (fillW > 0)
        {
            float fillS = s * frac;
            Vector2[] mainFill = new Vector2[] {
                new Vector2(rect.X, rect.Y),
                new Vector2(rect.X + fillW - fillS, rect.Y),
                new Vector2(rect.X + fillW, rect.Y + h),
                new Vector2(rect.X, rect.Y + h)
            };
            dl.AddConvexPolyFilled(ref mainFill[0], 4, fillCol);
        }

        // Shield Segments on the right
        float segW = 6f;
        float gap = 8f; // Increased gap to prevent 2.5f outlines from merging
        float currX = rect.X + rect.Z + gap;
        var shieldGold = ImGui.GetColorU32(new Vector4(1.0f, 0.84f, 0.0f, 1.0f));

        int filledSegments = 0;
        if (m.ShieldPercentage > 20) filledSegments = 3;
        else if (m.ShieldPercentage > 10) filledSegments = 2;
        else if (m.ShieldPercentage > 0) filledSegments = 1;

        for (int i = 0; i < 3; i++)
        {
            Vector2[] seg = new Vector2[] {
                new Vector2(currX, rect.Y + h),
                new Vector2(currX - s, rect.Y),
                new Vector2(currX + segW - s, rect.Y),
                new Vector2(currX + segW, rect.Y + h)
            };
            
            dl.AddConvexPolyFilled(ref seg[0], 4, bg);
            if (i < filledSegments)
                dl.AddConvexPolyFilled(ref seg[0], 4, shieldGold);
                
            dl.AddPolyline(ref seg[0], 4, outline, ImDrawFlags.Closed, OutlineThick);
            currX += (segW + gap);
        }

        if (cfg.ShowHpPercent)
        {
            var pctTxt  = $"{(int)MathF.Round(m.HpFraction * 100)}%";
            var pctFs   = ImGui.GetFontSize() * 0.8f;
            var pctSize = ImGui.CalcTextSize(pctTxt) * 0.8f;
            var pctPos  = new Vector2(currX + 4f, rect.Y + (rect.W - pctSize.Y) * 0.5f);
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

        float s = 6.6f; 
        float h = rect.W;

        Vector2[] mainBg = new Vector2[] {
            new Vector2(rect.X, rect.Y + h),
            new Vector2(rect.X, rect.Y),
            new Vector2(rect.X + rect.Z - s, rect.Y),
            new Vector2(rect.X + rect.Z, rect.Y + h)
        };
        dl.AddConvexPolyFilled(ref mainBg[0], 4, bg);

        if (fillW > 0)
        {
            float fillS = s * frac;
            Vector2[] mainFill = new Vector2[] {
                new Vector2(rect.X, rect.Y + h),
                new Vector2(rect.X, rect.Y),
                new Vector2(rect.X + fillW - fillS, rect.Y),
                new Vector2(rect.X + fillW, rect.Y + h)
            };
            dl.AddConvexPolyFilled(ref mainFill[0], 4, fillCol);
        }

        dl.AddPolyline(ref mainBg[0], 4, outline, ImDrawFlags.Closed, OutlineThick);

        // MP Text
        var txt = "MP";
        var fs = ImGui.GetFontSize() * 0.7f;
        var sz = ImGui.CalcTextSize(txt) * 0.7f;
        var tPos = new Vector2(rect.X + rect.Z - sz.X - 10f, rect.Y + (h - sz.Y)*0.5f);
        DrawTextWithOutline(dl, txt, tPos, ImGui.GetColorU32(new Vector4(1,1,1,1)), fs);
    }



    private void DrawTextWithOutline(ImDrawListPtr dl, string text, Vector2 pos, uint color, float fontSize)
    {
        var outlineCol = ImGui.GetColorU32(new Vector4(0, 0, 0, 1));
        var font = ImGui.GetFont();
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

