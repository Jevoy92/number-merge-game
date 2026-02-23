import { useState, useEffect } from 'react';

const DEFAULT_PROFILES = {
    jevoy: {
        name: 'Jevoy',
        highScore: 0,
        gamesPlayed: 0,
        stats: { totalDrops: 0, maxCombo: 0, totalMoves: 0, avgStagingScore: 0, blocksMade: 0 }
    },
    adrienne: {
        name: 'Adrienne',
        highScore: 0,
        gamesPlayed: 0,
        stats: { totalDrops: 0, maxCombo: 0, totalMoves: 0, avgStagingScore: 0, blocksMade: 0 }
    }
};

export const useProfile = () => {
    const [profiles, setProfiles] = useState(() => {
        const saved = localStorage.getItem('numberMergeProfiles');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse profiles from local storage", e);
                return DEFAULT_PROFILES;
            }
        }
        return DEFAULT_PROFILES;
    });

    const [activeProfileId, setActiveProfileId] = useState(() => {
        return localStorage.getItem('numberMergeActiveProfile') || 'jevoy';
    });

    useEffect(() => {
        localStorage.setItem('numberMergeProfiles', JSON.stringify(profiles));
    }, [profiles]);

    useEffect(() => {
        localStorage.setItem('numberMergeActiveProfile', activeProfileId);
    }, [activeProfileId]);

    const activeProfile = profiles[activeProfileId];

    const switchProfile = (profileId) => {
        if (profiles[profileId]) {
            setActiveProfileId(profileId);
        }
    };

    const updateHighScore = (score) => {
        if (score > activeProfile.highScore) {
            setProfiles(prev => ({
                ...prev,
                [activeProfileId]: {
                    ...prev[activeProfileId],
                    highScore: score
                }
            }));
        }
    };

    const incrementGamesPlayed = () => {
        setProfiles(prev => ({
            ...prev,
            [activeProfileId]: {
                ...prev[activeProfileId],
                gamesPlayed: prev[activeProfileId].gamesPlayed + 1
            }
        }));
    };

    const recordMoveStats = (moveCombo, stagingScore, isBlockingMove) => {
        setProfiles(prev => {
            const currentStats = prev[activeProfileId].stats;
            const newTotalMoves = currentStats.totalMoves + 1;

            // Moving average for staging score
            const newAvgStaging = currentStats.totalMoves === 0
                ? stagingScore
                : ((currentStats.avgStagingScore * currentStats.totalMoves) + stagingScore) / newTotalMoves;

            return {
                ...prev,
                [activeProfileId]: {
                    ...prev[activeProfileId],
                    stats: {
                        ...currentStats,
                        totalDrops: currentStats.totalDrops + 1,
                        totalMoves: newTotalMoves,
                        maxCombo: Math.max(currentStats.maxCombo, moveCombo),
                        avgStagingScore: newAvgStaging,
                        blocksMade: currentStats.blocksMade + (isBlockingMove ? 1 : 0)
                    }
                }
            };
        });
    };

    return {
        profiles,
        activeProfileId,
        activeProfile,
        switchProfile,
        updateHighScore,
        incrementGamesPlayed,
        recordMoveStats
    };
};
