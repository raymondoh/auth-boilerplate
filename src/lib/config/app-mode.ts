// App mode detection and configuration
import { env } from "@/lib/env";

export type AppMode = "mock" | "firebase" | "hybrid";

export function getAppMode(): AppMode {
  // Check if Firebase is fully configured
  const hasFirebaseConfig = !!(
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY
  );

  // Check environment preference
  const preferredMode = process.env.NEXT_PUBLIC_APP_MODE as AppMode;

  if (preferredMode === "mock") return "mock";
  if (preferredMode === "firebase" && hasFirebaseConfig) return "firebase";
  if (hasFirebaseConfig) return "firebase";

  return "mock"; // Default to mock mode
}

export const APP_MODE = getAppMode();

export const config = {
  mode: APP_MODE,
  isFirebaseMode: APP_MODE === "firebase",
  isMockMode: APP_MODE === "mock",
  isHybridMode: APP_MODE === "hybrid"
};
