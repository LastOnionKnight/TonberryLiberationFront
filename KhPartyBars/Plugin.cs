using Dalamud.Game.Command;
using Dalamud.IoC;
using Dalamud.Plugin;
using Dalamud.Plugin.Services;
using KhPartyBars.Windows;
using System;
using Dalamud.Bindings.ImGui;

namespace KhPartyBars;

public sealed class Plugin : IDalamudPlugin
{
    public string Name => "KH Party Bars";
    private const string ToggleCommand = "/khparty";
    private const string ConfigCommand = "/khpartycfg";
    private const string InfoCommand = "/khpbinfo";

    [PluginService] public static IDalamudPluginInterface PluginInterface { get; private set; } = null!;
    [PluginService] public static ICommandManager        CommandManager   { get; private set; } = null!;
    [PluginService] public static IPartyList             PartyList        { get; private set; } = null!;
    [PluginService] public static IClientState           ClientState      { get; private set; } = null!;
    [PluginService] public static IFramework             Framework        { get; private set; } = null!;
    [PluginService] public static ITextureProvider       Textures         { get; private set; } = null!;
    [PluginService] public static IPluginLog             Log              { get; private set; } = null!;
    [PluginService] public static IDataManager           Data             { get; private set; } = null!;
    [PluginService] public static IObjectTable           Objects          { get; private set; } = null!;
    [PluginService] public static ITargetManager         Targets          { get; private set; } = null!;
    [PluginService] public static IChatGui              Chat             { get; private set; } = null!;

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

        CommandManager.AddHandler(InfoCommand, new CommandInfo(OnInfo)
        {
            HelpMessage = "Print KH Party Bars version and diagnostics."
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

    private void OnInfo(string cmd, string args)
    {
        var ver = typeof(Plugin).Assembly.GetName().Version;
        var disp = ImGui.GetIO().DisplaySize;
        var sb = new System.Text.StringBuilder();
        void Line(string s) { Chat.Print(s); sb.AppendLine(s); }

        Line($"[KH Party Bars] v{ver}");
        Line($"DisplaySize: {disp.X:0} x {disp.Y:0}");
        Line($"Enabled={Config.Enabled}  EditMode={Config.EditMode}");
        Line($"Party: {PartyList.Length} member(s)");
        var me = Objects.LocalPlayer;
        if (me is not null)
        {
            var e = KhRosterEntry.FromLocalPlayer(me, false);
            Line($"Player: {e.Name}  {e.JobAbbr}  Lv{e.Level}");
        }
        else
        {
            Line("Player: (not available)");
        }
        Line($"Party bar: ({Config.Position.X:0}, {Config.Position.Y:0})  Lock={Config.LockPosition}");
        Line($"Player bar: ({Config.PlayerBarPosition.X:0}, {Config.PlayerBarPosition.Y:0})  Lock={Config.LockPlayerBar}");

        KhPartyBars.Windows.WindowManager.PendingClipboard = sb.ToString();
        Chat.Print("(copied to clipboard)");
    }

    public void Dispose()
    {
        PluginInterface.UiBuilder.Draw -= WindowMgr.Draw;
        CommandManager.RemoveHandler(ToggleCommand);
        CommandManager.RemoveHandler(ConfigCommand);
        CommandManager.RemoveHandler(InfoCommand);
        WindowMgr.Dispose();
    }
}
