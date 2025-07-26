import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { authService } from "@/lib/services/auth-service-factory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Helper function to safely format dates
function formatDate(date: Date | string | undefined): string {
  if (!date) return "Not available";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  } catch (error) {
    return "Invalid date";
  }
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return "Not available";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString();
  } catch (error) {
    return "Invalid date";
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get full user details using our auth service
  const user = await authService.getUserById(session.user.id!);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We couldn't find your user profile. This might be a temporary issue.</p>
              <div className="flex gap-4">
                <Link href="/dashboard">
                  <Button variant="outline">← Back to Dashboard</Button>
                </Link>
                <Link href="/api/auth/signout">
                  <Button variant="destructive">Sign Out</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg">{user.name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Verified</label>
                <Badge variant={user.emailVerified ? "default" : "destructive"}>
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-lg">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-lg">{formatDate(user.updatedAt)}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/profile/edit">
                <Button>Edit Profile</Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline">Account Settings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {user.lastLoginAt ? (
              <p className="text-gray-600">Last login: {formatDateTime(user.lastLoginAt)}</p>
            ) : (
              <p className="text-gray-600">No recent login activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
