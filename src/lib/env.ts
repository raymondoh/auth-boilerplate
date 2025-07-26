// Environment variable validation and build-safe access
import { z } from "zod";

const envSchema = z.object({
  // Build-time safe variables (NEXT_PUBLIC_*)
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Auth Boilerplate"),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),

  // Runtime-only variables (server-side)
  NEXTAUTH_SECRET: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional()
});

// Build-safe environment access
function getEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    // During build, some variables might not be available
    console.warn("Environment validation failed, using defaults for build");
    return envSchema.parse({
      NEXT_PUBLIC_APP_NAME: "Auth Boilerplate",
      ...process.env
    });
  }
}

export const env = getEnv();

// Build-safe checks
export const isBuildTime = process.env.NODE_ENV === undefined || process.env.NEXT_PHASE === "phase-production-build";
export const isServer = typeof window === "undefined";
