import express from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase.js';

const router = express.Router();

function checkAdminKey(req) {
  const header = req.headers['x-admin-key'];
  return header && header === process.env.ADMIN_KEY;
}

router.post('/init', async (req, res) => {
  try {
    if (!checkAdminKey(req)) return res.status(403).json({ error: 'Admin authorization required' });

    const ref = db.collection('gameState').doc('main');
    const snap = await ref.get();
    if (snap.exists) return res.status(200).json(snap.data());

    const initial = {
      status: 'waiting',
      currentAttackId: null,
      nextAttackAt: null,
      leaderboardFrozen: false,
      startedAt: null
    };

    await ref.set(initial);
    const created = (await ref.get()).data();
    res.status(201).json(created);
  } catch (err) {
    console.error('Admin init error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/start', async (req, res) => {
  try {
    if (!checkAdminKey(req)) return res.status(403).json({ error: 'Admin authorization required' });

    const ref = db.collection('gameState').doc('main');
    await ref.set({ status: 'running', startedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    const snap = await ref.get();
    res.json(snap.data());
  } catch (err) {
    console.error('Admin start error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/stop', async (req, res) => {
  try {
    if (!checkAdminKey(req)) return res.status(403).json({ error: 'Admin authorization required' });

    const ref = db.collection('gameState').doc('main');
    await ref.set({ status: 'ended' }, { merge: true });
    const snap = await ref.get();
    res.json(snap.data());
  } catch (err) {
    console.error('Admin stop error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/trigger-attack', async (req, res) => {
  try {
    if (!checkAdminKey(req)) return res.status(403).json({ error: 'Admin authorization required' });

    // Finds the attack by the correctDefense ID you passed in, or picks random
    const { attackId } = req.body;

    // The same attacks array from attackEngine.js
    const ATTACKS = [
      { name: 'Phishing Campaign', correctDefense: 'email-filter', damage: 10, rewardPoints: 50, rewardCoins: 100 },
      { name: 'DDoS Burst', correctDefense: 'rate-limit', damage: 20, rewardPoints: 80, rewardCoins: 200 },
      { name: 'Ransomware Drop', correctDefense: 'backup-restore', damage: 40, rewardPoints: 150, rewardCoins: 400 },
      { name: 'SQL Injection', correctDefense: 'input-sanitization', damage: 25, rewardPoints: 90, rewardCoins: 180 },
      { name: 'Zero-day Exploit', correctDefense: 'patch-management', damage: 60, rewardPoints: 300, rewardCoins: 600 }
    ];

    let attack = ATTACKS.find(a => a.correctDefense === attackId);
    if (!attack) attack = ATTACKS[Math.floor(Math.random() * ATTACKS.length)];

    const attackDoc = {
      name: attack.name,
      correctDefense: attack.correctDefense,
      damage: attack.damage,
      rewardPoints: attack.rewardPoints,
      rewardCoins: attack.rewardCoins,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      responseWindow: 60
    };

    const newRef = await db.collection('attacks').add(attackDoc);
    const gsRef = db.collection('gameState').doc('main');

    await gsRef.set({
      currentAttackId: newRef.id,
      nextAttackAt: admin.firestore.Timestamp.fromMillis(Date.now() + 120000)
    }, { merge: true });

    res.json({ message: `Attack ${attack.name} triggered instantly`, attackId: newRef.id });
  } catch (err) {
    console.error('Trigger attack error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
