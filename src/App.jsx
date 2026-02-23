import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import AnalysisModal from './components/AnalysisModal';
import { useGameBoard } from './hooks/useGameBoard';
import { useProfile } from './hooks/useProfile';
import { calculateBestAIMove, evaluateBoardState } from './utils/ai';
import './App.css';

function App() {
  const playerGame = useGameBoard();
  const aiGame = useGameBoard();
  const { profiles, activeProfileId, activeProfile, switchProfile, updateHighScore, incrementGamesPlayed, recordMoveStats } = useProfile();

  const [nextTiles, setNextTiles] = useState([2, 4]); // Queue of upcoming pieces
  const [modeLevel, setModeLevel] = useState(0);
  const [aiMode, setAiMode] = useState(true);
  const [history, setHistory] = useState([]); // Up to 100 history states

  // Modals
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  // AI State
  const [aiReasoning, setAiReasoning] = useState("Waiting for player to drop piece...");

  // Update high score whenever current score changes
  useEffect(() => {
    updateHighScore(playerGame.score);
  }, [playerGame.score]);

  // Dynamic Tile Difficulty
  const generateNewTile = () => {
    let maxPower = 5; // Default max is 32 (2^5)

    // Increase power cap by 1 for every 50,000 points
    const difficultyScaling = Math.floor(playerGame.score / 50000);
    maxPower += difficultyScaling;

    // Generate a random power between 1 (value 2) and maxPower
    const randPower = Math.floor(Math.random() * maxPower) + 1;
    return Math.pow(2, randPower);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const previousHistory = [...history];
    const snapshot = previousHistory.pop();
    setHistory(previousHistory);

    playerGame.loadState(snapshot.playerBoardState, snapshot.playerScore, snapshot.playerCombo);
    aiGame.loadState(snapshot.aiBoardState, snapshot.aiScore, snapshot.aiCombo);
    setNextTiles(snapshot.nextTiles);
    setAiReasoning(snapshot.aiReasoning);
  };

  const handlePlayerColumnClick = (colIndex) => {
    // 1. Record stats for profiling
    const boardCopy = playerGame.boardState.map(col => col.map(t => ({ ...t })));
    const currentTile = nextTiles[0];
    const topTileInCol = boardCopy[colIndex].length > 0 ? boardCopy[colIndex][boardCopy[colIndex].length - 1].value : 0;
    const isBlockingMove = topTileInCol > 0 && currentTile < topTileInCol;

    // Calculate staging score by evaluating the board *after* this drop is hypothetically completed
    boardCopy[colIndex].push({ value: currentTile, isMerging: false, isNew: true });
    const stagingScore = evaluateBoardState(boardCopy);

    // Note: We'll record maxCombo asynchronously via an effect on playerGame.combo in a real app, 
    // but for now we pass the current combo as the move starts.
    recordMoveStats(playerGame.combo, stagingScore, isBlockingMove);

    // 2. Save state snapshot before dropping tile
    setHistory(prev => {
      const snapshot = {
        playerBoardState: playerGame.boardState.map(col => col.map(t => ({ ...t }))),
        playerScore: playerGame.score,
        playerCombo: playerGame.combo,
        aiBoardState: aiGame.boardState.map(col => col.map(t => ({ ...t }))),
        aiScore: aiGame.score,
        aiCombo: aiGame.combo,
        nextTiles: [...nextTiles],
        aiReasoning: aiReasoning
      };
      const newHistory = [...prev, snapshot];
      if (newHistory.length > 100) newHistory.shift(); // Keep max 100 undos
      return newHistory;
    });

    // 3. Drop for player using the current tile
    playerGame.dropTile(colIndex, currentTile);

    // 2. Trigger AI Drop (if active)
    if (aiMode) {
      setAiReasoning("Thinking...");
      setTimeout(() => {
        const aiBoardCopy = aiGame.boardState.map(col => col.map(tile => ({ ...tile }))); // Send clean copy
        const move = calculateBestAIMove(aiBoardCopy, currentTile);
        if (move.bestCol !== -1) {
          aiGame.dropTile(move.bestCol, currentTile);
          setAiReasoning(move.reasoning);
        }
      }, 800); // 800ms delay gives player's tile time to drop and merge first
    }

    // 3. Queue logic: shift queue down, generate new end
    setNextTiles(prev => [prev[1], generateNewTile()]);
  };

  if (!activeProfile) {
    return <div>Loading...</div>;
  }

  // Render Tile Preview Component
  const renderTilePreview = () => (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Current</span>
        <div style={{ position: 'relative', width: '60px', height: '60px' }}>
          <div className="tile" style={{ bottom: '0', position: 'relative', backgroundColor: `var(--color-${nextTiles[0]}, var(--color-2))` }}>
            {nextTiles[0]}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', opacity: 0.5 }}>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Next Up</span>
        <div style={{ position: 'relative', width: '35px', height: '35px' }}>
          <div className="tile" style={{ bottom: '0', position: 'relative', width: '35px', height: '35px', fontSize: '1rem', borderRadius: '6px', backgroundColor: `var(--color-${nextTiles[1]}, var(--color-2))` }}>
            {nextTiles[1]}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`app-container ${aiMode ? 'ai-active' : ''}`}>
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
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

        {/* Toggle Button */}
        <button
          className="undo-btn"
          onClick={() => setAiMode(!aiMode)}
          style={{
            fontSize: '1rem', width: 'auto', padding: '5px 15px', borderRadius: '4px',
            backgroundColor: aiMode ? '#5fbcff' : '#1a1e24', color: aiMode ? 'white' : 'var(--text-dim)',
            fontWeight: 'bold', border: aiMode ? 'none' : '1px solid #272c33', cursor: 'pointer'
          }}>
          {aiMode ? 'AI Coach: Active' : 'Enable AI Coach'}
        </button>
      </div>

      <div className="boards-container">
        {/* Player Board */}
        <div className="board-wrapper">
          {renderTilePreview()}
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

        {/* AI Coach Board */}
        {aiMode && (
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            <div className="board-wrapper">
              {renderTilePreview()}
              <div className="board-title">AI Coach</div>
              <div style={{ position: 'relative', width: '320px', height: '400px', display: 'flex', justifyContent: 'center' }}>
                {/* Block clicks on AI board */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 100 }} />
                <Board boardState={aiGame.boardState} handleColumnClick={() => { }} />
                {aiGame.combo > 1 && (
                  <div className="combo-popup" key={`ai-${aiGame.combo}`} style={{ top: '20%', width: '100%', textAlign: 'center' }}>
                    {aiGame.combo}x Combo!
                  </div>
                )}
              </div>
            </div>

            {/* AI Explanation Box (Side) */}
            <div className="ai-reasoning-box">
              <div className="ai-badge">
                <span className="pulse-dot"></span>
                AI LOGIC
              </div>
              <p>{aiReasoning}</p>
            </div>
          </div>
        )}
      </div>

      <AnalysisModal
        profile={activeProfile}
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
      />
    </div>
  );
}

export default App;
