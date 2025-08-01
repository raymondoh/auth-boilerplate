import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { authService } from "@/lib/services/auth-service-factory";
import { isAdmin } from "@/lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromoteUserDialog } from "@/components/admin/promote-user-dialog";
import { AdminOnly } from "@/components/auth/admin-only";
import { Users, Shield, Crown } from "lucide-react";

export default async function AdminUsersPage() {
  console.log("🔍 Loading admin users page...");

  const session = await auth();
  console.log("🔍 Session user:", session?.user?.email, "Role:", (session?.user as any)?.role);

  if (!session?.user) {
    console.log("❌ No session, redirecting to login");
    redirect("/login");
  }

  const userRole = (session.user as any)?.role;
  if (!isAdmin(userRole)) {
    console.log(`❌ User ${session.user.email} with role ${userRole} is not admin, redirecting`);
    redirect("/dashboard");
  }

  console.log("✅ Admin access confirmed, fetching users...");
  const users = await authService.getAllUsers();
  console.log(`📊 Found ${users.length} users`);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "business_owner":
        return "default";
      case "tradesperson":
        return "secondary";
      case "customer":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const adminCount = users.filter(user => user.role === "admin").length;
  const totalUsers = users.length;

  return (
    <AdminOnly>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">Manage all users in the system</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              <span>{adminCount} Admins</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{totalUsers} Total Users</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users ({users.length})</CardTitle>
              <CardDescription>View and manage user accounts. You can promote users to admin status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {user.role === "admin" && <Crown className="h-4 w-4 text-yellow-500" />}
                          <p className="font-medium">{user.name || "No name"}</p>
                        </div>
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role.replace("_", " ")}</Badge>
                        {user.emailVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Created: {formatDate(user.createdAt)}</span>
                        <span>Last login: {formatDate(user.lastLoginAt)}</span>
                        <span>ID: {user.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PromoteUserDialog user={user} />
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Users will appear here once they register</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Current User:</strong> {session.user.email}
                  </p>
                  <p>
                    <strong>Current Role:</strong> {userRole}
                  </p>
                  <p>
                    <strong>Is Admin:</strong> {isAdmin(userRole) ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Total Users:</strong> {users.length}
                  </p>
                  <p>
                    <strong>Admin Users:</strong> {adminCount}
                  </p>
                  <p>
                    <strong>Service Mode:</strong> Firebase
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminOnly>
  );
}
