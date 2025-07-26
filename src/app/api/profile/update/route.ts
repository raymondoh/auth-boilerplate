import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { authService } from "@/lib/services/auth-service-factory";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address")
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = updateProfileSchema.parse(body);

    // Update user using our Firebase functions
    const updatedUser = await authService.updateUser(session.user.id, {
      name,
      email
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });
  } catch (error: any) {
    console.error("Profile update error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }
}
