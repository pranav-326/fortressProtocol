import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [team, setTeam] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [loading, setLoading] = useState(true);

    const backendUrl = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5001';

    useEffect(() => {
        // Load team from local storage on mount
        const storedTeamStr = localStorage.getItem('fortress_team');
        if (storedTeamStr) {
            try {
                const parsed = JSON.parse(storedTeamStr);
                setTeam(parsed);
            } catch (e) {
                console.error("Failed to parse stored team", e);
                localStorage.removeItem('fortress_team');
            }
        }
        setLoading(false);
    }, []);

    // Listen to Firebase team document changes
    useEffect(() => {
        if (!team?.id) return;

        const unsubTeam = onSnapshot(doc(db, 'teams', team.id), (docSnap) => {
            if (docSnap.exists()) {
                setTeam((prev) => {
                    const updated = { ...prev, ...docSnap.data(), id: docSnap.id };
                    localStorage.setItem('fortress_team', JSON.stringify(updated));
                    return updated;
                });
            } else {
                logout();
            }
        }, (error) => {
            console.error("Firebase team snapshot error (Check Firestore Rules):", error.message);
        });

        return () => unsubTeam();
    }, [team?.id]);

    // Listen to global GameState
    useEffect(() => {
        const unsubGame = onSnapshot(doc(db, 'gameState', 'main'), (docSnap) => {
            if (docSnap.exists()) {
                setGameState(docSnap.data());
            } else {
                setGameState(null);
            }
        }, (error) => {
            console.error("Firebase gameState snapshot error (Check Firestore Rules):", error.message);
        });

        return () => unsubGame();
    }, []);

    const login = async (name, password) => {
        try {
            const res = await fetch(`${backendUrl}/team/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Login failed');
            }

            const data = await res.json();
            setTeam(data);
            localStorage.setItem('fortress_team', JSON.stringify(data));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        setTeam(null);
        localStorage.removeItem('fortress_team');
    };

    const buyDefense = async (defenseId, price) => {
        if (!team?.id) throw new Error("Not logged in");

        const res = await fetch(`${backendUrl}/team/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: team.id, defenseId, price })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Purchase failed');
        }

        const data = await res.json();

        // Optimistically update the UI immediately without waiting for Firebase sync
        setTeam(prev => {
            const updated = { ...prev, coins: data.coins, defenses: data.defenses };
            localStorage.setItem('fortress_team', JSON.stringify(updated));
            return updated;
        });

        return data;
    };


    const respondToAttack = async (defenseId) => {
        if (!team?.id) throw new Error("Not logged in");

        const res = await fetch(`${backendUrl}/attack/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: team.id, selectedDefense: defenseId })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Response failed');
        }

        const data = await res.json();

        // Optimistically update the UI to reflect new health, coins, score, and close the modal
        setTeam(prev => {
            const updated = {
                ...prev,
                health: data.health,
                coins: data.coins,
                score: data.score,
                lastRespondedAttackId: data.lastRespondedAttackId
            };
            localStorage.setItem('fortress_team', JSON.stringify(updated));
            return updated;
        });

        return data;
    };

    return (
        <GameContext.Provider value={{ team, gameState, loading, login, logout, buyDefense, respondToAttack }}>
            {children}
        </GameContext.Provider>
    );
};
