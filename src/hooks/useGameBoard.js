import { useState, useCallback, useEffect } from 'react';

const COLS = 5;
const ROWS = 7;

export const cloneBoard = (board) => board.map(col => col.map(tile => ({ ...tile })));

export const useGameBoard = () => {
    const [boardState, setBoardState] = useState(Array.from({ length: COLS }, () => []));
    const [score, setScore] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [checkQueue, setCheckQueue] = useState([]);
    const [combo, setCombo] = useState(0);

    const dropTile = useCallback((colIndex, nextTileValue) => {
        if (processing) return;

        setBoardState(prev => {
            const newBoard = cloneBoard(prev);
            const column = newBoard[colIndex];

            if (column.length >= ROWS) return prev;

            const newTile = {
                id: Math.random().toString(36).substr(2, 9),
                value: Number(nextTileValue),
                isMerging: false,
                isNew: true
            };

            column.push(newTile);
            setCheckQueue([{ col: colIndex, row: column.length - 1 }]);
            setProcessing(true);
            setCombo(0);

            return newBoard;
        });
    }, [processing]);

    useEffect(() => {
        if (checkQueue.length === 0) {
            setProcessing(false);
            return;
        }

        const timer = setTimeout(() => {
            setBoardState(prevBoard => {
                let newBoard = cloneBoard(prevBoard);
                let nextQueue = [];
                let mergedAnything = false;
                let scoreGained = 0;

                const currentQueue = [...checkQueue];

                for (const { col, row } of currentQueue) {
                    if (row >= newBoard[col].length) continue;

                    let tile = newBoard[col][row];
                    if (!tile || tile.markedForRemoval) continue;

                    let neighborsToMerge = [];

                    // Check Below (row - 1)
                    if (row > 0 && newBoard[col][row - 1] && newBoard[col][row - 1].value === tile.value && !newBoard[col][row - 1].markedForRemoval) {
                        neighborsToMerge.push({ c: col, r: row - 1 });
                    }
                    // Check Left (col - 1)
                    if (col > 0 && newBoard[col - 1][row] && newBoard[col - 1][row].value === tile.value && !newBoard[col - 1][row].markedForRemoval) {
                        neighborsToMerge.push({ c: col - 1, r: row });
                    }
                    // Check Right (col + 1)
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

                        newBoard[col][row] = { ...tile, value: newValue, isMerging: true };
                        nextQueue.push({ col, row });
                    } else {
                        newBoard[col][row] = { ...tile, isMerging: false };
                    }
                }

                if (mergedAnything) {
                    let anyFell = false;

                    for (let c = 0; c < COLS; c++) {
                        const colLen = newBoard[c].length;
                        newBoard[c] = newBoard[c].filter(t => !t.markedForRemoval);

                        if (newBoard[c].length < colLen) {
                            anyFell = true;
                        }
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

                    setScore(s => s + scoreGained + Math.floor(scoreGained * combo * 0.1));
                    setCombo(c => c + 1);
                    setCheckQueue(nextQueue);
                } else {
                    for (let c = 0; c < COLS; c++) {
                        for (let r = 0; r < newBoard[c].length; r++) {
                            if (newBoard[c][r].isMerging) {
                                newBoard[c][r] = { ...newBoard[c][r], isMerging: false };
                            }
                        }
                    }
                    setCheckQueue([]);
                }

                return newBoard;
            });
        }, 200);

        return () => clearTimeout(timer);
    }, [checkQueue, combo]);

    const reset = useCallback(() => {
        setBoardState(Array.from({ length: COLS }, () => []));
        setScore(0);
        setCombo(0);
        setCheckQueue([]);
        setProcessing(false);
    }, []);

    const loadState = useCallback((newBoardState, newScore, newCombo) => {
        setBoardState(newBoardState);
        setScore(newScore);
        setCombo(newCombo);
        setCheckQueue([]);
        setProcessing(false);
    }, []);

    return {
        boardState,
        dropTile,
        score,
        combo,
        reset,
        loadState
    };
};
