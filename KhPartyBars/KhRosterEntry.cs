using Dalamud.Game.ClientState.Objects.SubKinds;
using Dalamud.Game.ClientState.Party;
using System;

namespace KhPartyBars;

public enum KhRole { Tank, Healer, Dps, Other }

// Plain data record consumed by the renderer.
public sealed class KhRosterEntry
{
    public string Name { get; init; } = "-";
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

    public static KhRosterEntry FromLocalPlayer(IPlayerCharacter p, bool isTarget = false)
        => new()
        {
            Name     = p.Name.TextValue,
            JobAbbr  = p.ClassJob.ValueNullable?.Abbreviation.ExtractText() ?? "???",
            Level    = (byte)p.Level,
            Role     = MapRole(p.ClassJob.ValueNullable?.Role ?? (byte)0),
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
            JobAbbr  = m.ClassJob.ValueNullable?.Abbreviation.ExtractText() ?? "???",
            Level    = (byte)m.Level,
            Role     = MapRole(m.ClassJob.ValueNullable?.Role ?? (byte)0),
            Hp       = (uint)m.CurrentHP,
            HpMax    = (uint)m.MaxHP,
            Mp       = (uint)m.CurrentMP,
            MpMax    = (uint)m.MaxMP,
            IsLocal  = isLocal,
            IsTarget = false,
        };

    // Lumina ClassJob.Role: 1 = tank, 2 = melee dps, 3 = phys ranged, 4 = healer.
    private static KhRole MapRole(byte raw) => raw switch
    {
        1 => KhRole.Tank,
        4 => KhRole.Healer,
        2 or 3 => KhRole.Dps,
        _ => KhRole.Other,
    };
}