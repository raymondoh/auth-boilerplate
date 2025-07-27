// Complete Firebase authentication operations
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
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Hash password for credentials auth
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in Firebase Auth
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: false
      });

      console.log(`🔥 Firebase: Created auth user ${userRecord.uid}`);

      // Store additional user data in Firestore
      const userData = {
        email,
        name: displayName || null,
        hashedPassword, // Store for credentials auth
        emailVerified: false,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await adminDb.collection("users").doc(userRecord.uid).set(userData);

      console.log(`🔥 Firebase: Created Firestore user document`);

      return {
        id: userRecord.uid,
        email: userRecord.email!,
        name: displayName || null,
        emailVerified: false,
        role: "user"
      };
    } catch (error: any) {
      console.error("Firebase createUser error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/email-already-exists") {
        throw new Error("User already exists");
      }
      if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address");
      }
      if (error.code === "auth/weak-password") {
        throw new Error("Password is too weak");
      }

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

      if (userQuery.empty) {
        console.log(`🔥 Firebase: User not found: ${email}`);
        return null;
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.hashedPassword);

      if (!isValidPassword) {
        console.log(`🔥 Firebase: Invalid password for: ${email}`);
        return null;
      }

      // Update last login
      await adminDb.collection("users").doc(userDoc.id).update({
        lastLoginAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`🔥 Firebase: Authenticated user: ${email}`);

      return {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified,
        role: userData.role || "user"
      };
    } catch (error) {
      console.error("Firebase validateCredentials error:", error);
      return null;
    }
  }

  async getUserById(id: string) {
    if (isBuildTime) return null;

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) return null;

    try {
      const doc = await adminDb.collection("users").doc(id).get();
      if (!doc.exists) {
        console.log(`🔥 Firebase: User not found by ID: ${id}`);
        return null;
      }

      const data = doc.data()!;
      return {
        id: doc.id,
        email: data.email,
        name: data.name || null,
        emailVerified: data.emailVerified || false,
        role: data.role || "user",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate()
      };
    } catch (error) {
      console.error("Firebase getUserById error:", error);
      return null;
    }
  }

  async getUserByEmail(email: string) {
    if (isBuildTime) return null;

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) return null;

    try {
      const query = await adminDb.collection("users").where("email", "==", email).limit(1).get();
      if (query.empty) return null;

      const doc = query.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        email: data.email,
        name: data.name || null,
        emailVerified: data.emailVerified || false,
        role: data.role || "user",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate()
      };
    } catch (error) {
      console.error("Firebase getUserByEmail error:", error);
      return null;
    }
  }

  async getAllUsers() {
    if (isBuildTime) return [];

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) return [];

    try {
      const query = await adminDb.collection("users").orderBy("createdAt", "desc").get();
      return query.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          name: data.name || null,
          emailVerified: data.emailVerified || false,
          role: data.role || "user",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        };
      });
    } catch (error) {
      console.error("Firebase getAllUsers error:", error);
      return [];
    }
  }

  async updateUser(id: string, updates: any) {
    if (isBuildTime) return null;

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) return null;

    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await adminDb.collection("users").doc(id).update(updateData);
      console.log(`🔥 Firebase: Updated user ${id}`);

      return this.getUserById(id);
    } catch (error) {
      console.error("Firebase updateUser error:", error);
      return null;
    }
  }

  async verifyUserEmail(email: string): Promise<boolean> {
    if (isBuildTime) return false;

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) return false;

    try {
      // Find user by email
      const query = await adminDb.collection("users").where("email", "==", email).limit(1).get();
      if (query.empty) {
        console.log(`🔥 Firebase: User not found for email verification: ${email}`);
        return false;
      }

      const userDoc = query.docs[0];

      // Update email verification status
      await adminDb.collection("users").doc(userDoc.id).update({
        emailVerified: true,
        updatedAt: new Date()
      });

      console.log(`🔥 Firebase: Email verified for: ${email}`);
      return true;
    } catch (error) {
      console.error("Firebase verifyUserEmail error:", error);
      return false;
    }
  }

  async updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    if (isBuildTime) return false;

    const adminAuth = getFirebaseAdminAuth();
    const adminDb = getFirebaseAdminDb();
    if (!adminAuth || !adminDb) return false;

    try {
      // Find user by email
      const query = await adminDb.collection("users").where("email", "==", email).limit(1).get();
      if (query.empty) {
        console.log(`🔥 Firebase: User not found for password update: ${email}`);
        return false;
      }

      const userDoc = query.docs[0];
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password in Firebase Auth
      await adminAuth.updateUser(userDoc.id, {
        password: newPassword
      });

      // Update hashed password in Firestore
      await adminDb.collection("users").doc(userDoc.id).update({
        hashedPassword,
        updatedAt: new Date()
      });

      console.log(`🔥 Firebase: Password updated for: ${email}`);
      return true;
    } catch (error) {
      console.error("Firebase updateUserPassword error:", error);
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    if (isBuildTime) return false;

    const adminAuth = getFirebaseAdminAuth();
    const adminDb = getFirebaseAdminDb();
    if (!adminAuth || !adminDb) return false;

    try {
      // Delete from Firebase Auth
      await adminAuth.deleteUser(id);

      // Delete from Firestore
      await adminDb.collection("users").doc(id).delete();

      console.log(`🔥 Firebase: Deleted user ${id}`);
      return true;
    } catch (error) {
      console.error("Firebase deleteUser error:", error);
      return false;
    }
  }
}

export const firebaseAuthService = FirebaseAuthService.getInstance();
