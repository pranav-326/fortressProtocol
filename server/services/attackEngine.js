import cron from 'node-cron';
import admin from 'firebase-admin';
import { db } from '../config/firebase.js';

const ATTACK_INTERVAL_SECONDS = 120; // 2 minutes

const ATTACKS = [
	{
		name: 'Phishing Campaign',
		description: 'Mass email phishing attempt targeting user credentials.',
		correctDefense: 'email-filter',
		damage: 10,
		rewardPoints: 50,
		rewardCoins: 100
	},
	{
		name: 'DDoS Burst',
		description: 'Short but intense distributed denial of service attack.',
		correctDefense: 'rate-limit',
		damage: 20,
		rewardPoints: 80,
		rewardCoins: 200
	},
	{
		name: 'Ransomware Drop',
		description: 'Malicious payload attempting to encrypt files.',
		correctDefense: 'backup-restore',
		damage: 40,
		rewardPoints: 150,
		rewardCoins: 400
	},
	{
		name: 'SQL Injection',
		description: 'Exploiting input fields to run database commands.',
		correctDefense: 'input-sanitization',
		damage: 25,
		rewardPoints: 90,
		rewardCoins: 180
	},
	{
		name: 'Zero-day Exploit',
		description: 'Unknown vulnerability exploited in the stack.',
		correctDefense: 'patch-management',
		damage: 60,
		rewardPoints: 300,
		rewardCoins: 600
	}
];

let job = null;

export function startAttackScheduler() {
	if (job) return job; // already started

	// schedule every 2 minutes; do not start automatically until start() is called
	job = cron.schedule('*/2 * * * *', async () => {
		try {
			const gsRef = db.collection('gameState').doc('main');
			const gsSnap = await gsRef.get();
			const gs = gsSnap.exists ? gsSnap.data() : null;

			if (!gs || gs.status !== 'running') {
				// skip if game not running
				return;
			}

			// pick random attack
			const attack = ATTACKS[Math.floor(Math.random() * ATTACKS.length)];

			const attackDoc = {
				name: attack.name,
				description: attack.description,
				correctDefense: attack.correctDefense,
				damage: attack.damage,
				rewardPoints: attack.rewardPoints,
				rewardCoins: attack.rewardCoins,
				startedAt: admin.firestore.FieldValue.serverTimestamp(),
				responseWindow: 60
			};

			const newRef = await db.collection('attacks').add(attackDoc);

			const nextAt = admin.firestore.Timestamp.fromMillis(Date.now() + ATTACK_INTERVAL_SECONDS * 1000);

			await gsRef.set({
				currentAttackId: newRef.id,
				nextAttackAt: nextAt
			}, { merge: true });

			console.log('Scheduled attack created:', newRef.id, attack.name);
		} catch (err) {
			console.error('Attack scheduler error:', err);
		}
	}, { scheduled: false });

	job.start();
	return job;
}

let healthJob = null;

export function startHealthScheduler() {
	if (healthJob) return healthJob;

	// Schedule every 5 minutes
	healthJob = cron.schedule('*/5 * * * *', async () => {
		try {
			const gsRef = db.collection('gameState').doc('main');
			const gsSnap = await gsRef.get();
			const gs = gsSnap.exists ? gsSnap.data() : null;

			// Skip if game not running
			if (!gs || gs.status !== 'running') return;

			// Get all teams
			const teamsSnap = await db.collection('teams').get();

			const batch = db.batch();
			let count = 0;

			teamsSnap.forEach(doc => {
				const team = doc.data();
				const health = typeof team.health === 'number' ? team.health : 100;

				// Only heal if they are still alive (health > 0) and not full (< 100)
				// If health is 0, they lost a vault and are reset differently, or are dead.
				if (health > 0 && health < 100) {
					const newHealth = Math.min(100, health + 10);
					batch.update(doc.ref, { health: newHealth });
					count++;
				}
			});

			if (count > 0) {
				await batch.commit();
				console.log(`Regenerated health for ${count} teams`);
			}

		} catch (err) {
			console.error('Health scheduler error:', err);
		}
	}, { scheduled: false });

	healthJob.start();
	return healthJob;
}
