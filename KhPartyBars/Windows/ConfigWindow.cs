using Dalamud.Interface.Windowing;
using Dalamud.Bindings.ImGui;
using System.Numerics;

namespace KhPartyBars.Windows;

public class ConfigWindow : Window
{
    public ConfigWindow() : base("KH Party Bars - Settings", ImGuiWindowFlags.AlwaysAutoResize)
    {
        IsOpen = false;
        Size = new Vector2(420, 0);
    }

    public override void Draw()
    {
        var cfg = Plugin.Config;
        bool dirty = false;

        bool enabled = cfg.Enabled;
        if (ImGui.Checkbox("Enabled##master", ref enabled)) { cfg.Enabled = enabled; dirty = true; }
        ImGui.SameLine();
        if (ImGui.Button("Reset to defaults"))
        {
            var fresh = new Configuration();
            cfg.Accent    = fresh.Accent;
            cfg.RowWidth  = fresh.RowWidth;
            cfg.RowHeight = fresh.RowHeight;
            cfg.RowGap    = fresh.RowGap;
            cfg.UiScale   = fresh.UiScale;
            dirty = true;
        }

        ImGui.Separator();

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
            bool edit = cfg.EditMode;
            if (ImGui.Checkbox("Move bars (drag to position)", ref edit)) { cfg.EditMode = edit; dirty = true; }
            if (cfg.EditMode)
                ImGui.TextDisabled("Drag each bar to move it. Uncheck when done.");
            ImGui.Spacing();
            int px = (int)cfg.Position.X;
            if (ImGui.InputInt("Party bar X", ref px)) { cfg.Position = new Vector2(px, cfg.Position.Y); WindowManager.ForceReposition = 2; dirty = true; }
            int py = (int)cfg.Position.Y;
            if (ImGui.InputInt("Party bar Y", ref py)) { cfg.Position = new Vector2(cfg.Position.X, py); WindowManager.ForceReposition = 2; dirty = true; }
            int lx = (int)cfg.PlayerBarPosition.X;
            if (ImGui.InputInt("Player bar X", ref lx)) { cfg.PlayerBarPosition = new Vector2(lx, cfg.PlayerBarPosition.Y); WindowManager.ForceReposition = 2; dirty = true; }
            int ly = (int)cfg.PlayerBarPosition.Y;
            if (ImGui.InputInt("Player bar Y", ref ly)) { cfg.PlayerBarPosition = new Vector2(cfg.PlayerBarPosition.X, ly); WindowManager.ForceReposition = 2; dirty = true; }
            if (ImGui.Button("Bring bars on-screen")) { cfg.Position = new Vector2(80, 240); cfg.PlayerBarPosition = new Vector2(200, 320); WindowManager.ForceReposition = 2; dirty = true; }
        }

        if (ImGui.CollapsingHeader("Style", ImGuiTreeNodeFlags.DefaultOpen))
        {
            var accent = cfg.Accent;
            if (ImGui.ColorEdit4("Accent (ember)", ref accent, ImGuiColorEditFlags.NoInputs)) { cfg.Accent = accent; dirty = true; }
            var mp = cfg.ColorMp;
            if (ImGui.ColorEdit4("MP bar", ref mp, ImGuiColorEditFlags.NoInputs)) { cfg.ColorMp = mp; dirty = true; }
            var hpG = cfg.ColorHpGreen;
            if (ImGui.ColorEdit4("HP - high", ref hpG, ImGuiColorEditFlags.NoInputs)) { cfg.ColorHpGreen = hpG; dirty = true; }
            var hpY = cfg.ColorHpYellow;
            if (ImGui.ColorEdit4("HP - mid",  ref hpY, ImGuiColorEditFlags.NoInputs)) { cfg.ColorHpYellow = hpY; dirty = true; }
            var hpR = cfg.ColorHpRed;
            if (ImGui.ColorEdit4("HP - low",  ref hpR, ImGuiColorEditFlags.NoInputs)) { cfg.ColorHpRed = hpR; dirty = true; }

            var rT = cfg.ColorRoleTank;
            if (ImGui.ColorEdit4("Role: tank",   ref rT, ImGuiColorEditFlags.NoInputs)) { cfg.ColorRoleTank   = rT; dirty = true; }
            var rH = cfg.ColorRoleHealer;
            if (ImGui.ColorEdit4("Role: healer", ref rH, ImGuiColorEditFlags.NoInputs)) { cfg.ColorRoleHealer = rH; dirty = true; }
            var rD = cfg.ColorRoleDps;
            if (ImGui.ColorEdit4("Role: dps",    ref rD, ImGuiColorEditFlags.NoInputs)) { cfg.ColorRoleDps    = rD; dirty = true; }
        }

        if (ImGui.CollapsingHeader("HP thresholds"))
        {
            float y = cfg.HpYellowAt, r = cfg.HpRedAt;
            if (ImGui.SliderFloat("Yellow at", ref y, 0.30f, 0.95f, "%.2f")) { cfg.HpYellowAt = y; dirty = true; }
            if (ImGui.SliderFloat("Red at",    ref r, 0.05f, 0.45f, "%.2f")) { cfg.HpRedAt    = r; dirty = true; }
        }

        if (ImGui.CollapsingHeader("Toggles", ImGuiTreeNodeFlags.DefaultOpen))
        {
            bool v0 = cfg.ShowMpBar;       if (ImGui.Checkbox("Show MP bar", ref v0)) { cfg.ShowMpBar = v0; dirty = true; }
            bool v2 = cfg.ShowLevel;       if (ImGui.Checkbox("Show level", ref v2)) { cfg.ShowLevel = v2; dirty = true; }
            bool v3 = cfg.ShowHpPercent;   if (ImGui.Checkbox("Show HP %", ref v3)) { cfg.ShowHpPercent = v3; dirty = true; }
            bool v7 = cfg.HighlightTarget; if (ImGui.Checkbox("Highlight target", ref v7)) { cfg.HighlightTarget = v7; dirty = true; }
        }

        if (dirty) cfg.Save();
    }

    public new void Toggle() => IsOpen = !IsOpen;
}