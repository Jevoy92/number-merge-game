import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import AnalysisModal from './components/AnalysisModal';
import { useGameBoard } from './hooks/useGameBoard';
import { useProfile } from './hooks/useProfile';
import { calculateBestAIMove, evaluateBoardState } from './utils/ai';
import { GAME_MODES, pickFocusedPair } from './utils/gameModes';
import './App.css';

// Auto-detect mobile on load (screen width + touch)
const detectMobile = () =>
  window.innerWidth < 768 ||
  /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function App() {
  const playerGame = useGameBoard();
  const aiGame = useGameBoard();
  const { profiles, activeProfileId, activeProfile, switchProfile, updateHighScore, recordMoveStats } = useProfile();

  const [nextTiles, setNextTiles] = useState([2, 4]);
  const [aiMode, setAiMode] = useState(true);
  const [history, setHistory] = useState([]);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('Waiting for player to drop piece...');

  // Game Mode
  const [gameMode, setGameMode] = useState('classic');
  const [focusedPair, setFocusedPair] = useState(() => pickFocusedPair());
  const [moveCount, setMoveCount] = useState(0);

  // Device layout
  const [isMobile, setIsMobile] = useState(detectMobile);

  // Allow manual override via a small toggle
  useEffect(() => {
    const handleResize = () => setIsMobile(detectMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update high score whenever score changes
  useEffect(() => {
    updateHighScore(playerGame.score);
  }, [playerGame.score]);

  // Tile generator — delegates to the active game mode
  const generateNewTile = (currentMoveCount = moveCount, currentScore = playerGame.score, currentPair = focusedPair) => {
    const mode = GAME_MODES[gameMode];
    return mode.generateTile(currentScore, currentMoveCount, currentPair);
  };

  // Switch game mode and re-seed tile queue
  const handleModeChange = (modeId) => {
    const newPair = pickFocusedPair();
    const newMode = GAME_MODES[modeId];
    setGameMode(modeId);
    setFocusedPair(newPair);
    setMoveCount(0);
    setNextTiles([
      newMode.generateTile(playerGame.score, 0, newPair),
      newMode.generateTile(playerGame.score, 0, newPair),
    ]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = [...history];
    const snapshot = prev.pop();
    setHistory(prev);
    playerGame.loadState(snapshot.playerBoardState, snapshot.playerScore, snapshot.playerCombo);
    aiGame.loadState(snapshot.aiBoardState, snapshot.aiScore, snapshot.aiCombo);
    setNextTiles(snapshot.nextTiles);
    setAiReasoning(snapshot.aiReasoning);
  };

  const handlePlayerColumnClick = (colIndex) => {
    const boardCopy = playerGame.boardState.map(col => col.map(t => ({ ...t })));
    const currentTile = nextTiles[0];
    const topTileInCol = boardCopy[colIndex].length > 0 ? boardCopy[colIndex][boardCopy[colIndex].length - 1].value : 0;
    const isBlockingMove = topTileInCol > 0 && currentTile < topTileInCol;
    boardCopy[colIndex].push({ value: currentTile, isMerging: false, isNew: true });
    const stagingScore = evaluateBoardState(boardCopy);
    recordMoveStats(playerGame.combo, stagingScore, isBlockingMove);

    // Save snapshot
    setHistory(prev => {
      const snapshot = {
        playerBoardState: playerGame.boardState.map(col => col.map(t => ({ ...t }))),
        playerScore: playerGame.score,
        playerCombo: playerGame.combo,
        aiBoardState: aiGame.boardState.map(col => col.map(t => ({ ...t }))),
        aiScore: aiGame.score,
        aiCombo: aiGame.combo,
        nextTiles: [...nextTiles],
        aiReasoning,
      };
      const newHistory = [...prev, snapshot];
      if (newHistory.length > 100) newHistory.shift();
      return newHistory;
    });

    playerGame.dropTile(colIndex, currentTile);

    if (aiMode) {
      setAiReasoning('Thinking...');
      setTimeout(() => {
        const aiBoardCopy = aiGame.boardState.map(col => col.map(tile => ({ ...tile })));
        const move = calculateBestAIMove(aiBoardCopy, currentTile);
        if (move.bestCol !== -1) {
          aiGame.dropTile(move.bestCol, currentTile);
          setAiReasoning(move.reasoning);
        }
      }, 800);
    }

    const nextMoveCount = moveCount + 1;
    setMoveCount(nextMoveCount);
    const mode = GAME_MODES[gameMode];
    setNextTiles(prev => [prev[1], mode.generateTile(playerGame.score, nextMoveCount, focusedPair)]);
  };

  if (!activeProfile) return <div>Loading...</div>;

  // Tile preview (shown once, above the boards)
  const tilePreview = (
    <div className="tile-preview">
      <div className="tile-preview-item">
        <span className="tile-preview-label">Now</span>
        <div className="tile-preview-tile tile"
          style={{ position: 'relative', bottom: 0, backgroundColor: `var(--color-${nextTiles[0]}, var(--color-2))` }}>
          {nextTiles[0]}
        </div>
      </div>
      <div className="tile-preview-item" style={{ opacity: 0.5 }}>
        <span className="tile-preview-label">Next</span>
        <div className="tile-preview-tile tile tile--small"
          style={{ position: 'relative', bottom: 0, backgroundColor: `var(--color-${nextTiles[1]}, var(--color-2))` }}>
          {nextTiles[1]}
        </div>
      </div>
    </div>
  );

  // Mobile AI strip (below player board — no AI board shown)
  const mobileAiStrip = aiMode && (
    <div className="mobile-ai-strip">
      <div className="mobile-ai-strip__header">
        <span className="pulse-dot" />
        <span>AI COACH</span>
        <span className="mobile-ai-strip__score">{aiGame.score.toLocaleString()}</span>
      </div>
      <p className="mobile-ai-strip__text">{aiReasoning}</p>
    </div>
  );

  return (
    <div className={`app-container ${aiMode && !isMobile ? 'ai-active' : ''}`}>
      {/* Controls */}
      <div className="controls-bar">
        <Header
          playerScore={playerGame.score}
          aiScore={aiGame.score}
          aiMode={aiMode}
          onUndo={handleUndo}
          historyCount={history.length}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSwitchProfile={switchProfile}
          onOpenAnalysis={() => setIsAnalysisOpen(true)}
        />

        <div className="controls-row">
          {/* AI Toggle */}
          <button className="ctrl-btn ctrl-btn--ai" onClick={() => setAiMode(!aiMode)}
            style={{ backgroundColor: aiMode ? '#5fbcff' : '#1a1e24', color: aiMode ? '#1a1e24' : 'var(--text-dim)', border: aiMode ? 'none' : '1px solid #272c33' }}>
            {aiMode ? '🤖 AI: On' : '🤖 AI: Off'}
          </button>

          {/* Mode Dropdown */}
          <select
            className="ctrl-select"
            value={gameMode}
            onChange={e => handleModeChange(e.target.value)}
          >
            {Object.values(GAME_MODES).map(mode => (
              <option key={mode.id} value={mode.id}>{mode.label}</option>
            ))}
          </select>

          {/* Device toggle (manual override) */}
          <button className="ctrl-btn ctrl-btn--device" onClick={() => setIsMobile(m => !m)}
            title={isMobile ? 'Switch to Desktop layout' : 'Switch to Mobile layout'}>
            {isMobile ? '📱' : '🖥️'}
          </button>
        </div>

        {/* Mode description — one clean line, always visible */}
        <p className="mode-description">
          {GAME_MODES[gameMode].description}
          {gameMode === 'focused' && ` (${focusedPair[0]} & ${focusedPair[1]})`}
        </p>
      </div>

      {/* Tile Preview — once, centered */}
      {tilePreview}

      {/* Boards */}
      <div className="boards-container">
        {/* Player Board */}
        <div className="board-wrapper">
          <div className="board-title">You</div>
          <div style={{ position: 'relative', width: '320px', height: '400px', display: 'flex', justifyContent: 'center' }}>
            <Board boardState={playerGame.boardState} handleColumnClick={handlePlayerColumnClick} />
            {playerGame.combo > 1 && (
              <div className="combo-popup" key={playerGame.combo} style={{ top: '20%', width: '100%', textAlign: 'center' }}>
                {playerGame.combo}x Combo!
              </div>
            )}
          </div>
        </div>

        {/* AI Board — desktop only */}
        {aiMode && !isMobile && (
          <div className="ai-board-section">
            <div className="board-wrapper">
              <div className="board-title">AI Coach</div>
              <div style={{ position: 'relative', width: '320px', height: '400px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: 100 }} />
                <Board boardState={aiGame.boardState} handleColumnClick={() => { }} />
                {aiGame.combo > 1 && (
                  <div className="combo-popup" key={`ai-${aiGame.combo}`} style={{ top: '20%', width: '100%', textAlign: 'center' }}>
                    {aiGame.combo}x Combo!
                  </div>
                )}
              </div>
            </div>

            <div className="ai-reasoning-box">
              <div className="ai-badge">
                <span className="pulse-dot" />
                AI LOGIC
              </div>
              <p>{aiReasoning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile AI strip */}
      {isMobile && mobileAiStrip}

      <AnalysisModal
        profile={activeProfile}
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
      />
    </div>
  );
}

export default App;
