import React from 'react';
import '../App.css';

const Header = ({ playerScore, aiScore, aiMode, onUndo, historyCount, profiles, activeProfileId, onSwitchProfile, onOpenAnalysis }) => {
  return (
    <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '15px' }}>

      {/* Top Bar: Profile & Analysis */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Playing As:</span>
          <select
            value={activeProfileId}
            onChange={(e) => onSwitchProfile(e.target.value)}
            style={{
              background: 'transparent', color: 'white', border: 'none',
              fontSize: '0.9rem', cursor: 'pointer', outline: 'none', fontWeight: 'bold'
            }}
          >
            {Object.entries(profiles).map(([id, p]) => (
              <option key={id} value={id} style={{ background: '#1a1e24' }}>{p.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenAnalysis}
          style={{
            background: 'transparent',
            color: '#af7aff',
            border: '1px solid rgba(175, 122, 255, 0.4)',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(175, 122, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(175, 122, 255, 0.8)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(175, 122, 255, 0.4)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Play Style Analysis
        </button>
      </div>

      {/* Main Header */}
      <header className="header" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
        <button className="icon-btn" style={{ opacity: 0.2 }}>&lt;</button>

        <div className="score-container" style={{ display: 'flex', gap: '20px' }}>
          <div className="score-box" style={{ padding: '10px 20px', minWidth: '120px' }}>
            <span className="score-label" style={{ fontSize: '0.7rem' }}>{profiles[activeProfileId].name}</span>
            <span className="score-value highlight" style={{ fontSize: '1.4rem' }}>{playerScore.toLocaleString()}</span>
          </div>

          {aiMode && (
            <div className="score-box" style={{ padding: '10px 20px', minWidth: '120px', border: '1px solid rgba(95, 188, 255, 0.4)', background: 'linear-gradient(145deg, rgba(26, 30, 36, 0.9), rgba(39, 44, 51, 0.9))' }}>
              <span className="score-label" style={{ fontSize: '0.7rem', color: '#5fbcff' }}>AI Coach</span>
              <span className="score-value" style={{ fontSize: '1.4rem' }}>{aiScore.toLocaleString()}</span>
            </div>
          )}
        </div>

        <button className="icon-btn" onClick={onUndo} style={{ position: 'relative', opacity: historyCount > 0 ? 1 : 0.4, cursor: historyCount > 0 ? 'pointer' : 'default', fontSize: '1.5rem' }}>
          ↻
          {historyCount > 0 && (
            <span className="undo-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#5fbcff', color: '#1a1e24', fontSize: '0.6rem', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {historyCount}
            </span>
          )}
        </button>
      </header>
    </div >
  );
};

export default Header;
