import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadServiceAccount() {
  const primary = path.join(__dirname, 'firebase-admin.json');
  if (fs.existsSync(primary)) {
    return JSON.parse(fs.readFileSync(primary, 'utf8'));
  }

  // Fallback: look for other JSON files in this folder that resemble a service account
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const candidate = path.join(__dirname, f);
    try {
      const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
      if (parsed && (parsed.type === 'service_account' || parsed.client_email)) {
        return parsed;
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  throw new Error('No Firebase service account JSON found in config/');
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export { db };
