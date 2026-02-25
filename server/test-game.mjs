import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5001';
const ADMIN_KEY = 'mySuperSecret123'; // matches server/.env

async function run() {
    console.log('📡 Starting Admin Test Script...');

    // 1. Initialize Game State
    console.log('\n[1] Initializing Game...');
    let res = await fetch(`${BACKEND_URL}/admin/init`, {
        method: 'POST',
        headers: { 'x-admin-key': ADMIN_KEY }
    });
    console.log(await res.json());

    // 2. Start Game
    console.log('\n[2] Starting Game Scheduler...');
    res = await fetch(`${BACKEND_URL}/admin/start`, {
        method: 'POST',
        headers: { 'x-admin-key': ADMIN_KEY }
    });
    console.log(await res.json());

    // 3. Trigger Immediate Manual Attack (Optional bypass of 2min scheduler)
    console.log('\n[3] Triggering Immediate Attack...');
    res = await fetch(`${BACKEND_URL}/admin/trigger-attack`, {
        method: 'POST',
        headers: { 'x-admin-key': ADMIN_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackId: 'patch-management' }) // 'patch-management', 'email-filter', etc.
    });

    if (res.status === 404) {
        console.log('⚠️ Note: You need to add a /admin/trigger-attack endpoint if you want instant manual triggers! Otherwise, wait 2 minutes for the scheduler.');
    } else {
        console.log(await res.json());
    }

    console.log('\n✅ Script complete.');
}

run();
