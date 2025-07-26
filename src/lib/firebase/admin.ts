// Build-safe Firebase Admin initialization
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env, isBuildTime, isServer } from "@/lib/env";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

// Build-safe admin initialization
function initializeFirebaseAdmin() {
  if (isBuildTime || !isServer) {
    console.log("Skipping Firebase Admin initialization");
    return { app: null, auth: null, db: null };
  }

  try {
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY
        }),
        projectId: env.FIREBASE_PROJECT_ID
      });
    } else {
      adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

    return { app: adminApp, auth: adminAuth, db: adminDb };
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    return { app: null, auth: null, db: null };
  }
}

// Export with lazy initialization
export const getFirebaseAdminAuth = () => {
  if (!adminAuth && !isBuildTime && isServer) {
    initializeFirebaseAdmin();
  }
  return adminAuth;
};

export const getFirebaseAdminDb = () => {
  if (!adminDb && !isBuildTime && isServer) {
    initializeFirebaseAdmin();
  }
  return adminDb;
};
