import { type NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth-service-factory";
import { z } from "zod";
import { tokenService } from "@/lib/auth/tokens";
import { emailService } from "@/lib/email/email-service";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required")
});

export async function POST(request: NextRequest) {
  console.log("🚀 Registration API called");

  try {
    const body = await request.json();
    console.log(`📝 Registration request for: ${body.email}`);

    // Validate input
    const { email, password, name } = registerSchema.parse(body);
    console.log(`✅ Input validated for: ${email}`);

    // Create user using auth service
    console.log(`👤 Creating user: ${email}`);
    const user = await authService.createUser(email, password, name);
    console.log(`✅ User created with ID: ${user.id}`);

    // Create email verification token
    console.log(`🔑 Creating verification token for: ${email}`);
    const token = await tokenService.createEmailVerificationToken(email);
    console.log(`✅ Token created: ${token.substring(0, 10)}...`);

    // Send verification email
    console.log(`📧 Attempting to send verification email to: ${email}`);
    try {
      const emailSent = await emailService.sendVerificationEmail(email, token, name);
      console.log(`📧 Email service result: ${emailSent}`);
    } catch (emailError) {
      console.error(`📧 Email service error:`, emailError);
    }

    console.log(`🎉 Registration completed successfully for: ${email}`);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      message: "Registration successful! Please check your email to verify your account."
    });
  } catch (error: any) {
    console.error("❌ Registration error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
