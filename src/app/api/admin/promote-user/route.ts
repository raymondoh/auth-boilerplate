import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { authService } from "@/lib/services/auth-service-factory";
import { isAdmin } from "@/lib/auth/roles";
import { z } from "zod";

const promoteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required")
});

export async function POST(request: NextRequest) {
  console.log("🚀 Admin promote user API called");

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin permissions
    const userRole = (session.user as any)?.role;
    if (!isAdmin(userRole)) {
      console.log(`❌ Non-admin user ${session.user.email} attempted to promote user`);
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    console.log(`📝 Admin promotion request by: ${session.user.email}`);

    // Validate input
    const { userId } = promoteUserSchema.parse(body);
    console.log(`✅ Input validated for user ID: ${userId}`);

    // Get the user to be promoted
    const targetUser = await authService.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already an admin
    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "User is already an admin" }, { status: 400 });
    }

    // Promote user to admin
    console.log(`👑 Promoting user ${targetUser.email} to admin`);
    const success = await authService.promoteToAdmin(userId);

    if (!success) {
      return NextResponse.json({ error: "Failed to promote user" }, { status: 500 });
    }

    // Get updated user data
    const updatedUser = await authService.getUserById(userId);

    console.log(`🎉 User ${targetUser.email} promoted to admin successfully`);

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.email} has been promoted to admin`,
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        role: updatedUser?.role
      }
    });
  } catch (error: any) {
    console.error("❌ Admin promotion error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || "Promotion failed" }, { status: 500 });
  }
}
