import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Safely access environment variables, casting import.meta to any to avoid type errors
// if vite/client types are missing or unresolved.
const env = (import.meta as any).env || {};

// Vite replaces `import.meta.env.VITE_***` with the actual string value during build.
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let app;
let dbInstance;

// Check if configuration is present
if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export const db = dbInstance;