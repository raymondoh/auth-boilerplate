"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: string;
}

export default function DebugPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearUsers = async () => {
    setDeleting(true);
    try {
      const response = await fetch("/api/debug/users", { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        await fetchUsers(); // Refresh the list
        alert(`${data.message}`);
      }
    } catch (error) {
      console.error("Failed to clear users:", error);
      alert("Failed to clear users");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Debug Panel</h1>
            <p className="text-gray-600">Manage mock users and debug the system</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchUsers} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={clearUsers} disabled={deleting} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Clearing..." : "Clear Users"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mock Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found</p>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name
                            ? user.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()
                            : user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{user.name || "No name"}</h3>
                          <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
                          <Badge variant={user.emailVerified ? "default" : "outline"}>
                            {user.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>{user.email}</div>
                          <div>ID: {user.id}</div>
                          <div>Created: {new Date(user.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => window.open("/register", "_blank")} className="bg-transparent">
                Test Registration
              </Button>
              <Button variant="outline" onClick={() => window.open("/login", "_blank")} className="bg-transparent">
                Test Login
              </Button>
              <Button variant="outline" onClick={() => window.open("/test", "_blank")} className="bg-transparent">
                View Test Page
              </Button>
              <Button variant="outline" onClick={() => window.open("/dashboard", "_blank")} className="bg-transparent">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div>
                <strong>Mode:</strong> Mock (Development)
              </div>
              <div>
                <strong>Storage:</strong> In-memory (resets on server restart)
              </div>
              <div>
                <strong>Default Users:</strong> user@example.com, admin@example.com
              </div>
              <div>
                <strong>Console:</strong> Check browser console and server logs for debug info
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
