// Firebase authentication operations
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "./admin";
import { isBuildTime } from "@/lib/env";
import bcrypt from "bcryptjs";

export class FirebaseAuthService {
  private static instance: FirebaseAuthService | null = null;

  static getInstance() {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  async createUser(email: string, password: string, displayName?: string) {
    if (isBuildTime) {
      throw new Error("Firebase Auth service not available during build");
    }

    const adminAuth = getFirebaseAdminAuth();
    const adminDb = getFirebaseAdminDb();

    if (!adminAuth || !adminDb) {
      throw new Error("Firebase Admin not initialized");
    }

    try {
      // Hash password for credentials auth
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
          name: displayName || null,
          hashedPassword, // Store for credentials auth
          emailVerified: false,
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date()
        });

      return {
        id: userRecord.uid,
        email: userRecord.email!,
        name: displayName || null,
        emailVerified: false
      };
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

      // Update last login
      await adminDb.collection("users").doc(userQuery.docs[0].id).update({
        lastLoginAt: new Date(),
        updatedAt: new Date()
      });

      return {
        id: userQuery.docs[0].id,
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified
      };
    } catch (error) {
      console.error("Error validating credentials:", error);
      return null;
    }
  }
}

export const firebaseAuthService = FirebaseAuthService.getInstance();
