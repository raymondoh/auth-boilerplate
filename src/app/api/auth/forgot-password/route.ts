import { type NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth-service-factory";
import { tokenService } from "@/lib/auth/tokens";
import { emailService } from "@/lib/email/email-service";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    console.log(`🔐 Password reset requested for: ${email}`);

    // Check if user exists
    const user = await authService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      console.log(`🔐 User not found: ${email}`);
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link."
      });
    }

    // Create password reset token
    const token = await tokenService.createPasswordResetToken(email);
    console.log(`🔑 Password reset token created for: ${email}`);

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(email, token, user.name || undefined);

    if (!emailSent) {
      console.error(`📧 Failed to send password reset email to: ${email}`);
      return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 });
    }

    console.log(`✅ Password reset email sent to: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully"
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to process password reset request" }, { status: 500 });
  }
}
