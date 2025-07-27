// Updated to use complete Firebase functions
import { firebaseAuthService } from "@/lib/firebase/auth";

export class AuthService {
  private static instance: AuthService | null = null;

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async createUser(email: string, password: string, displayName?: string) {
    return firebaseAuthService.createUser(email, password, displayName);
  }

  async validateCredentials(email: string, password: string) {
    return firebaseAuthService.validateCredentials(email, password);
  }

  async getUserById(id: string) {
    return firebaseAuthService.getUserById(id);
  }

  async getUserByEmail(email: string) {
    return firebaseAuthService.getUserByEmail(email);
  }

  async getAllUsers() {
    return firebaseAuthService.getAllUsers();
  }

  async updateUser(id: string, updates: any) {
    return firebaseAuthService.updateUser(id, updates);
  }

  async deleteUser(id: string) {
    return firebaseAuthService.deleteUser(id);
  }

  async verifyUserEmail(email: string) {
    return firebaseAuthService.verifyUserEmail(email);
  }

  async updateUserPassword(email: string, newPassword: string) {
    return firebaseAuthService.updateUserPassword(email, newPassword);
  }
}
