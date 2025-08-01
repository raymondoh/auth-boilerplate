#!/usr/bin/env node

console.log("🔄 Resetting development data...");

// Simple script to reset mock data
// This works by clearing the global mock storage

const resetMockData = () => {
  // Clear global mock storage if it exists
  if (global.mockUsers) {
    global.mockUsers.clear();
    global.mockUsersInitialized = false;
    console.log("✅ Mock user data cleared");
  }

  console.log("🎉 Development data reset complete!");
  console.log("💡 Restart your dev server to see fresh test users");
};

// Check if we're in a Node.js environment
if (typeof global !== "undefined") {
  resetMockData();
} else {
  console.log("⚠️  This script should be run in a Node.js environment");
}
