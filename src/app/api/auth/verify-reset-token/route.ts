import { type NextRequest, NextResponse } from "next/server";
import { tokenService } from "@/lib/auth/tokens";
import { z } from "zod";

const verifyTokenSchema = z.object({
  token: z.string().min(1, "Token is required")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyTokenSchema.parse(body);

    console.log(`🔍 Checking token validity: ${token.substring(0, 10)}...`);

    // Check the token validity without consuming it
    const tokenResult = await tokenService.checkToken(token, "password_reset");

    if (!tokenResult.valid) {
      console.log(`🔍 Token check failed: ${tokenResult.error}`);
      return NextResponse.json({ error: tokenResult.error || "Invalid reset token" }, { status: 400 });
    }

    console.log(`✅ Token is valid for: ${tokenResult.email}`);

    return NextResponse.json({
      success: true,
      message: "Token is valid"
    });
  } catch (error: any) {
    console.error("Token verification error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Token verification failed" }, { status: 500 });
  }
}
