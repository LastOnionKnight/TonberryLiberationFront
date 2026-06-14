using Dalamud.Interface.Windowing;
using Dalamud.Interface.Utility;
using Dalamud.Bindings.ImGui;
using System.Collections.Generic;
using System.Numerics;

namespace TonberryLiberationFront.Plugin.Windows;

public class PlayerBarWindow : HudWidgetWindow
{
    private readonly KhRenderer renderer = new();

    public PlayerBarWindow() : base("KH Player Bar##player", "player-frame")
    {
    }

    protected override void PreDrawWidget()
    {
        SizeConstraints = new WindowSizeConstraints
        {
            MinimumSize = new Vector2(200, 200),
            MaximumSize = new Vector2(200, 200),
        };

        if (Plugin.Config.LockPlayerBar && !Plugin.Config.EditMode)
            Flags |= ImGuiWindowFlags.NoMove | ImGuiWindowFlags.NoResize;

        Dalamud.Interface.Utility.ImGuiHelpers.ForceNextWindowMainViewport();
        ImGui.SetNextWindowSize(new Vector2(200, 200) * Plugin.Config.UiScale, ImGuiCond.Always);

        if (WindowManager.ForceReposition > 0)
            ImGui.SetNextWindowPos(Plugin.Config.PlayerBarPosition, ImGuiCond.Always);
    }

    public override void PostDraw()
    {
        if (!Plugin.Config.LockPlayerBar || Plugin.Config.EditMode)
            Plugin.Config.PlayerBarPosition = ImGui.GetWindowPos();
    }

    protected override void DrawWidget()
    {
        var me = Plugin.Objects.LocalPlayer;
        if (me is null) return;

        var entry = KhRosterEntry.FromLocalPlayer(me, isTarget: false);
        
        var pos = ImGui.GetCursorScreenPos();
        renderer.DrawPlayerFrame(pos, entry);

        if (!Plugin.Config.EditMode)
        {
            ImGui.SetCursorScreenPos(pos);
            ImGui.InvisibleButton($"##khplayer", new Vector2(200, 200), ImGuiButtonFlags.MouseButtonLeft | ImGuiButtonFlags.MouseButtonRight);
            
            if (ImGui.IsItemClicked(ImGuiMouseButton.Left))
                OnActivateSelf(entry);
                
            if (ImGui.IsItemHovered(ImGuiHoveredFlags.RectOnly))
                ImGui.SetMouseCursor(ImGuiMouseCursor.Hand);
                
            if (ImGui.BeginPopupContextItem($"##khparty_context_{entry.EntityId}"))
            {
                OnContextMenu(entry);
                ImGui.EndPopup();
            }
        }
    }

    private static void OnActivateSelf(KhRosterEntry entry)
    {
        var obj = entry.GameObject ?? Plugin.Objects.SearchByEntityId(entry.EntityId);
        if (obj is not null)
            Plugin.Targets.Target = obj;
    }

    private unsafe void OnContextMenu(KhRosterEntry entry)
    {
        var agent = FFXIVClientStructs.FFXIV.Client.UI.Agent.AgentContext.Instance();
        agent->TargetObjectId = entry.EntityId;
        agent->OpenContextMenu(true, true);
        ImGui.CloseCurrentPopup();
    }
}
