import React from 'react';
import Tile from './Tile';
import '../App.css';

const Board = ({ boardState, handleColumnClick }) => {
    return (
        <div className="board-container">
            <div className="board-grid">
                {[0, 1, 2, 3, 4].map(colIndex => (
                    <div
                        key={colIndex}
                        className="board-column"
                        onClick={() => handleColumnClick(colIndex)}
                    >
                        {boardState[colIndex].map((tile, rowIndex) => (
                            <Tile key={tile.id} tile={{ ...tile, row: rowIndex }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Board;
