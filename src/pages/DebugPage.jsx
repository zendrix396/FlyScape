import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { checkFirebasePermissions, getPermissionFixGuidance } from '../utils/permissionsCheck';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';
import { getIdTokenResult, getIdToken } from 'firebase/auth';

const ADMIN_EMAIL = 'adityasenpai396@gmail.com'; // Replace with your actual email

export default function DebugPage() {
  const { currentUser, userProfile } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fixAttempted, setFixAttempted] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const runPermissionTests = async () => {
    setLoading(true);
    try {
      const results = await checkFirebasePermissions();
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const attemptToFixUserProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Create or update user profile with correct permissions
      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || 'Anonymous User',
        photoURL: currentUser.photoURL || '',
        walletBalance: 5000,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      setFixAttempted(true);
      // Re-run tests to see if it worked
      await runPermissionTests();
    } catch (error) {
      console.error('Error fixing user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    if (!currentUser) {
      setError('You need to be logged in to check admin status');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const idTokenResult = await getIdTokenResult(currentUser);
      setTokenDetails({
        claims: idTokenResult.claims,
        authTime: idTokenResult.authTime,
        expirationTime: idTokenResult.expirationTime,
        issuedAtTime: idTokenResult.issuedAtTime,
        signInProvider: idTokenResult.signInProvider,
        email: currentUser.email,
        uid: currentUser.uid
      });
    } catch (err) {
      console.error("Error checking token:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    if (!currentUser) {
      setError('You need to be logged in to set admin status');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Set admin in local storage
      localStorage.setItem('isAdminUser', 'true');
      
      // If the current user matches our predefined admin, show special message
      const isSpecificAdmin = currentUser.email === ADMIN_EMAIL;
      
      // Force token refresh
      await auth.currentUser.getIdToken(true);
      
      const message = isSpecificAdmin
        ? `Admin status granted to ${currentUser.email} which is the predefined admin account.`
        : 'Admin status set in local storage. Note: In production, admin claims must be set from Firebase Admin SDK on the backend.';
      
      setSuccess(message);
      
      // Refresh token details
      await checkAdminStatus();
    } catch (err) {
      console.error("Error setting admin:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAdminStatusMessage = () => {
    if (!currentUser) return null;
    
    const isSpecificAdmin = currentUser.email === ADMIN_EMAIL;
    
    if (isSpecificAdmin) {
      return (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mt-4">
          <p className="font-medium">✅ This account ({currentUser.email}) is the designated admin account.</p>
          <p className="mt-2">You should have full access to all admin functionality.</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-semibold text-gray-900">Firebase Debug Page</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Diagnose and fix common Firebase permission issues
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Authentication Status</h2>
            <div className="mt-3">
              {currentUser ? (
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Signed in as {currentUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">
                        Not signed in. <Link to="/login" className="underline">Sign in first</Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Permission Tests</h2>
            <div className="mt-3 space-y-4">
              <button
                onClick={runPermissionTests}
                disabled={loading || !currentUser}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {loading ? 'Running Tests...' : 'Run Permission Tests'}
              </button>
              
              {testResults && (
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-900">Test Results:</h3>
                  <div className="mt-2 space-y-2">
                    <div className={`p-3 rounded-md ${testResults.auth ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className={`text-sm ${testResults.auth ? 'text-green-800' : 'text-red-800'}`}>
                        Authentication: {testResults.auth ? 'Success ✓' : 'Failed ✗'}
                      </p>
                    </div>
                    
                    {testResults.firestoreRead !== null && (
                      <div className={`p-3 rounded-md ${testResults.firestoreRead ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className={`text-sm ${testResults.firestoreRead ? 'text-green-800' : 'text-red-800'}`}>
                          Firestore Read: {testResults.firestoreRead ? 'Success ✓' : 'Failed ✗'}
                        </p>
                      </div>
                    )}
                    
                    {testResults.firestoreWrite !== null && (
                      <div className={`p-3 rounded-md ${testResults.firestoreWrite ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className={`text-sm ${testResults.firestoreWrite ? 'text-green-800' : 'text-red-800'}`}>
                          Firestore Write: {testResults.firestoreWrite ? 'Success ✓' : 'Failed ✗'}
                        </p>
                      </div>
                    )}
                    
                    {testResults.errors.length > 0 && (
                      <div className="p-3 rounded-md bg-yellow-50">
                        <h4 className="text-sm font-medium text-yellow-800">Errors:</h4>
                        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                          {testResults.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900">Guidance:</h4>
                      <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {getPermissionFixGuidance(testResults)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Fix Attempts</h2>
            <div className="mt-3 space-y-4">
              <button
                onClick={attemptToFixUserProfile}
                disabled={loading || !currentUser}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Fixing...' : 'Attempt to Fix User Profile'}
              </button>
              
              {fixAttempted && (
                <div className="p-3 rounded-md bg-blue-50">
                  <p className="text-sm text-blue-800">
                    Fix attempted. Please check the test results to see if the issues were resolved.
                  </p>
                </div>
              )}
              
              <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Manual Steps:</h4>
                <ol className="mt-2 text-sm text-gray-700 list-decimal list-inside space-y-2">
                  <li>Go to the Firebase Console</li>
                  <li>Select project "travel-project-c74a9"</li>
                  <li>Go to "Firestore Database" in the left menu</li>
                  <li>Click on the "Rules" tab</li>
                  <li>Update rules to allow authenticated users to read/write their own data</li>
                  <li>Make sure Authentication settings are properly configured</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Admin Status</h2>
            <div className="mt-3 space-y-4">
              <button
                onClick={checkAdminStatus}
                disabled={loading || !currentUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                Check Admin Status
              </button>
              
              <button
                onClick={makeAdmin}
                disabled={loading || !currentUser}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
              >
                Set Admin Status (Dev Only)
              </button>
            </div>
            
            {getAdminStatusMessage()}
            
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mt-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 text-green-700 p-4 rounded-md mt-4">
                {success}
              </div>
            )}
            
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            )}
            
            {tokenDetails && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Token Details</h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
                  {JSON.stringify(tokenDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 