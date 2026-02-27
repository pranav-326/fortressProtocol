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
    defenses: data.defenses || {},
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
      defenses: {},
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

// Buy defense
router.post('/buy', async (req, res) => {
  try {
    const { teamId, defenseId, price } = req.body;
    if (!teamId || !defenseId || price === undefined) {
      return res.status(400).json({ error: 'Missing teamId, defenseId, or price' });
    }

    const teamRef = db.collection('teams').doc(teamId);

    const result = await db.runTransaction(async (tx) => {
      const tSnap = await tx.get(teamRef);
      if (!tSnap.exists) {
        throw new Error('Team not found');
      }

      const team = tSnap.data();
      const currentCoins = typeof team.coins === 'number' ? team.coins : 0;

      // Use an object for defenses: { 'firewall': 1, 'antivirus': 2 }
      const defenses = team.defenses && typeof team.defenses === 'object' && !Array.isArray(team.defenses)
        ? team.defenses
        : {}; // Fallback if it's an old array format, we can migrate it lazily by overwriting or resetting. 
      // To handle old accounts gracefully, we can map arrays:
      let safeDefenses = { ...defenses };
      if (Array.isArray(team.defenses)) {
        safeDefenses = {};
        team.defenses.forEach(d => safeDefenses[d] = 1);
      }

      const currentLevel = safeDefenses[defenseId] || 0;
      if (currentLevel >= 3) {
        throw new Error('Defense is already at max level');
      }

      let finalPrice = price;
      if (currentLevel === 1) finalPrice = Math.floor(price * 1.5);
      else if (currentLevel === 2) finalPrice = Math.floor(price * 2);

      if (currentCoins < finalPrice) {
        throw new Error('Insufficient coins');
      }

      const newCoins = currentCoins - finalPrice;
      const newDefenses = { ...safeDefenses, [defenseId]: currentLevel + 1 };

      tx.update(teamRef, {
        coins: newCoins,
        defenses: newDefenses
      });

      return { coins: newCoins, defenses: newDefenses };
    });

    res.json(result);
  } catch (err) {
    console.error('Buy error:', err);
    if (err.message === 'Team not found' || err.message === 'Insufficient coins' || err.message === 'Defense already purchased') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
