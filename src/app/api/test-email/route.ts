import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    console.log(`🧪 Test Email: Starting email test`);
    console.log(`🧪 RESEND_API_KEY present: ${!!env.RESEND_API_KEY}`);
    console.log(`🧪 EMAIL_FROM: ${env.EMAIL_FROM}`);

    if (!env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 400 });
    }

    const { Resend } = require("resend");
    const resend = new Resend(env.RESEND_API_KEY);

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log(`🧪 Test Email: Sending test email to ${email}`);

    const result = await resend.emails.send({
      from: env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Test Email from Auth Boilerplate",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify your Resend configuration is working.</p>
        <p>If you received this, your email service is configured correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });

    console.log(`🧪 Test Email: Result:`, result);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      result
    });
  } catch (error: any) {
    console.error("🧪 Test Email: Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to send test email",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
