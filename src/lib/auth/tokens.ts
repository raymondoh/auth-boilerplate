// Token management for email verification and password reset
import crypto from "crypto";

export interface VerificationToken {
  id: string;
  email: string;
  token: string;
  type: "email_verification" | "password_reset";
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
}

// Use global storage for tokens too
declare global {
  var mockTokens: Map<string, VerificationToken> | undefined;
}

if (!global.mockTokens) {
  global.mockTokens = new Map<string, VerificationToken>();
}

export class TokenService {
  private static instance: TokenService | null = null;
  private tokenStorage: Map<string, VerificationToken>;

  constructor() {
    this.tokenStorage = global.mockTokens!;
  }

  static getInstance() {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  // Generate a secure random token
  private generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // Create email verification token
  async createEmailVerificationToken(email: string): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const verificationToken: VerificationToken = {
      id: `token_${Date.now()}`,
      email,
      token,
      type: "email_verification",
      expiresAt,
      createdAt: new Date(),
      used: false
    };

    this.tokenStorage.set(token, verificationToken);
    console.log(`🔑 Created email verification token for ${email}`);
    console.log(`🔑 Token: ${token.substring(0, 10)}...`);
    return token;
  }

  // Create password reset token
  async createPasswordResetToken(email: string): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const resetToken: VerificationToken = {
      id: `token_${Date.now()}`,
      email,
      token,
      type: "password_reset",
      expiresAt,
      createdAt: new Date(),
      used: false
    };

    this.tokenStorage.set(token, resetToken);
    console.log(`🔑 Created password reset token for ${email}`);
    return token;
  }

  // Check token validity without consuming it
  async checkToken(
    token: string,
    type: "email_verification" | "password_reset"
  ): Promise<{ valid: boolean; email?: string; error?: string }> {
    const storedToken = this.tokenStorage.get(token);

    if (!storedToken) {
      console.log(`🔑 Token not found: ${token.substring(0, 10)}...`);
      return { valid: false, error: "Invalid token" };
    }

    if (storedToken.type !== type) {
      return { valid: false, error: "Invalid token type" };
    }

    if (storedToken.used) {
      return { valid: false, error: "Token already used" };
    }

    if (new Date() > storedToken.expiresAt) {
      return { valid: false, error: "Token expired" };
    }

    console.log(`✅ Token is valid for ${storedToken.email} (not consumed)`);
    return { valid: true, email: storedToken.email };
  }

  // Verify and consume token
  async verifyToken(
    token: string,
    type: "email_verification" | "password_reset"
  ): Promise<{ valid: boolean; email?: string; error?: string }> {
    const storedToken = this.tokenStorage.get(token);

    if (!storedToken) {
      console.log(`🔑 Token not found: ${token.substring(0, 10)}...`);
      return { valid: false, error: "Invalid token" };
    }

    if (storedToken.type !== type) {
      return { valid: false, error: "Invalid token type" };
    }

    if (storedToken.used) {
      return { valid: false, error: "Token already used" };
    }

    if (new Date() > storedToken.expiresAt) {
      return { valid: false, error: "Token expired" };
    }

    // Mark token as used
    storedToken.used = true;
    this.tokenStorage.set(token, storedToken);

    console.log(`✅ Token verified and consumed for ${storedToken.email}`);
    return { valid: true, email: storedToken.email };
  }

  // Clean up expired tokens (call periodically)
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    let cleaned = 0;

    for (const [token, data] of this.tokenStorage.entries()) {
      if (now > data.expiresAt) {
        this.tokenStorage.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired tokens`);
    }
  }
}

export const tokenService = TokenService.getInstance();
