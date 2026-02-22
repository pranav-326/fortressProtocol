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

        const defenses = Array.isArray(team.defenses) ? team.defenses : [];
        const rewards = { points: attack.rewardPoints || 0, coins: attack.rewardCoins || 0 };

        let outcome = 'failed';
        let newHealth = typeof team.health === 'number' ? team.health : 100;
        let newScore = typeof team.score === 'number' ? team.score : 0;
        let newCoins = typeof team.coins === 'number' ? team.coins : 0;

        const ownsDefense = defenses.some(
          d => d.toLowerCase().trim() === attack.correctDefense.toLowerCase().trim()
        );

        if (ownsDefense) {
          outcome = 'success';
          newCoins += rewards.coins;
          newScore += rewards.points;
        } else if (
          selectedDefense &&
          selectedDefense.toLowerCase().trim() ===
            attack.correctDefense.toLowerCase().trim()
        ) {
          outcome = 'partial';
          newCoins += Math.floor(rewards.coins * 0.7);
          newScore += Math.floor(rewards.points * 0.7);
        } else {
          outcome = 'failed';
          const damage = attack.damage || 0;
          newHealth = newHealth - damage;
          const scorePenalty = Math.ceil(damage * 0.5);
          newScore = newScore - scorePenalty;
        }

        // death handling
        if (newHealth <= 0) {
          const floor = Math.max(30, Math.ceil((attack.damage || 0) * 0.5));
          newHealth = floor;
          const extraPenalty = Math.ceil((attack.rewardPoints || 0) * 0.5);
          newScore = newScore - extraPenalty;
        }

        const updated = {
          health: newHealth,
          score: newScore,
          coins: newCoins,
          lastRespondedAttackId: currentAttackId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        tx.update(teamRef, updated);

        return { outcome, health: newHealth, score: newScore, coins: newCoins };
      });
    res.json(result);
  } catch (err) {
    console.error('Respond error:', err);
    if (err.message === 'Team not found') return res.status(404).json({ error: 'Team not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
