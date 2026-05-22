using Dalamud.Interface.Windowing;

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

    public static bool ForceReposition;

    public void Draw()
    {
        System.Draw();
        ForceReposition = false;
    }
    public void Dispose()
    {
        System.RemoveAllWindows();
    }
}
