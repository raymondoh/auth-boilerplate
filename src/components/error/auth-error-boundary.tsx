"use client";

import type React from "react";

import { ErrorBoundary } from "./error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, RefreshCw, Home } from "lucide-react";

interface AuthErrorFallbackProps {
  error: Error;
  retry: () => void;
}

function AuthErrorFallback({ error, retry }: AuthErrorFallbackProps) {
  const isAuthError =
    error.message.includes("auth") || error.message.includes("login") || error.message.includes("session");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {isAuthError ? "Authentication Error" : "Something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            {isAuthError ? (
              <p>There was a problem with authentication. Please try signing in again.</p>
            ) : (
              <p>We encountered an unexpected error. Please try again.</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Button onClick={retry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/login")} className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              Go to login
            </Button>
            <Button variant="ghost" onClick={() => (window.location.href = "/")} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={AuthErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Auth error:", error, errorInfo);
        // TODO: Send auth errors to monitoring service
      }}>
      {children}
    </ErrorBoundary>
  );
}
