import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/firebase.js';

const router = express.Router();

// Helper to omit sensitive fields
function sanitizeTeam(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    health: data.health,
    coins: data.coins,
    score: data.score,
    vaults: data.vaults,
    defenses: data.defenses || [],
    createdAt: data.createdAt || null
  };
}

// Admin-only team creation
router.post('/create', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.body.adminKey || process.env.ADMIN_KEY;
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Missing name or password' });
    }

    // ensure unique team name
    const existing = await db.collection('teams').where('name', '==', name).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'Team name already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const team = {
      name,
      passwordHash,
      health: 100,
      coins: 1000,
      score: 0,
      vaults: { vault1: 'safe', vault2: 'safe' },
      defenses: [],
      createdAt: new Date().toISOString()
    };

    const ref = await db.collection('teams').add(team);
    const createdDoc = await ref.get();

    res.status(201).json(sanitizeTeam(createdDoc));
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team login
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Missing name or password' });
    }

    const q = await db.collection('teams').where('name', '==', name).limit(1).get();
    if (q.empty) return res.status(401).json({ error: 'Invalid credentials' });

    const doc = q.docs[0];
    const data = doc.data();
    const match = await bcrypt.compare(password, data.passwordHash || '');
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    res.json(sanitizeTeam(doc));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
