# Firebase Setup Guide for FlyScape

This guide will help you fix authentication and permission issues with Firebase in your FlyScape application.

## Error Issues and Solutions

### 1. Cross-Origin-Opener-Policy Errors

When encountering errors like:
```
Cross-Origin-Opener-Policy policy would block the window.closed call.
```

**Solution:**
- We've updated the authentication to use redirect-based flow instead of popup
- Added session persistence settings to prevent cross-origin issues

### 2. Firestore Permission Errors

When you see errors like:
```
FirebaseError: Missing or insufficient permissions.
```

**Solution:**
- Update your Firestore security rules using the instructions below

## Setup Steps

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `travel-project-c74a9`
3. Go to **Authentication** → **Sign-in methods**
4. Ensure both **Email/Password** and **Google** are enabled
5. Under **Google** provider, add your app's domain to the **Authorized domains** list
   - Add `localhost` for development
   - Add your production domain if deployed

### 2. Firestore Database Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace all rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write only their own bookings
    match /bookings/{bookingId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read available flights
    match /flights/{flightId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

3. Click **Publish**

### 3. API Keys and Configuration

Ensure your Firebase configuration in `src/firebase/config.js` contains the correct values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC__wWXRbG9lI_E_c_Pukf_o9KifWTsecI",
  authDomain: "travel-project-c74a9.firebaseapp.com",
  projectId: "travel-project-c74a9",
  storageBucket: "travel-project-c74a9.firebasestorage.app",
  messagingSenderId: "659741116617",
  appId: "1:659741116617:web:102711f0214d2e2cbee518"
};
```

### 4. Enable Budget Alerts (Optional)

To prevent unexpected billing:

1. Go to Firebase Console → **Project Settings** → **Usage and Billing**
2. Set up budget alerts to be notified if costs exceed your threshold

## Testing Your Setup

1. Visit the `/debug` page in your application after logging in
2. Click **Run Permission Tests** to check if your permissions work
3. If issues persist, click **Attempt to Fix User Profile**

## Common Issues

### Ad-Blockers Causing Errors

If you see errors like:
```
POST https://firestore.googleapis.com/.../channel?VER=8... net::ERR_BLOCKED_BY_CLIENT
```

This is usually caused by ad-blockers. Ask users to:
- Disable ad-blockers for your site
- Or whitelist domains like `*.googleapis.com` in their ad-blocker

### Authentication Errors

For errors like:
```
Firebase: Error (auth/invalid-credential).
```

Ensure that:
- Your Firebase API key is correct 
- The authentication providers are properly enabled
- You're using the appropriate OAuth client ID for Google Authentication

### Data Not Saving

If users can authenticate but data doesn't save:
- Check the Firestore rules above
- Make sure your Firebase project is on the Blaze plan (pay-as-you-go) if using certain features
- Verify that the database exists in the correct region

## Need Further Help?

If issues persist after following these steps, you can:

1. Check the Firebase Debug page in your app at `/debug`
2. Review JavaScript console logs for more specific error details
3. Check Firebase console for error logs
4. Make sure you've applied the appropriate Firestore rules 