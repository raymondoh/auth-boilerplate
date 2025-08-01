import { POST } from "../register/route";
import { NextRequest } from "next/server";
import jest from "jest";

// Mock the auth service
jest.mock("@/lib/services/auth-service-factory", () => ({
  authService: {
    createUser: jest.fn()
  }
}));

// Mock the token service
jest.mock("@/lib/auth/tokens", () => ({
  tokenService: {
    createEmailVerificationToken: jest.fn()
  }
}));

// Mock the email service
jest.mock("@/lib/email/email-service", () => ({
  emailService: {
    sendVerificationEmail: jest.fn()
  }
}));

import { authService } from "@/lib/services/auth-service-factory";
import { tokenService } from "@/lib/auth/tokens";
import { emailService } from "@/lib/email/email-service";

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockTokenService = tokenService as jest.Mocked<typeof tokenService>;
const mockEmailService = emailService as jest.Mocked<typeof emailService>;

describe("/api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates user successfully", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      emailVerified: false,
      role: "user" as const
    };

    mockAuthService.createUser.mockResolvedValue(mockUser);
    mockTokenService.createEmailVerificationToken.mockResolvedValue("token-123");
    mockEmailService.sendVerificationEmail.mockResolvedValue(true);

    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toMatchObject({
      id: "user-123",
      email: "test@example.com",
      name: "Test User"
    });

    expect(mockAuthService.createUser).toHaveBeenCalledWith("test@example.com", "password123", "Test User");
    expect(mockTokenService.createEmailVerificationToken).toHaveBeenCalledWith("test@example.com");
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith("test@example.com", "token-123", "Test User");
  });

  it("validates input data", async () => {
    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
        password: "123", // Too short
        name: "" // Empty
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("handles user already exists error", async () => {
    mockAuthService.createUser.mockRejectedValue(new Error("User already exists"));

    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: "existing@example.com",
        password: "password123",
        name: "Test User"
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("User already exists");
  });

  it("handles email service failure gracefully", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      emailVerified: false,
      role: "user" as const
    };

    mockAuthService.createUser.mockResolvedValue(mockUser);
    mockTokenService.createEmailVerificationToken.mockResolvedValue("token-123");
    mockEmailService.sendVerificationEmail.mockRejectedValue(new Error("Email service down"));

    const request = new NextRequest("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      })
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still succeed even if email fails
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
