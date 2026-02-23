// Engine to generate human readable pros and cons based on historical stats tracking

export const generatePlayStyleAnalysis = (stats) => {
    const pros = [];
    const cons = [];

    // Minimum data requirement before analysis is meaningful
    if (stats.totalMoves < 10) {
        return {
            pros: ["Keep playing! AI needs more data to analyze your style."],
            cons: ["Not enough data recorded yet."]
        };
    }

    // 1. Analyze Combos
    if (stats.maxCombo >= 4) {
        pros.push(`Mastermind Setup: You consistently build massive, multi-stage chain reactions (Max Combo: ${stats.maxCombo}x).`);
    } else if (stats.maxCombo >= 2) {
        pros.push(`Solid Fundamentals: You reliably execute basic multi-merges to keep the board clear.`);
    } else {
        cons.push(`Short-sighted: You prioritize instant gratification over long-term combo setups (Max Combo: ${stats.maxCombo}x). Try building vertical towers!`);
    }

    // 2. Analyze Staging (Monotonicity & Valleys)
    if (stats.avgStagingScore > 50) {
        pros.push("Excellent Topography: You keep your largest numbers safely anchored at the bottom of the board.");
    } else if (stats.avgStagingScore < 0) {
        cons.push("Dangerous Architecture: You frequently create deep valleys or trap your largest numbers early in the game.");
    }

    // 3. Analyze Blocking Moves
    const blockingRatio = stats.blocksMade / stats.totalMoves;
    if (blockingRatio > 0.15) {
        cons.push(`Reckless Drops: ${(blockingRatio * 100).toFixed(0)}% of your moves involve dropping small numbers directly on top of larger numbers, blocking them from merging.`);
    } else if (blockingRatio < 0.05) {
        pros.push("Clean Columns: You almost never trap a high-value tile under a low-value tile.");
    }

    // 4. Activity
    if (stats.totalDrops > 500) {
        pros.push("Veteran Experience: You have a deep intuition for tile gravity from extensive play.");
    }

    // Fallbacks if strictly average
    if (pros.length === 0) {
        pros.push("Balanced Play: You play safely without taking major risks.");
    }
    if (cons.length === 0) {
        cons.push("No glaring weaknesses currently detected in your structure!");
    }

    return { pros, cons };
};
