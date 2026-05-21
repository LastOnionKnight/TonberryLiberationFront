using Dalamud.Game.ClientState.Objects.SubKinds;
using Dalamud.Game.ClientState.Party;
using System;

namespace KhPartyBars;

public enum KhRole { Tank, Healer, Dps, Other }

/// <summary>
/// Plain data record consumed by the renderer. Lets the rendering layer
/// stay ignorant of Dalamud API specifics so it's easy to unit-test.
/// </summary>
public sealed class KhRosterEntry
{
    public string Name { get; init; } = "—";
    public string JobAbbr { get; init; } = "???";
    public byte   Level { get; init; } = 0;
    public KhRole Role { get; init; } = KhRole.Other;

    public uint Hp    { get; init; }
    public uint HpMax { get; init; } = 1;
    public uint Mp    { get; init; }
    public uint MpMax { get; init; } = 1;

    public bool IsLocal  { get; init; }
    public bool IsTarget { get; init; }

    public float HpFraction => HpMax == 0 ? 0f : (float)Hp / HpMax;
    public float MpFraction => MpMax == 0 ? 0f : (float)Mp / MpMax;

    // ── Adapters ────────────────────────────────────────────────────
    public static KhRosterEntry FromLocalPlayer(IPlayerCharacter p, bool isTarget = false)
        => new()
        {
            Name     = p.Name.TextValue,
            JobAbbr  = p.ClassJob.GameData?.Abbreviation.RawString ?? "???",
            Level    = (byte)p.Level,
            Role     = MapRole(p.ClassJob.GameData?.Role ?? 0),
            Hp       = p.CurrentHp,
            HpMax    = p.MaxHp,
            Mp       = p.CurrentMp,
            MpMax    = p.MaxMp,
            IsLocal  = true,
            IsTarget = isTarget,
        };

    public static KhRosterEntry FromPartyMember(IPartyMember m, bool isLocal)
        => new()
        {
            Name     = m.Name.TextValue,
            JobAbbr  = m.ClassJob.GameData?.Abbreviation.RawString ?? "???",
            Level    = (byte)m.Level,
            Role     = MapRole(m.ClassJob.GameData?.Role ?? 0),
            Hp       = (uint)m.CurrentHP,
            HpMax    = (uint)m.MaxHP,
            Mp       = (uint)m.CurrentMP,
            MpMax    = (uint)m.MaxMP,
            IsLocal  = isLocal,
            IsTarget = false, // wire up via TargetManager if you want
        };

    /// <summary>
    /// Lumina ClassJob.Role: 0 = none, 1 = tank, 2 = melee dps, 3 = phys ranged dps,
    /// 4 = healer. The KH bar groups melee+ranged into "dps".
    /// </summary>
    private static KhRole MapRole(byte raw) => raw switch
    {
        1 => KhRole.Tank,
        4 => KhRole.Healer,
        2 or 3 => KhRole.Dps,
        _ => KhRole.Other,
    };
}
