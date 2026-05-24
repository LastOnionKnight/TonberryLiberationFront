using Dalamud.Plugin;
using Dalamud.Plugin.Services;
using Dalamud.Logging;
using TonberryLiberationFront.Windows;
using TonberryLiberationFront.Services;
using TonberryLiberationFront.Config;

namespace TonberryLiberationFront;

public sealed class Plugin : IDalamudPlugin
{
    public string Name => "Tonberry Liberation Front";
    public IDalamudPluginInterface PluginInterface { get; init; }

    private PluginCommandManager _commandManager = null!;
    private ToolbarWindow _toolbarWindow = null!;
    private TacticsPopoutWindow _tacticsPopoutWindow = null!;
    private TweaksPanel _tweaksPanel = null!;
    private ConfigService _configService = null!;
    private DataService _dataService = null!;

    public Plugin(IDalamudPluginInterface pluginInterface, IPluginLog pluginLog, ICommandManager commandManager, IChatGui chatGui)
    {
        PluginInterface = pluginInterface;
        DalamudServices.Initialize(pluginLog, commandManager, chatGui);

        // Init services
        _configService = new ConfigService(PluginInterface);
        _dataService = new DataService();
        
        // Init windows
        _toolbarWindow = new ToolbarWindow(this, _dataService, _configService);
        _tacticsPopoutWindow = new TacticsPopoutWindow(this, _dataService, _configService);
        _tweaksPanel = new TweaksPanel(this, _configService);

        // Register commands
        _commandManager = new PluginCommandManager(this, _configService, _toolbarWindow, _tweaksPanel);

        DalamudServices.PluginLog.Information($"{Name} initialized (v0.1.0)");
    }

    public void Dispose()
    {
        _commandManager?.Dispose();
        _toolbarWindow?.Dispose();
        _tacticsPopoutWindow?.Dispose();
        _tweaksPanel?.Dispose();
        _dataService?.Dispose();
        _configService?.Dispose();
    }
}
