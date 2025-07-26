// Firebase user operations
import { getServerCollections } from "./collections";
import { isBuildTime } from "@/lib/env";

export interface FirebaseUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class FirebaseUserService {
  private static instance: FirebaseUserService | null = null;

  static getInstance() {
    if (!FirebaseUserService.instance) {
      FirebaseUserService.instance = new FirebaseUserService();
    }
    return FirebaseUserService.instance;
  }

  async getUser(userId: string): Promise<FirebaseUser | null> {
    if (isBuildTime) return null;

    const collections = getServerCollections();
    if (!collections) return null;

    try {
      const doc = await collections.users.doc(userId).get();
      if (!doc.exists) return null;

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
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    if (isBuildTime) return null;

    const collections = getServerCollections();
    if (!collections) return null;

    try {
      const query = await collections.users.where("email", "==", email).limit(1).get();
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
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate()
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<FirebaseUser>): Promise<FirebaseUser | null> {
    if (isBuildTime) return null;

    const collections = getServerCollections();
    if (!collections) return null;

    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await collections.users.doc(userId).update(updateData);
      return this.getUser(userId);
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (isBuildTime) return false;

    const collections = getServerCollections();
    if (!collections) return false;

    try {
      await collections.users.doc(userId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async getAllUsers(): Promise<FirebaseUser[]> {
    if (isBuildTime) return [];

    const collections = getServerCollections();
    if (!collections) return [];

    try {
      const query = await collections.users.orderBy("createdAt", "desc").get();
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
      console.error("Error getting all users:", error);
      return [];
    }
  }
}

export const firebaseUserService = FirebaseUserService.getInstance();
