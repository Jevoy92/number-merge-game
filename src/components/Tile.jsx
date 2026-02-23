import React, { useState, useEffect } from 'react';
import '../App.css';

export const getTileColor = (value) => {
    return `var(--color-${value}, var(--color-2))`;
};

const Tile = ({ tile }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        let t;
        if (tile.isNew) {
            t = setTimeout(() => {
                setMounted(true);
            }, 10);
        } else {
            setMounted(true);
        }
        return () => clearTimeout(t);
    }, []);

    // 60px height roughly + gap. Fall from top (450px) if new.
    const bottomPos = mounted ? tile.row * 62 + 5 : (tile.isNew ? 450 : tile.row * 62 + 5);

    return (
        <div
            className={`tile ${tile.isMerging ? 'merging' : ''}`}
            style={{
                bottom: `${bottomPos}px`,
                backgroundColor: getTileColor(tile.value),
                color: 'white' // Text is white for contrast against rich colors
            }}
        >
            {tile.value}
        </div>
    );
};

export default Tile;
