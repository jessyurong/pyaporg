import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function normalizeFirebasePrivateKey(key: string): string {
  let normalized = key.trim();

  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  normalized = normalized.replace(/\\n/g, "\n");
  normalized = normalized.trim();

  return normalized;
}

function ensureAdminInitialized() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  if (!getApps().length) {
    privateKey = normalizeFirebasePrivateKey(privateKey);

    const preview = `${privateKey.slice(0, 30)}...${privateKey.slice(-30)}`;
    console.log(
      "Firebase private key preview:",
      "length=", privateKey.length,
      "start=", preview.slice(0, 30),
      "end=", preview.slice(-30),
    );

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export function getAdminFirestore() {
  const admin = ensureAdminInitialized();
  if (!admin) {
    throw new Error(
      "Firebase Admin SDK not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to enable server-side Firestore access.",
    );
  }
  return admin.db;
}

export async function verifyFirebaseIdToken(idToken: string) {
  const admin = ensureAdminInitialized();
  if (!admin) {
    throw new Error(
      "Firebase Admin SDK not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to enable server-side token verification.",
    );
  }

  return admin.auth.verifyIdToken(idToken);
}

export async function getUserProfileStatus(userId) {
  const db = getAdminFirestore();
  const docRef = db.doc(`profiles/${userId}`);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  const data = docSnap.data();
  return data?.status ?? null;
}
