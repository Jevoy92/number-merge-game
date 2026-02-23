# Number Merge Game 🎮

A drop-and-merge number puzzle game built with React + Vite. Drop tiles into columns, merge matching numbers, and compete against an AI coach that explains its moves in real time.

## Features
- 🧠 **AI Coach** — watches your board and plays alongside you, explaining every move
- 🔗 **Combo System** — chain merges cascade for big score multipliers  
- 👤 **Player Profiles** — tracks high scores, max combos, and play style stats per player
- 📊 **Play Style Analysis** — AI-generated breakdown of your strengths and weaknesses
- ↩️ **Undo** — up to 100 moves of undo history

## How to Run Locally

```bash
git clone https://github.com/Jevoy92/number-merge-game.git
cd number-merge-game
npm install
npm run dev
```

## Project Structure

```
src/
├── App.jsx                    # Main app & game orchestration
├── index.css                  # Global styles & tile color palette
├── App.css                    # Component styles
├── components/
│   ├── Board.jsx              # Game board grid
│   ├── Tile.jsx               # Individual tile (drop animation + merge pulse)
│   ├── Header.jsx             # Score display, profile switcher, undo button
│   └── AnalysisModal.jsx      # Play style analysis overlay
├── hooks/
│   ├── useGameBoard.js        # Core game state: drop, merge, combo logic
│   └── useProfile.js          # Player profiles with localStorage persistence
└── utils/
    ├── ai.js                  # AI move calculator & board evaluator
    └── analysis.js            # Play style analysis engine
```

## Raw File URLs (for Lovable or other tools)

Paste these into Lovable's chat to share individual files:

- [App.jsx](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/App.jsx)
- [index.css](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/index.css)
- [App.css](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/App.css)
- [Board.jsx](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/components/Board.jsx)
- [Tile.jsx](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/components/Tile.jsx)
- [Header.jsx](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/components/Header.jsx)
- [AnalysisModal.jsx](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/components/AnalysisModal.jsx)
- [useGameBoard.js](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/hooks/useGameBoard.js)
- [useProfile.js](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/hooks/useProfile.js)
- [ai.js](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/utils/ai.js)
- [analysis.js](https://raw.githubusercontent.com/Jevoy92/number-merge-game/main/src/utils/analysis.js)
