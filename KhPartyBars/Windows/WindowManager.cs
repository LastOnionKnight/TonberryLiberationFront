using Dalamud.Interface.Windowing;

namespace KhPartyBars.Windows;

public sealed class WindowManager
{
    public WindowSystem System { get; } = new("KhPartyBars");
    public PartyBarsWindow Bars { get; } = new();
    public ConfigWindow Config { get; } = new();

    public WindowManager()
    {
        System.AddWindow(Bars);
        System.AddWindow(Config);
    }

    public void Draw() => System.Draw();
    public void Dispose()
    {
        System.RemoveAllWindows();
    }
}
