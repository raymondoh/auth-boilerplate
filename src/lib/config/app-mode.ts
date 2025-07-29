// Updated app mode detection with better logging
import { env } from "@/lib/env";

export type AppMode = "mock" | "firebase" | "hybrid";

export function getAppMode(): AppMode {
  console.log(`🔧 getAppMode: Starting mode detection`);

  // First check explicit environment preference
  const preferredMode = process.env.NEXT_PUBLIC_APP_MODE as AppMode;
  console.log(`🔧 NEXT_PUBLIC_APP_MODE: ${preferredMode}`);

  if (preferredMode === "mock") {
    console.log("🔧 Explicitly set to mock mode");
    return "mock";
  }

  // Check if Firebase is fully configured
  const firebaseEnvVars = {
    apiKey: !!env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: !!env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: !!env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    serverProjectId: !!env.FIREBASE_PROJECT_ID,
    clientEmail: !!env.FIREBASE_CLIENT_EMAIL,
    privateKey: !!env.FIREBASE_PRIVATE_KEY
  };

  const hasFirebaseConfig = Object.values(firebaseEnvVars).every(Boolean);

  console.log(`🔧 Firebase config available: ${hasFirebaseConfig}`);
  console.log(`🔧 Firebase env vars:`, firebaseEnvVars);

  if (preferredMode === "firebase") {
    if (hasFirebaseConfig) {
      console.log("🔧 Using Firebase mode (explicitly requested and configured)");
      return "firebase";
    } else {
      console.log("🔧 Firebase mode requested but not fully configured, falling back to mock");
      return "mock";
    }
  }

  if (hasFirebaseConfig) {
    console.log("🔧 Using Firebase mode (auto-detected)");
    return "firebase";
  }

  console.log("🔧 Defaulting to mock mode");
  return "mock";
}

export const APP_MODE = getAppMode();

export const config = {
  mode: APP_MODE,
  isFirebaseMode: APP_MODE === "firebase",
  isMockMode: APP_MODE === "mock",
  isHybridMode: APP_MODE === "hybrid"
};

console.log(`🔧 Final app mode: ${config.mode}`);
