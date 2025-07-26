import type React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Ensure we pass the role from the session
  const userWithRole = {
    ...session.user,
    role: (session.user as any)?.role || "user"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={userWithRole} />
      <main className="container mx-auto py-8">{children}</main>
    </div>
  );
}
