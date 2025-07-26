import { type NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth-service-factory";
import { tokenService } from "@/lib/auth/tokens";
import { emailService } from "@/lib/email/email-service";
import { z } from "zod";

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendVerificationSchema.parse(body);

    // Check if user exists
    const user = await authService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Create new verification token
    const token = await tokenService.createEmailVerificationToken(email);

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(email, token, user.name || undefined);

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to resend verification email" }, { status: 500 });
  }
}
