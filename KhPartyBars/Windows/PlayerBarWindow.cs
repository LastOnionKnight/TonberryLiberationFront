using Dalamud.Interface.Windowing;
using Dalamud.Interface.Utility;
using Dalamud.Bindings.ImGui;
using System.Collections.Generic;
using System.Numerics;

namespace KhPartyBars.Windows;

public class PlayerBarWindow : Window
{
    private readonly KhRenderer renderer = new();

    public PlayerBarWindow() : base("KH Player Bar##player", DefaultFlags)
    {
        IsOpen = true;
        DisableWindowSounds = true;
        RespectCloseHotkey = false;
    }

    private const ImGuiWindowFlags DefaultFlags =
        ImGuiWindowFlags.NoTitleBar       |
        ImGuiWindowFlags.NoScrollbar      |
        ImGuiWindowFlags.NoScrollWithMouse|
        ImGuiWindowFlags.NoBackground     |
        ImGuiWindowFlags.NoFocusOnAppearing|
        ImGuiWindowFlags.NoNavFocus;

    public override bool DrawConditions()
    {
        if (!Plugin.Config.Enabled) return false;
        if (Plugin.Objects.LocalPlayer is null) return false;
        return true;
    }

    public override void PreDraw()
    {
        SizeConstraints = new WindowSizeConstraints
        {
            MinimumSize = new Vector2(200, 60),
            MaximumSize = new Vector2(800, 200),
        };

        Flags = DefaultFlags;
        if (Plugin.Config.EditMode) Flags &= ~ImGuiWindowFlags.NoBackground;
        if (Plugin.Config.LockPlayerBar && !Plugin.Config.EditMode)
            Flags |= ImGuiWindowFlags.NoMove | ImGuiWindowFlags.NoResize;

        var rowH   = Plugin.Config.RowHeight;
        var width  = Plugin.Config.RowWidth + 28;
        var height = rowH + 24;

        ImGuiHelpers.ForceNextWindowMainViewport();
        ImGui.SetNextWindowSize(new Vector2(width, height) * Plugin.Config.UiScale, ImGuiCond.Always);

        if (WindowManager.ForceReposition > 0)
            ImGui.SetNextWindowPos(Plugin.Config.PlayerBarPosition, ImGuiCond.Always);
    }

    public override void PostDraw()
    {
        if (!Plugin.Config.LockPlayerBar || Plugin.Config.EditMode)
            Plugin.Config.PlayerBarPosition = ImGui.GetWindowPos();
    }

    public override void Draw()
    {
        var me = Plugin.Objects.LocalPlayer;
        if (me is null) return;

        var roster = new List<KhRosterEntry> { KhRosterEntry.FromLocalPlayer(me, isTarget: false) };
        renderer.DrawRoster(roster);
    }
}