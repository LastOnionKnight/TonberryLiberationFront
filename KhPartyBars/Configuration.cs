using Dalamud.Configuration;
using System;
using System.Numerics;

namespace KhPartyBars;

/// <summary>
/// Persistent plugin configuration. Loaded once at startup, saved by the
/// settings window whenever the user changes a control.
/// </summary>
[Serializable]
public class Configuration : IPluginConfiguration
{
    public int Version { get; set; } = 1;

    // ── Master toggle ───────────────────────────────────────────────
    public bool Enabled { get; set; } = true;
    public bool HideInPvp { get; set; } = true;
    public bool HideInCutscene { get; set; } = true;
    public bool LockPosition { get; set; } = false;

    // ── Position + sizing ───────────────────────────────────────────
    public Vector2 Position { get; set; } = new(80, 240);
    public int RowWidth { get; set; } = 320;
    public int RowHeight { get; set; } = 44;
    public int RowGap { get; set; } = 6;
    public float UiScale { get; set; } = 1.0f;

    // ── Accent + colors ─────────────────────────────────────────────
    /// <summary>Accent color (Onion Knight ember default).</summary>
    public Vector4 Accent { get; set; } = new(0.84f, 0.48f, 0.24f, 1.00f);

    /// <summary>Color the curl-loop and bar-end terminator pull from.</summary>
    public bool CurlMatchesHp { get; set; } = true;

    public Vector4 ColorBg     { get; set; } = new(0.02f, 0.03f, 0.06f, 0.92f);
    public Vector4 ColorBorder { get; set; } = new(1.00f, 1.00f, 1.00f, 0.18f);

    public Vector4 ColorHpGreen   { get; set; } = new(0.44f, 0.75f, 0.17f, 1.00f);
    public Vector4 ColorHpYellow  { get; set; } = new(0.89f, 0.77f, 0.42f, 1.00f);
    public Vector4 ColorHpRed     { get; set; } = new(0.82f, 0.38f, 0.38f, 1.00f);
    public Vector4 ColorMp        { get; set; } = new(0.16f, 0.45f, 0.78f, 1.00f);

    public Vector4 ColorRoleTank   { get; set; } = new(0.32f, 0.41f, 0.80f, 1.00f);
    public Vector4 ColorRoleHealer { get; set; } = new(0.53f, 0.80f, 0.32f, 1.00f);
    public Vector4 ColorRoleDps    { get; set; } = new(0.80f, 0.32f, 0.32f, 1.00f);

    // ── Toggles ─────────────────────────────────────────────────────
    public bool ShowMpBar       { get; set; } = true;
    public bool ShowCurl        { get; set; } = true;
    public bool ShowLevel       { get; set; } = true;
    public bool ShowHpPercent   { get; set; } = true;
    public bool ShowJobInTab    { get; set; } = true;
    public bool ShowNameTab     { get; set; } = true;
    public bool ShimmerHpBar    { get; set; } = true;
    public bool HighlightTarget { get; set; } = true;
    public bool PortraitColorByRole { get; set; } = true;
    public bool UseDalamudFontForName { get; set; } = false;

    // ── HP thresholds ────────────────────────────────────────────────
    public float HpYellowAt { get; set; } = 0.60f;
    public float HpRedAt    { get; set; } = 0.30f;

    public void Save() => Plugin.PluginInterface.SavePluginConfig(this);

    public static Configuration Load()
    {
        return Plugin.PluginInterface.GetPluginConfig() as Configuration ?? new Configuration();
    }
}
