# src - implementation notes

Target: Custom.TonberryTactics, registered with Umbra's widget registry.
Behavior contract is BUILD-SPEC.md section 3 (score/100, issues pip,
AllClear/HasIssues states, Stab./Stab?/Stab... severity, left-click opens
the Tactics popout, right-click runs the audit).

## Confirm against the live Umbra SDK BEFORE writing the widget

- Widget base class / interface (the spec was authored against public docs;
  field names like OnClick.Action are unconfirmed). Pull the real
  WidgetConfigBase / IToolbarWidget from una-xiv/umbra.
- Registration entrypoint (how a Dalamud plugin registers a custom widget type).
- Una.Drawing node API for the chip layout (label + value + pip).
- NuGet / project references and target framework.

## Data feed from the Tonberry Tactics plugin

score (0-100), issuesCount, per-severity breakdown - a read-only view onto the
existing MeldAudit / severity-tier logic. No new audit math; just surface it.