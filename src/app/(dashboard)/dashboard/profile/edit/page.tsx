import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { authService } from "@/lib/services/auth-service-factory";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await authService.getUserById(session.user.id!);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <Link href="/dashboard/profile">
            <Button variant="outline">← Back to Profile</Button>
          </Link>
        </div>

        <EditProfileForm user={user} />
      </div>
    </div>
  );
}
