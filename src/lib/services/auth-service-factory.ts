// Rewritten service factory with direct Firebase initialization
import { mockAuthService } from "./mock-auth-service";
import { config } from "@/lib/config/app-mode";
import { isBuildTime, env } from "@/lib/env";
import { DEFAULT_ROLE } from "@/lib/auth/roles";
import * as admin from "firebase-admin";
import * as bcrypt from "bcryptjs";

export interface IAuthService {
  createUser(email: string, password: string, displayName?: string, role?: string): Promise<any>;
  validateCredentials(email: string, password: string): Promise<any>;
  getUserById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getAllUsers(): Promise<any[]>;
  updateUser(id: string, updates: any): Promise<any>;
  deleteUser(id: string): Promise<boolean>;
  verifyUserEmail(email: string): Promise<boolean>;
  updateUserPassword(email: string, newPassword: string): Promise<boolean>;
  promoteToAdmin(userId: string): Promise<boolean>;
  getUserCount(): Promise<number>;
}

class AuthServiceFactory {
  private static instance: IAuthService | null = null;

  static getInstance(): IAuthService {
    if (!AuthServiceFactory.instance) {
      console.log(`🔧 AuthServiceFactory: Creating service instance`);
      console.log(`🔧 Config mode: ${config.mode}`);
      console.log(`🔧 Is build time: ${isBuildTime}`);
      console.log(`🔧 Is mock mode: ${config.isMockMode}`);

      // Always use mock service during build time
      if (isBuildTime) {
        console.log("🔧 Build time detected, using mock service");
        AuthServiceFactory.instance = mockAuthService as IAuthService;
        return AuthServiceFactory.instance;
      }

      // Use mock service if explicitly configured
      if (config.isMockMode) {
        console.log("🔥 Using Mock Auth Service (configured mode)");
        AuthServiceFactory.instance = mockAuthService as IAuthService;
        return AuthServiceFactory.instance;
      }

      // Try Firebase service
      console.log("🔥 Attempting to create Firebase Auth Service");

      try {
        // Create Firebase service with direct initialization
        const firebaseService = AuthServiceFactory.createFirebaseServiceDirect();

        if (firebaseService) {
          console.log("✅ Firebase Auth Service created successfully");
          AuthServiceFactory.instance = firebaseService;
          return AuthServiceFactory.instance;
        } else {
          throw new Error("Firebase service creation returned null");
        }
      } catch (error) {
        console.error("❌ Failed to create Firebase Auth Service:", error);
        console.log("🔄 Falling back to Mock Auth Service");
        AuthServiceFactory.instance = mockAuthService as IAuthService;
      }
    }
    return AuthServiceFactory.instance;
  }

  private static createFirebaseServiceDirect(): IAuthService | null {
    try {
      console.log("🔥 Creating Firebase service with direct initialization...");

      // Initialize Firebase Admin if not already initialized
      let app: any = null;

      try {
        if (!admin.apps.length) {
          console.log("🔥 Initializing Firebase Admin SDK...");

          // Validate environment variables
          if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
            console.error("❌ Missing Firebase environment variables");
            console.log("Required vars:", {
              projectId: !!env.FIREBASE_PROJECT_ID,
              clientEmail: !!env.FIREBASE_CLIENT_EMAIL,
              privateKey: !!env.FIREBASE_PRIVATE_KEY
            });
            return null;
          }

          app = admin.initializeApp({
            credential: admin.credential.cert({
              projectId: env.FIREBASE_PROJECT_ID,
              clientEmail: env.FIREBASE_CLIENT_EMAIL,
              privateKey: env.FIREBASE_PRIVATE_KEY
            }),
            projectId: env.FIREBASE_PROJECT_ID
          });

          console.log("✅ Firebase Admin SDK initialized successfully");
        } else {
          app = admin.apps[0];
          console.log("✅ Using existing Firebase Admin SDK instance");
        }
      } catch (initError) {
        console.error("❌ Firebase Admin SDK initialization failed:", initError);
        return null;
      }

      // Get Firebase services
      let adminAuth: any = null;
      let adminDb: any = null;

      try {
        adminAuth = admin.auth(app);
        adminDb = admin.firestore(app);
        console.log("✅ Firebase Auth and Firestore services obtained");
      } catch (serviceError) {
        console.error("❌ Failed to get Firebase services:", serviceError);
        return null;
      }

      // Test the connection
      const testConnection = async () => {
        try {
          await adminAuth.listUsers(1);
          console.log("✅ Firebase Auth connection test successful");
        } catch (testError) {
          console.error("❌ Firebase Auth connection test failed:", testError);
          return null;
        }
      };

      if (!testConnection()) {
        return null;
      }

      // Create Firebase service implementation
      const firebaseService: IAuthService = {
        async getUserCount(): Promise<number> {
          try {
            const query = await adminDb.collection("users").get();
            return query.size;
          } catch (error) {
            console.error("Firebase getUserCount error:", error);
            return 0;
          }
        },

        async createUser(email: string, password: string, displayName?: string, role?: string) {
          console.log(`🔥 Firebase: Creating user ${email} with role ${role}`);

          try {
            // Check if user already exists
            const query = await adminDb.collection("users").where("email", "==", email).limit(1).get();
            if (!query.empty) {
              throw new Error("User already exists");
            }

            // Check if this is the first user
            const userCount = await firebaseService.getUserCount();
            const finalRole = userCount === 0 ? "admin" : role || DEFAULT_ROLE;

            if (userCount === 0) {
              console.log("🎉 First user detected - assigning admin role!");
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
              hashedPassword,
              emailVerified: false,
              role: finalRole,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await adminDb.collection("users").doc(userRecord.uid).set(userData);

            console.log(`🔥 Firebase: Created Firestore user document with role ${finalRole}`);

            return {
              id: userRecord.uid,
              email: userRecord.email!,
              name: displayName || null,
              emailVerified: false,
              role: finalRole
            };
          } catch (error: any) {
            console.error("Firebase createUser error:", error);

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
        },

        async promoteToAdmin(userId: string): Promise<boolean> {
          try {
            await adminDb.collection("users").doc(userId).update({
              role: "admin",
              updatedAt: new Date()
            });

            console.log(`🔥 Firebase: Promoted user ${userId} to admin`);
            return true;
          } catch (error) {
            console.error("Firebase promoteToAdmin error:", error);
            return false;
          }
        },

        async validateCredentials(email: string, password: string) {
          console.log(`🔥 Firebase: Validating credentials for ${email}`);

          try {
            const userQuery = await adminDb.collection("users").where("email", "==", email).limit(1).get();

            if (userQuery.empty) {
              console.log(`🔥 Firebase: User not found: ${email}`);
              return null;
            }

            const userDoc = userQuery.docs[0];
            const userData = userDoc.data();

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
              name: userData.name || null,
              emailVerified: userData.emailVerified || false,
              role: userData.role || DEFAULT_ROLE
            };
          } catch (error) {
            console.error("Firebase validateCredentials error:", error);
            return null;
          }
        },

        async getUserById(id: string) {
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
              role: data.role || DEFAULT_ROLE,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              lastLoginAt: data.lastLoginAt?.toDate()
            };
          } catch (error) {
            console.error("Firebase getUserById error:", error);
            return null;
          }
        },

        async getUserByEmail(email: string) {
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
              role: data.role || DEFAULT_ROLE,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate(),
              lastLoginAt: data.lastLoginAt?.toDate()
            };
          } catch (error) {
            console.error("Firebase getUserByEmail error:", error);
            return null;
          }
        },

        async getAllUsers() {
          try {
            const query = await adminDb.collection("users").orderBy("createdAt", "desc").get();
            return query.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                email: data.email,
                name: data.name || null,
                emailVerified: data.emailVerified || false,
                role: data.role || DEFAULT_ROLE,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                lastLoginAt: data.lastLoginAt?.toDate()
              };
            });
          } catch (error) {
            console.error("Firebase getAllUsers error:", error);
            return [];
          }
        },

        async updateUser(id: string, updates: any) {
          try {
            const updateData = {
              ...updates,
              updatedAt: new Date()
            };

            await adminDb.collection("users").doc(id).update(updateData);
            console.log(`🔥 Firebase: Updated user ${id}`);

            return firebaseService.getUserById(id);
          } catch (error) {
            console.error("Firebase updateUser error:", error);
            return null;
          }
        },

        async verifyUserEmail(email: string): Promise<boolean> {
          try {
            const query = await adminDb.collection("users").where("email", "==", email).limit(1).get();
            if (query.empty) {
              console.log(`🔥 Firebase: User not found for email verification: ${email}`);
              return false;
            }

            const userDoc = query.docs[0];

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
        },

        async updateUserPassword(email: string, newPassword: string): Promise<boolean> {
          try {
            const query = await adminDb.collection("users").where("email", "==", email).limit(1).get();
            if (query.empty) {
              console.log(`🔥 Firebase: User not found for password update: ${email}`);
              return false;
            }

            const userDoc = query.docs[0];
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            await adminAuth.updateUser(userDoc.id, {
              password: newPassword
            });

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
        },

        async deleteUser(id: string): Promise<boolean> {
          try {
            await adminAuth.deleteUser(id);
            await adminDb.collection("users").doc(id).delete();

            console.log(`🔥 Firebase: Deleted user ${id}`);
            return true;
          } catch (error) {
            console.error("Firebase deleteUser error:", error);
            return false;
          }
        }
      };

      return firebaseService;
    } catch (error) {
      console.error("❌ Error creating Firebase service:", error);
      return null;
    }
  }
}

export const authService = AuthServiceFactory.getInstance();
