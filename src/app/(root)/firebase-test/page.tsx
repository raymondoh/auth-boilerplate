import { testFirebaseConnection } from "@/lib/firebase/test-connection";
import { authService } from "@/lib/services/auth-service-factory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export default async function FirebaseTestPage() {
  const connectionTest = await testFirebaseConnection();

  // Test basic auth service operations
  const serviceTest = {
    getAllUsers: false,
    error: null as string | null,
    userCount: 0
  };

  try {
    const users = await authService.getAllUsers();
    serviceTest.getAllUsers = true;
    serviceTest.userCount = users.length;
  } catch (error: any) {
    serviceTest.error = error.message;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Firebase Connection Test</h1>
          <p className="text-gray-600">Test your Firebase integration</p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectionTest.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Connection Status
              <Badge variant={connectionTest.success ? "default" : "destructive"}>{connectionTest.mode}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionTest.mode === "mock" ? (
              <div className="text-blue-600 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium">Running in Mock Mode</p>
                <p className="text-sm mt-1">
                  Set <code>NEXT_PUBLIC_APP_MODE=firebase</code> to test Firebase integration
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {connectionTest.success ? (
                  <div className="text-green-600 bg-green-50 p-4 rounded-lg">
                    <p className="font-medium">✅ Firebase Connected Successfully!</p>
                    <p className="text-sm mt-1">All Firebase services are working correctly</p>
                  </div>
                ) : (
                  <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                    <p className="font-medium">❌ Firebase Connection Failed</p>
                    <p className="text-sm mt-1">Check your environment variables and configuration</p>
                  </div>
                )}

                {/* Detailed Results */}
                {connectionTest.results && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {connectionTest.results.adminAuth ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Admin Auth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {connectionTest.results.adminDb ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Admin Firestore</span>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {connectionTest.results?.errors && connectionTest.results.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {connectionTest.results.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {serviceTest.getAllUsers ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Auth Service Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceTest.getAllUsers ? (
              <div className="text-green-600 bg-green-50 p-4 rounded-lg">
                <p className="font-medium">✅ Auth Service Working</p>
                <p className="text-sm mt-1">Found {serviceTest.userCount} users in database</p>
              </div>
            ) : (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                <p className="font-medium">❌ Auth Service Error</p>
                <p className="text-sm mt-1">{serviceTest.error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">To enable Firebase:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Create a Firebase project at Firebase Console</li>
                <li>Enable Authentication and Firestore</li>
                <li>Get your configuration keys</li>
                <li>Update your .env.local file</li>
                <li>Set NEXT_PUBLIC_APP_MODE=firebase</li>
                <li>Restart your development server</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Need help?</h4>
              <p className="text-sm text-gray-700">Check the FIREBASE_SETUP.md file for detailed setup instructions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
