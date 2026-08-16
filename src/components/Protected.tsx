import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types/db';

export default function Protected({
  role,
}: {
  role?: Role;
}) {
  const {
    user,
    profile,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="loader">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  /*
   * User is authenticated but profile is still unavailable.
   * Do NOT immediately redirect to "/" because that can create
   * a false redirect when the profile query has not completed.
   */
  if (!profile) {
    return (
      <div className="loader">
        Loading profile…
      </div>
    );
  }

  if (role && profile.role !== role) {
    if (profile.role === 'candidate') {
      return <Navigate to="/candidate" replace />;
    }

    if (profile.role === 'recruiter') {
      return <Navigate to="/recruiter" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}