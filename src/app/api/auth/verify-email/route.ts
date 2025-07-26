import { type NextRequest, NextResponse } from "next/server";
import { tokenService } from "@/lib/auth/tokens";
import { authService } from "@/lib/services/auth-service-factory";
import { emailService } from "@/lib/email/email-service";
import { z } from "zod";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Verify the token
    const tokenResult = await tokenService.verifyToken(token, "email_verification");

    if (!tokenResult.valid) {
      return NextResponse.json({ error: tokenResult.error || "Invalid verification token" }, { status: 400 });
    }

    // Update user's email verification status
    const success = await authService.verifyUserEmail(tokenResult.email!);

    if (!success) {
      return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
    }

    // Send welcome email
    const user = await authService.getUserByEmail(tokenResult.email!);
    if (user) {
      await emailService.sendWelcomeEmail(user.email, user.name || undefined);
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error: any) {
    console.error("Email verification error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Email verification failed" }, { status: 500 });
  }
}
