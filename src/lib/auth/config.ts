// Build-safe NextAuth configuration
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/lib/services/auth-service-factory";
import { env, isBuildTime } from "@/lib/env";
import { config } from "@/lib/config/app-mode";

// Only import Firebase adapter when actually needed
const getFirebaseAdapter = async () => {
  if (config.isMockMode || isBuildTime) {
    return undefined;
  }

  try {
    const { FirestoreAdapter } = await import("@auth/firebase-adapter");
    const { getFirebaseAdminDb } = await import("@/lib/firebase/admin");

    const db = getFirebaseAdminDb();
    return db ? FirestoreAdapter(db) : undefined;
  } catch (error) {
    console.error("Failed to load Firebase adapter:", error);
    return undefined;
  }
};

export const authConfig: NextAuthConfig = {
  // No adapter in mock mode
  adapter: undefined,

  providers: [
    // Google OAuth (only in Firebase mode)
    ...(config.isFirebaseMode && env.NEXT_PUBLIC_FIREBASE_API_KEY && !isBuildTime
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
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
          const user = await authService.validateCredentials(
            credentials.email as string,
            credentials.password as string
          );

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: user.emailVerified,
              role: user.role // Include role in the user object
            };
          }

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
    async session({ session, token }) {
      if (isBuildTime) return session;

      // Add mode info and role to session
      return {
        ...session,
        mode: config.mode,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role // Include role in session
        }
      };
    },

    async jwt({ token, user }) {
      if (isBuildTime) return token;

      if (user) {
        token.sub = user.id;
        token.role = (user as any).role; // Store role in token
      }

      return token;
    }
  },

  session: {
    strategy: "jwt"
  },

  secret: env.NEXTAUTH_SECRET || "dev-secret-key"
};
