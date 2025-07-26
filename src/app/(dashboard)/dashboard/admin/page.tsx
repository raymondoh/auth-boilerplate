import { AdminOnly } from "@/components/auth/admin-only";
import { authService } from "@/lib/services/auth-service-factory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Activity, Settings } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const users = await authService.getAllUsers();
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === "admin").length;
  const regularUsers = users.filter(user => user.role === "user").length;

  return (
    <AdminOnly>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-red-600">Admin Panel</h1>
          <p className="text-gray-600">System administration and user management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{adminUsers}</div>
              <p className="text-xs text-muted-foreground">Admin users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{regularUsers}</div>
              <p className="text-xs text-muted-foreground">Standard users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/admin/users">
              <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Manage Users</div>
                    <div className="text-sm text-gray-500">View and edit user accounts</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent" disabled>
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-400">System Settings</div>
                  <div className="text-sm text-gray-400">Coming soon</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent" disabled>
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-400">Activity Logs</div>
                  <div className="text-sm text-gray-400">Coming soon</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name || "No name"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
                    <Badge variant={user.emailVerified ? "default" : "outline"}>
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}
