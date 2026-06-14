using Dalamud.Interface.Windowing;
using Dalamud.Bindings.ImGui;
using System.Numerics;

namespace TonberryLiberationFront.Plugin.Windows;

public abstract class HudWidgetWindow : Window
{
    public string Id { get; init; }
    public bool Enabled { get; set; } = true;
    public string ReplacedVanillaAddon { get; set; } = string.Empty;

    protected const ImGuiWindowFlags DefaultWidgetFlags =
        ImGuiWindowFlags.NoTitleBar |
        ImGuiWindowFlags.NoScrollbar |
        ImGuiWindowFlags.NoScrollWithMouse |
        ImGuiWindowFlags.NoBackground |
        ImGuiWindowFlags.NoFocusOnAppearing |
        ImGuiWindowFlags.NoNavFocus;

    protected HudWidgetWindow(string name, string id) : base(name, DefaultWidgetFlags)
    {
        Id = id;
        IsOpen = true;
        DisableWindowSounds = true;
        RespectCloseHotkey = false;
    }

    public override bool DrawConditions()
    {
        if (!Plugin.Config.Enabled || !Enabled) return false;
        if (Plugin.Objects.LocalPlayer is null) return false;
        return true;
    }

    public override void PreDraw()
    {
        Flags = DefaultWidgetFlags;
        if (Plugin.Config.EditMode) Flags &= ~ImGuiWindowFlags.NoBackground;

        PreDrawWidget();
    }

    protected abstract void PreDrawWidget();
    protected abstract void DrawWidget();

    public override void Draw()
    {
        DrawWidget();

        if (Plugin.Config.EditMode)
        {
            var p0 = ImGui.GetWindowPos();
            var p1 = p0 + ImGui.GetWindowSize();
            var dl = ImGui.GetWindowDrawList();

            // Draw dashed outline
            // Simplified to solid outline for now, since dash is manual
            dl.AddRect(p0, p1, ImGui.GetColorU32(Plugin.Config.Accent), 0f, 0, 2f);

            // Draw drag handle (just a filled rect in corner)
            dl.AddRectFilled(p0, p0 + new Vector2(16, 16), ImGui.GetColorU32(Plugin.Config.Accent));
        }
    }
}
