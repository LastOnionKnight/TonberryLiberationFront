using Dalamud.Game.ClientState.Party;
using Dalamud.Interface.Windowing;
using Dalamud.Interface.Utility;
using Dalamud.Bindings.ImGui;
using System.Collections.Generic;
using System.Numerics;

namespace KhPartyBars.Windows;

public class PartyBarsWindow : Window
{
    private readonly KhRenderer renderer = new();
    private KhRosterEntry? _contextMenuEntry = null;

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
        if (Plugin.Config.EditMode) Flags &= ~ImGuiWindowFlags.NoBackground;
        if (Plugin.Config.LockPosition && !Plugin.Config.EditMode)
            Flags |= ImGuiWindowFlags.NoMove | ImGuiWindowFlags.NoResize;

        var members = BuildRoster();
        var rowH    = Plugin.Config.RowHeight;
        var rowGap  = Plugin.Config.RowGap;
        var width   = Plugin.Config.RowWidth + 28;
        var height  = members.Count == 0 ? 1 : members.Count * rowH + (members.Count - 1) * rowGap + 24;

        ImGuiHelpers.ForceNextWindowMainViewport();
        ImGui.SetNextWindowSize(new Vector2(width, height) * Plugin.Config.UiScale, ImGuiCond.Always);

        if (WindowManager.ForceReposition > 0)
            ImGui.SetNextWindowPos(Plugin.Config.Position, ImGuiCond.Always);
    }

    public override void PostDraw()
    {
        if (!Plugin.Config.LockPosition || Plugin.Config.EditMode)
            Plugin.Config.Position = ImGui.GetWindowPos();
    }

    public override void Draw()
    {
        var members = BuildRoster();
        renderer.DrawRoster(members, OnActivateRow, OnContextMenu);
        
        DrawContextMenu();
    }

    private void OnContextMenu(KhRosterEntry entry)
    {
        _contextMenuEntry = entry;
        ImGui.OpenPopup($"##khparty_context_{entry.EntityId}");
    }

    private void DrawContextMenu()
    {
        if (_contextMenuEntry == null) return;
        
        var popupId = $"##khparty_context_{_contextMenuEntry.EntityId}";
        if (ImGui.BeginPopup(popupId))
        {
            if (ImGui.MenuItem($"Send Tell to {_contextMenuEntry.Name}"))
            {
                Plugin.Chat.Print($"/tell {_contextMenuEntry.Name} ");
                _contextMenuEntry = null;
                ImGui.CloseCurrentPopup();
            }
            
            ImGui.Separator();
            
            if (ImGui.MenuItem("Invite to Party"))
            {
                Plugin.Chat.Print($"/invite {_contextMenuEntry.Name}");
                _contextMenuEntry = null;
                ImGui.CloseCurrentPopup();
            }
            
            if (ImGui.MenuItem("Add to Blacklist"))
            {
                Plugin.Chat.Print($"/blacklist add {_contextMenuEntry.Name}");
                _contextMenuEntry = null;
                ImGui.CloseCurrentPopup();
            }
            
            ImGui.Separator();
            
            if (ImGui.MenuItem("Examine Profile"))
            {
                Plugin.Chat.Print($"/c {_contextMenuEntry.Name}");
                _contextMenuEntry = null;
                ImGui.CloseCurrentPopup();
            }
            
            ImGui.EndPopup();
        }
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