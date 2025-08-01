// Build-safe NextAuth configuration
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/lib/services/auth-service-factory";
import { env, isBuildTime } from "@/lib/env";
import { config } from "@/lib/config/app-mode";

// Generate a secure secret if not provided
function getNextAuthSecret(): string {
  const secret = env.NEXTAUTH_SECRET;

  if (
    !secret ||
    secret === "your-secret-key-here" ||
    secret === "your-super-secret-key-here-generate-a-new-one" ||
    secret === "dev-secret-key"
  ) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET must be set to a secure value in production!");
    }

    // Generate a random secret for development
    console.warn("⚠️  Using generated NEXTAUTH_SECRET for development. Set a proper secret in production!");
    return crypto.randomUUID() + crypto.randomUUID() + Date.now().toString();
  }

  return secret;
}

// Firebase adapter - only load when needed
const getFirebaseAdapter = async () => {
  if (config.isMockMode || isBuildTime) {
    return undefined;
  }

  try {
    const { FirestoreAdapter } = await import("@auth/firebase-adapter");
    const { getFirebaseAdminDb } = await import("@/lib/firebase/admin");

    const db = getFirebaseAdminDb();
    if (!db) {
      console.log("🔥 Firebase Admin DB not available, skipping adapter");
      return undefined;
    }

    console.log("🔥 Using Firebase Firestore Adapter");
    return FirestoreAdapter(db);
  } catch (error) {
    console.error("Failed to load Firebase adapter:", error);
    return undefined;
  }
};

export const authConfig: NextAuthConfig = {
  // Use Firebase adapter only in Firebase mode
  adapter: config.isFirebaseMode && !isBuildTime ? await getFirebaseAdapter() : undefined,

  providers: [
    // Google OAuth Provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && !isBuildTime
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
              }
            }
          })
        ]
      : []),

    // Credentials provider (works in both modes)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (isBuildTime || !credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log(`🔐 Attempting to authenticate: ${credentials.email}`);

          const user = await authService.validateCredentials(
            credentials.email as string,
            credentials.password as string
          );

          if (user) {
            console.log(`✅ Authentication successful for: ${user.email}`);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: user.emailVerified,
              role: user.role
            };
          }

          console.log(`❌ Authentication failed for: ${credentials.email}`);
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],

  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/auth/error"
  },

  callbacks: {
    async session({ session, token, user }) {
      if (isBuildTime) return session;

      // For OAuth users, get additional data from database
      if (user && !token.fromCredentials) {
        const dbUser = await authService.getUserByEmail(session.user?.email!);
        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser.id,
            role: dbUser.role,
            emailVerified: dbUser.emailVerified
          };
        }
      }

      // For credentials users, use token data
      if (token.fromCredentials) {
        session.user = {
          ...session.user,
          id: token.sub,
          role: token.role,
          emailVerified: token.emailVerified
        };
      }

      // Add mode info to session
      return {
        ...session,
        mode: config.mode
      };
    },

    async jwt({ token, user, account }) {
      if (isBuildTime) return token;

      // For credentials login
      if (user && account?.provider === "credentials") {
        token.sub = user.id;
        token.role = (user as any).role;
        token.emailVerified = (user as any).emailVerified;
        token.fromCredentials = true;
      }

      // For OAuth login, get user data from database
      if (user && account?.provider !== "credentials") {
        const dbUser = await authService.getUserByEmail(user.email!);
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified;
        } else {
          // New OAuth user - they'll be created in signIn callback
          token.role = "user";
          token.emailVerified = true; // OAuth users are pre-verified
        }
        token.fromCredentials = false;
      }

      return token;
    },

    async signIn({ user, account, profile }) {
      if (isBuildTime) return true;

      // For OAuth providers, create user in our database if they don't exist
      if (account?.provider !== "credentials" && user.email) {
        try {
          const existingUser = await authService.getUserByEmail(user.email);

          if (!existingUser) {
            console.log(`🔥 Creating new OAuth user: ${user.email}`);
            const newUser = await authService.createUser(
              user.email,
              crypto.randomUUID(), // Random password for OAuth users
              user.name || undefined
            );

            // Verify email for OAuth users (they're pre-verified)
            await authService.verifyUserEmail(user.email);

            console.log(`✅ Created and verified OAuth user: ${user.email}`);
          } else {
            console.log(`✅ Existing OAuth user signing in: ${user.email}`);
          }
        } catch (error) {
          console.error("Error handling OAuth sign in:", error);
          return false;
        }
      }

      return true;
    }
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  secret: getNextAuthSecret(),

  debug: process.env.NODE_ENV === "development"
};
