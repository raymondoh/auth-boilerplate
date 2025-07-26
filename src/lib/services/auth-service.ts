// Build-safe authentication service layer
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase/admin";
import { isBuildTime } from "@/lib/env";
import bcrypt from "bcryptjs";

export class AuthService {
  private static instance: AuthService | null = null;

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async createUser(email: string, password: string, displayName?: string) {
    if (isBuildTime) {
      throw new Error("Auth service not available during build");
    }

    const adminAuth = getFirebaseAdminAuth();
    const adminDb = getFirebaseAdminDb();

    if (!adminAuth || !adminDb) {
      throw new Error("Firebase Admin not initialized");
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in Firebase Auth
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: false
      });

      // Store additional user data in Firestore
      await adminDb
        .collection("users")
        .doc(userRecord.uid)
        .set({
          email,
          displayName: displayName || null,
          hashedPassword, // Store for credentials auth
          createdAt: new Date(),
          emailVerified: false,
          role: "user"
        });

      return userRecord;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async validateCredentials(email: string, password: string) {
    if (isBuildTime) return null;

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) return null;

    try {
      // Get user from Firestore
      const userQuery = await adminDb.collection("users").where("email", "==", email).limit(1).get();

      if (userQuery.empty) return null;

      const userData = userQuery.docs[0].data();
      const isValidPassword = await bcrypt.compare(password, userData.hashedPassword);

      if (!isValidPassword) return null;

      return {
        id: userQuery.docs[0].id,
        email: userData.email,
        name: userData.displayName,
        emailVerified: userData.emailVerified
      };
    } catch (error) {
      console.error("Error validating credentials:", error);
      return null;
    }
  }
}
