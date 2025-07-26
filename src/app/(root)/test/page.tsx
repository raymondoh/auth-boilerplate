import { authService } from "@/lib/services/auth-service-factory";
import { config } from "@/lib/config/app-mode";

export default async function TestPage() {
  // Get all users from the service
  const users = await authService.getAllUsers();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Auth Boilerplate Test</h1>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="font-semibold text-gray-300">Current Mode: {config.mode}</h2>
        <p className="text-blue-700">
          {config.isMockMode ? "Using mock data (no Firebase needed)" : "Using real Firebase"}
        </p>
      </div>

      <div className="bg-gray-800 border rounded-lg p-6 text-gray-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-300">Available Test Users:</h3>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="border-l-4 border-green-500 pl-4">
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-gray-600">
                Role: {user.role} | Verified: {user.emailVerified ? "Yes" : "No"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg text-gray-300">
        <h4 className="font-medium mb-2">Try logging in with:</h4>
        <ul className="text-sm space-y-1">
          <li>
            • Email: <code>user@example.com</code> | Password: <code>anything</code>
          </li>
          <li>
            • Email: <code>admin@example.com</code> | Password: <code>anything</code>
          </li>
          <li>• Or any email ending with @example.com</li>
        </ul>
      </div>
    </div>
  );
}
