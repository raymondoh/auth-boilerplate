// Email service that works with both mock and real providers
import { config } from "@/lib/config/app-mode";
import { env } from "@/lib/env";

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendVerificationEmail(email: string, token: string, name?: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, token: string, name?: string): Promise<boolean>;
  sendWelcomeEmail(email: string, name?: string): Promise<boolean>;
}

class MockEmailService implements IEmailService {
  async sendVerificationEmail(email: string, token: string, name?: string): Promise<boolean> {
    console.log(`📧 MockEmailService: sendVerificationEmail called`);
    console.log(`📧 Mock: Verification email sent to ${email}`);
    console.log(
      `🔗 Mock: Verification link: ${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`
    );
    console.log(`📧 MockEmailService: sendVerificationEmail completed`);
    return true;
  }

  async sendPasswordResetEmail(email: string, token: string, name?: string): Promise<boolean> {
    console.log(`📧 MockEmailService: sendPasswordResetEmail called`);
    console.log(`📧 Mock: Password reset email sent to ${email}`);
    console.log(
      `🔗 Mock: Reset link: ${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`
    );
    return true;
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    console.log(`📧 MockEmailService: sendWelcomeEmail called`);
    console.log(`📧 Mock: Welcome email sent to ${email}`);
    return true;
  }
}

class ResendEmailService implements IEmailService {
  private resend: any;

  constructor() {
    if (!config.isMockMode && env.RESEND_API_KEY) {
      console.log(`📧 ResendEmailService: Initializing with API key: ${env.RESEND_API_KEY?.substring(0, 10)}...`);
      // Lazy load Resend only when needed
      try {
        const { Resend } = require("resend");
        this.resend = new Resend(env.RESEND_API_KEY);
        console.log(`📧 ResendEmailService: Successfully initialized Resend client`);
      } catch (error) {
        console.error(`📧 ResendEmailService: Failed to initialize Resend:`, error);
        this.resend = null;
      }
    } else {
      console.log(
        `📧 ResendEmailService: Not initializing - Mock mode: ${config.isMockMode}, API Key present: ${!!env.RESEND_API_KEY}`
      );
    }
  }

  async sendVerificationEmail(email: string, token: string, name?: string): Promise<boolean> {
    console.log(`📧 ResendEmailService: sendVerificationEmail called for ${email}`);
    console.log(`📧 ResendEmailService: Resend client available: ${!!this.resend}`);
    console.log(`📧 ResendEmailService: EMAIL_FROM: ${env.EMAIL_FROM}`);

    if (!this.resend) {
      console.error(`📧 ResendEmailService: No Resend client available`);
      return false;
    }

    try {
      const emailData = {
        from: env.EMAIL_FROM || "noreply@example.com",
        to: email,
        subject: "Verify your email address",
        html: this.getVerificationEmailHtml(token, name)
      };

      console.log(`📧 ResendEmailService: Sending email with data:`, {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        htmlLength: emailData.html.length
      });

      const result = await this.resend.emails.send(emailData);
      console.log(`📧 ResendEmailService: Email sent successfully:`, result);
      return true;
    } catch (error) {
      console.error("📧 ResendEmailService: Failed to send verification email:", error);

      // Log more details about the error
      if (error instanceof Error) {
        console.error("📧 Error name:", error.name);
        console.error("📧 Error message:", error.message);
        console.error("📧 Error stack:", error.stack);
      }

      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, name?: string): Promise<boolean> {
    console.log(`📧 ResendEmailService: sendPasswordResetEmail called for ${email}`);

    if (!this.resend) {
      console.error(`📧 ResendEmailService: No Resend client available`);
      return false;
    }

    try {
      const result = await this.resend.emails.send({
        from: env.EMAIL_FROM || "noreply@example.com",
        to: email,
        subject: "Reset your password",
        html: this.getPasswordResetEmailHtml(token, name)
      });
      console.log(`📧 ResendEmailService: Password reset email sent successfully:`, result);
      return true;
    } catch (error) {
      console.error("📧 ResendEmailService: Failed to send password reset email:", error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    console.log(`📧 ResendEmailService: sendWelcomeEmail called for ${email}`);

    if (!this.resend) {
      console.error(`📧 ResendEmailService: No Resend client available`);
      return false;
    }

    try {
      const result = await this.resend.emails.send({
        from: env.EMAIL_FROM || "noreply@example.com",
        to: email,
        subject: "Welcome to Auth Boilerplate!",
        html: this.getWelcomeEmailHtml(name)
      });
      console.log(`📧 ResendEmailService: Welcome email sent successfully:`, result);
      return true;
    } catch (error) {
      console.error("📧 ResendEmailService: Failed to send welcome email:", error);
      return false;
    }
  }

  private getVerificationEmailHtml(token: string, name?: string): string {
    const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Verify Your Email Address</h1>
            <p>Hi ${name || "there"},</p>
            <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailHtml(token: string, name?: string): string {
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">Reset Your Password</h1>
            <p>Hi ${name || "there"},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeEmailHtml(name?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #059669;">Welcome to Auth Boilerplate!</h1>
            <p>Hi ${name || "there"},</p>
            <p>Welcome to our platform! Your account has been successfully verified and you're ready to get started.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Thanks for joining us!</p>
          </div>
        </body>
      </html>
    `;
  }
}

// Email service factory
class EmailServiceFactory {
  private static instance: IEmailService | null = null;

  static getInstance(): IEmailService {
    if (!EmailServiceFactory.instance) {
      console.log(`📧 EmailServiceFactory: Creating email service instance`);
      console.log(`📧 EmailServiceFactory: Config mode: ${config.mode}`);
      console.log(`📧 EmailServiceFactory: Is mock mode: ${config.isMockMode}`);
      console.log(`📧 EmailServiceFactory: RESEND_API_KEY present: ${!!env.RESEND_API_KEY}`);

      if (config.isMockMode || !env.RESEND_API_KEY) {
        console.log("📧 EmailServiceFactory: Using Mock Email Service");
        EmailServiceFactory.instance = new MockEmailService();
      } else {
        console.log("📧 EmailServiceFactory: Using Resend Email Service");
        EmailServiceFactory.instance = new ResendEmailService();
      }
    }
    return EmailServiceFactory.instance;
  }
}

export const emailService = EmailServiceFactory.getInstance();
