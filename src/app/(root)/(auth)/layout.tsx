import type React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Auth Boilerplate</h2>
          <p className="mt-2 text-sm text-gray-600">Secure authentication system</p>
        </div>
        {children}
      </div>
    </div>
  );
}
