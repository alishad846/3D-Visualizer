// ProtectedRoute — guards all dashboard routes
// On first mount it attempts a silent session recovery via /auth/refresh
// so that a hard page reload doesn't kick users out.

import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { refreshSession } from '../api/auth';

export default function ProtectedRoute() {
  const { isAuthenticated, setAuth, setLoading } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    // If already authenticated (access token in memory) skip the refresh
    if (isAuthenticated) {
      setChecking(false);
      return;
    }

    // Attempt silent session recovery using the httpOnly refresh cookie
    (async () => {
      setLoading(true);
      try {
        const data = await refreshSession();
        setAuth(data.accessToken, data.user);
      } catch {
        // No valid session — will redirect to /login below
      } finally {
        setLoading(false);
        setChecking(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Still recovering — show a minimal full-screen loader
  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070b13',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid rgba(0,240,255,0.2)',
            borderTopColor: '#00F0FF',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not authenticated after recovery attempt → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render child routes
  return <Outlet />;
}
