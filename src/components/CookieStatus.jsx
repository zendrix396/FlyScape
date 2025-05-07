import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const CookieStatus = () => {
  const [cookies, setCookies] = useState({
    user: null,
    profile: null
  });

  useEffect(() => {
    // Check for cookies
    try {
      const userCookie = Cookies.get('aerovoyage_user');
      const profileCookie = Cookies.get('aerovoyage_profile');
      
      setCookies({
        user: userCookie ? JSON.parse(userCookie) : null,
        profile: profileCookie ? JSON.parse(profileCookie) : null
      });
    } catch (error) {
      console.error('Error parsing cookies:', error);
    }
  }, []);

  if (!cookies.user && !cookies.profile) {
    return null; // Don't show anything if no cookies are present
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white rounded-lg shadow-lg border border-emerald-200 text-xs w-64 overflow-auto max-h-64">
      <h3 className="font-bold mb-2 text-emerald-700">Login Status (Cookie)</h3>
      {cookies.user && (
        <div className="mb-2">
          <p className="font-semibold">User:</p>
          <p>Email: {cookies.user.email}</p>
          <p>Name: {cookies.user.displayName || 'N/A'}</p>
        </div>
      )}
      {cookies.profile && (
        <div>
          <p className="font-semibold">Profile:</p>
          <p>Balance: ₹{cookies.profile.walletBalance || 0}</p>
          <p>Admin: {cookies.profile.isAdmin ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default CookieStatus; 