/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Vite replaces `import.meta.env.VITE_***` with the actual string value during build.
// We use `import.meta.env && ...` to prevent crashes if import.meta.env is undefined in the runtime.
const firebaseConfig = {
  apiKey: import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env && import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env && import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let dbInstance;

// Check if configuration is present (apiKey will be replaced by string or undefined)
if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export const db = dbInstance;