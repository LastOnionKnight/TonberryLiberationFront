/* global React, Icon */
// =========================================================================
// Tonberry Liberation Front — Tactics popout (mini gear audit)
// Opens from the toolbar's Tactics chip. Smaller version of the full
// Tonberry Tactics window: audit ring, top findings with Refia-voice
// annotations, "open full audit" CTA.
// =========================================================================

const { useState } = React;

const DEMO_FINDINGS = [
  {
    id: 'f1',
    severity: 'critical',
    title: 'Wrong-set ring equipped',
    body: 'Lunar Envoy\'s Ring is off-set for the Augmented Credendum loadout. 65 iLvl recoverable. The Augmented replacement is in your armoury chest.',
    stab: 'Stab.',
  },
  {
    id: 'f2',
    severity: 'warning',
    title: 'DH overcap detected',
    body: 'Direct Hit substat exceeds plan target by 42. Each point past plan returns less than half the value of an equivalent Crit point.',
    stab: 'Stab?',
  },
  {
    id: 'f3',
    severity: 'warning',
    title: 'Legs unmelded',
    body: 'Credendum Hose has two open materia sockets. The plan wants Crit XII × 2 — materia is in your inventory.',
    stab: 'Stab?',
  },
  {
    id: 'f4',
    severity: 'note',
    title: 'Pre-pull food untracked',
    body: 'Plan assumes Mille Feuille (HQ) pre-pull. Last logged pull had no food buff. Not urgent, but correct.',
    stab: 'Stab…',
  },
];

function TacticsPopout({ open, onClose }) {
  if (!open) return null;
  const score = 72;
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div className="tlf-tactics-popout">
      <div className="tlf-tactics-popout-head">
        <img className="mascot" src="assets/tonberry/stab-emote.gif" alt="" />
        <div>
          <div className="title">Tonberry Tactics</div>
          <div className="sub">"Grub-Grub disapproves of guessing."</div>
        </div>
        <button className="tlf-tactics-popout-close" onClick={onClose} title="Close">×</button>
      </div>

      <div className="tlf-tactics-popout-body">
        <div className="tlf-tactics-score">
          <div className="ring">
            <svg viewBox="0 0 56 56">
              <circle cx="28" cy="28" r={radius}
                      fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="6" />
              <circle cx="28" cy="28" r={radius}
                      fill="none" stroke="url(#tacScoreGrad)" strokeWidth="6"
                      strokeDasharray={`${dash} ${circ}`}
                      strokeLinecap="butt"
                      transform="rotate(-90 28 28)" />
              <defs>
                <linearGradient id="tacScoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"  stopColor="#F2A057" />
                  <stop offset="100%" stopColor="#A85820" />
                </linearGradient>
              </defs>
            </svg>
            <div className="ring-text">{score}</div>
          </div>
          <div className="stat-text">
            <div className="label">Audit Score</div>
            <div className="val">Three issues need attention</div>
            <div className="quip">Most of your kit passes muster. The rest is fixable in under a minute.</div>
          </div>
        </div>

        {DEMO_FINDINGS.map(f => (
          <div key={f.id} className={`tlf-tactics-finding ${f.severity}`}>
            <div className="tlf-tactics-finding-head">
              <Icon name={
                f.severity === 'critical' ? 'alert-octagon' :
                f.severity === 'warning'  ? 'alert-triangle' :
                                            'info'
              } size={14} />
              {f.title}
              <span className="stab">{f.stab}</span>
            </div>
            <div className="tlf-tactics-finding-body">{f.body}</div>
          </div>
        ))}
      </div>

      <div className="tlf-tactics-foot">
        <span className="meta">Last audit · 2 min ago</span>
        <button className="btn">Open Full Audit</button>
      </div>
    </div>
  );
}

Object.assign(window, { TacticsPopout });
