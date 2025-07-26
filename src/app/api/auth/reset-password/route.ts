import { type NextRequest, NextResponse } from "next/server";
import { tokenService } from "@/lib/auth/tokens";
import { authService } from "@/lib/services/auth-service-factory";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    console.log(`🔐 Password reset attempt with token: ${token.substring(0, 10)}...`);

    // Verify and consume the token
    const tokenResult = await tokenService.verifyToken(token, "password_reset");

    if (!tokenResult.valid) {
      console.log(`🔐 Invalid token: ${tokenResult.error}`);
      return NextResponse.json({ error: tokenResult.error || "Invalid reset token" }, { status: 400 });
    }

    // Update user's password
    const success = await authService.updateUserPassword(tokenResult.email!, password);

    if (!success) {
      console.error(`🔐 Failed to update password for: ${tokenResult.email}`);
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    console.log(`✅ Password successfully reset for: ${tokenResult.email}`);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error: any) {
    console.error("Password reset error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Password reset failed" }, { status: 500 });
  }
}
