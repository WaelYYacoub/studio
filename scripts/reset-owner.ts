/**
 * Reset Firestore bootstrap so you can create a new first owner.
 * This script will DELETE ALL AUTHENTICATION ACCOUNTS and all user documents from Firestore.
 * Run with:  npx tsx scripts/reset-owner.ts
 */
import 'dotenv/config'; // Make sure to load .env variables

import { initializeApp, getApps, deleteApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';
import {credential} from 'firebase-admin';

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in your .env.local file. Please create a service account in Firebase and add the JSON key to your environment variables.");
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const app = getApps().length ? getApps()[0] : initializeApp({
  credential: credential.cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

async function deleteAllUsers(nextPageToken?: string) {
  const listUsersResult = await auth.listUsers(1000, nextPageToken);

  if (listUsersResult.users.length > 0) {
    const deleteUsersResult = await auth.deleteUsers(listUsersResult.users.map(u => u.uid));
    console.log(`Successfully deleted ${deleteUsersResult.successCount} authentication users.`);
    console.log(`Failed to delete ${deleteUsersResult.failureCount} authentication users.`);
    deleteUsersResult.errors.forEach(function(error) {
      console.log('Error deleting user:', error.error.toJSON());
    });
  } else {
    console.log("No authentication users to delete.");
  }

  if (listUsersResult.pageToken) {
    await deleteAllUsers(listUsersResult.pageToken);
  }
}

async function resetOwner() {
  console.log("Starting reset process...");
  
  // 1. Delete all Firebase Auth users
  console.log("Deleting all authentication accounts...");
  await deleteAllUsers();
  console.log("✅ All authentication accounts deleted.");

  // 2. Delete all user docs in Firestore
  console.log("Deleting all Firestore user documents...");
  const usersCol = db.collection("users");
  const userDocs = await usersCol.get();
  if (userDocs.empty) {
      console.log("No Firestore user documents to delete.")
  } else {
      const batch = db.batch();
      userDocs.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${userDocs.size} Firestore user documents.`);
  }

  // 3. Delete config doc to allow a new owner to be set
  console.log("Deleting app/config document to reset owner flag...");
  const configRef = db.doc("app/config");
  await configRef.delete().catch(() => {}); // Ignore errors if it doesn't exist
  console.log("✅ Deleted app/config doc.");

  console.log("\n✅ Reset complete. The next user to sign up will become the owner.");
}

resetOwner().catch((err) => {
  console.error("\n❌ Reset failed:", err.message);
  process.exit(1);
}).finally(() => {
    if (app) {
        deleteApp(app);
    }
});
