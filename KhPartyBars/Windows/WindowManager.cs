using Dalamud.Interface.Windowing;
using Dalamud.Bindings.ImGui;
using System.Numerics;

namespace KhPartyBars.Windows;

public sealed class WindowManager
{
    public WindowSystem System { get; } = new("KhPartyBars");
    public PartyBarsWindow Bars { get; } = new();
    public ConfigWindow Config { get; } = new();
    public PlayerBarWindow Player { get; } = new();

    public WindowManager()
    {
        System.AddWindow(Bars);
        System.AddWindow(Config);
        System.AddWindow(Player);
    }

    public static int ForceReposition;
    public static string? PendingClipboard;
    private static bool bootHealDone;

    private static bool OffViewport(Vector2 p, Vector2 disp)
        => p.X >= disp.X - 10f || p.Y >= disp.Y - 10f || p.X < -240f || p.Y < -120f;

    public void Draw()
    {
        if (PendingClipboard != null)
        {
            ImGui.SetClipboardText(PendingClipboard);
            PendingClipboard = null;
        }

        if (!bootHealDone)
        {
            var disp = ImGui.GetIO().DisplaySize;
            if (disp.X > 1f && disp.Y > 1f)
            {
                var moved = false;
                if (OffViewport(Plugin.Config.Position, disp))
                {
                    Plugin.Config.Position = new Vector2(80, 240);
                    moved = true;
                }
                if (OffViewport(Plugin.Config.PlayerBarPosition, disp))
                {
                    Plugin.Config.PlayerBarPosition = new Vector2(200, 320);
                    moved = true;
                }
                if (moved) ForceReposition = 2;
                bootHealDone = true;
            }
        }

        System.Draw();
        if (ForceReposition > 0) ForceReposition--;
    }

    public void Dispose()
    {
        System.RemoveAllWindows();
    }
}