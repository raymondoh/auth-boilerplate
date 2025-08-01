import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoginForm } from "../login-form";
import jest from "jest"; // Declare the jest variable

// Mock the hooks
jest.mock("next/navigation");
jest.mock("next-auth/react");

const mockPush = jest.fn();
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush
  });
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
});

describe("LoginForm", () => {
  it("renders login form correctly", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it("shows verification success message when verified param is present", () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("verified=true"));

    render(<LoginForm />);

    expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("handles successful login", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles login error", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin", ok: false, status: 401, url: null });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });
});
