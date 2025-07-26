"use server";

import { authService } from "@/lib/services/auth-service-factory";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required")
});

export async function registerUser(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string
    };

    // Validate input
    const { email, password, name } = registerSchema.parse(data);

    // Create user using auth service
    const user = await authService.createUser(email, password, name);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0].message
      };
    }

    return {
      success: false,
      error: error.message || "Registration failed"
    };
  }
}
