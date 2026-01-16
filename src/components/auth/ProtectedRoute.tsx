import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated as isDemoAuthenticated } from '@/lib/auth';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  // Check both demo auth and real API auth
  const authenticated = isDemoAuthenticated() || authService.isAuthenticated();

  if (!authenticated) {
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
