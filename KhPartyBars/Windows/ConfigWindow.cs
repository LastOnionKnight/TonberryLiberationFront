using Dalamud.Interface.Windowing;
using ImGuiNET;
using System.Numerics;

namespace KhPartyBars.Windows;

public class ConfigWindow : Window
{
    public ConfigWindow() : base("KH Party Bars · Settings", ImGuiWindowFlags.AlwaysAutoResize)
    {
        IsOpen = false;
        Size = new Vector2(420, 0);
    }

    public override void Draw()
    {
        var cfg = Plugin.Config;
        bool dirty = false;

        // ── Master ──
        dirty |= ImGui.Checkbox("Enabled##master", ref Refify(ref cfg.Enabled, out var enabled)); cfg.Enabled = enabled;
        ImGui.SameLine();
        if (ImGui.Button("Reset to defaults"))
        {
            // Pretty heavy-handed; replace with a confirmation popup later.
            var fresh = new Configuration();
            cfg.Accent      = fresh.Accent;
            cfg.RowWidth    = fresh.RowWidth;
            cfg.RowHeight   = fresh.RowHeight;
            cfg.RowGap      = fresh.RowGap;
            cfg.UiScale     = fresh.UiScale;
            dirty = true;
        }

        ImGui.Separator();

        // ── Layout ──
        if (ImGui.CollapsingHeader("Layout", ImGuiTreeNodeFlags.DefaultOpen))
        {
            int w = cfg.RowWidth, h = cfg.RowHeight, g = cfg.RowGap;
            if (ImGui.SliderInt("Row width",  ref w, 200, 600)) { cfg.RowWidth = w;  dirty = true; }
            if (ImGui.SliderInt("Row height", ref h, 28,  80))  { cfg.RowHeight = h; dirty = true; }
            if (ImGui.SliderInt("Row gap",    ref g, 0,   24))  { cfg.RowGap = g;    dirty = true; }
            float s = cfg.UiScale;
            if (ImGui.SliderFloat("UI scale", ref s, 0.6f, 2.0f, "%.2fx")) { cfg.UiScale = s; dirty = true; }

            bool lockPos = cfg.LockPosition;
            if (ImGui.Checkbox("Lock position", ref lockPos)) { cfg.LockPosition = lockPos; dirty = true; }
        }

        // ── Style ──
        if (ImGui.CollapsingHeader("Style", ImGuiTreeNodeFlags.DefaultOpen))
        {
            var accent = cfg.Accent;
            if (ImGui.ColorEdit4("Accent (ember)", ref accent, ImGuiColorEditFlags.NoInputs)) { cfg.Accent = accent; dirty = true; }
            var mp = cfg.ColorMp;
            if (ImGui.ColorEdit4("MP bar", ref mp, ImGuiColorEditFlags.NoInputs)) { cfg.ColorMp = mp; dirty = true; }
            var hpG = cfg.ColorHpGreen;
            if (ImGui.ColorEdit4("HP — high", ref hpG, ImGuiColorEditFlags.NoInputs)) { cfg.ColorHpGreen = hpG; dirty = true; }
            var hpY = cfg.ColorHpYellow;
            if (ImGui.ColorEdit4("HP — mid",  ref hpY, ImGuiColorEditFlags.NoInputs)) { cfg.ColorHpYellow = hpY; dirty = true; }
            var hpR = cfg.ColorHpRed;
            if (ImGui.ColorEdit4("HP — low",  ref hpR, ImGuiColorEditFlags.NoInputs)) { cfg.ColorHpRed = hpR; dirty = true; }

            var rT = cfg.ColorRoleTank;
            if (ImGui.ColorEdit4("Role: tank",   ref rT, ImGuiColorEditFlags.NoInputs)) { cfg.ColorRoleTank   = rT; dirty = true; }
            var rH = cfg.ColorRoleHealer;
            if (ImGui.ColorEdit4("Role: healer", ref rH, ImGuiColorEditFlags.NoInputs)) { cfg.ColorRoleHealer = rH; dirty = true; }
            var rD = cfg.ColorRoleDps;
            if (ImGui.ColorEdit4("Role: dps",    ref rD, ImGuiColorEditFlags.NoInputs)) { cfg.ColorRoleDps    = rD; dirty = true; }
        }

        // ── HP thresholds ──
        if (ImGui.CollapsingHeader("HP thresholds"))
        {
            float y = cfg.HpYellowAt, r = cfg.HpRedAt;
            if (ImGui.SliderFloat("Yellow at", ref y, 0.30f, 0.95f, "%.2f")) { cfg.HpYellowAt = y; dirty = true; }
            if (ImGui.SliderFloat("Red at",    ref r, 0.05f, 0.45f, "%.2f")) { cfg.HpRedAt    = r; dirty = true; }
        }

        // ── Toggles ──
        if (ImGui.CollapsingHeader("Toggles", ImGuiTreeNodeFlags.DefaultOpen))
        {
            dirty |= ImGui.Checkbox("Show MP bar",         ref Refify(ref cfg.ShowMpBar,    out var v0)); cfg.ShowMpBar = v0;
            dirty |= ImGui.Checkbox("Show curl loop",      ref Refify(ref cfg.ShowCurl,     out var v1)); cfg.ShowCurl = v1;
            dirty |= ImGui.Checkbox("Show level",          ref Refify(ref cfg.ShowLevel,    out var v2)); cfg.ShowLevel = v2;
            dirty |= ImGui.Checkbox("Show HP %",           ref Refify(ref cfg.ShowHpPercent,out var v3)); cfg.ShowHpPercent = v3;
            dirty |= ImGui.Checkbox("Show job in name tab",ref Refify(ref cfg.ShowJobInTab, out var v4)); cfg.ShowJobInTab = v4;
            dirty |= ImGui.Checkbox("Show name tab",       ref Refify(ref cfg.ShowNameTab,  out var v5)); cfg.ShowNameTab = v5;
            dirty |= ImGui.Checkbox("Animate HP shimmer",  ref Refify(ref cfg.ShimmerHpBar, out var v6)); cfg.ShimmerHpBar = v6;
            dirty |= ImGui.Checkbox("Highlight target",    ref Refify(ref cfg.HighlightTarget, out var v7)); cfg.HighlightTarget = v7;
            dirty |= ImGui.Checkbox("Curl color matches HP", ref Refify(ref cfg.CurlMatchesHp, out var v8)); cfg.CurlMatchesHp = v8;
        }

        if (dirty) cfg.Save();
    }

    public void Toggle() => IsOpen = !IsOpen;

    // ImGui.Checkbox wants `ref bool`; our config fields are property-backed.
    // Refify gives us a temp ref slot we can write back from.
    private static ref bool Refify(ref bool field, out bool tmp) { tmp = field; return ref tmp; }
}
