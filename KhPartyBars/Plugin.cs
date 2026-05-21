using Dalamud.Game.Command;
using Dalamud.IoC;
using Dalamud.Plugin;
using Dalamud.Plugin.Services;
using KhPartyBars.Windows;
using System;

namespace KhPartyBars;

public sealed class Plugin : IDalamudPlugin
{
    public string Name => "KH Party Bars";
    private const string ToggleCommand = "/khparty";
    private const string ConfigCommand = "/khpartycfg";

    [PluginService] public static IDalamudPluginInterface PluginInterface { get; private set; } = null!;
    [PluginService] public static ICommandManager        CommandManager   { get; private set; } = null!;
    [PluginService] public static IPartyList             PartyList        { get; private set; } = null!;
    [PluginService] public static IClientState           ClientState      { get; private set; } = null!;
    [PluginService] public static IFramework             Framework        { get; private set; } = null!;
    [PluginService] public static ITextureProvider       Textures         { get; private set; } = null!;
    [PluginService] public static IPluginLog             Log              { get; private set; } = null!;
    [PluginService] public static IDataManager           Data             { get; private set; } = null!;
    [PluginService] public static IObjectTable           Objects          { get; private set; } = null!;

    public static Configuration Config { get; private set; } = null!;
    public static WindowManager WindowMgr { get; private set; } = null!;

    public Plugin()
    {
        Config = Configuration.Load();
        WindowMgr = new WindowManager();

        PluginInterface.UiBuilder.Draw += WindowMgr.Draw;
        PluginInterface.UiBuilder.OpenConfigUi += () => WindowMgr.Config.Toggle();
        PluginInterface.UiBuilder.OpenMainUi += () => Config.Enabled = !Config.Enabled;

        CommandManager.AddHandler(ToggleCommand, new CommandInfo(OnToggle)
        {
            HelpMessage = "Toggle KH-style party bars on or off."
        });
        CommandManager.AddHandler(ConfigCommand, new CommandInfo(OnConfig)
        {
            HelpMessage = "Open the KH Party Bars configuration window."
        });

        Log.Info($"[{Name}] loaded. Enabled={Config.Enabled}.");
    }

    private void OnToggle(string cmd, string args)
    {
        Config.Enabled = !Config.Enabled;
        Config.Save();
    }

    private void OnConfig(string cmd, string args)
    {
        WindowMgr.Config.Toggle();
    }

    public void Dispose()
    {
        PluginInterface.UiBuilder.Draw -= WindowMgr.Draw;
        CommandManager.RemoveHandler(ToggleCommand);
        CommandManager.RemoveHandler(ConfigCommand);
        WindowMgr.Dispose();
    }
}
