import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { auth } from '../firebase/config';
import { getIdTokenResult } from 'firebase/auth';

// Create the context
const AdminContext = createContext({
  isAdmin: false,
  adminPermissions: {
    canManageFlights: false,
    canViewAnalytics: false,
    canGenerateFlights: false,
  },
  isLoading: true,
});

// Hook to use the admin context
export const useAdmin = () => {
  return useContext(AdminContext);
};

// Provider component
export const AdminProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState({
    canManageFlights: false,
    canViewAnalytics: false,
    canGenerateFlights: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin by checking Firebase custom claims
    const checkAdminStatus = async () => {
      setIsLoading(true);
      try {
        if (!currentUser) {
          setIsAdmin(false);
          setAdminPermissions({
            canManageFlights: false,
            canViewAnalytics: false,
            canGenerateFlights: false,
          });
          setIsLoading(false);
          return;
        }

        // Get token result which contains custom claims
        const tokenResult = await getIdTokenResult(currentUser);
        
        // Check if user has admin claim from Firebase
        const hasAdminClaim = tokenResult.claims.admin === true;
        
        // Also check local storage for dev/testing purposes
        const hasLocalAdminClaim = localStorage.getItem('isAdminUser') === 'true';
        
        // Define your admin email here - use your actual email
        const ADMIN_EMAIL = 'adityasenpai396@gmail.com';
        
        // Check if the current user's email matches the admin email
        const isAdminByEmail = currentUser.email === ADMIN_EMAIL;
        
        // For development/testing purposes, check against a list of admin emails
        const additionalAdminEmails = ['test@example.com', 'admin@aerovoyage.com'];
        const isInAdminList = additionalAdminEmails.includes(currentUser.email);
        
        // User is admin if any of these checks pass
        const isUserAdmin = hasAdminClaim || hasLocalAdminClaim || isAdminByEmail || isInAdminList;
        
        console.log('User admin status:', isUserAdmin, {
          email: currentUser.email,
          hasAdminClaim,
          hasLocalAdminClaim,
          isAdminByEmail,
          isInAdminList
        });
        
        // Always grant admin status to the specific email in development mode
        if (currentUser.email === ADMIN_EMAIL) {
          console.log('Admin access granted to specified admin email:', ADMIN_EMAIL);
        }
        
        setIsAdmin(isUserAdmin);
        setAdminPermissions({
          canManageFlights: isUserAdmin,
          canViewAnalytics: isUserAdmin,
          canGenerateFlights: isUserAdmin,
        });
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // Value to be provided by the context
  const value = {
    isAdmin,
    adminPermissions,
    isLoading,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 