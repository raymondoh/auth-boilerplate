import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth-service-factory";

export async function GET() {
  try {
    const users = await authService.getAllUsers();

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error("Debug users error:", error);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear all users except the default test users
    const users = await authService.getAllUsers();
    let deletedCount = 0;

    for (const user of users) {
      // Keep the default test users
      if (user.id !== "user-1" && user.id !== "admin-1") {
        await authService.deleteUser(user.id);
        deletedCount++;
      }
    }

    console.log(`🧹 Deleted ${deletedCount} users, kept default test users`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} users`,
      remaining: 2 // user-1 and admin-1
    });
  } catch (error) {
    console.error("Debug delete users error:", error);
    return NextResponse.json({ error: "Failed to delete users" }, { status: 500 });
  }
}
