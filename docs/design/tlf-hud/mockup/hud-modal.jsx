/* global React, Icon, JOBS */
// =========================================================================
// Last Onion Knight — Job Switcher modal
// Frost-UI style "Classes/Jobs" window with role groupings, level numbers,
// click a row to preview, click "Set Forth" to switch the active job.
// =========================================================================

const { useState, useMemo, useEffect } = React;

function JobModal({ open, activeId, onClose, onPick }) {
  const [selectedId, setSelectedId] = useState(activeId);
  const [tab, setTab] = useState('DoW/DoM');

  useEffect(() => { setSelectedId(activeId); }, [activeId, open]);

  if (!open) return null;
  const selected = JOBS.find(j => j.id === selectedId) || JOBS[0];

  const groups = [
    { key: 'tank',   title: 'Tank',                 jobs: JOBS.filter(j => j.role === 'tank' && !j.custom) },
    { key: 'healer', title: 'Healer',               jobs: JOBS.filter(j => j.role === 'healer') },
    { key: 'melee',  title: 'Melee DPS',            jobs: JOBS.filter(j => j.role === 'dps' && ['pug','mnk','lnc','drg','rog','nin','sam','rpr','vpr'].includes(j.id)) },
    { key: 'pranged',title: 'Physical Ranged DPS',  jobs: JOBS.filter(j => ['arc','brd','mch','dnc'].includes(j.id)) },
    { key: 'mranged',title: 'Magical Ranged DPS',   jobs: JOBS.filter(j => ['thm','blm','acn','smn','rdm','pct','blu'].includes(j.id)) },
    { key: 'chr',    title: '✦ Chronicle Class',    jobs: JOBS.filter(j => j.custom) },
  ];

  const roleColor = (k) => k === 'tank' ? 'tank' : k === 'healer' ? 'healer' : 'dps';

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Character · Classes / Jobs</span>
          <span className="rune" style={{ marginLeft: 18, fontSize: 14, opacity: 0.7 }}>onion knight chronicle</span>
          <span className="modal-close" onClick={onClose}><Icon name="x" size={16} /></span>
        </div>
        <div className="modal-tabs">
          {['Attributes', 'Profile', 'Classes/Jobs', 'Reputation'].map(t => (
            <span key={t} className={`modal-tab ${t === 'Classes/Jobs' ? 'active' : ''}`}>{t}</span>
          ))}
        </div>
        <div className="modal-tabs" style={{ background: 'transparent', borderBottom: 'none', paddingTop: 4 }}>
          {['DoW/DoM', 'DoH/DoL'].map(t => (
            <span key={t} className={`modal-tab ${t === tab ? 'active' : ''}`} onClick={() => setTab(t)}
                  style={{ padding: '8px 18px', fontSize: 11 }}>{t}</span>
          ))}
        </div>
        <div className="modal-body">
          <div className="job-list">
            {groups.map(g => (
              <div className="role-block" key={g.key}>
                <div className={`role-block-title ${roleColor(g.jobs[0]?.role || 'tank')}`}>
                  <Icon name={
                    g.key === 'tank'    ? 'shield' :
                    g.key === 'healer'  ? 'cross' :
                    g.key === 'melee'   ? 'sword' :
                    g.key === 'pranged' ? 'bow-arrow' :
                    g.key === 'mranged' ? 'sparkle' :
                    'crown'
                  } size={14} />
                  <span>{g.title}</span>
                </div>
                {g.jobs.map(j => (
                  <div key={j.id}
                       className={`job-row ${selectedId === j.id ? 'active' : ''} ${!j.unlocked ? 'unloc' : ''}`}
                       onClick={() => setSelectedId(j.id)}>
                    <span className="lvl">{j.unlocked ? j.level : '—'}</span>
                    <span className="ji"><Icon name={j.icon} size={20} /></span>
                    <span className="jname">{j.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="job-detail">
            <div className="rune-ring">onkixe·onion·onkixe·</div>
            {selected.custom ? (
              <img src="assets/shield-crest.png" className="seal" alt="" style={{ width: 220 }} />
            ) : (
              <div style={{
                width: 200, height: 200, margin: '0 auto 8px',
                display: 'grid', placeItems: 'center',
                background: 'radial-gradient(circle, rgba(214,123,60,0.18), transparent 65%)',
                border: '1px solid var(--frost-border-1)', borderRadius: 8,
              }}>
                <Icon name={selected.icon} size={92} color="var(--frost-fg-2)" />
              </div>
            )}
            <h2>{selected.name}</h2>
            <div className="subtitle">
              {selected.custom
                ? 'Bearer of the Maelstrom helm — the realm\'s most layered defender.'
                : `Level ${selected.level} ${selected.role.charAt(0).toUpperCase() + selected.role.slice(1)} discipline.`}
            </div>
            <div className="stat-grid">
              <div className="stat"><span className="k">Level</span><span className="v">{selected.level}</span></div>
              <div className="stat"><span className="k">Role</span><span className="v">{selected.role.toUpperCase()}</span></div>
              <div className="stat"><span className="k">Vellum Stones</span><span className="v">{selected.custom ? '999' : (selected.level * 7).toLocaleString()}</span></div>
              <div className="stat"><span className="k">Chronicle Pts</span><span className="v">{(selected.level * 124).toLocaleString()}</span></div>
              <div className="stat"><span className="k">Mastery</span><span className="v">{selected.level >= 90 ? 'Adept' : selected.level >= 60 ? 'Practiced' : 'Initiate'}</span></div>
              <div className="stat"><span className="k">Banner</span><span className="v">{selected.role === 'tank' ? 'Maelstrom' : selected.role === 'healer' ? 'Twin Adder' : 'Immortal Flames'}</span></div>
            </div>
            <div className="quote">
              {selected.custom
                ? 'Layered greaves. Layered vows. Layered tears, the cooks say.'
                : 'Set forth, adventurer. The realm has need of the discipline you carry.'}
            </div>
            <button className="switch-btn" onClick={() => { onPick(selected); onClose(); }}>
              {selectedId === activeId ? 'Currently Equipped' : 'Set Forth as ' + selected.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.JobModal = JobModal;
