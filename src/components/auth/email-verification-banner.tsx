"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

interface EmailVerificationBannerProps {
  email: string;
  onResend?: () => void;
}

export function EmailVerificationBanner({ email, onResend }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        onResend?.();
      } else {
        setError(data.error || "Failed to resend verification email");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-orange-800">Email Verification Required</h3>
            <p className="text-sm text-orange-700 mt-1">
              Please verify your email address <strong>{email}</strong> to access all features.
            </p>

            {resendSuccess && (
              <div className="flex items-center space-x-2 mt-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Verification email sent!</span>
              </div>
            )}

            {error && <div className="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded">{error}</div>}

            <div className="flex items-center space-x-3 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResend}
                disabled={isResending || resendSuccess}
                className="bg-white">
                <Mail className="h-4 w-4 mr-2" />
                {isResending ? "Sending..." : "Resend Email"}
              </Button>
              <span className="text-xs text-orange-600">Check your spam folder if you don't see the email</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
