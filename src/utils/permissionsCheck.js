import { db, auth } from '../firebase/config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

/**
 * Utility function to test if Firebase permissions are working correctly
 * and diagnose common issues
 */
export async function checkFirebasePermissions() {
  const results = {
    auth: null,
    firestoreRead: null,
    firestoreWrite: null,
    errors: []
  };

  try {
    // Check authentication
    const currentUser = auth.currentUser;
    results.auth = !!currentUser;
    
    if (!currentUser) {
      results.errors.push("Not authenticated. You need to sign in first.");
      console.warn("Permissions check failed: User not authenticated");
      return results;
    }
    
    // Try to read from Firestore
    try {
      const testQuery = await getDocs(collection(db, 'flights'));
      results.firestoreRead = true;
    } catch (error) {
      results.firestoreRead = false;
      results.errors.push(`Read permission failed: ${error.message}`);
      console.error("Firestore read permission error:", error);
    }
    
    // Try to write to Firestore (test user profile)
    try {
      const testDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(testDocRef, { 
        lastActive: new Date().toISOString(),
        testField: 'This is a test' 
      }, { merge: true });
      results.firestoreWrite = true;
    } catch (error) {
      results.firestoreWrite = false;
      results.errors.push(`Write permission failed: ${error.message}`);
      console.error("Firestore write permission error:", error);
    }
    
    return results;
  } catch (error) {
    console.error("Error checking Firebase permissions:", error);
    results.errors.push(`General error: ${error.message}`);
    return results;
  }
}

/**
 * Provides guidance based on permission test results
 */
export function getPermissionFixGuidance(results) {
  if (!results.errors.length) {
    return "Firebase permissions are working correctly.";
  }
  
  let guidance = "Firebase permission issues detected:\n\n";
  
  if (!results.auth) {
    guidance += "• Authentication issue: Make sure you're signed in before accessing protected resources.\n";
  }
  
  if (results.auth && !results.firestoreRead) {
    guidance += "• Firestore read permission issue: Check your Firestore rules to ensure they allow authenticated users to read data.\n";
  }
  
  if (results.auth && !results.firestoreWrite) {
    guidance += "• Firestore write permission issue: Check your Firestore rules to ensure they allow authenticated users to write their own data.\n";
  }
  
  guidance += "\nRecommended actions:\n";
  guidance += "1. Verify your Firebase configuration in the config.js file.\n";
  guidance += "2. Check the Firestore rules in the Firebase console.\n";
  guidance += "3. Make sure your Firebase project is on the Blaze plan if you're using certain features.\n";
  guidance += "4. Check the browser console for more detailed error messages.\n";
  
  return guidance;
} 