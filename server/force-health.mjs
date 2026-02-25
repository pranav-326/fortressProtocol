import { db } from './config/firebase.js';

async function forceHealth() {
    console.log('📡 Searching for active teams...');
    const snapshot = await db.collection('teams').get();

    if (snapshot.empty) {
        console.log('No teams found in database.');
        process.exit(1);
    }

    snapshot.forEach(async (docSnap) => {
        const team = docSnap.data();
        console.log(`Setting [${team.name}] health to 10%`);
        await db.collection('teams').doc(docSnap.id).update({
            health: 10,
            updatedAt: new Date()
        });
    });

    console.log('✅ Done! Check your browser dashboard. The health bar should now be flashing red at 10%.');
}

forceHealth();
