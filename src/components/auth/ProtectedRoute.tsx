import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
