import { db } from "../config/firebase.js";

async function deleteCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

async function resetGame() {
  console.log("Clearing attacks...");
  await deleteCollection("attacks");

  console.log("Clearing teams...");
  await deleteCollection("teams");

  console.log("Resetting gameState...");
  await db.collection("gameState").doc("main").set({
    status: "waiting",
    currentAttackId: null,
    nextAttackAt: null,
    leaderboardFrozen: false,
    startedAt: null
  });

  console.log("✅ Game reset complete.");
  process.exit();
}

resetGame();