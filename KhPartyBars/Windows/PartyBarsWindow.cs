using Dalamud.Game.ClientState.Conditions;
using Dalamud.Game.ClientState.Party;
using Dalamud.Interface.Windowing;
using ImGuiNET;
using System;
using System.Collections.Generic;
using System.Numerics;

namespace KhPartyBars.Windows;

/// <summary>
/// The party-bars overlay window. Draws transparent, no-chrome — all
/// visuals come from the renderer using ImGui's draw list.
/// </summary>
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
        if (Plugin.ClientState.LocalPlayer is null) return false;
        // TODO: respect HideInPvp / HideInCutscene via Condition flags
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
        if (Plugin.Config.LockPosition)
            Flags |= ImGuiWindowFlags.NoMove | ImGuiWindowFlags.NoResize;

        var members = BuildRoster();
        var rowH    = Plugin.Config.RowHeight;
        var rowGap  = Plugin.Config.RowGap;
        var width   = Plugin.Config.RowWidth;
        var height  = members.Count == 0 ? 1 : members.Count * rowH + (members.Count - 1) * rowGap + 8;

        ImGui.SetNextWindowSize(new Vector2(width, height) * Plugin.Config.UiScale, ImGuiCond.Always);
        ImGui.SetNextWindowPos(Plugin.Config.Position, ImGuiCond.FirstUseEver);
    }

    public override void PostDraw()
    {
        if (!Plugin.Config.LockPosition)
            Plugin.Config.Position = ImGui.GetWindowPos();
    }

    public override void Draw()
    {
        var members = BuildRoster();
        renderer.DrawRoster(members);
    }

    /// <summary>
    /// Collect the party (or solo player) into a normalized roster the
    /// renderer can consume without poking Dalamud APIs itself.
    /// </summary>
    private static List<KhRosterEntry> BuildRoster()
    {
        var roster = new List<KhRosterEntry>(8);
        var party  = Plugin.PartyList;
        var me     = Plugin.ClientState.LocalPlayer;

        if (party.Length == 0 && me is not null)
        {
            roster.Add(KhRosterEntry.FromLocalPlayer(me, isTarget: true));
            return roster;
        }

        foreach (var member in party)
        {
            roster.Add(KhRosterEntry.FromPartyMember(member, isLocal: member.ObjectId == me?.ObjectId));
        }
        return roster;
    }
}
