import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { connectAuthEmulator, browserSessionPersistence, setPersistence } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC__wWXRbG9lI_E_c_Pukf_o9KifWTsecI",
  authDomain: "travel-project-c74a9.firebaseapp.com",
  projectId: "travel-project-c74a9",
  storageBucket: "travel-project-c74a9.firebasestorage.app",
  messagingSenderId: "659741116617",
  appId: "1:659741116617:web:102711f0214d2e2cbee518"
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
 