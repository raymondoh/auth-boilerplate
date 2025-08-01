"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PromoteUserDialogProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

export function PromoteUserDialog({ user }: PromoteUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handlePromote = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      console.log(`🚀 Promoting user ${user.email} (${user.id})`);

      const response = await fetch("/api/admin/promote-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await response.json();
      console.log("📝 Promotion response:", data);

      if (response.ok) {
        setSuccess(`${user.email} has been promoted to admin!`);
        console.log(`✅ User ${user.email} promoted successfully`);

        // Close dialog after 2 seconds and refresh
        setTimeout(() => {
          setIsOpen(false);
          setSuccess("");
          router.refresh(); // This will refresh the server component
        }, 2000);
      } else {
        setError(data.error || "Failed to promote user");
      }
    } catch (error) {
      console.error("❌ Promotion error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show promote button for existing admins
  if (user.role === "admin") {
    return (
      <Badge variant="destructive" className="text-xs">
        Admin
      </Badge>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 bg-transparent">
          <Crown className="h-3 w-3 mr-1" />
          Promote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Promote User to Admin
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to promote <strong>{user.name || user.email}</strong> to admin? This will give them
            full access to the system including user management.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Admin users can manage all other users, access sensitive data, and perform
              system-wide operations. This action cannot be easily undone.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handlePromote} disabled={isLoading} className="bg-yellow-600 hover:bg-yellow-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Promoting...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Promote to Admin
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
