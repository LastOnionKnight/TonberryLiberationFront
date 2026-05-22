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

    public static int ForceReposition;

    public void Draw()
    {
        System.Draw();
        if (ForceReposition > 0) ForceReposition--;
    }
    public void Dispose()
    {
        System.RemoveAllWindows();
    }
}
