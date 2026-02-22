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

export default router;
