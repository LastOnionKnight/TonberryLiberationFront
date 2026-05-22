using Dalamud.Game.ClientState.Party;
using Dalamud.Interface.Windowing;
using Dalamud.Bindings.ImGui;
using System.Collections.Generic;
using System.Numerics;

namespace KhPartyBars.Windows;

public class PartyBarsWindow : Window
{
    private readonly KhRenderer renderer = new();

    public PartyBarsWindow() : base("KH Party Bars##overlay", DefaultFlags)
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
        if (!Plugin.Config.EditMode && Plugin.PartyList.Length == 0) return false;
        return true;
    }

    public override void PreDraw()
    {
        SizeConstraints = new WindowSizeConstraints
        {
            MinimumSize = new Vector2(200, 80),
            MaximumSize = new Vector2(800, 1000),
        };
        Flags = DefaultFlags;
        if (Plugin.Config.EditMode) Flags &= ~(ImGuiWindowFlags.NoBackground | ImGuiWindowFlags.NoTitleBar);
        if (Plugin.Config.LockPosition && !Plugin.Config.EditMode)
            Flags |= ImGuiWindowFlags.NoMove | ImGuiWindowFlags.NoResize;

        var members = BuildRoster();
        var rowH    = Plugin.Config.RowHeight;
        var rowGap  = Plugin.Config.RowGap;
        var width   = Plugin.Config.RowWidth + 28;
        var height  = members.Count == 0 ? 1 : members.Count * rowH + (members.Count - 1) * rowGap + 24;

        ImGui.SetNextWindowSize(new Vector2(width, height) * Plugin.Config.UiScale, ImGuiCond.Always);
        var ppos = Plugin.Config.Position;
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
                Plugin.Config.Position = ppos;
                pcond = ImGuiCond.Always;
            }
        }
        ImGui.SetNextWindowPos(ppos, pcond);
    }

    public override void PostDraw()
    {
        if (!Plugin.Config.LockPosition || Plugin.Config.EditMode)
            Plugin.Config.Position = ImGui.GetWindowPos();
    }

    public override void Draw()
    {
        var members = BuildRoster();
        renderer.DrawRoster(members, OnActivateRow);
    }

    private static void OnActivateRow(KhRosterEntry entry)
    {
        if (entry.GameObject is not null)
            Plugin.Targets.Target = entry.GameObject;
    }

    private static List<KhRosterEntry> BuildRoster()
    {
        var roster = new List<KhRosterEntry>(8);
        var party  = Plugin.PartyList;
        var me     = Plugin.Objects.LocalPlayer;

        if (party.Length == 0 && me is not null)
        {
            roster.Add(KhRosterEntry.FromLocalPlayer(me, isTarget: true));
            return roster;
        }

        foreach (var member in party)
        {
            roster.Add(KhRosterEntry.FromPartyMember(member, isLocal: member.EntityId == me?.EntityId));
        }
        return roster;
    }
}