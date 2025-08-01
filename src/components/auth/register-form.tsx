"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/ui/icons";
import { REGISTERABLE_ROLES, ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS, DEFAULT_ROLE } from "@/lib/auth/roles";

interface EnhancedRegisterFormProps {
  // Allow customization for specific apps
  availableRoles?: typeof REGISTERABLE_ROLES;
  defaultRole?: string;
  showRoleSelection?: boolean;
  customRoleLabels?: Record<string, string>;
  customRoleDescriptions?: Record<string, string>;
}

export function EnhancedRegisterForm({
  availableRoles = REGISTERABLE_ROLES,
  defaultRole = DEFAULT_ROLE,
  showRoleSelection = true,
  customRoleLabels = {},
  customRoleDescriptions = {}
}: EnhancedRegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Please check your email to verify your account.");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: defaultRole
        });
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/dashboard"
      });
    } catch (error) {
      setError("An unexpected error occurred with Google sign in.");
      setIsGoogleLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    return customRoleLabels[role] || ROLE_DISPLAY_NAMES[role as keyof typeof ROLE_DISPLAY_NAMES] || role;
  };

  const getRoleDescription = (role: string) => {
    return customRoleDescriptions[role] || ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS] || "";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">Enter your information to create your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Google Sign In Button */}
        <Button
          variant="outline"
          type="button"
          disabled={isGoogleLoading || isLoading}
          onClick={handleGoogleSignIn}
          className="w-full bg-transparent">
          {isGoogleLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={e => handleInputChange("email", e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>

          {showRoleSelection && (
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select
                value={formData.role}
                onValueChange={value => handleInputChange("role", value)}
                disabled={isLoading || isGoogleLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your account type" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      <div className="flex flex-col">
                        <span className="font-medium">{getRoleLabel(role)}</span>
                        <span className="text-xs text-muted-foreground">{getRoleDescription(role)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={e => handleInputChange("password", e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={e => handleInputChange("confirmPassword", e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center text-muted-foreground w-full">
          Already have an account?{" "}
          <Link href="/login" className="hover:text-primary underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
