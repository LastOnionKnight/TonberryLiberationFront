using Dalamud.Interface.Windowing;
using Dalamud.Bindings.ImGui;
using System.Collections.Generic;
using System.Numerics;

namespace KhPartyBars.Windows;

// The local player's own KH bar - a separate, independently positioned
// element (the "parameter bar"), distinct from the party roster window.
// Always visible while enabled; the party window only shows when grouped.
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
        ImGuiWindowFlags.NoSavedSettings  |
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
        if (Plugin.Config.EditMode) Flags &= ~(ImGuiWindowFlags.NoBackground | ImGuiWindowFlags.NoTitleBar);
        if (Plugin.Config.LockPlayerBar && !Plugin.Config.EditMode)
            Flags |= ImGuiWindowFlags.NoMove | ImGuiWindowFlags.NoResize;

        var rowH   = Plugin.Config.RowHeight;
        var width  = Plugin.Config.RowWidth + 28;
        var height = rowH + 24;

        ImGui.SetNextWindowSize(new Vector2(width, height) * Plugin.Config.UiScale, ImGuiCond.Always);
        var ppos = Plugin.Config.PlayerBarPosition;
        var pdisp = ImGui.GetIO().DisplaySize;
        var pcond = ImGuiCond.FirstUseEver;
        if (WindowManager.ForceReposition > 0) pcond = ImGuiCond.Always;
        if (false)
        {
            var cx = System.Math.Clamp(ppos.X, 0f, System.MathF.Max(0f, pdisp.X - 80f));
            var cy = System.Math.Clamp(ppos.Y, 0f, System.MathF.Max(0f, pdisp.Y - 40f));
            if (System.MathF.Abs(cx - ppos.X) > 1f || System.MathF.Abs(cy - ppos.Y) > 1f)
            {
                ppos = new Vector2(cx, cy);
                Plugin.Config.PlayerBarPosition = ppos;
                pcond = ImGuiCond.Always;
            }
        }
        ImGui.SetNextWindowPos(ppos, pcond);
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