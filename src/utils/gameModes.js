// Game Modes — only affect which tile values are generated.
// Core merge/drop/AI/profile/combo logic is untouched.

export const GAME_MODES = {
    classic: {
        id: 'classic',
        label: '🎮 Classic',
        description: 'Standard gameplay. Starts at 2–32, then scales to infinity as your score grows.',
        generateTile: (score, _moveCount) => {
            let maxPower = 5; // Default max is 32 (2^5)
            const difficultyScaling = Math.floor(score / 50000);
            maxPower += difficultyScaling;
            const randPower = Math.floor(Math.random() * maxPower) + 1;
            return Math.pow(2, randPower);
        },
    },

    all2s: {
        id: 'all2s',
        label: '2️⃣ All 2s',
        description: 'Every tile is a 2. Pure strategy — no luck.',
        generateTile: () => 2,
    },

    all4s: {
        id: 'all4s',
        label: '4️⃣ All 4s',
        description: 'Every tile is a 4. Chains build faster.',
        generateTile: () => 4,
    },

    baby: {
        id: 'baby',
        label: '🌱 Baby Mode',
        description: 'Only 2s and 4s drop. Great for beginners.',
        generateTile: () => {
            return Math.random() < 0.5 ? 2 : 4;
        },
    },

    bigNumbers: {
        id: 'bigNumbers',
        label: '🔥 Big Numbers',
        description: 'Tiles range from 64 to 512. Explosive scores, messy boards.',
        generateTile: () => {
            // Powers from 6 (64) to 9 (512)
            const power = Math.floor(Math.random() * 4) + 6;
            return Math.pow(2, power);
        },
    },

    chaos: {
        id: 'chaos',
        label: '🌪️ Chaos',
        description: 'Completely random tiles from 2 to 2048. Anything goes.',
        generateTile: () => {
            // Powers from 1 (2) to 11 (2048)
            const power = Math.floor(Math.random() * 11) + 1;
            return Math.pow(2, power);
        },
    },

    focused: {
        id: 'focused',
        label: '🎯 Focused',
        description: 'Only two values drop — a number and its double. Changes each game.',
        // The pair is picked once when the mode is first activated (see App.jsx)
        generateTile: (_score, _moveCount, pair) => {
            return Math.random() < 0.5 ? pair[0] : pair[1];
        },
    },

    rush: {
        id: 'rush',
        label: '⚡ Rush',
        description: 'Tile values escalate with every move you make, not your score.',
        generateTile: (_score, moveCount) => {
            // Escalates every 20 moves: 2→4→8→16... capped at 256
            const tier = Math.min(Math.floor(moveCount / 20), 7);
            const basePower = tier + 1;
            // Add slight randomness within 2 powers of the current tier
            const randOffset = Math.floor(Math.random() * 2);
            return Math.pow(2, basePower + randOffset);
        },
    },
};

// Pick a random Focused pair on game start
export const pickFocusedPair = () => {
    // Pick a base power from 1 (2) to 7 (128), with double being next power
    const basePower = Math.floor(Math.random() * 7) + 1;
    return [Math.pow(2, basePower), Math.pow(2, basePower + 1)];
};
