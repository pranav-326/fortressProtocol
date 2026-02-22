import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/firebase.js';
import teamRoutes from './routes/team.routes.js';
import adminRoutes from './routes/admin.routes.js';
import attackRoutes from './routes/attack.routes.js';
import { startAttackScheduler } from './services/attackEngine.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get('/health', async (req, res) => {
  try {
    // simple harmless read
    await db.collection('healthCheck').limit(1).get();

    res.json({ status: 'Backend + Firestore connected ✅' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ status: 'Firestore connection failed ❌' });
  }
});

app.use('/team', teamRoutes);
app.use('/admin', adminRoutes);
app.use('/attack', attackRoutes);

// start scheduler (only if desired) — scheduler is exported and controlled
startAttackScheduler();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
