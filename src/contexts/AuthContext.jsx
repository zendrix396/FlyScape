import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup,
  getRedirectResult,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_EXPIRY = 7; // days
const USER_COOKIE = 'aerovoyage_user';
const PROFILE_COOKIE = 'aerovoyage_profile';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Save user data to cookies
  const saveUserToCookies = (user, profile) => {
    if (user) {
      // Save only necessary user data (no sensitive info)
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      
      // Set secure cookies with expiry
      Cookies.set(USER_COOKIE, JSON.stringify(userData), { 
        expires: COOKIE_EXPIRY, 
        secure: window.location.protocol === 'https:',
        sameSite: 'Strict'
      });
      
      if (profile) {
        // Don't include sensitive information in the cookie
        const { walletBalance, isAdmin, displayName, email, photoURL } = profile;
        Cookies.set(PROFILE_COOKIE, JSON.stringify({ 
          walletBalance, isAdmin, displayName, email, photoURL 
        }), { 
          expires: COOKIE_EXPIRY, 
          secure: window.location.protocol === 'https:',
          sameSite: 'Strict'
        });
      }
    }
  };

  // Clear cookies on logout
  const clearCookies = () => {
    Cookies.remove(USER_COOKIE);
    Cookies.remove(PROFILE_COOKIE);
  };

  // Create user profile in Firestore
  async function createUserProfile(uid, userData) {
    try {
      console.log("Creating user profile for:", uid);
      const userDocRef = doc(db, 'users', uid);
      
      // Check if this is the admin email
      const isAdmin = userData.email === 'adityasenpai396@gmail.com' || 
                     userData.email === 'admin@example.com';
      
      // Create base wallet with default balance
      const newUserData = {
        ...userData,
        walletBalance: 50000,
        createdAt: new Date().toISOString(),
        isAdmin: isAdmin, // Set admin flag based on email
        lastLogin: new Date().toISOString() // Track login time
      };
      
      console.log("Setting up user profile with admin status:", isAdmin);
      
      await setDoc(userDocRef, newUserData);
      
      // Save to cookies
      saveUserToCookies({ uid, ...userData }, newUserData);
      
      return newUserData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Fetch user profile from Firestore
  async function getUserProfile(uid) {
    try {
      console.log("Fetching user profile for:", uid);
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        
        // Update last login time
        await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
        
        return profileData;
      } else {
        console.log("No user profile found");
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Sign up with email and password
  async function signup(email, password, name) {
    try {
      console.log("Signing up with email:", email);
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName: name });
      
      // Create user profile in Firestore
      const profile = await createUserProfile(result.user.uid, {
        email,
        displayName: name,
        photoURL: result.user.photoURL || '',
      });
      
      // Save to cookies
      saveUserToCookies(result.user, profile);
      
      return result.user;
    } catch (error) {
      console.error("Signup error:", error.message);
      setError(error.message);
      throw error;
    }
  }

  // Login with email and password
  async function login(email, password) {
    try {
      console.log("Logging in with email:", email);
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile
      const profile = await getUserProfile(result.user.uid);
      setUserProfile(profile);
      
      // Save to cookies
      saveUserToCookies(result.user, profile);
      
      return result.user;
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message);
      throw error;
    }
  }

  // Login with Google
  async function loginWithGoogle() {
    try {
      console.log("Initiating Google sign-in with popup");
      setError('');
      
      // Use popup instead of redirect
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the Google user
      const user = result.user;
      console.log("Google sign-in successful for:", user.email);
      
      // Check if user profile exists, if not create one
      let profile = await getUserProfile(user.uid);
      
      if (!profile) {
        console.log("Creating new profile for Google user");
        profile = await createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        });
      }
      
      // Save to cookies
      saveUserToCookies(user, profile);
      
      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(`Google sign-in failed: ${error.message}`);
      throw error;
    }
  }

  // Logout
  function logout() {
    clearCookies(); // Clear cookies on logout
    setUserProfile(null);
    return signOut(auth);
  }

  // Reset password
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      setError('');
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Update user wallet balance
  async function updateUserWallet(amount) {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Ensure we always have the latest data
      const userData = await getUserProfile(currentUser.uid);
      
      if (!userData) throw new Error('User profile not found');
      
      // Check if wallet or walletBalance is used
      const walletField = userData.walletBalance !== undefined ? 'walletBalance' : 'wallet';
      const currentBalance = userData[walletField] || 0;
      
      console.log("Current wallet balance:", currentBalance);
      console.log("Amount to deduct:", amount);
      
      const newBalance = currentBalance - amount;
      
      if (newBalance < 0) throw new Error('Insufficient funds');
      
      // Update with the correct field name
      await updateDoc(userDocRef, { [walletField]: newBalance });
      
      console.log("New wallet balance:", newBalance);
      
      // Update local state
      const updatedProfile = {
        ...userProfile,
        [walletField]: newBalance
      };
      
      setUserProfile(updatedProfile);
      
      // Update cookie with new balance
      saveUserToCookies(currentUser, updatedProfile);
      
      return newBalance;
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  }

  // Explicitly update admin status for a user
  async function updateAdminStatus(uid, email) {
    try {
      if (!uid || !email) return;
      
      const isAdmin = email === 'adityasenpai396@gmail.com' || 
                     email === 'admin@example.com';
                       
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Only update if needed
        if (userDoc.data().isAdmin !== isAdmin) {
          console.log(`Updating admin status for ${email} to ${isAdmin}`);
          await updateDoc(userDocRef, { isAdmin });
          
          // Update local state if this is the current user
          if (currentUser && currentUser.uid === uid) {
            const updatedProfile = {
              ...userProfile,
              isAdmin
            };
            
            setUserProfile(updatedProfile);
            
            // Update cookie
            saveUserToCookies(currentUser, updatedProfile);
          }
        }
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  }

  // Check if we can restore user from cookies
  const restoreUserFromCookies = async () => {
    try {
      const userCookie = Cookies.get(USER_COOKIE);
      const profileCookie = Cookies.get(PROFILE_COOKIE);
      
      if (userCookie && !currentUser) {
        const userData = JSON.parse(userCookie);
        console.log("Restoring user from cookie:", userData.email);
        
        // We don't set currentUser from cookie as that would bypass Firebase auth
        // But we can use the data to improve UX until Firebase auth completes
        
        if (profileCookie) {
          const profileData = JSON.parse(profileCookie);
          console.log("Restoring profile from cookie");
          
          // Temporarily set the profile from cookie while we wait for Firebase
          setUserProfile(profileData);
        }
      }
    } catch (error) {
      console.error("Error restoring from cookies:", error);
      // If there's any error with the cookies, clear them
      clearCookies();
    }
  };

  // Check for redirect results on initial load
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Redirect result received for user:", result.user.email);
          
          // Check if user profile exists
          const profile = await getUserProfile(result.user.uid);
          
          if (!profile) {
            console.log("Creating profile for redirect user");
            const newProfile = await createUserProfile(result.user.uid, {
              email: result.user.email,
              displayName: result.user.displayName || '',
              photoURL: result.user.photoURL || '',
            });
            
            // Save to cookies
            saveUserToCookies(result.user, newProfile);
          } else {
            // Save to cookies
            saveUserToCookies(result.user, profile);
          }
        }
      } catch (error) {
        console.error("Error processing redirect result:", error);
        setError(`Auth redirect failed: ${error.message}`);
      }
    };
    
    // Try to restore from cookies first
    restoreUserFromCookies();
    // Then check redirect result
    checkRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          
          // If no profile exists, create one
          if (!profile) {
            console.log("No profile found, creating one");
            const newProfile = await createUserProfile(user.uid, {
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
            });
            setUserProfile(newProfile);
            
            // Save to cookies
            saveUserToCookies(user, newProfile);
          } else {
            setUserProfile(profile);
            
            // Save to cookies
            saveUserToCookies(user, profile);
            
            // Check and update admin status
            await updateAdminStatus(user.uid, user.email);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
        // Clear cookies if user is logged out
        clearCookies();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    error,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    resetPassword,
    updateUserWallet,
    updateAdminStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 