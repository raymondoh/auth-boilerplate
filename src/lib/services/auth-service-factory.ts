// Service factory that chooses between mock and real Firebase
import { mockAuthService } from "./mock-auth-service";
import { config } from "@/lib/config/app-mode";

export interface IAuthService {
  createUser(email: string, password: string, displayName?: string): Promise<any>;
  validateCredentials(email: string, password: string): Promise<any>;
  getUserById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getAllUsers(): Promise<any[]>;
  updateUser(id: string, updates: any): Promise<any>;
  deleteUser(id: string): Promise<boolean>;
  verifyUserEmail(email: string): Promise<boolean>;
  updateUserPassword(email: string, newPassword: string): Promise<boolean>;
}

class AuthServiceFactory {
  private static instance: IAuthService | null = null;

  static getInstance(): IAuthService {
    if (!AuthServiceFactory.instance) {
      if (config.isMockMode) {
        console.log("🔥 Using Mock Auth Service");
        AuthServiceFactory.instance = mockAuthService as IAuthService;
      } else {
        console.log("🔥 Using Firebase Auth Service");
        // Lazy load Firebase service only when needed
        try {
          const { AuthService } = require("./auth-service");
          AuthServiceFactory.instance = AuthService.getInstance() as IAuthService;
        } catch (error) {
          console.error("Failed to load Firebase Auth Service, falling back to mock:", error);
          AuthServiceFactory.instance = mockAuthService as IAuthService;
        }
      }
    }
    return AuthServiceFactory.instance;
  }
}

export const authService = AuthServiceFactory.getInstance();
