import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { connectAuthEmulator, browserSessionPersistence, setPersistence } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Configure auth persistence to session to avoid some cross-origin issues
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

// Initialize Google provider with custom parameters
const googleProvider = new GoogleAuthProvider();

// Add more scopes for a robust Google auth experience
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Set custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Allow non-Google accounts hosted on Google
  hd: '*'
});

export { app, db, auth, googleProvider };
 