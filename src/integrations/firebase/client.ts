import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  throw new Error(
    "Missing Firebase environment variables. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, and VITE_FIREBASE_APP_ID.",
  );
}

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const app = getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function attachFirebaseAuthHeader(headers = new Headers()) {
  const currentUser = auth.currentUser;
  if (!currentUser) return headers;
  const token = await currentUser.getIdToken();
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function firebaseFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = await attachFirebaseAuthHeader(new Headers(init.headers));
  const response = await fetch(input, { ...init, headers });

  if (response.status === 403) {
    let errorMessage = "Access forbidden.";
    try {
      const body = await response.json();
      if (body?.error) {
        errorMessage = body.error;
      }
    } catch {
      const text = await response.text();
      if (text) errorMessage = text;
    }

    const error = new Error(errorMessage);
    Object.assign(error, { status: 403 });
    throw error;
  }

  return response;
}
