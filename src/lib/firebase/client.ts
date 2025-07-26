// Build-safe Firebase client initialization
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { env, isBuildTime } from "@/lib/env";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Build-safe Firebase config
function getFirebaseConfig() {
  if (isBuildTime) {
    // Return minimal config for build time
    return {
      apiKey: "build-placeholder",
      authDomain: "build-placeholder",
      projectId: "build-placeholder"
    };
  }

  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: `${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
}

// Initialize Firebase (build-safe)
export function initializeFirebase() {
  if (isBuildTime) {
    console.log("Skipping Firebase initialization during build");
    return { app: null, auth: null, db: null };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(getFirebaseConfig());
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);

    return { app, auth, db };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return { app: null, auth: null, db: null };
  }
}

// Export instances (lazy initialization)
export const getFirebaseAuth = () => {
  if (!auth && !isBuildTime) {
    initializeFirebase();
  }
  return auth;
};

export const getFirebaseDb = () => {
  if (!db && !isBuildTime) {
    initializeFirebase();
  }
  return db;
};
