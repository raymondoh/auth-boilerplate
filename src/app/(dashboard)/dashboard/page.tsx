import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { authService } from "@/lib/services/auth-service-factory";

export default async function DashboardPage() {
  const session = await auth();

  // Get full user details to check verification status
  const user = session?.user?.id ? await authService.getUserById(session.user.id) : null;

  return (
    <div className="space-y-6">
      {/* Email Verification Banner */}
      {user && !user.emailVerified && <EmailVerificationBanner email={user.email} />}

      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back to your dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Welcome!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">You're successfully logged in.</p>
            <div className="mt-4 space-y-2">
              <div>
                <strong>Email:</strong> {session?.user?.email}
              </div>
              <div>
                <strong>Name:</strong> {session?.user?.name || "Not provided"}
              </div>
              <div>
                <strong>Mode:</strong> {(session as any)?.mode}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                View Profile
              </Button>
            </Link>
            <Link href="/dashboard/profile/edit">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Edit Profile
              </Button>
            </Link>
            <Link href="/test">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Test Page
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Auth Mode:</strong> {(session as any)?.mode || "Unknown"}
              </div>
              <div>
                <strong>Session:</strong> Active
              </div>
              <div>
                <strong>User ID:</strong> {session?.user?.id}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
