import express from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase.js';

const router = express.Router();

router.post('/respond', async (req, res) => {
  try {
    const { teamId, selectedDefense } = req.body || {};
    if (!teamId) return res.status(400).json({ error: 'Missing teamId' });

    const gsRef = db.collection('gameState').doc('main');
    const gsSnap = await gsRef.get();
    const gs = gsSnap.exists ? gsSnap.data() : null;
    if (!gs || !gs.currentAttackId) return res.status(400).json({ error: 'No active attack' });

    const attackRef = db.collection('attacks').doc(gs.currentAttackId);
    const attackSnap = await attackRef.get();
    if (!attackSnap.exists) return res.status(400).json({ error: 'Current attack not found' });
    const attack = attackSnap.data();

    const teamRef = db.collection('teams').doc(teamId);

    const result = await db.runTransaction(async (tx) => {
      // re-read gameState inside transaction for atomicity
      const gsRef = db.collection('gameState').doc('main');
      const gsTxSnap = await tx.get(gsRef);
      const currentAttackId = gsTxSnap.exists ? gsTxSnap.data().currentAttackId : null;
      if (!currentAttackId) throw new Error('No active attack');

      const tSnap = await tx.get(teamRef);
      if (!tSnap.exists) throw new Error('Team not found');

      const team = tSnap.data();

      // prevent multiple responses to same attack
      if (team.lastRespondedAttackId && team.lastRespondedAttackId === currentAttackId) {
        throw new Error('Already responded to this attack');
      }

      // Use an object for defenses to support levels
      const defenses = team.defenses && typeof team.defenses === 'object' && !Array.isArray(team.defenses)
        ? team.defenses
        : {};
      let safeDefenses = { ...defenses };
      if (Array.isArray(team.defenses)) {
        safeDefenses = {};
        team.defenses.forEach(d => safeDefenses[d] = 1);
      }

      const rewards = { points: attack.rewardPoints || 0, coins: attack.rewardCoins || 0 };

      let outcome = 'failed';
      let newHealth = typeof team.health === 'number' ? team.health : 100;
      let newScore = typeof team.score === 'number' ? team.score : 0;
      let newCoins = typeof team.coins === 'number' ? team.coins : 0;
      let newVaults = { ...(team.vaults || {}) };

      const attackDefenseId = attack.correctDefense.toLowerCase().trim();
      const selectedDefenseId = selectedDefense ? selectedDefense.toLowerCase().trim() : null;
      const ownedLevel = safeDefenses[attackDefenseId] || 0;

      if (ownedLevel > 0) {
        outcome = 'success';
        const multiplier = ownedLevel === 1 ? 1 : (ownedLevel === 2 ? 1.5 : 2.0);
        newCoins += Math.floor(rewards.coins * multiplier);
        newScore += Math.floor(rewards.points * multiplier);
      } else if (selectedDefenseId === attackDefenseId) {
        outcome = 'partial';
        newCoins += Math.floor(rewards.coins * 0.3);
        newScore += Math.floor(rewards.points * 0.3);
      } else {
        outcome = 'failed';
        // Reduce health by flat 30 points (equivalent to 30% of max 100)
        newHealth -= 30;
        const scorePenalty = Math.ceil((attack.damage || 0) * 0.5);
        newScore -= scorePenalty;
      }

      // Vault deletion handling
      if (newHealth <= 0) {
        const vaultKeys = Object.keys(newVaults);
        if (vaultKeys.length > 0) {
          // Delete the first available vault
          delete newVaults[vaultKeys[0]];

          if (Object.keys(newVaults).length > 0) {
            newHealth = 100; // Reset health if they still have vaults left
          } else {
            newHealth = 0; // Total failure
          }
        } else {
          newHealth = 0;
        }

        const extraPenalty = Math.ceil((attack.rewardPoints || 0) * 0.5);
        newScore -= extraPenalty;
      }

      const updated = {
        health: newHealth,
        score: newScore,
        coins: newCoins,
        vaults: newVaults,
        lastRespondedAttackId: currentAttackId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      tx.update(teamRef, updated);

      return {
        outcome,
        health: newHealth,
        score: newScore,
        coins: newCoins,
        lastRespondedAttackId: currentAttackId
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Respond error:', err);
    if (err.message === 'Team not found') return res.status(404).json({ error: 'Team not found' });
    if (err.message === 'No active attack' || err.message === 'Already responded to this attack') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
