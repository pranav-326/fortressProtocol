# 🚀 Cyber Defense Game — Backend Bootstrap Prompt (for GitHub Copilot)

The goal is to scaffold a clean Node.js + Express backend connected to Firebase Firestore using the Firebase Admin SDK.

---

## 🎯 Objective

Create a production-ready backend service that:

- Uses Node.js + Express
- Connects securely to Firebase Firestore
- Uses ES modules
- Prevents duplicate Firebase initialization
- Exposes a health check endpoint
- Follows clean project structure

---

## 📁 Required Project Structure

```
cyber-defense-game/
└── server/
    ├── config/
    │   ├── firebase-admin.json   // service account (already provided)
    │   └── firebase.js           // initialize admin SDK
    ├── .env
    ├── index.js
    └── package.json
```

---

## ⚙️ Dependencies to Install

Install the following packages:

- express
- cors
- dotenv
- firebase-admin

Dev command should be available via npm scripts.

---

## 🔐 Environment File

Create `.env` with:

```
NODE_ENV=development
PORT=5000
```

---

## 🔥 Firebase Admin Initialization (config/firebase.js)

Requirements:

- Use ES module syntax
- Read service account JSON from `config/firebase-admin.json`
- Initialize Firebase only once (singleton pattern)
- Export Firestore instance as `db`

Behavior expectations:

- Must not throw "app already initialized"
- Must work in local development

---

## 🌐 Express Server (index.js)

Server requirements:

- Use Express
- Enable CORS
- Parse JSON
- Load dotenv
- Import Firestore from firebase config
- Run on port from env (default 5000)

### Health Route

Create endpoint:

```
GET /health
```

Behavior:

- Perform a lightweight Firestore read
- On success return:

```
{ "status": "Backend + Firestore connected ✅" }
```

- On failure return HTTP 500

---

## 📦 package.json Requirements

Must include:

- `"type": "module"`
- script:

```
"dev": "node index.js"
```

---

## 🧪 Success Criteria

When running:

```
npm run dev
```

Expected console output:

```
🚀 Server running on port 5000
```

When opening:

```
http://localhost:5000/health
```

Expected JSON response:

```
{ "status": "Backend + Firestore connected ✅" }
```

---

## 🚫 Important Constraints

- Do NOT use Firebase client SDK in backend
- Must use firebase-admin only
- Do NOT hardcode credentials
- Must follow singleton initialization pattern
- Code should be clean and minimal

---

## 🔮 Next Phase (Do NOT implement yet)

These will come later:

- Team model
- Game state engine
- Attack scheduler
- Defense purchase APIs

For now, focus ONLY on clean backend bootstrap.

---

**End of pr