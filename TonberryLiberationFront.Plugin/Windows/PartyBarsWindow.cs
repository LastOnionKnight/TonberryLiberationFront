using Dalamud.Game.ClientState.Party;
using Dalamud.Interface.Windowing;
using Dalamud.Interface.Utility;
using Dalamud.Bindings.ImGui;
using System.Collections.Generic;
using System.Numerics;

namespace TonberryLiberationFront.Plugin.Windows;

public class PartyBarsWindow : HudWidgetWindow
{
    private readonly KhRenderer renderer = new();

    public PartyBarsWindow() : base("KH Party Bars##overlay", "party")
    {
    }

    public override bool DrawConditions()
    {
        if (!base.DrawConditions()) return false;
        if (!Plugin.Config.EditMode && Plugin.PartyList.Length == 0) return false;
        return true;
    }

    protected override void PreDrawWidget()
    {
        SizeConstraints = new WindowSizeConstraints
        {
            MinimumSize = new Vector2(200, 80),
            MaximumSize = new Vector2(800, 1000),
        };

        if (Plugin.Config.LockPosition && !Plugin.Config.EditMode)
            Flags |= ImGuiWindowFlags.NoMove | ImGuiWindowFlags.NoResize;

        var members = BuildRoster();
        var rowH    = Plugin.Config.RowHeight;
        var rowGap  = Plugin.Config.RowGap;
        var width   = Plugin.Config.RowWidth + 28;
        var height  = members.Count == 0 ? 1 : members.Count * rowH + (members.Count - 1) * rowGap + 24;

        Dalamud.Interface.Utility.ImGuiHelpers.ForceNextWindowMainViewport();
        ImGui.SetNextWindowSize(new Vector2(width, height) * Plugin.Config.UiScale, ImGuiCond.Always);

        if (WindowManager.ForceReposition > 0)
            ImGui.SetNextWindowPos(Plugin.Config.Position, ImGuiCond.Always);
    }

    public override void PostDraw()
    {
        if (!Plugin.Config.LockPosition || Plugin.Config.EditMode)
            Plugin.Config.Position = ImGui.GetWindowPos();
    }

    protected override void DrawWidget()
    {
        var members = BuildRoster();
        renderer.DrawRoster(members, OnActivateRow, OnContextMenu);
    }

    private unsafe void OnContextMenu(KhRosterEntry entry)
    {
        var agent = FFXIVClientStructs.FFXIV.Client.UI.Agent.AgentContext.Instance();
        agent->TargetObjectId = entry.EntityId;
        agent->OpenContextMenu(true, true);
        ImGui.CloseCurrentPopup();
    }

    private static void OnActivateRow(KhRosterEntry entry)
    {
        var obj = entry.GameObject ?? Plugin.Objects.SearchByEntityId(entry.EntityId);
        if (obj is not null)
            Plugin.Targets.Target = obj;
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
            // v0.1.11: skip the local player - the dedicated PlayerBarWindow
            // already draws self, so listing self here produced a duplicate bar.
            if (me is not null && member.EntityId == me.EntityId) continue;
            roster.Add(KhRosterEntry.FromPartyMember(member, isLocal: false));
        }
        return roster;
    }
}
