# Firebase Setup Guide

This guide will help you set up Firebase for your authentication boilerplate.

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "my-auth-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 🔧 Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. (Optional) Enable **Google** for OAuth

## 📊 Step 3: Set up Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click **Done**

## 🔑 Step 4: Get Configuration Keys

### For Client-side (Public keys):

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register your app with a nickname
5. Copy the config object values

### For Server-side (Admin SDK):

1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Extract the required values

## 🌍 Step 5: Configure Environment Variables

Create/update your `.env.local` file:

\`\`\`bash

# App Configuration

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_MODE=firebase # Change from 'mock' to 'firebase'

# NextAuth Configuration

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Firebase Client Configuration (Public)

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Firebase Admin Configuration (Private)

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Email Configuration (Optional)

RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
\`\`\`

## 🚀 Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Visit `/firebase-test` to test your connection
3. Test registration and login

## 🐛 Troubleshooting

### Common Issues:

1. **"Firebase Admin not initialized"**
   - Check your `FIREBASE_PRIVATE_KEY` format
   - Ensure all Firebase environment variables are set

2. **Build errors**
   - Firebase services are build-safe and will skip during build

3. **Permission denied in Firestore**
   - Update your Firestore security rules
     \`\`\`

Let's also add the Firebase test utility:
