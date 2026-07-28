import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardHomeFor } from '../utils/roles';

// allowedTypes: e.g. ['super_admin'] or ['super_admin', 'staff']
// loginPath: where to send a signed-out visitor (defaults to the shared
// role-picker at /login; pass the role-specific login for stricter flows).
export default function ProtectedRoute({ children, allowedTypes, loginPath = '/login' }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Signed in, but this isn't their role's area — send them to their own
  // dashboard instead of a dead-end "Unauthorized" page. No role can reach
  // another role's dashboard by typing the URL.
  if (allowedTypes && !allowedTypes.includes(user.accountType)) {
    return <Navigate to={dashboardHomeFor(user)} replace />;
  }

  return children;
}
