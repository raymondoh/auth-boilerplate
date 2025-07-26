// Mock authentication service for development with persistent storage
export interface MockUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Use a more robust global storage mechanism
declare global {
  var mockUsers: Map<string, MockUser> | undefined;
  var mockUsersInitialized: boolean | undefined;
}

// Initialize global storage
if (!global.mockUsers) {
  global.mockUsers = new Map<string, MockUser>();
  global.mockUsersInitialized = false;
}

class MockAuthService {
  private users: Map<string, MockUser>;

  constructor() {
    // Use the global storage
    this.users = global.mockUsers!;

    // Only initialize once globally
    if (!global.mockUsersInitialized) {
      this.addTestUsers();
      global.mockUsersInitialized = true;
    }
  }

  private addTestUsers() {
    const now = new Date();
    const testUsers: MockUser[] = [
      {
        id: "user-1",
        email: "user@example.com",
        name: "Test User",
        emailVerified: false,
        role: "user",
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        id: "admin-1",
        email: "admin@example.com",
        name: "Test Admin",
        emailVerified: true,
        role: "admin",
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      }
    ];

    testUsers.forEach(user => {
      if (!this.users.has(user.id)) {
        this.users.set(user.id, user);
      }
    });

    console.log(`🔥 Mock: Initialized with ${this.users.size} users`);
  }

  async createUser(email: string, password: string, displayName?: string): Promise<MockUser> {
    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const now = new Date();
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      name: displayName || null,
      emailVerified: false,
      role: "user",
      createdAt: now,
      updatedAt: now
    };

    this.users.set(newUser.id, newUser);
    console.log(`🔥 Mock: Created user ${email} with ID ${newUser.id}`);
    console.log(`🔥 Mock: Total users now: ${this.users.size}`);
    console.log(`🔥 Mock: All user IDs: ${Array.from(this.users.keys()).join(", ")}`);
    return newUser;
  }

  async validateCredentials(email: string, password: string): Promise<MockUser | null> {
    // In mock mode, accept any password for existing users
    const user = Array.from(this.users.values()).find(u => u.email === email);

    if (user) {
      // Update last login time
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      this.users.set(user.id, user);

      console.log(`🔥 Mock: Authenticated ${email} with ID ${user.id}`);
      return user;
    }

    // For demo purposes, create user if they don't exist and email looks valid
    if (email.includes("@")) {
      console.log(`🔥 Mock: User ${email} not found, creating new user`);
      return this.createUser(email, password, email.split("@")[0]);
    }

    return null;
  }

  async getUserById(id: string): Promise<MockUser | null> {
    const user = this.users.get(id);
    console.log(`🔥 Mock: getUserById(${id}) - Found: ${!!user}`);
    if (!user) {
      console.log(`🔥 Mock: Available user IDs: ${Array.from(this.users.keys()).join(", ")}`);
      console.log(`🔥 Mock: Total users in storage: ${this.users.size}`);
    }
    return user || null;
  }

  async getUserByEmail(email: string): Promise<MockUser | null> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    console.log(`🔥 Mock: getUserByEmail(${email}) - Found: ${!!user}`);
    return user || null;
  }

  async getAllUsers(): Promise<MockUser[]> {
    const users = Array.from(this.users.values());
    console.log(`🔥 Mock: getAllUsers() - Returning ${users.length} users`);
    return users;
  }

  async updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser | null> {
    const user = this.users.get(id);
    if (!user) {
      console.log(`🔥 Mock: updateUser(${id}) - User not found`);
      return null;
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    console.log(`🔥 Mock: Updated user ${user.email}`);
    return updatedUser;
  }

  async verifyUserEmail(email: string): Promise<boolean> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) {
      console.log(`🔥 Mock: verifyUserEmail(${email}) - User not found`);
      return false;
    }

    user.emailVerified = true;
    user.updatedAt = new Date();
    this.users.set(user.id, user);
    console.log(`🔥 Mock: Email verified for ${email}`);
    return true;
  }

  async updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) {
      console.log(`🔥 Mock: updateUserPassword(${email}) - User not found`);
      return false;
    }

    user.updatedAt = new Date();
    this.users.set(user.id, user);
    console.log(`🔥 Mock: Password updated for ${email}`);
    return true;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = this.users.delete(id);
    if (deleted) {
      console.log(`🔥 Mock: Deleted user ${id}`);
    }
    return deleted;
  }
}

export const mockAuthService = new MockAuthService();
