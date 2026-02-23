import React from 'react';
import '../App.css';
import { generatePlayStyleAnalysis } from '../utils/analysis';

const AnalysisModal = ({ profile, isOpen, onClose }) => {
    if (!isOpen || !profile) return null;

    const { pros, cons } = generatePlayStyleAnalysis(profile.stats);

    const stats = profile.stats;
    const blockingRatio = stats.totalMoves > 0 ? ((stats.blocksMade / stats.totalMoves) * 100).toFixed(1) : 0;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                background: 'linear-gradient(145deg, rgba(26, 30, 36, 0.95), rgba(39, 44, 51, 0.95))',
                border: '1px solid rgba(95, 188, 255, 0.3)', borderRadius: '16px', padding: '30px',
                width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                color: 'white', display: 'flex', flexDirection: 'column', gap: '20px'
            }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#5fbcff' }}>{profile.name}'s Analysis</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Games Played: {profile.gamesPlayed}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                {/* Lifetime Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                    <div className="score-box" style={{ padding: '10px' }}>
                        <span className="score-label">High Score</span>
                        <span className="score-value highlight">{profile.highScore.toLocaleString()}</span>
                    </div>
                    <div className="score-box" style={{ padding: '10px' }}>
                        <span className="score-label">Max Combo</span>
                        <span className="score-value">{stats.maxCombo}x</span>
                    </div>
                    <div className="score-box" style={{ padding: '10px' }}>
                        <span className="score-label">Block Rate</span>
                        <span className="score-value" style={{ color: blockingRatio > 15 ? '#ff726d' : 'var(--text-main)' }}>{blockingRatio}%</span>
                    </div>
                </div>

                {/* AI Pros & Cons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#68d391', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '1.2rem' }}>↑</span> Strengths
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                            {pros.map((pro, i) => <li key={`pro-${i}`} style={{ marginBottom: '8px' }}>{pro}</li>)}
                        </ul>
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#fc8181', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '1.2rem' }}>↓</span> Weaknesses
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                            {cons.map((con, i) => <li key={`con-${i}`} style={{ marginBottom: '8px' }}>{con}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisModal;
