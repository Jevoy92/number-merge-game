const COLS = 5;
const ROWS = 7;

// A simple deep clone function for the 2D column array without React specifics
const cloneBoard = (board) => board.map(col => col.map(tile => ({ ...tile })));

// Helper to simulate a drop and execute merges to find the resulting board state and score gained
const simulateDrop = (board, colIndex, nextTileValue) => {
    let newBoard = cloneBoard(board);
    const column = newBoard[colIndex];

    if (column.length >= ROWS) return { valid: false };

    // Drop logic
    column.push({ value: nextTileValue, isMerging: false, isNew: true });

    let scoreGained = 0;
    let combo = 0;
    let checkQueue = [{ col: colIndex, row: column.length - 1 }];

    // Simulate resolution loop
    let maxLoops = 20; // prevent infinite loops in broken edge cases
    while (checkQueue.length > 0 && maxLoops > 0) {
        maxLoops--;
        let nextQueue = [];
        let mergedAnything = false;

        let colsToRemoveIndices = Array.from({ length: COLS }, () => []);

        for (const { col, row } of checkQueue) {
            if (row >= newBoard[col].length) continue;
            let tile = newBoard[col][row];
            if (!tile || tile.markedForRemoval) continue;

            let neighborsToMerge = [];

            if (row > 0 && newBoard[col][row - 1] && newBoard[col][row - 1].value === tile.value && !newBoard[col][row - 1].markedForRemoval) {
                neighborsToMerge.push({ c: col, r: row - 1 });
            }
            if (col > 0 && newBoard[col - 1][row] && newBoard[col - 1][row].value === tile.value && !newBoard[col - 1][row].markedForRemoval) {
                neighborsToMerge.push({ c: col - 1, r: row });
            }
            if (col < COLS - 1 && newBoard[col + 1][row] && newBoard[col + 1][row].value === tile.value && !newBoard[col + 1][row].markedForRemoval) {
                neighborsToMerge.push({ c: col + 1, r: row });
            }

            if (neighborsToMerge.length > 0) {
                mergedAnything = true;
                let newValue = tile.value;
                for (let i = 0; i < neighborsToMerge.length; i++) {
                    newValue *= 2;
                }
                scoreGained += newValue;

                neighborsToMerge.forEach(({ c, r }) => {
                    newBoard[c][r].markedForRemoval = true;
                });

                newBoard[col][row] = { ...tile, value: newValue };
                nextQueue.push({ col, row });
            }
        }

        if (mergedAnything) {
            let anyFell = false;
            for (let c = 0; c < COLS; c++) {
                const colLen = newBoard[c].length;
                newBoard[c] = newBoard[c].filter(t => !t.markedForRemoval);
                if (newBoard[c].length < colLen) anyFell = true;
            }

            if (anyFell) {
                for (let c = 0; c < COLS; c++) {
                    for (let r = 0; r < newBoard[c].length; r++) {
                        if (!nextQueue.some(q => q.col === c && q.row === r)) {
                            nextQueue.push({ col: c, row: r });
                        }
                    }
                }
            }

            combo++;
            checkQueue = nextQueue;
        } else {
            checkQueue = [];
        }
    }

    return { valid: true, newBoard, scoreGained, combo };
};

// Evaluate how good a final board state is
export const evaluateBoardState = (board) => {
    let score = 0;

    let maxVal = 0;
    let maxValCoords = { c: -1, r: -1 };

    // 1. Evaluate columns vertically
    for (let c = 0; c < COLS; c++) {
        const col = board[c];

        // Penalize high columns (risk of topping out, exponential penalty)
        score -= Math.pow(col.length, 2) * 30;

        // Evaluate Staging within columns (larger numbers below smaller)
        for (let r = 0; r < col.length; r++) {
            const tileVal = col[r].value;

            // Track the biggest number on the board
            if (tileVal > maxVal) {
                maxVal = tileVal;
                maxValCoords = { c, r };
            }

            if (r < col.length - 1) {
                const bottomVal = col[r].value;
                const topVal = col[r + 1].value;

                if (bottomVal >= topVal) {
                    // Good: Monotonicity.
                    if (bottomVal === topVal * 2) {
                        score += 100; // Perfect vertical combo setup (e.g., 8 under 4)
                    } else if (bottomVal === topVal) {
                        score += 40; // Identical tiles, will merge eventually
                    } else {
                        score += 10; // General good staging
                    }
                } else {
                    // Bad: Big number blocked by smaller number
                    score -= (topVal - bottomVal) * 5;
                    score -= 300; // Severe flat penalty for blocking
                }
            }
        }
    }

    // 2. Evaluate horizontal staging & board topography
    for (let c = 0; c < COLS - 1; c++) {
        const col1 = board[c];
        const col2 = board[c + 1];

        // Reward adjacent identical tiles anywhere, as they allow horizontal setups
        const minLen = Math.min(col1.length, col2.length);
        for (let r = 0; r < minLen; r++) {
            if (col1[r].value === col2[r].value) {
                score += col1[r].value; // Scaling reward based on tile size
            }
        }

        // Penalize deep "valleys" or "cliffs" between adjacent columns
        const heightDiff = Math.abs(col1.length - col2.length);
        if (heightDiff > 2) {
            score -= Math.pow(heightDiff, 2) * 40;
        }
    }

    // 3. Reward anchoring the highest value tile safely
    if (maxValCoords.r === 0) {
        score += 1000; // Huge reward for keeping the largest tile at the very bottom
        if (maxValCoords.c === 0 || maxValCoords.c === COLS - 1) {
            score += 1000; // Even better if it's tucked securely in a corner
        }
    }

    return score;
};

// Main function to calculate best move
export const calculateBestAIMove = (boardState, nextTileValue) => {
    let bestCol = -1;
    let bestScore = -Infinity;
    let reasoning = "";

    for (let colIndex = 0; colIndex < COLS; colIndex++) {
        const simResult = simulateDrop(boardState, colIndex, nextTileValue);

        if (!simResult.valid) continue;

        let moveScore = 0;
        let reasons = [];

        // 1. Score from immediate merges
        if (simResult.scoreGained > 0) {
            moveScore += simResult.scoreGained * 5; // drastically increase weight on instant point gain
            reasons.push(`By dropping the ${nextTileValue} here, I instantly trigger a merge that earns us ${simResult.scoreGained} points.`);

            if (simResult.combo > 1) {
                moveScore += simResult.combo * 5000; // Overwhelming weight to force max combos
                reasons.push(`This is a super strong move because it sets off a cascading ${simResult.combo}x Combo reaction!`);
            }
        }

        // 2. Score from resulting board layout (staging/blocking)
        const boardLayoutScore = evaluateBoardState(simResult.newBoard);
        moveScore += boardLayoutScore;

        if (simResult.scoreGained === 0) {
            if (boardLayoutScore > 1000) {
                reasons.push(`I am nesting the ${nextTileValue} here to protect my largest tiles in the corner and build a massive combo chain.`);
            } else if (boardLayoutScore > 0) {
                reasons.push(`I'm placing the ${nextTileValue} here to set up a vertical cascade. I want my bigger numbers on the bottom and smaller ones on top.`);
            } else {
                reasons.push(`This is a purely defensive move. The ${nextTileValue} isn't helpful here, but anywhere else it would block my big numbers or create a dangerous valley.`);
            }
        }

        if (moveScore > bestScore) {
            bestScore = moveScore;
            bestCol = colIndex;
            reasoning = reasons.join(" ");
        }
    }

    // Fallback if all moves look bad (e.g. board is almost full)
    if (bestCol === -1) {
        for (let c = 0; c < COLS; c++) {
            if (boardState[c].length < ROWS) {
                bestCol = c;
                reasoning = "All my strategies are blocked right now! I'm just dropping this here to survive and keep the board from filling up.";
                break;
            }
        }
    }

    return { bestCol, reasoning };
};
